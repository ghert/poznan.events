"use server";

import { headers } from "next/headers";
import { revalidatePath, updateTag } from "next/cache";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { events, eventTags, sources, tags } from "@/lib/db/schema";
import { isAdminAuthorization } from "@/lib/adminAuth";
import { parseWarsawLocal } from "@/lib/warsawTime";
import type { AdminEventDraft, SaveResult } from "./types";

/**
 * Saves every changed row from the admin panel at once. All rows are
 * validated first; if any is invalid nothing is written.
 */
export async function saveEvents(
  drafts: AdminEventDraft[],
): Promise<SaveResult> {
  // Server Actions can be invoked from any route, so don't rely on proxy.ts.
  if (!isAdminAuthorization((await headers()).get("authorization")))
    return { ok: false, message: "Brak uprawnień." };

  if (!Array.isArray(drafts) || drafts.length === 0)
    return { ok: true, message: "Brak zmian do zapisania." };

  const [allTags, venues] = await Promise.all([
    db.select({ id: tags.id, slug: tags.slug }).from(tags),
    db.select({ slug: sources.slug }).from(sources),
  ]);
  const tagIdBySlug = new Map(allTags.map((t) => [t.slug, t.id]));
  const venueSlugs = new Set(venues.map((v) => v.slug));

  const rows = [];
  for (const d of drafts) {
    const title = String(d.title ?? "").trim();
    const startsAt = parseWarsawLocal(String(d.startsAt ?? ""));
    const endsAt = parseWarsawLocal(String(d.endsAt ?? ""));
    const label = title || `#${d.id}`;

    if (!Number.isSafeInteger(d.id))
      return { ok: false, message: "Nieprawidłowe wydarzenie." };
    if (!title || title.length > 300)
      return {
        ok: false,
        message: `${label}: podaj tytuł (maks. 300 znaków).`,
      };
    if (!startsAt || !endsAt)
      return { ok: false, message: `${label}: podaj początek i koniec.` };
    if (endsAt < startsAt)
      return {
        ok: false,
        message: `${label}: koniec nie może być przed początkiem.`,
      };

    const venueName = String(d.venueName ?? "").trim();
    const venueSlug = String(d.venueSlug ?? "") || null;
    if (venueName.length > 200)
      return { ok: false, message: `${label}: nazwa miejsca jest za długa.` };
    if (venueSlug && !venueSlugs.has(venueSlug))
      return { ok: false, message: `${label}: nieznane miejsce.` };

    const tagIds = [...new Set(d.tagSlugs ?? [])].map((slug) =>
      tagIdBySlug.get(slug),
    );
    if (tagIds.some((id) => id === undefined))
      return { ok: false, message: `${label}: nieznany tag.` };

    rows.push({
      id: d.id,
      values: {
        title,
        description: String(d.description ?? ""),
        startsAt: startsAt.toISOString(),
        endsAt: endsAt.toISOString(),
        isActive: Boolean(d.isActive),
        venueName: venueName || null,
        venueSlug,
      },
      tagIds: tagIds as number[],
    });
  }

  const ids = rows.map((r) => r.id);
  const links = rows.flatMap((r) =>
    r.tagIds.map((tagId) => ({ eventId: r.id, tagId })),
  );

  try {
    // neon-http has no interactive transactions; db.batch runs these as one
    // multi-statement request (see CLAUDE.md).
    await db.batch([
      ...rows.map((r) =>
        db.update(events).set(r.values).where(eq(events.id, r.id)),
      ),
      // Replace the tags of every saved event.
      db.delete(eventTags).where(inArray(eventTags.eventId, ids)),
      ...(links.length ? [db.insert(eventTags).values(links)] : []),
    ] as unknown as Parameters<typeof db.batch>[0]);
  } catch (err) {
    console.error("Admin save failed", err);
    return { ok: false, message: "Nie udało się zapisać zmian." };
  }

  // Admin edits are meant to be visible right away (unlike submissions).
  updateTag("events");
  revalidatePath("/", "layout");

  return {
    ok: true,
    message: `Zapisano ${rows.length} ${rows.length === 1 ? "wydarzenie" : "wydarzeń"}.`,
  };
}

/**
 * Drops every cached page and data entry so the public site re-reads the DB,
 * e.g. after editing rows directly in Neon (approvals, tags, sources).
 */
export async function revalidateSite(): Promise<SaveResult> {
  if (!isAdminAuthorization((await headers()).get("authorization")))
    return { ok: false, message: "Brak uprawnień." };

  // Every cacheTag used in lib/get*.ts.
  for (const tag of ["events", "sources", "tags"]) updateTag(tag);
  revalidatePath("/", "layout");

  return { ok: true, message: "Odświeżono całą stronę." };
}
