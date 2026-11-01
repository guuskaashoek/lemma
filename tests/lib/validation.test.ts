import { describe, expect, it } from "vitest";
import { completeLessonSchema, completeReviewSchema, completeTestSchema } from "@/lib/validation";

describe("session results", () => {
  it("accepts a full score", () => {
    expect(completeLessonSchema.safeParse({ lessonId: "l", correctFirstTry: 5, total: 5, seconds: 1 }).success).toBe(true);
    expect(completeTestSchema.safeParse({ unitId: "u0", mode: "final", correct: 10, total: 10, seconds: 1 }).success).toBe(true);
    expect(completeReviewSchema.safeParse({ correct: 0, total: 2, seconds: 1 }).success).toBe(true);
  });

  it("refuses more correct answers than questions", () => {
    expect(completeLessonSchema.safeParse({ lessonId: "l", correctFirstTry: 6, total: 5, seconds: 1 }).success).toBe(false);
    expect(completeTestSchema.safeParse({ unitId: "u0", mode: "testout", correct: 100, total: 1, seconds: 1 }).success).toBe(false);
    expect(completeReviewSchema.safeParse({ correct: 3, total: 2, seconds: 1 }).success).toBe(false);
  });
});
