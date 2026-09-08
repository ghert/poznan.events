import { getVenues } from "@/lib/getVenues";
import { Metadata } from "next";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const venues = await getVenues();
  const venue = venues.find(item => item.slug === slug);
  if (!venue) return { title: 'Nie znaleziono strony klubu' };

  return {
    title: `${venue.name} | poznan.events`,
    description: `Wydarzenia muzyczne w ${venue.name} Poznań`,
  };
}

export async function generateStaticParams() {
  const venues = await getVenues();
  return venues.map((r) => ({ slug: r.slug }));
}

export default function VenuePage() {
  return <></>;
}
