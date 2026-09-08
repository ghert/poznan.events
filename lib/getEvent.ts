import { sql } from '@/lib/db';
import { ScrapedEventFromDB } from './types';
import { cacheLife, cacheTag } from 'next/cache';

export async function getEvent(id: string): Promise<ScrapedEventFromDB | null> {
  'use cache';
  cacheLife('days');
  cacheTag('events');
  const rows = await sql`
    select *
    from events
    where id = ${id}
    limit 1
  `;

  return rows[0] as ScrapedEventFromDB ?? null;
}
