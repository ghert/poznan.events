"use client";
import { SCRAPE_INPUTS } from "@/lib/sources";
import Link from "next/link";
import { usePathname } from "next/navigation";
import slugify from "slugify"


function Filter({venue, enabled}: {venue: string, enabled: boolean}) {
  return <Link href={`/venue/${slugify(venue, {lower: true})}`}>
    <div className={`badge badge-ghost badge-lg py-5 rounded-4xl p-4 cursor-pointer text-nowrap dark:hover:bg-indigo-900 hover:bg-indigo-200 ${enabled ? "bg-indigo-500 text-white" : ""}`} key={venue}>{venue}</div>
  </Link>;
}

export default function Filters() {
  const pathname = usePathname();
  const currentVenue = pathname.match(/^\/venue\/([^/]+)/)?.[1] ?? null;

  return (
    <div className="flex gap-1 py-4 mb-2 overflow-scroll max-w-full">
      {SCRAPE_INPUTS.map(item => (<Filter key={item.venue} venue={item.venue} enabled={slugify(item.venue, {lower: true}) === currentVenue} />))}
    </div>
  )
}
