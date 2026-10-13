import { NextResponse } from "next/server";
import { tz } from "@date-fns/tz";
import { endOfWeek, startOfWeek } from "date-fns";
import { and, asc, eq, gte, lte } from "drizzle-orm";
import { db } from "@/lib/db";
import { events } from "@/lib/db/schema";
import { BASE_URL } from "@/lib/baseUrl";
import { escapeHtml, sendTelegramMessage, splitMessage } from "@/lib/telegram";

const TIME_ZONE = "Europe/Warsaw";

const dayFmt = new Intl.DateTimeFormat("pl-PL", {
  timeZone: TIME_ZONE,
  weekday: "long",
  day: "2-digit",
  month: "2-digit",
});
const shortDateFmt = new Intl.DateTimeFormat("pl-PL", {
  timeZone: TIME_ZONE,
  day: "2-digit",
  month: "2-digit",
});
const timeFmt = new Intl.DateTimeFormat("pl-PL", {
  timeZone: TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
});

/**
 * Weekly Vercel cron (Monday morning): posts every active event starting this
 * week (Mon–Sun, Poznań time) to the Telegram channel. Reads the DB directly,
 * uncached, so events approved since the last revalidation are included.
 */
export async function GET(request: Request) {
  if (
    request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const opts = { weekStartsOn: 1 as const, in: tz(TIME_ZONE) };
    const now = new Date();
    const weekStart = startOfWeek(now, opts);
    const weekEnd = endOfWeek(now, opts);

    const rows = await db
      .select({
        id: events.id,
        title: events.title,
        startsAt: events.startsAt,
        venueName: events.venueName,
      })
      .from(events)
      .where(
        and(
          eq(events.isActive, true),
          gte(events.startsAt, weekStart.toISOString()),
          lte(events.startsAt, weekEnd.toISOString()),
        ),
      )
      .orderBy(asc(events.startsAt));

    if (rows.length === 0) return NextResponse.json({ skipped: true });

    const lines = [
      `<b>Wydarzenia w Poznaniu ${shortDateFmt.format(weekStart)}–${shortDateFmt.format(weekEnd)}</b>`,
    ];
    let currentDay = "";
    for (const event of rows) {
      const startsAt = new Date(event.startsAt!);
      const day = dayFmt.format(startsAt);
      if (day !== currentDay) {
        currentDay = day;
        lines.push(
          "",
          `<b>${escapeHtml(day[0].toUpperCase() + day.slice(1))}</b>`,
        );
      }
      lines.push(
        `${timeFmt.format(startsAt)} <a href="${BASE_URL}/wydarzenie/${event.id}">${escapeHtml(event.title)}</a>${event.venueName ? ` · ${escapeHtml(event.venueName)}` : ""}`,
      );
    }
    lines.push("", `Wszystkie wydarzenia: ${BASE_URL}`);

    const messages = splitMessage(lines);
    // In order, one at a time, so the channel shows them in sequence.
    for (const text of messages) await sendTelegramMessage(text);

    return NextResponse.json({
      ok: true,
      events: rows.length,
      messages: messages.length,
    });
  } catch (err) {
    console.error("Telegram weekly post failed", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
