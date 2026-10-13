import { db } from "@/lib/db";
import { events } from "@/lib/db/schema";
import { ScrapedEventFromDB } from "./types";
import { cacheLife, cacheTag } from "next/cache";
import { and, eq } from "drizzle-orm";
import { withTags } from "./withTags";

export async function getEvent(id: string): Promise<ScrapedEventFromDB | null> {
  "use cache";
  cacheLife("days");
  cacheTag("events");
  // Ids come straight from the URL; anything non-numeric is a 404, not a
  // Postgres error.
  if (!/^\d+$/.test(id)) return null;
  // Only approved events: pending submissions and hidden events must not be
  // reachable by guessing their (sequential) id.
  const rows = await db
    .select()
    .from(events)
    .where(and(eq(events.id, Number(id)), eq(events.isActive, true)))
    .limit(1);

  if (!rows[0]) return null;
  const [event] = await withTags(rows);
  return event as ScrapedEventFromDB;
}
