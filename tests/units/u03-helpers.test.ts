/**
 * Unit 3: pure helpers of the widgets and generators, and the rule-card
 * links in this unit's texts (the shared test does not see ids with a dot).
 */
import Fraction from "fraction.js";
import { describe, expect, it } from "vitest";
import { getRule } from "@/content/rules";
import { bundle } from "@/content/units/u03";
import { lin, pt, signed, times } from "@/content/units/u03/helpers";
import { equationsHold, systemEquations, systemLatex } from "@/content/units/u03/gen/solve";
import { combine, gridStep, linTex, meet, numLabel, numTex, planeWindow, stairs, toFrac, toNum } from "@/content/units/u03/widgets/model";

describe("u3 latex helpers", () => {
  it("writes lines like a textbook", () => {
    expect(lin(2, 1)).toBe("2x+1");
    expect(lin(-1, 0)).toBe("-x");
    expect(lin(new Fraction(1, 2), -3)).toBe("\\frac{1}{2}x-3");
    expect(lin(0, 4)).toBe("4");
  });
  it("writes points, products and signs", () => {
    expect(pt(2, -3)).toBe("(2,\\ -3)");
    expect(times(3, -2)).toBe("3\\cdot \\left(-2\\right)");
    expect(signed(-4)).toBe("-4");
    expect(signed(4)).toBe("+4");
    expect(signed(0)).toBe("");
  });
});

describe("u3 widget model", () => {
  it("reads numbers and fractions from props", () => {
    expect(toNum("2/3")).toBeCloseTo(2 / 3);
    expect(toNum(5)).toBe(5);
    expect(toNum("nonsense", 7)).toBe(7);
    expect(toFrac("-3/4").equals(new Fraction(-3, 4))).toBe(true);
  });
  it("labels numbers school style", () => {
    expect(numLabel(-2, "nl")).toBe("−2");
    expect(numLabel(2 / 3, "nl")).toBe("2/3");
    expect(numLabel(1.25, "nl")).toBe("5/4");
    expect(numTex(-0.5)).toBe("-\\frac{1}{2}");
    expect(linTex(1, -2)).toBe("x-2");
    expect(linTex(0, 0)).toBe("0");
  });
  it("fits a window around the points with the origin inside", () => {
    const w = planeWindow([[3, 10]], 8);
    expect(w.x[0]).toBeLessThanOrEqual(0);
    expect(w.x[1]).toBeGreaterThanOrEqual(4);
    expect(w.y[1]).toBeGreaterThanOrEqual(11);
    expect(w.x[1] - w.x[0]).toBeGreaterThanOrEqual(8);
  });
  it("picks nice grid steps", () => {
    expect(gridStep(10)).toBe(1);
    expect(gridStep(30)).toBe(2);
    expect(gridStep(420)).toBe(50);
  });
  it("builds the staircase of a line", () => {
    const s = stairs(2, 1, 0, 2);
    expect(s[0]).toEqual({ from: [0, 1], corner: [1, 1], to: [1, 3] });
    expect(s[1].to).toEqual([2, 5]);
  });
  it("finds where two lines meet", () => {
    expect(meet(2, 1, -1, 7)).toEqual([2, 5]);
    expect(meet(2, 1, 2, 3)).toBeNull();
  });
  it("knows when the squares cancel", () => {
    expect(combine({ x: 2, y: 1, c: 11 }, { x: 1, y: 1, c: 7 }, "sub")).toEqual({ row: { x: 1, y: 0, c: 4 }, squaresGone: true });
    expect(combine({ x: 2, y: 1, c: 11 }, { x: 1, y: 1, c: 7 }, "add").squaresGone).toBe(false);
  });
});

describe("u3 systems helpers", () => {
  it("splits a system back into its equations and checks a point", () => {
    const latex = systemLatex("2x+y=11", "x+y=7");
    expect(systemEquations(latex)).toEqual(["2x+y=11", "x+y=7"]);
    expect(equationsHold(systemEquations(latex), { x: 4, y: 3 })).toBe(true);
    expect(equationsHold(systemEquations(latex), { x: 3, y: 4 })).toBe(false);
  });
});

describe("u3 rule links", () => {
  it("every [[rule:...]] link in the unit points to an existing rule card", () => {
    const texts: string[] = [];
    for (const l of bundle.unit.lessons) {
      for (const s of l.screens) {
        if (s.kind !== "example") texts.push(s.body.nl, s.body.en);
      }
    }
    const broken = texts.flatMap((t) => [...t.matchAll(/\[\[rule:([\w.-]+)\]\]/g)].map((m) => m[1])).filter((id) => !getRule(id));
    expect(broken).toEqual([]);
  });
  it("every rule card id used by a skill or screen exists", () => {
    const ids = [
      ...bundle.skills.flatMap((s) => s.ruleIds),
      ...bundle.unit.lessons.flatMap((l) => l.screens.flatMap((s) => (s.kind === "explain" && s.ruleId ? [s.ruleId] : []))),
    ];
    expect(ids.filter((id) => !getRule(id))).toEqual([]);
  });
});
