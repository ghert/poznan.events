import { pgTable, index, bigserial, text, timestamp, integer, unique, boolean } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const scrapeRuns = pgTable('scrape_runs', {
  id: bigserial('id', { mode: 'number' }).primaryKey().notNull(),
  snapshotId: text('snapshot_id'),
  status: text('status').notNull(),
  triggeredAt: timestamp('triggered_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  completedAt: timestamp('completed_at', { withTimezone: true, mode: 'string' }),
  eventsReceived: integer('events_received'),
  error: text('error'),
}, (table) => [
  index('scrape_runs_triggered_at_idx').using('btree', table.triggeredAt.desc().nullsFirst().op('timestamptz_ops')),
]);

export const events = pgTable('events', {
  id: bigserial('id', { mode: 'number' }).primaryKey().notNull(),
  sourceId: text('source_id').notNull(),
  sourceUrl: text('source_url').notNull(),
  title: text('title').notNull(),
  startsAt: timestamp('starts_at', { withTimezone: true, mode: 'string' }),
  endsAt: timestamp('ends_at', { withTimezone: true, mode: 'string' }),
  venueName: text('venue_name'),
  address: text('address'),
  firstSeenAt: timestamp('first_seen_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  lastSeenAt: timestamp('last_seen_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  description: text('description'),
  image: text('image'),
}, (table) => [
  index('events_starts_at_idx').using('btree', table.startsAt.asc().nullsLast().op('timestamptz_ops')).where(sql`is_active`),
  unique('events_source_id_key').on(table.sourceId),
]);
