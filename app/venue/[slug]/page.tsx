import { getVenues } from "@/lib/getVenues";

export async function generateStaticParams() {
  const venues = await getVenues();
  return venues.map((r) => ({ slug: r.slug }));
}

export default function VenuePage() {
  return <></>;
}
