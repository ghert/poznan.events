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
  const thisWeek = events.filter(e => !!e.startsAt && isAfter(e.startsAt, thisWeekStart) && isBefore(e.startsAt, thisWeekEnd));
  const nextWeek = events.filter(event => !!event.startsAt && isAfter(event.startsAt, thisWeekEnd) && isBefore(event.startsAt, nextWeekEnd))
  const later = events.filter(event => !!event.startsAt && isAfter(event.startsAt, nextWeekEnd))
  const sortBy = (eventA: ScrapedEventFromDB, eventB: ScrapedEventFromDB) => {
    return (!!eventA.startsAt && !!eventB.startsAt) ? eventA.startsAt > eventB.startsAt ? 1 : -1 : 0;
  }
  return (
    <div className="w-1/2 max-w-1/2 max-md:max-w-full max-md:w-full">
      <h3 className="text-2xl mb-1">Ten tydzień</h3>
      {thisWeek.sort(sortBy).map(event => (
        <EventsListItem key={event.sourceId} event={event} enabled={event.id == currentId}  />
      ))}
      <h3 className="text-2xl mt-4 mb-1">Następny tydzień</h3>
      {nextWeek.sort(sortBy).map(event => (
        <EventsListItem key={event.sourceId} event={event} enabled={event.id == currentId}/>
      ))}
      <h3 className="text-2xl mt-4 mb-1">Dalej</h3>
      {later.sort(sortBy).map(event => (
        <EventsListItem key={event.sourceId} event={event} enabled={event.id == currentId}/>
      ))}
    </div>
  )
}
