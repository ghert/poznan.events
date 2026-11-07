"use server";

import { checkBotId } from "botid/server";
import { db } from "@/lib/db";
import { events } from "@/lib/db/schema";
import { triggerBrightData } from "@/lib/brightdata";
import { ImageValidationError, uploadEventImage } from "@/lib/r2";
import {
  capitalize,
  MAX_VENUE_NAME,
  parseEventDraft,
} from "@/lib/eventDraft";

// Submissions are inserted with is_active = false and wait for manual
// approval, so neither action revalidates anything — nothing visible changes.

export type SubmitState = { ok: boolean; message: string } | null;

const FB_EVENT_URL = /^https:\/\/(www\.|m\.)?facebook\.com\/events\/\d+/;
const THANKS = "Dzięki! Wydarzenie pojawi się na stronie po weryfikacji.";
const BOT = "Nie udało się zweryfikować przeglądarki. Spróbuj ponownie.";
const CONSENT = "Zaznacz zgodę na publikację wydarzenia.";

// Checked checkboxes submit "on"; unchecked ones are absent from FormData.
function hasConsent(formData: FormData) {
  return formData.get("consent") === "on";
}

export async function submitFacebookUrl(
  _prev: SubmitState,
  formData: FormData,
): Promise<SubmitState> {
  const { isBot } = await checkBotId();
  if (isBot) return { ok: false, message: BOT };
  if (!hasConsent(formData)) return { ok: false, message: CONSENT };

  const url = String(formData.get("url") ?? "").trim();
  if (!FB_EVENT_URL.test(url))
    return {
      ok: false,
      message:
        "Podaj link do wydarzenia, np. https://www.facebook.com/events/123…",
    };

  try {
    // Collect-by-URL mode; the result lands in /api/webhook?origin=submission.
    const result = await triggerBrightData([{ url }], "submission");
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

export async function submitManualEvent(
  _prev: SubmitState,
  formData: FormData,
): Promise<SubmitState> {
  const { isBot } = await checkBotId();
  if (isBot) return { ok: false, message: BOT };
  if (!hasConsent(formData)) return { ok: false, message: CONSENT };

  const text = (key: string) => String(formData.get(key) ?? "").trim();

  const draft = parseEventDraft({
    title: formData.get("title"),
    startsAt: formData.get("startsAt"),
    endsAt: formData.get("endsAt"),
  });
  if (!draft.ok) return { ok: false, message: capitalize(draft.message) };
  const { title, startsAt, endsAt } = draft;
  const description = text("description");
  const image = formData.get("image");

  if (description.length > 10_000)
    return { ok: false, message: "Opis jest za długi." };
  if (!(image instanceof File) || image.size === 0)
    return { ok: false, message: "Dodaj grafikę wydarzenia." };

  // Known venues are already scraped, so submissions are for other places.
  const venueName = text("venueName");
  const address = text("address") || null;
  if (!venueName || venueName.length > MAX_VENUE_NAME)
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
