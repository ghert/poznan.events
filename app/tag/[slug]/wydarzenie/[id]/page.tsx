import EventDetails from "@/components/EventDetails";
import { Metadata } from "next";
import { eventMetadata } from "@/lib/eventMetadata";
import { Suspense } from "react";
import { getTags } from "@/lib/getTags";
import { getTagEvents } from "@/lib/getTagEvents";

type Params = { params: Promise<{ id: string }> };

// Prebuild every tag/event pair, so these pages are served from the CDN
// instead of rendering (and querying the DB) on each request.
export async function generateStaticParams() {
  const tags = await getTags();
  const pairs = await Promise.all(
    tags.map(async ({ slug }) =>
      (await getTagEvents(slug)).map((e) => ({ slug, id: String(e.id) })),
    ),
  );
  return pairs.flat();
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  return eventMetadata((await params).id);
}

export default async function TagEventPage({ params }: Params) {
  return (
    <>
      <Suspense
        fallback={
          <div className="my-8 justify-center flex items-center w-1/2 max-w-1/2 max-md:max-w-full max-md:w-full max-md:mb-8">
            <span className="loading loading-ring loading-xl"></span>
          </div>
        }
      >
        <EventDetails params={params} section="tag" />
      </Suspense>
    </>
  );
}
