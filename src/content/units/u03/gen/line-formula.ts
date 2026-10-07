/**
 * Lesson 4 generators: work out b from a point, and the whole formula
 * y = ax + b from two points.
 */
import Fraction from "fraction.js";
import { evaluate, parse } from "@/math/cas";
import type { Mistake } from "@/math/check";
import { frac, paren, term } from "@/math/latex";
import type { Generator, Loc, Step } from "@/content/types";
import { absL, den, F, intNot, L, minus, pt, propsOf, times, type Num } from "../helpers";
import { toFrac, toNum } from "../widgets/model";
import { simpleFraction } from "./graphs";
import { SLOPE_RULE } from "./slope";
import { lineLabVisual, slopeWalkVisual, W } from "./visuals";

const FIND_B_RULE: Loc = L(
  "$b$ berekenen: vul het punt in $y=ax+b$ in. Dan los je $b$ op met de balans.",
  "Finding $b$: put the point into $y=ax+b$. Then solve for $b$ with the balance.",
);

/** The balance step from `y = p + b` to `b = y - p`, in words. */
function balanceNote(p: Fraction): Loc {
  if (p.equals(0)) return L("Er komt $0$ bij. Dus $b$ is meteen de $y$ van het punt.", "Nothing is added. So $b$ is just the $y$ of the point.");
  return p.s < 0
    ? L(`Balans: tel links en rechts $${absL(p)}$ op.`, `Balance: add $${absL(p)}$ on both sides.`)
    : L(`Balans: haal links en rechts $${frac(p)}$ weg.`, `Balance: subtract $${frac(p)}$ on both sides.`);
}

/** Steps for b when y = ax + b goes through (px, py). */
export function findBSteps(a: Num, px: Num, py: Num): Step[] {
  const prod = F(a).mul(px);
  const b = F(py).sub(prod);
  return [
    { latex: `${frac(py)}=${times(a, px, "hl")}+b`, note: L(`Vul het punt in: $x=${frac(px)}$ en $y=${frac(py)}$.`, `Put in the point: $x=${frac(px)}$ and $y=${frac(py)}$.`) },
    { latex: `${frac(py)}=\\ask{${frac(prod)}}+b`, note: L("Reken het keer-stuk uit.", "Work out the multiplication.") },
    { latex: `${minus(py, prod)}=b`, note: balanceNote(prod) },
    { latex: `b=\\ask{${frac(b)}}`, note: L("Reken uit. Klaar!", "Work it out. Done!") },
  ];
}

/** Steps for a and b of the line through A and B, written with `\land`. */
export function twoPointSteps(A: [Num, Num], B: [Num, Num]): Step[] {
  const a = F(B[1]).sub(A[1]).div(F(B[0]).sub(A[0]));
  const prod = a.mul(A[0]);
  const b = F(A[1]).sub(prod);
  const triangle = `\\frac{${minus(B[1], A[1])}}{${minus(B[0], A[0])}}`;
  const fillA = `${frac(A[1])}=a\\cdot ${paren(A[0])}+b`;
  return [
    {
      latex: `a=${triangle}\\land ${fillA}`,
      note: L(
        "Twee dingen tegelijk ($\\land$ betekent **en**): $a$ met de hellingsdriehoek, en punt $A$ ingevuld in $y=ax+b$.",
        "Two things at once ($\\land$ means **and**): $a$ from the slope triangle, and point $A$ put into $y=ax+b$.",
      ),
    },
    { latex: `a=\\ask{${frac(a)}}\\land ${fillA}`, note: L("Reken eerst $a$ uit.", "First work out $a$.") },
    { latex: `a=${frac(a)}\\land ${frac(A[1])}=\\hl{${paren(a)}}\\cdot ${paren(A[0])}+b`, note: L("Zet $a$ in de formule met punt $A$.", "Put $a$ into the formula with point $A$.") },
    { latex: `a=${frac(a)}\\land ${frac(A[1])}=\\ask{${frac(prod)}}+b`, note: L("Reken het keer-stuk uit.", "Work out the multiplication.") },
    { latex: `a=${frac(a)}\\land b=\\ask{${frac(b)}}`, note: balanceNote(prod) },
  ];
}

