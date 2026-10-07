/**
 * Lessons 5 and 6 generators: square roots (wortels).
 * - working out roots (also decimals, fractions, cube roots, roots in sums),
 * - estimating a root between two whole numbers,
 * - simplifying a root: √50 = 5√2 (and back).
 */
import Fraction from "fraction.js";
import type { GeneratedExercise, Generator, Loc, Step } from "@/content/types";
import type { AnswerSpec, Mistake } from "@/math/check";
import { frac, gcd } from "@/math/latex";
import type { Rng } from "@/math/random";
import type { VisualSpec } from "@/visuals/types";
import { br, cleanMistakes, custom, L, perfectRoot, valueOf } from "../helpers";

/** The square-of-cells widget for √n. */
export function rootSquare(n: number): VisualSpec {
  return custom(
    "u1.root-square",
    { area: n },
    L(
      `$${n}$ hokjes. Zoek de zijde van een vierkant met precies $${n}$ hokjes.`,
      `$${n}$ cells. Find the side of a square with exactly $${n}$ cells.`,
    ),
  );
}

/** The square-factor widget for simplifying √n. */
export function squareFactor(n: number): VisualSpec {
  return custom(
    "u1.square-factor",
    { n },
    L(`Zoek een kwadraat dat in $${n}$ past.`, `Find a square number that fits into $${n}$.`),
  );
}

const rootRule = {
  text: L(
    "Wortel: $\\sqrt{a}$ is het getal dat keer zichzelf $a$ geeft. Denk aan de zijde van een vierkant met oppervlakte $a$.",
    "Square root: $\\sqrt{a}$ is the number that times itself gives $a$. Think of the side of a square with area $a$.",
  ),
  ruleId: "u1.square-root",
};

// ---------------------------------------------------------------------------
// Working out roots
// ---------------------------------------------------------------------------

type Built = {
  latex: string;
  prompt: Loc;
  answer: AnswerSpec;
  value: string;
  steps: Step[];
  nudge: Loc;
  rule: { text: Loc; ruleId: string; mnemonic?: "hmwvdoa" };
  mistakes: Array<Mistake | null>;
  visual?: VisualSpec;
};

/** √(k²): bare, as the side of a square, or as the box in □² = k². */
function plainRoot(k: number, form: "root" | "area" | "box"): Built {
  const n = k * k;
  const steps: Step[] = [
    { latex: `\\sqrt{${n}}`, note: L(`Welk getal keer zichzelf is $${n}$?`, `Which number times itself is $${n}$?`) },
    { latex: `\\sqrt{\\hl{${k}\\cdot ${k}}}`, note: L(`$${k}\\cdot ${k}=${n}$.`, `$${k}\\cdot ${k}=${n}$.`) },
    { latex: `\\ask{${k}}`, note: L(`Dus de wortel is $${k}$.`, `So the root is $${k}$.`) },
  ];
  return {
    latex: form === "area" ? `A=${n}` : form === "box" ? `\\square^{2}=${n}` : `\\sqrt{${n}}`,
    prompt:
      form === "area"
        ? L(`Een vierkant heeft een oppervlakte van $${n}$ hokjes. Hoe lang is een zijde?`, `A square has an area of $${n}$ cells. How long is one side?`)
        : form === "box"
          ? L("Welk positief getal komt in het vakje?", "Which positive number goes in the box?")
          : L("Bereken.", "Work it out."),
    answer: { kind: "expr", latex: String(k), form: "integer" },
    value: String(k),
    steps,
    nudge:
      k >= 20 && k % 10 === 0
        ? L(
            `$${n}=${(k / 10) ** 2}\\cdot 100$. Wat keer zichzelf is $${(k / 10) ** 2}$? En $10\\cdot 10=100$.`,
            `$${n}=${(k / 10) ** 2}\\cdot 100$. What times itself is $${(k / 10) ** 2}$? And $10\\cdot 10=100$.`,
          )
        : L(
            `Zoek een getal dat keer zichzelf $${n}$ geeft. Probeer: $${k > 3 ? k - 2 : k + 1}\\cdot ${k > 3 ? k - 2 : k + 1}=${(k > 3 ? k - 2 : k + 1) ** 2}$. Te ${k > 3 ? "klein" : "groot"}? Probeer verder.`,
            `Find a number that times itself gives $${n}$. Try: $${k > 3 ? k - 2 : k + 1}\\cdot ${k > 3 ? k - 2 : k + 1}=${(k > 3 ? k - 2 : k + 1) ** 2}$. Too ${k > 3 ? "small" : "big"}? Keep trying.`,
          ),
    rule: rootRule,
    mistakes: [
      n % 2 === 0 && n / 2 !== k
        ? {
            id: "half",
            latex: String(n / 2),
            explain: L(
              `Wortel is niet de helft. Controleer: $${n / 2}\\cdot ${n / 2}$ is veel meer dan $${n}$.`,
              `A root is not half. Check: $${n / 2}\\cdot ${n / 2}$ is much more than $${n}$.`,
            ),
          }
        : null,
    ],
    visual: n <= 400 ? rootSquare(n) : undefined,
  };
}

