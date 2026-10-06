import { db } from "@/lib/db";
import { events, eventTags, tags } from "@/lib/db/schema";
import { ScrapedEventFromDB } from "./types";
import { cacheLife, cacheTag } from "next/cache";
import { and, asc, eq, gt, sql } from "drizzle-orm";
import { withTags } from "./withTags";

export async function getTagEvents(
  tagSlug: string,
): Promise<ScrapedEventFromDB[]> {
  "use cache";
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
    .innerJoin(eventTags, eq(eventTags.eventId, events.id))
    .innerJoin(tags, eq(tags.id, eventTags.tagId))
    .where(
      and(
        eq(events.isActive, true),
        gt(events.endsAt, sql`now()`),
        eq(tags.slug, tagSlug),
      ),
    )
    .orderBy(asc(events.startsAt));

  return (await withTags(rows)) as ScrapedEventFromDB[];
}
