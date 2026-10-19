/**
 * Fixed-window rate limiting for server actions (login, register, reset).
 *
 * Better Auth already limits its own HTTP endpoints. Our server actions call
 * Better Auth directly on the server, so they need their own limiter. The
 * counters live in SQLite, so they survive a restart.
 */
import "server-only";
import { eq, lt } from "drizzle-orm";
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

/** Longest window in `allowAuthAttempt`; older counters are dead weight. */
const MAX_WINDOW_MS = 60 * 60_000;
let lastPrune = 0;

/**
 * Deletes counters whose window is long over. Spoofed X-Forwarded-For values
 * and made-up e-mail addresses each create a row, so without this the table
 * grows without bound.
 */
function pruneExpired(now = Date.now()) {
  if (now - lastPrune < 10 * 60_000) return;
  lastPrune = now;
  db.delete(schema.actionRateLimits).where(lt(schema.actionRateLimits.windowStart, now - MAX_WINDOW_MS)).run();
}

/** Limits per IP, per e-mail address and in total at once; all must allow the request. */
export async function allowAuthAttempt(kind: "login" | "register" | "reset", email?: string): Promise<boolean> {
  pruneExpired();
  const ip = await clientIp();
  // Behind GuusLab Jet every honest request arrives with the same proxy address,
  // but visitors can forge X-Forwarded-For and get a fresh "ip" bucket per
  // request. The "all" bucket ignores the header, so it caps account creation
  // and password spraying across many addresses no matter what is sent. Keep
  // the caps high enough that one attacker cannot easily lock everybody out;
  // the per-e-mail limit stops guessing one password.
  const rules = {
    login: { ip: [100, 15 * 60_000], email: [5, 15 * 60_000], all: [300, 15 * 60_000] },
    register: { ip: [20, 60 * 60_000], email: [3, 60 * 60_000], all: [30, 60 * 60_000] },
    reset: { ip: [10, 15 * 60_000], email: [5, 15 * 60_000], all: [50, 15 * 60_000] },
  } as const;
  const r = rules[kind];
  const ipOk = hit(`${kind}:ip:${ip}`, r.ip[0], r.ip[1]);
  const emailOk = email ? hit(`${kind}:email:${email.toLowerCase()}`, r.email[0], r.email[1]) : true;
  // Only requests that pass the other limits count towards the total, so one
  // hammered address cannot use up everybody's allowance.
  const allOk = ipOk && emailOk ? hit(`${kind}:all`, r.all[0], r.all[1]) : true;
  return ipOk && emailOk && allOk;
}
