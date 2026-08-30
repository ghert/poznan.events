"use client";
import { isAfter, isBefore } from "date-fns"
import { ScrapedEventFromDB } from "@/lib/types";
import { usePathname } from "next/navigation";
import EventsListItem from "./EventsListItem";

export default function EventsList({
  events, weekBoundaries: { start, end, nextEnd } }: {
    events: ScrapedEventFromDB[],
    weekBoundaries: { start: string, end: string, nextEnd: string }
  }) {
  const pathname = usePathname();
  const currentId = pathname.match(/^\/event\/(\d+)/)?.[1] ?? NaN;
  const thisWeekStart = new Date(start);
  const thisWeekEnd = new Date(end);
  const nextWeekEnd = new Date(nextEnd);
  const thisWeek = events.filter(e => !!e.starts_at && isAfter(e.starts_at, thisWeekStart) && isBefore(e.starts_at, thisWeekEnd));
  const nextWeek = events.filter(event => !!event.starts_at && isAfter(event.starts_at, thisWeekEnd) && isBefore(event.starts_at, nextWeekEnd))
  const later = events.filter(event => !!event.starts_at && isAfter(event.starts_at, nextWeekEnd))
  const sortBy = (eventA: ScrapedEventFromDB, eventB: ScrapedEventFromDB) => {
    return (!!eventA.starts_at && !!eventB.starts_at) ? eventA.starts_at > eventB.starts_at ? 1 : -1 : 0;
  }
  return (
    <div className="w-1/2 max-w-1/2 max-md:max-w-full max-md:w-full">
      <h3 className="text-2xl">Ten tydzień</h3>
      {thisWeek.sort(sortBy).map(event => (
        <EventsListItem key={event.source_id} event={event} enabled={event.id == currentId}  />
      ))}
      <h3 className="text-2xl mt-4">Następny tydzień</h3>
      {nextWeek.sort(sortBy).map(event => (
        <EventsListItem key={event.source_id} event={event} enabled={event.id == currentId}/>
      ))}
      <h3 className="text-2xl mt-4">Dalej</h3>
      {later.sort(sortBy).map(event => (
        <EventsListItem key={event.source_id} event={event} enabled={event.id == currentId}/>
      ))}
    </div>
  )
}
