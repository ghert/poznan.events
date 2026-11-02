import { db } from "@/lib/db";
import { events } from "@/lib/db/schema";
import { ScrapedEventFromDB } from "./types";
import { cacheLife, cacheTag } from "next/cache";
import { and, asc, eq, gt, sql } from "drizzle-orm";
import { withTags } from "./withTags";

export async function getFeaturedEvents(): Promise<ScrapedEventFromDB[]> {
  "use cache: remote";
  cacheLife("days");
  cacheTag("events");
  const rows = await db
    .select({
      id: events.id,
      title: events.title,
      startsAt: events.startsAt,
      endsAt: events.endsAt,
      venueName: events.venueName,
      sourceId: events.sourceId,
      image: events.image,
    })
    .from(events)
    .where(
      and(
        eq(events.isActive, true),
        eq(events.featured, true),
        gt(events.endsAt, sql`now()`),
      ),
    )
    .orderBy(asc(events.startsAt));
  return (await withTags(rows)) as ScrapedEventFromDB[];
}
