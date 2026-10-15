import EventDetails from "@/components/EventDetails";
import EventsList from "@/components/EventsList";
import { getEvents } from "@/lib/getEvents";
import { getWeekBoundaries } from "@/lib/getWeekBoundaries";
import { ScrapedEventFromDB } from "@/lib/types";
import { Metadata } from "next";
import { eventMetadata } from "@/lib/eventMetadata";
import { Suspense } from "react";

type Params = { params: Promise<{ id: string }> };

export async function generateStaticParams() {
  const events = await getEvents();
  return events.map((r) => ({ id: String(r.id) }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  return eventMetadata((await params).id);
}

export default async function EventPage({ params }: Params) {
  const events = await getEvents();
  const weekBoundaries = await getWeekBoundaries();
  return (
    <>
      <EventsList
        events={events as ScrapedEventFromDB[]}
        weekBoundaries={weekBoundaries}
      />
      <Suspense
        fallback={
          <div className="my-8 justify-center flex items-center w-1/2 max-w-1/2 max-md:max-w-full max-md:w-full max-md:mb-8">
            <span className="loading loading-ring loading-xl"></span>
          </div>
        }
      >
        <EventDetails params={params} />
      </Suspense>
    </>
  );
}
