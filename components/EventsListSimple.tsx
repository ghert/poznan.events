import { ScrapedEventFromDB } from "@/lib/types";
import EventsListItem from "./EventsListItem";

// Plain list used by /miejsce/[slug] and /tag/[slug]; events arrive sorted
// by startsAt from their getters.
export default function EventsListSimple({
  title,
  events,
  basePath,
}: {
  title: string;
  events: ScrapedEventFromDB[];
  basePath: string;
}) {
  return (
    <div className="w-1/2 max-w-1/2 max-md:max-w-full max-md:w-full">
      <h3 className="text-2xl mb-1">{title}</h3>
      {events.map((event) => (
        <EventsListItem
          key={event.sourceId}
          event={event}
          enabled={false}
          basePath={basePath}
        />
      ))}
    </div>
  );
}
