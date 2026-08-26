import { ScrapedEventFromDB } from "@/lib/types";
import { tz } from "@date-fns/tz";
import { formatDate } from "date-fns";

export default function EventsListItem(
  { event, onClick }:
  {
    event: ScrapedEventFromDB,
    onClick: (event: ScrapedEventFromDB) => void
  }) {
  return <p onClick={() => onClick(event)}>
    <span className="hover:underline cursor-pointer" key={event.source_id}>
      ({event.starts_at ? formatDate(event.starts_at, "dd/MM", { in: tz('Europe/Warsaw'), }) : ""}) {event.title}
    </span>
  </p>;
}
