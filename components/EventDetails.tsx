import EventJsonLd from "./EventJsonLd";
import ScrollTo from "./ScrollTo";
import { getEvent } from "@/lib/getEvent";
import { CalendarPlus, ExternalLink, X } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function EventDetails({
  params,
  section,
}: {
  params: Promise<{ id: string; slug?: string }>;
  // Which list the details are opened from (/miejsce/[slug] or /tag/[slug]);
  // omitted on the main list.
  section?: "miejsce" | "tag";
}) {
  const { id, slug } = await params;
  const event = await getEvent(id);
  if (!event) notFound();

  const backHref = section && slug ? `/${section}/${slug}` : "/";

  const dateFmt = new Intl.DateTimeFormat("pl-PL", {
    timeZone: "Europe/Warsaw",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="bg-base-100 shadow-none rounded-md w-1/2 max-w-1/2 max-md:max-w-full max-md:w-full max-md:mb-4">
      <EventJsonLd event={event} />
      <ScrollTo trigger={id} />
      <figure
        className={`max-h-72 overflow-hidden relative rounded-t-md ${event.image ? "" : "hidden max-sm:block h-16 border-base-300 border border-b-0"}`}
      >
        <Link
          href={backHref}
          aria-label="Zamknij"
          className="z-10 absolute top-3 right-3 bg-base-100/60 rounded-full p-3 active:opacity-50 backdrop-blur-xs hidden max-sm:block"
        >
          <X width={16} height={16} />
        </Link>
        {event.image ? (
          <img key={event.image} src={event.image} alt="Grafika wydarzenia" />
        ) : null}
      </figure>
      <div
        className={`card-body max-md:px-3 dark:bg-neutral-900 rounded-b-md overflow-hidden border-base-300 border ${event.image ? "border-t-0" : "rounded-t-md max-sm:rounded-t-none max-sm:border-t-0"}`}
      >
        <div>
          <h2 className="text-2xl mb-4">{event.title}</h2>
          <div className="flex flex-wrap gap-x-4 gap-y-2 max-md:gap-x-2 mb-4">
            <div className="flex items-center gap-4 mb-1 max-md:gap-x-2">
              {event.venueSlug ? (
                <Link
                  href={`/miejsce/${event.venueSlug}`}
                  className="badge badge-neutral badge-xl min-w-0 active:opacity-50 hover:opacity-70"
                >
                  <span className="truncate">{event.venueName}</span>
                </Link>
              ) : (
                <div className="badge badge-neutral  badge-xl min-w-0">
                  <span className="truncate">{event.venueName}</span>
                </div>
              )}
              {event.startsAt ? (
                <div className="badge badge-soft badge-xl shrink-0">
                  {dateFmt.format(new Date(event.startsAt))}
                </div>
              ) : null}
            </div>
            <div className="join">
              {event.sourceUrl ? (
                <div className="md:tooltip" data-tip="Otwórz na fb">
                  <a
                    className="btn btn-sm btn-soft min-w-0 max-w-full"
                    href={event.sourceUrl}
                    target="__blank"
                  >
                    <ExternalLink size="16" />
                  </a>
                </div>
              ) : null}
              {event.startsAt ? (
                <div className="md:tooltip" data-tip="Dodaj do kalendarza">
                  <a
                    className="btn btn-sm btn-soft"
                    href={`/wydarzenie/${event.id}/calendar.ics`}
                    download
                  >
                    <CalendarPlus size="16" />
                  </a>
                </div>
              ) : null}
            </div>
          </div>
        </div>
        <p className="whitespace-pre-line wrap-break-word">
          {event.description}
        </p>
      </div>
    </div>
  );
}
