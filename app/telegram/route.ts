import { tz } from "@date-fns/tz";
import { endOfWeek, startOfWeek } from "date-fns";
import { TIME_ZONE, telegramDigest } from "@/lib/telegramDigest";

// Monday cron: every event starting this week (Mon–Sun, Poznań time).
export const GET = telegramDigest("Wydarzenia w Poznaniu", (now) => {
  const opts = { weekStartsOn: 1 as const, in: tz(TIME_ZONE) };
  return { start: startOfWeek(now, opts), end: endOfWeek(now, opts) };
});
