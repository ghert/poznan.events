import { ScrapedEventFromDB } from "@/lib/types";
import Link from "next/link";

export default function FeaturedEvents({
  events,
}: {
  events: ScrapedEventFromDB[];
}) {
  const withImages = events.filter((event) => event.image);
  if (!withImages.length) return null;

  return (
    <div>
      <h3 className="text-2xl mb-1">Nasz wybór</h3>
      <div className="grid gap-4 max-md:flex max-md:gap-2 max-md:overflow-x-auto max-md:snap-x max-md:snap-mandatory max-md:-mx-8 max-md:px-8 max-md:scroll-px-8 max-sm:-mx-4 max-sm:px-4 max-sm:scroll-px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {withImages.map((event) => (
          <Link
            key={event.sourceId}
            href={`/wydarzenie/${event.id}`}
            className="group relative block rounded-md overflow-hidden active:opacity-50 max-md:shrink-0 max-md:w-4/5 max-md:snap-start"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={event.image}
              alt={event.title}
              className="block w-full aspect-[5/2] max-md:aspect-video object-cover"
            />
            <div className="absolute inset-0 flex items-end p-4 bg-linear-to-t from-black/70 to-transparent opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
              <span className="text-xl text-white line-clamp-2">
                {event.title}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
