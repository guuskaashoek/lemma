/**
 * Shared checks for learning content, used by the content tests.
 */
import katex from "katex";
import { evaluate, equivalent, isInvalid, parse } from "@/math/cas";
import { roundHalfAwayFromZero, type AnswerSpec, type Submission } from "@/math/check";
import { colorize, KATEX_OPTIONS } from "@/math/markup";
import { stripMarkup } from "@/math/normalize";
import { validateSteps } from "@/math/steps";
import type { Loc } from "@/i18n/locale";
import type { WorkedSolution } from "@/content/types";

/** Renders LaTeX exactly like the app does; throws on any KaTeX error. */
export function renderOrThrow(latex: string): void {
  katex.renderToString(colorize(latex), { ...KATEX_OPTIONS, macros: { ...KATEX_OPTIONS.macros }, throwOnError: true });
}

/** All `$...$` formulas inside a rich text. */
export function inlineFormulas(text: string): string[] {
  return [...text.matchAll(/\$([^$]+)\$/g)].map((m) => m[1]);
}

/** Problems with a localised text: missing language, empty, leftovers like "undefined". */
export function locProblems(loc: Loc, where: string): string[] {
  const problems: string[] = [];
  for (const lang of ["nl", "en"] as const) {
    const s = loc?.[lang];
    if (typeof s !== "string" || s.trim() === "") problems.push(`${where}: missing ${lang} text`);
    else if (/undefined|NaN|Infinity|\[object/.test(s)) problems.push(`${where}: suspicious text "${s}"`);
    else {
      if ((s.match(/\$/g) ?? []).length % 2 !== 0) problems.push(`${where}: unbalanced $ in "${s}"`);
      for (const f of inlineFormulas(s)) {
        try {
          renderOrThrow(f);
        } catch (e) {
          problems.push(`${where}: KaTeX cannot render "${f}": ${(e as Error).message}`);
        }
      }
    }
  }
  return problems;
}

/** Splits `lhs \approx rhs`. */
function splitApprox(latex: string): [string, string] | null {
  const parts = stripMarkup(latex).split("\\approx");
  return parts.length === 2 ? [parts[0].trim(), parts[1].trim()] : null;
}

/** Right-hand side of `x = ...`, or the expression itself. */
function valueOfStep(latex: string): number | null {
  const plain = stripMarkup(latex);
  const m = plain.match(/^\s*[a-zA-Z]\s*=(.+)$/);
  return evaluate(parse(m ? m[1] : plain));
}

/**
 * Validates a worked solution: exact steps with the CAS, rounding steps with
 * a tolerance, and every formula must render.
 */
export function workedSolutionProblems(sol: WorkedSolution, where: string): string[] {
  const problems: string[] = [];
  if (sol.steps.length === 0) return [`${where}: no steps`];

  for (const [i, step] of sol.steps.entries()) {
    try {
      renderOrThrow(step.latex);
    } catch (e) {
      problems.push(`${where} step ${i}: KaTeX error ${(e as Error).message}`);
    }
    problems.push(...locProblems(step.note, `${where} step ${i} note`));
  }

  const exact: string[] = [];
  for (const [i, step] of sol.steps.entries()) {
    if (step.approx) {
      const parts = splitApprox(step.latex);
      const before = exact[exact.length - 1];
      if (!parts || !before) {
        problems.push(`${where} step ${i}: rounding step needs "a \\approx b" after an exact step`);
        continue;
      }
      const v = valueOfStep(before);
      const shown = Number(parts[1].replace("{,}", ".").replace(",", "."));
      if (v === null || roundHalfAwayFromZero(v, step.approx.decimals) !== shown) {
        problems.push(`${where} step ${i}: ${v} does not round to ${shown}`);
      }
    } else {
      if (isInvalid(parse(step.latex))) problems.push(`${where} step ${i}: cannot parse "${step.latex}"`);
      exact.push(step.latex);
    }
  }
  if (exact.length > 0) {
    const r = validateSteps(exact, { solutions: sol.solutions });
    if (!r.ok) problems.push(`${where}: ${r.reason}`);
  }
  return problems;
}

/** The submission a perfect learner would give for an answer spec. */
export function perfectSubmission(spec: AnswerSpec): Submission {
  switch (spec.kind) {
    case "choice":
      return { kind: "choice", index: spec.correctIndex };
    case "solutions":
      if (spec.form === "decimal") {
        return {
          kind: "solutions",
          latex: spec.values.map((v) => String(roundHalfAwayFromZero(evaluate(parse(v))!, spec.decimals ?? 2))),
        };
      }
      return { kind: "solutions", latex: spec.values, noSolution: spec.values.length === 0 };
    case "expr":
      if (spec.form === "decimal") {
        return { kind: "expr", latex: String(roundHalfAwayFromZero(evaluate(parse(spec.latex))!, spec.decimals ?? 2)) };
      }
      return { kind: "expr", latex: spec.latex };
    case "relation":
      return { kind: "relation", latex: spec.latex };
    case "multi":
      return {
        kind: "multi",
        latex: spec.parts.map((p) =>
          p.answer.form === "decimal"
            ? String(roundHalfAwayFromZero(evaluate(parse(p.answer.latex))!, p.answer.decimals ?? 2))
            : p.answer.latex,
        ),
      };
  }
}

/** Does the final step of a solution match the expected answer? */
export function finalStepMatches(sol: WorkedSolution, spec: AnswerSpec): boolean {
  const exactSteps = sol.steps.filter((s) => !s.approx);
  const last = stripMarkup(exactSteps[exactSteps.length - 1].latex);
  if (spec.kind === "expr") {
    const m = last.match(/^\s*[a-zA-Z]\s*=(.+)$/);
    return equivalent(m ? m[1] : last, spec.latex);
  }
  if (spec.kind === "solutions") {
    // validateSteps already checked every step holds for `solutions`;
    // here we make sure those solutions are the expected ones.
    const given = (sol.solutions ?? []).map((s) => s[spec.variable]).sort((a, b) => a - b);
    const expected = spec.values.map((v) => evaluate(parse(v))!).sort((a, b) => a - b);
    return given.length === expected.length && given.every((g, i) => Math.abs(g - expected[i]) < 1e-9);
  }
  if (spec.kind === "relation") {
    return validateSteps([last, spec.latex], { points: spec.points }).ok;
  }
  return true;
}

// ---------------------------------------------------------------------------
// Visuals
// ---------------------------------------------------------------------------

import { BUNDLES } from "@/content/units";
import type { VisualSpec } from "@/visuals/types";
import { balanceLatex, initBalance, solution as balanceSolution } from "@/visuals/models/balance";
import { areaCells } from "@/visuals/models/area";
import { compileFn } from "@/visuals/models/plot";

/**
 * Checks a visual: sensible parameters, formulas that parse, and (when an
 * exercise is given) that the picture shows that exact exercise.
 */
export function visualProblems(spec: VisualSpec, where: string, exerciseLatex?: string): string[] {
  const p: string[] = [];
  const int = (v: unknown) => typeof v === "number" && Number.isInteger(v);
  switch (spec.kind) {
    case "balance": {
      const { a, b, c = 0, d = 0 } = spec;
      if (![a, b, c, d].every(int)) p.push(`${where}: balance needs whole numbers`);
      if (a < 0 || c < 0 || a > 8 || c > 8) p.push(`${where}: balance x-blocks must be 0..8`);
      if (Math.abs(b) > 60 || Math.abs(d) > 60) p.push(`${where}: balance has too many blocks to draw`);
      const sol = balanceSolution(initBalance(a, b, c, d));
      if (!sol) p.push(`${where}: balance equation has no single solution`);
      if (exerciseLatex && sol) {
        const r = validateSteps([exerciseLatex, balanceLatex(initBalance(a, b, c, d))], {
          solutions: [{ x: sol.valueOf() }],
        });
        if (!r.ok) p.push(`${where}: balance does not match the exercise: ${r.reason}`);
      }
      break;
    }
    case "number-line": {
      if (!(spec.min < spec.max)) p.push(`${where}: number line min must be < max`);
      let pos = spec.start ?? 0;
      for (const v of [pos, ...(spec.jumps ?? []).map((j) => (pos += j))]) {
        if (v < spec.min || v > spec.max) p.push(`${where}: number line walk leaves the range at ${v}`);
      }
      break;
    }
    case "fraction-bar":
      for (const bar of spec.bars) {
        if (!int(bar.num) || !int(bar.den) || bar.den < 1 || bar.den > 24 || bar.num < 0 || bar.num > 3 * bar.den) {
          p.push(`${where}: fraction bar ${bar.num}/${bar.den} cannot be drawn`);
        }
      }
      break;
    case "area-model":
      for (const term of [...spec.rows, ...spec.cols]) {
        if (isInvalid(parse(term))) p.push(`${where}: area model term "${term}" does not parse`);
      }
      try {
        areaCells(spec.rows, spec.cols);
      } catch (e) {
        p.push(`${where}: area model cells fail: ${(e as Error).message}`);
      }
      break;
    case "plane":
      if (!(spec.x[0] < spec.x[1] && spec.y[0] < spec.y[1])) p.push(`${where}: plane ranges are empty`);
      for (const g of spec.graphs ?? []) {
        if (isInvalid(parse(g.latex))) {
          p.push(`${where}: graph "${g.latex}" does not parse`);
          continue;
        }
        const f = compileFn(g.latex);
        const samples = Array.from({ length: 21 }, (_, i) => f(spec.x[0] + ((spec.x[1] - spec.x[0]) * i) / 20));
        if (!samples.some(Number.isFinite)) p.push(`${where}: graph "${g.latex}" is never defined in the window`);
        // The compiled function must agree with the CAS.
        const x = spec.x[0] + (spec.x[1] - spec.x[0]) * 0.37;
        const cas = evaluate(parse(g.latex), { x });
        if (cas !== null && Math.abs(cas - f(x)) > 1e-6 * Math.max(1, Math.abs(cas))) {
          p.push(`${where}: compiled graph "${g.latex}" disagrees with the CAS`);
        }
      }
      for (const pt of spec.points ?? []) {
        if (pt.x < spec.x[0] || pt.x > spec.x[1] || pt.y < spec.y[0] || pt.y > spec.y[1]) p.push(`${where}: point outside the window`);
      }
      break;
    case "right-triangle":
      if (!(spec.angle > 0 && spec.angle < 90)) p.push(`${where}: triangle angle must be between 0 and 90`);
      break;
    case "pythagoras":
      if (!(spec.a > 0 && spec.b > 0 && spec.a <= 20 && spec.b <= 20)) p.push(`${where}: pythagoras sides must be 1..20`);
      break;
    case "unit-circle":
      if (!Number.isFinite(spec.angle)) p.push(`${where}: unit circle angle must be a number`);
      break;
    case "function-machine": {
      if (isInvalid(parse(spec.latex))) p.push(`${where}: machine rule "${spec.latex}" does not parse`);
      else {
        const f = compileFn(spec.latex);
        for (const x of spec.inputs) if (!Number.isFinite(f(x))) p.push(`${where}: machine gives no output for ${x}`);
      }
      break;
    }
    case "custom": {
      const known = BUNDLES.some((b) => b.widgets && spec.widget in b.widgets);
      if (!known) p.push(`${where}: unknown custom widget ${spec.widget}`);
      p.push(...locProblems(spec.describe, `${where} visual description`));
      break;
    }
  }
  return p;
}

/** Each step may contain at most one `\ask{...}` blank, and it must parse. */
export function guidedProblems(sol: WorkedSolution, where: string): string[] {
  const p: string[] = [];
  sol.steps.forEach((s, i) => {
    const asks = [...s.latex.matchAll(/\\ask\{/g)].length;
    if (asks > 1) p.push(`${where} step ${i}: more than one \\ask blank`);
    const m = s.latex.match(/\\ask\{((?:[^{}]|\{[^{}]*\})*)\}/);
    if (m && isInvalid(parse(m[1]))) p.push(`${where} step ${i}: blank "${m[1]}" does not parse`);
  });
  return p;
}
