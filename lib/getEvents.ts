import { sql } from '@/lib/db';
import { ScrapedEventFromDB } from './types';
import { cacheLife, cacheTag } from 'next/cache';
import { getWeekBoundaries } from './getWeekBoundaries';

export async function getEvents(): Promise<ScrapedEventFromDB[]> {

  'use cache';
  cacheLife('days');
  cacheTag('events');
  const { start } = await getWeekBoundaries();
  const rows = await sql`
    select * from events where is_active and starts_at > ${start}
  `;

  return rows as ScrapedEventFromDB[];
}
