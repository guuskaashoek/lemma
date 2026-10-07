/**
 * Lesson 2 generators: a fraction of a number, simplifying fractions and
 * adding (or subtracting) fractions.
 */
import Fraction from "fraction.js";
import { checkExpr } from "@/math/check";
import { equivalent } from "@/math/cas";
import { frac, gcd } from "@/math/latex";
import type { Rng } from "@/math/random";
import type { Generator, Loc, Step } from "@/content/types";
import { L } from "../helpers";

const lcm = (a: number, b: number) => (a * b) / gcd(a, b);

/** A numerator between 1 and den-1 that has no factor in common with den. */
function coprimeNumerator(rng: Rng, den: number, min = 1): number {
  let n: number;
  do n = rng.int(min, den - 1);
  while (gcd(n, den) !== 1);
  return n;
}

// ---------------------------------------------------------------------------
// A fraction of a number ("3/4 van 20")
// ---------------------------------------------------------------------------

export const fractionOf: Generator = {
  id: "u0.fraction-of",
  skillId: "u0.fraction-of",
  title: L("Breuk van een getal", "A fraction of a number"),
  generate(rng, difficulty) {
    let n: number, d: number, k: number;
    if (difficulty === 1) {
      d = rng.pick([2, 3, 4, 5, 6, 8, 10]);
      n = 1;
      k = rng.int(2, 12);
    } else if (difficulty === 2) {
      d = rng.int(3, 8);
      n = coprimeNumerator(rng, d, 2);
      k = rng.int(2, 9);
    } else {
      d = rng.int(5, 12);
      n = coprimeNumerator(rng, d, 2);
      k = rng.int(6, 15);
    }
    const total = d * k;
    const value = n * k;
    const latex = `\\frac{${n}}{${d}}\\cdot ${total}`;

    const steps: Step[] = [
      { latex, note: L(`"Van" betekent keer: $\\frac{${n}}{${d}}$ van $${total}$.`, `"Of" means times: $\\frac{${n}}{${d}}$ of $${total}$.`) },
      {
        latex: n === 1 ? `\\hl{\\frac{${total}}{${d}}}` : `\\hl{\\frac{${total}}{${d}}}\\cdot ${n}`,
        note: L(`Verdeel $${total}$ in $${d}$ gelijke groepjes.`, `Split $${total}$ into $${d}$ equal groups.`),
      },
    ];
    if (n === 1) steps.push({ latex: `\\ask{${k}}`, note: L("Eén groepje. Dat is het antwoord.", "One group. That is the answer.") });
    else
      steps.push(
        { latex: `\\ask{${k}}\\cdot ${n}`, note: L("Hoeveel zit er in één groepje?", "How many are in one group?") },
        { latex: `\\ask{${value}}`, note: L(`Je neemt $${n}$ groepjes.`, `You take $${n}$ groups.`) },
      );

    const mistakes = [];
    if (n > 1) {
      mistakes.push({
        id: "forgot-numerator",
        latex: String(k),
        explain: L(
          `Dat is één groepje. Je hebt er $${n}$ nodig: doe nog keer $${n}$.`,
          `That is one group. You need $${n}$ of them: multiply by $${n}$ too.`,
        ),
      });
      // Only when it gives a whole number: that is when learners fall for it.
      const swapped = new Fraction(total, n).mul(d);
      if (total % n === 0 && !swapped.equals(value)) {
        mistakes.push({
          id: "swapped",
          latex: frac(swapped),
          explain: L(
            `Je deelde door $${n}$ en deed keer $${d}$. Andersom: deel door de noemer $${d}$, keer de teller $${n}$.`,
            `You divided by $${n}$ and multiplied by $${d}$. The other way round: divide by the denominator $${d}$, multiply by the numerator $${n}$.`,
          ),
        });
      }
    }

    return {
      prompt: L(
        `Hoeveel is $\\frac{${n}}{${d}}$ van $${total}$?`,
        `What is $\\frac{${n}}{${d}}$ of $${total}$?`,
      ),
      latex,
      visual: {
        kind: "custom",
        widget: "u0.groups",
        props: { total, parts: [n, d - n] },
        describe: L(
          `$${total}$ stippen, verdeeld in $${d}$ groepjes. $${n}$ ${n === 1 ? "groepje is" : "groepjes zijn"} gekleurd.`,
          `$${total}$ dots, split into $${d}$ groups. $${n}$ ${n === 1 ? "group is" : "groups are"} coloured.`,
        ),
      },
      answer: { kind: "expr", latex: String(value), form: "any" },
      calculator: "off",
      hints: {
        nudge: L(
          `Verdeel $${total}$ in $${d}$ gelijke groepjes. Hoeveel zit er in één groepje?${n > 1 ? ` Neem daarna $${n}$ groepjes.` : ""}`,
          `Split $${total}$ into $${d}$ equal groups. How many are in one group?${n > 1 ? ` Then take $${n}$ groups.` : ""}`,
        ),
        rule: {
          text: L(
            "Breuk van een getal: deel door de noemer, doe keer de teller.",
            "Fraction of a number: divide by the denominator, multiply by the numerator.",
          ),
          ruleId: "u0.fraction-of",
        },
        solution: { steps },
      },
      mistakes,
    };
  },
  verify(ex) {
    // Independent check: the CAS evaluates the product "fraction times number".
    return ex.latex !== undefined && ex.answer.kind === "expr" && equivalent(ex.latex, ex.answer.latex);
  },
  isNice(ex) {
    return ex.answer.kind === "expr" && Number.isInteger(Number(ex.answer.latex));
  },
};

