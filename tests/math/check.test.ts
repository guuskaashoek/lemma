/**
 * Tests for answer checking: equivalence via the CAS plus form checks.
 */
import { describe, expect, it } from "vitest";
import { checkAnswer, checkExpr, roundHalfAwayFromZero } from "@/math/check";
import { equivalent } from "@/math/cas";

const ok = (expected: Parameters<typeof checkExpr>[0], input: string) =>
  checkExpr(expected, input).correct;

describe("equivalence", () => {
  it.each([
    ["\\frac{1}{2}", "0.5"],
    ["\\frac{1}{2}", "0{,}5"],
    ["\\frac{1}{2}", "0,5"],
    ["\\frac{1}{2}", "\\frac{2}{4}"],
    ["x(x+2)", "x^2+2x"],
    ["(x+1)^2", "x^2+2x+1"],
    ["\\sqrt{8}", "2\\sqrt{2}"],
    ["12:4", "3"],
    ["3\\times4", "12"],
    ["\\frac{x}{2}", "0.5x"],
    ["\\log(100)", "2"],
    ["\\frac{x^2-1}{x-1}", "x+1"],
    ["\\sin(x)^2+\\cos(x)^2", "1"],
    ["1\\frac{1}{2}", "1.5"],
  ])("%s ≡ %s", (a, b) => {
    expect(equivalent(a, b)).toBe(true);
  });

  it.each([
    ["\\frac{1}{2}", "0.51"],
    ["x(x+2)", "x^2+2"],
    ["(x+1)^2", "x^2+1"],
    ["2x", "2y"],
    ["\\sqrt{x^2}", "x"],
    ["2,5", "25"],
  ])("%s ≢ %s", (a, b) => {
    expect(equivalent(a, b)).toBe(false);
  });
});

describe("forms", () => {
  it("any form accepts every equivalent answer", () => {
    for (const input of ["\\frac{1}{2}", "0.5", "\\frac{2}{4}", "0{,}5"]) {
      expect(ok({ latex: "\\frac12" }, input)).toBe(true);
    }
  });

  it("fraction form wants lowest terms", () => {
    expect(ok({ latex: "\\frac12", form: "fraction" }, "\\frac{1}{2}")).toBe(true);
    expect(ok({ latex: "\\frac12", form: "fraction" }, "\\frac{2}{4}")).toBe(false);
    expect(ok({ latex: "\\frac12", form: "fraction" }, "0.5")).toBe(false);
    expect(ok({ latex: "-\\frac34", form: "fraction" }, "-\\frac{3}{4}")).toBe(true);
    expect(ok({ latex: "2", form: "fraction" }, "\\frac{4}{2}")).toBe(false);
    expect(ok({ latex: "2", form: "fraction" }, "2")).toBe(true);
  });

  it("factored form rejects the expanded version", () => {
    const spec = { latex: "x(x+2)", form: "factored" as const, minFactors: 2 };
    expect(ok(spec, "x(x+2)")).toBe(true);
    expect(ok(spec, "(x+2)x")).toBe(true);
    expect(ok(spec, "x^2+2x")).toBe(false);
    expect(ok(spec, "(x^2+2x)")).toBe(false);
    const sq = { latex: "(x+1)^2", form: "factored" as const, minFactors: 2 };
    expect(ok(sq, "(x+1)^2")).toBe(true);
    expect(ok(sq, "(x+1)(x+1)")).toBe(true);
    expect(ok(sq, "x^2+2x+1")).toBe(false);
  });

  it("factored form wants the largest common factor taken out", () => {
    const spec = { latex: "3x(2x+3)", form: "factored" as const, minFactors: 2 };
    expect(ok(spec, "3x(2x+3)")).toBe(true);
    expect(ok(spec, "x(6x+9)")).toBe(false);
    const numeric = { latex: "3(x+2)", form: "factored" as const, minFactors: 1 };
    expect(ok(numeric, "3(x+2)")).toBe(true);
    expect(ok(numeric, "3x+6")).toBe(false);
  });

  it("expanded form rejects brackets around sums", () => {
    const spec = { latex: "x^2+2x", form: "expanded" as const };
    expect(ok(spec, "x^2+2x")).toBe(true);
    expect(ok(spec, "x(x+2)")).toBe(false);
  });

  it("integer form", () => {
    expect(ok({ latex: "3", form: "integer" }, "3")).toBe(true);
    expect(ok({ latex: "3", form: "integer" }, "\\frac{6}{2}")).toBe(false);
    expect(ok({ latex: "-3", form: "integer" }, "-3")).toBe(true);
  });

  it("decimal form compares with the correctly rounded value", () => {
    const spec = { latex: "\\frac{2}{3}", form: "decimal" as const, decimals: 2 };
    expect(ok(spec, "0,67")).toBe(true);
    expect(ok(spec, "0.67")).toBe(true);
    expect(ok(spec, "0.66")).toBe(false);
    const tooMany = checkExpr(spec, "0.6667");
    expect(tooMany).toMatchObject({ correct: false, note: "too-many-decimals" });
  });

  it("answers like 'x = 3' are accepted", () => {
    expect(checkExpr({ latex: "3" }, "x=3", "x").correct).toBe(true);
  });

  it("empty and broken input are reported as such", () => {
    expect(checkExpr({ latex: "3" }, "")).toMatchObject({ reason: "empty" });
    expect(checkExpr({ latex: "3" }, "2x-")).toMatchObject({ reason: "invalid" });
  });
});

