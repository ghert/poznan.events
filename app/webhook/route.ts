import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { VENUES } from "@/lib/sources";
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

type ScrapedEvent = {
  sourceId: string;
  sourceUrl: string;
  title: string;
  startsAt: string | null;
  endsAt: string | null;
  venueName: string | null;
  address: string | null;
};

interface Row {
  event_id: string;
  url: string;
  event_date: string;
  title: string;
  location: {
    address: string;
  },
  hosts: {name: string}[]
}

/**
 * Maps one raw Bright Data row to our schema.
 *
 * IMPORTANT: the field names below are guesses. On your first real run, look at
 * the logged payload in the Vercel dashboard and correct them. The fallbacks
 * mean a wrong guess produces nulls rather than a crash.
 */
function normalize(row: Row): ScrapedEvent | null {
  const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : null);

  if (!row.url || !row.title) return null;

  const toDate = (v: unknown) => {
    const s = str(v);
    if (!s) return null;
    const d = new Date(s);
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
  };

  const findVenue = (row: Row): string => row.hosts.findLast(host => VENUES.includes(host.name))?.name || "";

  return {
    sourceId: row.event_id,
    sourceUrl: str(row.url) || '',
    title: str(row.title) || '',
    startsAt: toDate(row.event_date),
    endsAt: toDate(row.event_date),
    venueName: findVenue(row) || '',
    address: str(row.location?.address)
  };
}

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

export async function POST(request: Request) {
  // if (request.headers.get('authorization') !== `Bearer ${process.env.WEBHOOK_SECRET}`) {
  //   return new NextResponse('Unauthorized', { status: 401 });
  // }

  try {
    const payload = await request.json();

    // Uncomment on your first run to discover the real field names:
    // console.log('brightdata payload sample', JSON.stringify(payload?.[0] ?? payload));

    const rows: Row[] = Array.isArray(payload) ? payload : [payload];
    const events = rows
      .map(normalize)
      .filter((e): e is ScrapedEvent => e !== null);

    for (const batch of chunk(events, 100)) {
      await sql.transaction(
        batch.map(
          (e) => sql`
            insert into events
              (source_id, source_url, title, starts_at, ends_at, venue_name, address, last_seen_at, is_active)
            values
              (${e.sourceId}, ${e.sourceUrl}, ${e.title}, ${e.startsAt}, ${e.endsAt},
               ${e.venueName}, ${e.address}, now(), true)
            on conflict (source_id) do update set
              source_url   = excluded.source_url,
              title        = excluded.title,
              starts_at    = excluded.starts_at,
              ends_at      = excluded.ends_at,
              venue_name   = excluded.venue_name,
              address         = excluded.address,
              last_seen_at = now(),
              is_active    = true
          `,
        ),
      );
    }

    // Anything we haven't seen in two collection cycles is probably cancelled
    // or removed — hide it rather than deleting, so you can debug later.
    await sql`
      update events
      set is_active = false
      where is_active and last_seen_at < now() - interval '5 days'
    `;

    await sql`
      update scrape_runs
      set status = 'delivered',
          completed_at = now(),
          events_received = ${events.length}
      where id = (
        select id from scrape_runs
        where status = 'triggered'
        order by triggered_at desc
        limit 1
      )
    `;

    return NextResponse.json({ ok: true, received: rows.length, stored: events.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await sql`
      update scrape_runs
      set status = 'failed', completed_at = now(), error = ${message}
      where id = (
        select id from scrape_runs where status = 'triggered'
        order by triggered_at desc limit 1
      )
    `;
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
