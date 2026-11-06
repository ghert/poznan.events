import { BASE_URL } from "@/lib/baseUrl";
import {
  groupByDay,
  shortDateFmt,
  timeFmt,
  type DigestEvent,
} from "@/lib/digestEvents";
import type { Email } from "@/lib/resend";
import { escapeHtml } from "@/lib/telegram";

const font = "font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif";

function layout(body: string) {
  return `<!doctype html><html lang="pl"><body style="margin:0;padding:24px;background:#fff;color:#111;${font};font-size:16px;line-height:1.5"><div style="max-width:600px;margin:0 auto">${body}</div></body></html>`;
}

function unsubscribeLinks(token: string) {
  return {
    page: `${BASE_URL}/newsletter/wypisz?token=${token}`,
    oneClick: `${BASE_URL}/api/newsletter/unsubscribe?token=${token}`,
  };
}

/**
 * The weekly digest, built once per send. Only the unsubscribe token differs
 * between recipients, so this returns a function of the subscriber.
 */
export function digestEmail(
  start: Date,
  end: Date,
  rows: DigestEvent[],
): (to: string, token: string) => Email {
  const subject = `Wydarzenia w Poznaniu ${shortDateFmt.format(start)}–${shortDateFmt.format(end)}`;
  const days = groupByDay(rows);

  const html: string[] = [
    `<h1 style="font-size:22px;margin:0 0 16px">${escapeHtml(subject)}</h1>`,
  ];
  const text: string[] = [subject];
  for (const { day, events } of days) {
    html.push(
      `<h2 style="font-size:17px;margin:24px 0 8px">${escapeHtml(day)}</h2>`,
    );
    text.push("", day);
    for (const event of events) {
      const time = timeFmt.format(new Date(event.startsAt!));
      const url = `${BASE_URL}/wydarzenie/${event.id}`;
      const venue = event.venueName ? ` · ${event.venueName}` : "";
      html.push(
        `<p style="margin:0 0 6px">${time} <a href="${url}" style="color:#111">${escapeHtml(event.title)}</a>${escapeHtml(venue)}</p>`,
      );
      text.push(`${time} ${event.title}${venue}`, url);
    }
  }
  html.push(
    `<p style="margin:24px 0 0">Wszystkie wydarzenia: <a href="${BASE_URL}" style="color:#111">${BASE_URL.replace(/^https?:\/\//, "")}</a></p>`,
  );
  text.push("", `Wszystkie wydarzenia: ${BASE_URL}`);
  const htmlBody = html.join("");
  const textBody = text.join("\n");

  return (to, token) => {
    const links = unsubscribeLinks(token);
    return {
      to,
      subject,
      html: layout(
        `${htmlBody}<p style="margin:32px 0 0;font-size:13px;color:#666">Dostajesz ten e-mail, bo zapisałeś(-aś) się na newsletter poznan.events. <a href="${links.page}" style="color:#666">Wypisz się</a></p>`,
      ),
      text: `${textBody}\n\n--\nWypisz się: ${links.page}`,
      headers: {
        "List-Unsubscribe": `<${links.oneClick}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    };
  };
}

export function confirmationEmail(to: string, token: string): Email {
  const url = `${BASE_URL}/newsletter/potwierdz?token=${token}`;
  return {
    to,
    subject: "Potwierdź zapis na newsletter poznan.events",
    html: layout(
      `<p>Cześć! Kliknij, aby potwierdzić zapis na cotygodniowy newsletter z wydarzeniami w Poznaniu:</p><p><a href="${url}" style="display:inline-block;padding:10px 18px;background:#111;color:#fff;text-decoration:none">Potwierdź zapis</a></p><p style="font-size:13px;color:#666">Jeśli to nie Ty, zignoruj tę wiadomość. Bez potwierdzenia nic nie wyślemy.</p>`,
    ),
    text: `Potwierdź zapis na cotygodniowy newsletter poznan.events:\n${url}\n\nJeśli to nie Ty, zignoruj tę wiadomość.`,
  };
}
