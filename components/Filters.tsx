"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

function Filter({
  venue,
  slug,
  enabled,
}: {
  venue: string;
  slug: string;
  enabled: boolean;
}) {
  return (
    <Link href={enabled ? `/` : `/miejsce/${slug}`}>
      <div
        className={`group px-5 py-2 relative text-nowrap shrink-0`}
        key={venue}
      >
        <span
          className={`absolute rounded-4xl inset-0 ${enabled ? "animate-squash bg-indigo-500" : " bg-slate-300 dark:bg-slate-700 group-hover:bg-indigo-300"}`}
        ></span>
        <span
          className={`relative text-nowrap whitespace-nowrap z-1 ${enabled ? "text-background dark:text-foreground" : "text-foreground dark:group-hover:text-background"}`}
        >
          {venue}
        </span>
      </div>
    </Link>
  );
}

export default function Filters({
  venues,
}: {
  venues: { name: string; slug: string }[];
}) {
  const pathname = usePathname();
  const currentVenue = pathname.match(/^\/venue\/([^/]+)/)?.[1] ?? null;

  return (
    <div className="flex gap-1 py-4 pt-2 mb-2 overflow-scroll max-sm:mx-[-16px] max-md:mx-[-32px] max-sm:px-4 max-md:px-8">
      {venues.map((item) => (
        <Filter
          key={item.slug}
          venue={item.name}
          slug={item.slug}
          enabled={item.slug === currentVenue}
        />
      ))}
    </div>
  );
}
