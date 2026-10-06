import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_REALM, isAdminAuthorization } from "@/lib/adminAuth";

export function proxy(request: NextRequest) {
  if (isAdminAuthorization(request.headers.get("authorization"))) {
    return NextResponse.next();
  }
  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": ADMIN_REALM },
  });
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