/** √(p²/q²) as a decimal or a fraction, or a cube root. */
function specialRoot(rng: Rng): Built {
  const kind = rng.int(0, 2);
  if (kind === 0) {
    // √0.09 = 0.3, √1.44 = 1.2 or √0.0004 = 0.02
    const small = rng.chance(0.3);
    const [D, R] = small ? [10000, 100] : [100, 10];
    const k = small ? rng.int(1, 9) : rng.pick([1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14, 15]);
    const n = new Fraction(k * k, D);
    const r = new Fraction(k, R);
    const nd = n.toString();
    const rd = r.toString();
    return {
      latex: `\\sqrt{${nd}}`,
      prompt: L("Bereken. Geef je antwoord als kommagetal.", "Work it out. Give your answer as a decimal."),
      answer: { kind: "expr", latex: rd, form: "decimal", decimals: small ? 2 : 1 },
      value: rd,
      steps: [
        { latex: `\\sqrt{${nd}}`, note: L(`Schrijf $${nd}$ als breuk.`, `Write $${nd}$ as a fraction.`) },
        { latex: `\\sqrt{\\hl{\\frac{${k * k}}{${D}}}}`, note: L(`$${nd}=\\frac{${k * k}}{${D}}$.`, `$${nd}=\\frac{${k * k}}{${D}}$.`) },
        { latex: `\\frac{\\ask{${k}}}{${R}}`, note: L(`$\\sqrt{${k * k}}=${k}$ en $\\sqrt{${D}}=${R}$.`, `$\\sqrt{${k * k}}=${k}$ and $\\sqrt{${D}}=${R}$.`) },
        { latex: `\\ask{${rd}}`, note: L("Als kommagetal.", "As a decimal.") },
      ],
      nudge: L(
        `Controleer je antwoord met keer: welk kommagetal keer zichzelf is $${nd}$? Tip: $${nd}=\\frac{${k * k}}{${D}}$.`,
        `Check your answer by multiplying: which decimal times itself is $${nd}$? Tip: $${nd}=\\frac{${k * k}}{${D}}$.`,
      ),
      rule: rootRule,
      mistakes: [
        {
          id: "wrong-place",
          latex: new Fraction(k, 10 * R).toString(),
          explain: L(
            `Controleer: $${new Fraction(k, 10 * R).toString()}\\cdot ${new Fraction(k, 10 * R).toString()}$ is veel kleiner dan $${nd}$. Let op de komma.`,
            `Check: $${new Fraction(k, 10 * R).toString()}\\cdot ${new Fraction(k, 10 * R).toString()}$ is much smaller than $${nd}$. Watch the decimal point.`,
          ),
          relatedSkill: "u0.decimal-arithmetic",
        },
      ],
    };
  }
  if (kind === 1) {
    // √(p²/q²) = p/q
    let p: number, q: number;
    do [p, q] = [rng.int(1, 6), rng.int(2, 12)];
    while (p >= q || gcd(p, q) !== 1);
    const f = `\\frac{${p * p}}{${q * q}}`;
    return {
      latex: `\\sqrt{${f}}`,
      prompt: L("Bereken. Geef je antwoord als breuk.", "Work it out. Give your answer as a fraction."),
      answer: { kind: "expr", latex: `\\frac{${p}}{${q}}`, form: "fraction" },
      value: `\\frac{${p}}{${q}}`,
      steps: [
        { latex: `\\sqrt{${f}}`, note: L("Neem de wortel van boven en van onder.", "Take the root of the top and of the bottom.") },
        { latex: `\\frac{\\hl{\\sqrt{${p * p}}}}{\\hl{\\sqrt{${q * q}}}}`, note: L("Teller en noemer apart.", "Numerator and denominator separately.") },
        { latex: `\\frac{\\ask{${p}}}{${q}}`, note: L(`$\\sqrt{${p * p}}=${p}$.`, `$\\sqrt{${p * p}}=${p}$.`) },
      ],
      nudge: L(
        `Neem de wortel van $${p * p}$ en de wortel van $${q * q}$ apart.`,
        `Take the root of $${p * p}$ and the root of $${q * q}$ separately.`,
      ),
      rule: rootRule,
      mistakes: [
        {
          id: "half",
          latex: frac(new Fraction(p * p, q * q).div(2)),
          explain: L("Wortel is niet de helft. Neem de wortel van teller en noemer.", "A root is not half. Take the root of the numerator and the denominator."),
        },
      ],
    };
  }
  // ∛(k³), also with a negative number.
  const k = rng.pick([2, 3, 4, 5, 6, 10]) * (rng.chance(0.3) ? -1 : 1);
  const n = k ** 3;
  return {
    latex: `\\sqrt[3]{${n}}`,
    prompt: L("Bereken. Dit is een derdemachtswortel.", "Work it out. This is a cube root."),
    answer: { kind: "expr", latex: String(k), form: "integer" },
    value: String(k),
    steps: [
      { latex: `\\sqrt[3]{${n}}`, note: L(`Welk getal drie keer met zichzelf vermenigvuldigd is $${n}$?`, `Which number multiplied by itself three times is $${n}$?`) },
      {
        latex: `\\sqrt[3]{\\hl{${k < 0 ? `(${k})\\cdot(${k})\\cdot(${k})` : `${k}\\cdot ${k}\\cdot ${k}`}}}`,
        note: L(`$${n}=${br(k)}^{3}$.`, `$${n}=${br(k)}^{3}$.`),
      },
      { latex: `\\ask{${k}}`, note: L(`Dus $\\sqrt[3]{${n}}=${k}$.`, `So $\\sqrt[3]{${n}}=${k}$.`) },
    ],
    nudge:
      k < 0
        ? L(`Drie keer een negatief getal geeft een negatief getal. Welk getal keer zichzelf keer zichzelf is $${-n}$?`, `Three times a negative number gives a negative number. Which number times itself times itself is $${-n}$?`)
        : L(`Probeer: $2\\cdot 2\\cdot 2=8$, $3\\cdot 3\\cdot 3=27$. Welk getal geeft $${n}$?`, `Try: $2\\cdot 2\\cdot 2=8$, $3\\cdot 3\\cdot 3=27$. Which number gives $${n}$?`),
    rule: {
      text: L("Derdemachtswortel: $\\sqrt[3]{a}$ is het getal dat tot de derde macht $a$ geeft. Bij een kubus is dat de ribbe.", "Cube root: $\\sqrt[3]{a}$ is the number whose cube is $a$. For a cube that is the edge."),
      ruleId: "u1.cube-root",
    },
    mistakes: [{ id: "third", latex: frac(new Fraction(n, 3)), explain: L("Een derdemachtswortel is niet delen door $3$. Zoek een getal $g$ met $g\\cdot g\\cdot g$.", "A cube root is not dividing by $3$. Find a number $g$ with $g\\cdot g\\cdot g$.") }],
  };
}

