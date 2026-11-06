import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { subscribers } from "@/lib/db/schema";

/**
 * Unsubscribes the token's subscriber (keeping the first unsubscribe time).
 * Used by the /newsletter/wypisz button and the one-click POST route. True if
 * the token exists.
 */
export async function unsubscribeToken(token: string) {
  if (!token) return false;
  const rows = await db
    .update(subscribers)
    .set({
      unsubscribedAt: sql`coalesce(${subscribers.unsubscribedAt}, now())`,
    })
    .where(eq(subscribers.token, token))
    .returning({ id: subscribers.id });
  return rows.length > 0;
}
