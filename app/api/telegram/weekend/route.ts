import { addDays } from "date-fns";
import { currentWeek } from "@/lib/digestEvents";
import { telegramDigest } from "@/lib/telegramDigest";

// Friday cron: every event starting this Friday–Sunday (Poznań time).
export const GET = telegramDigest("Weekend w Poznaniu", (now) => {
  const { start, end } = currentWeek(now);
  return { start: addDays(start, 4), end };
});