// ---------------------------------------------------------------------------
// Simplifying a fraction (vereenvoudigen)
// ---------------------------------------------------------------------------

/** Steps that divide numerator and denominator by `g`. */
function divideSteps(n: number, d: number, g: number): Step[] {
  return [
    {
      latex: `\\frac{\\hl{${n}:${g}}}{\\hl{${d}:${g}}}`,
      note: L(`Deel boven en onder door $${g}$.`, `Divide top and bottom by $${g}$.`),
    },
    { latex: `\\frac{\\ask{${n / g}}}{${d}:${g}}`, note: L(`Boven: $${n}:${g}$.`, `Top: $${n}:${g}$.`) },
    { latex: `\\frac{${n / g}}{\\ask{${d / g}}}`, note: L(`Onder: $${d}:${g}$.`, `Bottom: $${d}:${g}$.`) },
  ];
}

export const simplifyFraction: Generator = {
  id: "u0.simplify-fraction",
  skillId: "u0.simplify-fraction",
  title: L("Breuken vereenvoudigen", "Simplifying fractions"),
  generate(rng, difficulty) {
    let d0: number, g: number, factors: number[];
    if (difficulty === 1) {
      d0 = rng.int(2, 9);
      g = rng.pick([2, 3, 5, 10]);
      factors = [g];
    } else if (difficulty === 2) {
      d0 = rng.int(3, 10);
      g = rng.int(4, 9);
      factors = [g];
    } else {
      d0 = rng.int(3, 9);
      const g1 = rng.pick([2, 3]);
      const g2 = rng.int(2, 6);
      g = g1 * g2;
      factors = [g1, g2];
    }
    const n0 = coprimeNumerator(rng, d0);
    const n = n0 * g;
    const d = d0 * g;
    const latex = `\\frac{${n}}{${d}}`;

    const steps: Step[] = [{ latex, note: L("Dit is de breuk.", "This is the fraction.") }];
    let cn = n;
    let cd = d;
    for (const f of factors) {
      steps.push(...divideSteps(cn, cd, f));
      cn /= f;
      cd /= f;
    }
    if (factors.length > 1) {
      steps[steps.length - 1] = {
        ...steps[steps.length - 1],
        note: L(`Onder: $${cd * factors[1]}:${factors[1]}$. Nu kan het niet verder.`, `Bottom: $${cd * factors[1]}:${factors[1]}$. Now it cannot go further.`),
      };
    }

    const nudge: Loc =
      difficulty === 3
        ? L(
            `Zoek een getal waar $${n}$ en $${d}$ allebei door te delen zijn. Begin klein, bijvoorbeeld met $${factors[0]}$. Ga door tot het niet meer kan.`,
            `Find a number that divides both $${n}$ and $${d}$. Start small, for example with $${factors[0]}$. Keep going until you cannot.`,
          )
        : L(
            `Zoek een getal waar $${n}$ en $${d}$ allebei door te delen zijn. Denk aan de tafels.`,
            `Find a number that divides both $${n}$ and $${d}$. Think of the times tables.`,
          );

    return {
      prompt: L("Vereenvoudig de breuk zo ver mogelijk.", "Simplify the fraction as far as possible."),
      latex,
      visual: d <= 24 ? { kind: "fraction-bar", bars: [{ num: n, den: d }, { num: n0, den: d0 }], allowSplit: true } : undefined,
      answer: { kind: "expr", latex: `\\frac{${n0}}{${d0}}`, form: "fraction" },
      calculator: "off",
      hints: {
        nudge,
        rule: {
          text: L(
            "Vereenvoudigen: deel teller en noemer door hetzelfde getal. De breuk blijft even groot.",
            "Simplifying: divide numerator and denominator by the same number. The fraction stays the same size.",
          ),
          ruleId: "u0.simplify-fraction",
        },
        solution: { steps },
      },
      mistakes:
        n0 !== d0
          ? [
              {
                id: "flipped",
                latex: `\\frac{${d0}}{${n0}}`,
                explain: L(
                  `Je hebt de breuk omgedraaid. $${n}$ blijft boven, dus ook na het delen staat dat getal boven.`,
                  `You turned the fraction upside down. $${n}$ stays on top, so after dividing that number is still on top.`,
                ),
              },
            ]
          : [],
    };
  },
  verify(ex) {
    // Independent check: same value (CAS) and really in lowest terms (form check).
    if (ex.answer.kind !== "expr" || ex.latex === undefined) return false;
    return equivalent(ex.latex, ex.answer.latex) && checkExpr(ex.answer, ex.answer.latex).correct;
  },
};

