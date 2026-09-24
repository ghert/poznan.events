import EventDetails from "@/components/EventDetails";
import { getEvent } from "@/lib/getEvent";
import { Metadata } from "next";
import { Suspense } from "react";

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const event = await getEvent(id);
  if (!event) return { title: 'Nie znaleziono wydarzenia' };

  return {
    title: `${event.title}`,
    description: `${event.title}, ${event.venueName ?? 'Poznań'}.`,
    alternates: { canonical: `/event/${event.id}` },
  };
}

export default async function VenueEventPage({ params }: Params) {
  return <>
    <Suspense fallback={
      <div className="my-8 justify-center flex items-center w-1/2 max-w-1/2 max-md:max-w-full max-md:w-full max-md:mb-8"><span className="loading loading-ring loading-xl"></span></div>}>
      <EventDetails params={params} />
    </Suspense>
  </>
}
