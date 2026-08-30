import { ScrapedEventFromDB } from "@/lib/types";
import Link from "next/link";

export default function EventsListItem(
  { event, enabled }:
  {
      event: ScrapedEventFromDB,
      enabled: boolean
  }) {
  const dateFormat = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Warsaw', day: '2-digit', month: '2-digit',
  });

  return <p>
    <Link href={`/event/${event.id}`} scroll={false}>
      <span className={`hover:underline cursor-pointer ${enabled ? "font-bold" : "none"}`} key={event.source_id}>
        ({event.starts_at ? dateFormat.format(new Date(event.starts_at)) : ""}){" "}
        {event.title}
      </span>
    </Link>
  </p>;
}
