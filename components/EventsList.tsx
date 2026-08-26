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
  const [isLoading, setLoading] = useState(false);
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

  const onClick = useCallback((event: ScrapedEventFromDB) => {
    setEvent(event);
    window.scrollTo(0, 0);
    setLoading(true);
  }, [setLoading]);

  return (
    <div className="flex flex-row w-full items-start max-md:flex-col-reverse">
      <div className="w-1/2 max-w-1/2 max-md:max-w-full max-md:w-full">
        <Filters filters={filters} setFilter={setFilter} />
        <h3 className="text-2xl mt-4">This week</h3>
        {thisWeek.sort(sortBy).filter(filterOut).map(event => (
          <EventsListItem key={event.source_id} event={event} onClick={onClick} />
        ))}
        <h3 className="text-2xl mt-4">Next week</h3>
        {nextWeek.sort(sortBy).filter(filterOut).map(event => (
          <EventsListItem key={event.source_id} event={event} onClick={onClick}/>
        ))}
        <h3 className="text-2xl mt-4">Later</h3>
        {later.sort(sortBy).filter(filterOut).map(event => (
          <EventsListItem key={event.source_id} event={event} onClick={onClick}/>
        ))}
      </div>
      {event && event.image ? (
        <div className="card bg-base-100 shadow-sm w-1/2 max-w-1/2 max-md:max-w-full max-md:w-full max-md:mb-8">
          {isLoading ? (
            <div className="flex justify-center py-4">
              <span className="loading loading-ring loading-xl"></span>
            </div>
          ) : null}
          <figure className={`max-h-72 overflow-hidden ${isLoading ? "opacity-0" : ""}`}>
            <img ref={(node) => {
              if (node && node.complete && node.naturalWidth > 0) {
                setLoading(false);
              }
            }}
            key={event.image} src={event.image} alt="event" onLoad={() => setLoading(false)} />
          </figure>
          <div className="card-body">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="badge badge-soft badge-xl">{ event.venue_name}</div>
                {event.starts_at ? <div className="badge badge-soft badge-xl">{formatDate(event.starts_at, "dd/MM/yy HH:MM")}</div> : null}
                </div>
              </div>
              <p dangerouslySetInnerHTML={{ __html: event.description.replaceAll("\n", "<br/>") }}></p>
          </div>
      </div>) : null}
    </div>
  )
}
