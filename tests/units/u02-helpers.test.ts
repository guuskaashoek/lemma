/**
 * Unit 2: pure helpers behind the generators and widgets.
 */
import { describe, expect, it } from "vitest";
import { makeExercise } from "@/content/generators";
import type { Difficulty } from "@/content/types";
import { boundaryPoints, flipRel, relationTruth, splitRelation, type Rel } from "@/content/units/u02/helpers";
import {
  backwardChain,
  collect,
  combineTerms,
  filledLatex,
  forwardChain,
  monosLatex,
  products,
  termsLatex,
  tileLayout,
  tilesOf,
  tilesValue,
  zeroPairIds,
  type MOp,
  type Mono,
  type TileTerm,
} from "@/content/units/u02/widgets/models";
import { equivalent, evaluate, parse } from "@/math/cas";
import { checkAnswer } from "@/math/check";

describe("u2 algebra tiles model", () => {
  const cases: TileTerm[][] = [
    [[3, "x"], [2, "1"], [4, "x"], [-5, "1"]],
    [[1, "x"], [-4, "1"], [-3, "x"], [1, "1"]],
    [[2, "x"], [3, "x"], [1, "x"]],
    [[5, "1"], [-2, "x"]],
  ];

  it.each(cases)("combines like terms like the CAS does (%#)", (...terms) => {
    const { x, ones } = combineTerms(terms);
    expect(equivalent(termsLatex(terms), termsLatex([[x, "x"], [ones, "1"]]))).toBe(true);
  });

  it.each(cases)("fills in x correctly (%#)", (...terms) => {
    for (const x of [-3, 0, 4]) {
      expect(evaluate(parse(filledLatex(terms, x)))).toBe(tilesValue(terms, x));
      expect(evaluate(parse(termsLatex(terms)), { x })).toBe(tilesValue(terms, x));
    }
  });

  it("cancels only plus/minus pairs of the same kind", () => {
    const tiles = tilesOf([[3, "x"], [2, "1"], [-1, "x"], [-5, "1"]]);
    const gone = zeroPairIds(tiles);
    expect(gone.size).toBe(2 + 4);
    const left = tiles.filter((t) => !gone.has(t.id));
    expect(left.filter((t) => t.kind === "x" && !t.neg)).toHaveLength(2);
    expect(left.filter((t) => t.kind === "1" && t.neg)).toHaveLength(3);
  });

  it("lays out every tile in every phase", () => {
    const tiles = tilesOf([[3, "x"], [2, "1"], [-1, "x"], [-5, "1"]]);
    for (const phase of ["written", "sorted", "cancelled"] as const) {
      const { pos, width } = tileLayout(tiles, phase);
      expect(pos.size).toBe(tiles.length);
      for (const p of pos.values()) expect(p.x).toBeGreaterThanOrEqual(0);
      expect(width).toBeGreaterThan(0);
    }
  });
});

describe("u2 bracket model", () => {
  const cases: Array<[Mono[], Mono[]]> = [
    [[[3, 0]], [[1, 1], [4, 0]]],
    [[[-2, 0]], [[1, 1], [-3, 0]]],
    [[[1, 1]], [[1, 1], [3, 0]]],
    [[[1, 1], [2, 0]], [[1, 1], [5, 0]]],
    [[[2, 1], [-3, 0]], [[4, 1], [1, 0]]],
  ];
  it.each(cases)("expands like the CAS (%#)", (left, right) => {
    const product = `(${monosLatex(left)})(${monosLatex(right)})`;
    const expanded = monosLatex(collect(products(left, right).map((p) => p.mono)));
    expect(equivalent(product, expanded)).toBe(true);
    expect(products(left, right)).toHaveLength(left.length * right.length);
  });
});

