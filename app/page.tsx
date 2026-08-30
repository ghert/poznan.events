import EventsList from "@/components/EventsList";
import { ScrapedEventFromDB } from "@/lib/types";
import { getEvents } from '@/lib/getEvents';
import { getWeekBoundaries } from "@/lib/getWeekBoundaries";


export default async function Home() {
  const events = await getEvents();
  const weekBoundaries = await getWeekBoundaries();
  return (
    <EventsList events={events as ScrapedEventFromDB[]} weekBoundaries={weekBoundaries} />
  );
}
