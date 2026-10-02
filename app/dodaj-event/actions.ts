"use server";

import { TZDate } from "@date-fns/tz";
import { checkBotId } from "botid/server";
import { db } from "@/lib/db";
import { events } from "@/lib/db/schema";
import { triggerBrightData } from "@/lib/brightdata";
import { ImageValidationError, uploadEventImage } from "@/lib/r2";

// Submissions are inserted with is_active = false and wait for manual
// approval, so neither action revalidates anything — nothing visible changes.

export type SubmitState = { ok: boolean; message: string } | null;

const FB_EVENT_URL = /^https:\/\/(www\.|m\.)?facebook\.com\/events\/\d+/;
const THANKS = "Dzięki! Wydarzenie pojawi się na stronie po weryfikacji.";
const BOT = "Nie udało się zweryfikować przeglądarki. Spróbuj ponownie.";

export async function submitFacebookUrl(
  _prev: SubmitState,
  formData: FormData,
): Promise<SubmitState> {
  const { isBot } = await checkBotId();
  if (isBot) return { ok: false, message: BOT };

  const url = String(formData.get("url") ?? "").trim();
  if (!FB_EVENT_URL.test(url))
    return {
      ok: false,
      message:
        "Podaj link do wydarzenia, np. https://www.facebook.com/events/123…",
    };

  try {
    // Collect-by-URL mode; the result lands in /webhook?origin=submission.
    const result = await triggerBrightData([{ url }], {}, "origin=submission");
    if (!result.ok) {
      console.error(
        "Bright Data submission failed",
        result.status,
        result.body,
      );
      return { ok: false, message: "Coś poszło nie tak. Spróbuj później." };
    }
  } catch (err) {
    console.error("Bright Data submission failed", err);
    return { ok: false, message: "Coś poszło nie tak. Spróbuj później." };
  }

  return { ok: true, message: THANKS };
}

// <input type="datetime-local"> gives "YYYY-MM-DDTHH:mm" with no zone;
// interpret it as Poznań local time.
function parseWarsawLocal(value: string): Date | null {
  const m = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
  if (!m) return null;
  const [, y, mo, d, h, mi] = m.map(Number);
  const date = new TZDate(y, mo - 1, d, h, mi, "Europe/Warsaw");
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function submitManualEvent(
  _prev: SubmitState,
  formData: FormData,
): Promise<SubmitState> {
  const { isBot } = await checkBotId();
  if (isBot) return { ok: false, message: BOT };

  const text = (key: string) => String(formData.get(key) ?? "").trim();

  const title = text("title");
  const description = text("description");
  const startsAt = parseWarsawLocal(text("startsAt"));
  const endsAt = parseWarsawLocal(text("endsAt"));
  const image = formData.get("image");

  if (!title || title.length > 300)
    return { ok: false, message: "Podaj tytuł (maks. 300 znaków)." };
  if (description.length > 10_000)
    return { ok: false, message: "Opis jest za długi." };
  if (!startsAt || !endsAt)
    return { ok: false, message: "Podaj datę rozpoczęcia i zakończenia." };
  if (endsAt < startsAt)
    return {
      ok: false,
      message: "Zakończenie nie może być przed rozpoczęciem.",
    };
  if (!(image instanceof File) || image.size === 0)
    return { ok: false, message: "Dodaj grafikę wydarzenia." };

  // Known venues are already scraped, so submissions are for other places.
  const venueName = text("venueName");
  const address = text("address") || null;
  if (!venueName || venueName.length > 200)
    return { ok: false, message: "Podaj nazwę miejsca." };

  try {
    const imageUrl = await uploadEventImage(image);
    await db.insert(events).values({
      sourceId: `manual-${crypto.randomUUID()}`,
      sourceUrl: "",
      title,
      description,
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
      venueName,
      address,
      image: imageUrl,
      isActive: false,
      submitted: true,
    });
  } catch (err) {
    if (err instanceof ImageValidationError)
      return { ok: false, message: err.message };
    console.error("Manual event submission failed", err);
    return { ok: false, message: "Coś poszło nie tak. Spróbuj później." };
  }

  return { ok: true, message: THANKS };
}
