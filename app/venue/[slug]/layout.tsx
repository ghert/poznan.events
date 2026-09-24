import { Suspense, type ReactNode } from "react";
import EventsListSimple from "@/components/EventsListSimple";
import { getVenues } from "@/lib/getVenues";

type Props = { children: ReactNode; params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const venues = await getVenues();
  return venues.map((v) => ({ venue: v.slug }));
}

export default async function VenueLayout({ children, params }: Props) {
  return (
    <div className="flex flex-row w-full items-start max-md:flex-col-reverse gap-4">
      <Suspense>
        <EventsListSimple params={params} />
      </Suspense>
      {children}
    </div>
  );
}
