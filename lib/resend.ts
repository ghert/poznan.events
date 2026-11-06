// Minimal Resend REST client. Nothing else in the app talks to Resend, so
// switching providers (e.g. to SES) means rewriting only this file.

const API = "https://api.resend.com";

export type Email = {
  to: string;
  subject: string;
  html: string;
  text: string;
  headers?: Record<string, string>;
};

function toPayload(email: Email) {
  return {
    from: process.env.NEWSLETTER_FROM,
    reply_to: process.env.NEWSLETTER_REPLY_TO || undefined,
    to: [email.to],
    subject: email.subject,
    html: email.html,
    text: email.text,
    headers: email.headers,
  };
}

async function post(path: string, body: unknown, idempotencyKey?: string) {
  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
      ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`Resend ${res.status}: ${(await res.text()).slice(0, 500)}`);
  }
}

export function sendEmail(email: Email) {
  return post("/emails", toPayload(email));
}

/** Up to 100 emails in one request (Resend's batch limit). */
export const BATCH_LIMIT = 100;

export function sendBatch(emails: Email[], idempotencyKey: string) {
  if (emails.length > BATCH_LIMIT)
    throw new Error(`Batch of ${emails.length} exceeds ${BATCH_LIMIT}`);
  return post("/emails/batch", emails.map(toPayload), idempotencyKey);
}
