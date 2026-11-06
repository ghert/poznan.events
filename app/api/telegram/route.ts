import { currentWeek } from "@/lib/digestEvents";
import { telegramDigest } from "@/lib/telegramDigest";

// Monday cron: every event starting this week (Mon–Sun, Poznań time).
export const GET = telegramDigest("Wydarzenia w Poznaniu", currentWeek);
