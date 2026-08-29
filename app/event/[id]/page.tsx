import EventsList from "@/components/EventsList";
import { sql } from "@/lib/db";
import { getEvent } from "@/lib/getEvent";
import { ScrapedEventFromDB } from "@/lib/types";
import { tz } from "@date-fns/tz";
import { formatDate } from "date-fns";

type Params = { params: Promise<{ id: string }> };

export async function generateStaticParams() {
  const rows = await sql`
    select id from events where is_active and starts_at > now()
  `;
  return (rows as { id: string }[]).map((r) => ({ id: r.id }));
}

export async function generateMetadata({ params }: Params) {
  const { id } = await params;
  const event = await getEvent(id);
  if (!event) return { title: 'Nie znaleziono wydarzenia' };

  return {
    title: `${event.title}}`,
    description: `${event.title}, ${event.venue_name ?? 'Poznań'}.`,
    alternates: { canonical: `/event/${event.id}` },
  };
}

export default async function EventPage({ params }: Params) {
  const { id } = await params;
  const event = await getEvent(id);
  const events = await sql`
    select * from events
  `;
  return <>
    <EventsList events={events as ScrapedEventFromDB[]} />
    {event ? (
      <div className="card bg-base-100 shadow-sm w-1/2 max-w-1/2 max-md:max-w-full max-md:w-full max-md:mb-8">
        <figure className={`max-h-72 overflow-hidden`}>
          <img key={event.image} src={event.image} alt="event" />
        </figure>
        <div className="card-body">
          <div>
            <h2 className="text-2xl mb-4">{event.title}</h2>
            <div className="flex items-center gap-4 mb-4">
              <div className="badge badge-soft badge-xl">{ event.venue_name}</div>
              {event.starts_at ? <div className="badge badge-soft badge-xl">{formatDate(event.starts_at, "dd/MM/yy HH:mm", {
                in: tz('Europe/Warsaw')
              })}</div> : null}
              </div>
            </div>
          <p className="whitespace-pre-line">{event.description}</p>
        </div>
    </div>) : null}
  </>
}
