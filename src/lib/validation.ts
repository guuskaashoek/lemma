/**
 * Zod schemas for every form and server action input.
 * Server actions never trust their input: everything is parsed here first.
 */
import { z } from "zod";
import { LOCALES } from "@/i18n/locale";

export const PASSWORD_MIN = 10;

const email = z.string().trim().toLowerCase().pipe(z.email().max(254));
const password = z.string().min(PASSWORD_MIN).max(128);

export const registerSchema = z.object({
  name: z.string().trim().min(1).max(80),
  email,
  password,
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1).max(128),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(20).max(200),
  password,
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(128),
  newPassword: password,
});

export const START_LEVELS = ["vmbo-kader", "vmbo-gt", "havo", "vwo", "mbo"] as const;
export const GOALS = ["refresh", "havo-b", "vwo-b", "wo-ai"] as const;

export const settingsSchema = z.object({
  locale: z.enum(LOCALES),
  startLevel: z.enum(START_LEVELS),
  goal: z.enum(GOALS),
  font: z.enum(["default", "atkinson"]),
  textSize: z.enum(["m", "l", "xl"]),
  theme: z.enum(["dark", "light"]),
  ttsEnabled: z.boolean(),
  ttsRate: z.number().min(0.5).max(1.5),
  dailyGoalXp: z.number().int().min(5).max(200),
});
export type SettingsInput = z.infer<typeof settingsSchema>;

const id = z.string().min(1).max(100).regex(/^[\w.-]+$/);

export const attemptSchema = z.object({
  mode: z.enum(["lesson", "review", "final", "testout"]),
  contextId: id,
  generatorId: id,
  skillId: id,
  correct: z.boolean(),
  hintsUsed: z.number().int().min(0).max(3),
  durationMs: z.number().int().min(0).max(60 * 60_000),
  mistakeId: id.nullable(),
  /** Only the first attempt at an exercise feeds spaced repetition. */
  firstTry: z.boolean(),
});
export type AttemptInput = z.infer<typeof attemptSchema>;

export const completeLessonSchema = z.object({
  lessonId: id,
  correctFirstTry: z.number().int().min(0).max(100),
  total: z.number().int().min(1).max(100),
  seconds: z.number().int().min(0).max(4 * 3600),
});

export const completeTestSchema = z.object({
  unitId: id,
  mode: z.enum(["final", "testout"]),
  correct: z.number().int().min(0).max(100),
  total: z.number().int().min(1).max(100),
  seconds: z.number().int().min(0).max(4 * 3600),
});

export const completeReviewSchema = z.object({
  correct: z.number().int().min(0).max(100),
  total: z.number().int().min(1).max(100),
  seconds: z.number().int().min(0).max(4 * 3600),
});
