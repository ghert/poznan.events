import EventJsonLd from "./EventJsonLd";
import ScrollTo from "./ScrollTo";
import { getEvent } from "@/lib/getEvent";
import { CalendarPlus, ExternalLink, X } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function EventDetails({
  params,
}: {
  params: Promise<{ id: string; slug?: string }>;
}) {
  const { id, slug } = await params;
  const event = await getEvent(id);
  if (!event) notFound();

  const backHref = slug ? `/venue/${slug}` : "/";

  const dateFmt = new Intl.DateTimeFormat("pl-PL", {
    timeZone: "Europe/Warsaw",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="card bg-base-100 shadow-sm w-1/2 max-w-1/2 max-md:max-w-full max-md:w-full max-md:mb-4">
      <EventJsonLd event={event} />
      <ScrollTo trigger={id} />
      <figure className={`max-h-72 overflow-hidden relative rounded-t-lg`}>
        <Link
          href={backHref}
          aria-label="Zamknij"
          className="z-10 absolute top-3 right-3 bg-base-100/60 rounded-full p-3 active:opacity-50 backdrop-blur-xs hidden max-sm:block"
        >
          <X width={16} height={16} />
        </Link>
        <img key={event.image} src={event.image} alt="Grafika wydarzenia" />
      </figure>
      <div className="card-body max-md:px-3 overflow-hidden">
        <div>
          <h2 className="text-2xl mb-4">{event.title}</h2>
          <div className="flex flex-wrap gap-x-4 gap-y-2 max-md:gap-x-2 mb-4">
            <div className="flex items-center gap-4 mb-1 max-md:gap-x-2">
              <div className="badge badge-neutral badge-xl min-w-0">
                <span className="truncate">{event.venueName}</span>
              </div>
              {event.startsAt ? (
                <div className="badge badge-neutral badge-xl shrink-0">
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
                    href={`/event/${event.id}/calendar.ics`}
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
