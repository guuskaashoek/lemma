/**
 * Lesson 1 generators: mental arithmetic by splitting (hoofdrekenen) and
 * the order of operations (rekenvolgorde).
 */
import { equivalent, evaluate, parse } from "@/math/cas";
import { frac } from "@/math/latex";
import type { Rng } from "@/math/random";
import type { Difficulty, Generator, Loc, Step } from "@/content/types";
import { bin, evalTree, leftToRight, nextOperation, num, paren, pow, reduceSteps, toLatex, type ArithNode } from "@/content/shared/arith-tree";
import { L } from "../helpers";

// ---------------------------------------------------------------------------
// Splitting a product (hoofdrekenen: splitsen)
// ---------------------------------------------------------------------------

export const splitMultiply: Generator = {
  id: "u0.split-multiply",
  skillId: "u0.mental-arithmetic",
  title: L("Keersommen splitsen", "Splitting a product"),
  generate(rng, difficulty) {
    let a: number, b: number;
    if (difficulty === 1) {
      a = rng.int(2, 9);
      b = rng.int(11, 19);
    } else if (difficulty === 2) {
      a = rng.int(3, 9);
      do b = rng.int(21, 89);
      while (b % 10 === 0);
    } else {
      a = rng.int(11, 19);
      do b = rng.int(12, 29);
      while (b % 10 === 0 || b === a);
    }
    const value = a * b;
    const latex = `${a}\\cdot ${b}`;
    const bT = b - (b % 10);
    const bU = b % 10;
    const steps: Step[] = [{ latex, note: L("Dit is de som.", "This is the sum.") }];
    let nudge: Loc;
    let wrong: number;
    let visual: { rows: string[]; cols: string[] };

    if (difficulty < 3) {
      steps.push(
        {
          latex: `${a}\\cdot(\\hl{${bT}+${bU}})`,
          note: L(`Splits $${b}$ in $${bT}$ en $${bU}$.`, `Split $${b}$ into $${bT}$ and $${bU}$.`),
        },
        {
          latex: `\\hl{${a}\\cdot ${bT}+${a}\\cdot ${bU}}`,
          note: L(`Doe allebei de stukken keer $${a}$.`, `Multiply both parts by $${a}$.`),
        },
        { latex: `\\ask{${a * bT}}+${a}\\cdot ${bU}`, note: L(`Reken $${a}\\cdot ${bT}$ uit.`, `Work out $${a}\\cdot ${bT}$.`) },
        { latex: `${a * bT}+\\ask{${a * bU}}`, note: L(`Reken $${a}\\cdot ${bU}$ uit.`, `Work out $${a}\\cdot ${bU}$.`) },
        { latex: `\\ask{${value}}`, note: L("Tel de twee stukken op.", "Add the two parts.") },
      );
      nudge = L(
        `Splits $${b}$ in $${bT}+${bU}$. Wat is $${a}\\cdot ${bT}$? En $${a}\\cdot ${bU}$?`,
        `Split $${b}$ into $${bT}+${bU}$. What is $${a}\\cdot ${bT}$? And $${a}\\cdot ${bU}$?`,
      );
      // Typical slip: only the tens are multiplied, the ones are just added.
      wrong = a * bT + bU;
      visual = { rows: [String(a)], cols: [String(bT), String(bU)] };
    } else {
      const aT = a - (a % 10);
      const aU = a % 10;
      const parts = [aT * bT, aT * bU, aU * bT, aU * bU];
      steps.push(
        {
          latex: `(\\hl{${aT}+${aU}})\\cdot(\\hl{${bT}+${bU}})`,
          note: L("Splits allebei de getallen.", "Split both numbers."),
        },
        {
          latex: `\\hl{${aT}\\cdot ${bT}+${aT}\\cdot ${bU}+${aU}\\cdot ${bT}+${aU}\\cdot ${bU}}`,
          note: L("Elk stuk keer elk stuk. Dat zijn vier vakjes.", "Every part times every part. That gives four boxes."),
        },
        {
          latex: `\\ask{${parts[0]}}+${aT}\\cdot ${bU}+${aU}\\cdot ${bT}+${aU}\\cdot ${bU}`,
          note: L(`Vakje 1: $${aT}\\cdot ${bT}$.`, `Box 1: $${aT}\\cdot ${bT}$.`),
        },
        {
          latex: `${parts[0]}+\\ask{${parts[1]}}+${aU}\\cdot ${bT}+${aU}\\cdot ${bU}`,
          note: L(`Vakje 2: $${aT}\\cdot ${bU}$.`, `Box 2: $${aT}\\cdot ${bU}$.`),
        },
        {
          latex: `${parts[0]}+${parts[1]}+\\ask{${parts[2]}}+${aU}\\cdot ${bU}`,
          note: L(`Vakje 3: $${aU}\\cdot ${bT}$.`, `Box 3: $${aU}\\cdot ${bT}$.`),
        },
        {
          latex: `${parts[0]}+${parts[1]}+${parts[2]}+\\ask{${parts[3]}}`,
          note: L(`Vakje 4: $${aU}\\cdot ${bU}$.`, `Box 4: $${aU}\\cdot ${bU}$.`),
        },
        { latex: `\\ask{${value}}`, note: L("Tel de vier vakjes op.", "Add the four boxes.") },
      );
      nudge = L(
        `Splits allebei: $${a}=${aT}+${aU}$ en $${b}=${bT}+${bU}$. Dat geeft vier vakjes. Reken elk vakje uit.`,
        `Split both: $${a}=${aT}+${aU}$ and $${b}=${bT}+${bU}$. That gives four boxes. Work out each box.`,
      );
      // Typical slip: tens times tens plus ones times ones, the cross boxes forgotten.
      wrong = aT * bT + aU * bU;
      visual = { rows: [String(aT), String(aU)], cols: [String(bT), String(bU)] };
    }

    return {
      prompt: L("Reken uit in je hoofd. Splits het getal.", "Work it out in your head. Split the number."),
      latex,
      visual: { kind: "area-model", rows: visual.rows, cols: visual.cols, reveal: "step" },
      answer: { kind: "expr", latex: String(value), form: "integer" },
      calculator: "off",
      hints: {
        nudge,
        rule: {
          text: L(
            "Splitsen: knip een getal in tientallen en eenheden. Reken elk stuk uit. Tel de stukken op.",
            "Splitting: cut a number into tens and ones. Work out each part. Add the parts.",
          ),
          ruleId: "u0.split-multiply",
        },
        solution: { steps },
      },
      mistakes:
        wrong !== value
          ? [
              {
                id: difficulty < 3 ? "forgot-ones" : "forgot-cross",
                latex: String(wrong),
                explain:
                  difficulty < 3
                    ? L(
                        `Je deed alleen $${bT}$ keer $${a}$. Ook de $${bU}$ moet keer $${a}$.`,
                        `You only did $${bT}$ times $${a}$. The $${bU}$ must be multiplied by $${a}$ too.`,
                      )
                    : L(
                        "Je mist twee vakjes. Bij splitsen doe je elk stuk keer elk stuk: vier vakjes.",
                        "You missed two boxes. When splitting, multiply every part by every part: four boxes.",
                      ),
              },
            ]
          : [],
    };
  },
  verify(ex) {
    // Independent check: the CAS multiplies the printed product.
    return ex.latex !== undefined && ex.answer.kind === "expr" && equivalent(ex.latex, ex.answer.latex);
  },
  isNice(ex) {
    return ex.answer.kind === "expr" && Number.isInteger(Number(ex.answer.latex));
  },
};

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
      () => {
        // a·b − c, with c at most a·b.
        const a = rng.int(2, 9);
        const b = rng.int(2, 9);
        return bin("-", bin("*", num(a), num(b)), n(1, Math.min(9, a * b)));
      },
      () => bin("+", n(1, 20), division()), // a + b:c
      () => bin("-", n(20, 40), bin("*", n(2, 5), n(2, 4))), // a − b·c (stays positive)
    ],
    2: [
      () => bin("*", paren(bin("+", n(1, 9), n(1, 9))), n(2, 6)), // (a + b)·c
      () => {
        // a + b·c − d, never below zero.
        const a = rng.int(1, 20);
        const b = rng.int(2, 9);
        const c = rng.int(2, 9);
        return bin("-", bin("+", num(a), bin("*", num(b), num(c))), n(1, Math.min(9, a + b * c)));
      },
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
      () => {
        // a − b·(c + d). Negative numbers come in unit 1, so a is big enough.
        const b = rng.int(2, 5);
        const c = rng.int(1, 6);
        const d = rng.int(1, 6);
        return bin("-", num(b * (c + d) + rng.int(1, 12)), bin("*", num(b), paren(bin("+", num(c), num(d)))));
      },
      () => {
        // a³ − b·4:2, never below zero.
        const a = rng.int(2, 3);
        return bin("-", pow(num(a), 3), bin(":", bin("*", n(2, a === 2 ? 4 : 9), num(4)), num(2)));
      },
    ],
  };
  return rng.pick(templates[difficulty])();
}

