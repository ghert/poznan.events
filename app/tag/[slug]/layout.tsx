import { Suspense, type ReactNode } from "react";
import EventsListSimple from "@/components/EventsListSimple";
import { getTags } from "@/lib/getTags";
import { getTagEvents } from "@/lib/getTagEvents";

type Props = { children: ReactNode; params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const tags = await getTags();
  return tags.map((t) => ({ slug: t.slug }));
}

export default async function TagLayout({ children, params }: Props) {
  return (
    <div className="flex flex-row w-full items-start max-md:flex-col-reverse gap-4">
      <Suspense>
        <TagEvents params={params} />
      </Suspense>
      {children}
    </div>
  );
}

async function TagEvents({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [tags, events] = await Promise.all([getTags(), getTagEvents(slug)]);
  const tag = tags.find((t) => t.slug === slug);
  return (
    <EventsListSimple
      title={tag ? `${tag.emoji} ${tag.name}` : ""}
      events={events}
      basePath={`/tag/${slug}`}
    />
  );
}
