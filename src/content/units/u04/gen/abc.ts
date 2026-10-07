/**
 * Lessons 6 and 7 generators: the discriminant, the abc-formule, the
 * number of solutions, and "for which p is there exactly one solution?".
 */
import Fraction from "fraction.js";
import { roundHalfAwayFromZero, type Mistake } from "@/math/check";
import { frac, poly } from "@/math/latex";
import type { Rng } from "@/math/random";
import type { Difficulty, Generator, Loc, Step } from "@/content/types";
import { L, countRootsNumerically, custom, equationFn, holdsAt, num, par, quad, removeNote, solutionValues } from "../helpers";

/** Visual: the parabola of the equation, with optional +/- buttons. */
export function parabolaVisual(a: number, b: number, c: number, show: string[], controls: string[] = []) {
  return custom(
    "u4.parabola",
    { a, b, c, show, controls },
    L(
      `De parabool $y=${quad(a, b, c)}$ met de $x$-as.${controls.length ? " Met knoppen kun je de getallen veranderen." : ""}`,
      `The parabola $y=${quad(a, b, c)}$ with the $x$-axis.${controls.length ? " Buttons let you change the numbers." : ""}`,
    ),
  );
}

/** A quadratic equation, maybe written in another order. */
type Quad = { a: number; b: number; c: number; latex: string; rewritten: boolean };

/** Writes ax² + bx + c = 0 in a different but equal way (for level 3), with its right side. */
function rewrite(rng: Rng, a: number, b: number, c: number): { latex: string; rhs: string } {
  const k = rng.nonZeroInt(-6, 6);
  const make = (lhs: string, rhs: string) => ({ latex: `${lhs}=${rhs}`, rhs });
  switch (rng.int(0, 2)) {
    case 0:
      // ax² = -bx - c
      return make(poly([a, 0, 0]), poly([-b, -c]));
    case 1:
      // ax² + bx = -c
      return make(poly([a, b, 0]), String(-c));
    default:
      // ax² + bx + c + k = k
      return make(quad(a, b, c + k), String(k));
  }
}

/** Hint 1 for an equation that does not end in "= 0" yet, with its right side. */
function rewriteNudge(rhs: string, then: Loc): Loc {
  return L(
    `Rechts staat $${rhs}$, niet $0$. Breng $${rhs}$ eerst naar links. ${then.nl}`,
    `The right side is $${rhs}$, not $0$. First move $${rhs}$ to the left. ${then.en}`,
  );
}

/** Mixed-up but correct: `D` from a, b, c, and the coefficients text. */
const D = (q: { a: number; b: number; c: number }) => q.b * q.b - 4 * q.a * q.c;

/** Expression steps that compute D = b² − 4ac, with blanks for the learner. */
function discriminantSteps(q: Quad): Step[] {
  const { a, b, c } = q;
  const ac4 = 4 * a * c;
  const setup = q.rewritten
    ? L(
        `Schrijf eerst $${quad(a, b, c)}=0$. Dus $a=${a}$, $b=${b}$, $c=${c}$.`,
        `First write $${quad(a, b, c)}=0$. So $a=${a}$, $b=${b}$, $c=${c}$.`,
      )
    : L(`$a=${a}$, $b=${b}$, $c=${c}$. Vul in: $b^{2}-4ac$.`, `$a=${a}$, $b=${b}$, $c=${c}$. Fill in: $b^{2}-4ac$.`);
  return [
    { latex: `${par(b)}^{2}-4\\cdot ${par(a)}\\cdot ${par(c)}`, note: setup },
    { latex: `\\ask{${b * b}}-4\\cdot ${par(a)}\\cdot ${par(c)}`, note: L(`Reken $${par(b)}^{2}$ uit. Een kwadraat is nooit negatief.`, `Work out $${par(b)}^{2}$. A square is never negative.`) },
    { latex: `${b * b}-\\ask{${par(ac4)}}`, note: L(`Reken $4\\cdot ${par(a)}\\cdot ${par(c)}$ uit.`, `Work out $4\\cdot ${par(a)}\\cdot ${par(c)}$.`) },
    { latex: `\\ask{${D(q)}}`, note: L(ac4 < 0 ? "Min keer min is plus." : "Trek af.", ac4 < 0 ? "Minus times minus is plus." : "Subtract.") },
  ];
}