/** Triples whose long side is a root the learner knows (up to 15, and 20). */
const PYTHAGOREAN: Array<[number, number, number]> = [
  [3, 4, 5],
  [6, 8, 10],
  [5, 12, 13],
  [9, 12, 15],
  [12, 16, 20],
];

/** Roots inside a sum. */
function rootInSum(rng: Rng): Built {
  const kind = rng.int(0, 2);
  const order = {
    text: L(
      "Een wortel werkt als haakjes: reken eerst uit wat onder de wortel staat. Daarna de wortel, dan keer, dan plus en min.",
      "A root works like brackets: first work out what is under the root. Then the root, then multiply, then add and subtract.",
    ),
    ruleId: "u0.order-of-operations",
    mnemonic: "hmwvdoa" as const,
  };
  if (kind === 0) {
    // √p ± √q: you may NOT add under the root.
    const plus = rng.chance();
    let a: number, b: number;
    do [a, b] = [rng.int(2, 12), rng.int(1, 12)];
    while (a === b || (!plus && a <= b));
    const latex = `\\sqrt{${a * a}}${plus ? "+" : "-"}\\sqrt{${b * b}}`;
    const value = plus ? a + b : a - b;
    const joined = plus ? a * a + b * b : a * a - b * b;
    return {
      latex,
      prompt: L("Bereken.", "Work it out."),
      answer: { kind: "expr", latex: String(value), form: "integer" },
      value: String(value),
      steps: [
        { latex, note: L("Twee aparte wortels. Reken ze los uit.", "Two separate roots. Work them out separately.") },
        { latex: `\\ask{${a}}${plus ? "+" : "-"}\\sqrt{${b * b}}`, note: L(`$\\sqrt{${a * a}}=${a}$.`, `$\\sqrt{${a * a}}=${a}$.`) },
        { latex: `${a}${plus ? "+" : "-"}\\ask{${b}}`, note: L(`$\\sqrt{${b * b}}=${b}$.`, `$\\sqrt{${b * b}}=${b}$.`) },
        { latex: `\\ask{${value}}`, note: L(plus ? "Tel op." : "Trek af.", plus ? "Add." : "Subtract.") },
      ],
      nudge: L(
        `Reken $\\sqrt{${a * a}}$ en $\\sqrt{${b * b}}$ eerst apart uit. Pas daarna ${plus ? "optellen" : "aftrekken"}.`,
        `First work out $\\sqrt{${a * a}}$ and $\\sqrt{${b * b}}$ separately. Only then ${plus ? "add" : "subtract"}.`,
      ),
      rule: order,
      mistakes: [
        {
          id: "join-roots",
          latex: `\\sqrt{${joined}}`,
          explain: L(
            `Je mag wortels niet samenvoegen bij plus of min: $\\sqrt{${a * a}}${plus ? "+" : "-"}\\sqrt{${b * b}}$ is niet $\\sqrt{${joined}}$.`,
            `You may not join roots with plus or minus: $\\sqrt{${a * a}}${plus ? "+" : "-"}\\sqrt{${b * b}}$ is not $\\sqrt{${joined}}$.`,
          ),
        },
      ],
    };
  }
  if (kind === 1) {
    // √(a² + b²): first under the root, then the root (Pythagoras).
    const [a, b, c] = rng.pick(PYTHAGOREAN);
    const latex = `\\sqrt{${a}^{2}+${b}^{2}}`;
    return {
      latex,
      prompt: L("Bereken.", "Work it out."),
      answer: { kind: "expr", latex: String(c), form: "integer" },
      value: String(c),
      steps: [
        { latex, note: L("Eerst alles onder de wortel.", "First everything under the root.") },
        { latex: `\\sqrt{\\ask{${a * a}}+${b * b}}`, note: L(`$${a}^{2}=${a * a}$ en $${b}^{2}=${b * b}$.`, `$${a}^{2}=${a * a}$ and $${b}^{2}=${b * b}$.`) },
        { latex: `\\sqrt{\\ask{${c * c}}}`, note: L("Tel op onder de wortel.", "Add under the root.") },
        { latex: `\\ask{${c}}`, note: L(`$${c}\\cdot ${c}=${c * c}$.`, `$${c}\\cdot ${c}=${c * c}$.`) },
      ],
      nudge: L(
        `Reken eerst uit wat onder de wortel staat: $${a}^{2}+${b}^{2}$. Neem pas daarna de wortel.`,
        `First work out what is under the root: $${a}^{2}+${b}^{2}$. Only then take the root.`,
      ),
      rule: order,
      mistakes: [
        {
          id: "root-of-sum",
          latex: String(a + b),
          explain: L(
            `$\\sqrt{${a}^{2}+${b}^{2}}$ is niet $${a}+${b}$. Eerst optellen onder de wortel: $${a * a}+${b * b}=${c * c}$.`,
            `$\\sqrt{${a}^{2}+${b}^{2}}$ is not $${a}+${b}$. First add under the root: $${a * a}+${b * b}=${c * c}$.`,
          ),
          relatedSkill: "u0.pythagoras-long",
        },
      ],
    };
  }
  // k·√(m²) − c
  const k = rng.int(2, 5);
  const m = rng.int(2, 10);
  const c = rng.int(1, 20);
  const latex = `${k}\\sqrt{${m * m}}-${c}`;
  const value = k * m - c;
  return {
    latex,
    prompt: L("Bereken.", "Work it out."),
    answer: { kind: "expr", latex: String(value), form: "integer" },
    value: String(value),
    steps: [
      { latex, note: L(`$${k}\\sqrt{${m * m}}$ betekent $${k}$ keer de wortel.`, `$${k}\\sqrt{${m * m}}$ means $${k}$ times the root.`) },
      { latex: `${k}\\cdot\\ask{${m}}-${c}`, note: L("Eerst de wortel.", "First the root.") },
      { latex: `\\ask{${k * m}}-${c}`, note: L("Dan keer.", "Then multiply.") },
      { latex: `\\ask{${value}}`, note: L("Tot slot min.", "Finally subtract.") },
    ],
    nudge: L(
      `Tussen $${k}$ en de wortel staat een onzichtbaar keer. Reken eerst $\\sqrt{${m * m}}$ uit.`,
      `Between $${k}$ and the root there is an invisible times. First work out $\\sqrt{${m * m}}$.`,
    ),
    rule: order,
    mistakes: [
      {
        id: "root-times",
        latex: String(k * m * m - c),
        explain: L(
          `Je vergat de wortel. Eerst $\\sqrt{${m * m}}=${m}$, dan keer $${k}$.`,
          `You forgot the root. First $\\sqrt{${m * m}}=${m}$, then times $${k}$.`,
        ),
      },
    ],
  };
}

