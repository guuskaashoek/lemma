/**
 * Progress storage: lessons, tests, attempts, XP, streaks and the
 * spaced-repetition schedule. Every function takes the user id explicitly;
 * callers get it from `requireUser()`, never from the client.
 */
import "server-only";
import { and, asc, desc, eq, gte, lte, sql } from "drizzle-orm";
import { createEmptyCard, fsrs, Rating, type Card, type Grade } from "ts-fsrs";
import { db, schema } from "@/db";
import { SKILLS, UNITS } from "@/content/curriculum";
import {
  buildRoadmap,
  computeStreak,
  dayKey,
  type SkillOutcome,
  type UnitProgressRow,
} from "./progress-logic";

// Intervals in whole days; same-day learning steps are not needed here.
const scheduler = fsrs({ enable_short_term: false, enable_fuzz: true });

const RATING: Record<SkillOutcome, Grade> = {
  again: Rating.Again,
  hard: Rating.Hard,
  good: Rating.Good,
};

// ---------------------------------------------------------------------------
// Reading
// ---------------------------------------------------------------------------

export function getRoadmap(userId: string) {
  const done = db
    .select({ lessonId: schema.lessonProgress.lessonId })
    .from(schema.lessonProgress)
    .where(and(eq(schema.lessonProgress.userId, userId), sql`${schema.lessonProgress.completedAt} IS NOT NULL`))
    .all();
  const units = db.select().from(schema.unitProgress).where(eq(schema.unitProgress.userId, userId)).all();
  const unitRows = new Map<string, UnitProgressRow>(units.map((u) => [u.unitId, u]));
  return buildRoadmap(UNITS, new Set(done.map((d) => d.lessonId)), unitRows);
}

/** Streak, XP today and the daily goal for the header. */
export function getDailySummary(userId: string, dailyGoalXp: number) {
  const today = dayKey(new Date());
  const days = db
    .select({ day: schema.activityDays.day, xp: schema.activityDays.xp })
    .from(schema.activityDays)
    .where(and(eq(schema.activityDays.userId, userId), sql`${schema.activityDays.xp} > 0`))
    .orderBy(desc(schema.activityDays.day))
    .limit(400)
    .all();
  const xpToday = days.find((d) => d.day === today)?.xp ?? 0;
  return { streak: computeStreak(days.map((d) => d.day), today), xpToday, dailyGoalXp };
}

/** Number of skills whose review is due. */
export function countDueSkills(userId: string): number {
  const row = db
    .select({ n: sql<number>`count(*)` })
    .from(schema.reviewCards)
    .where(and(eq(schema.reviewCards.userId, userId), lte(schema.reviewCards.due, new Date())))
    .get();
  return row?.n ?? 0;
}

/** Due skills, most overdue first, limited to known skills. */
export function getDueSkills(userId: string, limit = 5) {
  const known = new Set(SKILLS.map((s) => s.id));
  return db
    .select()
    .from(schema.reviewCards)
    .where(and(eq(schema.reviewCards.userId, userId), lte(schema.reviewCards.due, new Date())))
    .orderBy(asc(schema.reviewCards.due))
    .all()
    .filter((c) => known.has(c.skillId))
    .slice(0, limit);
}

/** Accuracy per skill, used for statistics and "weak topics". */
export function getSkillStats(userId: string) {
  return db
    .select({
      skillId: schema.attempts.skillId,
      answers: sql<number>`count(*)`,
      correct: sql<number>`sum(case when ${schema.attempts.correct} then 1 else 0 end)`,
      withHints: sql<number>`sum(case when ${schema.attempts.hintsUsed} > 0 then 1 else 0 end)`,
    })
    .from(schema.attempts)
    .where(eq(schema.attempts.userId, userId))
    .groupBy(schema.attempts.skillId)
    .all();
}

export function getStats(userId: string) {
  const totals = db
    .select({
      answers: sql<number>`count(*)`,
      correct: sql<number>`coalesce(sum(case when ${schema.attempts.correct} then 1 else 0 end), 0)`,
      withHints: sql<number>`coalesce(sum(case when ${schema.attempts.hintsUsed} > 0 then 1 else 0 end), 0)`,
    })
    .from(schema.attempts)
    .where(eq(schema.attempts.userId, userId))
    .get()!;
  const activity = db
    .select({
      xp: sql<number>`coalesce(sum(${schema.activityDays.xp}), 0)`,
      seconds: sql<number>`coalesce(sum(${schema.activityDays.secondsPracticed}), 0)`,
    })
    .from(schema.activityDays)
    .where(eq(schema.activityDays.userId, userId))
    .get()!;
  const lessonsDone = db
    .select({ n: sql<number>`count(*)` })
    .from(schema.lessonProgress)
    .where(and(eq(schema.lessonProgress.userId, userId), sql`${schema.lessonProgress.completedAt} IS NOT NULL`))
    .get()!.n;
  const since = dayKey(new Date(Date.now() - 13 * 86_400_000));
  const last14 = db
    .select({ day: schema.activityDays.day, xp: schema.activityDays.xp })
    .from(schema.activityDays)
    .where(and(eq(schema.activityDays.userId, userId), gte(schema.activityDays.day, since)))
    .all();
  // The last 14 calendar days, oldest first, including days without XP.
  const byDay = new Map(last14.map((d) => [d.day, d.xp]));
  const days = Array.from({ length: 14 }, (_, i) => {
    const day = dayKey(new Date(Date.now() - (13 - i) * 86_400_000));
    return { day, xp: byDay.get(day) ?? 0 };
  });
  return { ...totals, ...activity, lessonsDone, days, skills: getSkillStats(userId) };
}

