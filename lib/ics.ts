import { ScrapedEventFromDB } from "./types";

function toIcsDate(date: Date): string {
  return date
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
}

function escapeText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

function foldLine(line: string): string {
  const encoder = new TextEncoder();
  const parts: string[] = [];
  let current = "";
  let currentBytes = 0;
  for (const { segment: char } of new Intl.Segmenter().segment(line)) {
    const charBytes = encoder.encode(char).length;
    const limit = parts.length === 0 ? 75 : 74;
    if (currentBytes + charBytes > limit) {
      parts.push(current);
      current = "";
      currentBytes = 0;
    }
    current += char;
    currentBytes += charBytes;
  }
  parts.push(current);
  return parts.join("\r\n ");
}

export function buildIcs(
  event: ScrapedEventFromDB & { startsAt: string },
): string {
  const start = toIcsDate(new Date(event.startsAt));
  const location = [event.venueName, event.address].filter(Boolean).join(", ");
  const description = [event.description, event.sourceUrl]
    .filter(Boolean)
    .join("\n\n");

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//poznan.events//PL",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${event.sourceId}@poznan.events`,
    `DTSTAMP:${start}`,
    `DTSTART:${start}`,
    `SUMMARY:${escapeText(event.title)}`,
    ...(location ? [`LOCATION:${escapeText(location)}`] : []),
    `DESCRIPTION:${escapeText(description)}`,
    `URL:${event.sourceUrl}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return lines.map(foldLine).join("\r\n") + "\r\n";
}
