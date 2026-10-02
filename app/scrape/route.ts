import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { scrapeRuns } from "@/lib/db/schema";
import { desc, ne } from "drizzle-orm";
import { getVenues } from "@/lib/getVenues";

const MIN_HOURS_BETWEEN_RUNS = 40;

export async function GET(request: Request) {
  if (
    request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`
  ) {
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

    const params = new URLSearchParams({
      dataset_id: process.env.DATASET_ID!,
      format: "json",
      uncompressed_webhook: "true",
      notify: "true",
      limit_per_input: "10",
      endpoint: `https://${process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}/webhook`,
      auth_header: `Bearer ${process.env.WEBHOOK_SECRET}`,
      type: "discover_new",
      discover_by: "venue",
    });

    const res = await fetch(`${process.env.BACKEND_URL}?${params}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        venues.map((input) => ({
          url: input.page,
          upcoming_events_only: true,
        })),
      ),
    });

    const body = await res.text();
    if (!res.ok) {
      await db.insert(scrapeRuns).values({
        status: "failed",
        error: `Bright Data ${res.status}: ${body.slice(0, 500)}`,
      });
      return NextResponse.json(
        { ok: false, status: res.status, body },
        { status: 502 },
      );
    }

    const { snapshot_id } = JSON.parse(body) as { snapshot_id: string };

    await db.insert(scrapeRuns).values({
      snapshotId: snapshot_id,
      status: "triggered",
    });

    // Results arrive later at /webhook
    return NextResponse.json({ ok: true, snapshotId: snapshot_id });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await db.insert(scrapeRuns).values({ status: "failed", error: message });
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
