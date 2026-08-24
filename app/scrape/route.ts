import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { SCRAPE_INPUTS } from '@/lib/sources';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Vercel's Hobby plan only fires cron jobs once per day, so we run daily and
// skip the run if we already collected recently. 40h rather than 48h so a
// slightly early trigger doesn't cause us to skip a whole day.
const MIN_HOURS_BETWEEN_RUNS = 40;

export async function GET(request: Request) {
  // Vercel sends this header automatically when CRON_SECRET is set in env vars.
  // if (request.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
  //   return new NextResponse('Unauthorized', { status: 401 });
  // }

  try {
    const [last] = await sql`
      select triggered_at
      from scrape_runs
      where status <> 'failed'
      order by triggered_at desc
      limit 1
    `;

    if (last) {
      const hoursSince = (Date.now() - new Date(last.triggered_at).getTime()) / 3_600_000;
      if (hoursSince < MIN_HOURS_BETWEEN_RUNS) {
        // return NextResponse.json({
        //   skipped: true,
        //   hoursSinceLastRun: Math.round(hoursSince),
        // });
      }
    }

    const params = new URLSearchParams({
      dataset_id: process.env.BRIGHTDATA_DATASET_ID!,
      format: 'json',
      uncompressed_webhook: 'true',
      notify: 'true',
      limit_per_input: '3',
      endpoint: `https://${process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}/webhook`,
      auth_header: `Bearer ${process.env.WEBHOOK_SECRET}`,
      type: "discover_new",
      discover_by: "venue"

      // For a discovery-type scraper, also add:
      // type: 'discover_new',
      // discover_by: 'location',
      // limit_per_input: '50',
    });

    const res = await fetch(`https://api.brightdata.com/datasets/v3/trigger?${params}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.BRIGHTDATA_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(SCRAPE_INPUTS),
    });

    const body = await res.text();
    if (!res.ok) {
      await sql`
        insert into scrape_runs (status, error)
        values ('failed', ${`Bright Data ${res.status}: ${body.slice(0, 500)}`})
      `;
      return NextResponse.json({ ok: false, status: res.status, body }, { status: 502 });
    }

    const { snapshot_id } = JSON.parse(body) as { snapshot_id: string };

    await sql`
      insert into scrape_runs (snapshot_id, status)
      values (${snapshot_id}, 'triggered')
    `;

    // Results arrive later at /api/webhooks/brightdata
    return NextResponse.json({ ok: true, snapshotId: snapshot_id });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await sql`insert into scrape_runs (status, error) values ('failed', ${message})`;
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
