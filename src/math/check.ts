/**
 * Answer checking.
 *
 * An answer is correct when it is mathematically equivalent to the expected
 * answer (via the CAS, never by comparing text) AND written in the form the
 * exercise asks for. When it is wrong we try to say why: wrong form, a known
 * typical mistake, or simply a different value.
 */
import type { Loc } from "@/i18n/locale";
import {
  closeEnough,
  equivalentExpr,
  evaluate,
  freeVariables,
  isInvalid,
  parse,
  parseRaw,
  type MathJson,
} from "./cas";
import {
  countVariableFactors,
  decimalPlaces,
  hasCommonFactorLeft,
  hasUnexpandedProduct,
  integerLiteral,
  isSimplestFraction,
  numberLiteral,
  unwrap,
} from "./form";
import { normalizeLatex } from "./normalize";
import { isRelation, validateSteps } from "./steps";

/**
 * The form an answer must have.
 * - `any`: any equivalent expression is fine (1/2, 0.5 and 2/4 all count).
 * - `integer`: a whole number written as such.
 * - `fraction`: an integer or a fraction in lowest terms (no decimals).
 * - `decimal`: a number rounded to `decimals` places.
 * - `factored`: a product with at least `minFactors` non-constant factors.
 * - `expanded`: no brackets around sums left.
 */
export type AnswerForm = "any" | "integer" | "fraction" | "decimal" | "factored" | "expanded";

export type ExprAnswer = {
  kind: "expr";
  /** Expected answer in LaTeX. */
  latex: string;
  form?: AnswerForm;
  /** For `decimal`: number of decimals to round to. */
  decimals?: number;
  /** For `factored`: minimum number of non-constant factors. */
  minFactors?: number;
  /** Optional unit shown next to the input, e.g. "cm²". Not typed by the learner. */
  unit?: string;
};

/** One or more solutions of an equation, order does not matter. Empty = no solution. */
export type SolutionsAnswer = {
  kind: "solutions";
  variable: string;
  values: string[];
  form?: AnswerForm;
  decimals?: number;
};

/**
 * An equation or inequality as the answer, e.g. `x<3` or `y=2x+1`.
 * Correct when it has the same truth value as the expected one everywhere:
 * `3>x` counts for `x<3`. `points` adds boundary points to compare at.
 */
export type RelationAnswer = {
  kind: "relation";
  latex: string;
  points?: Array<Record<string, number>>;
};

/**
 * Several answers at once, each with its own box and label, e.g. a system
 * of equations (`x=` and `y=`), coordinates, or the entries of a vector.
 */
export type MultiAnswer = {
  kind: "multi";
  parts: Array<{ label: string; answer: Omit<ExprAnswer, "kind"> }>;
};

/** Multiple choice. */
export type ChoiceAnswer = {
  kind: "choice";
  options: Array<{ latex?: string; text?: Loc }>;
  correctIndex: number;
};

export type AnswerSpec = ExprAnswer | SolutionsAnswer | ChoiceAnswer | RelationAnswer | MultiAnswer;

/** What the learner submitted. */
export type Submission =
  | { kind: "expr"; latex: string }
  | { kind: "solutions"; latex: string[]; noSolution?: boolean }
  | { kind: "choice"; index: number }
  | { kind: "relation"; latex: string }
  | { kind: "multi"; latex: string[] };

/** A typical wrong answer with a targeted explanation. */
export type Mistake = {
  id: string;
  /** The wrong answer this mistake produces, in LaTeX. */
  latex: string;
  explain: Loc;
  /** Skill from earlier material this mistake points to (for "repeat this" links). */
  relatedSkill?: string;
};

export type CheckResult =
  | { correct: true }
  | {
      correct: false;
      reason: "empty" | "invalid" | "form" | "value" | "mistake";
      /** For `form`: which form was expected. */
      form?: AnswerForm;
      decimals?: number;
      /** For `mistake`: the recognised typical mistake. */
      mistake?: Mistake;
      /** For `multi`: which parts are wrong (by index). */
      wrongParts?: number[];
      /** Equivalent value but more decimals than asked, etc. */
      note?: "equivalent-but-form" | "too-many-decimals" | "missing-solution" | "extra-solution";
    };

const NOT_EMPTY = /\S/;

/** Strips a leading `x =` from an answer like `x = 3`. */
function stripAssignment(latex: string, variable?: string): string {
  const norm = normalizeLatex(latex);
  const m = norm.match(/^\s*([a-zA-Z])\s*=\s*(.+)$/);
  if (m && (!variable || m[1] === variable)) return m[2];
  return norm;
}