export const findB: Generator = {
  id: "u3.find-b",
  skillId: "u3.find-b",
  title: L("Het startgetal $b$ berekenen", "Working out the start value $b$"),
  generate(rng, difficulty) {
    let a: Fraction, px: Fraction, b: Fraction;
    if (difficulty === 1) {
      a = F(rng.int(2, 5));
      px = F(rng.int(1, 5));
      b = F(rng.int(1, 9));
    } else if (difficulty === 2) {
      a = F(intNot(rng, -5, 5, [0]));
      px = F(rng.nonZeroInt(-4, 4));
      b = F(rng.int(-9, 9));
    } else {
      a = simpleFraction(rng);
      px = F(den(a) * rng.nonZeroInt(-2, 2));
      b = F(rng.int(-9, 9));
    }
    const prod = a.mul(px);
    const py = prod.add(b);
    const form = `y=${term(a, "x")}+b`;
    const P = pt(px, py);

    const mistakes: Mistake[] = [];
    const seen: Fraction[] = [b];
    const add = (id: string, v: Fraction, explain: Loc) => {
      if (seen.some((s) => s.equals(v))) return;
      seen.push(v);
      mistakes.push({ id, latex: frac(v), explain });
    };
    add("sign", py.add(prod), L(`Bij $${frac(py)}=${frac(prod)}+b$ moet $${frac(prod)}$ naar de andere kant. Dan wordt het $${minus(py, prod)}$, niet plus.`, `In $${frac(py)}=${frac(prod)}+b$ the $${frac(prod)}$ moves to the other side. That makes it $${minus(py, prod)}$, not plus.`));
    if (!px.equals(1)) add("forgot-x", py.sub(a), L(`Je vergat keer $x$. Reken eerst $${times(a, px)}$ uit.`, `You forgot times $x$. First work out $${times(a, px)}$.`));
    if (!py.equals(0)) add("took-y", py, L(`$${frac(py)}$ is de $y$ van het punt, niet $b$. Vul het punt in en los $b$ op.`, `$${frac(py)}$ is the $y$ of the point, not $b$. Put the point in and solve for $b$.`));

    const steps = findBSteps(a, px, py);

    return {
      prompt: L(
        `De lijn $${form}$ gaat door het punt $P${P}$.\nBereken $b$.`,
        `The line $${form}$ goes through the point $P${P}$.\nWork out $b$.`,
      ),
      latex: `${form},\\quad P${P}`,
      visual: lineLabVisual(a, b, { edit: "b", start: { a, b: 0 }, point: [px, py] }),
      answer: { kind: "solutions", variable: "b", values: [frac(b)], form: "fraction" },
      calculator: "off",
      hints: {
        nudge: L(
          `Zet $x=${frac(px)}$ en $y=${frac(py)}$ in de formule: $${frac(py)}=${times(a, px)}+b$. Wat is $b$?`,
          `Put $x=${frac(px)}$ and $y=${frac(py)}$ into the formula: $${frac(py)}=${times(a, px)}+b$. What is $b$?`,
        ),
        rule: { text: FIND_B_RULE, ruleId: "u3.find-b", metaphor: "balance" },
        solution: { steps, solutions: [{ b: b.valueOf() }] },
      },
      mistakes,
    };
  },
  verify(ex) {
    // Independent check: with the answer for b, the line must pass through the point.
    const p = propsOf(ex, W.lineLab);
    if (!p || ex.answer.kind !== "solutions") return false;
    const [x, y] = (p.target as { point: [number, number] }).point;
    const a = toNum(p.a);
    const b = evaluate(parse(ex.answer.values[0]));
    return b !== null && Math.abs(a * x + b - y) < 1e-9;
  },
  isNice(ex) {
    return ex.answer.kind === "solutions" && /^-?\d+$/.test(ex.answer.values[0]);
  },
};

