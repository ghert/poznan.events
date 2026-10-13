import { NextResponse } from "next/server";
import { and, asc, eq, gte, lte } from "drizzle-orm";
import { db } from "@/lib/db";
import { events } from "@/lib/db/schema";
import { BASE_URL } from "@/lib/baseUrl";
import { escapeHtml, sendTelegramMessage, splitMessage } from "@/lib/telegram";

export const TIME_ZONE = "Europe/Warsaw";

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
 * Builds a CRON_SECRET-protected cron handler that posts every active event
 * starting in [start, end] to the Telegram channel, grouped by day under
 * `${heading} dd.mm–dd.mm`. Reads the DB directly, uncached, so events
 * approved since the last revalidation are included.
 */
export function telegramDigest(
  heading: string,
  range: (now: Date) => { start: Date; end: Date },
) {
  return async function GET(request: Request) {
    if (
      request.headers.get("authorization") !==
      `Bearer ${process.env.CRON_SECRET}`
    ) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
      const { start, end } = range(new Date());

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
            gte(events.startsAt, start.toISOString()),
            lte(events.startsAt, end.toISOString()),
          ),
        )
        .orderBy(asc(events.startsAt));

      if (rows.length === 0) return NextResponse.json({ skipped: true });

      const lines = [
        `<b>${escapeHtml(heading)} ${shortDateFmt.format(start)}–${shortDateFmt.format(end)}</b>`,
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
      console.error(`Telegram post "${heading}" failed`, err);
      const message = err instanceof Error ? err.message : String(err);
      return NextResponse.json({ ok: false, error: message }, { status: 500 });
    }
  };
}
