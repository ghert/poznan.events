"use client";
import {formatDate, isThisWeek, endOfWeek, addWeeks, isAfter, isBefore} from "date-fns"

import { ScrapedEventFromDB } from "@/lib/types";
import Filters from "./Filters";
import { SCRAPE_INPUTS } from "@/lib/sources";
import { useCallback, useState } from "react";
import EventsListItem from "./EventsListItem";

export default function EventsList({ events }: { events: ScrapedEventFromDB[] }) {
  const thisWeek = events.filter(event => !!event.starts_at && isThisWeek(event.starts_at));
  const thisWeekEnd = endOfWeek(new Date());
  const nextWeekEnd = addWeeks(thisWeekEnd, 1);
  const nextWeek = events.filter(event => !!event.starts_at && isAfter(event.starts_at, thisWeekEnd) && isBefore(event.starts_at, nextWeekEnd))
  const later = events.filter(event => !!event.starts_at && isAfter(event.starts_at, nextWeekEnd))
  const [event, setEvent] = useState<ScrapedEventFromDB | null>(null);
  const sortBy = (eventA: ScrapedEventFromDB, eventB: ScrapedEventFromDB) => {
    return (!!eventA.starts_at && !!eventB.starts_at) ? eventA.starts_at > eventB.starts_at ? 1 : -1 : 0;
  }

  const [filters, setFilters] = useState(Object.fromEntries(SCRAPE_INPUTS.map(({ venue }) => ([venue, true]))));

  const setFilter = useCallback((venue: string, value: boolean) => {
    setFilters(filters => ({
      ...filters,
      [venue]: value
    }))
  }, []);

  const filterOut = useCallback((event: ScrapedEventFromDB) => {
    if (!event.venue_name) return;
    return filters[event.venue_name];
  }, [filters]);

  return (
    <div>
      <Filters filters={filters} setFilter={setFilter} />
      <h3 className="text-2xl mt-4">This week</h3>
      {thisWeek.sort(sortBy).filter(filterOut).map(event => (
        <EventsListItem key={event.source_id} event={event} onClick={() => setEvent(event)} />
      ))}
      <h3 className="text-2xl mt-4">Next week</h3>
      {nextWeek.sort(sortBy).filter(filterOut).map(event => (
        <EventsListItem key={event.source_id} event={event} onClick={() => setEvent(event)}/>
      ))}
      <h3 className="text-2xl mt-4">Later</h3>
      {later.sort(sortBy).filter(filterOut).map(event => (
        <EventsListItem key={event.source_id} event={event} onClick={() => setEvent(event)}/>
      ))}
      {event && event.image ? (
      <div>
          <img src={event.image} alt="event" />
          <p>{event.description}</p>
      </div>) : null}
    </div>
  )
}
