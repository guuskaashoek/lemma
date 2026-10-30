/**
 * Fixed-window rate limiting for server actions (login, register, reset).
 *
 * Better Auth already limits its own HTTP endpoints. Our server actions call
 * Better Auth directly on the server, so they need their own limiter. The
 * counters live in SQLite, so they survive a restart.
 */
import "server-only";
import { eq, lt } from "drizzle-orm";
import { db, schema } from "@/db";

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
 * Deletes counters whose window is long over. Made-up e-mail addresses each
 * create a row, so without this the table grows without bound.
 */
function pruneExpired(now = Date.now()) {
  if (now - lastPrune < 10 * 60_000) return;
  lastPrune = now;
  db.delete(schema.actionRateLimits).where(lt(schema.actionRateLimits.windowStart, now - MAX_WINDOW_MS)).run();
}

/** True if the current window of `key` has no hits left. Writes nothing. */
function isFull(key: string, max: number, windowMs: number): boolean {
  const row = db.select().from(schema.actionRateLimits).where(eq(schema.actionRateLimits.key, key)).get();
  return !!row && Date.now() - row.windowStart < windowMs && row.count >= max;
}

/**
 * Limits per e-mail address and in total; both must allow the request.
 *
 * There is deliberately no per-IP limit. Behind GuusLab Jet every honest visitor
 * arrives with the same proxy address and X-Forwarded-For can be forged, so an
 * IP counter would be a lower shared limit for honest visitors, and a new row per
 * request for anyone sending made-up addresses.
 */
export async function allowAuthAttempt(kind: "login" | "register" | "reset", email?: string): Promise<boolean> {
  pruneExpired();
  // Keep the total caps high enough that one attacker cannot easily lock
  // everybody out; the per-e-mail limit stops guessing one password.
  const rules = {
    login: { email: [5, 15 * 60_000], all: [300, 15 * 60_000] },
    register: { email: [3, 60 * 60_000], all: [30, 60 * 60_000] },
    reset: { email: [5, 15 * 60_000], all: [50, 15 * 60_000] },
  } as const;
  const r = rules[kind];
  // Refused before anything is written: made-up addresses cannot add rows once
  // the total is used up, so the table stays small however long a flood lasts.
  if (isFull(`${kind}:all`, r.all[0], r.all[1])) return false;
  const emailOk = email ? hit(`${kind}:email:${email.toLowerCase()}`, r.email[0], r.email[1]) : true;
  // Only requests that pass the per-e-mail limit count towards the total, so one
  // hammered address cannot use up everybody's allowance.
  return emailOk && hit(`${kind}:all`, r.all[0], r.all[1]);
}
