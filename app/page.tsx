import { sql } from '@/lib/db';
import EventsList from "@/components/EventsList";
import { ScrapedEventFromDB } from "@/lib/types";

export default async function Home() {
  const events = await sql`
    select * from events
  `;
  return (
    <>
    <div className="flex flex-col flex-1  bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full flex-col p-16 max-md:p-4 bg-white dark:bg-black sm:items-start">
        <h2 className="logo mb-8 font-bold text-4xl">poznan.events</h2>
        <EventsList events={events as ScrapedEventFromDB[]} />
      </main>
      </div>
      <footer className="footer sm:footer-horizontal footer-center p-4">
        <aside>
          <p><a className="hover:underline" href="https://filipprzydryga.xyz">filipprzydryga.xyz ✉️</a></p>
        </aside>
      </footer>
    </>
  );
}
