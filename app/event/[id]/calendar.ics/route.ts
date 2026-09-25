import { getEvent } from "@/lib/getEvent";
import { buildIcs } from "@/lib/ics";
import slugify from "slugify";

export async function GET(
  _request: Request,
  { params }: RouteContext<"/event/[id]/calendar.ics">,
) {
  const { id } = await params;
  const event = await getEvent(id);
  if (!event || !event.startsAt) {
    return new Response("Not found", { status: 404 });
  }

  const filename =
    slugify(event.title, { lower: true, strict: true }) || `event-${id}`;

  return new Response(buildIcs({ ...event, startsAt: event.startsAt }), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}.ics"`,
    },
  });
}