export const squareRoot: Generator = {
  id: "u1.square-root",
  skillId: "u1.square-roots",
  title: L("Wortels uitrekenen", "Working out roots"),
  generate(rng, difficulty) {
    let b: Built;
    if (difficulty === 1) {
      const k = rng.chance(0.75) ? rng.int(2, 15) : 10 * rng.int(2, 12);
      b = plainRoot(k, rng.pick(["root", "root", "area", "box"] as const));
    } else if (difficulty === 2) b = specialRoot(rng);
    else b = rootInSum(rng);
    return {
      prompt: b.prompt,
      latex: b.latex,
      visual: b.visual,
      answer: b.answer,
      calculator: "off",
      hints: { nudge: b.nudge, rule: b.rule, solution: { steps: b.steps } },
      mistakes: cleanMistakes(b.value, b.mistakes),
    };
  },
  verify(ex) {
    // Independent check: square (or cube) the answer and compare, or let the CAS evaluate.
    if (ex.answer.kind !== "expr" || !ex.latex) return false;
    const ans = valueOf(ex.answer.latex);
    if (ans === null) return false;
    if (ex.latex.startsWith("A=")) return ans > 0 && Math.abs(ans * ans - Number(ex.latex.slice(2))) < 1e-9;
    if (ex.latex.startsWith("\\square^{2}=")) return ans > 0 && Math.abs(ans * ans - Number(ex.latex.split("=")[1])) < 1e-9;
    const cube = ex.latex.match(/^\\sqrt\[3\]\{(-?\d+)\}$/);
    if (cube) return Math.abs(ans ** 3 - Number(cube[1])) < 1e-9;
    const v = valueOf(ex.latex);
    return v !== null && Math.abs(v - ans) < 1e-9;
  },
};

