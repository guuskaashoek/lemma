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
  return true;
}
