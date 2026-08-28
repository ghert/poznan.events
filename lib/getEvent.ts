// lib/events.ts
import { sql } from '@/lib/db';
import { ScrapedEventFromDB } from './types';

export async function getEvent(id: string): Promise<ScrapedEventFromDB | null> {

  const rows = await sql`
    select *
    from events
    where id = ${id}
    limit 1
  `;

  return rows[0] as ScrapedEventFromDB ?? null;
}
