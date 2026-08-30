import { sql } from '@/lib/db';
import { ScrapedEventFromDB } from './types';
import { cacheLife } from 'next/cache';

export async function getEvents(): Promise<ScrapedEventFromDB[]> {

  'use cache';
  cacheLife('hours');
  const rows = await sql`
    select * from events where is_active and starts_at > now()
  `;

  return rows as ScrapedEventFromDB[];
}
