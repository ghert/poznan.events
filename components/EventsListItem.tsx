import { ScrapedEventFromDB } from "@/lib/types";
import { tz } from "@date-fns/tz";
import { formatDate } from "date-fns";
import Link from "next/link";

export default function EventsListItem(
  { event, enabled }:
  {
      event: ScrapedEventFromDB,
      enabled: boolean
    }) {
  return <p>
    <Link href={`/event/${event.id}`} onClick={() => {window.scrollTo(0, 0)}}>
      <span className={`hover:underline cursor-pointer ${enabled ? "font-bold" : "none"}`} key={event.source_id}>
        ({event.starts_at ? formatDate(event.starts_at, "dd/MM", { in: tz('Europe/Warsaw'), }) : ""}){" "}
        {event.title}
      </span>
    </Link>
  </p>;
}
