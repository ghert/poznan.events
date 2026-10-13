import { cacheLife, cacheTag } from "next/cache";
import { db } from "./db";
import { events, sources } from "@/lib/db/schema";
import { and, asc, desc, eq, exists, gt, sql } from "drizzle-orm";

/**
 * Venues for the filter bar: venues with upcoming active events first (same
 * criteria as getVenueEvents), then the empty ones, each group in `sources.id`
 * order. Tagged with `events` too, since the order depends on them.
 */
export async function getFilterVenues(): Promise<
  { slug: string; name: string }[]
> {
  "use cache";
  cacheLife("days");
  cacheTag("sources", "events");

  const hasEvents = exists(
    db
      .select({ one: sql`1` })
      .from(events)
      .where(
        and(
          eq(events.venueSlug, sources.slug),
          eq(events.isActive, true),
          gt(events.endsAt, sql`now()`),
        ),
      ),
  );

  return db
    .select({ name: sources.name, slug: sources.slug })
    .from(sources)
    .orderBy(desc(hasEvents), asc(sources.id));
}