describe("rounding", () => {
  it("rounds half away from zero", () => {
    expect(roundHalfAwayFromZero(2.345, 2)).toBe(2.35);
    expect(roundHalfAwayFromZero(-2.345, 2)).toBe(-2.35);
    expect(roundHalfAwayFromZero(1.005, 2)).toBe(1.01);
    expect(roundHalfAwayFromZero(0.6666, 2)).toBe(0.67);
  });
});

describe("solutions and mistakes", () => {
  const spec = { kind: "solutions" as const, variable: "x", values: ["2", "-3"] };

  it("accepts solutions in any order", () => {
    expect(checkAnswer(spec, { kind: "solutions", latex: ["-3", "2"] }).correct).toBe(true);
    expect(checkAnswer(spec, { kind: "solutions", latex: ["x=2", "x=-3"] }).correct).toBe(true);
  });

  it("reports missing and extra solutions", () => {
    expect(checkAnswer(spec, { kind: "solutions", latex: ["2"] })).toMatchObject({ note: "missing-solution" });
    expect(checkAnswer(spec, { kind: "solutions", latex: ["2", "3"] })).toMatchObject({ note: "extra-solution" });
  });

  it("recognises a typical mistake", () => {
    const mistake = { id: "sign", latex: "-11", explain: { nl: "Let op het minteken.", en: "Mind the minus sign." } };
    const r = checkAnswer({ kind: "expr", latex: "11" }, { kind: "expr", latex: "-11" }, [mistake]);
    expect(r).toMatchObject({ correct: false, reason: "mistake" });
  });

  it("handles 'no solution'", () => {
    const none = { kind: "solutions" as const, variable: "x", values: [] };
    expect(checkAnswer(none, { kind: "solutions", latex: [], noSolution: true }).correct).toBe(true);
    expect(checkAnswer(spec, { kind: "solutions", latex: [], noSolution: true }).correct).toBe(false);
  });
});

describe("relation and multi answers", () => {
  it("accepts equivalent inequalities and rejects the wrong boundary", () => {
    const spec = { kind: "relation" as const, latex: "x<3", points: [{ x: 3 }] };
    expect(checkAnswer(spec, { kind: "relation", latex: "3>x" }).correct).toBe(true);
    expect(checkAnswer(spec, { kind: "relation", latex: "x\\le 3" }).correct).toBe(false);
    expect(checkAnswer(spec, { kind: "relation", latex: "x>3" }).correct).toBe(false);
    expect(checkAnswer(spec, { kind: "relation", latex: "3" })).toMatchObject({ reason: "invalid" });
  });

  it("accepts an equivalent equation of a line", () => {
    const spec = { kind: "relation" as const, latex: "y=2x+1" };
    expect(checkAnswer(spec, { kind: "relation", latex: "y-1=2x" }).correct).toBe(true);
    expect(checkAnswer(spec, { kind: "relation", latex: "y=2x-1" }).correct).toBe(false);
  });

  it("checks every part of a multi answer", () => {
    const spec = {
      kind: "multi" as const,
      parts: [
        { label: "x=", answer: { latex: "2" } },
        { label: "y=", answer: { latex: "\\frac{1}{2}" } },
      ],
    };
    expect(checkAnswer(spec, { kind: "multi", latex: ["2", "0,5"] }).correct).toBe(true);
    expect(checkAnswer(spec, { kind: "multi", latex: ["2", "3"] })).toMatchObject({ wrongParts: [1] });
    expect(checkAnswer(spec, { kind: "multi", latex: ["", ""] })).toMatchObject({ reason: "empty" });
  });
});
