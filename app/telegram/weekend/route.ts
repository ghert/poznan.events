import { tz } from "@date-fns/tz";
import { addDays, endOfWeek, startOfWeek } from "date-fns";
import { TIME_ZONE, telegramDigest } from "@/lib/telegramDigest";

// Friday cron: every event starting this Friday–Sunday (Poznań time).
export const GET = telegramDigest("Weekend w Poznaniu", (now) => {
  const opts = { weekStartsOn: 1 as const, in: tz(TIME_ZONE) };
  return {
    start: addDays(startOfWeek(now, opts), 4),
    end: endOfWeek(now, opts),
  };
});
