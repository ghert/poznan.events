import { cacheLife, cacheTag } from "next/cache";

export async function getNow() {
  'use cache';
  cacheLife('days');
  cacheTag('events');
  return new Date();
}
