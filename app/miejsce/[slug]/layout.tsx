import { Suspense, type ReactNode } from "react";
import EventsListSimple from "@/components/EventsListSimple";
import { getVenues } from "@/lib/getVenues";
import { getVenueEvents } from "@/lib/getVenueEvents";

type Props = { children: ReactNode; params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const venues = await getVenues();
  return venues.map((v) => ({ venue: v.slug }));
}

export default async function VenueLayout({ children, params }: Props) {
  return (
    <div className="flex flex-row w-full items-start max-md:flex-col-reverse gap-4">
      <Suspense>
        <VenueEvents params={params} />
      </Suspense>
      {children}
    </div>
  );
}

async function VenueEvents({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [venues, events] = await Promise.all([
    getVenues(),
    getVenueEvents(slug),
  ]);
  const venue = venues.find((v) => v.slug === slug);
  return (
    <EventsListSimple
      title={venue?.name ?? ""}
      events={events}
      basePath={`/miejsce/${slug}`}
    />
  );
}
