import { sql } from '@/lib/db';
import EventsList from "@/components/EventsList";
import { ScrapedEventFromDB } from "@/lib/types";

export default async function Home() {
  const events = await sql`
    select * from events
  `;
  return (
    <div className="flex flex-col flex-1  bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col py-16 px-16 bg-white dark:bg-black sm:items-start">
        <h2 className="mb-8 font-bold text-4xl">Poznań events</h2>
        <EventsList events={events as ScrapedEventFromDB[]} />
      </main>
    </div>
  );
}
