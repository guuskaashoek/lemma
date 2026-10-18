/**
 * Mounts Better Auth under `/api/auth/*`, but only the few endpoints that are
 * safe to expose over HTTP.
 *
 * The app itself never calls these endpoints from the browser: logging in,
 * registering and changing a password go through server actions, which add a
 * per-e-mail limit (`src/lib/rate-limit.ts`). Better Auth's own limiter keys on
 * X-Forwarded-For, which visitors can forge behind GuusLab Jet, so leaving
 * `/sign-in/email` and friends open would allow unlimited password guessing.
 * Everything not listed here answers 404.
 */
import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";

const handler = toNextJsHandler(auth);

const ALLOWED = {
  GET: new Set(["/api/auth/ok", "/api/auth/get-session"]),
  POST: new Set(["/api/auth/sign-out"]),
};

function allowed(method: "GET" | "POST", req: Request): boolean {
  const path = new URL(req.url).pathname.replace(/\/+$/, "");
  return ALLOWED[method].has(path);
}

const notFound = () => new Response("Not Found", { status: 404 });

export async function GET(req: Request) {
  return allowed("GET", req) ? handler.GET(req) : notFound();
}

export async function POST(req: Request) {
  return allowed("POST", req) ? handler.POST(req) : notFound();
}