// ---------------------------------------------------------------------------
// Estimating a root between two whole numbers
// ---------------------------------------------------------------------------

/** Hint 1 for estimating √n: where to start looking, without the answer. */
function estimateNudge(n: number, below: number): Loc {
  if (n < 100)
    return L(
      `Welk kwadraat ligt net onder $${n}$? En welk net erboven? Kijk in het rijtje $1, 4, 9, 16, 25, 36, 49, 64, 81, 100$.`,
      `Which square number is just below $${n}$? And which one just above? Look at the list $1, 4, 9, 16, 25, 36, 49, 64, 81, 100$.`,
    );
  const t = 10 * Math.floor(below / 10);
  return L(
    `Begin bij $${t}^{2}=${t * t}$. Dat is kleiner dan $${n}$. Probeer dan $${t + 1}^{2}$, $${t + 2}^{2}$, ... tot je boven $${n}$ komt.`,
    `Start at $${t}^{2}=${t * t}$. That is less than $${n}$. Then try $${t + 1}^{2}$, $${t + 2}^{2}$, ... until you get above $${n}$.`,
  );
}

export const rootEstimate: Generator = {
  id: "u1.root-estimate",
  skillId: "u1.root-estimate",
  title: L("Wortels schatten", "Estimating roots"),
  generate(rng, difficulty) {
    const [lo, hi] = difficulty === 1 ? [2, 99] : difficulty === 2 ? [101, 224] : [226, 999];
    let n: number;
    do n = rng.int(lo, hi);
    while (perfectRoot(n) !== null);
    const k = Math.floor(Math.sqrt(n));
    // Guard against floating point: k² < n < (k+1)².
    const below = k * k < n ? k : k - 1;
    const above = below + 1;
    const steps: Step[] = [
      { latex: `${below}^{2}<${n}`, note: L(`$${below}^{2}=${below * below}$. Dat is kleiner dan $${n}$.`, `$${below}^{2}=${below * below}$. That is less than $${n}$.`) },
      { latex: `${n}<${above}^{2}`, note: L(`$${above}^{2}=${above * above}$. Dat is groter dan $${n}$.`, `$${above}^{2}=${above * above}$. That is more than $${n}$.`) },
      { latex: `\\ask{${below}}<\\sqrt{${n}}`, note: L(`Dus $\\sqrt{${n}}$ is groter dan $${below}$...`, `So $\\sqrt{${n}}$ is bigger than $${below}$...`) },
      { latex: `\\sqrt{${n}}<\\ask{${above}}`, note: L(`... en kleiner dan $${above}$.`, `... and smaller than $${above}$.`) },
    ];
    return {
      prompt: L(
        `Tussen welke twee gehele getallen ligt $\\sqrt{${n}}$? Vul in: groter dan ... en kleiner dan ...`,
        `Between which two whole numbers is $\\sqrt{${n}}$? Fill in: bigger than ... and smaller than ...`,
      ),
      latex: `\\square<\\sqrt{${n}}<\\square`,
      visual: n <= 400 ? rootSquare(n) : undefined,
      answer: {
        kind: "multi",
        parts: [
          { label: `\\sqrt{${n}}>`, answer: { latex: String(below), form: "integer" } },
          { label: `\\sqrt{${n}}<`, answer: { latex: String(above), form: "integer" } },
        ],
      },
      calculator: "off",
      hints: {
        nudge: estimateNudge(n, below),
        rule: {
          text: L(
            "Ligt een getal tussen twee kwadraten, dan ligt de wortel tussen de twee grondtallen: $36<40<49$, dus $6<\\sqrt{40}<7$.",
            "If a number lies between two squares, its root lies between the two bases: $36<40<49$, so $6<\\sqrt{40}<7$.",
          ),
          ruleId: "u1.square-root",
        },
        solution: { steps },
      },
    };
  },
  verify(ex) {
    // Independent check: the CAS value of the root lies between the two answers.
    if (ex.answer.kind !== "multi" || !ex.latex) return false;
    const n = Number(ex.latex.match(/\\sqrt\{(\d+)\}/)?.[1]);
    const r = valueOf(`\\sqrt{${n}}`);
    const [a, b] = ex.answer.parts.map((p) => Number(p.answer.latex));
    return r !== null && a < r && r < b && b === a + 1;
  },
};

