import EventDetails from "@/components/EventDetails";
import EventsList from "@/components/EventsList";
import { sql } from "@/lib/db";
import { getEvent } from "@/lib/getEvent";
import { getEvents } from "@/lib/getEvents";
import { getWeekBoundaries } from "@/lib/getWeekBoundaries";
import { ScrapedEventFromDB } from "@/lib/types";
import { Metadata } from "next";
import { Suspense } from "react";

type Params = { params: Promise<{ id: string }> };

export async function generateStaticParams() {
  const rows = await sql`
    select id from events where is_active and starts_at > now()
  `;
  return (rows as { id: string }[]).map((r) => ({ id: r.id }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const event = await getEvent(id);
  if (!event) return { title: 'Nie znaleziono wydarzenia' };

  return {
    title: `${event.title}`,
    description: `${event.title}, ${event.venue_name ?? 'Poznań'}.`,
    alternates: { canonical: `/event/${event.id}` },
  };
}

export default async function EventPage({ params }: Params) {
  const events = await getEvents();
  const weekBoundaries = await getWeekBoundaries();
  return <>
    <EventsList events={events as ScrapedEventFromDB[]} weekBoundaries={weekBoundaries} />
    <Suspense fallback={
       <div className="my-8 justify-center flex items-center w-1/2 max-w-1/2 max-md:max-w-full max-md:w-full max-md:mb-8"><span className="loading loading-ring loading-xl"></span></div>}>
      <EventDetails params={params} />
    </Suspense>
  </>
}