/** Checks a single expression against an expected expression and form. */
export function checkExpr(
  expected: { latex: string; form?: AnswerForm; decimals?: number; minFactors?: number },
  input: string,
  variable?: string,
): CheckResult {
  if (!NOT_EMPTY.test(input)) return { correct: false, reason: "empty" };
  const latex = stripAssignment(input, variable);
  const raw = parseRaw(latex);
  const canon = parse(latex);
  if (isInvalid(raw) || isInvalid(canon)) return { correct: false, reason: "invalid" };

  const exp = parse(expected.latex);
  const form = expected.form ?? "any";

  // Rounded decimals are compared to the correctly rounded value.
  if (form === "decimal") {
    const d = expected.decimals ?? 2;
    const exact = evaluate(exp);
    const given = evaluate(canon);
    if (exact === null || given === null) return { correct: false, reason: "value" };
    const rounded = roundHalfAwayFromZero(exact, d);
    if (closeEnough(given, rounded, 1e-12)) {
      return numberLiteral(raw.json as MathJson) === null
        ? { correct: false, reason: "form", form, decimals: d, note: "equivalent-but-form" }
        : { correct: true };
    }
    // Right value, but not rounded (or rounded differently).
    if (Math.abs(given - exact) < 0.5 * 10 ** -d && decimalPlaces(normalizeLatex(latex)) > d) {
      return { correct: false, reason: "form", form, decimals: d, note: "too-many-decimals" };
    }
    return { correct: false, reason: "value" };
  }

  if (!equivalentExpr(canon, exp)) return { correct: false, reason: "value" };

  const json = unwrap(raw.json as MathJson);
  const formOk = (() => {
    switch (form) {
      case "any":
        return true;
      case "integer":
        return integerLiteral(json) !== null;
      case "fraction":
        return isSimplestFraction(json);
      case "factored":
        // Factored completely: enough factors and no common factor left inside a bracket.
        return countVariableFactors(json) >= (expected.minFactors ?? 2) && !hasCommonFactorLeft(json);
      case "expanded":
        return !hasUnexpandedProduct(json);
    }
  })();
  return formOk
    ? { correct: true }
    : { correct: false, reason: "form", form, note: "equivalent-but-form" };
}

/** Rounds like a school calculator: 2.345 → 2.35, -2.345 → -2.35. */
export function roundHalfAwayFromZero(value: number, decimals: number): number {
  const f = 10 ** decimals;
  // The tiny epsilon fixes binary representation issues like 1.005.
  return (Math.sign(value) * Math.round(Math.abs(value) * f + 1e-9)) / f;
}

/** Full check of a submission, including typical mistakes. */
export function checkAnswer(
  spec: AnswerSpec,
  submission: Submission,
  mistakes: Mistake[] = [],
): CheckResult {
  const result = checkCore(spec, submission);
  if (result.correct || result.reason === "form" || result.reason === "empty") return result;

  // Wrong value: is it a known typical mistake?
  if (submission.kind === "expr") {
    for (const m of mistakes) {
      const r = checkExpr({ latex: m.latex }, submission.latex);
      if (r.correct) return { correct: false, reason: "mistake", mistake: m };
    }
  }
  if (submission.kind === "solutions" && spec.kind === "solutions" && submission.latex.length === 1) {
    for (const m of mistakes) {
      const r = checkExpr({ latex: m.latex }, submission.latex[0], spec.variable);
      if (r.correct) return { correct: false, reason: "mistake", mistake: m };
    }
  }
  return result;
}

function checkCore(spec: AnswerSpec, submission: Submission): CheckResult {
  switch (spec.kind) {
    case "relation": {
      if (submission.kind !== "relation") return { correct: false, reason: "invalid" };
      if (!NOT_EMPTY.test(submission.latex)) return { correct: false, reason: "empty" };
      const given = parse(submission.latex);
      if (isInvalid(given) || !isRelation(submission.latex)) return { correct: false, reason: "invalid" };
      return validateSteps([spec.latex, submission.latex], { points: spec.points }).ok
        ? { correct: true }
        : { correct: false, reason: "value" };
    }

    case "multi": {
      if (submission.kind !== "multi") return { correct: false, reason: "invalid" };
      const results = spec.parts.map((p, i) => checkExpr(p.answer, submission.latex[i] ?? ""));
      if (results.every((r) => r.correct)) return { correct: true };
      if (results.every((r) => !r.correct && r.reason === "empty")) return { correct: false, reason: "empty" };
      const wrongParts = results.flatMap((r, i) => (r.correct ? [] : [i]));
      const form = results.find((r) => !r.correct && r.reason === "form");
      if (form && !form.correct && wrongParts.length === 1) return { ...form, wrongParts };
      return { correct: false, reason: "value", wrongParts };
    }

    case "choice":
      if (submission.kind !== "choice") return { correct: false, reason: "invalid" };
      return submission.index === spec.correctIndex
        ? { correct: true }
        : { correct: false, reason: "value" };

    case "expr":
      if (submission.kind !== "expr") return { correct: false, reason: "invalid" };
      return checkExpr(spec, submission.latex);

    case "solutions": {
      if (submission.kind !== "solutions") return { correct: false, reason: "invalid" };
      if (submission.noSolution) {
        return spec.values.length === 0 ? { correct: true } : { correct: false, reason: "value", note: "missing-solution" };
      }
      const given = submission.latex.filter((l) => NOT_EMPTY.test(l));
      if (given.length === 0) return { correct: false, reason: "empty" };
      if (spec.values.length === 0) return { correct: false, reason: "value" };

      // Match each given solution to a different expected one.
      const remaining = [...spec.values];
      let formProblem: CheckResult | null = null;
      for (const g of given) {
        const idx = remaining.findIndex((v) => {
          const r = checkExpr({ latex: v, form: spec.form, decimals: spec.decimals }, g, spec.variable);
          if (!r.correct && r.reason === "form") formProblem = r;
          return r.correct;
        });
        if (idx === -1) {
          if (formProblem) return formProblem;
          // Valid expression but not a solution, or a syntax error.
          const parsed = parse(stripAssignment(g, spec.variable));
          if (isInvalid(parsed)) return { correct: false, reason: "invalid" };
          return { correct: false, reason: "value", note: "extra-solution" };
        }
        remaining.splice(idx, 1);
      }
      if (remaining.length > 0) return { correct: false, reason: "value", note: "missing-solution" };
      return { correct: true };
    }
  }
}

/** Does `latex` contain a variable? Used to choose the right input keyboard. */
export function hasFreeVariables(latex: string): boolean {
  return freeVariables(parse(latex)).length > 0;
}