export const lineTwoPoints: Generator = {
  id: "u3.line-two-points",
  skillId: "u3.line-two-points",
  title: L("Formule bij twee punten", "Formula through two points"),
  generate(rng, difficulty) {
    let a: Fraction, b: Fraction, xA: Fraction, dx: Fraction;
    if (difficulty === 1) {
      a = F(intNot(rng, -4, 4, [0]));
      b = F(rng.int(-6, 6));
      xA = F(0);
      dx = F(rng.int(1, 3));
    } else if (difficulty === 2) {
      a = F(intNot(rng, -4, 4, [0]));
      b = F(rng.int(-8, 8));
      xA = F(rng.int(1, 4));
      dx = F(rng.int(1, 3));
    } else {
      a = simpleFraction(rng);
      b = F(rng.int(-6, 6));
      xA = F(den(a) * rng.nonZeroInt(-2, 2));
      dx = F(den(a) * rng.int(1, 2));
    }
    const yAt = (x: Fraction) => a.mul(x).add(b);
    let A: [Fraction, Fraction] = [xA, yAt(xA)];
    let B: [Fraction, Fraction] = [xA.add(dx), yAt(xA.add(dx))];
    if (difficulty === 3 && rng.chance()) [A, B] = [B, A];
    const triangle = `\\frac{${minus(B[1], A[1])}}{${minus(B[0], A[0])}}`;
    const steps = twoPointSteps(A, B);

    return {
      prompt: L(
        `Een lijn gaat door $A${pt(A[0], A[1])}$ en $B${pt(B[0], B[1])}$.\nDe formule is $y=ax+b$. Bereken $a$ en $b$.`,
        `A line goes through $A${pt(A[0], A[1])}$ and $B${pt(B[0], B[1])}$.\nThe formula is $y=ax+b$. Work out $a$ and $b$.`,
      ),
      latex: `A${pt(A[0], A[1])},\\quad B${pt(B[0], B[1])}`,
      visual: slopeWalkVisual(A, B, { intercept: true, reveal: false }),
      answer: {
        kind: "multi",
        parts: [
          { label: "a=", answer: { latex: frac(a), form: "fraction" } },
          { label: "b=", answer: { latex: frac(b), form: "fraction" } },
        ],
      },
      calculator: "off",
      hints: {
        nudge: A[0].equals(0)
          ? L(
              `$A$ ligt op de $y$-as, dus $b=${frac(A[1])}$. Voor $a$: hoeveel ga je omhoog of omlaag van $A$ naar $B$, en hoeveel opzij?`,
              `$A$ lies on the $y$-axis, so $b=${frac(A[1])}$. For $a$: how far up or down from $A$ to $B$, and how far sideways?`,
            )
          : L(
              `Eerst $a$: $${triangle}$. Vul daarna $A$ in: $${frac(A[1])}=a\\cdot ${paren(A[0])}+b$.`,
              `First $a$: $${triangle}$. Then put in $A$: $${frac(A[1])}=a\\cdot ${paren(A[0])}+b$.`,
            ),
        rule: { text: L(`${SLOPE_RULE.nl} Daarna: ${FIND_B_RULE.nl}`, `${SLOPE_RULE.en} Then: ${FIND_B_RULE.en}`), ruleId: "u3.find-b" },
        solution: { steps, solutions: [{ a: a.valueOf(), b: b.valueOf() }] },
      },
    };
  },
  verify(ex) {
    // Independent check: both points must satisfy y = ax + b with the answers.
    const p = propsOf(ex, W.slopeWalk);
    if (!p || ex.answer.kind !== "multi") return false;
    const [a, b] = ex.answer.parts.map((q) => evaluate(parse(q.answer.latex)));
    if (a === null || b === null) return false;
    return [p.A, p.B].every((P) => {
      const [x, y] = (P as [string, string]).map((v) => toFrac(v).valueOf());
      return Math.abs(a * x + b - y) < 1e-9;
    });
  },
};
