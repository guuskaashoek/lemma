/**
 * Two cheap refusals before Next does any work:
 *
 * - Next decodes dynamic route segments itself and answers an invalid
 *   percent-escape ("%ff", "%c0%af") with a bare 500 and no log line. Nothing
 *   can live behind such a path, so it is simply not found.
 * - Scanners send `Next-Action` requests with made-up ids to every page (the
 *   React2Shell class: the RSC decoder parsing the body of an action request).
 *   Lemma's own actions are always a POST with a hex id generated at build
 *   time, so anything else never reaches the action handler, and their stack
 *   traces stay out of the logs.
 */
import { NextResponse, type NextRequest } from "next/server";

const DECODED_PATHS = /^\/(lesson|unit|reset)(\/|$)/;
const ACTION_ID = /^[0-9a-f]{40,42}$/;

const notFound = () => new NextResponse("Not Found", { status: 404 });

export function proxy(req: NextRequest) {
  const action = req.headers.get("next-action");
  if (action !== null && (req.method !== "POST" || !ACTION_ID.test(action))) return notFound();
  if (DECODED_PATHS.test(req.nextUrl.pathname)) {
    try {
      decodeURIComponent(req.nextUrl.pathname);
    } catch {
      return notFound();
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg|apple-icon.png).*)"],
};
