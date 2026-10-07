/**
 * Small helpers shared by the unit 3 generators and lessons.
 */
import Fraction from "fraction.js";
import type { GeneratedExercise, Loc } from "@/content/types";
import { frac, paren, sum } from "@/math/latex";
import type { Rng } from "@/math/random";
import type { VisualSpec } from "@/visuals/types";

/** Shorthand for a Dutch + English text. */
export const L = (nl: string, en: string): Loc => ({ nl, en });

export type Num = Fraction | number;
export const F = (v: Num) => new Fraction(v);

/** `ax+b` in LaTeX, written like a textbook: `2x+1`, `-x`, `\frac{1}{2}x-3`, `4`. */
export function lin(a: Num, b: Num): string {
  return sum([
    [a, "x"],
    [b, ""],
  ]);
}

/** A point as LaTeX: `(2,\ -3)`. The space keeps it apart from a decimal comma. */
export function pt(x: Num, y: Num): string {
  return `(${frac(x)},\\ ${frac(y)})`;
}

/** `a\cdot x` with the number filled in, negative numbers in brackets: `2\cdot(-3)`. */
export function times(a: Num, x: Num, mark?: "hl"): string {
  const xs = mark ? `\\${mark}{${paren(x)}}` : paren(x);
  return `${frac(a)}\\cdot ${xs}`;
}

/** `+3` or `-3`, for gluing a number behind a term. Zero gives "". */
export function signed(v: Num): string {
  const f = F(v);
  if (f.equals(0)) return "";
  return f.s < 0 ? frac(f) : `+${frac(f)}`;
}

/** `a - b` with brackets around a negative `b`: `7-(-2)`. */
export function minus(a: Num, b: Num): string {
  return `${frac(a)}-${paren(b)}`;
}

/** A custom widget of this unit, with its read-aloud description. */
export function custom(widget: string, props: Record<string, unknown>, describe: Loc): VisualSpec {
  return { kind: "custom", widget, props, describe };
}

/** The props of an exercise's custom visual (for `verify`). */
export function propsOf(ex: GeneratedExercise, widget: string): Record<string, unknown> | null {
  const v = ex.visual;
  return v && v.kind === "custom" && v.widget === widget ? v.props : null;
}

/** A whole number in [min, max] that is not in `not`. */
export function intNot(rng: Rng, min: number, max: number, not: number[]): number {
  for (;;) {
    const n = rng.int(min, max);
    if (!not.includes(n)) return n;
  }
}

/** Fraction as a plain JSON-safe string for widget props: "2/3", "-4". */
export function fracStr(v: Num): string {
  return F(v).toFraction();
}

/** "omhoog" / "omlaag" (or "up" / "down") for a change in y. */
export function upDown(dy: Num): Loc {
  return F(dy).s < 0 ? L("omlaag", "down") : L("omhoog", "up");
}

/** Absolute value as LaTeX. */
export function absL(v: Num): string {
  return frac(F(v).abs());
}

/** Denominator of a fraction as a plain number. */
export const den = (v: Num) => Number(F(v).d);

/** Is this fraction a whole number? */
export const isWhole = (v: Num) => den(v) === 1;
