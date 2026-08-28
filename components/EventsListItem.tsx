import { ScrapedEventFromDB } from "@/lib/types";
import { tz } from "@date-fns/tz";
import { formatDate } from "date-fns";
import Link from "next/link";

export default function EventsListItem(
  { event }:
  {
    event: ScrapedEventFromDB,
  }) {
  return <p>
    <Link href={`/event/${event.id}`}>
      <span className="hover:underline cursor-pointer" key={event.source_id}>
        ({event.starts_at ? formatDate(event.starts_at, "dd/MM", { in: tz('Europe/Warsaw'), }) : ""}) {event.title}
      </span>
    </Link>
  </p>;
}
