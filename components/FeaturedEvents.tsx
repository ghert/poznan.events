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
    <div className="w-1/2 max-w-1/2 max-md:max-w-full max-md:w-full max-md:mb-4">
      <div className="grid gap-4 max-md:grid-cols-2 max-md:gap-2">
        {withImages.map((event) => (
          <Link
            key={event.sourceId}
            href={`/wydarzenie/${event.id}`}
            className="group relative block rounded-md overflow-hidden active:opacity-50"
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