// ---------------------------------------------------------------------------
// Simplifying roots
// ---------------------------------------------------------------------------

/** Square-free numbers left under the root. */
const SQUARE_FREE = [2, 3, 5, 6, 7, 10, 11];

/** The biggest k with k² dividing n. */
export function largestSquareFactor(n: number): number {
  for (let k = Math.floor(Math.sqrt(n)); k > 1; k--) if (n % (k * k) === 0) return k;
  return 1;
}

function simplifySteps(n: number, k: number, b: number, given?: string): Step[] {
  const steps: Step[] = [];
  if (given) steps.push({ latex: given, note: L("Dit staat er.", "This is what it says.") });
  else
    steps.push({ latex: `\\sqrt{${n}}`, note: L(`Het grootste kwadraat in $${n}$ is $${k * k}$.`, `The biggest square number in $${n}$ is $${k * k}$.`) });
  if (!given) steps.push({ latex: `\\sqrt{\\hl{${k * k}\\cdot ${b}}}`, note: L(`$${n}=${k * k}\\cdot ${b}$.`, `$${n}=${k * k}\\cdot ${b}$.`) });
  steps.push(
    { latex: `\\hl{\\sqrt{${k * k}}\\cdot\\sqrt{${b}}}`, note: L("Splits de wortel in twee wortels.", "Split the root into two roots.") },
    { latex: `\\ask{${k}}\\sqrt{${b}}`, note: L(`$\\sqrt{${k * k}}=${k}$. Die gaat naar voren.`, `$\\sqrt{${k * k}}=${k}$. It goes to the front.`) },
  );
  return steps;
}

const simplifyRule = {
  text: L(
    "Wortel vereenvoudigen: zoek het grootste kwadraat dat in het getal past. $\\sqrt{k^{2}\\cdot b}=k\\sqrt{b}$.",
    "Simplifying a root: find the biggest square number that fits into the number. $\\sqrt{k^{2}\\cdot b}=k\\sqrt{b}$.",
  ),
  ruleId: "u1.simplify-root",
};

