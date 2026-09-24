# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

- `npm run dev` — start the dev server (Turbopack)
- `npm run build` — production build; also the fastest way to type-check route conventions (e.g. `generateStaticParams` param shapes) that `tsc` alone won't catch
- `npx tsc --noEmit` — type-check only
- `npm run lint` — ESLint (`eslint-config-next` core-web-vitals + typescript)
- There is no test suite in this repo.

### Database (Drizzle + Neon)

- `npm run db:pull` — introspect the live DB schema (read-only; safe against production)
- `npm run db:generate` — generate a migration SQL file from schema changes
- `npm run db:migrate` — apply generated migrations
- `npm run db:push` — push schema changes directly (dev-only; **never run against the production `DATABASE_URL`** — this project has no staging DB, only Neon branches created ad hoc for testing)
- `npm run db:studio` — Drizzle Studio

## Architecture

This is a Next.js App Router site that scrapes event listings from local venues' Facebook pages and displays them. There's no `src/` dir; everything is at repo root, imported via the `@/*` path alias.

### Cache Components

`next.config.ts` sets `cacheComponents: true`. Nearly every data-fetching function in `lib/get*.ts` is wrapped in `'use cache'` + `cacheLife('days')` + `cacheTag('events')`. `app/webhook/route.ts` calls `revalidateTag('events', 'days')` and `revalidatePath('/', 'layout')` after writing new data — that's the only place cache invalidation happens. When touching any `lib/get*.ts` function or a route that mutates `events`/`scrape_runs`, preserve this pattern.

### Data layer

- `lib/db/index.ts` — Drizzle client, built on `@neondatabase/serverless`'s HTTP `neon()` client (not the WebSocket/Pool driver — see below for why).
- `lib/db/schema.ts` — table definitions for `events` and `scrapeRuns`. JS-side property names are camelCase (`sourceId`, `startsAt`, `isActive`, ...); actual Postgres columns stay snake_case (`source_id`, `starts_at`, ...) via explicit column-name args, e.g. `sourceId: text('source_id')`. Both tables' `id` is a Postgres `bigserial`, mapped with `{ mode: 'number' }` — this only stays safe because ids won't exceed 2^53; don't switch to `mode: 'bigint'` without checking every place an `id` is used as a route param (Next's `generateStaticParams` requires strings, so `id` gets explicitly stringified/parsed at the boundary — see `app/event/[id]/page.tsx` and `lib/getEvent.ts`).
- `lib/get*.ts` (`getEvents`, `getEvent`, `getVenueEvents`, `getVenues`, `getWeekBoundaries`, `getNow`) are the only data-access functions; there's no repository/service layer beyond this.
- **`venues` is not a DB table.** The venue list is the hardcoded `SCRAPE_INPUTS` array in `lib/sources.ts` (Facebook page URL + display name per venue). Venue slugs are derived at runtime with `slugify(venue, { lower: true })` — this exact call is duplicated across `lib/getVenues.ts`, `lib/getVenueEvents.ts`, and `components/Filters.tsx`; keep them consistent if you change slugification.
- `db.batch([...])` (in `app/webhook/route.ts`) is used instead of `db.transaction(...)` — the `neon-http` driver doesn't support real transactions, but `db.batch` maps to the same underlying Neon HTTP multi-statement primitive and is the idiomatic equivalent.

### Ingestion pipeline

Two-step, cron-driven flow across two route handlers:

1. `app/scrape/route.ts` (`GET`, hit by a Vercel cron job) — checks `scrape_runs` to avoid re-triggering too often (Vercel Hobby cron is daily; the route enforces a 40h minimum gap itself), then POSTs to Bright Data's API to kick off a scrape job and records a `scrape_runs` row with `status: 'triggered'`.
2. `app/webhook/route.ts` (`POST`, called back by Bright Data once the scrape completes) — normalizes raw rows (`Row` type, matches Bright Data's payload shape) into `ScrapedEvent` (camelCase), dedupes by `sourceId` within the batch, then upserts into `events` in batches of 25 using raw `jsonb_to_recordset` SQL wrapped in `db.execute(sql\`...\`)` calls (this SQL is deliberately not rewritten into the query builder — it's a near-verbatim, minimal-risk port from the pre-Drizzle raw-SQL version). Also soft-deletes events not seen in 5 days (`is_active = false`) and updates the matching `scrape_runs` row to `'delivered'` or `'failed'`.

`lib/types.ts` has three related-but-distinct shapes: `Row` (raw Bright Data payload — snake_case, an external contract, don't rename), `ScrapedEvent` (normalized, camelCase, pre-insert), `ScrapedEventFromDB` (camelCase, what Drizzle queries return).

### Routing

- `/` and `/event/[id]` both render the full `EventsList` (via `getEvents()`), with `/event/[id]` additionally showing `EventDetails` in a `Suspense` boundary — the list is always visible, details slot in on top.
- `/venue/[slug]` mirrors this with `EventsListSimple` (via `getVenueEvents(slug)`) — `app/venue/[slug]/layout.tsx` renders the list, `app/venue/[slug]/page.tsx` itself is empty, and `app/venue/[slug]/event/[id]/page.tsx` shows details.
- All dynamic routes are fully static (`generateStaticParams` in each), revalidated only via the webhook's `revalidateTag`/`revalidatePath` calls, not on-request.

### Env vars

`DATABASE_URL` (Neon pooled connection string), `CRON_SECRET`, `BRIGHTDATA_API_TOKEN`, `BRIGHTDATA_DATASET_ID`, `WEBHOOK_SECRET`, `APP_BASE_URL`.
