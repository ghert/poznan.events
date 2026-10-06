import { cacheLife, cacheTag } from "next/cache";
import { db } from "./db";
import { tags } from "@/lib/db/schema";
import { asc } from "drizzle-orm";
import { Tag } from "./types";

export async function getTags(): Promise<Tag[]> {
  "use cache";
  cacheLife("days");
  cacheTag("tags");

  return db
    .select({ slug: tags.slug, name: tags.name, emoji: tags.emoji })
    .from(tags)
    .orderBy(asc(tags.name));
}
