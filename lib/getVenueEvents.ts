import { db } from '@/lib/db';
import { events } from '@/lib/db/schema';
import { ScrapedEventFromDB } from './types';
import { cacheLife, cacheTag } from 'next/cache';
import { and, eq, gt, sql } from 'drizzle-orm';
import slugify from 'slugify';

export async function getVenueEvents(venue: string): Promise<ScrapedEventFromDB[]> {

  'use cache';
  cacheTag('events');
  cacheLife('days');
  const rows = await db
    .select({
      id: events.id,
      title: events.title,
      startsAt: events.startsAt,
      endsAt: events.endsAt,
      venueName: events.venueName,
      sourceId: events.sourceId,
    })
    .from(events)
    .where(and(eq(events.isActive, true), gt(events.endsAt, sql`now()`)));

  const venueEvents = rows.filter(row => venue === slugify(row.venueName ?? '', {lower: true}))

  return venueEvents as ScrapedEventFromDB[];
}
