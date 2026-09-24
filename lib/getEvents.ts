import { db } from '@/lib/db';
import { events } from '@/lib/db/schema';
import { ScrapedEventFromDB } from './types';
import { cacheLife, cacheTag } from 'next/cache';
import { and, asc, eq, gt, sql } from 'drizzle-orm';

export async function getEvents(): Promise<ScrapedEventFromDB[]> {

  'use cache';
  cacheLife('days');
  cacheTag('events');
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
    .where(and(eq(events.isActive, true), gt(events.endsAt, sql`now()`)))
    .orderBy(asc(events.startsAt));
  return rows as ScrapedEventFromDB[];
}
