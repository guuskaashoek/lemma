/**
 * Validation of worked solutions, step by step.
 *
 * Every worked example and every "hint 3" solution in Lemma is a list of
 * steps. A test runs `validateSteps` on all of them, so a step that does not
 * follow from the previous one can never reach a learner.
 *
 * Two kinds of steps exist:
 * - Expressions (`3+4\cdot2` → `3+8` → `11`): consecutive steps must be
 *   equivalent expressions.
 * - Relations, i.e. equations and inequalities (`2x+3=7` → `2x=4` → `x=2`):
 *   consecutive steps must have the same truth value at every test point.
 *   Test points are the known solutions plus random points, so a step that
 *   loses or invents a solution is caught.
 */
import { ce, closeEnough, equivalent, freeVariables, isInvalid, parse, type BoxedExpr, type MathJson } from "./cas";
import { normalizeLatex } from "./normalize";
import { createRng } from "./random";

const RELATIONS = new Set(["Equal", "Less", "LessEqual", "Greater", "GreaterEqual", "NotEqual"]);
const LOGIC = new Set(["Or", "And"]);

/** Does this LaTeX contain an equation or inequality at the top level? */
export function isRelation(latex: string): boolean {
  const json = parse(latex).json as MathJson;
  return Array.isArray(json) && (RELATIONS.has(String(json[0])) || LOGIC.has(String(json[0])));
}

/**
 * Truth value of a relation (or Or/And of relations) at a point.
 * Returns `null` when a side is undefined there.
 */
function truthAt(json: MathJson, point: Record<string, number>): boolean | null {
  if (!Array.isArray(json)) return null;
  const head = String(json[0]);
  if (LOGIC.has(head)) {
    const parts = json.slice(1).map((j) => truthAt(j as MathJson, point));
    if (parts.some((p) => p === null)) return null;
    return head === "Or" ? parts.some(Boolean) : parts.every(Boolean);
  }
  if (!RELATIONS.has(head) || json.length !== 3) return null;
  const lhs = valueAt(ce().box(json[1] as never), point);
  const rhs = valueAt(ce().box(json[2] as never), point);
  if (lhs === null || rhs === null) return null;
  const eq = closeEnough(lhs, rhs, 1e-9);
  switch (head) {
    case "Equal":
      return eq;
    case "NotEqual":
      return !eq;
    case "Less":
      return lhs < rhs && !eq;
    case "LessEqual":
      return lhs < rhs || eq;
    case "Greater":
      return lhs > rhs && !eq;
    case "GreaterEqual":
      return lhs > rhs || eq;
  }
  return null;
}

function valueAt(expr: BoxedExpr, point: Record<string, number>): number | null {
  const subs: Record<string, BoxedExpr> = {};
  for (const [k, v] of Object.entries(point)) subs[k] = ce().number(v);
  const r = expr.subs(subs).N();
  if (typeof r.im === "number" && Math.abs(r.im) > 1e-12) return null;
  return typeof r.re === "number" && Number.isFinite(r.re) ? r.re : null;
}

export type StepCheck = { ok: true } | { ok: false; index: number; reason: string };

export type StepOptions = {
  /**
   * For relation steps: the known solutions, as variable assignments, e.g.
   * `[{ x: 2 }, { x: -3 }]`. Every equation step must hold at these points.
   */
  solutions?: Array<Record<string, number>>;
};

/** Checks that every step follows from the previous one. */
export function validateSteps(steps: string[], opts: StepOptions = {}): StepCheck {
  if (steps.length === 0) return { ok: false, index: 0, reason: "no steps" };

  const parsed = steps.map((s) => parse(s));
  for (let i = 0; i < parsed.length; i++) {
    if (isInvalid(parsed[i])) return { ok: false, index: i, reason: `cannot parse: ${steps[i]}` };
  }

  const relation = steps.map(isRelation);
  if (relation.some((r) => r !== relation[0])) {
    return { ok: false, index: relation.indexOf(!relation[0]), reason: "mixes expressions and relations" };
  }

  if (!relation[0]) {
    for (let i = 1; i < steps.length; i++) {
      if (!equivalent(steps[i - 1], steps[i])) {
        return { ok: false, index: i, reason: `not equivalent to previous step: ${steps[i - 1]} → ${steps[i]}` };
      }
    }
    return { ok: true };
  }

  // Relations: compare truth values at known solutions and random points.
  const vars = [...new Set(parsed.flatMap((p) => freeVariables(p)))];
  const points: Array<Record<string, number>> = [...(opts.solutions ?? [])];
  const rng = createRng(`steps:${normalizeLatex(steps[0])}`);
  for (let k = 0; k < 24; k++) {
    const p: Record<string, number> = {};
    for (const v of vars) p[v] = Math.round(rng.sign() * (0.1 + rng.next() * 9.9) * 1e4) / 1e4;
    points.push(p);
  }

  const jsons = parsed.map((p) => p.json as MathJson);
  for (let i = 0; i < jsons.length; i++) {
    for (const sol of opts.solutions ?? []) {
      if (truthAt(jsons[i], sol) === false) {
        return { ok: false, index: i, reason: `step does not hold for solution ${JSON.stringify(sol)}: ${steps[i]}` };
      }
    }
    if (i === 0) continue;
    for (const p of points) {
      const before = truthAt(jsons[i - 1], p);
      const after = truthAt(jsons[i], p);
      if (before === null || after === null) continue;
      if (before !== after) {
        return {
          ok: false,
          index: i,
          reason: `truth value changes at ${JSON.stringify(p)}: ${steps[i - 1]} → ${steps[i]}`,
        };
      }
    }
  }
  return { ok: true };
}
