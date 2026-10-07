/**
 * Small helpers shared by the unit 4 generators and lessons: texts,
 * LaTeX for quadratics and their factors, and plane windows.
 */
import Fraction from "fraction.js";
import type { GeneratedExercise, Loc } from "@/content/types";
import { evaluate, parse } from "@/math/cas";
import { frac, poly } from "@/math/latex";
import { compileFn } from "@/visuals/models/plot";
import type { VisualSpec } from "@/visuals/types";

/** Shorthand for a Dutch + English text. */
export const L = (nl: string, en: string): Loc => ({ nl, en });

/** A custom widget of this unit, with its read-aloud description. */
export function custom(widget: string, props: Record<string, unknown>, describe: Loc): VisualSpec {
  return { kind: "custom", widget, props, describe };
}

/** `ax^2+bx+c` as LaTeX. */
export const quad = (a: number, b: number, c: number) => poly([a, b, c]);

/**
 * The factor that is zero at `root`: `x-3`, `x+2`, or `x` for root 0.
 * Fractional roots give `x-\frac{1}{2}`; use `linear` for `2x-1` instead.
 */
export function rootFactor(root: number | Fraction): string {
  const r = new Fraction(root);
  if (r.equals(0)) return "x";
  return r.compare(0) > 0 ? `x-${frac(r)}` : `x+${frac(r.neg())}`;
}

/** The same factor in brackets, except a bare `x`. */
export function rootFactorB(root: number | Fraction): string {
  const f = rootFactor(root);
  return f === "x" ? "x" : `(${f})`;
}

/** `px+q` in brackets (`(2x-1)`), for a linear factor with whole coefficients. */
export function linear(p: number, q: number): string {
  return `(${poly([p, q])})`;
}

/** A number written after an operator: `3` or `(-3)`. */
export function par(n: number): string {
  return n < 0 ? `(${n})` : String(n);
}

/**
 * Note for removing a number from both sides of an equation:
 * "Haal 5 aan beide kanten weg." or "Tel aan beide kanten 5 op."
 */
export function removeNote(k: number, unit = ""): Loc {
  const t = (n: number) => (unit ? (n === 1 ? unit : `${n}${unit}`) : String(n));
  return k > 0
    ? L(`Haal aan beide kanten $${t(k)}$ weg.`, `Subtract $${t(k)}$ on both sides.`)
    : L(`Tel aan beide kanten $${t(-k)}$ op.`, `Add $${t(-k)}$ on both sides.`);
}

/**
 * Note for moving the right side `px+q` to the left:
 * "Haal aan beide kanten $11x$ weg en tel $24$ op."
 */
export function moveLeftNote(p: number, q: number): Loc {
  const parts: Array<{ nl: string; en: string }> = [];
  const add = (v: number, unit: string) => {
    if (v === 0) return;
    const t = unit && Math.abs(v) === 1 ? unit : `${Math.abs(v)}${unit}`;
    parts.push(v > 0 ? { nl: `haal $${t}$ weg`, en: `subtract $${t}$` } : { nl: `tel $${t}$ op`, en: `add $${t}$` });
  };
  add(p, "x");
  add(q, "");
  const nl = parts.map((x) => x.nl).join(" en ");
  const en = parts.map((x) => x.en).join(" and ");
  return L(`Aan beide kanten: ${nl}.`, `On both sides: ${en}.`);
}

/** A signed number for "+3" / "-3" texts. */
export function signed(n: number): string {
  return n < 0 ? String(n) : `+${n}`;
}

/** Value of a polynomial with coefficients a, b, c at x. */
export const f = (a: number, b: number, c: number, x: number) => a * x * x + b * x + c;

/** All pairs (p, q) with p · q = n and p <= q, including negative pairs. */
export function factorPairs(n: number): Array<[number, number]> {
  const out: Array<[number, number]> = [];
  if (n === 0) return out;
  const m = Math.abs(n);
  for (let d = 1; d * d <= m; d++) {
    if (m % d !== 0) continue;
    const e = m / d;
    if (n > 0) {
      out.push([d, e]);
      out.push([-e, -d]);
    } else {
      out.push([-d, e]);
      out.push([-e, d]);
    }
  }
  return out.sort((u, v) => u[0] - v[0]);
}

/** The positive pairs written as "1·12, 2·6, 3·4" for hints. */
export function pairsText(n: number): string {
  const m = Math.abs(n);
  const ps: string[] = [];
  for (let d = 1; d * d <= m; d++) if (m % d === 0) ps.push(`${d}\\cdot ${m / d}`);
  return ps.map((p) => `$${p}$`).join(", ");
}

