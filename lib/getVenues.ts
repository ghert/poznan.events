import { cacheLife, cacheTag } from "next/cache";
import { db } from "./db";
import { sources } from "@/lib/db/schema";
import { asc } from "drizzle-orm";

export async function getVenues(): Promise<
  { slug: string; name: string; page: string }[]
> {
  "use cache";
  cacheLife("days");
  cacheTag("sources");

  const rows = await db
    .select({
      name: sources.name,
      slug: sources.slug,
      page: sources.page,
    })
    .from(sources)
    .orderBy(asc(sources.id));

  return rows;
}