// ---------------------------------------------------------------------------
// Writing
// ---------------------------------------------------------------------------

export type AttemptRecord = {
  mode: "lesson" | "review" | "final" | "testout";
  contextId: string;
  generatorId: string;
  skillId: string;
  correct: boolean;
  hintsUsed: number;
  durationMs: number;
  mistakeId: string | null;
};

export function recordAttempt(userId: string, a: AttemptRecord) {
  db.insert(schema.attempts).values({ userId, ...a }).run();
}

/**
 * Hints opened after the last answer (e.g. "show the solution") are added to
 * the most recent attempt for that exercise, so hint statistics stay honest.
 */
export function recordFinalHints(userId: string, contextId: string, generatorId: string, hintsUsed: number) {
  const a = schema.attempts;
  db.update(a)
    .set({ hintsUsed: sql`max(${a.hintsUsed}, ${hintsUsed})` })
    .where(
      sql`${a.id} = (select max(id) from ${a} where ${a.userId} = ${userId} and ${a.contextId} = ${contextId} and ${a.generatorId} = ${generatorId})`,
    )
    .run();
}

/** Adds XP and practice time to today's activity row. */
export function addActivity(userId: string, xp: number, seconds: number) {
  const day = dayKey(new Date());
  db.insert(schema.activityDays)
    .values({ userId, day, xp, secondsPracticed: seconds })
    .onConflictDoUpdate({
      target: [schema.activityDays.userId, schema.activityDays.day],
      set: {
        xp: sql`${schema.activityDays.xp} + ${xp}`,
        secondsPracticed: sql`${schema.activityDays.secondsPracticed} + ${seconds}`,
      },
    })
    .run();
}

export function completeLesson(userId: string, lessonId: string, score: number, xp: number) {
  const now = new Date();
  db.insert(schema.lessonProgress)
    .values({ userId, lessonId, completedAt: now, timesCompleted: 1, bestScore: score, xpEarned: xp, updatedAt: now })
    .onConflictDoUpdate({
      target: [schema.lessonProgress.userId, schema.lessonProgress.lessonId],
      set: {
        completedAt: sql`coalesce(${schema.lessonProgress.completedAt}, ${now.getTime()})`,
        timesCompleted: sql`${schema.lessonProgress.timesCompleted} + 1`,
        bestScore: sql`max(${schema.lessonProgress.bestScore}, ${score})`,
        xpEarned: sql`${schema.lessonProgress.xpEarned} + ${xp}`,
        updatedAt: now,
      },
    })
    .run();
}

export function recordTest(userId: string, unitId: string, mode: "final" | "testout", score: number, passed: boolean) {
  const now = new Date();
  const existing = db
    .select()
    .from(schema.unitProgress)
    .where(and(eq(schema.unitProgress.userId, userId), eq(schema.unitProgress.unitId, unitId)))
    .get();
  const row = {
    userId,
    unitId,
    bestFinalScore: Math.max(existing?.bestFinalScore ?? 0, mode === "final" ? score : 0),
    finalPassedAt: existing?.finalPassedAt ?? (mode === "final" && passed ? now : null),
    bestTestOutScore: Math.max(existing?.bestTestOutScore ?? 0, mode === "testout" ? score : 0),
    testedOutAt: existing?.testedOutAt ?? (mode === "testout" && passed ? now : null),
    updatedAt: now,
  };
  db.insert(schema.unitProgress)
    .values(row)
    .onConflictDoUpdate({ target: [schema.unitProgress.userId, schema.unitProgress.unitId], set: row })
    .run();
}

/** Applies one spaced-repetition review per skill. */
export function scheduleSkills(userId: string, outcomes: Record<string, SkillOutcome>) {
  const now = new Date();
  const known = new Set(SKILLS.map((s) => s.id));
  for (const [skillId, outcome] of Object.entries(outcomes)) {
    if (!known.has(skillId)) continue;
    const row = db
      .select()
      .from(schema.reviewCards)
      .where(and(eq(schema.reviewCards.userId, userId), eq(schema.reviewCards.skillId, skillId)))
      .get();
    const card: Card = row
      ? {
          due: row.due,
          stability: row.stability,
          difficulty: row.difficulty,
          elapsed_days: row.elapsedDays,
          scheduled_days: row.scheduledDays,
          learning_steps: row.learningSteps,
          reps: row.reps,
          lapses: row.lapses,
          state: row.state,
          last_review: row.lastReview ?? undefined,
        }
      : createEmptyCard(now);
    const next = scheduler.next(card, now, RATING[outcome]).card;
    const values = {
      userId,
      skillId,
      due: next.due,
      stability: next.stability,
      difficulty: next.difficulty,
      elapsedDays: next.elapsed_days,
      scheduledDays: next.scheduled_days,
      learningSteps: next.learning_steps,
      reps: next.reps,
      lapses: next.lapses,
      state: next.state,
      lastReview: next.last_review ?? now,
    };
    db.insert(schema.reviewCards)
      .values(values)
      .onConflictDoUpdate({ target: [schema.reviewCards.userId, schema.reviewCards.skillId], set: values })
      .run();
  }
}
