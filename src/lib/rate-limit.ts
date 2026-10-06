/**
 * Fixed-window rate limiting for server actions (login, register, reset).
 *
 * Better Auth already limits its own HTTP endpoints. Our server actions call
 * Better Auth directly on the server, so they need their own limiter. The
 * counters live in SQLite, so they survive a restart.
 */
import "server-only";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { db, schema } from "@/db";

/** Best-effort client IP (works behind a reverse proxy that sets the header). */
export async function clientIp(): Promise<string> {
  const h = await headers();
  return (
    h.get("x-forwarded-for")?.split(",")[0].trim() ||
    h.get("x-real-ip") ||
    "local"
  );
}

/**
 * Registers one hit for `key` and returns whether it is still allowed.
 * @param max      allowed hits per window
 * @param windowMs window length in milliseconds
 */
export function hit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  return db.transaction((tx) => {
    const row = tx.select().from(schema.actionRateLimits).where(eq(schema.actionRateLimits.key, key)).get();
    if (!row || now - row.windowStart >= windowMs) {
      tx.insert(schema.actionRateLimits)
        .values({ key, windowStart: now, count: 1 })
        .onConflictDoUpdate({ target: schema.actionRateLimits.key, set: { windowStart: now, count: 1 } })
        .run();
      return true;
    }
    if (row.count >= max) return false;
    tx.update(schema.actionRateLimits)
      .set({ count: row.count + 1 })
      .where(eq(schema.actionRateLimits.key, key))
      .run();
    return true;
  });
}

/** Limits per IP and per e-mail address at once; both must allow the request. */
export async function allowAuthAttempt(kind: "login" | "register" | "reset", email?: string): Promise<boolean> {
  const ip = await clientIp();
  const rules = {
    login: { ip: [20, 15 * 60_000], email: [5, 15 * 60_000] },
    register: { ip: [5, 60 * 60_000], email: [3, 60 * 60_000] },
    reset: { ip: [10, 15 * 60_000], email: [5, 15 * 60_000] },
  } as const;
  const r = rules[kind];
  const ipOk = hit(`${kind}:ip:${ip}`, r.ip[0], r.ip[1]);
  const emailOk = email ? hit(`${kind}:email:${email.toLowerCase()}`, r.email[0], r.email[1]) : true;
  return ipOk && emailOk;
}
