/**
 * Unit 4 generators: taking out a common factor (buiten haakjes halen),
 * the first step of factorising (ontbinden in factoren).
 */
import { checkExpr } from "@/math/check";
import { equivalent } from "@/math/cas";
import { gcd, sum, term } from "@/math/latex";
import type { Generator, Step } from "@/content/types";

// ---------------------------------------------------------------------------
// Taking out a common factor (buiten haakjes halen)
// ---------------------------------------------------------------------------

export const commonFactor: Generator = {
  id: "u4.common-factor",
  skillId: "u4.common-factor",
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
          ruleId: "u4.common-factor",
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
