/**
 * Pure progress rules: unlocking, XP, streaks and spaced-repetition ratings.
 *
 * No database access here, so every rule is easy to unit test. The database
 * layer (`progress.ts`) feeds these functions with rows.
 */
import { FINAL_PASS, TEST_OUT_PASS } from "@/content/curriculum";
import type { Unit } from "@/content/types";

/** All "calendar day" logic uses Dutch time. */
export const TIME_ZONE = "Europe/Amsterdam";

/** `YYYY-MM-DD` for a moment, in Dutch time. */
export function dayKey(date: Date, timeZone = TIME_ZONE): string {
  // en-CA formats dates as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}

/** The day before a `YYYY-MM-DD` key. */
export function previousDay(key: string): string {
  const d = new Date(`${key}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

/**
 * Current streak in days. A streak is still alive today if the last active
 * day was today or yesterday (you have until midnight to keep it).
 */
export function computeStreak(activeDays: Iterable<string>, today: string): number {
  const days = new Set(activeDays);
  let cursor = days.has(today) ? today : previousDay(today);
  let streak = 0;
  while (days.has(cursor)) {
    streak++;
    cursor = previousDay(cursor);
  }
  return streak;
}

/** XP for a finished lesson. Hints never cost XP: mistakes are part of learning. */
export function lessonXp(correctFirstTry: number, total: number): number {
  return 10 + Math.min(correctFirstTry, total);
}

export const TEST_XP = 20;
export const REVIEW_XP_PER_EXERCISE = 2;

export type LessonState = "done" | "next" | "locked";
export type UnitState = "planned" | "locked" | "available" | "passed" | "skipped";

export type UnitProgressRow = {
  unitId: string;
  finalPassedAt: Date | null;
  testedOutAt: Date | null;
  bestFinalScore: number;
  bestTestOutScore: number;
};

export type RoadmapUnit = {
  unit: Unit;
  state: UnitState;
  lessons: Array<{ id: string; state: LessonState }>;
  lessonsDone: number;
  /** All lessons done, so the final test may be taken. */
  finalTestOpen: boolean;
  bestFinalScore: number;
  bestTestOutScore: number;
};

/**
 * Computes the state of every unit and lesson.
 *
 * - Unit 0 is always open.
 * - Unit n opens when unit n-1 is passed (final >= 80%) or skipped (test out >= 90%).
 *   Units that are still "planned" (not built) are stepped over.
 * - Lessons inside an open unit open one after another.
 */
export function buildRoadmap(
  units: Unit[],
  completedLessons: Set<string>,
  unitRows: Map<string, UnitProgressRow>,
): RoadmapUnit[] {
  const result: RoadmapUnit[] = [];
  let previousCleared = true;

  for (const unit of units) {
    const row = unitRows.get(unit.id);
    const passed = !!row?.finalPassedAt;
    const skipped = !passed && !!row?.testedOutAt;
    const open: boolean = previousCleared;

    let state: UnitState;
    if (unit.status === "planned") state = "planned";
    else if (passed) state = "passed";
    else if (skipped) state = "skipped";
    else state = open ? "available" : "locked";

    let nextAssigned = false;
    const lessons = unit.lessons.map((l) => {
      if (completedLessons.has(l.id)) return { id: l.id, state: "done" as const };
      if (state !== "locked" && state !== "planned" && !nextAssigned) {
        nextAssigned = true;
        return { id: l.id, state: "next" as const };
      }
      // Lessons of a passed or skipped unit stay open for practice.
      if (state === "passed" || state === "skipped") return { id: l.id, state: "next" as const };
      return { id: l.id, state: "locked" as const };
    });
    const lessonsDone = lessons.filter((l) => l.state === "done").length;

    result.push({
      unit,
      state,
      lessons,
      lessonsDone,
      finalTestOpen: state !== "locked" && state !== "planned" && lessonsDone === unit.lessons.length,
      bestFinalScore: row?.bestFinalScore ?? 0,
      bestTestOutScore: row?.bestTestOutScore ?? 0,
    });
    // A unit that is not built yet never blocks the units after it.
    if (unit.status !== "planned") previousCleared = state === "passed" || state === "skipped";
  }
  return result;
}

/** Did a test score pass? */
export function testPassed(mode: "final" | "testout", score: number): boolean {
  // Small epsilon so 8/10 counts as exactly 80%.
  return score + 1e-9 >= (mode === "final" ? FINAL_PASS : TEST_OUT_PASS);
}

export type SkillOutcome = "again" | "hard" | "good";

/**
 * Turns how an exercise went into a spaced-repetition rating:
 * - wrong first try, or needed the full solution (hint 3) → again
 * - correct with hint 1 or 2 → hard
 * - correct without hints → good
 */
export function outcomeFor(correctFirstTry: boolean, hintsUsed: number): SkillOutcome {
  if (!correctFirstTry || hintsUsed >= 3) return "again";
  if (hintsUsed > 0) return "hard";
  return "good";
}

/** Combines several outcomes for one skill in one session: the worst counts. */
export function worstOutcome(outcomes: SkillOutcome[]): SkillOutcome {
  if (outcomes.includes("again")) return "again";
  if (outcomes.includes("hard")) return "hard";
  return "good";
}
