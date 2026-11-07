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
      {/* On mobile the column dissolves (contents) so the parent's
          flex-col-reverse puts featured above the list and, via order,
          the newsletter below it. */}
      <div className="w-1/2 max-w-1/2 flex flex-col gap-4 max-md:contents">
        <div className="max-md:w-full max-md:mb-4 empty:hidden">
          <FeaturedEvents events={featured} />
        </div>
        <div className="max-md:w-full max-md:-order-1">
          <NewsletterSection />
        </div>
      </div>
    </>
  );
}
