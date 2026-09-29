import type { MetadataRoute } from "next";
import { BASE_URL } from "@/lib/baseUrl";
import { getEvents } from "@/lib/getEvents";
import { getVenues } from "@/lib/getVenues";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [events, venues] = await Promise.all([getEvents(), getVenues()]);

  return [
    {
      url: BASE_URL,
      changeFrequency: "daily",
      priority: 1,
    },
    ...venues.map((venue) => ({
      url: `${BASE_URL}/venue/${venue.slug}`,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    // Only /event/[id] is listed — /venue/[slug]/event/[id] canonicalizes to it.
    ...events.map((event) => ({
      url: `${BASE_URL}/event/${event.id}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
