import { sql } from '@/lib/db';
import { ScrapedEventFromDB } from './types';
import { cacheLife, cacheTag } from 'next/cache';
import { getWeekBoundaries } from './getWeekBoundaries';
import slugify from 'slugify';

export async function getVenueEvents(venue: string): Promise<ScrapedEventFromDB[]> {

  'use cache';
  cacheTag('events');
  cacheLife('days');
  const { start } = await getWeekBoundaries();
  const rows = await sql`
    select * from events where is_active and starts_at > ${start}
  `;

  const venueEvents = rows.filter(row => venue === slugify(row.venue_name, {lower: true}))

  return venueEvents as ScrapedEventFromDB[];
}