describe("u2 machine model", () => {
  const machines: Array<[MOp[], string]> = [
    [[{ op: "*", n: "2" }, { op: "+", n: "3" }], "2x+3"],
    [[{ op: "+", n: "3" }, { op: "*", n: "2" }], "2(x+3)"],
    [[{ op: "*", n: "4" }, { op: "from", n: "20" }], "20-4x"],
    [[{ op: "from", n: "12" }, { op: "*", n: "3" }], "3(12-x)"],
    [[{ op: "+", n: "5" }, { op: ":", n: "3" }], "\\frac{x+5}{3}"],
    [[{ op: "*", n: "2" }, { op: "*", n: "3" }], "6x"],
    [[{ op: "+", n: "l" }, { op: "*", n: "2" }], "2(x+l)"],
  ];

  it.each(machines)("builds the formula forwards (%#)", (ops, expected) => {
    expect(equivalent(forwardChain(ops, "x").at(-1)!, expected)).toBe(true);
  });

  it.each(machines)("undoes the formula backwards (%#)", (ops) => {
    const forward = forwardChain(ops, "x").at(-1)!;
    const inverse = backwardChain(ops, "y").at(-1)!;
    // Put the inverse into the formula: you must get y back.
    for (const [y, l] of [[7.3, 1.7], [-2.1, 0.6]]) {
      const x = evaluate(parse(inverse), { y, l });
      expect(x).not.toBeNull();
      expect(evaluate(parse(forward), { x: x!, l })).toBeCloseTo(y, 9);
    }
  });
});

describe("u2 relation helpers", () => {
  it("splits and evaluates relations", () => {
    expect(splitRelation("2x+1\\le 9")).toEqual({ lhs: "2x+1", op: "\\le", rhs: "9" });
    expect(splitRelation("x\\geq -3")?.op).toBe("\\ge");
    expect(relationTruth("2x+1\\le 9", { x: 4 })).toBe(true);
    expect(relationTruth("2x+1<9", { x: 4 })).toBe(false);
  });

  it("flips every sign", () => {
    const all: Rel[] = ["<", ">", "\\le", "\\ge"];
    for (const r of all) expect(flipRel(flipRel(r))).toBe(r);
    expect(flipRel("<")).toBe(">");
  });

  it("boundary points tell close answers apart", () => {
    const spec = { kind: "relation" as const, latex: "x>-\\frac{5}{2}", points: boundaryPoints(-2.5) };
    expect(checkAnswer(spec, { kind: "relation", latex: "x>-2.5" }).correct).toBe(true);
    expect(checkAnswer(spec, { kind: "relation", latex: "x>-2.4" }).correct).toBe(false);
    expect(checkAnswer(spec, { kind: "relation", latex: "x\\ge -2.5" }).correct).toBe(false);
  });
});

describe("u2 exercise pictures match the exercise", () => {
  it.each([1, 2, 3] as Difficulty[])("tiles show the same expression (difficulty %i)", (d) => {
    for (const id of ["u2.evaluate", "u2.like-terms"]) {
      for (let i = 0; i < 20; i++) {
        const ex = makeExercise(id, d, `pic-${i}`);
        const v = ex.visual;
        if (!v || v.kind !== "custom") continue;
        expect(v.widget).toBe("u2.tiles");
        const terms = v.props.terms as TileTerm[];
        expect(equivalent(termsLatex(terms), ex.latex!)).toBe(true);
      }
    }
  });

  it.each([1, 2, 3] as Difficulty[])("the number line holds the inequality (difficulty %i)", (d) => {
    for (const id of ["u2.inequality-solve", "u2.inequality-flip"]) {
      for (let i = 0; i < 20; i++) {
        const ex = makeExercise(id, d, `pic-${i}`);
        const v = ex.visual!;
        expect(v.kind).toBe("custom");
        if (v.kind !== "custom") continue;
        const { a, b, c, d: dd, op } = v.props as { a: number; b: number; c: number; d: number; op: Rel };
        const shown = `${termsLatex([[a, "x"], [b, "1"]])}${op} ${termsLatex([[c, "x"], [dd, "1"]].filter(([k]) => k !== 0) as TileTerm[])}`;
        for (const x of [-7, -2.5, 0, 1, 3.5, 8]) expect(relationTruth(shown, { x })).toBe(relationTruth(ex.latex!, { x }));
      }
    }
  });
});
