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

`next.config.ts` sets `cacheComponents: true`. Every `lib/get*.ts` function that queries the DB uses `'use cache: remote'` + `cacheLife('days')` + `cacheTag(...)`. Plain `'use cache'` is in-memory per serverless instance, so on Vercel it almost always misses for request-time renders (event pages not in `generateStaticParams`, link prefetches, crawlers) and every miss wakes the Neon compute, which is billed by awake time. `remote` uses Vercel's shared cache, so the DB is hit roughly once per invalidation. Keep new DB getters on `'use cache: remote'`; `getWeekBoundaries`/`getNow` stay plain `'use cache'` because they do no I/O. `app/api/webhook/route.ts` calls `revalidateTag('events', 'days')` and `revalidatePath('/', 'layout')` after writing new data. In `app/admin/actions.ts`, `saveEvents` calls `updateTag('events')` + `revalidatePath('/', 'layout')`, and `revalidateSite` (the admin "Odśwież stronę" button) calls `updateTag` for every cache tag (`events`, `sources`, `tags`) + `revalidatePath('/', 'layout')`. Those are the only places cache invalidation happens; add any new `cacheTag` to `revalidateSite`. When touching any `lib/get*.ts` function or a route that mutates `events`/`scrape_runs`, preserve this pattern.

### Data layer

- `lib/db/index.ts` — Drizzle client, built on `@neondatabase/serverless`'s HTTP `neon()` client (not the WebSocket/Pool driver — see below for why).
- `lib/db/schema.ts` — table definitions for `events`, `scrapeRuns`, `sources`, `tags`/`eventTags` and `subscribers`. JS-side property names are camelCase (`sourceId`, `startsAt`, `isActive`, ...); actual Postgres columns stay snake_case (`source_id`, `starts_at`, ...) via explicit column-name args, e.g. `sourceId: text('source_id')`. Both tables' `id` is a Postgres `bigserial`, mapped with `{ mode: 'number' }` — this only stays safe because ids won't exceed 2^53; don't switch to `mode: 'bigint'` without checking every place an `id` is used as a route param (Next's `generateStaticParams` requires strings, so `id` gets explicitly stringified/parsed at the boundary — see `app/event/[id]/page.tsx` and `lib/getEvent.ts`).
- `lib/get*.ts` (`getEvents`, `getEvent`, `getFeaturedEvents`, `getVenueEvents`, `getTagEvents`, `getVenues`, `getFilterVenues`, `getTags`, `getWeekBoundaries`, `getNow`) are the only data-access functions; there's no repository/service layer beyond this.
- Tags: `tags` (`slug`, `name`, `emoji`) and the many-to-many `event_tags` (`event_id`, `tag_id`, both `on delete cascade`). The event getters attach `tags` to each row via `lib/withTags.ts`, one extra query that's uncached on its own and only called inside the cached getters. Tags are assigned by hand in the DB, e.g. `insert into event_tags (event_id, tag_id) select 123, id from tags where slug in ('koncert', 'jam-session');`. Like approvals, a manual change shows up only after the next webhook revalidation.
- `sources` table (`lib/db/schema.ts`) is the venue list: display `name`, Facebook events `page` URL, `slug`, and `auto_add`. `getVenues()` reads it for the scrape request, filters, venue pages and sitemap; the webhook reads it directly (uncached) to map each row's `discovery_input.url` (or, for submissions, its hosts) to a venue. `auto_add` decides whether newly inserted events start with `is_active = true` or wait for manual approval.
- `events.venue_slug` is a nullable FK to `sources.slug` (`on update cascade`, `on delete set null`). The webhook sets it alongside `venue_name`, and venue pages (`lib/getVenueEvents.ts`) filter on it in SQL. It's `null` for venues that aren't in `sources`, e.g. manual submissions. `venue_name` stays the display name everywhere, including for those untracked venues. The webhook's update uses `coalesce`, so a slug set by hand isn't cleared by a later unmatched delivery.
- `db.batch([...])` (in `app/api/webhook/route.ts`) is used instead of `db.transaction(...)` — the `neon-http` driver doesn't support real transactions, but `db.batch` maps to the same underlying Neon HTTP multi-statement primitive and is the idiomatic equivalent.

### Ingestion pipeline

Two-step, cron-driven flow across two route handlers:

