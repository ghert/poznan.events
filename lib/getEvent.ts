import { db } from "@/lib/db";
import { events } from "@/lib/db/schema";
import { ScrapedEventFromDB } from "./types";
import { cacheLife, cacheTag } from "next/cache";
import { eq } from "drizzle-orm";

export async function getEvent(id: string): Promise<ScrapedEventFromDB | null> {
  "use cache";
  cacheLife("days");
  cacheTag("events");
  const rows = await db
    .select()
    .from(events)
    .where(eq(events.id, Number(id)))
    .limit(1);

  return (rows[0] as ScrapedEventFromDB) ?? null;
}
