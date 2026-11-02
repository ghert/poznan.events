import EventsList from "@/components/EventsList";
import FeaturedEvents from "@/components/FeaturedEvents";
import { ScrapedEventFromDB } from "@/lib/types";
import { getEvents } from "@/lib/getEvents";
import { getFeaturedEvents } from "@/lib/getFeaturedEvents";
import { getWeekBoundaries } from "@/lib/getWeekBoundaries";

export default async function Home() {
  const [events, featured, weekBoundaries] = await Promise.all([
    getEvents(),
    getFeaturedEvents(),
    getWeekBoundaries(),
  ]);
  return (
    <>
      <EventsList
        events={events as ScrapedEventFromDB[]}
        weekBoundaries={weekBoundaries}
      />
      <FeaturedEvents events={featured} />
    </>
  );
}
