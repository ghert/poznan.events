"use client";
import {formatDate, isThisWeek, endOfWeek, addWeeks, isAfter, isBefore} from "date-fns"

import { ScrapedEventFromDB } from "@/lib/types";

export default function EventsList({ events }: { events: ScrapedEventFromDB[] }) {
  const thisWeek = events.filter(event => !!event.starts_at && isThisWeek(event.starts_at));
  const thisWeekEnd = endOfWeek(new Date());
  const nextWeekEnd = addWeeks(thisWeekEnd, 1);
  const nextWeek = events.filter(event => !!event.starts_at && isAfter(event.starts_at, thisWeekEnd) && isBefore(event.starts_at, nextWeekEnd))
  const later = events.filter(event => !!event.starts_at && isAfter(event.starts_at, nextWeekEnd))
  return (
    <div>
      <h3 className="text-2xl mt-4">This week</h3>
      {thisWeek.map(event => (
        <p key={event.source_id}>({event.starts_at ? formatDate(event.starts_at, "dd/MM") : ""}) {event.title}</p>
      ))}
      <h3 className="text-2xl mt-4">Next week</h3>
      {nextWeek.map(event => (
        <p key={event.source_id}>({event.starts_at ? formatDate(event.starts_at, "dd/MM") : ""}) {event.title}</p>
      ))}
      <h3 className="text-2xl mt-4">Later</h3>
      {later.map(event => (
        <p key={event.source_id}>({event.starts_at ? formatDate(event.starts_at, "dd/MM") : ""}) {event.title}</p>
      ))}
    </div>
  )
}
