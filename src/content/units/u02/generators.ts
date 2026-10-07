/**
 * Unit 2 generators: linear equations, solved with the balance method.
 *
 * The equation, the worked steps and the balance picture all come from the
 * same model (`src/visuals/models/balance.ts`), so they can never disagree.
 */
import Fraction from "fraction.js";
import type { Difficulty, Generator, Loc, Step } from "@/content/types";
import { frac, sum, term } from "@/math/latex";
import { validateSteps } from "@/math/steps";
import { applyOp, balanceLatex, initBalance, opText, solveOps, type BalanceState } from "@/visuals/models/balance";

/** LaTeX of one pan, with the pan highlighted or turned into a blank. */
function panLatex(p: BalanceState["left"], mark?: "hl" | "ask"): string {
  const s = sum([[new Fraction(p.x), "x"], [new Fraction(p.ones), ""]]);
  return mark ? `\\${mark}{${s}}` : s;
}

/**
 * Worked steps for the balance method. In every step the learner fills in
 * the side that changed in a way worth thinking about.
 */
export function balanceSteps(start: BalanceState): Step[] {
  const steps: Step[] = [
    { latex: balanceLatex(start), note: { nl: "Dit is de vergelijking.", en: "This is the equation." } },
  ];
  let s = start;
  for (const op of solveOps(start)) {
    const next = applyOp(s, op);
    let latex: string;
    if (op.kind === "swap") latex = balanceLatex(next);
    else if (op.kind === "subtract-x") latex = `${panLatex(next.left, "ask")}=${panLatex(next.right, "hl")}`;
    else latex = `${panLatex(next.left, "hl")}=${panLatex(next.right, "ask")}`;
    steps.push({ latex, note: opText(op) });
    s = next;
  }
  return steps;
}

/** Hint 1, written with the exercise's own numbers. */
function nudgeFor(start: BalanceState): Loc {
  const { left, right } = start;
  if (right.x > 0) {
    const n = Math.min(left.x, right.x);
    return {
      nl: `Aan beide kanten staan $x$-blokjes. Haal eerst links en rechts $${term(n, "x")}$ weg. Wat blijft er over?`,
      en: `There are $x$-blocks on both sides. First take $${term(n, "x")}$ away on both sides. What is left?`,
    };
  }
  if (left.ones !== 0) {
    const b = left.ones;
    return {
      nl: `Naast $${term(left.x, "x")}$ staat links nog $${b > 0 ? `+${b}` : b}$. Hoe krijg je die weg? Doe rechts precies hetzelfde.`,
      en: `Next to $${term(left.x, "x")}$ on the left there is $${b > 0 ? `+${b}` : b}$. How do you get rid of it? Do exactly the same on the right.`,
    };
  }
  return {
    nl: `Links staan $${left.x}$ blokjes $x$. Verdeel beide kanten in $${left.x}$ gelijke groepjes.`,
    en: `There are $${left.x}$ $x$-blocks on the left. Split both sides into $${left.x}$ equal groups.`,
  };
}

export const linearEquation: Generator = {
  id: "u2.linear-equation",
  skillId: "u2.linear-equations",
  title: { nl: "Vergelijkingen oplossen", en: "Solving equations" },
  generate(rng, difficulty: Difficulty) {
    // The solution is picked first, so it is always a whole number. Numbers
    // stay positive and small, so the balance can show every block.
    const x = rng.int(1, difficulty === 3 ? 8 : 10);
    let start: BalanceState;
    if (difficulty === 1) {
      const b = rng.int(1, 10);
      start = initBalance(1, b, 0, x + b); // x + b = c
    } else if (difficulty === 2) {
      const a = rng.int(2, 5);
      const b = rng.int(1, 10);
      start = initBalance(a, b, 0, a * x + b); // ax + b = c
    } else {
      const c = rng.int(1, 4);
      const a = c + rng.int(1, 4);
      const b = rng.int(0, 10);
      start = initBalance(a, b, c, (a - c) * x + b); // ax + b = cx + d
    }
    const latex = balanceLatex(start);
    const steps = balanceSteps(start);

    // Typical mistake: taking the number away on one side only, i.e.
    // adding it on the right instead of subtracting.
    const a = start.left.x - start.right.x;
    const wrong = new Fraction(start.right.ones + start.left.ones, a);

    return {
      prompt: { nl: "Los de vergelijking op.", en: "Solve the equation." },
      latex,
      visual: { kind: "balance", a: start.left.x, b: start.left.ones, c: start.right.x, d: start.right.ones },
      answer: { kind: "solutions", variable: "x", values: [String(x)] },
      calculator: "off",
      hints: {
        nudge: nudgeFor(start),
        rule: {
          text: {
            nl: "De balans: wat je links doet, doe je ook rechts.",
            en: "The balance: whatever you do on the left, you also do on the right.",
          },
          ruleId: "u2.balance-method",
          metaphor: "balance",
        },
        solution: { steps, solutions: [{ x }] },
      },
      mistakes:
        start.left.ones !== 0 && !wrong.equals(x)
          ? [
              {
                id: "sign-when-moving",
                latex: frac(wrong),
                explain: {
                  nl: `Let op: links staat $+${start.left.ones}$. Dat haal je weg, dus rechts doe je ook $-${start.left.ones}$, niet $+${start.left.ones}$.`,
                  en: `Careful: there is $+${start.left.ones}$ on the left. You take it away, so on the right you also do $-${start.left.ones}$, not $+${start.left.ones}$.`,
                },
              },
            ]
          : [],
    };
  },
  verify(ex) {
    // Independent check: substitute the solution back into the equation.
    if (ex.answer.kind !== "solutions" || ex.latex === undefined) return false;
    const x = Number(ex.answer.values[0]);
    return validateSteps([ex.latex, `x=${x}`], { solutions: [{ x }] }).ok;
  },
  isNice(ex) {
    return ex.answer.kind === "solutions" && Number.isInteger(Number(ex.answer.values[0]));
  },
};
