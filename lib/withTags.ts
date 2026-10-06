import { db } from "@/lib/db";
import { eventTags, tags } from "@/lib/db/schema";
import { asc, eq, inArray } from "drizzle-orm";
import { Tag } from "./types";

/**
 * Attaches each event's tags in one extra query. Not cached itself — only
 * call it from inside the cached lib/get*.ts functions.
 */
export async function withTags<T extends { id: number }>(
  rows: T[],
): Promise<(T & { tags: Tag[] })[]> {
  if (rows.length === 0) return [];

  const links = await db
    .select({
      eventId: eventTags.eventId,
      slug: tags.slug,
      name: tags.name,
      emoji: tags.emoji,
    })
    .from(eventTags)
    .innerJoin(tags, eq(eventTags.tagId, tags.id))
    .where(
      inArray(
        eventTags.eventId,
        rows.map((r) => r.id),
      ),
    )
    .orderBy(asc(tags.name));

  const byEvent = new Map<number, Tag[]>();
  for (const { eventId, ...tag } of links) {
    byEvent.set(eventId, [...(byEvent.get(eventId) ?? []), tag]);
  }

  return rows.map((row) => ({ ...row, tags: byEvent.get(row.id) ?? [] }));
}
