/**
 * Lesson 6: harder equations. Negative numbers, a minus in front of x,
 * x on both sides, fractions as answers, and brackets first.
 */
import Fraction from "fraction.js";
import type { Difficulty, Generator, GeneratedExercise, Loc, Step } from "@/content/types";
import type { Mistake } from "@/math/check";
import { frac, gcd, term } from "@/math/latex";
import type { Rng } from "@/math/random";
import { evaluate, parse } from "@/math/cas";
import type { VisualSpec } from "@/visuals/types";
import { custom, L, lin, relationTruth } from "../helpers";

/** `ax+b=cx+d` in LaTeX, with `c=0` written as just `d`. */
export const eqLatex = (a: number, b: number, c: number, d: number) => `${lin(a, b)}=${lin(c, d)}`;

/**
 * Worked steps for `ax+b=cx+d` (no brackets), after the first line:
 * x-terms to the left, plain numbers to the right, then divide.
 * Every step asks for the side that changed.
 */
export function solveSteps(a: number, b: number, c: number, d: number): Step[] {
  const steps: Step[] = [];
  let A = a;
  if (c !== 0) {
    A = a - c;
    const cx = term(Math.abs(c), "x");
    steps.push({
      latex: `\\ask{${term(A, "x")}}${b === 0 ? "" : b > 0 ? `+${b}` : b}=${d}`,
      note:
        c > 0
          ? L(`Haal links en rechts $${cx}$ weg.`, `Take $${cx}$ away on both sides.`)
          : L(`Tel links en rechts $${cx}$ op.`, `Add $${cx}$ on both sides.`),
    });
  }
  const rhs = d - b;
  if (b !== 0) {
    steps.push({
      latex: `${term(A, "x")}=\\ask{${rhs}}`,
      note: b > 0 ? L(`Haal links en rechts $${b}$ weg.`, `Take $${b}$ away on both sides.`) : L(`Tel links en rechts $${-b}$ op.`, `Add $${-b}$ on both sides.`),
    });
  }
  if (A !== 1) {
    const x = new Fraction(rhs, A);
    steps.push({
      latex: `x=\\ask{${frac(x)}}`,
      note:
        A < 0
          ? L(`Deel links en rechts door $${A}$. Het minteken deel je mee.`, `Divide both sides by $${A}$. The minus sign is divided too.`)
          : L(`Deel links en rechts door $${A}$.`, `Divide both sides by $${A}$.`),
    });
  }
  return steps;
}

/** Hint 1 for `ax+b=cx+d`, with this exercise's numbers. */
function nudge(a: number, b: number, c: number): Loc {
  if (c !== 0) {
    const cx = term(c, "x");
    return L(
      `Aan beide kanten staat een $x$-term. Zorg eerst dat rechts geen $x$ meer staat: rechts staat $${cx}$.`,
      `There is an $x$-term on both sides. First make sure there is no $x$ on the right: the right has $${cx}$.`,
    );
  }
  if (b !== 0) {
    return L(
      `Naast $${term(a, "x")}$ staat $${b > 0 ? `+${b}` : b}$. Doe aan beide kanten het omgekeerde: $${b > 0 ? `-${b}` : `+${-b}`}$.`,
      `Next to $${term(a, "x")}$ there is $${b > 0 ? `+${b}` : b}$. Do the opposite on both sides: $${b > 0 ? `-${b}` : `+${-b}`}$.`,
    );
  }
  return L(`Deel beide kanten door $${a}$, het getal voor $x$.`, `Divide both sides by $${a}$, the number in front of $x$.`);
}

/** The balance picture, when the equation fits on it (x-blocks 0..8). */
function balanceFor(a: number, b: number, c: number, d: number): VisualSpec | undefined {
  const fits = a >= 0 && c >= 0 && a <= 8 && c <= 8 && a !== c && Math.abs(b) <= 40 && Math.abs(d) <= 40;
  return fits ? { kind: "balance", a, b, c, d } : undefined;
}