// ---------------------------------------------------------------------------
// Adding and subtracting fractions (breuken optellen en aftrekken)
// ---------------------------------------------------------------------------

export const addFractions: Generator = {
  id: "u0.add-fractions",
  skillId: "u0.add-fractions",
  title: L("Breuken optellen", "Adding fractions"),
  generate(rng, difficulty) {
    let b: number, d: number;
    if (difficulty === 1) {
      // Same denominator.
      b = d = rng.int(3, 10);
    } else if (difficulty === 2) {
      // One denominator is a multiple of the other.
      b = rng.int(2, 6);
      d = b * rng.int(2, 3);
    } else {
      // Unrelated denominators, with a common denominator of at most 30.
      do {
        b = rng.int(2, 7);
        d = rng.int(3, 9);
      } while (d === b || d % b === 0 || b % d === 0 || lcm(b, d) > 30);
    }
    const a = coprimeNumerator(rng, b);
    const c = coprimeNumerator(rng, d);
    // On level 3 half of the sums are a subtraction (bigger fraction first).
    const minus = difficulty === 3 && rng.chance() && !new Fraction(a, b).equals(new Fraction(c, d));
    const [p, q, r, s] = minus && new Fraction(a, b).compare(new Fraction(c, d)) < 0 ? [c, d, a, b] : [a, b, c, d];
    const sign = minus ? "-" : "+";
    const result = minus ? new Fraction(p, q).sub(r, s) : new Fraction(p, q).add(r, s);
    const Lc = lcm(q, s);
    const latex = `\\frac{${p}}{${q}}${sign}\\frac{${r}}{${s}}`;

    const steps: Step[] = [{ latex, note: L("Dit is de som.", "This is the sum.") }];
    if (q !== s) {
      steps.push({
        // Only the fractions that were rewritten get the accent colour.
        latex: `${q === Lc ? `\\frac{${p}}{${q}}` : `\\hl{\\frac{${p * (Lc / q)}}{${Lc}}}`}${sign}${
          s === Lc ? `\\frac{${r}}{${s}}` : `\\hl{\\frac{${r * (Lc / s)}}{${Lc}}}`
        }`,
        note: (() => {
          // Say how each rewritten fraction is made: top and bottom times the same number.
          const rewritten = [q !== Lc ? [p, q] : null, s !== Lc ? [r, s] : null].filter((x): x is number[] => x !== null);
          const nl = rewritten.map(([n, d]) => `$\\frac{${n}}{${d}}$ keer $${Lc / d}$`).join(", ");
          const en = rewritten.map(([n, d]) => `$\\frac{${n}}{${d}}$ times $${Lc / d}$`).join(", ");
          return L(
            `Maak de noemers gelijk: $${Lc}$. Doe boven en onder keer hetzelfde getal: ${nl}.`,
            `Make the denominators equal: $${Lc}$. Multiply top and bottom by the same number: ${en}.`,
          );
        })(),
      });
    }
    const top = minus ? p * (Lc / q) - r * (Lc / s) : p * (Lc / q) + r * (Lc / s);
    steps.push({
      latex: `\\frac{\\ask{${top}}}{${Lc}}`,
      note: minus
        ? L("Trek de tellers af. De noemer blijft hetzelfde.", "Subtract the numerators. The denominator stays the same.")
        : L("Tel de tellers op. De noemer blijft hetzelfde.", "Add the numerators. The denominator stays the same."),
    });
    if (gcd(top, Lc) !== 1) {
      steps.push({ latex: `\\ask{${frac(result)}}`, note: L("Vereenvoudig de breuk.", "Simplify the fraction.") });
    }

    // "Also subtract the denominators" only makes sense when both differences are positive.
    const naive = minus ? (q > s && p > r ? new Fraction(p - r, q - s) : null) : new Fraction(p + r, q + s);
    const nudge =
      q === s
        ? L(
            `De noemers zijn allebei $${q}$. Wat doe je met de tellers $${p}$ en $${r}$?`,
            `Both denominators are $${q}$. What do you do with the numerators $${p}$ and $${r}$?`,
          )
        : L(
            `De noemers zijn $${q}$ en $${s}$. Welk getal zit in de tafel van $${q}$ én van $${s}$? Dat wordt de nieuwe noemer.`,
            `The denominators are $${q}$ and $${s}$. Which number is in the times table of $${q}$ and of $${s}$? That becomes the new denominator.`,
          );
    return {
      prompt: minus ? L("Trek de breuken af.", "Subtract the fractions.") : L("Tel de breuken op.", "Add the fractions."),
      latex,
      visual: { kind: "fraction-bar", bars: [{ num: p, den: q }, { num: r, den: s }], allowSplit: true },
      // Any equivalent answer counts: 1/2, 0.5 and 2/4 are all fine here.
      answer: { kind: "expr", latex: frac(result), form: "any" },
      calculator: "off",
      hints: {
        nudge,
        rule: {
          text: L(
            "Breuken optellen of aftrekken: maak de noemers gelijk. Reken dan alleen met de tellers.",
            "Adding or subtracting fractions: make the denominators equal. Then work only with the numerators.",
          ),
          ruleId: "u0.add-fractions",
        },
        solution: { steps },
      },
      mistakes:
        naive === null || naive.equals(result)
          ? []
          : [
              {
                id: "add-denominators",
                latex: frac(naive),
                explain: minus
                  ? L(
                      "Je trok ook de noemers van elkaar af. De noemer blijft gelijk; alleen de tellers trek je af.",
                      "You also subtracted the denominators. The denominator stays the same; you only subtract the numerators.",
                    )
                  : L(
                      "Je telde ook de noemers bij elkaar op. De noemer blijft gelijk; alleen de tellers tel je op.",
                      "You also added the denominators. The denominator stays the same; you only add the numerators.",
                    ),
                relatedSkill: "u0.add-fractions",
              },
            ],
    };
  },
  verify(ex) {
    // Independent check: the CAS evaluates the printed sum.
    return ex.latex !== undefined && ex.answer.kind === "expr" && equivalent(ex.latex, ex.answer.latex);
  },
  isNice(ex) {
    // The common denominator stays small enough to work out by hand.
    return ex.answer.kind === "expr" && !/\d{3,}/.test(ex.answer.latex);
  },
};
