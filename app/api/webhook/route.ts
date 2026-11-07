import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { hasBearer } from "@/lib/bearerAuth";
import { saveScrapedEvents, parseOrigin } from "@/lib/saveScrapedEvents";
export const maxDuration = 60;

// Bright Data delivers every job here; lib/saveScrapedEvents.ts says what each origin does.
export async function POST(request: Request) {
  if (!hasBearer(request, process.env.WEBHOOK_SECRET)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const origin = parseOrigin(new URL(request.url).searchParams.get("origin"));

  try {
    const { received, stored, change } = await saveScrapedEvents(
      request.json(),
      origin,
    );

    if (change.kind === "all") {
      revalidateTag("events", "days");
      revalidatePath("/", "layout");
    }

    // getEvent tags each event with `event-<source_id>`, so this refreshes
    // every page showing that event (also its /miejsce and /tag copies).
    if (change.kind === "events") {
      for (const sourceId of change.sourceIds) {
        revalidateTag(`event-${sourceId}`, "days");
      }
    }

    return NextResponse.json({ ok: true, received, stored });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