const RULE = {
  text: L(
    "De balans: wat je links doet, doe je ook rechts. Eerst de $x$-termen naar één kant, dan de getallen naar de andere kant, dan delen.",
    "The balance: whatever you do on the left, you also do on the right. First the $x$-terms to one side, then the numbers to the other, then divide.",
  ),
  ruleId: "u2.balance-method",
  metaphor: "balance" as const,
};

/** Shared mistakes for `ax+b=cx+d` with solution x. */
function solveMistakes(a: number, b: number, c: number, d: number, x: Fraction): Mistake[] {
  const A = a - c;
  const out: Mistake[] = [];
  const add = (m: Mistake, v: Fraction) => {
    if (!v.equals(x) && !out.some((o) => o.latex === m.latex)) out.push(m);
  };
  if (b !== 0) {
    const v = new Fraction(d + b, A);
    add(
      {
        id: "sign-when-moving",
        latex: frac(v),
        explain: L(
          `Links staat $${b > 0 ? `+${b}` : b}$. Dat maak je weg met $${b > 0 ? `-${b}` : `+${-b}`}$, aan beide kanten.`,
          `The left has $${b > 0 ? `+${b}` : b}$. You remove it with $${b > 0 ? `-${b}` : `+${-b}`}$, on both sides.`,
        ),
      },
      v,
    );
  }
  if (A < 0) {
    const v = x.neg();
    add(
      {
        id: "divide-by-negative",
        latex: frac(v),
        explain: L(`Je deelt door $${A}$, met het minteken erbij. Dat draait het teken van je antwoord om.`, `You divide by $${A}$, minus sign included. That flips the sign of your answer.`),
      },
      v,
    );
  }
  if (d - b !== 0 && A !== 1 && A !== -1) {
    const v = new Fraction(A, d - b);
    add(
      {
        id: "divide-wrong-way",
        latex: frac(v),
        explain: L(
          `Bij $${term(A, "x")}=${d - b}$ deel je $${d - b}$ door $${A}$. Niet andersom.`,
          `For $${term(A, "x")}=${d - b}$ you divide $${d - b}$ by $${A}$. Not the other way round.`,
        ),
      },
      v,
    );
  }
  return out;
}

/** A solution x = p/q in lowest terms with q ≥ 2, or a whole number. */
function pickSolution(rng: Rng, A: number, fraction: boolean): Fraction {
  if (fraction && Math.abs(A) >= 2 && Math.abs(A) <= 6) {
    for (;;) {
      const p = rng.nonZeroInt(-12, 12);
      if (gcd(p, A) === 1) return new Fraction(p, A);
    }
  }
  return new Fraction(rng.nonZeroInt(-6, 9));
}

function verifyBySubstitution(ex: GeneratedExercise): boolean {
  // Independent check: substitute the solution back into the equation.
  if (ex.answer.kind !== "solutions" || ex.answer.values.length !== 1 || ex.latex === undefined) return false;
  // A linear equation holds at its solution and fails next to it.
  const x = evaluate(parse(ex.answer.values[0]));
  if (x === null) return false;
  return relationTruth(ex.latex, { x }) === true && relationTruth(ex.latex, { x: x + 1 }) === false;
}

const niceAnswer = (ex: GeneratedExercise) =>
  ex.answer.kind === "solutions" && ex.answer.values.every((v) => !/\\frac\{\d+\}\{(\d{2,})\}/.test(v));

// ---------------------------------------------------------------------------
// Negative numbers
// ---------------------------------------------------------------------------