/**
 * What someone who reads strictly from left to right does first: the first
 * operator with its two neighbours, e.g. "14+2" in 14+2·9−8.
 * Brackets and powers count as one block here.
 */
function leftToRightStart(n: ArithNode): string | null {
  const flat: Array<ArithNode | string> = [];
  const walk = (m: ArithNode) => {
    if (m.k === "bin") {
      walk(m.l);
      flat.push(m.op === "*" ? "\\cdot " : m.op);
      walk(m.r);
    } else flat.push(m);
  };
  walk(n);
  if (flat.length < 5) return null;
  const [a, op, b] = flat as [ArithNode, string, ArithNode];
  return `${toLatex(a)}${op}${toLatex(b, undefined, false)}`;
}

/** The first bracket group in the tree, if any. */
function firstParen(n: ArithNode): ArithNode | null {
  if (n.k === "paren") return n;
  if (n.k === "num") return null;
  if (n.k === "pow") return firstParen(n.base);
  return firstParen(n.l) ?? firstParen(n.r);
}

const STEP_NOTES = {
  paren: L("Eerst wat tussen de haakjes staat.", "First, what is inside the brackets."),
  pow: L("Dan de macht.", "Then the power."),
  muldiv: L("Dan keer en gedeeld door, van links naar rechts.", "Then multiply and divide, from left to right."),
  addsub: L("Tot slot plus en min, van links naar rechts.", "Finally add and subtract, from left to right."),
};