const D_RULE: Loc = L(
  "Discriminant: schrijf $ax^{2}+bx+c=0$. Dan $D=b^{2}-4ac$. Negatieve getallen tussen haakjes.",
  "Discriminant: write $ax^{2}+bx+c=0$. Then $D=b^{2}-4ac$. Negative numbers in brackets.",
);

function pickCoefs(rng: Rng, difficulty: Difficulty): { a: number; b: number; c: number } {
  const a = difficulty === 1 ? 1 : rng.pick([-3, -2, -1, 1, 2, 3, 4, 5]);
  const b = rng.nonZeroInt(-9, 9);
  const c = rng.nonZeroInt(-9, 9);
  return { a, b, c };
}

/**
 * Independent check of D: at the top, 4a · f(x_top) = −D. The coefficients
 * are read back from the equation by evaluating it at -1, 0 and 1.
 */
function dByVertex(eqLatex: string): number | null {
  const g = equationFn(eqLatex);
  if (!g) return null;
  const [m, z, p] = [g(-1), g(0), g(1)];
  if (m === null || z === null || p === null) return null;
  const a = (p + m - 2 * z) / 2;
  const b = (p - m) / 2;
  const xt = -b / (2 * a);
  const top = g(xt);
  return top === null ? null : -4 * a * top;
}

export const discriminant: Generator = {
  id: "u4.discriminant",
  skillId: "u4.discriminant",
  title: L("De discriminant", "The discriminant"),
  generate(rng, difficulty) {
    const { a, b, c } = pickCoefs(rng, difficulty);
    const rewritten = difficulty === 3;
    const rw = rewritten ? rewrite(rng, a, b, c) : null;
    const q: Quad = { a, b, c, latex: rw ? rw.latex : `${quad(a, b, c)}=0`, rewritten };
    const d = D(q);
    const mistakes: Mistake[] = [
      {
        id: "sign-4ac",
        latex: String(b * b + 4 * a * c),
        explain: L(`Let op het teken: $-4\\cdot ${par(a)}\\cdot ${par(c)}=${-4 * a * c}$.`, `Watch the sign: $-4\\cdot ${par(a)}\\cdot ${par(c)}=${-4 * a * c}$.`),
      },
      {
        id: "no-four",
        latex: String(b * b - a * c),
        explain: L("Vergeet de $4$ niet: $D=b^{2}-4ac$.", "Do not forget the $4$: $D=b^{2}-4ac$."),
      },
    ];
    if (b < 0) {
      mistakes.push({
        id: "negative-square",
        latex: String(-b * b - 4 * a * c),
        explain: L(
          `$(${b})^{2}=${b}\\cdot ${par(b)}=${b * b}$. Een kwadraat is nooit negatief. Zet $${b}$ tussen haakjes.`,
          `$(${b})^{2}=${b}\\cdot ${par(b)}=${b * b}$. A square is never negative. Put $${b}$ in brackets.`,
        ),
        relatedSkill: "u0.order-of-operations",
      });
    }
    return {
      prompt: L("Bereken de discriminant $D$.", "Work out the discriminant $D$."),
      latex: q.latex,
      answer: { kind: "expr", latex: String(d), form: "integer" },
      calculator: "off",
      hints: {
        nudge: rw
          ? rewriteNudge(rw.rhs, L("Lees dan $a$, $b$ en $c$ af.", "Then read off $a$, $b$ and $c$."))
          : L(
              `Hier is $a=${a}$, $b=${b}$ en $c=${c}$. Reken $${par(b)}^{2}$ en $4\\cdot ${par(a)}\\cdot ${par(c)}$ apart uit.`,
              `Here $a=${a}$, $b=${b}$ and $c=${c}$. Work out $${par(b)}^{2}$ and $4\\cdot ${par(a)}\\cdot ${par(c)}$ separately.`,
            ),
        rule: { text: D_RULE, ruleId: "u4.discriminant" },
        solution: { steps: discriminantSteps(q) },
      },
      mistakes: mistakes.filter((m) => m.latex !== String(d)),
    };
  },
  verify(ex) {
    if (ex.answer.kind !== "expr" || !ex.latex) return false;
    const byTop = dByVertex(ex.latex);
    return byTop !== null && Math.abs(byTop - Number(ex.answer.latex)) < 1e-6;
  },
};

