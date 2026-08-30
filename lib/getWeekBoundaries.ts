import { tz } from "@date-fns/tz";
import { addWeeks, endOfWeek, startOfWeek } from "date-fns";
import { cacheLife } from "next/cache";

export async function getWeekBoundaries() {
  'use cache';
  cacheLife('hours');
  const now = new Date();
  const opts = { weekStartsOn: 1 as const, in: tz('Europe/Warsaw') };
  const start = startOfWeek(now, opts);
  const end = endOfWeek(now, opts);
  return {
    start: start.toISOString(),
    end: end.toISOString(),
    nextEnd: addWeeks(end, 1).toISOString(),
  };
}
