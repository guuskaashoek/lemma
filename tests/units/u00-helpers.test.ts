/**
 * Unit 0: pure helpers behind the generators and widgets.
 */
import Fraction from "fraction.js";
import { describe, expect, it } from "vitest";
import { evalTree, nextOperation, toLatex } from "@/content/shared/arith-tree";
import { dec, money } from "@/content/units/u00/helpers";
import { applyOperation, judgeTap, parseSum } from "@/content/units/u00/widgets/order-model";
import { ALIAS, SIZE, STAIRS, STEP, unitLatex, type UnitKind } from "@/content/units/u00/widgets/unit-model";
import { equivalent } from "@/math/cas";

describe("u0 number formatting", () => {
  it("writes terminating decimals without float noise", () => {
    expect(dec(new Fraction(3, 8))).toBe("0.375");
    expect(dec(0.1 + 0.2)).toBe("0.3");
    expect(dec(new Fraction(-5, 2))).toBe("-2.5");
    expect(dec(12)).toBe("12");
  });

  it("writes money with cents only when needed", () => {
    expect(money(4.5)).toBe("4.50");
    expect(money(12)).toBe("12");
  });
});

describe("u0 order-of-operations widget model", () => {
  const sums = ["3+4\\cdot 2", "2+3\\cdot(5-1)^{2}", "20-2\\cdot(3+4)", "(13-1)^{2}:4", "5-(-3)\\cdot 2", "2^{3}-3\\cdot 4:2"];

  it.each(sums)("parses %s back to the same sum", (latex) => {
    const tree = parseSum(latex);
    expect(tree).not.toBeNull();
    expect(equivalent(toLatex(tree!), latex)).toBe(true);
    expect(equivalent(String(evalTree(tree!).valueOf()), latex)).toBe(true);
  });

  it("rejects what it cannot read", () => {
    expect(parseSum("3+")).toBeNull();
    expect(parseSum("x+1")).toBeNull();
  });

  it.each(sums)("tapping the right operation each time ends at the value of %s", (latex) => {
    let tree = parseSum(latex)!;
    const value = evalTree(tree);
    for (let guard = 0; guard < 20 && tree.k !== "num"; guard++) {
      const op = nextOperation(tree)!;
      expect(judgeTap(tree, op)).toBe("ok");
      tree = applyOperation(tree, op).tree;
      expect(evalTree(tree).equals(value)).toBe(true);
    }
    expect(tree.k).toBe("num");
  });

  it("names the rule when a wrong operation is tapped", () => {
    const t1 = parseSum("3+4\\cdot 2")!;
    if (t1.k !== "bin") throw new Error("expected a sum");
    expect(judgeTap(t1, t1)).toBe("muldiv");

    const t2 = parseSum("2\\cdot(5-1)")!;
    if (t2.k !== "bin") throw new Error("expected a product");
    expect(judgeTap(t2, t2)).toBe("brackets");

    const t3 = parseSum("2+3^{2}")!;
    if (t3.k !== "bin") throw new Error("expected a sum");
    expect(judgeTap(t3, t3)).toBe("power");

    const t4 = parseSum("8-3+1")!;
    if (t4.k !== "bin") throw new Error("expected a sum");
    expect(judgeTap(t4, t4)).toBe("left-to-right");
  });
});

describe("u0 metric staircase", () => {
  it.each(Object.keys(STAIRS) as UnitKind[])("%s: every stair is one step factor", (kind) => {
    const units = STAIRS[kind];
    for (let i = 0; i + 1 < units.length; i++) {
      expect(SIZE[units[i]].div(SIZE[units[i + 1]]).valueOf()).toBe(STEP[kind]);
    }
  });

  it("knows that 1 dm³ is 1 litre and 1 cm³ is 1 mL", () => {
    expect(ALIAS["dm³"]).toBe("L");
    expect(ALIAS["cm³"]).toBe("mL");
    // Same ratio on both staircases: 1000 mL in a litre, 1000 cm³ in a dm³.
    expect(SIZE["L"].div(SIZE["mL"]).valueOf()).toBe(SIZE["dm³"].div(SIZE["cm³"]).valueOf());
  });

  it("writes unit powers for LaTeX", () => {
    expect(unitLatex("cm²")).toBe("\\text{ cm}^{2}");
    expect(unitLatex("m³")).toBe("\\text{ m}^{3}");
    expect(unitLatex("kg")).toBe("\\text{ kg}");
  });
});
