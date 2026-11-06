import { NextResponse } from "next/server";
import { and, asc, count, inArray, isNotNull, isNull, lt, or } from "drizzle-orm";
import { hasBearer } from "@/lib/bearerAuth";
import { db } from "@/lib/db";
import { subscribers } from "@/lib/db/schema";
import {
  currentWeek,
  currentWeekKey,
  getDigestEvents,
  TIME_ZONE,
} from "@/lib/digestEvents";
import { digestEmail } from "@/lib/newsletterEmail";
import { BATCH_LIMIT, sendBatch, sendEmail } from "@/lib/resend";

// Daily cron. Resend's free plan allows 100 emails a day, so each run sends
// this week's digest to the next 100 subscribers who haven't had it yet
// (earliest-confirmed first). Whoever is still pending when the week ends
// skips it; the Sunday warning is the cue to move to a paid plan.
//
// `?to=email` sends a single test email and marks nobody as sent.
export async function GET(request: Request) {
  if (!hasBearer(request, process.env.CRON_SECRET)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const now = new Date();
    const { start, end } = currentWeek(now);
    const week = currentWeekKey(now);

    const rows = await getDigestEvents(start, end);
    if (rows.length === 0) return NextResponse.json({ skipped: true });
    const build = digestEmail(start, end, rows);

    const testTo = new URL(request.url).searchParams.get("to");
    if (testTo) {
      await sendEmail(build(testTo, "test"));
      return NextResponse.json({ ok: true, test: testTo });
    }

    const pending = and(
      isNotNull(subscribers.confirmedAt),
      isNull(subscribers.unsubscribedAt),
      or(isNull(subscribers.lastDigestWeek), lt(subscribers.lastDigestWeek, week)),
    );

    const batch = await db
      .select({
        id: subscribers.id,
        email: subscribers.email,
        token: subscribers.token,
      })
      .from(subscribers)
      .where(pending)
      .orderBy(asc(subscribers.confirmedAt), asc(subscribers.id))
      .limit(BATCH_LIMIT);

    if (batch.length > 0) {
      // Same key on a retry of the same batch, so Resend drops the duplicate.
      await sendBatch(
        batch.map((s) => build(s.email, s.token)),
        `digest-${week}-${batch[0].id}`,
      );
      await db
        .update(subscribers)
        .set({ lastDigestWeek: week })
        .where(
          inArray(
            subscribers.id,
            batch.map((s) => s.id),
          ),
        );
    }

    const [{ remaining }] = await db
      .select({ remaining: count() })
      .from(subscribers)
      .where(pending);
    const weekday = new Intl.DateTimeFormat("en", {
      timeZone: TIME_ZONE,
      weekday: "short",
    }).format(now);
    if (remaining > 0 && weekday === "Sun") {
      console.warn(
        `Newsletter: ${remaining} subscribers won't get week ${week}'s digest (daily limit ${BATCH_LIMIT}).`,
      );
    }

    return NextResponse.json({ ok: true, sent: batch.length, pending: remaining });
  } catch (err) {
    console.error("Newsletter send failed", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
