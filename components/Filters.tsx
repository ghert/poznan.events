"use client";
import { SCRAPE_INPUTS } from "@/lib/sources";
import Link from "next/link";
import { usePathname } from "next/navigation";
import slugify from "slugify"


function Filter({venue, enabled}: {venue: string, enabled: boolean}) {
  return <Link href={`/venue/${slugify(venue, {lower: true})}`}>
    <div className={`group px-5 py-2 relative text-nowrap shrink-0`} key={venue}>
      <span className={`absolute rounded-4xl inset-0 ${enabled ? "animate-squash bg-indigo-500" : " bg-slate-300 dark:bg-slate-700 group-hover:bg-indigo-300"}`}></span>
      <span className={`relative text-nowrap whitespace-nowrap z-1 ${enabled ? "text-background dark:text-foreground" : "text-foreground dark:group-hover:text-background"}`}>{venue}</span>
    </div>
  </Link>;
}

export default function Filters() {
  const pathname = usePathname();
  const currentVenue = pathname.match(/^\/venue\/([^/]+)/)?.[1] ?? null;

  return (
    <div className="flex gap-1 py-4 pt-2 mb-2 overflow-scroll max-sm:mx-[-16px] max-md:mx-[-32px] max-sm:px-4 max-md:px-8">
      {SCRAPE_INPUTS.map(item => (<Filter key={item.venue} venue={item.venue} enabled={slugify(item.venue, {lower: true}) === currentVenue} />))}
    </div>
  )
}
