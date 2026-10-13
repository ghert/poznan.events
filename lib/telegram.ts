// Telegram rejects messages longer than this (counted after HTML parsing,
// so splitting on the raw HTML length is a safe overestimate).
const MAX_MESSAGE_LENGTH = 4096;

export function escapeHtml(text: string) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/**
 * Packs lines into as few messages as fit Telegram's length limit, never
 * splitting a line. A blank line ("") starts a new paragraph.
 */
export function splitMessage(lines: string[]) {
  const messages: string[] = [];
  let current = "";
  for (const line of lines) {
    const next = current ? `${current}\n${line}` : line;
    if (next.length > MAX_MESSAGE_LENGTH && current) {
      messages.push(current.trim());
      current = line;
    } else {
      current = next;
    }
  }
  if (current.trim()) messages.push(current.trim());
  return messages;
}

/** Sends one HTML message to the channel in TELEGRAM_CHAT_ID. */
export async function sendTelegramMessage(text: string) {
  const res = await fetch(
    `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text,
        parse_mode: "HTML",
        link_preview_options: { is_disabled: true },
      }),
    },
  );
  if (!res.ok) {
    throw new Error(
      `Telegram ${res.status}: ${(await res.text()).slice(0, 500)}`,
    );
  }
}
