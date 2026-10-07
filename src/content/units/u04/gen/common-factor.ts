/**
 * Lesson 1 generator: taking out a common factor (buiten haakjes halen),
 * the first step of factorising (ontbinden in factoren).
 */
import { equivalent } from "@/math/cas";
import { checkExpr, type Mistake } from "@/math/check";
import { gcd, sum, term } from "@/math/latex";
import type { Generator, Step } from "@/content/types";
import { L, custom } from "../helpers";

/** Visual: the terms as blocks that you try to stack in equal rows. */
export function commonHeightVisual(terms: Array<[number, string]>) {
  const shown = terms.map(([c, v]) => `$${term(c, v)}$`).join(" en ");
  const shownEn = terms.map(([c, v]) => `$${term(c, v)}$`).join(" and ");
  return custom(
    "u4.common-height",
    { terms },
    L(
      `Blokjes voor ${shown}. Je kiest hoeveel rijen. Past alles precies, dan heb je een gemeenschappelijke factor.`,
      `Blocks for ${shownEn}. You choose how many rows. If everything fits exactly, you found a common factor.`,
    ),
  );
}

export const commonFactor: Generator = {
  id: "u4.common-factor",
  skillId: "u4.common-factor",
  title: L("Buiten haakjes halen", "Taking out a common factor"),
  generate(rng, difficulty) {
    // Inner bracket p·x + q with gcd(p, q) = 1; outer factor k, x or kx.
    let p: number, q: number;
    do {
      p = rng.int(1, 6);
      q = rng.nonZeroInt(-9, 9);
    } while (gcd(p, q) !== 1);

    const k = difficulty === 2 ? 1 : rng.int(2, 6);
    const withX = difficulty >= 2;
    const outer = withX ? term(k, "x") : String(k);
    const inner = sum([[p, "x"], [q, ""]]);
    // Expanded: k·x·(px + q) = kp x^2 + kq x  (or k(px+q) = kp x + kq).
    const t1: [number, string] = withX ? [k * p, "x^{2}"] : [k * p, "x"];
    const t2: [number, string] = withX ? [k * q, "x"] : [k * q, ""];
    const expanded = sum([t1, t2]);
    const answerLatex = `${outer}(${inner})`;
    const sign = q < 0 ? "-" : "+";
    const pTerm = term(p, "x");
    const lead = term(t1[0], t1[1]);
    const second = term(t2[0], t2[1]);
    const secondAbs = term(Math.abs(t2[0]), t2[1]);

    const steps: Step[] = [
      {
        latex: expanded,
        note: withX
          ? L(
              `Kijk naar $${lead}$ en $${secondAbs}$. Welk getal en welke letter zitten in allebei?`,
              `Look at $${lead}$ and $${secondAbs}$. Which number and which letter are in both?`,
            )
          : L(
              `Zoek het grootste getal dat in $${k * p}$ én in $${Math.abs(k * q)}$ past.`,
              `Find the largest number that goes into both $${k * p}$ and $${Math.abs(k * q)}$.`,
            ),
      },
      {
        latex: `\\hl{${outer}}\\cdot \\ask{${pTerm}}${sign}\\hl{${outer}}\\cdot ${Math.abs(q)}`,
        note: L(`Schrijf $${lead}$ als $${outer}$ keer iets.`, `Write $${lead}$ as $${outer}$ times something.`),
      },
      {
        latex: `\\hl{${outer}}\\cdot ${pTerm}${sign}\\hl{${outer}}\\cdot \\ask{${Math.abs(q)}}`,
        note: L(`Schrijf $${secondAbs}$ als $${outer}$ keer iets.`, `Write $${secondAbs}$ as $${outer}$ times something.`),
      },
      {
        latex: `\\hl{${outer}}(\\ask{${inner}})`,
        note: L(`Zet $${outer}$ vóór de haakjes. Wat overblijft, komt erin.`, `Put $${outer}$ in front of the brackets. What is left goes inside.`),
      },
    ];

    // Typical mistakes, all with a different value than the right answer.
    const mistakes: Mistake[] = [
      {
        id: "second-not-divided",
        latex: `${outer}(${sum([[p, "x"], withX ? [k * q, "x"] : [k * q, ""]])})`,
        explain: L(
          `Deel élke term door $${outer}$. Ook $${secondAbs}$: dat wordt $${Math.abs(q)}$.`,
          `Divide every term by $${outer}$. Also $${secondAbs}$: that becomes $${Math.abs(q)}$.`,
        ),
      },
      {
        id: "sign-lost",
        latex: `${outer}(${sum([[p, "x"], [-q, ""]])})`,
        explain: L(
          `Let op het teken: er staat $${second.startsWith("-") ? second : `+${second}`}$. Dat teken gaat mee de haakjes in.`,
          `Watch the sign: it says $${second.startsWith("-") ? second : `+${second}`}$. That sign goes into the brackets too.`,
        ),
      },
    ];
    if (withX) {
      mistakes.push({
        id: "x-kept",
        latex: `${outer}(${sum([[p, "x^{2}"], [q, "x"]])})`,
        explain: L(
          `Je haalde $x$ naar voren, maar liet hem ook binnen staan. Binnen de haakjes wordt $x^{2}$ dan $x$, en $x$ wordt $1$.`,
          `You moved $x$ to the front but also kept it inside. Inside the brackets, $x^{2}$ then becomes $x$, and $x$ becomes $1$.`,
        ),
      });
    }

    return {
      prompt: L("Haal zoveel mogelijk buiten haakjes.", "Take out as much as possible as a common factor."),
      latex: expanded,
      visual: commonHeightVisual([t1, t2]),
      answer: { kind: "expr", latex: answerLatex, form: "factored", minFactors: withX ? 2 : 1 },
      calculator: "off",
      hints: {
        nudge: withX
          ? k === 1
            ? L(
                `In $${lead}$ en in $${secondAbs}$ zit allebei een $x$. Welk getal past nog in $${k * p}$ en $${Math.abs(k * q)}$?`,
                `Both $${lead}$ and $${secondAbs}$ contain an $x$. Which number still goes into $${k * p}$ and $${Math.abs(k * q)}$?`,
              )
            : L(
                `Welk getal past in $${k * p}$ en in $${Math.abs(k * q)}$? En zit er in $${lead}$ en $${secondAbs}$ allebei een $x$?`,
                `Which number goes into $${k * p}$ and $${Math.abs(k * q)}$? And do $${lead}$ and $${secondAbs}$ both contain an $x$?`,
              )
          : L(
              `Welk getal past in $${k * p}$ én in $${Math.abs(k * q)}$? Neem het grootste.`,
              `Which number goes into both $${k * p}$ and $${Math.abs(k * q)}$? Take the largest one.`,
            ),
        rule: {
          text: L(
            "Buiten haakjes halen: $ab+ac=a(b+c)$. Het is haakjes wegwerken, maar dan achteruit.",
            "Taking out a factor: $ab+ac=a(b+c)$. It is expanding brackets, but backwards.",
          ),
          ruleId: "u4.common-factor",
        },
        solution: { steps },
      },
      mistakes: mistakes.filter((m) => !equivalent(m.latex, answerLatex)),
    };
  },
  verify(ex) {
    // Independent check: expanding the answer must give the expression back,
    // and the answer itself must pass the "fully factored" form check.
    if (ex.answer.kind !== "expr" || ex.latex === undefined) return false;
    return equivalent(ex.latex, ex.answer.latex) && checkExpr(ex.answer, ex.answer.latex).correct;
  },
};
