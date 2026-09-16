import { sql } from '@/lib/db';
import { ScrapedEventFromDB } from './types';
import { cacheLife, cacheTag } from 'next/cache';
import slugify from 'slugify';

export async function getVenueEvents(venue: string): Promise<ScrapedEventFromDB[]> {

  'use cache';
  cacheTag('events');
  cacheLife('days');
  const rows = await sql`
    select id, title, starts_at, ends_at, venue_name, source_id
    from events where is_active and ends_at > now()
  `;

  const venueEvents = rows.filter(row => venue === slugify(row.venue_name, {lower: true}))

  return venueEvents as ScrapedEventFromDB[];
}
