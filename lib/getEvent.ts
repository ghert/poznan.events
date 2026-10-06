import { db } from "@/lib/db";
import { events } from "@/lib/db/schema";
import { ScrapedEventFromDB } from "./types";
import { cacheLife, cacheTag } from "next/cache";
import { eq } from "drizzle-orm";
import { withTags } from "./withTags";

export async function getEvent(id: string): Promise<ScrapedEventFromDB | null> {
  "use cache";
  cacheLife("days");
  cacheTag("events");
  const rows = await db
    .select()
    .from(events)
    .where(eq(events.id, Number(id)))
    .limit(1);

  if (!rows[0]) return null;
  const [event] = await withTags(rows);
  return event as ScrapedEventFromDB;
}
