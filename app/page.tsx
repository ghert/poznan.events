import { sql } from '@/lib/db';
import EventsList from "@/components/EventsList";
import { ScrapedEventFromDB } from "@/lib/types";
import { getEvents } from '@/lib/getEvents';


export default async function Home() {
  const events = await getEvents();

  return (
    <EventsList events={events as ScrapedEventFromDB[]} />
  );
}
