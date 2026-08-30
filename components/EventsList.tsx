"use client";
import { isThisWeek, endOfWeek, addWeeks, isAfter, isBefore} from "date-fns"
import { ScrapedEventFromDB } from "@/lib/types";
import { usePathname } from "next/navigation";
import { tz } from "@date-fns/tz";
import EventsListItem from "./EventsListItem";


export default function EventsList({ events }: { events: ScrapedEventFromDB[] }) {
  const pathname = usePathname();
  const currentId = pathname.match(/^\/event\/(\d+)/)?.[1] ?? NaN;
  const thisWeek = events.filter(event => !!event.starts_at && isThisWeek(event.starts_at, { weekStartsOn: 1, in: tz('Europe/Warsaw') }));
  const thisWeekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
  const nextWeekEnd = addWeeks(thisWeekEnd, 1);
  const nextWeek = events.filter(event => !!event.starts_at && isAfter(event.starts_at, thisWeekEnd) && isBefore(event.starts_at, nextWeekEnd))
  const later = events.filter(event => !!event.starts_at && isAfter(event.starts_at, nextWeekEnd))
  const sortBy = (eventA: ScrapedEventFromDB, eventB: ScrapedEventFromDB) => {
    return (!!eventA.starts_at && !!eventB.starts_at) ? eventA.starts_at > eventB.starts_at ? 1 : -1 : 0;
  }
  return (
    <div className="w-1/2 max-w-1/2 max-md:max-w-full max-md:w-full">
      <h3 className="text-2xl">This week</h3>
      {thisWeek.sort(sortBy).map(event => (
        <EventsListItem key={event.source_id} event={event} enabled={event.id == currentId}  />
      ))}
      <h3 className="text-2xl mt-4">Next week</h3>
      {nextWeek.sort(sortBy).map(event => (
        <EventsListItem key={event.source_id} event={event} enabled={event.id == currentId}/>
      ))}
      <h3 className="text-2xl mt-4">Later</h3>
      {later.sort(sortBy).map(event => (
        <EventsListItem key={event.source_id} event={event} enabled={event.id == currentId}/>
      ))}
    </div>
  )
}