1. `app/api/scrape/route.ts` (`GET`, hit by a Vercel cron job) — checks `scrape_runs` to avoid re-triggering too often (Vercel Hobby cron is daily; the route enforces a 40h minimum gap itself), then POSTs to Bright Data's API to kick off a scrape job and records a `scrape_runs` row with `status: 'triggered'`.
2. `app/api/webhook/route.ts` (`POST`, called back by Bright Data once the scrape completes) — normalizes raw rows (`Row` type, matches Bright Data's payload shape) into `ScrapedEvent` (camelCase), dedupes by `sourceId` within the batch, then upserts into `events` in batches of 25 using raw `jsonb_to_recordset` SQL wrapped in `db.execute(sql\`...\`)` calls (this SQL is deliberately not rewritten into the query builder — it's a near-verbatim, minimal-risk port from the pre-Drizzle raw-SQL version). Also soft-deletes events not seen in 5 days (`is_active = false`) and updates the matching `scrape_runs` row to `'delivered'` or `'failed'`.

`lib/types.ts` has three related-but-distinct shapes: `Row` (raw Bright Data payload — snake_case, an external contract, don't rename), `ScrapedEvent` (normalized, camelCase, pre-insert), `ScrapedEventFromDB` (camelCase, what Drizzle queries return).

### Telegram posts

Two Vercel crons post event digests to a Telegram channel via the Bot API (`lib/telegram.ts`), both `CRON_SECRET`-protected like `/api/scrape`:

- `app/api/telegram/route.ts`, Monday 06:00 UTC: every active event starting in the current Mon–Sun week (Poznań time).
- `app/api/telegram/weekend/route.ts`, Friday 06:00 UTC: every active event starting Friday–Sunday.

Both are thin wrappers around `telegramDigest(heading, range)` in `lib/telegramDigest.ts`. It queries the DB directly (uncached, via `getDigestEvents` in `lib/digestEvents.ts`, shared with the newsletter), groups events by day, and sends HTML messages split under Telegram's 4096-char limit. It doesn't write or revalidate anything, and posts nothing if there are no events. Hitting a route again re-posts; there's no dedupe.

### Email newsletter (`/newsletter`)

Weekly Mon–Sun digest by email, same content as the Monday Telegram post. The list lives in the `subscribers` table; Resend only delivers, called with plain `fetch` in `lib/resend.ts` (the only file that knows about Resend). Templates are in `lib/newsletterEmail.ts`.

- Signup (`app/newsletter/actions.ts`, `subscribe`; the `/newsletter` page and `NewsletterSection` in the homepage's right column, `app/page.tsx`) is BotID-gated (both paths are in `instrumentation-client.ts`) and double opt-in: it sends a confirmation email, at most once per 10 minutes per address, and always gives the same reply so it can't reveal who's subscribed. Active means `confirmed_at is not null and unsubscribed_at is null`.
- `/newsletter/potwierdz` and `/newsletter/wypisz` take `?token` and act only on a button click (a Server Action), never on GET, because mail link scanners open every link. `POST /api/newsletter/unsubscribe?token=` is the RFC 8058 one-click target from the `List-Unsubscribe` header.
- `app/api/newsletter/send/route.ts` is a **daily** `CRON_SECRET` cron. Resend's free plan allows 100 emails/day, so each run sends this week's digest to the next 100 subscribers whose `last_digest_week` is behind the current Monday (earliest-confirmed first) and then sets it. Anyone still pending when the week ends skips that week, and Sunday's run logs a warning. Confirming sets `last_digest_week` to the current week, so a new subscriber's first digest is next Monday's. Confirmation emails share the same 100/day quota. `?to=email` sends one test email and marks nobody.
- Nothing about subscribers is cached or revalidated. `/admin` lists active subscribers, read-only.

### User submissions (`/dodaj-wydarzenie`)

`app/dodaj-wydarzenie/actions.ts` has two Server Actions, both gated by Vercel BotID (`checkBotId()`; client side registered in `instrumentation-client.ts`, config wrapped in `withBotId`). A Facebook URL triggers a Bright Data collect-by-URL job (`lib/brightdata.ts`) that delivers to `/api/webhook?origin=submission`. The manual form uploads the image to Cloudflare R2 (`lib/r2.ts`) and inserts directly. Every submission lands with `is_active = false, submitted = true` and waits for manual approval. Submission paths deliberately **don't revalidate** the cache. Submission webhook deliveries also skip the `scrape_runs` update and the 5-day soft-delete. `submitted` rows are exempt from that soft-delete, because the scrape never re-sees them. To keep their expiring Facebook image URLs fresh, `/api/scrape` also starts a daily collect-by-URL job for upcoming submitted events with a Facebook `source_url` (`triggerSubmittedRefresh`), delivering to `/api/webhook?origin=refresh`. Refresh deliveries update existing rows and **do** revalidate, but also skip `scrape_runs` and the soft-delete; a failed refresh trigger never fails the cron run.

### Admin panel (`/admin`)

- Protected by HTTP Basic Auth (`ADMIN_USER` / `ADMIN_PASSWORD`, `lib/adminAuth.ts`). It fails closed if either is unset. `proxy.ts` triggers the browser login prompt, but auth is **re-checked in the page and in `saveEvents`**: Proxy is only an optimistic check, and a Server Action can be POSTed to from any route.
- `app/admin/page.tsx` loads all upcoming events, active or not, **uncached**, inside `<Suspense>` because it reads `headers()`. `components/AdminPanel.tsx` keeps a draft only for rows that differ from the loaded data. The floating save button sends them all to `saveEvents`, which validates every row first, then writes the updates and replaces each saved event's tags in one `db.batch`.
- Editable per event: title, description, start/end, `is_active`, `featured` (shown in the homepage's right column via `getFeaturedEvents`), tags, `venue_name`, and `venue_slug` (a select over `sources`, empty for none; validated server-side against `sources.slug`).
- Dates in the panel and the submission form are Poznań-local `datetime-local` strings, converted with `lib/warsawTime.ts` (`parseWarsawLocal` / `toWarsawLocal`).

### Routing

- Route handlers that machines call (crons, the Bright Data webhook, the newsletter's one-click unsubscribe) live under `app/api/` with English names; everything else is a page with a Polish URL. Exception: `/wydarzenie/[id]/calendar.ics` stays beside its page because people download it from there.

- `/` and `/wydarzenie/[id]` both render the full `EventsList` (via `getEvents()`), with `/wydarzenie/[id]` additionally showing `EventDetails` in a `Suspense` boundary — the list is always visible, details slot in on top.
- `/miejsce/[slug]` and `/tag/[slug]` mirror this with the presentational `EventsListSimple` (fed by `getVenueEvents(slug)` / `getTagEvents(slug)`): each `layout.tsx` renders the list, `page.tsx` is empty (metadata only), and `.../wydarzenie/[id]/page.tsx` shows details. Those pass `section="miejsce" | "tag"` to `EventDetails` so its back link returns to the right list.
- All dynamic routes are fully static (`generateStaticParams` in each), revalidated only via the webhook's `revalidateTag`/`revalidatePath` calls, not on-request.

### Env vars

Set in `.env` / Vercel:

- `DATABASE_URL`: Neon pooled connection string (`lib/db/index.ts`, `drizzle.config.ts`)
- `CRON_SECRET`: bearer token Vercel cron sends to `/api/scrape`
- `WEBHOOK_SECRET`: bearer token Bright Data sends back to `/api/webhook`
- `API_TOKEN`, `DATASET_ID`, `BACKEND_URL`: Bright Data API token, dataset id and trigger endpoint (`lib/brightdata.ts`)
- `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_PUBLIC_URL`: Cloudflare R2 for `/dodaj-wydarzenie` image uploads (`lib/r2.ts`)
- `ADMIN_USER`, `ADMIN_PASSWORD`: Basic Auth credentials for `/admin` (`lib/adminAuth.ts`)
- `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`: bot token and channel id (or `@channelname`) for the weekly post (`lib/telegram.ts`)
- `RESEND_API_KEY`, `NEWSLETTER_FROM` (e.g. `poznan.events <newsletter@poznan.events>`, on a domain verified in Resend), `NEWSLETTER_REPLY_TO` (optional): newsletter sending (`lib/resend.ts`)

Provided by Vercel automatically (system env vars, not in `.env`):

- `VERCEL_PROJECT_PRODUCTION_URL`: production host for `BASE_URL` (`lib/baseUrl.ts`); falls back to `http://localhost:3000`
- `NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL`: host used to build the `/api/webhook` callback URL passed to Bright Data
