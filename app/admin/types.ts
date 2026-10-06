import { Tag } from "@/lib/types";

// One editable row, with dates as Poznań-local datetime-local strings.
export type AdminEventDraft = {
  id: number;
  title: string;
  description: string;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  tagSlugs: string[];
  venueName: string;
  // "" when the event isn't linked to a venue in `sources`.
  venueSlug: string;
};

// What the page loads: the editable fields plus read-only context.
export type AdminEvent = AdminEventDraft & {
  image: string | null;
  sourceUrl: string;
  submitted: boolean;
};

export type AdminTag = Tag;

export type AdminVenue = { slug: string; name: string };

export type SaveResult = { ok: boolean; message: string };
