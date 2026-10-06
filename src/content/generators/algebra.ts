/**
 * Generators for algebra: linear equations (the balance) and taking out a
 * common factor (buiten haakjes halen).
 */
import Fraction from "fraction.js";
import { checkExpr } from "@/math/check";
import { equivalent } from "@/math/cas";
import { frac, gcd, sum, term } from "@/math/latex";
import { validateSteps } from "@/math/steps";
import type { Generator, Step } from "../types";

// ---------------------------------------------------------------------------
// Linear equations with the balance method
// ---------------------------------------------------------------------------

/** "Haal links en rechts 5 weg" / "Tel links en rechts 5 op". */
function balanceNote(amount: string, negative: boolean) {
  return negative
    ? { nl: `Tel links en rechts $${amount}$ op.`, en: `Add $${amount}$ on both sides.` }
    : { nl: `Haal links en rechts $${amount}$ weg.`, en: `Subtract $${amount}$ on both sides.` };
}

export const linearEquation: Generator = {
  id: "algebra.linear-equation",
  skillId: "linear-equations",
  title: { nl: "Vergelijkingen oplossen", en: "Solving equations" },
  generate(rng, difficulty) {
    // The solution is chosen first, so it is always a whole number.
    const x = rng.int(-10, 10);
    const steps: Step[] = [];
    let latex: string;
    let wrong: Fraction | null = null;

    if (difficulty === 1) {
      // x + b = c
      const b = rng.nonZeroInt(-12, 12);
      const c = x + b;
      latex = `${sum([[1, "x"], [b, ""]])}=${c}`;
      steps.push({ latex, note: { nl: "Dit is de vergelijking.", en: "This is the equation." } });
      steps.push({
        latex: `x=${c}\\hl{${b < 0 ? "+" : "-"}${Math.abs(b)}}`,
        note: balanceNote(String(Math.abs(b)), b < 0),
      });
      steps.push({ latex: `x=${x}`, note: { nl: "Reken rechts uit.", en: "Work out the right side." } });
      wrong = new Fraction(c + b);
    } else if (difficulty === 2) {
      // a·x + b = c
      const a = rng.pick([2, 3, 4, 5, 6, 7, 8, 9, -2, -3, -4, -5]);
      const b = rng.nonZeroInt(-15, 15);
      const c = a * x + b;
      latex = `${sum([[a, "x"], [b, ""]])}=${c}`;
      steps.push({ latex, note: { nl: "Dit is de vergelijking.", en: "This is the equation." } });
      steps.push({ latex: `${term(a, "x")}=\\hl{${c - b}}`, note: balanceNote(String(Math.abs(b)), b < 0) });
      steps.push({
        latex: `x=\\hl{${frac(new Fraction(c - b, a))}}`,
        note: { nl: `Deel links en rechts door $${a}$.`, en: `Divide both sides by $${a}$.` },
      });
      // Typical mistake: moving b without changing its sign.
      wrong = new Fraction(c + b, a);
    } else {
      // a·x + b = c·x + d
      let a: number, c: number;
      do {
        a = rng.int(2, 9);
        c = rng.int(1, 8);
      } while (a === c);
      const b = rng.nonZeroInt(-12, 12);
      const d = (a - c) * x + b;
      latex = `${sum([[a, "x"], [b, ""]])}=${sum([[c, "x"], [d, ""]])}`;
      steps.push({ latex, note: { nl: "Dit is de vergelijking.", en: "This is the equation." } });
      steps.push({
        latex: `\\hl{${term(a - c, "x")}}${b < 0 ? "-" : "+"}${Math.abs(b)}=${d}`,
        note: balanceNote(term(c, "x"), false),
      });
      steps.push({ latex: `${term(a - c, "x")}=\\hl{${d - b}}`, note: balanceNote(String(Math.abs(b)), b < 0) });
      steps.push({
        latex: `x=\\hl{${x}}`,
        note: { nl: `Deel links en rechts door $${a - c}$.`, en: `Divide both sides by $${a - c}$.` },
      });
      wrong = new Fraction(d + b, a - c);
    }

    return {
      prompt: { nl: "Los de vergelijking op.", en: "Solve the equation." },
      latex,
      answer: { kind: "solutions", variable: "x", values: [String(x)] },
      hints: {
        nudge: {
          nl: "Zorg dat $x$ alleen komt te staan. Wat staat er nog bij $x$?",
          en: "Get $x$ on its own. What else is next to $x$?",
        },
        rule: {
          text: {
            nl: "De balans: wat je links doet, doe je ook rechts.",
            en: "The balance: whatever you do on the left, you also do on the right.",
          },
          ruleId: "balance-method",
          metaphor: "balance",
        },
        solution: { steps, solutions: [{ x }] },
      },
      mistakes:
        wrong && !wrong.equals(x)
          ? [
              {
                id: "sign-when-moving",
                latex: frac(wrong),
                explain: {
                  nl: "Let op het teken. Staat er $+$ bij $x$? Dan haal je het aan beide kanten weg (min).",
                  en: "Watch the sign. Is there a $+$ next to $x$? Then subtract it on both sides.",
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

// ---------------------------------------------------------------------------
// Taking out a common factor (buiten haakjes halen)
// ---------------------------------------------------------------------------

export const commonFactor: Generator = {
  id: "algebra.common-factor",
  skillId: "common-factor",
  title: { nl: "Buiten haakjes halen", en: "Taking out a common factor" },
  generate(rng, difficulty) {
    // Inner bracket p·x + q (or p·x^2 + q·x) with gcd(p, q) = 1, outer factor k (·x).
    let p: number, q: number;
    do {
      p = rng.int(1, 6);
      q = rng.nonZeroInt(-9, 9);
    } while (gcd(p, q) !== 1);

    const k = difficulty === 2 ? 1 : rng.int(2, 6);
    const withX = difficulty >= 2;
    // Outer factor: k, x or kx.
    const outer = withX ? term(k, "x") : String(k);
    const inner = sum([[p, "x"], [q, ""]]);
    // Expanded: k·x·(p x + q) = kp x^2 + kq x  (or k(px+q) = kp x + kq).
    const expanded = withX ? sum([[k * p, "x^{2}"], [k * q, "x"]]) : sum([[k * p, "x"], [k * q, ""]]);
    const answerLatex = `${outer}(${inner})`;

    const steps: Step[] = [
      { latex: expanded, note: { nl: "Dit is de uitdrukking.", en: "This is the expression." } },
      {
        latex: withX
          ? `\\hl{${outer}}\\cdot ${term(p, "x")}${q < 0 ? "-" : "+"}\\hl{${outer}}\\cdot ${Math.abs(q)}`
          : `\\hl{${k}}\\cdot ${term(p, "x")}${q < 0 ? "-" : "+"}\\hl{${k}}\\cdot ${Math.abs(q)}`,
        note: {
          nl: `Zoek wat in beide termen zit: $${outer}$.`,
          en: `Find what both terms have in common: $${outer}$.`,
        },
      },
      {
        latex: `\\hl{${outer}}(${inner})`,
        note: { nl: "Zet dat vóór de haakjes.", en: "Put it in front of the brackets." },
      },
    ];

    return {
      prompt: { nl: "Haal zoveel mogelijk buiten haakjes.", en: "Take out as much as possible as a common factor." },
      latex: expanded,
      answer: { kind: "expr", latex: answerLatex, form: "factored", minFactors: withX ? 2 : 1 },
      calculator: "off",
      hints: {
        nudge: {
          nl: "Welk getal (en welke letter) zit in allebei de termen?",
          en: "Which number (and which letter) is in both terms?",
        },
        rule: {
          text: {
            nl: "Buiten haakjes halen: $ab+ac=a(b+c)$. Het omgekeerde van haakjes wegwerken.",
            en: "Taking out a factor: $ab+ac=a(b+c)$. The reverse of expanding brackets.",
          },
          ruleId: "common-factor",
        },
        solution: { steps },
      },
    };
  },
  verify(ex) {
    // Independent check: expanding the answer must give the expression back,
    // and the answer itself must pass the "fully factored" form check.
    if (ex.answer.kind !== "expr" || ex.latex === undefined) return false;
    return equivalent(ex.latex, ex.answer.latex) && checkExpr(ex.answer, ex.answer.latex).correct;
  },
};
