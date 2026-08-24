import Image from "next/image";
import { sql } from '@/lib/db';

export default async function Home() {
  const events = await sql`
    select * from events
  `;
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        {events.map(event => (
          <p key={event.source_id}>{event.title}</p>
        ))}
      </main>
    </div>
  );
}
