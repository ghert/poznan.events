import type { Metadata } from "next";
import { getEvent } from "./getEvent";

/**
 * Metadata shared by /wydarzenie/[id] and its /miejsce and /tag copies, which
 * all canonicalize to /wydarzenie/[id].
 */
export async function eventMetadata(id: string): Promise<Metadata> {
  const event = await getEvent(id);
  if (!event) return { title: "Nie znaleziono wydarzenia" };

  const title = event.title;
  const description = `${event.title}, ${event.venueName || "Poznań"}.`;
  const url = `/wydarzenie/${event.id}`;
  const images = event.image ? [{ url: event.image, alt: title }] : undefined;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      siteName: "poznan.events",
      locale: "pl_PL",
      title,
      description,
      url,
      images,
    },
    twitter: {
      card: images ? "summary_large_image" : "summary",
      title,
      description,
      images,
    },
  };
}
