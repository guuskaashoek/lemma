"use server";
/**
 * Server actions that store learning progress. The user id always comes from
 * the session, never from the client.
 */
import { z } from "zod";
import { getLessonEntry, getUnit } from "@/content/curriculum";
import { addActivity, completeLesson, recordAttempt, recordFinalHints, recordTest, scheduleSkills } from "@/lib/progress";
import { lessonXp, REVIEW_XP_PER_EXERCISE, TEST_XP, testPassed } from "@/lib/progress-logic";
import { requireUser } from "@/lib/session";
import {
  attemptSchema,
  completeLessonSchema,
  completeReviewSchema,
  completeTestSchema,
  type AttemptInput,
} from "@/lib/validation";

const outcomesSchema = z.record(z.string().max(100), z.enum(["again", "hard", "good"]));

export async function recordAttemptAction(input: AttemptInput): Promise<void> {
  const user = await requireUser();
  const a = attemptSchema.parse(input);
  recordAttempt(user.id, {
    mode: a.mode,
    contextId: a.contextId,
    generatorId: a.generatorId,
    skillId: a.skillId,
    correct: a.correct,
    hintsUsed: a.hintsUsed,
    durationMs: a.durationMs,
    mistakeId: a.mistakeId,
  });
}

export async function recordFinalHintsAction(contextId: string, generatorId: string, hintsUsed: number): Promise<void> {
  const user = await requireUser();
  const input = z
    .object({ contextId: z.string().max(100), generatorId: z.string().max(100), hintsUsed: z.number().int().min(0).max(3) })
    .parse({ contextId, generatorId, hintsUsed });
  recordFinalHints(user.id, input.contextId, input.generatorId, input.hintsUsed);
}

export async function completeLessonAction(
  input: z.infer<typeof completeLessonSchema>,
  outcomes: Record<string, "again" | "hard" | "good">,
): Promise<{ xp: number }> {
  const user = await requireUser();
  const data = completeLessonSchema.parse(input);
  if (!getLessonEntry(data.lessonId)) throw new Error("Unknown lesson");
  const xp = lessonXp(data.correctFirstTry, data.total);
  completeLesson(user.id, data.lessonId, data.correctFirstTry / data.total, xp);
  addActivity(user.id, xp, data.seconds);
  scheduleSkills(user.id, outcomesSchema.parse(outcomes));
  return { xp };
}

export async function completeTestAction(
  input: z.infer<typeof completeTestSchema>,
  outcomes: Record<string, "again" | "hard" | "good">,
): Promise<{ passed: boolean; score: number; xp: number }> {
  const user = await requireUser();
  const data = completeTestSchema.parse(input);
  if (!getUnit(data.unitId)) throw new Error("Unknown unit");
  const score = data.correct / data.total;
  const passed = testPassed(data.mode, score);
  recordTest(user.id, data.unitId, data.mode, score, passed);
  const xp = passed ? TEST_XP : 5;
  addActivity(user.id, xp, data.seconds);
  scheduleSkills(user.id, outcomesSchema.parse(outcomes));
  return { passed, score, xp };
}

export async function completeReviewAction(
  input: z.infer<typeof completeReviewSchema>,
  outcomes: Record<string, "again" | "hard" | "good">,
): Promise<{ xp: number }> {
  const user = await requireUser();
  const data = completeReviewSchema.parse(input);
  const xp = data.total * REVIEW_XP_PER_EXERCISE;
  addActivity(user.id, xp, data.seconds);
  scheduleSkills(user.id, outcomesSchema.parse(outcomes));
  return { xp };
}
