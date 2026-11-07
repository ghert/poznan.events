import { sql, type SQL } from "drizzle-orm";
import { db } from "@/lib/db";
import { sources } from "@/lib/db/schema";
import type { Row, ScrapedEvent } from "@/lib/types";

// Saves the events Bright Data sends to /api/webhook into the `events` table.
//
// Every Bright Data job delivers to /api/webhook with an `origin`:
// - "scrape": the daily venue scrape. New events go live if their venue has
//   sources.auto_add. Also runs the 5-day soft-delete and closes the
//   scrape_runs row.
// - "submission": a URL sent from /dodaj-wydarzenie. New rows are submitted
//   and wait for manual approval, so nothing visible changes.
// - "refresh": the daily re-collect of submitted events, which the venue
//   scrape doesn't see; it keeps their (expiring) Facebook image URLs fresh.
// Only "scrape" touches scrape_runs or the soft-delete.

export const ORIGINS = ["scrape", "submission", "refresh"] as const;
export type ScrapeOrigin = (typeof ORIGINS)[number];

/** Reads `?origin=` from a delivery URL; absent or unknown means "scrape". */
export function parseOrigin(value: string | null): ScrapeOrigin {
  return ORIGINS.find((o) => o === value) ?? "scrape";
}

type Venue = { name: string; page: string; slug: string };

/** Maps one raw Bright Data row to our schema. */
function normalize(row: Row, venues: Venue[]): ScrapedEvent | null {
  const str = (v: unknown) =>
    typeof v === "string" && v.trim() ? v.trim() : null;

  if (!row.url || !row.title) return null;

  const toDate = (v: unknown) => {
    const s = str(v);
    if (!s) return null;
    const d = new Date(s);
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
  };

  // Discovery rows carry the venue page they came from; collect-by-URL rows
  // (user submissions) don't, so fall back to matching the event's hosts.
  const findVenue = (row: Row) => {
    const byPage = venues.findLast(
      (venue) => venue.page === row.discovery_input?.url,
    );
    if (byPage) return byPage;
    const hosts = (row.hosts ?? []).map((h) => h.name?.toLowerCase());
    return venues.find((venue) => hosts.includes(venue.name.toLowerCase()));
  };
  const venue = findVenue(row);

  return {
    sourceId: row.event_id,
    sourceUrl: str(row.url) || "",
    title: str(row.title) || "",
    startsAt: toDate(row.event_date),
    endsAt: row.event_end_date
      ? toDate(row.event_end_date)
      : toDate(row.event_date),
    venueName: venue?.name || "",
    venueSlug: venue?.slug ?? null,
    address: str(row.location?.address),
    description: row.unformatted_description_text || "",
    image: row.main_image_downloadable || "",
  };
}

// The JSON record shape both statements read via jsonb_to_recordset. Keep
// toRecord and RECORD_COLUMNS in step.
function toRecord(e: ScrapedEvent) {
  return {
    source_id: e.sourceId,
    source_url: e.sourceUrl,
    title: e.title,
    starts_at: e.startsAt,
    ends_at: e.endsAt,
    venue_name: e.venueName,
    venue_slug: e.venueSlug,
    address: e.address,
    description: e.description,
    image: e.image,
  };
}

const RECORD_COLUMNS = sql`
  source_id text, source_url text, title text, starts_at text,
  ends_at text, venue_name text, venue_slug text, address text,
  description text, image text
`;

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size)
    out.push(items.slice(i, i + size));
  return out;
}

/**
 * What the public site needs after a delivery:
 * - "all" after a scrape: new, changed and hidden events can be anywhere.
 * - "events" after a refresh: only these events' pages, by source_id.
 * - "none" after a submission: new rows wait for approval.
 */
export type SiteChange =
  | { kind: "all" }
  | { kind: "events"; sourceIds: string[] }
  | { kind: "none" };

