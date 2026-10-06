/**
 * Data for the admin overview: users and simple usage statistics.
 * Only called from pages and actions guarded by `requireAdmin()`.
 */
import "server-only";
import { desc, eq, gte, sql } from "drizzle-orm";
import { db, schema } from "@/db";
import { dayKey } from "./progress-logic";

export function listUsers() {
  const a = schema.activityDays;
  return db
    .select({
      id: schema.user.id,
      name: schema.user.name,
      email: schema.user.email,
      role: schema.user.role,
      createdAt: schema.user.createdAt,
      lastActiveDay: sql<string | null>`(select max(${a.day}) from ${a} where ${a.userId} = ${schema.user.id})`,
      xp: sql<number>`(select coalesce(sum(${a.xp}), 0) from ${a} where ${a.userId} = ${schema.user.id})`,
      lessonsDone: sql<number>`(select count(*) from ${schema.lessonProgress} lp where lp.user_id = ${schema.user.id} and lp.completed_at is not null)`,
    })
    .from(schema.user)
    .orderBy(desc(schema.user.createdAt))
    .all();
}

export function usageStats() {
  const since = dayKey(new Date(Date.now() - 6 * 86_400_000));
  const sinceMs = Date.now() - 7 * 86_400_000;
  const users = db.select({ n: sql<number>`count(*)` }).from(schema.user).get()!.n;
  const active7 = db
    .select({ n: sql<number>`count(distinct ${schema.activityDays.userId})` })
    .from(schema.activityDays)
    .where(gte(schema.activityDays.day, since))
    .get()!.n;
  const answers7 = db
    .select({ n: sql<number>`count(*)` })
    .from(schema.attempts)
    .where(gte(schema.attempts.createdAt, new Date(sinceMs)))
    .get()!.n;
  const lessonsDone = db
    .select({ n: sql<number>`count(*)` })
    .from(schema.lessonProgress)
    .where(sql`${schema.lessonProgress.completedAt} is not null`)
    .get()!.n;
  return { users, active7, answers7, lessonsDone };
}

export function getUserById(id: string) {
  return db.select().from(schema.user).where(eq(schema.user.id, id)).get() ?? null;
}
