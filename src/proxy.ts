import { NextResponse, type NextRequest } from "next/server";

/**
 * Optimistic route protection: without a refresh-token cookie the user cannot be logged in,
 * so we redirect before rendering. Real authorization is always enforced by the API.
 */
export function proxy(request: NextRequest) {
  const hasSession = request.cookies.has("sm_refresh");
  if (!hasSession) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
