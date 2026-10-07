/**
 * Small helpers shared by the unit 2 generators and lessons.
 * Pure functions only, so they can be tested in `tests/units/u02-helpers.test.ts`.
 */
import Fraction from "fraction.js";
import type { Loc } from "@/content/types";
import { evaluate, parse } from "@/math/cas";
import { frac, sum, term } from "@/math/latex";
import type { VisualSpec } from "@/visuals/types";

/** Shorthand for a Dutch + English text. */
export const L = (nl: string, en: string): Loc => ({ nl, en });

/** A custom widget of this unit, with its read-aloud description. */
export function custom(widget: string, props: Record<string, unknown>, describe: Loc): VisualSpec {
  return { kind: "custom", widget, props, describe };
}

/** `+3`, `-3`: a number with its sign always written. */
export function signed(n: Fraction | number): string {
  const s = frac(n);
  return s.startsWith("-") ? s : `+${s}`;
}

/** A number in brackets when it is negative: `(-3)`, `3`. For use after `\cdot`. */
export function par(n: Fraction | number): string {
  const s = frac(n);
  return s.startsWith("-") ? `(${s})` : s;
}

/** `ax+b` as LaTeX. */
export const lin = (a: Fraction | number, b: Fraction | number, v = "x") => sum([[a, v], [b, ""]]);

/** The relation symbols used for inequalities. */
export type Rel = "<" | ">" | "\\le" | "\\ge";

/** Spoken/written names of the symbols. */
export const REL_NAME: Record<Rel, Loc> = {
  "<": L("kleiner dan", "less than"),
  ">": L("groter dan", "greater than"),
  "\\le": L("kleiner dan of gelijk aan", "less than or equal to"),
  "\\ge": L("groter dan of gelijk aan", "greater than or equal to"),
};

/** The symbol turned around: `<` becomes `>`, `\le` becomes `\ge`. */
export function flipRel(r: Rel): Rel {
  return r === "<" ? ">" : r === ">" ? "<" : r === "\\le" ? "\\ge" : "\\le";
}

/** LaTeX of `lhs rel rhs` with a space after commands like `\le`. */
export const relLatex = (lhs: string, r: Rel, rhs: string) => `${lhs}${r.startsWith("\\") ? `${r} ` : r}${rhs}`;

/** Is `a rel b` true? */
export function relHolds(a: number, r: Rel, b: number): boolean {
  const eq = Math.abs(a - b) < 1e-9;
  switch (r) {
    case "<":
      return a < b && !eq;
    case ">":
      return a > b && !eq;
    case "\\le":
      return a < b || eq;
    case "\\ge":
      return a > b || eq;
  }
}

/** Does the relation include its boundary (closed dot)? */
export const isClosed = (r: Rel) => r === "\\le" || r === "\\ge";
/** Do the solutions lie to the left of the boundary (for `x rel k`)? */
export const pointsLeft = (r: Rel) => r === "<" || r === "\\le";

/**
 * Test points around a boundary for comparing inequalities. The checker
 * compares truth values at these points, so `x<4` and `x\le 4`, or `x>-2.5`
 * and `x>-2.4`, can never be mistaken for each other.
 */
export function boundaryPoints(k: number, v = "x"): Array<Record<string, number>> {
  const deltas = [0, 0.001, 0.01, 0.05, 0.1, 0.25, 0.5, 1, 2, 5];
  return deltas.flatMap((d) => (d === 0 ? [{ [v]: k }] : [{ [v]: k - d }, { [v]: k + d }]));
}

/**
 * Splits a relation `lhs op rhs` (one of `= < > \le \ge \leq \geq`) into its
 * parts. Used by `verify()` to check answers with the CAS, by a different
 * route than the generators use.
 */
export function splitRelation(latex: string): { lhs: string; op: Rel | "="; rhs: string } | null {
  const m = latex.match(/^(.*?)(\\leq?|\\geq?|<|>|=)(.*)$/);
  if (!m) return null;
  const raw = m[2];
  const op: Rel | "=" = raw.startsWith("\\le") ? "\\le" : raw.startsWith("\\ge") ? "\\ge" : (raw as Rel | "=");
  return { lhs: m[1].trim(), op, rhs: m[3].trim() };
}

/** Truth of a relation at `values`, evaluated with the CAS. Null when undefined. */
export function relationTruth(latex: string, values: Record<string, number>): boolean | null {
  const parts = splitRelation(latex);
  if (!parts) return null;
  const a = evaluate(parse(parts.lhs), values);
  const b = evaluate(parse(parts.rhs), values);
  if (a === null || b === null) return null;
  if (parts.op === "=") return Math.abs(a - b) < 1e-9;
  return relHolds(a, parts.op, b);
}

/** The values a prompt gives, like `$x=4$` or `$p=-2$` (for `verify`). */
export function givenValues(text: string): Record<string, number> {
  const out: Record<string, number> = {};
  for (const m of text.matchAll(/\$([a-zA-Z])=(-?\d+)\$/g)) out[m[1]] = Number(m[2]);
  return out;
}

/** `3x`, `-x`, `5`: one term as LaTeX (re-export for lesson files). */
export { term, frac, sum };
