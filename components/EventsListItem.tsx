import { ScrapedEventFromDB } from "@/lib/types";
import Link from "next/link";
import { useCallback } from "react";

export default function EventsListItem(
  { event, enabled }:
  {
      event: ScrapedEventFromDB,
      enabled: boolean
  }) {
  const dateFormat = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Warsaw', day: '2-digit', month: '2-digit',
  });

  const onClick = useCallback(() => {
    if (window.matchMedia('(min-width: 767px)').matches && window.scrollY > 256) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [])

  return <p>
    <Link href={`/event/${event.id}`} scroll={false} onClick={onClick}>
      <span className={`hover:underline cursor-pointer ${enabled ? "font-bold" : "none"}`} key={event.source_id}>
        ({event.starts_at ? dateFormat.format(new Date(event.starts_at)) : ""}){" "}
        {event.title}
      </span>
    </Link>
  </p>;
}
