import { BASE_URL } from "@/lib/baseUrl";
import { ScrapedEventFromDB } from "@/lib/types";

export default function EventJsonLd({ event }: { event: ScrapedEventFromDB }) {
  if (!event.startsAt) return null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    startDate: new Date(event.startsAt).toISOString(),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    url: `${BASE_URL}/event/${event.id}`,
    image: event.image ? [event.image] : undefined,
    description: event.description || undefined,
    location: {
      "@type": "Place",
      name: event.venueName ?? "Poznań",
      address: {
        "@type": "PostalAddress",
        streetAddress: event.address ?? undefined,
        addressLocality: "Poznań",
        addressCountry: "PL",
      },
    },
    organizer: event.venueName
      ? { "@type": "Organization", name: event.venueName }
      : undefined,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
      }}
    />
  );
}
