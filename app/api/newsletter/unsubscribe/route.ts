import { NextResponse } from "next/server";
import { unsubscribeToken } from "@/lib/unsubscribe";

// RFC 8058 one-click target from the List-Unsubscribe header. Mail clients POST
// here only after the user clicks "Unsubscribe", so it needs no confirmation.
export async function POST(request: Request) {
  const token = new URL(request.url).searchParams.get("token") ?? "";
  const found = await unsubscribeToken(token);
  return new NextResponse(null, { status: found ? 200 : 404 });
}
