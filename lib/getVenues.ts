import { cacheLife, cacheTag } from "next/cache";
import slugify from "slugify";
import { SCRAPE_INPUTS } from "./sources";

export async function getVenues(): Promise<{ slug: string; name: string }[]> {
  "use cache";
  cacheLife("days");
  cacheTag("events");
  return SCRAPE_INPUTS.map((item) => ({
    name: item.venue,
    slug: slugify(item.venue, { lower: true }),
  }));
}
