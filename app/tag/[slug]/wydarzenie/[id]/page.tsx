import EventDetails from "@/components/EventDetails";
import { Metadata } from "next";
import { eventMetadata } from "@/lib/eventMetadata";
import { Suspense } from "react";

type Params = { params: Promise<{ id: string }> };

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
