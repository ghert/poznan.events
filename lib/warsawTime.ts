import { TZDate } from "@date-fns/tz";
import { format } from "date-fns";

const ZONE = "Europe/Warsaw";

// <input type="datetime-local"> gives "YYYY-MM-DDTHH:mm" with no zone;
// interpret it as Poznań local time.
export function parseWarsawLocal(value: string): Date | null {
  const m = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
  if (!m) return null;
  const [, y, mo, d, h, mi] = m.map(Number);
  // TZDate would roll out-of-range parts over (month 13 -> next year), so
  // reject them, including days that don't exist in that month.
  const daysInMonth = new Date(Date.UTC(y, mo, 0)).getUTCDate();
  if (mo < 1 || mo > 12 || d < 1 || d > daysInMonth || h > 23 || mi > 59)
    return null;
  const time = new TZDate(y, mo - 1, d, h, mi, ZONE).getTime();
  // A plain Date, so toISOString() gives UTC ("…Z") rather than TZDate's
  // offset form ("…+02:00").
  return Number.isNaN(time) ? null : new Date(time);
}

// The inverse: an ISO timestamp as a Poznań-local datetime-local value.
export function toWarsawLocal(iso: string | null): string {
  if (!iso) return "";
  return format(new TZDate(iso, ZONE), "yyyy-MM-dd'T'HH:mm");
}
