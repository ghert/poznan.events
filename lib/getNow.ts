import { cacheLife } from "next/cache";

export async function getNow() {
  'use cache';
  cacheLife('hours');
  return new Date();
}
