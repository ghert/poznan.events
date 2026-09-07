"use client";
import { SCRAPE_INPUTS } from "@/lib/sources";
import Link from "next/link";
import { usePathname } from "next/navigation";
import slugify from "slugify"


function Filter({venue, enabled}: {venue: string, enabled: boolean}) {
  return <Link href={`/venue/${slugify(venue, {lower: true})}`}>
    <div className={`badge badge-ghost rounded-2xl p-4 cursor-pointer text-nowrap hover:bg-blue-200 ${enabled ? "bg-blue-500 text-white" : ""}`} key={venue}>{venue}</div>
  </Link>;
}

export default function Filters() {
  const pathname = usePathname();
  const currentVenue = pathname.match(/^\/venue\/([^/]+)/)?.[1] ?? null;

  return (
    <div className="flex gap-1 mb-4">
      {SCRAPE_INPUTS.map(item => (<Filter key={item.venue} venue={item.venue} enabled={slugify(item.venue, {lower: true}) === currentVenue} />))}
    </div>
  )
}
