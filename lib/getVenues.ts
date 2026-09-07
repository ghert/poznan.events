import { sql } from '@/lib/db';
import { cacheLife } from 'next/cache';
import { getWeekBoundaries } from './getWeekBoundaries';
import slugify from 'slugify';

export async function getVenues(): Promise<{slug: string, name: string}[]> {
  'use cache';
  cacheLife('hours');
  const { start } = await getWeekBoundaries();
  const rows = await sql`
    select * from events where is_active and starts_at > ${start}
  `;
  const names = [...new Set(rows.map((e) => e.venue_name).filter(Boolean))] as string[];
  return names.sort().map((name) => ({ name, slug: slugify(name, {lower: true}) }));

}
