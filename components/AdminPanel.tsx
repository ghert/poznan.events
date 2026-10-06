"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, RefreshCw, Save } from "lucide-react";
import { revalidateSite, saveEvents } from "@/app/admin/actions";
import type {
  AdminEvent,
  AdminEventDraft,
  AdminTag,
  AdminVenue,
  SaveResult,
} from "@/app/admin/types";

function toDraft(e: AdminEvent): AdminEventDraft {
  return {
    id: e.id,
    title: e.title,
    description: e.description,
    startsAt: e.startsAt,
    endsAt: e.endsAt,
    isActive: e.isActive,
    tagSlugs: e.tagSlugs,
    venueName: e.venueName,
    venueSlug: e.venueSlug,
  };
}

function sameDraft(a: AdminEventDraft, b: AdminEventDraft) {
  return (
    a.title === b.title &&
    a.description === b.description &&
    a.startsAt === b.startsAt &&
    a.endsAt === b.endsAt &&
    a.isActive === b.isActive &&
    a.venueName === b.venueName &&
    a.venueSlug === b.venueSlug &&
    [...a.tagSlugs].sort().join() === [...b.tagSlugs].sort().join()
  );
}

function EventRow({
  event,
  draft,
  tags,
  venues,
  changed,
  onChange,
}: {
  event: AdminEvent;
  draft: AdminEventDraft;
  tags: AdminTag[];
  venues: AdminVenue[];
  changed: boolean;
  onChange: (patch: Partial<AdminEventDraft>) => void;
}) {
  const toggleTag = (slug: string) =>
    onChange({
      tagSlugs: draft.tagSlugs.includes(slug)
        ? draft.tagSlugs.filter((s) => s !== slug)
        : [...draft.tagSlugs, slug],
    });

  return (
    <div
      className={`card bg-base-100 shadow-sm border ${changed ? "border-warning" : "border-transparent"} ${draft.isActive ? "" : "opacity-70"}`}
    >
      <div className="card-body p-4 gap-3 flex-row max-sm:flex-col">
        {event.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={event.image}
            alt=""
            className="w-56 self-stretch min-h-40 object-cover rounded-box shrink-0 max-sm:w-full max-sm:h-48"
          />
        ) : null}
        <div className="flex flex-col gap-3 flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <input
              value={draft.title}
              onChange={(e) => onChange({ title: e.target.value })}
              maxLength={300}
              aria-label="Tytuł"
              className="input input-sm flex-1 font-semibold"
            />
            {event.sourceUrl ? (
              <a
                href={event.sourceUrl}
                target="_blank"
                title="Otwórz na Facebooku"
                className="text-sm opacity-70 hover:underline shrink-0"
              >
                #{event.id}
              </a>
            ) : (
              <span className="text-sm opacity-70 shrink-0">#{event.id}</span>
            )}
            <label className="flex items-center gap-2 cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={draft.isActive}
                onChange={(e) => onChange({ isActive: e.target.checked })}
                className="toggle toggle-sm toggle-success"
              />
              <span className="text-sm">aktywne</span>
            </label>
          </div>
          {event.submitted ? (
            <span className="badge badge-sm badge-warning badge-soft self-start">
              zgłoszone
            </span>
          ) : null}
          <div className="flex flex-wrap items-center gap-2">
            <label className="input input-sm w-auto">
              <span className="label">start</span>
              <input
                type="datetime-local"
                value={draft.startsAt}
                onChange={(e) => onChange({ startsAt: e.target.value })}
              />
            </label>
            <label className="input input-sm w-auto">
              <span className="label">koniec</span>
              <input
                type="datetime-local"
                value={draft.endsAt}
                onChange={(e) => onChange({ endsAt: e.target.value })}
              />
            </label>
            <label className="select select-sm w-auto">
              <span className="label">miejsce</span>
              <select
                value={draft.venueSlug}
                onChange={(e) => {
                  const venue = venues.find((v) => v.slug === e.target.value);
                  // Picking a tracked venue also fills in its display name.
                  onChange({
                    venueSlug: e.target.value,
                    ...(venue ? { venueName: venue.name } : {}),
                  });
                }}
              >
                <option value="">— brak —</option>
                {venues.map((v) => (
                  <option key={v.slug} value={v.slug}>
                    {v.name} ({v.slug})
                  </option>
                ))}
              </select>
            </label>
            <input
              value={draft.venueName}
              onChange={(e) => onChange({ venueName: e.target.value })}
              maxLength={200}
              placeholder="nazwa miejsca"
              aria-label="Nazwa miejsca"
              className="input input-sm w-44"
            />
          </div>
          {tags.length ? (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => {
                const on = draft.tagSlugs.includes(tag.slug);
                return (
                  <button
                    key={tag.slug}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggleTag(tag.slug)}
                    className={`badge badge-lg cursor-pointer gap-1 ${on ? "badge-neutral" : "badge-outline border-base-content/30 hover:border-base-content/60"}`}
                  >
                    {on ? <Check size={14} /> : null}
                    {tag.name} {tag.emoji}
                  </button>
                );
              })}
            </div>
          ) : null}
          <textarea
            value={draft.description}
            onChange={(e) => onChange({ description: e.target.value })}
            rows={3}
            aria-label="Opis"
            className="textarea textarea-sm w-full"
          />
        </div>
      </div>
    </div>
  );
}