function negativeParts(rng: Rng, difficulty: Difficulty): { a: number; b: number; c: number; d: number; x: Fraction; numberFirst: boolean } {
  if (difficulty === 1) {
    for (;;) {
      const a = rng.int(2, 6);
      const x = rng.nonZeroInt(-6, 9);
      const b = rng.nonZeroInt(-12, 12);
      const d = a * x + b;
      if (b < 0 || x < 0 || d < 0) return { a, b, c: 0, d, x: new Fraction(x), numberFirst: false };
    }
  }
  if (difficulty === 2) {
    const a = -rng.int(2, 6);
    const x = rng.nonZeroInt(-6, 6);
    const b = rng.int(1, 12);
    return { a, b, c: 0, d: a * x + b, x: new Fraction(x), numberFirst: rng.chance() };
  }
  for (;;) {
    const a = rng.nonZeroInt(-6, 6);
    const c = rng.nonZeroInt(-6, 6);
    if (a === c) continue;
    const b = rng.int(-12, 12);
    const x = pickSolution(rng, a - c, rng.chance(0.4));
    const dv = x.mul(a - c).add(b);
    if (!dv.equals(dv.round()) || Math.abs(dv.valueOf()) > 30) continue;
    const d = dv.valueOf();
    if (a < 0 || c < 0 || b < 0 || d < 0) return { a, b, c, d, x, numberFirst: false };
  }
}

export const equationNegative: Generator = {
  id: "u2.equation-negative",
  skillId: "u2.equations-negative",
  title: L("Vergelijkingen met negatieve getallen", "Equations with negative numbers"),
  generate(rng, difficulty) {
    const { a, b, c, d, x, numberFirst } = negativeParts(rng, difficulty);
    // `7-3x=1` reads more naturally than `-3x+7=1`; both mean the same.
    const latex = numberFirst ? `${b}${term(a, "x")}=${d}` : eqLatex(a, b, c, d);
    const steps: Step[] = [{ latex, note: L("Dit is de vergelijking.", "This is the equation.") }];
    if (numberFirst) steps.push({ latex: eqLatex(a, b, c, d), note: L("Zet de $x$-term vooraan. Het minteken gaat mee.", "Put the $x$-term first. The minus sign moves with it.") });
    steps.push(...solveSteps(a, b, c, d));
    const visual = balanceFor(a, b, c, d);
    return {
      prompt: L("Los de vergelijking op.", "Solve the equation."),
      latex,
      visual,
      answer: { kind: "solutions", variable: "x", values: [frac(x)] },
      calculator: "off",
      hints: {
        nudge: nudge(a, b, c),
        rule: RULE,
        solution: { steps, solutions: [{ x: x.valueOf() }] },
      },
      mistakes: solveMistakes(a, b, c, d, x),
    };
  },
  verify: verifyBySubstitution,
  isNice: niceAnswer,
};

// ---------------------------------------------------------------------------
// Brackets first
// ---------------------------------------------------------------------------

type BracketEq = { a: number; b: number; rhs: { c: number; e: number; bracket: boolean } | { value: number }; x: number };

function bracketParts(rng: Rng, difficulty: Difficulty): BracketEq {
  if (difficulty === 1) {
    const a = rng.int(2, 5);
    const b = rng.int(1, 6);
    const x = rng.int(1, 9);
    return { a, b, rhs: { value: a * (x + b) }, x };
  }
  if (difficulty === 2) {
    for (;;) {
      const a = rng.int(2, 5);
      const b = rng.nonZeroInt(-6, 6);
      const c = rng.int(-3, a - 1);
      const x = rng.nonZeroInt(-5, 9);
      const e = a * (x + b) - c * x; // rhs = cx + e
      if (c !== 0 && Math.abs(e) <= 40) return { a, b, rhs: { c, e, bracket: false }, x };
    }
  }
  for (;;) {
    const a = rng.pick([-1, 1]) * rng.int(2, 5);
    const c = rng.pick([-1, 1]) * rng.int(2, 5);
    if (a === c) continue;
    const b = rng.nonZeroInt(-8, 8);
    const x = rng.nonZeroInt(-6, 9);
    // a(x+b) = c(x+e)  ⇒  e = ((a-c)x + ab)/c
    const num = (a - c) * x + a * b;
    if (num % c !== 0) continue;
    const e = num / c;
    if (e !== 0 && Math.abs(e) <= 9) return { a, b, rhs: { c, e, bracket: true }, x };
  }
}

const bracket = (k: number, b: number) => `${k === -1 ? "-" : k}(${lin(1, b)})`;

