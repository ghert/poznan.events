import { getTags } from "@/lib/getTags";
import { Metadata } from "next";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const tags = await getTags();
  const tag = tags.find((item) => item.slug === slug);
  if (!tag) return { title: "Nie znaleziono tagu" };

  return {
    title: `${tag.emoji} ${tag.name} | poznan.events`,
    description: `${tag.name}: wydarzenia w Poznaniu`,
  };
}

export async function generateStaticParams() {
  const tags = await getTags();
  return tags.map((t) => ({ slug: t.slug }));
}

export default function TagPage() {
  return <></>;
}