export default function AdminPanel({
  events,
  tags,
  venues,
}: {
  events: AdminEvent[];
  tags: AdminTag[];
  venues: AdminVenue[];
}) {
  const router = useRouter();
  // Only rows that differ from the loaded data are kept here.
  const [drafts, setDrafts] = useState<Record<number, AdminEventDraft>>({});
  const [result, setResult] = useState<SaveResult | null>(null);
  const [saving, startSaving] = useTransition();
  const [revalidating, startRevalidating] = useTransition();
  const changedCount = Object.keys(drafts).length;

  // Warn before leaving the page with unsaved changes.
  useEffect(() => {
    if (!changedCount) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [changedCount]);

  const update = (event: AdminEvent, patch: Partial<AdminEventDraft>) => {
    setResult(null);
    setDrafts((prev) => {
      const next = { ...(prev[event.id] ?? toDraft(event)), ...patch };
      const rest = { ...prev };
      delete rest[event.id];
      return sameDraft(next, toDraft(event))
        ? rest
        : { ...rest, [event.id]: next };
    });
  };

  const revalidate = () =>
    startRevalidating(async () => {
      setResult(await revalidateSite());
    });

  const save = () =>
    startSaving(async () => {
      const res = await saveEvents(Object.values(drafts));
      setResult(res);
      if (res.ok) {
        setDrafts({});
        router.refresh();
      }
    });

  const pending = events.filter((e) => !e.isActive).length;

  return (
    <div className="w-full flex flex-col gap-4 pb-24">
      <div>
        <h1 className="text-2xl">Admin</h1>
        <p className="opacity-70">
          {events.length} nadchodzących wydarzeń, {pending} nieaktywnych.
        </p>
      </div>

      {events.map((event) => (
        <EventRow
          key={event.id}
          event={event}
          draft={drafts[event.id] ?? toDraft(event)}
          tags={tags}
          venues={venues}
          changed={event.id in drafts}
          onChange={(patch) => update(event, patch)}
        />
      ))}

      <div className="toast toast-end z-20">
        {result ? (
          <div
            role="alert"
            className={`alert alert-soft ${result.ok ? "alert-success" : "alert-error"}`}
          >
            {result.message}
          </div>
        ) : null}
        <div className="flex gap-2 self-end">
          <button
            type="button"
            onClick={revalidate}
            disabled={revalidating}
            title="Odśwież cache całej strony"
            className="btn btn-lg shadow-sm"
          >
            {revalidating ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              <RefreshCw size={20} />
            )}
            Odśwież stronę
          </button>
          <button
            type="button"
            onClick={save}
            disabled={!changedCount || saving}
            aria-label={`Zapisz zmiany (${changedCount})`}
            className="btn btn-neutral btn-lg shadow-sm"
          >
            {saving ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              <Save size={20} />
            )}
            {changedCount ? `Zapisz (${changedCount})` : "Zapisz"}
          </button>
        </div>
      </div>
    </div>
  );
}
