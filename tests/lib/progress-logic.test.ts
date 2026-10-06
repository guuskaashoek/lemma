/**
 * Unlocking units, streaks, XP and spaced-repetition ratings.
 */
import { describe, expect, it } from "vitest";
import { UNITS } from "@/content/curriculum";
import type { Unit } from "@/content/types";
import {
  buildRoadmap,
  computeStreak,
  dayKey,
  lessonXp,
  outcomeFor,
  previousDay,
  testPassed,
  worstOutcome,
  type UnitProgressRow,
} from "@/lib/progress-logic";

const lesson = (id: string) => ({ ...UNITS[0].lessons[0], id });
const unit = (index: number, lessons: string[], status: Unit["status"] = "available"): Unit => ({
  id: `u${index}`,
  index,
  title: { nl: "", en: "" },
  summary: { nl: "", en: "" },
  status,
  lessons: lessons.map(lesson),
});
const row = (unitId: string, p: Partial<UnitProgressRow>): UnitProgressRow => ({
  unitId,
  finalPassedAt: null,
  testedOutAt: null,
  bestFinalScore: 0,
  bestTestOutScore: 0,
  ...p,
});

describe("roadmap", () => {
  const units = [unit(0, ["a", "b"]), unit(1, ["c"]), unit(2, [], "planned")];

  it("starts with unit 0 open and only its first lesson available", () => {
    const r = buildRoadmap(units, new Set(), new Map());
    expect(r.map((u) => u.state)).toEqual(["available", "locked", "planned"]);
    expect(r[0].lessons.map((l) => l.state)).toEqual(["next", "locked"]);
    expect(r[0].finalTestOpen).toBe(false);
  });

  it("opens the final test when all lessons are done", () => {
    const r = buildRoadmap(units, new Set(["a", "b"]), new Map());
    expect(r[0].finalTestOpen).toBe(true);
    expect(r[1].state).toBe("locked");
  });

  it("unlocks the next unit after passing the final test", () => {
    const r = buildRoadmap(units, new Set(["a", "b"]), new Map([["u0", row("u0", { finalPassedAt: new Date() })]]));
    expect(r[0].state).toBe("passed");
    expect(r[1].state).toBe("available");
    expect(r[1].lessons[0].state).toBe("next");
  });

  it("unlocks the next unit after testing out", () => {
    const r = buildRoadmap(units, new Set(), new Map([["u0", row("u0", { testedOutAt: new Date() })]]));
    expect(r[0].state).toBe("skipped");
    expect(r[1].state).toBe("available");
  });
});

describe("pass marks", () => {
  it("final test needs 80%, test out needs 90%", () => {
    expect(testPassed("final", 8 / 10)).toBe(true);
    expect(testPassed("final", 7 / 10)).toBe(false);
    expect(testPassed("testout", 9 / 10)).toBe(true);
    expect(testPassed("testout", 8 / 10)).toBe(false);
  });
});

describe("streak", () => {
  it("counts consecutive days up to today or yesterday", () => {
    expect(computeStreak(["2026-10-04", "2026-10-05", "2026-10-06"], "2026-10-06")).toBe(3);
    expect(computeStreak(["2026-10-04", "2026-10-05"], "2026-10-06")).toBe(2);
    expect(computeStreak(["2026-10-03"], "2026-10-06")).toBe(0);
    expect(computeStreak([], "2026-10-06")).toBe(0);
  });

  it("handles month boundaries and Dutch time", () => {
    expect(previousDay("2026-03-01")).toBe("2026-02-28");
    // 23:30 UTC on 6 October is already 7 October in Amsterdam (CEST, UTC+2).
    expect(dayKey(new Date("2026-10-06T23:30:00Z"))).toBe("2026-10-07");
  });
});

describe("xp and ratings", () => {
  it("never subtracts XP for hints or mistakes", () => {
    expect(lessonXp(0, 8)).toBe(10);
    expect(lessonXp(8, 8)).toBe(18);
  });

  it("maps results to spaced-repetition ratings", () => {
    expect(outcomeFor(true, 0)).toBe("good");
    expect(outcomeFor(true, 2)).toBe("hard");
    expect(outcomeFor(true, 3)).toBe("again");
    expect(outcomeFor(false, 0)).toBe("again");
    expect(worstOutcome(["good", "hard"])).toBe("hard");
    expect(worstOutcome(["good", "again", "hard"])).toBe("again");
  });
});
