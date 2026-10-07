/**
 * Small helpers shared by the unit 0 generators and lessons.
 */
import Fraction from "fraction.js";
import type { GeneratedExercise, Loc } from "@/content/types";
import type { VisualSpec } from "@/visuals/types";

/**
 * A terminating decimal as LaTeX with a decimal point: 2.5, 0.375, 12.
 * The app shows a decimal comma in Dutch automatically.
 */
export function dec(value: Fraction | number): string {
  const v = typeof value === "number" ? value : value.valueOf();
  const s = String(Number(v.toFixed(10)));
  return s === "-0" ? "0" : s;
}

/** Money: whole amounts without cents, others with two decimals: 4.5 → "4.50", 12 → "12". */
export function money(value: Fraction | number): string {
  const v = typeof value === "number" ? value : value.valueOf();
  return Number.isInteger(v) ? String(v) : v.toFixed(2);
}

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

/** The exact value of an expression answer, or null. */
export function exprAnswer(ex: GeneratedExercise): string | null {
  return ex.answer.kind === "expr" ? ex.answer.latex : null;
}
