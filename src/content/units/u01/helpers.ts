/**
 * Small helpers shared by the unit 1 generators and lessons.
 */
import Fraction from "fraction.js";
import type { GeneratedExercise, Loc } from "@/content/types";
import { evaluate, parse } from "@/math/cas";
import type { Mistake } from "@/math/check";
import type { VisualSpec } from "@/visuals/types";

/** Shorthand for a Dutch + English text. */
export const L = (nl: string, en: string): Loc => ({ nl, en });

/** A custom widget of this unit, with its read-aloud description. */
export function custom(widget: string, props: Record<string, unknown>, describe: Loc): VisualSpec {
  return { kind: "custom", widget, props, describe };
}

/** The props of an exercise's custom visual (for `verify`). */
export function propsOf(ex: GeneratedExercise, widget: string): Record<string, unknown> | null {
  const v = ex.visual;
  return v && v.kind === "custom" && v.widget === widget ? v.props : null;
}

/** Numeric value of a LaTeX expression via the CAS, or null. */
export function valueOf(latex: string): number | null {
  return evaluate(parse(latex));
}

/** A whole number in a formula; negative numbers get brackets: `(-3)`. */
export function br(n: number): string {
  return n < 0 ? `(${n})` : String(n);
}

/** A signed term after an operator: `+5`, `+(-5)`, `-5`, `-(-5)`. */
export function opTerm(op: "+" | "-", n: number): string {
  return `${op}${br(n)}`;
}

/** Plain text for a number in SVG labels or read-aloud: a real minus sign. */
export function numText(n: number): string {
  return n < 0 ? `−${-n}` : String(n);
}

/**
 * Keeps only mistakes whose answer differs from the right answer and from
 * each other. A "mistake" that equals the answer would mark a right answer
 * as wrong.
 */
export function cleanMistakes(answer: string, mistakes: Array<Mistake | null>): Mistake[] {
  const right = valueOf(answer);
  const seen = new Set<number>();
  const out: Mistake[] = [];
  for (const m of mistakes) {
    if (!m) continue;
    const v = valueOf(m.latex);
    if (v === null || right === null || Math.abs(v - right) < 1e-9 || seen.has(v)) continue;
    seen.add(v);
    out.push(m);
  }
  return out;
}

/**
 * A decimal number as an exact string, built from digits (never from
 * floating-point multiplication): `digits · 10^shift`.
 * `decimalString(45, 3)` → "45000", `decimalString(32, -5)` → "0.00032".
 */
export function decimalString(digits: number, shift: number): string {
  const sign = digits < 0 ? "-" : "";
  let s = String(Math.abs(digits));
  if (shift >= 0) s = s + "0".repeat(shift);
  else {
    const k = -shift;
    if (s.length <= k) s = "0".repeat(k - s.length + 1) + s;
    s = `${s.slice(0, s.length - k)}.${s.slice(s.length - k)}`;
    s = s.replace(/\.?0+$/, "");
  }
  return sign + s;
}

/** A number string with thin spaces between groups of three: `45\,000`. */
export function grouped(s: string): string {
  const [int, dec] = s.split(".");
  const neg = int.startsWith("-");
  const digits = neg ? int.slice(1) : int;
  const g = digits.length > 4 ? digits.replace(/\B(?=(\d{3})+(?!\d))/g, "\\,") : digits;
  return `${neg ? "-" : ""}${g}${dec !== undefined ? `.${dec}` : ""}`;
}

/** The exact value `digits · 10^shift` as a fraction. */
export function decimalFraction(digits: number, shift: number): Fraction {
  return shift >= 0 ? new Fraction(digits).mul(new Fraction(10).pow(shift)) : new Fraction(digits).div(new Fraction(10).pow(-shift));
}

/**
 * Replaces a one-letter variable by a number, leaving LaTeX commands such
 * as `\frac` alone: `subLetter("\\frac{a^{2}}{a}", "a", 1.5)`.
 */
export function subLetter(latex: string, letter: string, value: number): string {
  return latex.replace(/\\[a-zA-Z]+|[a-zA-Z]/g, (m) => (m === letter ? `(${value})` : m));
}

/** Integer square root when `n` is a perfect square, else null. */
export function perfectRoot(n: number): number | null {
  const r = Math.round(Math.sqrt(n));
  return r * r === n ? r : null;
}
