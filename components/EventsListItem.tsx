import { ScrapedEventFromDB } from "@/lib/types";
import { formatDate } from "date-fns";

export default function EventsListItem({ event, onClick }: { event: ScrapedEventFromDB, onClick: () => void }) {
  return <p onClick={onClick}><span className="hover:underline cursor-pointer" key={event.source_id}>({event.starts_at ? formatDate(event.starts_at, "dd/MM") : ""}) {event.title}</span></p>;
}
