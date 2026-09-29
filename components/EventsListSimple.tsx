import { ScrapedEventFromDB } from "@/lib/types";
import EventsListItem from "./EventsListItem";
import { getVenueEvents } from "@/lib/getVenueEvents";
import { getVenues } from "@/lib/getVenues";

export default async function EventsListSimple({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const sortBy = (eventA: ScrapedEventFromDB, eventB: ScrapedEventFromDB) => {
    return !!eventA.startsAt && !!eventB.startsAt
      ? eventA.startsAt > eventB.startsAt
        ? 1
        : -1
      : 0;
  };
  const { slug } = await params;
  const venues = await getVenues();
  const events = await getVenueEvents(slug);
  const venue = venues.find((v) => v.slug === slug);
  return (
    <div className="w-1/2 max-w-1/2 max-md:max-w-full max-md:w-full">
      <h3 className="text-2xl mb-1">{venue?.name}</h3>
      {events.sort(sortBy).map((event) => (
        <EventsListItem
          key={event.sourceId}
          event={event}
          enabled={false}
          basePath={`/venue/${slug}`}
        />
      ))}
    </div>
  );
}
