import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { sources } from "@/lib/db/schema";
import { Row, ScrapedEvent } from "@/lib/types";
import { revalidatePath, revalidateTag } from "next/cache";
export const maxDuration = 60;

/**
 * Maps one raw Bright Data row to our schema
 */
function normalize(
  row: Row,
  venues: { name: string; page: string }[],
): ScrapedEvent | null {
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
  const findVenue = (row: Row): string => {
    const byPage = venues.findLast(
      (venue) => venue.page === row.discovery_input?.url,
    );
    if (byPage) return byPage.name;
    const hosts = (row.hosts ?? []).map((h) => h.name?.toLowerCase());
    return (
      venues.find((venue) => hosts.includes(venue.name.toLowerCase()))?.name ||
      ""
    );
  };

  return {
    sourceId: row.event_id,
    sourceUrl: str(row.url) || "",
    title: str(row.title) || "",
    startsAt: toDate(row.event_date),
    endsAt: row.event_end_date
      ? toDate(row.event_end_date)
      : toDate(row.event_date),
    venueName: findVenue(row),
    address: str(row.location?.address),
    description: row.unformatted_description_text || "",
    image: row.main_image_downloadable || "",
  };
}

function toRecord(e: ScrapedEvent) {
  return {
    source_id: e.sourceId,
    source_url: e.sourceUrl,
    title: e.title,
    starts_at: e.startsAt,
    ends_at: e.endsAt,
    venue_name: e.venueName,
    address: e.address,
    description: e.description,
    image: e.image,
  };
}

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size)
    out.push(items.slice(i, i + size));
  return out;
}

export async function POST(request: Request) {
  if (
    request.headers.get("authorization") !==
    `Bearer ${process.env.WEBHOOK_SECRET}`
  ) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // Deliveries triggered from /dodaj-event (see app/dodaj-event/actions.ts).
  // Their rows wait for manual approval, so they must not touch scrape_runs,
  // the soft-delete, or the cache.
  const isSubmission =
    new URL(request.url).searchParams.get("origin") === "submission";

  try {
    const payload = await request.json();
    const rows: Row[] = Array.isArray(payload) ? payload : [payload];

    // Read straight from the DB rather than the cached getVenues(), so a
    // just-added source is picked up on the next delivery.
    const venues = await db
      .select({ name: sources.name, page: sources.page })
      .from(sources);

    const events = rows
      .map((row) => normalize(row, venues))
      .filter((e): e is ScrapedEvent => e !== null);

    // Discovery can return the same event from two different venue inputs.
    // Two rows with the same source_id in one statement would collide, so
    // collapse them first — last one wins.
    const unique = [...new Map(events.map((e) => [e.sourceId, e])).values()];

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
            venue_name   = v.venue_name,
            address      = v.address,
            description  = v.description,
            image        = v.image,
            last_seen_at = now()
          from jsonb_to_recordset(${json}::jsonb)
            as v(
            source_id text, source_url text, title text, starts_at text,
            ends_at text, venue_name text, address text, description text, image text
          )
          where e.source_id = v.source_id
        `),

        // Insert only the ones that don't exist yet. New events go live
        // only if their venue has sources.auto_add; otherwise (or if the
        // venue has no sources row, or it's a user submission) they wait
        // for manual approval.
        db.execute(sql`
          insert into events
            (source_id, source_url, title, starts_at, ends_at,
             venue_name, address, description, image, last_seen_at, is_active,
             submitted)
          select v.source_id, v.source_url, v.title,
                 v.starts_at::timestamptz, v.ends_at::timestamptz,
                 v.venue_name, v.address, v.description, v.image, now(),
                 ${isSubmission ? sql`false` : sql`coalesce(s.auto_add, false)`},
                 ${isSubmission}
          from jsonb_to_recordset(${json}::jsonb)
            as v(
            source_id text, source_url text, title text, starts_at text,
            ends_at text, venue_name text, address text, description text, image text
          )
          left join sources s on s.name = v.venue_name
          where not exists (
            select 1 from events e where e.source_id = v.source_id
          )
          on conflict (source_id) do nothing
        `),
      ]);
    }

    if (!isSubmission) {
      await db.execute(sql`
        update events
        set is_active = false
        where is_active and not submitted and last_seen_at < now() - interval '5 days'
      `);

      await db.execute(sql`
        update scrape_runs
        set status = 'delivered',
            completed_at = now(),
            events_received = ${unique.length}
        where id = (
          select id from scrape_runs
          where status = 'triggered'
          order by triggered_at desc
          limit 1
        )
      `);

      revalidateTag("events", "days");
      revalidatePath("/", "layout");
    }

    return NextResponse.json({
      ok: true,
      received: rows.length,
      stored: unique.length,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (!isSubmission) {
      await db.execute(sql`
        update scrape_runs
        set status = 'failed', completed_at = now(), error = ${message}
        where id = (
          select id from scrape_runs where status = 'triggered'
          order by triggered_at desc limit 1
        )
      `);
    }
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
