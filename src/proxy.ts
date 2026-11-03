/**
 * Next decodes dynamic route segments itself and answers an invalid
 * percent-escape ("%ff", "%c0%af") with a bare 500 and no log line. Nothing
 * can live behind such a path, so it is simply not found.
 */
import { NextResponse, type NextRequest } from "next/server";

export function proxy(req: NextRequest) {
  try {
    decodeURIComponent(req.nextUrl.pathname);
  } catch {
    return new NextResponse("Not Found", { status: 404 });
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/lesson/:path*", "/unit/:path*", "/reset/:path*"],
};