export const equationBrackets: Generator = {
  id: "u2.equation-brackets",
  skillId: "u2.equations-brackets",
  title: L("Vergelijkingen met haakjes", "Equations with brackets"),
  generate(rng, difficulty) {
    const p = bracketParts(rng, difficulty);
    const { a, b, x } = p;
    const B = a * b;
    // Expanded right side: C·x + D.
    const [C, D, rhsLatex] =
      "value" in p.rhs
        ? [0, p.rhs.value, String(p.rhs.value)]
        : p.rhs.bracket
          ? [p.rhs.c, p.rhs.c * p.rhs.e, bracket(p.rhs.c, p.rhs.e)]
          : [p.rhs.c, p.rhs.e, lin(p.rhs.c, p.rhs.e)];
    const latex = `${bracket(a, b)}=${rhsLatex}`;
    const both = "c" in p.rhs && p.rhs.bracket;
    const steps: Step[] = [
      { latex, note: L("Dit is de vergelijking.", "This is the equation.") },
      {
        // With brackets on both sides, the right side is expanded in the same step.
        latex: `\\ask{${lin(a, B)}}=${both ? `\\hl{${lin(C, D)}}` : rhsLatex}`,
        note: both
          ? L(
              `Eerst haakjes weg, links en rechts. Links: $${a}$ keer $x$ én $${a}$ keer $${b < 0 ? `(${b})` : b}$.`,
              `Brackets first, on both sides. Left: $${a}$ times $x$ and $${a}$ times $${b < 0 ? `(${b})` : b}$.`,
            )
          : L(
              `Eerst haakjes weg: $${a}$ keer $x$ én $${a}$ keer $${b < 0 ? `(${b})` : b}$.`,
              `Brackets first: $${a}$ times $x$ and $${a}$ times $${b < 0 ? `(${b})` : b}$.`,
            ),
      },
    ];
    steps.push(...solveSteps(a, B, C, D));

    const mistakes: Mistake[] = [];
    if (a !== C) {
      // Only x multiplied: a(x+b) read as ax+b.
      const v = new Fraction(D - b, a - C);
      if (!v.equals(x)) {
        mistakes.push({
          id: "half-expanded",
          latex: frac(v),
          explain: L(
            `Bij $${bracket(a, b)}$ gaat $${a}$ keer allebei: $${lin(a, B)}$, niet $${lin(a, b)}$.`,
            `In $${bracket(a, b)}$, $${a}$ multiplies both terms: $${lin(a, B)}$, not $${lin(a, b)}$.`,
          ),
          relatedSkill: "u2.expand",
        });
      }
    }
    for (const m of solveMistakes(a, B, C, D, new Fraction(x))) if (!mistakes.some((o) => o.latex === m.latex)) mistakes.push(m);

    return {
      prompt: L("Los de vergelijking op.", "Solve the equation."),
      latex,
      // Hint 1 is about the brackets, so the picture shows the arrows for them.
      visual: custom(
        "u2.arrows",
        { left: [[a, 0]], right: [[1, 1], [b, 0]] },
        L(`Pijlen voor $${bracket(a, b)}$.`, `Arrows for $${bracket(a, b)}$.`),
      ),
      answer: { kind: "solutions", variable: "x", values: [String(x)] },
      calculator: "off",
      hints: {
        nudge: L(
          `Werk eerst de haakjes weg. $${bracket(a, b)}$ wordt $${a}\\cdot x$ plus $${a}\\cdot ${b < 0 ? `(${b})` : b}$.`,
          `First expand the brackets. $${bracket(a, b)}$ becomes $${a}\\cdot x$ plus $${a}\\cdot ${b < 0 ? `(${b})` : b}$.`,
        ),
        rule: {
          text: L(
            "Eerst haakjes weg. Daarna de balans: wat je links doet, doe je ook rechts.",
            "Brackets first. Then the balance: whatever you do on the left, you also do on the right.",
          ),
          ruleId: "u2.brackets-first",
          metaphor: "balance",
        },
        solution: { steps, solutions: [{ x }] },
      },
      mistakes,
    };
  },
  verify: verifyBySubstitution,
  isNice: niceAnswer,
};