// ---------------------------------------------------------------------------
// The abc-formule
// ---------------------------------------------------------------------------

const ABC_RULE: Loc = L(
  "abc-formule: $x=\\frac{-b+\\sqrt{D}}{2a}\\lor x=\\frac{-b-\\sqrt{D}}{2a}$ met $D=b^{2}-4ac$. Eerst moet rechts $0$ staan.",
  "Quadratic formula: $x=\\frac{-b+\\sqrt{D}}{2a}$ or $x=\\frac{-b-\\sqrt{D}}{2a}$ with $D=b^{2}-4ac$. First the right side must be $0$.",
);

/** `\frac{-b ± \sqrt{D}}{2a}` as LaTeX for one sign. */
const abcLatex = (b: number, d: number | string, a: number, sign: "+" | "-") =>
  `\\frac{${b === 0 ? (sign === "+" ? "" : "-") : `${-b}${sign}`}\\sqrt{${d}}}{${2 * a}}`;

/** A number with a decimal comma in Dutch notes. */
/** A rounded number with exactly 2 decimals, Dutch style: `8{,}80`. */
const nlNum = (v: number) => v.toFixed(2).replace(".", "{,}");

const round2 = (v: number) => roundHalfAwayFromZero(v, 2);

export const abcFormula: Generator = {
  id: "u4.abc",
  skillId: "u4.abc",
  title: L("De abc-formule", "The quadratic formula"),
  generate(rng, difficulty) {
    let a: number, b: number, c: number;
    let kind: "square" | "irrational" | "zero" | "none";
    if (difficulty === 1) {
      // Whole roots, so D is a perfect square.
      let r1: number, r2: number;
      // Roots up to 6: then D is at most 12², a square you know without a calculator.
      do {
        r1 = rng.int(-6, 6);
        r2 = rng.int(-6, 6);
      } while (r1 === r2 || r1 === -r2);
      a = 1;
      b = -(r1 + r2);
      c = r1 * r2;
      kind = "square";
    } else {
      const want = difficulty === 2 ? "irrational" : rng.pick(["irrational", "irrational", "irrational", "zero", "none"] as const);
      for (;;) {
        a = rng.pick(difficulty === 2 ? [1, 1, 2, 3, -1] : [-3, -2, -1, 1, 2, 3]);
        b = rng.int(-9, 9);
        c = rng.nonZeroInt(-9, 9);
        if (want === "zero") {
          // a(x - r)^2 with whole r.
          const r = rng.nonZeroInt(-5, 5);
          b = -2 * a * r;
          c = a * r * r;
        }
        const d = b * b - 4 * a * c;
        if (want === "irrational" && d > 0 && !Number.isInteger(Math.sqrt(d))) break;
        if (want === "zero" && d === 0) break;
        if (want === "none" && d < 0) break;
      }
      kind = want;
    }
    const d = b * b - 4 * a * c;
    // Level 3 sometimes starts in another order (never when there is no solution).
    const rewritten = difficulty === 3 && kind !== "none" && rng.chance(0.5);
    const rw = rewritten ? rewrite(rng, a, b, c) : null;
    const eq = rw ? rw.latex : `${quad(a, b, c)}=0`;
        const steps: Step[] = [{ latex: eq, note: rewritten ? L("Zet eerst alles links, zodat rechts $0$ staat.", "First move everything to the left, so the right side is $0$.") : L(`$a=${a}$, $b=${b}$, $c=${c}$.`, `$a=${a}$, $b=${b}$, $c=${c}$.`) }];
    if (rewritten) steps.push({ latex: `\\ask{${quad(a, b, c)}}=0`, note: L("Breng alles naar links. Let op de tekens.", "Move everything to the left. Watch the signs.") });
    const dNote = L(
      `Bereken eerst $D=${par(b)}^{2}-4\\cdot ${par(a)}\\cdot ${par(c)}$.`,
      `First work out $D=${par(b)}^{2}-4\\cdot ${par(a)}\\cdot ${par(c)}$.`,
    );

    let values: string[];
    let numeric: number[];
    const r = (s: "+" | "-") => (-b + (s === "+" ? 1 : -1) * Math.sqrt(Math.max(d, 0))) / (2 * a);
    if (kind === "square") {
      const s = Math.sqrt(d);
      const x1 = new Fraction(-b + s, 2 * a);
      const x2 = new Fraction(-b - s, 2 * a);
      steps.push(
        { latex: `x=${abcLatex(b, `\\ask{${d}}`, a, "+")}\\lor x=${abcLatex(b, d, a, "-")}`, note: dNote },
        { latex: `x=\\frac{${-b}+\\ask{${s}}}{${2 * a}}\\lor x=\\frac{${-b}-${s}}{${2 * a}}`, note: L(`Neem de wortel: $\\sqrt{${d}}$.`, `Take the square root: $\\sqrt{${d}}$.`) },
        { latex: `x=\\ask{${frac(x1)}}\\lor x=\\frac{${-b}-${s}}{${2 * a}}`, note: L("Reken de eerste breuk uit (met $+$).", "Work out the first fraction (with $+$).") },
        { latex: `x=${frac(x1)}\\lor x=\\ask{${frac(x2)}}`, note: L("Reken de tweede breuk uit (met $-$).", "Work out the second fraction (with $-$).") },
      );
      values = [frac(x1), frac(x2)];
      numeric = [x1.valueOf(), x2.valueOf()];
    } else if (kind === "irrational") {
      const x1 = r("+");
      const x2 = r("-");
      steps.push({
        latex: `x=${abcLatex(b, `\\ask{${d}}`, a, "+")}\\lor x=${abcLatex(b, d, a, "-")}`,
        note: L(
          `${dNote.nl} Met de rekenmachine: $x\\approx ${nlNum(round2(x1))}$ of $x\\approx ${nlNum(round2(x2))}$.`,
          `${dNote.en} With the calculator: $x\\approx ${round2(x1).toFixed(2)}$ or $x\\approx ${round2(x2).toFixed(2)}$.`,
        ),
      });
      values = [abcLatex(b, d, a, "+"), abcLatex(b, d, a, "-")];
      numeric = [x1, x2];
    } else if (kind === "zero") {
      const x1 = new Fraction(-b, 2 * a);
      steps.push(
        { latex: `x=${abcLatex(b, `\\ask{${d}}`, a, "+")}`, note: L(`${dNote.nl} Is $D=0$, dan is $+\\sqrt{0}$ hetzelfde als $-\\sqrt{0}$.`, `${dNote.en} If $D=0$, then $+\\sqrt{0}$ is the same as $-\\sqrt{0}$.`) },
        { latex: `x=\\ask{${frac(x1)}}`, note: L("Er is maar één oplossing.", "There is only one solution.") },
      );
      values = [frac(x1)];
      numeric = [x1.valueOf()];
    } else {
      // No extra step: the last step gets the conclusion as its note.
      const last = steps[steps.length - 1];
      last.note = L(
        `${last.note.nl} ${dNote.nl} Je vindt $D=${d}$: negatief. De wortel van een negatief getal bestaat niet. Dus geen oplossing.`,
        `${last.note.en} ${dNote.en} You find $D=${d}$: negative. The square root of a negative number does not exist. So no solution.`,
      );
      values = [];
      numeric = [];
    }

    // Mistakes: forgetting to divide by 2a, and using +b instead of -b.
    const exact = kind !== "irrational";
    const mistakes: Mistake[] = [];
    if (d >= 0) {
      const s = Math.sqrt(d);
      const cands: Array<[string, number, Loc]> = [
        ["no-divide", -b + s, L(`Deel nog door $2a=${2 * a}$. De hele bovenkant gaat door $${2 * a}$.`, `Still divide by $2a=${2 * a}$. The whole top is divided by $${2 * a}$.`)],
        ["plus-b", (b + s) / (2 * a), L(`Bovenin staat $-b$. Hier is $b=${b}$, dus $-b=${-b}$.`, `The top starts with $-b$. Here $b=${b}$, so $-b=${-b}$.`)],
      ];
      for (const [id, v, explain] of cands) {
        if (numeric.some((x) => Math.abs(round2(x) - round2(v)) < 1e-9)) continue;
        const latex = exact ? frac(id === "no-divide" ? new Fraction(-b + s) : new Fraction(b + s, 2 * a)) : String(round2(v));
        mistakes.push({ id, latex, explain });
      }
    }

    return {
      prompt:
        difficulty === 3
          ? L(
              "Los op met de abc-formule. Rond zo nodig af op $2$ decimalen. Geen oplossing? Kies dan 'Geen oplossing'.",
              "Solve with the quadratic formula. Round to $2$ decimals if needed. No solution? Then choose 'No solution'.",
            )
          : kind === "square"
            ? L("Los op met de abc-formule.", "Solve with the quadratic formula.")
            : L("Los op met de abc-formule. Rond af op $2$ decimalen.", "Solve with the quadratic formula. Round to $2$ decimals."),
      latex: eq,
      // Only the axis: labelled zeros in the hint picture would give the answer away.
      visual: parabolaVisual(a, b, c, ["axis"]),
      answer: exact
        ? { kind: "solutions", variable: "x", values }
        : { kind: "solutions", variable: "x", values, form: "decimal", decimals: 2 },
      calculator: kind === "square" ? "off" : "allowed",
      hints: {
        nudge: rw
          ? rewriteNudge(rw.rhs, L("Dan lees je $a$, $b$ en $c$ af.", "Then read off $a$, $b$ and $c$."))
          : L(
              `$a=${a}$, $b=${b}$, $c=${c}$. Begin met $D=${par(b)}^{2}-4\\cdot ${par(a)}\\cdot ${par(c)}$.`,
              `$a=${a}$, $b=${b}$, $c=${c}$. Start with $D=${par(b)}^{2}-4\\cdot ${par(a)}\\cdot ${par(c)}$.`,
            ),
        rule: { text: ABC_RULE, ruleId: "u4.abc-formula" },
        solution: { steps, solutions: numeric.map((x) => ({ x })) },
      },
      mistakes,
    };
  },
  verify(ex) {
    // Substitute the exact roots back in and count the roots numerically.
    const xs = solutionValues(ex);
    if (!xs || !ex.latex) return false;
    return holdsAt(ex.latex, xs) && countRootsNumerically(ex.latex) === xs.length;
  },
};

