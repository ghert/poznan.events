import { sql } from '@/lib/db';
import { ScrapedEventFromDB } from './types';
import { cacheLife, cacheTag } from 'next/cache';

export async function getEvents(): Promise<ScrapedEventFromDB[]> {

  'use cache';
  cacheLife('days');
  cacheTag('events');
  const rows = await sql`
    select id, title, starts_at, ends_at, venue_name, source_id
    from events
    where is_active and ends_at > now()
    order by starts_at asc
  `;
  return rows as ScrapedEventFromDB[];
}
