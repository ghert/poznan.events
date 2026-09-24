import ScrollTo from "./ScrollTo";
import { getEvent } from "@/lib/getEvent";
import { ExternalLink, X } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function EventDetails({ params }: { params: Promise<{ id: string, slug?: string }> }) {
  const { id, slug } = await params;
  const event = await getEvent(id);
  if (!event) notFound();

  const backHref = slug ? `/venue/${slug}` : '/';

  const dateFmt = new Intl.DateTimeFormat('pl-PL', {
    timeZone: 'Europe/Warsaw',
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <div className="card bg-base-100 shadow-sm w-1/2 max-w-1/2 max-md:max-w-full max-md:w-full max-md:mb-4">
      <ScrollTo trigger={id} />
      <figure className={`max-h-72 overflow-hidden relative`}>
        <Link
          href={backHref}
          aria-label="Zamknij"
          className="z-10 absolute top-3 right-3 bg-base-100/60 rounded-full p-3 active:opacity-50 backdrop-blur-md hidden max-sm:block"
        >
          <X width={16} height={16} />
        </Link>
        <img key={event.image} src={event.image} alt="Grafika wydarzenia" />
      </figure>
      <div className="card-body max-md:px-4">
        <div>
          <h2 className="text-2xl mb-4">{event.title}</h2>
          <div className="flex items-center gap-4 mb-1">
            <div className="badge badge-neutral badge-xl min-w-0">
              <span className="truncate">
                {event.venueName}
              </span>
            </div>
            {event.startsAt ? (
              <div className="badge badge-neutral badge-xl shrink-0">
                {dateFmt.format(new Date(event.startsAt))}
              </div>
            ) : null}
            </div>
        </div>
        <div>
          <a className="mb-4 inline-block group" href={event.sourceUrl} target="__blank">
            <div className="badge badge-soft badge-xl text-sm min-w-0 max-w-full">
              <span className="truncate group-hover:underline">
                {event.sourceUrl.replace("https://www.", "")}
              </span>
              <ExternalLink size="16" />
            </div>
          </a>
        </div>
        <p className="whitespace-pre-line">{event.description}</p>
      </div>
      </div>
  )
}
