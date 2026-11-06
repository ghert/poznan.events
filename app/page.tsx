import EventsList from "@/components/EventsList";
import FeaturedEvents from "@/components/FeaturedEvents";
import { NewsletterSection } from "@/components/NewsletterForm";
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
      <div className="w-1/2 max-w-1/2 max-md:max-w-full max-md:w-full max-md:mb-4 flex flex-col gap-4">
        <FeaturedEvents events={featured} />
        <NewsletterSection />
      </div>
    </>
  );
}
