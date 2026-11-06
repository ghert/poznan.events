"use server";

import { randomBytes } from "node:crypto";
import { checkBotId } from "botid/server";
import { and, eq, isNotNull, isNull, or, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { subscribers } from "@/lib/db/schema";
import { currentWeekKey } from "@/lib/digestEvents";
import { confirmationEmail } from "@/lib/newsletterEmail";
import { sendEmail } from "@/lib/resend";
import { unsubscribeToken } from "@/lib/unsubscribe";

// The subscriber list is never cached, so nothing here revalidates.

export type NewsletterState = { ok: boolean; message: string } | null;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CHECK_INBOX =
  "Sprawdź skrzynkę i kliknij link w wiadomości, aby potwierdzić zapis.";
const FAILED = "Nie udało się wysłać wiadomości. Spróbuj później.";
const RESEND_AFTER_MS = 10 * 60 * 1000;

export async function subscribe(
  _prev: NewsletterState,
  formData: FormData,
): Promise<NewsletterState> {
  const { isBot } = await checkBotId();
  if (isBot)
    return {
      ok: false,
      message: "Nie udało się zweryfikować przeglądarki. Spróbuj ponownie.",
    };

  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  if (email.length > 254 || !EMAIL.test(email))
    return { ok: false, message: "Podaj poprawny adres e-mail." };

  // Same reply whatever the address's state, so the form can't be used to
  // check whether someone is subscribed.
  try {
    await db
      .insert(subscribers)
      .values({ email, token: randomBytes(32).toString("base64url") })
      .onConflictDoNothing({ target: subscribers.email });

    const [row] = await db
      .select()
      .from(subscribers)
      .where(eq(subscribers.email, email));
    const active = row.confirmedAt && !row.unsubscribedAt;
    const recentlySent =
      row.confirmationSentAt &&
      Date.now() - new Date(row.confirmationSentAt).getTime() <
        RESEND_AFTER_MS;
    if (active || recentlySent) return { ok: true, message: CHECK_INBOX };

    await sendEmail(confirmationEmail(email, row.token));
    await db
      .update(subscribers)
      .set({ confirmationSentAt: sql`now()` })
      .where(eq(subscribers.id, row.id));
  } catch (err) {
    console.error("Newsletter subscribe failed", err);
    return { ok: false, message: FAILED };
  }

  return { ok: true, message: CHECK_INBOX };
}

// Confirm and unsubscribe are buttons on a page, not GET links, so mail link
// scanners that open every URL don't trigger them.

export async function confirm(
  _prev: NewsletterState,
  formData: FormData,
): Promise<NewsletterState> {
  const token = String(formData.get("token") ?? "");
  const updated = await db
    .update(subscribers)
    .set({
      confirmedAt: sql`now()`,
      unsubscribedAt: null,
      // The first digest is next week's; this week's backlog goes to people
      // who were already on the list.
      lastDigestWeek: currentWeekKey(new Date()),
    })
    .where(
      and(
        eq(subscribers.token, token),
        or(isNull(subscribers.confirmedAt), isNotNull(subscribers.unsubscribedAt)),
      ),
    )
    .returning({ id: subscribers.id });
  if (updated.length > 0)
    return {
      ok: true,
      message: "Zapis potwierdzony. Pierwszy newsletter przyjdzie w poniedziałek.",
    };

  const [existing] = await db
    .select({ id: subscribers.id })
    .from(subscribers)
    .where(eq(subscribers.token, token));
  return existing
    ? { ok: true, message: "Ten adres jest już zapisany." }
    : { ok: false, message: "Nieprawidłowy lub nieaktualny link." };
}

export async function unsubscribe(
  _prev: NewsletterState,
  formData: FormData,
): Promise<NewsletterState> {
  const token = String(formData.get("token") ?? "");
  const found = await unsubscribeToken(token);
  return found
    ? { ok: true, message: "Wypisano z newslettera." }
    : { ok: false, message: "Nieprawidłowy lub nieaktualny link." };
}
