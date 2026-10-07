/**
 * Generators for basic arithmetic: order of operations and fractions.
 */
import Fraction from "fraction.js";
import { equivalent, evaluate, parse } from "@/math/cas";
import { frac, gcd } from "@/math/latex";
import type { Rng } from "@/math/random";
import type { Difficulty, Generator, Step } from "@/content/types";
import { bin, evalTree, leftToRight, num, paren, pow, reduceSteps, toLatex, type ArithNode } from "@/content/shared/arith-tree";

// ---------------------------------------------------------------------------
// Order of operations (rekenvolgorde)
// ---------------------------------------------------------------------------

/** Builds a random tree whose value is a whole number and never divides by zero. */
function orderOfOpsTree(rng: Rng, difficulty: Difficulty): ArithNode {
  const n = (min: number, max: number) => num(rng.int(min, max));
  // Exact division: pick the quotient and divisor, multiply for the dividend.
  const division = (maxQ = 9, maxD = 9) => {
    const d = rng.int(2, maxD);
    return bin(":", num(d * rng.int(1, maxQ)), num(d));
  };

  const templates: Record<Difficulty, Array<() => ArithNode>> = {
    1: [
      () => bin("+", n(1, 20), bin("*", n(2, 9), n(2, 9))), // a + b·c
      () => bin("-", bin("*", n(2, 9), n(2, 9)), n(1, 9)), // a·b − c
      () => bin("+", n(1, 20), division()), // a + b:c
      () => bin("-", n(20, 40), bin("*", n(2, 5), n(2, 4))), // a − b·c (stays positive)
    ],
    2: [
      () => bin("*", paren(bin("+", n(1, 9), n(1, 9))), n(2, 6)), // (a + b)·c
      () => bin("-", bin("+", n(1, 20), bin("*", n(2, 9), n(2, 9))), n(1, 9)), // a + b·c − d
      () => {
        // a·b : c, evaluated left to right; a is a multiple of c.
        const c = rng.int(2, 6);
        return bin(":", bin("*", num(c * rng.int(1, 4)), n(2, 9)), num(c));
      },
      () => bin("+", bin("*", n(2, 9), paren(bin("-", n(6, 15), n(1, 5)))), n(1, 9)), // a·(b − c) + d
    ],
    3: [
      () => bin("+", n(1, 9), bin("*", pow(n(2, 5), 2), n(2, 4))), // a + b²·c
      () => {
        // (a − b)² : c with an exact result.
        const c = rng.pick([2, 3, 4]);
        const diff = c * rng.int(1, 3);
        const b = rng.int(1, 9);
        return bin(":", pow(paren(bin("-", num(b + diff), num(b))), 2), num(c));
      },
      () => bin("-", n(1, 12), bin("*", n(2, 5), paren(bin("+", n(1, 6), n(1, 6))))), // a − b·(c + d), may be negative
      () => bin("-", pow(n(2, 3), 3), bin(":", bin("*", n(2, 9), num(4)), num(2))), // a³ − b·4:2
    ],
  };
  return rng.pick(templates[difficulty])();
}

const STEP_NOTES = {
  paren: { nl: "Eerst wat tussen de haakjes staat.", en: "First, what is inside the brackets." },
  pow: { nl: "Dan de macht.", en: "Then the power." },
  muldiv: {
    nl: "Dan keer en gedeeld door, van links naar rechts.",
    en: "Then multiply and divide, from left to right.",
  },
  addsub: {
    nl: "Tot slot plus en min, van links naar rechts.",
    en: "Finally add and subtract, from left to right.",
  },
};

export const orderOfOperations: Generator = {
  id: "u0.order-of-operations",
  skillId: "u0.order-of-operations",
  title: { nl: "Rekenvolgorde", en: "Order of operations" },
  generate(rng, difficulty) {
    const tree = orderOfOpsTree(rng, difficulty);
    const value = evalTree(tree);
    const latex = toLatex(tree);
    const steps: Step[] = [
      { latex, note: { nl: "Dit is de som.", en: "This is the sum." } },
      ...reduceSteps(tree).map((s) => ({ latex: s.latex, note: STEP_NOTES[s.kind] })),
    ];
    const wrong = leftToRight(tree);
    const hasParen = latex.includes("(");
    return {
      prompt: { nl: "Reken uit. Let op de rekenvolgorde.", en: "Work it out. Mind the order of operations." },
      latex,
      answer: { kind: "expr", latex: frac(value), form: "integer" },
      calculator: "off",
      hints: {
        nudge: hasParen
          ? { nl: "Begin met wat tussen de haakjes staat.", en: "Start with what is inside the brackets." }
          : {
              nl: "Welke bewerking moet je als eerste doen? Plus en min komen pas als laatste.",
              en: "Which operation comes first? Adding and subtracting come last.",
            },
        rule: {
          text: {
            nl: "Rekenvolgorde: Haakjes, Machten en Wortels, Vermenigvuldigen en Delen, Optellen en Aftrekken.",
            en: "Order of operations: Brackets, Powers and roots, Multiply and divide, Add and subtract.",
          },
          ruleId: "u0.order-of-operations",
          mnemonic: "hmwvdoa",
        },
        solution: { steps },
      },
      mistakes:
        wrong && !wrong.equals(value)
          ? [
              {
                id: "left-to-right",
                latex: frac(wrong),
                explain: {
                  nl: "Je rekende alles van links naar rechts. Keer en gedeeld door gaan vóór plus en min.",
                  en: "You worked strictly from left to right. Multiply and divide come before add and subtract.",
                },
                relatedSkill: "u0.order-of-operations",
              },
            ]
          : [],
    };
  },
  verify(ex) {
    // Independent check: let the CAS evaluate the printed sum.
    return ex.latex !== undefined && ex.answer.kind === "expr" && equivalent(ex.latex, ex.answer.latex);
  },
  isNice(ex) {
    if (ex.answer.kind !== "expr") return false;
    const v = evaluate(parse(ex.answer.latex));
    return v !== null && Number.isInteger(v) && Math.abs(v) <= 200;
  },
};

