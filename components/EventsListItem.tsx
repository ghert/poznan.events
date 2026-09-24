"use client";
import { ScrapedEventFromDB } from "@/lib/types";
import Link from "next/link";
import { useCallback } from "react";

export default function EventsListItem(
  { event, enabled, basePath = "" }:
  {
      event: ScrapedEventFromDB,
      enabled: boolean,
      basePath?: string;
  }) {
  const dateFormat = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Warsaw', day: '2-digit', month: '2-digit',
  });

  const onClick = useCallback(() => {
    if (window.matchMedia('(min-width: 767px)').matches && window.scrollY > 256) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [])

  return <p className="text-nowrap text-ellipsis truncate active:opacity-50">
    <Link href={`${basePath}/event/${event.id}`} scroll={false} onClick={onClick}>
      <span className={`hover:underline cursor-pointer max-md:text-lg ${enabled ? "font-bold" : "none"}`} key={event.sourceId}>
        ({event.startsAt ? dateFormat.format(new Date(event.startsAt)) : ""}){" "}
        {event.title}
      </span>
    </Link>
  </p>;
}
