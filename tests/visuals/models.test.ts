/**
 * The maths behind the visuals: the balance and the area model.
 */
import { describe, expect, it } from "vitest";
import { equivalent } from "@/math/cas";
import { validateSteps } from "@/math/steps";
import { createRng } from "@/math/random";
import {
  applyOneSide,
  applyOp,
  balanceLatex,
  initBalance,
  solution,
  solveOps,
  tilt,
} from "@/visuals/models/balance";
import { areaCells, areaProduct, areaTotal } from "@/visuals/models/area";
import { compileFn, slopeAt } from "@/visuals/models/plot";

describe("balance model", () => {
  it("solves 2x + 3 = 7 with the balance method", () => {
    let s = initBalance(2, 3, 0, 7);
    expect(balanceLatex(s)).toBe("2x+3=7");
    const seen: string[] = [];
    for (const op of solveOps(s)) {
      s = applyOp(s, op);
      seen.push(balanceLatex(s));
    }
    expect(seen).toEqual(["2x=4", "x=2"]);
  });

  it("keeps the solution in every step, for 500 random equations", () => {
    const rng = createRng("balance");
    for (let i = 0; i < 500; i++) {
      const x = rng.int(-9, 9);
      const c = rng.int(0, 5);
      const a = c + rng.int(1, 4) * rng.sign();
      if (a < 0) continue;
      const b = rng.int(-15, 15);
      let s = initBalance(a, b, c, (a - c) * x + b);
      const latex = [balanceLatex(s)];
      for (const op of solveOps(s)) {
        s = applyOp(s, op);
        latex.push(balanceLatex(s));
        expect(tilt(s, x)).toBe(0); // the balance stays level
      }
      expect(latex[latex.length - 1]).toBe(`x=${x}`);
      expect(validateSteps(latex, { solutions: [{ x }] })).toEqual({ ok: true });
    }
  });

  it("tips when you change one side only", () => {
    const s = initBalance(2, 3, 0, 7);
    const left = applyOneSide(s, "left", { kind: "subtract-ones", amount: 1 });
    expect(tilt(left, 2)).toBe(1); // right side goes down
    const fixed = applyOneSide(left, "right", { kind: "subtract-ones", amount: 1 });
    expect(tilt(fixed, 2)).toBe(0);
    expect(solution(fixed)?.valueOf()).toBe(2);
  });
});

describe("area model", () => {
  it.each([
    [["x", "2"], ["x", "3"]],
    [["2x", "-1"], ["x", "5"]],
    [["3"], ["x", "4"]],
    [["10", "3"], ["10", "2"]],
  ])("cells add up to the product (%j × %j)", (rows, cols) => {
    expect(areaCells(rows, cols)).toHaveLength(rows.length * cols.length);
    expect(equivalent(areaTotal(rows, cols), areaProduct(rows, cols))).toBe(true);
  });
});

describe("plotting", () => {
  it("compiled functions agree with plain JavaScript", () => {
    const f = compileFn("x^2-3x+\\frac{1}{2}");
    expect(f(2)).toBeCloseTo(4 - 6 + 0.5, 12);
    expect(slopeAt(f, 2)).toBeCloseTo(2 * 2 - 3, 6);
  });
});
