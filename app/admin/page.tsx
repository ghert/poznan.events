import type { Metadata } from "next";
import { Suspense } from "react";
import { headers } from "next/headers";
import { asc, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { events, sources, tags } from "@/lib/db/schema";
import { isAdminAuthorization } from "@/lib/adminAuth";
import { withTags } from "@/lib/withTags";
import { toWarsawLocal } from "@/lib/warsawTime";
import AdminPanel from "@/components/AdminPanel";
import type { AdminEvent } from "./types";

export const metadata: Metadata = {
  title: "Admin - poznan.events",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <Suspense
      fallback={<span className="loading loading-ring loading-xl m-auto" />}
    >
      <AdminEvents />
    </Suspense>
  );
}

// Reads request headers and uncached data, so it must stay inside Suspense.
async function AdminEvents() {
  if (!isAdminAuthorization((await headers()).get("authorization")))
    return <p>Brak uprawnień.</p>;

  // All upcoming events, active or not (pending submissions included).
  // Deliberately uncached: the panel must show the current DB state.
  const [rows, allTags, venues] = await Promise.all([
    db
      .select({
        id: events.id,
        title: events.title,
        description: events.description,
        startsAt: events.startsAt,
        endsAt: events.endsAt,
        isActive: events.isActive,
        submitted: events.submitted,
        venueName: events.venueName,
        venueSlug: events.venueSlug,
        image: events.image,
        sourceUrl: events.sourceUrl,
      })
      .from(events)
      .where(sql`coalesce(${events.endsAt}, ${events.startsAt}) > now()`)
      .orderBy(asc(events.startsAt)),
    db
      .select({ slug: tags.slug, name: tags.name, emoji: tags.emoji })
      .from(tags)
      .orderBy(asc(tags.name)),
    db
      .select({ slug: sources.slug, name: sources.name })
      .from(sources)
      .orderBy(asc(sources.name)),
  ]);

  const adminEvents: AdminEvent[] = (await withTags(rows)).map((e) => ({
    id: e.id,
    title: e.title,
    description: e.description ?? "",
    startsAt: toWarsawLocal(e.startsAt),
    endsAt: toWarsawLocal(e.endsAt),
    isActive: e.isActive,
    tagSlugs: e.tags.map((t) => t.slug),
    venueName: e.venueName ?? "",
    venueSlug: e.venueSlug ?? "",
    image: e.image,
    sourceUrl: e.sourceUrl,
    submitted: e.submitted,
  }));

  return <AdminPanel events={adminEvents} tags={allTags} venues={venues} />;
}
