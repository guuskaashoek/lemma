/**
 * Thin wrapper around the Compute Engine (our CAS).
 *
 * All mathematical comparisons in Lemma go through this file:
 * - `parse` / `parseRaw` turn LaTeX into MathJSON (canonical or as typed).
 * - `equivalent` decides whether two expressions are mathematically equal.
 *
 * Equivalence is decided in two ways, and either one is enough:
 * 1. Symbolic: the CAS's canonical forms are identical.
 * 2. Numeric: both expressions give the same value at many random points.
 *    Points where either side is undefined (division by zero, log of a
 *    negative number, a complex result, ...) are skipped, so expressions with
 *    a restricted domain are still compared fairly.
 */
import { ComputeEngine } from "@cortex-js/compute-engine";
import { createRng } from "./random";
import { normalizeLatex } from "./normalize";

let engine: ComputeEngine | null = null;

/** Lazily created shared engine instance. */
export function ce(): ComputeEngine {
  if (!engine) engine = new ComputeEngine();
  return engine;
}

export type BoxedExpr = NonNullable<ReturnType<ComputeEngine["parse"]>>;
/** MathJSON as produced by the engine: numbers, symbols, strings or arrays. */
export type MathJson = number | string | MathJson[] | { [k: string]: unknown };

/** Parses normalised LaTeX into a canonical expression. */
export function parse(latex: string): BoxedExpr {
  return ce().parse(normalizeLatex(latex));
}

/** Parses LaTeX without simplifying it, so the learner's form is kept. */
export function parseRaw(latex: string): BoxedExpr {
  return ce().parse(normalizeLatex(latex), { form: "raw" });
}

/** True when the input is empty or contains a syntax error. */
export function isInvalid(expr: BoxedExpr): boolean {
  if (!expr.isValid) return true;
  const json = expr.json;
  return json === "Nothing" || JSON.stringify(json).includes('"Error"');
}

/** Names of the free variables in an expression, sorted. */
export function freeVariables(expr: BoxedExpr): string[] {
  const vars = expr.unknowns ?? [];
  return [...vars].filter((v) => !["Pi", "ExponentialE", "ImaginaryUnit"].includes(v)).sort();
}

/**
 * Evaluates an expression to a real JS number with the given variable values.
 * Returns `null` when the result is not a finite real number.
 */
export function evaluate(expr: BoxedExpr, values: Record<string, number> = {}): number | null {
  const subs: Record<string, BoxedExpr> = {};
  for (const [k, v] of Object.entries(values)) subs[k] = ce().number(v);
  const result = (Object.keys(subs).length ? expr.subs(subs) : expr).N();
  if (result.im !== 0 && result.im !== undefined && !Number.isNaN(result.im)) {
    if (Math.abs(result.im) > 1e-12) return null;
  }
  const re = result.re;
  if (typeof re !== "number" || !Number.isFinite(re)) return null;
  return re;
}

/** Relative + absolute tolerance comparison for floating-point results. */
export function closeEnough(a: number, b: number, tol = 1e-9): boolean {
  return Math.abs(a - b) <= tol * Math.max(1, Math.abs(a), Math.abs(b));
}

export type EquivalenceOptions = {
  /** Number of valid sample points required for a "yes". */
  samples?: number;
  tolerance?: number;
};

/**
 * Decides whether two LaTeX expressions are mathematically equivalent.
 *
 * `x(x+2)` ≡ `x^2+2x`, `\frac{2}{4}` ≡ `0.5`, `\sqrt{8}` ≡ `2\sqrt{2}`.
 * Equations and inequalities are not handled here (see `equations.ts`).
 */
export function equivalent(a: string, b: string, opts: EquivalenceOptions = {}): boolean {
  const ea = parse(a);
  const eb = parse(b);
  if (isInvalid(ea) || isInvalid(eb)) return false;
  return equivalentExpr(ea, eb, opts);
}

export function equivalentExpr(ea: BoxedExpr, eb: BoxedExpr, opts: EquivalenceOptions = {}): boolean {
  const samples = opts.samples ?? 6;
  const tol = opts.tolerance ?? 1e-9;

  // 1. Symbolic shortcut.
  if (ea.isSame(eb)) return true;

  // 2. Numeric comparison at random points.
  const vars = [...new Set([...freeVariables(ea), ...freeVariables(eb)])];
  if (vars.length === 0) {
    const va = evaluate(ea);
    const vb = evaluate(eb);
    return va !== null && vb !== null && closeEnough(va, vb, tol);
  }

  // Deterministic sample points: non-integers avoid accidental cancellations
  // like x = 0 or x = 1. Both signs are tried for domain-restricted functions.
  const rng = createRng(`equiv:${vars.join(",")}`);
  let valid = 0;
  for (let attempt = 0; attempt < samples * 6 && valid < samples; attempt++) {
    const point: Record<string, number> = {};
    for (const v of vars) {
      const magnitude = 0.3 + rng.next() * 3.4;
      point[v] = Math.round((attempt % 3 === 0 ? magnitude : rng.sign() * magnitude) * 1e6) / 1e6;
    }
    const va = evaluate(ea, point);
    const vb = evaluate(eb, point);
    if (va === null && vb === null) continue; // both undefined here: skip
    if (va === null || vb === null) return false; // defined on one side only
    if (!closeEnough(va, vb, tol)) return false;
    valid++;
  }
  return valid >= Math.min(samples, 3);
}