// ---------------------------------------------------------------------------
// How many solutions?
// ---------------------------------------------------------------------------

const COUNT_RULE: Loc = L(
  "Hoeveel oplossingen? Kijk naar $D$. $D>0$: twee. $D=0$: één. $D<0$: geen. De parabool snijdt, raakt of mist de $x$-as.",
  "How many solutions? Look at $D$. $D>0$: two. $D=0$: one. $D<0$: none. The parabola crosses, touches or misses the $x$-axis.",
);

const COUNT_OPTIONS = [
  { text: L("Geen oplossing", "No solution") },
  { text: L("Eén oplossing", "One solution") },
  { text: L("Twee oplossingen", "Two solutions") },
];

export const solutionCount: Generator = {
  id: "u4.solution-count",
  skillId: "u4.solution-count",
  title: L("Hoeveel oplossingen?", "How many solutions?"),
  generate(rng, difficulty) {
    const want = rng.pick([0, 1, 2] as const);
    let a: number, b: number, c: number;
    for (;;) {
      a = difficulty === 1 ? 1 : rng.pick([-3, -2, -1, 1, 2, 3, 4]);
      if (want === 1) {
        const r = rng.nonZeroInt(-6, 6);
        b = -2 * a * r;
        c = a * r * r;
      } else {
        b = rng.int(-9, 9);
        c = rng.nonZeroInt(-12, 12);
      }
      const d = b * b - 4 * a * c;
      if ((want === 0 && d < 0) || (want === 1 && d === 0) || (want === 2 && d > 0)) break;
    }
    const rewritten = difficulty === 3;
    const rw = rewritten ? rewrite(rng, a, b, c) : null;
    const q: Quad = { a, b, c, latex: rw ? rw.latex : `${quad(a, b, c)}=0`, rewritten };
    const d = D(q);
    return {
      prompt: L("Hoeveel oplossingen heeft deze vergelijking? Gebruik de discriminant.", "How many solutions does this equation have? Use the discriminant."),
      latex: q.latex,
      answer: { kind: "choice", options: COUNT_OPTIONS, correctIndex: want },
      calculator: "off",
      hints: {
        nudge: rw
          ? rewriteNudge(rw.rhs, L("Bereken dan $D$ en kijk alleen naar het teken.", "Then work out $D$ and only look at its sign."))
          : L(
              `Bereken $D=${par(b)}^{2}-4\\cdot ${par(a)}\\cdot ${par(c)}$. Is dat positief, nul of negatief?`,
              `Work out $D=${par(b)}^{2}-4\\cdot ${par(a)}\\cdot ${par(c)}$. Is it positive, zero or negative?`,
            ),
        rule: { text: COUNT_RULE, ruleId: "u4.solution-count" },
        solution: {
          steps: [
            ...discriminantSteps(q).slice(0, -1),
            {
              latex: `\\ask{${d}}`,
              note:
                d > 0
                  ? L("$D>0$: twee oplossingen.", "$D>0$: two solutions.")
                  : d === 0
                    ? L("$D=0$: één oplossing.", "$D=0$: one solution.")
                    : L("$D<0$: geen oplossing.", "$D<0$: no solution."),
            },
          ],
        },
      },
    };
  },
  verify(ex) {
    // Count the roots numerically (sign changes and touching points), not with D.
    if (ex.answer.kind !== "choice" || !ex.latex) return false;
    return countRootsNumerically(ex.latex) === ex.answer.correctIndex;
  },
};

