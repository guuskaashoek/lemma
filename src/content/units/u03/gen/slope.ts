/**
 * Lesson 3 generator: the slope (richtingscoëfficiënt) from two points,
 * with a slope triangle (hellingsdriehoek).
 */
import Fraction from "fraction.js";
import { evaluate, parse } from "@/math/cas";
import type { Mistake } from "@/math/check";
import { frac } from "@/math/latex";
import type { Generator, Loc } from "@/content/types";
import { absL, den, F, intNot, L, minus, pt, propsOf } from "../helpers";
import { toFrac } from "../widgets/model";
import { simpleFraction } from "./graphs";
import { slopeWalkVisual, W } from "./visuals";

export const SLOPE_RULE: Loc = L(
  "Hellingsdriehoek: $a=\\frac{\\text{verschil in }y}{\\text{verschil in }x}$. Neem twee keer dezelfde volgorde: $B$ min $A$.",
  "Slope triangle: $a=\\frac{\\text{change in }y}{\\text{change in }x}$. Use the same order twice: $B$ minus $A$.",
);

/** Mistakes for a slope Δy/Δx, never equal to the answer. */
export function slopeMistakes(dy: Fraction, dx: Fraction): Mistake[] {
  const a = dy.div(dx);
  const out: Mistake[] = [];
  const seen: Fraction[] = [a];
  const add = (id: string, v: Fraction, explain: Loc) => {
    if (seen.some((s) => s.equals(v))) return;
    seen.push(v);
    out.push({ id, latex: frac(v), explain });
  };
  if (!dy.equals(0)) {
    add("upside-down", dx.div(dy), L("Je deelde opzij door omhoog. Het is andersom: verschil in $y$ boven, verschil in $x$ onder.", "You divided sideways by up. It is the other way round: change in $y$ on top, change in $x$ below."));
  }
  add(
    "sign",
    a.neg(),
    a.s < 0
      ? L("Het teken klopt niet. De lijn gaat naar rechts omlaag, dus $a$ is negatief. Neem boven en onder dezelfde volgorde.", "The sign is wrong. The line goes down to the right, so $a$ is negative. Use the same order on top and below.")
      : L("Het teken klopt niet. De lijn gaat naar rechts omhoog, dus $a$ is positief. Neem boven en onder dezelfde volgorde.", "The sign is wrong. The line goes up to the right, so $a$ is positive. Use the same order on top and below."),
  );
  if (!dx.abs().equals(1)) add("no-divide", dy, L(`Je bent vergeten te delen door het verschil in $x$: $${absL(dx)}$.`, `You forgot to divide by the change in $x$: $${absL(dx)}$.`));
  return out;
}