export const simplifyRoot: Generator = {
  id: "u1.simplify-root",
  skillId: "u1.simplify-roots",
  title: L("Wortels vereenvoudigen", "Simplifying roots"),
  generate(rng, difficulty) {
    const b = rng.pick(difficulty === 1 ? [2, 3, 5, 6, 7] : SQUARE_FREE);
    const k = rng.int(2, difficulty === 1 ? 10 : difficulty === 2 ? 6 : 5);
    const n = k * k * b;
    const multi = (coef: number, under: number): AnswerSpec => ({
      kind: "multi",
      parts: [
        { label: "a=", answer: { latex: String(coef), form: "integer" } },
        { label: "b=", answer: { latex: String(under), form: "integer" } },
      ],
    });
    const prompt = L(
      "Vereenvoudig. Schrijf als $a\\sqrt{b}$ met $b$ zo klein mogelijk.",
      "Simplify. Write it as $a\\sqrt{b}$ with $b$ as small as possible.",
    );

    // Difficulty 1: the split is already given.
    if (difficulty === 1) {
      const given = rng.chance() ? `\\sqrt{${k * k}\\cdot ${b}}` : `\\sqrt{${b}\\cdot ${k * k}}`;
      return {
        prompt,
        latex: given,
        visual: squareFactor(n),
        answer: multi(k, b),
        calculator: "off",
        hints: {
          nudge: L(
            `Onder de wortel staat het kwadraat $${k * k}$. Wat is $\\sqrt{${k * k}}$?`,
            `Under the root there is the square number $${k * k}$. What is $\\sqrt{${k * k}}$?`,
          ),
          rule: simplifyRule,
          solution: { steps: simplifySteps(n, k, b, given) },
        },
      };
    }

    // Difficulty 2: simplify √n, or the other way round: k√b = √?.
    if (difficulty === 2) {
      if (rng.chance()) {
        return {
          prompt,
          latex: `\\sqrt{${n}}`,
          visual: squareFactor(n),
          answer: multi(k, b),
          calculator: "off",
          hints: {
            nudge: L(
              `Welke kwadraten passen in $${n}$? Probeer $4$, $9$, $16$, $25$, $36$. Neem de grootste die past.`,
              `Which square numbers fit into $${n}$? Try $4$, $9$, $16$, $25$, $36$. Take the biggest one that fits.`,
            ),
            rule: simplifyRule,
            solution: { steps: simplifySteps(n, k, b) },
          },
        };
      }
      return {
        prompt: L("Schrijf als één wortel. Welk getal komt in het vakje?", "Write as one root. Which number goes in the box?"),
        latex: `${k}\\sqrt{${b}}=\\sqrt{\\square}`,
        answer: { kind: "expr", latex: String(n), form: "integer" },
        calculator: "off",
        hints: {
          nudge: L(
            `Schrijf $${k}$ als wortel: $${k}=\\sqrt{${k * k}}$. Dan staat er $\\sqrt{${k * k}}\\cdot\\sqrt{${b}}$.`,
            `Write $${k}$ as a root: $${k}=\\sqrt{${k * k}}$. Then it says $\\sqrt{${k * k}}\\cdot\\sqrt{${b}}$.`,
          ),
          rule: simplifyRule,
          solution: {
            // The steps follow the number in the box (under the root).
            steps: [
              { latex: `${k}^{2}\\cdot ${b}`, note: L(`$${k}=\\sqrt{${k}^{2}}$. Dus onder de wortel komt $${k}^{2}\\cdot ${b}$.`, `$${k}=\\sqrt{${k}^{2}}$. So under the root you get $${k}^{2}\\cdot ${b}$.`) },
              { latex: `\\ask{${k * k}}\\cdot ${b}`, note: L(`$${k}^{2}=${k * k}$.`, `$${k}^{2}=${k * k}$.`) },
              { latex: `\\ask{${n}}`, note: L(`Dus $${k}\\sqrt{${b}}=\\sqrt{${n}}$.`, `So $${k}\\sqrt{${b}}=\\sqrt{${n}}$.`) },
            ],
          },
        },
        mistakes: cleanMistakes(String(n), [
          {
            id: "not-squared",
            latex: String(k * b),
            explain: L(
              `$${k}$ onder de wortel wordt $${k}^{2}=${k * k}$, niet $${k}$. Want $\\sqrt{${k * k}}=${k}$.`,
              `$${k}$ under the root becomes $${k}^{2}=${k * k}$, not $${k}$. Because $\\sqrt{${k * k}}=${k}$.`,
            ),
          },
        ]),
      };
    }

    // Difficulty 3: c·√n, or a product of two roots.
    if (rng.chance()) {
      const c = rng.int(2, 4);
      const latex = `${c}\\sqrt{${n}}`;
      return {
        prompt,
        latex,
        visual: squareFactor(n),
        answer: multi(c * k, b),
        calculator: "off",
        hints: {
          nudge: L(
            `Vereenvoudig eerst $\\sqrt{${n}}$. Doe het daarna keer $${c}$.`,
            `First simplify $\\sqrt{${n}}$. Then multiply by $${c}$.`,
          ),
          rule: simplifyRule,
          solution: {
            steps: [
              { latex, note: L(`Het grootste kwadraat in $${n}$ is $${k * k}$.`, `The biggest square number in $${n}$ is $${k * k}$.`) },
              { latex: `${c}\\cdot\\sqrt{\\hl{${k * k}\\cdot ${b}}}`, note: L(`$${n}=${k * k}\\cdot ${b}$.`, `$${n}=${k * k}\\cdot ${b}$.`) },
              { latex: `${c}\\cdot\\ask{${k}}\\sqrt{${b}}`, note: L(`$\\sqrt{${k * k}}=${k}$.`, `$\\sqrt{${k * k}}=${k}$.`) },
              { latex: `\\ask{${c * k}}\\sqrt{${b}}`, note: L(`$${c}\\cdot ${k}=${c * k}$.`, `$${c}\\cdot ${k}=${c * k}$.`) },
            ],
          },
        },
      };
    }
    // √p·√q = √(pq), then simplify. p and q are chosen so pq = k²·b and
    // neither is a square number (√2·√16 would be too easy). √8 has no such
    // split, so pick k and b again until one exists.
    const splits = (m: number) => [...Array(m).keys()].slice(2).filter((d) => m % d === 0 && d * d < m && perfectRoot(d) === null && perfectRoot(m / d) === null);
    let [k3, b3] = [k, b];
    while (splits(k3 * k3 * b3).length === 0) [k3, b3] = [rng.int(2, 5), rng.pick(SQUARE_FREE)];
    return productOfRoots(rng, k3, b3, prompt, multi, splits(k3 * k3 * b3));
  },
  verify(ex) {
    // Independent check: a√b and the printed expression have the same value,
    // and b has no square factor left.
    if (!ex.latex) return false;
    if (ex.answer.kind === "expr") {
      const [lhs] = ex.latex.split("=");
      const l = valueOf(lhs);
      const r = valueOf(`\\sqrt{${ex.answer.latex}}`);
      return l !== null && r !== null && Math.abs(l - r) < 1e-9;
    }
    if (ex.answer.kind !== "multi") return false;
    const [a, b] = ex.answer.parts.map((p) => Number(p.answer.latex));
    const l = valueOf(ex.latex);
    const r = valueOf(`${a}\\sqrt{${b}}`);
    const squareFree = [4, 9, 25, 49].every((s) => b % s !== 0);
    return l !== null && r !== null && Math.abs(l - r) < 1e-9 && squareFree;
  },
};

