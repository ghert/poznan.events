import { ScrapedEventFromDB } from "@/lib/types";
import { formatDate } from "date-fns";

export default function EventsListItem({ event }: { event: ScrapedEventFromDB }) {
  return <p><a className="hover:underline" key={event.source_id} href={event.source_url}>({event.starts_at ? formatDate(event.starts_at, "dd/MM") : ""}) {event.title}</a></p>;
}