/** Hint 1 with the exercise's own operations. */
function orderNudge(tree: ArithNode): Loc {
  const first = nextOperation(tree)!;
  const br = firstParen(tree);
  const f = toLatex(first);
  if (br) {
    return L(
      `Er staan haakjes: $${toLatex(br)}$. Wat tussen haakjes staat, doe je altijd eerst.`,
      `There are brackets: $${toLatex(br)}$. What is inside brackets always comes first.`,
    );
  }
  if (first.k === "pow") {
    return L(
      `Er staat een macht: $${f}$. Een macht gaat vóór keer, delen, plus en min.`,
      `There is a power: $${f}$. A power comes before multiply, divide, add and subtract.`,
    );
  }
  const left = leftToRightStart(tree);
  if (left && left !== f) {
    return L(
      `Niet zomaar van links naar rechts! Wat doe je eerst: $${left}$ of $${f}$?`,
      `Do not just go from left to right! What comes first: $${left}$ or $${f}$?`,
    );
  }
  return L(`Begin met $${f}$. Kijk daarna wat er over is.`, `Start with $${f}$. Then look at what is left.`);
}

export const orderOfOperations: Generator = {
  id: "u0.order-of-operations",
  skillId: "u0.order-of-operations",
  title: L("Rekenvolgorde", "Order of operations"),
  generate(rng, difficulty) {
    const tree = orderOfOpsTree(rng, difficulty);
    const value = evalTree(tree);
    const latex = toLatex(tree);
    const reduced = reduceSteps(tree);
    const steps: Step[] = [
      { latex, note: L("Dit is de som.", "This is the sum.") },
      // Every intermediate number is a blank the learner fills in.
      ...reduced.map((s) => ({ latex: s.latex.replace("\\hl{", "\\ask{"), note: STEP_NOTES[s.kind] })),
    ];
    const wrong = leftToRight(tree);
    return {
      prompt: L("Reken uit. Let op de rekenvolgorde.", "Work it out. Mind the order of operations."),
      latex,
      visual: {
        kind: "custom",
        widget: "u0.order-tap",
        props: { expr: latex },
        describe: L(
          `De som $${latex}$. Tik steeds op de bewerking die als eerste moet.`,
          `The sum $${latex}$. Tap the operation that comes first, each time.`,
        ),
      },
      answer: { kind: "expr", latex: frac(value), form: "integer" },
      calculator: "off",
      hints: {
        nudge: orderNudge(tree),
        rule: {
          text: L(
            "Rekenvolgorde: Haakjes, Machten en Wortels, Vermenigvuldigen en Delen, Optellen en Aftrekken.",
            "Order of operations: Brackets, Powers and roots, Multiply and divide, Add and subtract.",
          ),
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
                explain: L(
                  "Je rekende alles van links naar rechts. Keer en gedeeld door gaan vóór plus en min.",
                  "You worked strictly from left to right. Multiply and divide come before add and subtract.",
                ),
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
    // Whole, small and not negative: negative numbers come in unit 1.
    return v !== null && Number.isInteger(v) && v >= 0 && v <= 200;
  },
};
