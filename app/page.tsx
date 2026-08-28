import { sql } from '@/lib/db';
import EventsList from "@/components/EventsList";
import { ScrapedEventFromDB } from "@/lib/types";

export default async function Home() {
  const events = await sql`
    select * from events
  `;
  return (
    <EventsList events={events as ScrapedEventFromDB[]} />
  );
}
