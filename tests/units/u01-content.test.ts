/**
 * Unit 1: links that the shared content tests do not follow.
 * - `[[rule:u1.x]]` links (the shared pattern does not match ids with a dot),
 * - `hints.rule.ruleId` and `mistakes[].relatedSkill` of generated exercises,
 * - the pure helpers of this unit.
 */
import { describe, expect, it } from "vitest";
import { SKILLS } from "@/content/curriculum";
import { makeExercise } from "@/content/generators";
import { getRule } from "@/content/rules";
import type { Difficulty } from "@/content/types";
import { bundle } from "@/content/units/u01";
import { largestSquareFactor } from "@/content/units/u01/gen/roots";
import { decimalString, grouped, subLetter } from "@/content/units/u01/helpers";

const skillIds = new Set(SKILLS.map((s) => s.id));
const ruleLinks = (text: string) => [...text.matchAll(/\[\[rule:([\w.-]+)\]\]/g)].map((m) => m[1]);

describe("u1 links", () => {
  it("every rule link in lessons and rule cards exists", () => {
    const problems: string[] = [];
    const texts = JSON.stringify([bundle.unit.lessons, bundle.rules]);
    for (const id of ruleLinks(texts)) if (!getRule(id)) problems.push(`broken link rule:${id}`);
    for (const l of bundle.unit.lessons) {
      for (const s of l.screens) if (s.kind === "explain" && s.ruleId && !getRule(s.ruleId)) problems.push(`${l.id}: unknown rule ${s.ruleId}`);
    }
    expect(problems).toEqual([]);
  });

  it("every lesson links at least one rule card", () => {
    for (const l of bundle.unit.lessons) {
      const linked = l.screens.some((s) => s.kind === "explain" && s.ruleId);
      expect(linked, l.id).toBe(true);
    }
  });

  it("every lesson has an interactive visual and at least 8 exercises", () => {
    for (const l of bundle.unit.lessons) {
      expect(l.screens.some((s) => s.kind === "visual"), l.id).toBe(true);
      expect(l.practice.reduce((n, b) => n + b.count, 0), l.id).toBeGreaterThanOrEqual(8);
    }
  });

  it.each(bundle.generators.map((g) => [g.id] as const))("%s: hint rules, related skills and rule links exist", (id) => {
    const problems: string[] = [];
    for (const d of [1, 2, 3] as Difficulty[]) {
      for (let i = 0; i < 40; i++) {
        const ex = makeExercise(id, d, `links-${i}`);
        const r = ex.hints.rule.ruleId;
        if (!r || !getRule(r)) problems.push(`d${d} #${i}: hint 2 rule ${r}`);
        for (const m of ex.mistakes ?? []) {
          if (m.relatedSkill && !skillIds.has(m.relatedSkill)) problems.push(`d${d} #${i}: related skill ${m.relatedSkill}`);
        }
        for (const link of ruleLinks(JSON.stringify(ex))) if (!getRule(link)) problems.push(`d${d} #${i}: link ${link}`);
      }
    }
    expect(problems).toEqual([]);
  });
});

describe("u1 helpers", () => {
  it("builds exact decimal strings", () => {
    expect(decimalString(45, 3)).toBe("45000");
    expect(decimalString(32, -5)).toBe("0.00032");
    expect(decimalString(307, -2)).toBe("3.07");
    expect(decimalString(5, -1)).toBe("0.5");
    expect(decimalString(120, -1)).toBe("12");
  });

  it("groups big numbers with thin spaces", () => {
    expect(grouped("45000")).toBe("45\\,000");
    expect(grouped("3070000")).toBe("3\\,070\\,000");
    expect(grouped("4500")).toBe("4500");
    expect(grouped("0.00032")).toBe("0.00032");
  });

  it("replaces a letter but not LaTeX commands", () => {
    expect(subLetter("\\frac{a^{2}}{a}", "a", 2)).toBe("\\frac{(2)^{2}}{(2)}");
  });

  it("finds the largest square factor", () => {
    expect(largestSquareFactor(50)).toBe(5);
    expect(largestSquareFactor(72)).toBe(6);
    expect(largestSquareFactor(7)).toBe(1);
  });
});