/** √p·√q with pq = k²·b, simplified to k√b (difficulty 3). */
function productOfRoots(
  rng: Rng,
  k: number,
  b: number,
  prompt: Loc,
  multi: (coef: number, under: number) => AnswerSpec,
  divisors: number[],
): GeneratedExercise {
  const n = k * k * b;
  const p = rng.pick(divisors);
  const q = n / p;
  const latex = `\\sqrt{${p}}\\cdot\\sqrt{${q}}`;
  return {
    prompt,
    latex,
    visual: squareFactor(n),
    answer: multi(k, b),
    calculator: "off",
    hints: {
      nudge: L(
        `Zet alles onder één wortel: $\\sqrt{${p}\\cdot ${q}}=\\sqrt{${n}}$. Vereenvoudig dan.`,
        `Put everything under one root: $\\sqrt{${p}\\cdot ${q}}=\\sqrt{${n}}$. Then simplify.`,
      ),
      rule: simplifyRule,
      solution: {
        steps: [
          { latex, note: L("Twee wortels keer elkaar: één wortel.", "Two roots multiplied: one root.") },
          { latex: `\\sqrt{\\ask{${n}}}`, note: L(`$${p}\\cdot ${q}=${n}$.`, `$${p}\\cdot ${q}=${n}$.`) },
          ...simplifySteps(n, k, b).slice(1),
        ],
      },
    },
  };
}
