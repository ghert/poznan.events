import { NextResponse } from "next/server";
import { hasBearer } from "@/lib/bearerAuth";
import { BASE_URL } from "@/lib/baseUrl";
import {
  getDigestEvents,
  groupByDay,
  shortDateFmt,
  timeFmt,
} from "@/lib/digestEvents";
import { escapeHtml, sendTelegramMessage, splitMessage } from "@/lib/telegram";

/**
 * Builds a CRON_SECRET-protected cron handler that posts every active event
 * starting in [start, end] to the Telegram channel, grouped by day under
 * `${heading} dd.mm–dd.mm`.
 */
export function telegramDigest(
  heading: string,
  range: (now: Date) => { start: Date; end: Date },
) {
  return async function GET(request: Request) {
    if (!hasBearer(request, process.env.CRON_SECRET)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
      const { start, end } = range(new Date());
      const rows = await getDigestEvents(start, end);

      if (rows.length === 0) return NextResponse.json({ skipped: true });

      const lines = [
        `<b>${escapeHtml(heading)} ${shortDateFmt.format(start)}–${shortDateFmt.format(end)}</b>`,
      ];
      for (const { day, events } of groupByDay(rows)) {
        lines.push("", `<b>${escapeHtml(day)}</b>`);
        for (const event of events) {
          lines.push(
            `${timeFmt.format(new Date(event.startsAt!))} <a href="${BASE_URL}/wydarzenie/${event.id}">${escapeHtml(event.title)}</a>${event.venueName ? ` · ${escapeHtml(event.venueName)}` : ""}`,
          );
        }
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