export const slopeTwoPoints: Generator = {
  id: "u3.slope-two-points",
  skillId: "u3.slope",
  title: L("Richtingscoëfficiënt uit twee punten", "Slope from two points"),
  generate(rng, difficulty) {
    let a: Fraction, x1: number, y1: number, dx: number;
    if (difficulty === 1) {
      a = F(rng.int(1, 3));
      dx = rng.int(1, 3);
      x1 = rng.int(0, 4);
      y1 = rng.int(0, 5);
    } else if (difficulty === 2) {
      a = F(intNot(rng, -4, 4, [0]));
      dx = rng.int(1, 4);
      x1 = rng.int(-4, 3);
      y1 = rng.int(-5, 5);
    } else {
      a = simpleFraction(rng);
      dx = den(a) * rng.int(1, 2);
      x1 = rng.int(-4, 2);
      y1 = rng.int(-4, 4);
    }
    let A: [number, number] = [x1, y1];
    let B: [number, number] = [x1 + dx, a.mul(dx).add(y1).valueOf()];
    // Difficulty 3: sometimes B lies to the left of A.
    if (difficulty === 3 && rng.chance()) [A, B] = [B, A];
    const dyF = F(B[1]).sub(A[1]);
    const dxF = F(B[0]).sub(A[0]);

    return {
      prompt: L(
        `Een lijn gaat door $A${pt(A[0], A[1])}$ en $B${pt(B[0], B[1])}$.\nBereken de richtingscoëfficiënt $a$.`,
        `A line goes through $A${pt(A[0], A[1])}$ and $B${pt(B[0], B[1])}$.\nWork out the slope $a$.`,
      ),
      latex: `A${pt(A[0], A[1])},\\quad B${pt(B[0], B[1])}`,
      visual: slopeWalkVisual(A, B, { reveal: false }),
      answer: { kind: "expr", latex: frac(a), form: "fraction" },
      calculator: "off",
      hints: {
        nudge: L(
          `Van $A$ naar $B$: hoeveel ga je opzij? $${minus(B[0], A[0])}$. Hoeveel omhoog of omlaag? $${minus(B[1], A[1])}$.`,
          `From $A$ to $B$: how far sideways? $${minus(B[0], A[0])}$. How far up or down? $${minus(B[1], A[1])}$.`,
        ),
        rule: { text: SLOPE_RULE, ruleId: "u3.slope" },
        solution: {
          steps: [
            {
              latex: `\\frac{${minus(B[1], A[1])}}{${minus(B[0], A[0])}}`,
              note: L("Verschil in $y$ boven, verschil in $x$ onder. Steeds $B$ min $A$.", "Change in $y$ on top, change in $x$ below. Always $B$ minus $A$."),
            },
            {
              latex: `\\frac{\\ask{${frac(dyF)}}}{${frac(dxF)}}`,
              note: L(
                `Boven: $${minus(B[1], A[1])}$. Onder: $${minus(B[0], A[0])}=${frac(dxF)}$.`,
                `On top: $${minus(B[1], A[1])}$. Below: $${minus(B[0], A[0])}=${frac(dxF)}$.`,
              ),
            },
            {
              latex: `\\ask{${frac(a)}}`,
              note: dxF.equals(1)
                ? L("Delen door $1$ verandert niets.", "Dividing by $1$ changes nothing.")
                : L("Deel uit of vereenvoudig de breuk.", "Divide, or simplify the fraction."),
            },
          ],
        },
      },
      mistakes: slopeMistakes(dyF, dxF),
    };
  },
  verify(ex) {
    // Independent check: recompute (yB - yA) / (xB - xA) from the points.
    const p = propsOf(ex, W.slopeWalk);
    if (!p || ex.answer.kind !== "expr") return false;
    const [A, B] = [p.A as [string, string], p.B as [string, string]];
    const a = toFrac(B[1]).sub(toFrac(A[1])).div(toFrac(B[0]).sub(toFrac(A[0])));
    const got = evaluate(parse(ex.answer.latex));
    return got !== null && Math.abs(a.valueOf() - got) < 1e-12;
  },
  isNice(ex) {
    return ex.answer.kind === "expr" && den(new Fraction(evaluate(parse(ex.answer.latex)) ?? 0).simplify(1e-9)) <= 4;
  },
};

/** Exported for the lessons: the steps for a slope from two points. */
export function slopeSteps(A: [number, number], B: [number, number]) {
  const dy = F(B[1]).sub(A[1]);
  const dx = F(B[0]).sub(A[0]);
  return [
    { latex: `\\frac{${minus(B[1], A[1])}}{${minus(B[0], A[0])}}`, note: L("Verschil in $y$ boven, verschil in $x$ onder.", "Change in $y$ on top, change in $x$ below.") },
    { latex: `\\frac{\\ask{${frac(dy)}}}{${frac(dx)}}`, note: L(`Boven: $${minus(B[1], A[1])}$. Onder: $${minus(B[0], A[0])}$.`, `On top: $${minus(B[1], A[1])}$. Below: $${minus(B[0], A[0])}$.`) },
    { latex: `\\ask{${frac(dy.div(dx))}}`, note: L("Deel uit.", "Divide.") },
  ];
}

