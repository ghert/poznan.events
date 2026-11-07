import { parseWarsawLocal } from "./warsawTime";

// Validation shared by everything that writes an event by hand: the manual
// /dodaj-wydarzenie form and the admin panel. Scraped events go through
// lib/saveScrapedEvents.ts instead.

export const MAX_TITLE = 300;
export const MAX_VENUE_NAME = 200;

/**
 * Checks a title and Poznań-local start/end (`datetime-local` strings).
 * Error messages are lowercase so callers can prefix or capitalize them.
 */
export function parseEventDraft(draft: {
  title: unknown;
  startsAt: unknown;
  endsAt: unknown;
}):
  | { ok: true; title: string; startsAt: Date; endsAt: Date }
  | { ok: false; message: string } {
  const title = String(draft.title ?? "").trim();
  const startsAt = parseWarsawLocal(String(draft.startsAt ?? ""));
  const endsAt = parseWarsawLocal(String(draft.endsAt ?? ""));

  if (!title || title.length > MAX_TITLE)
    return { ok: false, message: `podaj tytuł (maks. ${MAX_TITLE} znaków).` };
  if (!startsAt || !endsAt)
    return { ok: false, message: "podaj datę rozpoczęcia i zakończenia." };
  if (endsAt < startsAt)
    return {
      ok: false,
      message: "zakończenie nie może być przed rozpoczęciem.",
    };
  return { ok: true, title, startsAt, endsAt };
}

export function capitalize(message: string) {
  return message[0].toUpperCase() + message.slice(1);
}
