/**
 * Database schema for Lemma.
 *
 * Two groups of tables live here:
 *
 * 1. Auth tables (`user`, `session`, `account`, `verification`, `rateLimit`)
 *    in the exact shape Better Auth expects. We only store a name, an e-mail
 *    address and a password hash. Nothing else about a person.
 * 2. Learning tables: settings, progress, every answer, the spaced-repetition
 *    schedule and daily activity.
 *
 * Every learning table references `user.id` with `ON DELETE CASCADE`, so when
 * a user deletes their account all of their data disappears with it.
 */
import { sql } from "drizzle-orm";
import {
  index,
  integer,
  primaryKey,
  real,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

/** Shorthand for a millisecond timestamp column that defaults to "now". */
const createdAt = () =>
  integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`);

// ---------------------------------------------------------------------------
// Better Auth tables
// ---------------------------------------------------------------------------

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .notNull()
    .default(false),
  image: text("image"),
  createdAt: createdAt(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
  // Added by the Better Auth admin plugin.
  role: text("role").default("user"),
  banned: integer("banned", { mode: "boolean" }).default(false),
  banReason: text("ban_reason"),
  banExpires: integer("ban_expires", { mode: "timestamp_ms" }),
});

export const session = sqliteTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    token: text("token").notNull().unique(),
    createdAt: createdAt(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    impersonatedBy: text("impersonated_by"),
  },
  (t) => [index("session_user_idx").on(t.userId)],
);

export const account = sqliteTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: integer("access_token_expires_at", {
      mode: "timestamp_ms",
    }),
    refreshTokenExpiresAt: integer("refresh_token_expires_at", {
      mode: "timestamp_ms",
    }),
    scope: text("scope"),
    // Hashed by Better Auth (scrypt). The plain password is never stored.
    password: text("password"),
    createdAt: createdAt(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (t) => [index("account_user_idx").on(t.userId)],
);

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
  createdAt: createdAt(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
});

/** Used by Better Auth's built-in rate limiter on `/api/auth/*`. */
export const rateLimit = sqliteTable("rate_limit", {
  id: text("id").primaryKey(),
  key: text("key").notNull().unique(),
  count: integer("count").notNull(),
  lastRequest: integer("last_request").notNull(),
});

// ---------------------------------------------------------------------------
// Lemma tables
// ---------------------------------------------------------------------------

/**
 * Preferences chosen during onboarding. All of them can be changed later on
 * the settings page.
 */
export const userSettings = sqliteTable("user_settings", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  locale: text("locale", { enum: ["nl", "en"] }).notNull().default("nl"),
  /** Self-reported starting point, only used to tailor suggestions. */
  startLevel: text("start_level").notNull().default("vmbo-kader"),
  /** Learning goal, e.g. "vwo-b" or "wo-ai". */
  goal: text("goal").notNull().default("wo-ai"),
  font: text("font", { enum: ["default", "atkinson"] })
    .notNull()
    .default("atkinson"),
  textSize: text("text_size", { enum: ["m", "l", "xl"] })
    .notNull()
    .default("l"),
  theme: text("theme", { enum: ["dark", "light"] }).notNull().default("dark"),
  ttsEnabled: integer("tts_enabled", { mode: "boolean" })
    .notNull()
    .default(true),
  /** Speech rate for read-aloud, 0.5 - 1.5. */
  ttsRate: real("tts_rate").notNull().default(0.9),
  /** Daily XP goal used for the streak ring. */
  dailyGoalXp: integer("daily_goal_xp").notNull().default(20),
  onboardedAt: integer("onboarded_at", { mode: "timestamp_ms" }),
});

/** One row per (user, lesson) once the lesson has been started. */
export const lessonProgress = sqliteTable(
  "lesson_progress",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    lessonId: text("lesson_id").notNull(),
    completedAt: integer("completed_at", { mode: "timestamp_ms" }),
    timesCompleted: integer("times_completed").notNull().default(0),
    /** Best share of exercises answered correctly, 0..1. */
    bestScore: real("best_score").notNull().default(0),
    xpEarned: integer("xp_earned").notNull().default(0),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.lessonId] })],
);

/** Final test and "test out" results per unit. */
export const unitProgress = sqliteTable(
  "unit_progress",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    unitId: text("unit_id").notNull(),
    bestFinalScore: real("best_final_score").notNull().default(0),
    finalPassedAt: integer("final_passed_at", { mode: "timestamp_ms" }),
    bestTestOutScore: real("best_test_out_score").notNull().default(0),
    testedOutAt: integer("tested_out_at", { mode: "timestamp_ms" }),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.unitId] })],
);

/**
 * Every answer a user submits. This is the raw material for statistics,
 * weak-topic detection and the spaced-repetition schedule.
 */
export const attempts = sqliteTable(
  "attempts",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    /** Where the answer was given. */
    mode: text("mode", { enum: ["lesson", "review", "final", "testout"] })
      .notNull(),
    /** Lesson id, or unit id for tests. */
    contextId: text("context_id").notNull(),
    generatorId: text("generator_id").notNull(),
    skillId: text("skill_id").notNull(),
    correct: integer("correct", { mode: "boolean" }).notNull(),
    /** Highest hint layer opened (0 = none, 3 = full solution). */
    hintsUsed: integer("hints_used").notNull().default(0),
    durationMs: integer("duration_ms").notNull().default(0),
    /** Id of the recognised typical mistake, if any. */
    mistakeId: text("mistake_id"),
    createdAt: createdAt(),
  },
  (t) => [
    index("attempts_user_time_idx").on(t.userId, t.createdAt),
    index("attempts_user_skill_idx").on(t.userId, t.skillId),
  ],
);

/**
 * Spaced-repetition state per (user, skill), using the FSRS algorithm.
 * Field names mirror `ts-fsrs`'s `Card` type.
 */
export const reviewCards = sqliteTable(
  "review_cards",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    skillId: text("skill_id").notNull(),
    due: integer("due", { mode: "timestamp_ms" }).notNull(),
    stability: real("stability").notNull(),
    difficulty: real("difficulty").notNull(),
    elapsedDays: integer("elapsed_days").notNull(),
    scheduledDays: integer("scheduled_days").notNull(),
    learningSteps: integer("learning_steps").notNull().default(0),
    reps: integer("reps").notNull(),
    lapses: integer("lapses").notNull(),
    state: integer("state").notNull(),
    lastReview: integer("last_review", { mode: "timestamp_ms" }),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.skillId] }),
    index("review_cards_due_idx").on(t.userId, t.due),
  ],
);

/** XP and practice time per calendar day. Streaks are computed from this. */
export const activityDays = sqliteTable(
  "activity_days",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    /** Local calendar day, `YYYY-MM-DD` (Europe/Amsterdam). */
    day: text("day").notNull(),
    xp: integer("xp").notNull().default(0),
    secondsPracticed: integer("seconds_practiced").notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.userId, t.day] })],
);

/**
 * Password-reset links. There is no e-mail in Lemma: an admin creates a link
 * and hands it to the user. Only a SHA-256 hash of the token is stored.
 */
export const passwordResetTokens = sqliteTable("password_reset_tokens", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
  usedAt: integer("used_at", { mode: "timestamp_ms" }),
  createdAt: createdAt(),
});

/** Fixed-window counters for our own rate limiting (server actions). */
export const actionRateLimits = sqliteTable("action_rate_limits", {
  key: text("key").primaryKey(),
  windowStart: integer("window_start").notNull(),
  count: integer("count").notNull(),
});