/** Closes the most recently triggered scrape_runs row. */
function finishScrapeRun(set: SQL) {
  return db.execute(sql`
    update scrape_runs
    set ${set}
    where id = (
      select id from scrape_runs
      where status = 'triggered'
      order by triggered_at desc
      limit 1
    )
  `);
}

/**
 * Stores one delivery. `payload` is the parsed request body (one row or an
 * array), or a promise of it, so a body that fails to parse is still recorded
 * as a failed scrape run. Throws on failure, after the bookkeeping.
 *
 * `change` says what the public site needs to revalidate.
 */
export async function saveScrapedEvents(
  payload: unknown,
  origin: ScrapeOrigin,
): Promise<{ received: number; stored: number; change: SiteChange }> {
  try {
    const body = await payload;
    const rows: Row[] = Array.isArray(body) ? body : [body];

    // Read straight from the DB rather than the cached getVenues(), so a
    // just-added source is picked up on the next delivery.
    const venues = await db
      .select({ name: sources.name, page: sources.page, slug: sources.slug })
      .from(sources);

    const events = rows
      .map((row) => normalize(row, venues))
      .filter((e): e is ScrapedEvent => e !== null);

    // Discovery can return the same event from two different venue inputs.
    // Two rows with the same source_id in one statement would collide, so
    // collapse them first — last one wins.
    const unique = [...new Map(events.map((e) => [e.sourceId, e])).values()];
    const isScrape = origin === "scrape";

    for (const batch of chunk(unique, 25)) {
      const json = JSON.stringify(batch.map(toRecord));

      await db.batch([
        // 1 Update existing rows
        db.execute(sql`
          update events e set
            source_url   = v.source_url,
            title        = v.title,
            starts_at    = v.starts_at::timestamptz,
            ends_at      = v.ends_at::timestamptz,
            venue_name   = coalesce(nullif(v.venue_name, ''), e.venue_name),
            venue_slug   = coalesce(v.venue_slug, e.venue_slug),
            address      = v.address,
            description  = v.description,
            image        = v.image,
            last_seen_at = now()
          from jsonb_to_recordset(${json}::jsonb) as v(${RECORD_COLUMNS})
          where e.source_id = v.source_id
        `),

        // Insert only the ones that don't exist yet. New events go live
        // only if their venue has sources.auto_add; otherwise (or if the
        // venue has no sources row, or it's a user submission) they wait
        // for manual approval.
        db.execute(sql`
          insert into events
            (source_id, source_url, title, starts_at, ends_at,
             venue_name, venue_slug, address, description, image, last_seen_at,
             is_active,
             submitted)
          select v.source_id, v.source_url, v.title,
                 v.starts_at::timestamptz, v.ends_at::timestamptz,
                 v.venue_name, v.venue_slug, v.address, v.description, v.image,
                 now(),
                 ${isScrape ? sql`coalesce(s.auto_add, false)` : sql`false`},
                 ${!isScrape}
          from jsonb_to_recordset(${json}::jsonb) as v(${RECORD_COLUMNS})
          left join sources s on s.slug = v.venue_slug
          where not exists (
            select 1 from events e where e.source_id = v.source_id
          )
          on conflict (source_id) do nothing
        `),
      ]);

    }

    if (isScrape) {
      await db.execute(sql`
        update events
        set is_active = false
        where is_active and not submitted and last_seen_at < now() - interval '5 days'
      `);
      await finishScrapeRun(
        sql`status = 'delivered', completed_at = now(), events_received = ${unique.length}`,
      );
    }

    const change: SiteChange =
      origin === "scrape"
        ? { kind: "all" }
        : origin === "refresh"
          ? { kind: "events", sourceIds: unique.map((e) => e.sourceId) }
          : { kind: "none" };

    return { received: rows.length, stored: unique.length, change };
  } catch (err) {
    if (origin === "scrape") {
      const message = err instanceof Error ? err.message : String(err);
      await finishScrapeRun(
        sql`status = 'failed', completed_at = now(), error = ${message}`,
      );
    }
    throw err;
  }
}