/**
 * A plane window that shows the top and the zeros of `ax^2+bx+c`, with a
 * little room around them. Grid steps stay readable.
 */
export function parabolaWindow(a: number, b: number, c: number): { x: [number, number]; y: [number, number] } {
  const xt = -b / (2 * a);
  const yt = f(a, b, c, xt);
  const D = b * b - 4 * a * c;
  const xs = [xt, 0];
  if (D >= 0) xs.push((-b - Math.sqrt(D)) / (2 * a), (-b + Math.sqrt(D)) / (2 * a));
  let x0 = Math.floor(Math.min(...xs)) - 2;
  let x1 = Math.ceil(Math.max(...xs)) + 2;
  // Keep the axis of symmetry in the middle, so the picture looks symmetric.
  const half = Math.max(xt - x0, x1 - xt, 4);
  x0 = Math.floor(xt - half);
  x1 = Math.ceil(xt + half);
  const ys = [yt, 0, c, f(a, b, c, x0 + 1), f(a, b, c, x1 - 1)];
  const lo = Math.min(...ys);
  const hi = Math.max(...ys);
  const pad = Math.max(1, Math.ceil((hi - lo) * 0.12));
  return { x: [x0, x1], y: [Math.floor(lo) - pad, Math.ceil(hi) + pad] };
}

/** Plane visual of `y = ax^2+bx+c` with a tracer that starts left of the top. */
export function parabolaPlane(a: number, b: number, c: number, points: Array<{ x: number; y: number; label?: string }> = []): VisualSpec {
  const w = parabolaWindow(a, b, c);
  return {
    kind: "plane",
    ...w,
    graphs: [{ latex: quad(a, b, c) }],
    points: points.filter((p) => p.x >= w.x[0] && p.x <= w.x[1] && p.y >= w.y[0] && p.y <= w.y[1]),
    tracer: { graph: 0, start: w.x[0] + 1 },
  };
}

/** Numeric value of a LaTeX number (or null). */
export const num = (latex: string) => evaluate(parse(latex));

/** The expression answer of an exercise, or null. */
export function exprAnswer(ex: GeneratedExercise): string | null {
  return ex.answer.kind === "expr" ? ex.answer.latex : null;
}

/** The numeric solutions of an exercise, or null when they do not evaluate. */
export function solutionValues(ex: GeneratedExercise): number[] | null {
  if (ex.answer.kind !== "solutions") return null;
  const vs = ex.answer.values.map(num);
  return vs.every((v) => v !== null) ? (vs as number[]) : null;
}

/**
 * Reads the polynomial of an equation `lhs = rhs` numerically as
 * `lhs - rhs` (in x), for independent checks by substitution.
 */
export function equationFn(latex: string): ((x: number) => number | null) | null {
  const parts = latex.split("=");
  if (parts.length !== 2) return null;
  const g = compileFn(`(${parts[0]})-(${parts[1]})`);
  return (x: number) => {
    const v = g(x);
    return Number.isFinite(v) ? v : null;
  };
}

/** Is `latex` (in x) equal to zero at every value in `xs`? */
export function holdsAt(latex: string, xs: number[]): boolean {
  const g = equationFn(latex);
  if (!g) return false;
  return xs.every((x) => {
    const v = g(x);
    return v !== null && Math.abs(v) < 1e-7;
  });
}

/**
 * Number of real solutions of an equation in x, found numerically: count
 * sign changes and touching points of lhs - rhs on a fine grid. Used as an
 * independent check that does not use the discriminant.
 */
export function countRootsNumerically(latex: string, from = -60, to = 60): number {
  const g = equationFn(latex);
  if (!g) return -1;
  const n = 24000;
  let count = 0;
  let prev = g(from) ?? 0;
  for (let i = 1; i <= n; i++) {
    const x = from + ((to - from) * i) / n;
    const v = g(x) ?? 0;
    if (v === 0 || prev * v < 0) count++;
    prev = v;
  }
  // A touching point (double root) gives no sign change: look for a tiny minimum of |g|.
  if (count === 0) {
    let best = Number.POSITIVE_INFINITY;
    for (let i = 0; i <= n; i++) {
      const x = from + ((to - from) * i) / n;
      best = Math.min(best, Math.abs(g(x) ?? Number.POSITIVE_INFINITY));
    }
    if (best < 1e-3) count = 1;
  }
  return count;
}
