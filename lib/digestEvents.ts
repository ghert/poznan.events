import { tz } from "@date-fns/tz";
import { endOfWeek, startOfWeek } from "date-fns";
import { and, asc, eq, gte, lte } from "drizzle-orm";
import { db } from "@/lib/db";
import { events } from "@/lib/db/schema";

// Shared by the Telegram posts and the email newsletter.

export const TIME_ZONE = "Europe/Warsaw";

export const dayFmt = new Intl.DateTimeFormat("pl-PL", {
  timeZone: TIME_ZONE,
  weekday: "long",
  day: "2-digit",
  month: "2-digit",
});
export const shortDateFmt = new Intl.DateTimeFormat("pl-PL", {
  timeZone: TIME_ZONE,
  day: "2-digit",
  month: "2-digit",
});
export const timeFmt = new Intl.DateTimeFormat("pl-PL", {
  timeZone: TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
});

/** The Mon–Sun week (Poznań time) containing `now`. */
export function currentWeek(now: Date) {
  const opts = { weekStartsOn: 1 as const, in: tz(TIME_ZONE) };
  return { start: startOfWeek(now, opts), end: endOfWeek(now, opts) };
}

export type DigestEvent = Awaited<ReturnType<typeof getDigestEvents>>[number];

/**
 * Every active event starting in [start, end], oldest first. Reads the DB
 * directly, uncached, so events approved since the last revalidation are
 * included.
 */
export function getDigestEvents(start: Date, end: Date) {
  return db
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
}

/** Groups events by Poznań day; `day` is capitalized, e.g. "Poniedziałek, 09.11". */
export function groupByDay(rows: DigestEvent[]) {
  const days: { day: string; events: DigestEvent[] }[] = [];
  for (const event of rows) {
    const day = dayFmt.format(new Date(event.startsAt!));
    const label = day[0].toUpperCase() + day.slice(1);
    if (days.at(-1)?.day !== label) days.push({ day: label, events: [] });
    days.at(-1)!.events.push(event);
  }
  return days;
}

const isoDateFmt = new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE });

/** Poznań date of the current week's Monday as "YYYY-MM-DD". */
export function currentWeekKey(now: Date) {
  return isoDateFmt.format(currentWeek(now).start);
}
