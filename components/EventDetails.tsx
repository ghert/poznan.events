import ScrollTo from "./ScrollTo";
import { getEvent } from "@/lib/getEvent";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import { notFound } from "next/navigation";

export default async function EventDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await getEvent(id);
  if (!event) notFound();

  const dateFmt = new Intl.DateTimeFormat('pl-PL', {
    timeZone: 'Europe/Warsaw',
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <div className="card bg-base-100 shadow-sm w-1/2 max-w-1/2 max-md:max-w-full max-md:w-full max-md:mb-8">
      <ScrollTo trigger={id} />
      <figure className={`max-h-72 overflow-hidden`}>
        <img key={event.image} src={event.image} alt="event" />
      </figure>
      <div className="card-body max-md:px-4">
        <div>
          <h2 className="text-2xl mb-4">{event.title}</h2>
          <div className="flex items-center gap-4 mb-1">
            <div className="badge badge-neutral badge-xl min-w-0">
              <span className="truncate">
                {event.venue_name}
              </span>
            </div>
            {event.starts_at ? (
              <div className="badge badge-neutral badge-xl shrink-0">
                {dateFmt.format(new Date(event.starts_at))}
              </div>
            ) : null}
            </div>
        </div>
        <div>
          <a className="mb-4 flex" href={event.source_url}>
            <div className="badge badge-soft badge-xl text-sm min-w-0 max-w-full">
              <span className="truncate">
                {event.source_url.replace("https://www.", "")}
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
