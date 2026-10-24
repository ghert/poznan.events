import { db } from "@/lib/db";
import { events } from "@/lib/db/schema";
import { ScrapedEventFromDB } from "./types";
import { cacheLife, cacheTag } from "next/cache";
import { and, asc, eq, gt, sql } from "drizzle-orm";
import { withTags } from "./withTags";

export async function getVenueEvents(
  venue: string,
): Promise<ScrapedEventFromDB[]> {
  "use cache: remote";
  cacheTag("events");
  cacheLife("days");
  const rows = await db
    .select({
      id: events.id,
      title: events.title,
      startsAt: events.startsAt,
      endsAt: events.endsAt,
      venueName: events.venueName,
      sourceId: events.sourceId,
    })
    .from(events)
    .where(
      and(
        eq(events.isActive, true),
        gt(events.endsAt, sql`now()`),
        eq(events.venueSlug, venue),
      ),
    )
    .orderBy(asc(events.startsAt));

  return (await withTags(rows)) as ScrapedEventFromDB[];
}
