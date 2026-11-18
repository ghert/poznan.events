import type { Metadata } from "next";
import { getEvent } from "./getEvent";
import { shortDateFmt } from "./digestEvents";

const DESCRIPTION_LENGTH = 155;

/**
 * Metadata shared by /wydarzenie/[id] and its /miejsce and /tag copies, which
 * all canonicalize to /wydarzenie/[id].
 */
export async function eventMetadata(id: string): Promise<Metadata> {
  const event = await getEvent(id);
  if (!event) return { title: "Nie znaleziono wydarzenia" };

  const venue = event.venueName || "Poznań";
  const date = event.startsAt ? shortDateFmt.format(new Date(event.startsAt)) : "";
  // e.g. "Jazz Jam – Blue Note, 21.11 | poznan.events"
  const title = `${event.title} – ${[venue, date].filter(Boolean).join(", ")} | poznan.events`;
  const lead = `${[date, venue].filter(Boolean).join(", ")}. `;
  const text = (event.description ?? "").replace(/\s+/g, " ").trim();
  const room = DESCRIPTION_LENGTH - lead.length;
  const description =
    lead +
    (text.length > room
      ? `${text.slice(0, room - 1).replace(/\s+\S*$/, "")}…`
      : text || event.title);
  const url = `/wydarzenie/${event.id}`;
  const images = event.image
    ? [{ url: event.image, alt: event.title }]
    : undefined;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      siteName: "poznan.events",
      locale: "pl_PL",
      title: event.title,
      description,
      url,
      images,
    },
    twitter: {
      card: images ? "summary_large_image" : "summary",
      title: event.title,
      description,
      images,
    },
  };
}
