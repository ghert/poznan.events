import { NextResponse } from "next/server";
import { hasBearer } from "@/lib/bearerAuth";
import { db } from "@/lib/db";
import { events, scrapeRuns } from "@/lib/db/schema";
import { and, desc, eq, like, ne, sql } from "drizzle-orm";
import { getVenues } from "@/lib/getVenues";
import { triggerBrightData } from "@/lib/brightdata";

const MIN_HOURS_BETWEEN_RUNS = 40;

export async function GET(request: Request) {
  if (!hasBearer(request, process.env.CRON_SECRET)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const venues = await getVenues();

  try {
    const [last] = await db
      .select({ triggeredAt: scrapeRuns.triggeredAt })
      .from(scrapeRuns)
      .where(ne(scrapeRuns.status, "failed"))
      .orderBy(desc(scrapeRuns.triggeredAt))
      .limit(1);

    if (last) {
      const hoursSince =
        (Date.now() - new Date(last.triggeredAt).getTime()) / 3_600_000;
      if (hoursSince < MIN_HOURS_BETWEEN_RUNS) {
        // return NextResponse.json({
        //   skipped: true,
        //   hoursSinceLastRun: Math.round(hoursSince),
        // });
      }
    }

    const result = await triggerBrightData(
      venues.map((input) => ({
        url: input.page,
        upcoming_events_only: true,
      })),
      {
        limit_per_input: "10",
        type: "discover_new",
        discover_by: "venue",
      },
    );

    if (!result.ok) {
      await db.insert(scrapeRuns).values({
        status: "failed",
        error: `Bright Data ${result.status}: ${result.body.slice(0, 500)}`,
      });
      return NextResponse.json(
        { ok: false, status: result.status, body: result.body },
        { status: 502 },
      );
    }

    const snapshot_id = result.snapshotId;

    await db.insert(scrapeRuns).values({
      snapshotId: snapshot_id,
      status: "triggered",
    });

    const refresh = await triggerSubmittedRefresh();

    // Results arrive later at /webhook
    return NextResponse.json({ ok: true, snapshotId: snapshot_id, refresh });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await db.insert(scrapeRuns).values({ status: "failed", error: message });
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

/**
 * Re-collects upcoming events that came in through /dodaj-wydarzenie as
 * Facebook links. The venue scrape above usually doesn't see them, and
 * Facebook image URLs expire after a few days, so without this their images
 * break. Manual-form submissions have no source_url (their images are on R2).
 * Never fails the cron run: errors are logged and reported in the response.
 */
async function triggerSubmittedRefresh() {
  try {
    const rows = await db
      .selectDistinct({ url: events.sourceUrl })
      .from(events)
      .where(
        and(
          eq(events.submitted, true),
          like(events.sourceUrl, "https://%facebook.com/events/%"),
          sql`coalesce(${events.endsAt}, ${events.startsAt}) > now()`,
        ),
      );
    if (rows.length === 0) return { skipped: true };

    // Collect-by-URL mode, same as a new submission; delivers to
    // /webhook?origin=refresh.
    const result = await triggerBrightData(
      rows.map(({ url }) => ({ url })),
      {},
      "origin=refresh",
    );
    if (!result.ok) {
      console.error("Submitted refresh failed", result.status, result.body);
      return { ok: false, status: result.status };
    }
    return { ok: true, snapshotId: result.snapshotId, events: rows.length };
  } catch (err) {
    console.error("Submitted refresh failed", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