// ---------------------------------------------------------------------------
// For which p is there exactly one solution?
// ---------------------------------------------------------------------------

export const oneSolution: Generator = {
  id: "u4.one-solution",
  skillId: "u4.solution-count",
  title: L("Precies één oplossing", "Exactly one solution"),
  generate(rng, difficulty) {
    let latex: string;
    const steps: Step[] = [];
    let values: Fraction[];
    let nudge: Loc;
    let visual;
    const mistakes: Mistake[] = [];

    if (difficulty === 1) {
      // The constant term holds p: x² + bx + p = 0, x² + bx = p or x² + bx + k = p.
      const b = 2 * rng.nonZeroInt(-4, 4);
      const form = rng.pick(["plus", "right", "shift", "shift"] as const);
      const C = new Fraction(b * b, 4); // D = b² - 4C = 0
      // k ≠ C, so the answer is never p = 0.
      let k = 0;
      if (form === "shift") {
        do k = rng.int(1, 9);
        while (C.equals(k));
      }
      // In the form x² + bx + C = 0, C is p, -p or k - p.
      const p = form === "plus" ? C : form === "right" ? C.neg() : new Fraction(k).sub(C);
      latex = form === "plus" ? `${poly([1, b, 0])}+p=0` : form === "right" ? `${poly([1, b, 0])}=p` : `${quad(1, b, k)}=p`;
      const cText = form === "plus" ? "p" : form === "right" ? "-p" : `${k}-p`;
      const cLatex = form === "plus" ? "p" : form === "right" ? "(-p)" : `(${k}-p)`;
      const left = form === "right" ? `${poly([1, b, 0])}-p=0` : `${quad(1, b, k)}-p=0`;
      const moved = form === "plus" ? L("", "") : L(`Zet alles links: $${left}$. `, `Move everything left: $${left}$. `);
      steps.push(
        {
          latex: `${b * b}-4\\cdot ${cLatex}=0`,
          note: L(
            `${moved.nl}Precies één oplossing: $D=0$. Hier is $a=1$, $b=${b}$ en $c=${cText}$. En $${par(b)}^{2}=${b * b}$.`,
            `${moved.en}Exactly one solution: $D=0$. Here $a=1$, $b=${b}$ and $c=${cText}$. And $${par(b)}^{2}=${b * b}$.`,
          ),
        },
        {
          latex: `4\\cdot ${cLatex}=\\ask{${b * b}}`,
          note: L(`Balans: tel aan beide kanten $4\\cdot ${cLatex}$ op.`, `Balance: add $4\\cdot ${cLatex}$ on both sides.`),
        },
        { latex: `${cText}=\\ask{${frac(C)}}`, note: L("Deel beide kanten door $4$.", "Divide both sides by $4$.") },
      );
      if (form === "right") {
        steps.push({ latex: `p=\\ask{${frac(p)}}`, note: L("Deel beide kanten door $-1$.", "Divide both sides by $-1$.") });
      } else if (form === "shift") {
        steps.push(
          { latex: `-p=\\ask{${frac(C.sub(k))}}`, note: removeNote(k) },
          { latex: `p=\\ask{${frac(p)}}`, note: L("Deel beide kanten door $-1$.", "Divide both sides by $-1$.") },
        );
      }
      values = [p];
      nudge =
        form === "plus"
          ? L(`Hier is $a=1$, $b=${b}$ en $c=p$. Eén oplossing betekent $D=0$.`, `Here $a=1$, $b=${b}$ and $c=p$. One solution means $D=0$.`)
          : L(
              `Zet eerst $p$ links. Dan is $a=1$, $b=${b}$ en $c=${cText}$. Eén oplossing betekent $D=0$.`,
              `First move $p$ to the left. Then $a=1$, $b=${b}$ and $c=${cText}$. One solution means $D=0$.`,
            );
      visual = parabolaVisual(1, b, form === "shift" ? k : 0, ["zeros"], ["c"]);
      if (!p.equals(0)) {
        // The sign mistake: −p instead of p. Show D for that value, computed from the form.
        const wrong = p.neg();
        const cWrong = form === "plus" ? wrong : form === "right" ? wrong.neg() : new Fraction(k).sub(wrong);
        const dWrong = new Fraction(b * b).sub(cWrong.mul(4));
        mistakes.push({
          id: "minus",
          latex: frac(wrong),
          explain: L(
            `Let op het teken. Hier is $c=${cText}$. Met $p=${frac(wrong)}$ is $D=${frac(dWrong)}$, niet $0$.`,
            `Watch the sign. Here $c=${cText}$. With $p=${frac(wrong)}$, $D=${frac(dWrong)}$, not $0$.`,
          ),
        });
      }
    } else if (difficulty === 2) {
      // ax² + px + c = 0 with 4ac a square  →  p² − 4ac = 0  →  p = ±2√(ac)
      let a: number, c: number, t: number;
      do {
        a = rng.pick([1, 1, 2, 3, 4, 5, 6, 8, 9]);
        // p = ±2t stays at most 12, so p² is a square you know without a calculator.
        t = rng.int(1, 6);
        c = (t * t) / a;
      } while (!Number.isInteger(c) || c > 50);
      if (rng.chance(0.4)) {
        a = -a;
        c = -c;
      }
      const r = 2 * t;
      const lead = `${a === 1 ? "" : a === -1 ? "-" : a}x^{2}+px`;
      const std = `${lead}${c > 0 ? "+" : ""}${c}=0`;
      // Sometimes the number stands on the right: move it to the left first.
      const onRight = rng.chance(0.5);
      latex = onRight ? `${lead}=${-c}` : std;
      const movedD = onRight ? L(`Zet alles links: $${std}$. `, `Move everything left: $${std}$. `) : L("", "");
      steps.push(
        {
          latex: `p^{2}-4\\cdot ${par(a)}\\cdot ${par(c)}=0`,
          note: L(
            `${movedD.nl}Precies één oplossing: $D=0$. Hier is $a=${a}$, $b=p$ en $c=${c}$.`,
            `${movedD.en}Exactly one solution: $D=0$. Here $a=${a}$, $b=p$ and $c=${c}$.`,
          ),
        },
        { latex: `p^{2}=\\ask{${4 * a * c}}`, note: L(`Reken $4\\cdot ${par(a)}\\cdot ${par(c)}$ uit en zet het rechts.`, `Work out $4\\cdot ${par(a)}\\cdot ${par(c)}$ and move it to the right.`) },
        { latex: `p=\\ask{${r}}\\lor p=${-r}`, note: L("Kwadraat is getal: twee antwoorden.", "Square equals number: two answers.") },
      );
      values = [new Fraction(r), new Fraction(-r)];
      nudge = onRight
        ? L(
            `Rechts staat $${-c}$, niet $0$. Zet eerst alles links. Eén oplossing betekent $D=0$, met $b=p$.`,
            `The right side is $${-c}$, not $0$. First move everything to the left. One solution means $D=0$, with $b=p$.`,
          )
        : L(`Eén oplossing: $D=0$. Hier is $b=p$. Dus $p^{2}-4\\cdot ${par(a)}\\cdot ${par(c)}=0$.`, `One solution: $D=0$. Here $b=p$. So $p^{2}-4\\cdot ${par(a)}\\cdot ${par(c)}=0$.`);
      visual = parabolaVisual(a, 0, c, ["zeros"], ["b"]);
      mistakes.push({ id: "only-positive", latex: String(r), explain: L(`Goed, maar er is nog een. Ook $(${-r})^{2}=${r * r}$.`, `Good, but there is another one. Also $(${-r})^{2}=${r * r}$.`) });
    } else {
      // px² + bx + c = 0  →  b² − 4pc = 0  →  p = b²/(4c)
      const b = rng.nonZeroInt(-8, 8);
      const c = rng.nonZeroInt(-6, 6);
      const p = new Fraction(b * b, 4 * c);
      latex = `px^{2}${poly([b, c]).startsWith("-") ? "" : "+"}${poly([b, c])}=0`;
      steps.push(
        { latex: `${par(b)}^{2}-4\\cdot p\\cdot ${par(c)}=0`, note: L("Precies één oplossing: $D=0$. Hier is $a=p$.", "Exactly one solution: $D=0$. Here $a=p$.") },
        { latex: `${b * b}=\\ask{${4 * c}p}`, note: L(`Reken $${par(b)}^{2}$ uit en zet de term met $p$ rechts.`, `Work out $${par(b)}^{2}$ and move the term with $p$ to the right.`) },
        { latex: `p=\\ask{${frac(p)}}`, note: L(`Deel door $${4 * c}$.`, `Divide by $${4 * c}$.`) },
      );
      values = [p];
      nudge = L(`Eén oplossing: $D=0$. Hier is $a=p$, $b=${b}$ en $c=${c}$. Vul in: $b^{2}-4ac=0$.`, `One solution: $D=0$. Here $a=p$, $b=${b}$ and $c=${c}$. Fill in: $b^{2}-4ac=0$.`);
      mistakes.push({ id: "upside-down", latex: frac(p.inverse()), explain: L(`Bij $${4 * c}p=${b * b}$ deel je $${b * b}$ door $${4 * c}$, niet andersom.`, `For $${4 * c}p=${b * b}$ you divide $${b * b}$ by $${4 * c}$, not the other way round.`) });
    }

    const vals = values.map((v) => frac(v));
    return {
      // At level 3, p = 0 would make the equation linear (also one solution): leave that case out.
      prompt:
        difficulty === 3
          ? L(
              "Voor welke $p$ (niet $0$) heeft de vergelijking precies één oplossing?",
              "For which $p$ (not $0$) does the equation have exactly one solution?",
            )
          : L("Voor welke waarde(n) van $p$ heeft de vergelijking precies één oplossing?", "For which value(s) of $p$ does the equation have exactly one solution?"),
      latex,
      visual,
      answer: { kind: "solutions", variable: "p", values: vals },
      calculator: "off",
      hints: {
        nudge,
        rule: { text: COUNT_RULE, ruleId: "u4.solution-count", metaphor: "balance" },
        solution: { steps, solutions: values.map((v) => ({ p: v.valueOf() })) },
      },
      mistakes: mistakes.filter((m) => !vals.includes(m.latex) || m.id === "only-positive"),
    };
  },
  verify(ex) {
    // Put each p into the equation and count the roots in x numerically.
    if (ex.answer.kind !== "solutions" || !ex.latex) return false;
    const ps = ex.answer.values.map(num);
    if (ps.length === 0 || ps.some((p) => p === null)) return false;
    return ps.every((p) => countRootsNumerically(ex.latex!.replace(/p/g, `(${p})`)) === 1);
  },
};

