/**
 * Pure helpers behind the unit 3 widgets (no React), so they can be tested.
 */
import Fraction from "fraction.js";

/** A widget prop that holds a number, given as a number or a fraction string ("2/3"). */
export function toNum(v: unknown, fallback = 0): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    try {
      return new Fraction(v).valueOf();
    } catch {
      return fallback;
    }
  }
  return fallback;
}

/** Same, but exact. */
export function toFrac(v: unknown): Fraction {
  if (typeof v === "string" || typeof v === "number") {
    try {
      return new Fraction(v);
    } catch {
      return new Fraction(0);
    }
  }
  return new Fraction(0);
}

/**
 * A number as short text for a picture: `3`, `-2`, `2/3`, `-1/2`.
 * Simple fractions stay fractions (school style); anything else is rounded.
 */
export function numLabel(v: number, locale: "nl" | "en"): string {
  const f = new Fraction(v).simplify(1e-9);
  if (Number(f.d) === 1) return String(Number(f.s) * Number(f.n)).replace("-", "−");
  if (Number(f.d) <= 12 && Math.abs(f.valueOf() - v) < 1e-9) {
    return `${f.s < 0 ? "−" : ""}${f.n}/${f.d}`;
  }
  const r = String(Math.round(v * 100) / 100).replace("-", "−");
  return locale === "nl" ? r.replace(".", ",") : r;
}

/** A number as LaTeX for a formula in a widget: `3`, `-2`, `\frac{2}{3}`. */
export function numTex(v: number): string {
  const f = new Fraction(v).simplify(1e-9);
  const n = Number(f.s) * Number(f.n);
  if (Number(f.d) === 1) return String(n);
  return `${n < 0 ? "-" : ""}\\frac{${Math.abs(n)}}{${f.d}}`;
}

/** `ax+b` as LaTeX from plain numbers. */
export function linTex(a: number, b: number): string {
  const parts: string[] = [];
  if (Math.abs(a) > 1e-12) {
    if (Math.abs(a - 1) < 1e-12) parts.push("x");
    else if (Math.abs(a + 1) < 1e-12) parts.push("-x");
    else parts.push(`${numTex(a)}x`);
  }
  if (Math.abs(b) > 1e-12 || parts.length === 0) {
    const t = numTex(b);
    parts.push(parts.length === 0 || t.startsWith("-") ? t : `+${t}`);
  }
  return parts.join("");
}

export type Range = [number, number];

/**
 * A window for a coordinate plane: whole numbers, the origin inside, every
 * point inside with a margin of 1, and at least `minSpan` units wide and high.
 */
export function planeWindow(points: Array<[number, number]>, minSpan = 8): { x: Range; y: Range } {
  const fit = (vals: number[]): Range => {
    let lo = Math.floor(Math.min(0, ...vals)) - 1;
    let hi = Math.ceil(Math.max(0, ...vals)) + 1;
    while (hi - lo < minSpan) {
      if (hi - lo < minSpan) hi++;
      if (hi - lo < minSpan) lo--;
    }
    return [lo, hi];
  };
  return { x: fit(points.map((p) => p[0])), y: fit(points.map((p) => p[1])) };
}

/** A "nice" grid step for a range: 1, 2, 5, 10, 20, 50, ... with at most about 16 lines. */
export function gridStep(span: number): number {
  for (let p = 1; ; p *= 10) {
    for (const m of [1, 2, 5]) if (span / (m * p) <= 16) return m * p;
  }
}

/** One step of the staircase "1 to the right, then a up". */
export type Stair = { from: [number, number]; corner: [number, number]; to: [number, number] };

/** `n` steps of the staircase of `y = ax + b`, starting at x = `x0`. */
export function stairs(a: number, b: number, x0: number, n: number, dx = 1): Stair[] {
  const out: Stair[] = [];
  for (let i = 0; i < n; i++) {
    const x = x0 + i * dx;
    const y = a * x + b;
    out.push({ from: [x, y], corner: [x + dx, y], to: [x + dx, a * (x + dx) + b] });
  }
  return out;
}

/** Intersection of `y = a1 x + b1` and `y = a2 x + b2`, or null for parallel lines. */
export function meet(a1: number, b1: number, a2: number, b2: number): [number, number] | null {
  if (Math.abs(a1 - a2) < 1e-12) return null;
  const x = (b2 - b1) / (a1 - a2);
  return [x, a1 * x + b1];
}

/** A row of a system: `x·(circle) + y·(square) = c`. */
export type Row = { x: number; y: number; c: number };

export const scaleRow = (r: Row, m: number): Row => ({ x: r.x * m, y: r.y * m, c: r.c * m });
export const addRows = (r: Row, s: Row): Row => ({ x: r.x + s.x, y: r.y + s.y, c: r.c + s.c });
export const subRows = (r: Row, s: Row): Row => ({ x: r.x - s.x, y: r.y - s.y, c: r.c - s.c });

/**
 * What happens when you combine two rows: do the squares cancel? Returns
 * the new row and whether only circles are left.
 */
export function combine(r1: Row, r2: Row, op: "add" | "sub"): { row: Row; squaresGone: boolean } {
  const row = op === "add" ? addRows(r1, r2) : subRows(r1, r2);
  return { row, squaresGone: Math.abs(row.y) < 1e-12 && Math.abs(row.x) > 1e-12 };
}

/** Is `v` (nearly) a whole multiple of `step`? Used to snap walkers. */
export function onGrid(v: number, step: number): boolean {
  const k = v / step;
  return Math.abs(k - Math.round(k)) < 1e-9;
}
