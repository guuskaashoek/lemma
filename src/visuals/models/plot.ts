/**
 * Function plotting helpers: compile a LaTeX formula once, then sample it
 * fast. Used by the coordinate plane and the function machine, so a graph is
 * always drawn from the same formula that is shown on screen.
 */
import { compile } from "@cortex-js/compute-engine";
import { parse } from "@/math/cas";

export type RealFn = (x: number) => number;

const cache = new Map<string, RealFn>();

/** Compiles `latex` (in the variable x) to a fast JS function. */
export function compileFn(latex: string): RealFn {
  const hit = cache.get(latex);
  if (hit) return hit;
  const compiled = compile(parse(latex) as never) as unknown as { run: (vars: Record<string, number>) => unknown };
  const fn: RealFn = (x) => {
    const v = compiled.run({ x });
    return typeof v === "number" ? v : Number.NaN;
  };
  cache.set(latex, fn);
  return fn;
}

/**
 * Polyline segments of a graph inside the y-range. Breaks the line where
 * the function is undefined or jumps (e.g. 1/x at x = 0).
 */
export function samplePath(fn: RealFn, x0: number, x1: number, y0: number, y1: number, n = 400): Array<Array<[number, number]>> {
  const out: Array<Array<[number, number]>> = [];
  let cur: Array<[number, number]> = [];
  const span = y1 - y0;
  for (let i = 0; i <= n; i++) {
    const x = x0 + ((x1 - x0) * i) / n;
    const y = fn(x);
    const ok = Number.isFinite(y) && y > y0 - span && y < y1 + span;
    const prev = cur[cur.length - 1];
    if (!ok || (prev && Math.abs(y - prev[1]) > span)) {
      if (cur.length > 1) out.push(cur);
      cur = ok ? [[x, y]] : [];
      continue;
    }
    cur.push([x, y]);
  }
  if (cur.length > 1) out.push(cur);
  return out;
}

/** Numerical derivative (central difference), for the slope at a point. */
export function slopeAt(fn: RealFn, x: number, h = 1e-5): number {
  return (fn(x + h) - fn(x - h)) / (2 * h);
}