// ---------------------------------------------------------------------------
// Adding fractions (breuken optellen)
// ---------------------------------------------------------------------------

const lcm = (a: number, b: number) => (a * b) / gcd(a, b);

export const addFractions: Generator = {
  id: "u0.add-fractions",
  skillId: "u0.add-fractions",
  title: { nl: "Breuken optellen", en: "Adding fractions" },
  generate(rng, difficulty) {
    // Each fraction is in lowest terms, so the exercise itself looks tidy.
    const numerator = (den: number) => {
      let n: number;
      do n = rng.int(1, den - 1);
      while (gcd(n, den) !== 1);
      return n;
    };
    let b: number, d: number;
    if (difficulty === 1) {
      // Same denominator.
      b = d = rng.int(3, 10);
    } else if (difficulty === 2) {
      // One denominator is a multiple of the other.
      b = rng.int(2, 6);
      d = b * rng.int(2, 3);
    } else {
      // Unrelated denominators, with a common denominator of at most 30
      // so it stays doable by hand.
      do {
        b = rng.int(2, 7);
        d = rng.int(3, 9);
      } while (d === b || d % b === 0 || b % d === 0 || lcm(b, d) > 30);
    }
    const a = numerator(b);
    const c = numerator(d);
    const result = new Fraction(a, b).add(c, d);
    const L = lcm(b, d);
    const latex = `\\frac{${a}}{${b}}+\\frac{${c}}{${d}}`;

    const steps: Step[] = [{ latex, note: { nl: "Dit is de som.", en: "This is the sum." } }];
    if (b !== d || b !== L) {
      steps.push({
        // Only the fractions that were rewritten get the accent colour.
        latex: `${b === L ? `\\frac{${a}}{${b}}` : `\\hl{\\frac{${a * (L / b)}}{${L}}}`}+${
          d === L ? `\\frac{${c}}{${d}}` : `\\hl{\\frac{${c * (L / d)}}{${L}}}`
        }`,
        note: {
          nl: `Maak de noemers gelijk. Beide worden ${L}.`,
          en: `Make the denominators equal. Both become ${L}.`,
        },
      });
    }
    const top = a * (L / b) + c * (L / d);
    steps.push({
      latex: `\\frac{\\hl{${top}}}{${L}}`,
      note: {
        nl: "Tel de tellers op. De noemer blijft hetzelfde.",
        en: "Add the numerators. The denominator stays the same.",
      },
    });
    if (gcd(top, L) !== 1 || L === 1) {
      steps.push({
        latex: frac(result),
        note: { nl: "Vereenvoudig de breuk.", en: "Simplify the fraction." },
      });
    }

    const naive = new Fraction(a + c, b + d);
    return {
      prompt: { nl: "Tel de breuken op.", en: "Add the fractions." },
      latex,
      // Any equivalent answer counts: 1/2, 0.5 and 2/4 are all fine here.
      answer: { kind: "expr", latex: frac(result), form: "any" },
      calculator: "off",
      hints: {
        nudge:
          b === d
            ? { nl: "De noemers zijn al gelijk. Wat doe je met de tellers?", en: "The denominators are already equal. What do you do with the numerators?" }
            : { nl: "Zijn de noemers gelijk? Zo niet, maak ze eerst gelijk.", en: "Are the denominators equal? If not, make them equal first." },
        rule: {
          text: {
            nl: "Breuken optellen: maak de noemers gelijk en tel dan alleen de tellers op.",
            en: "Adding fractions: make the denominators equal, then add only the numerators.",
          },
          ruleId: "u0.add-fractions",
        },
        solution: { steps },
      },
      mistakes: naive.equals(result)
        ? []
        : [
            {
              id: "add-denominators",
              latex: frac(naive),
              explain: {
                nl: "Je telde ook de noemers bij elkaar op. De noemer blijft gelijk; alleen de tellers tel je op.",
                en: "You also added the denominators. The denominator stays the same; you only add the numerators.",
              },
              relatedSkill: "u0.add-fractions",
            },
          ],
    };
  },
  verify(ex) {
    return ex.latex !== undefined && ex.answer.kind === "expr" && equivalent(ex.latex, ex.answer.latex);
  },
  isNice(ex) {
    // The common denominator stays small enough to work out by hand.
    return ex.answer.kind === "expr" && !/\d{3,}/.test(ex.answer.latex);
  },
};
