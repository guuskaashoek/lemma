/**
 * Lesson 9 generators: Pythagoras, for the long side (schuine zijde) and
 * for a short side (rechthoekszijde).
 */
import { evaluate, parse } from "@/math/cas";
import { roundHalfAwayFromZero, type Mistake } from "@/math/check";
import type { Rng } from "@/math/random";
import type { Difficulty, Generator, GeneratedExercise, Loc, Step } from "@/content/types";
import { L, dec } from "../helpers";

const TRIPLES: Array<[number, number, number]> = [
  [3, 4, 5],
  [6, 8, 10],
  [5, 12, 13],
  [9, 12, 15],
  [8, 15, 17],
  [12, 16, 20],
  [7, 24, 25],
  [15, 20, 25],
  [10, 24, 26],
  [20, 21, 29],
  [12, 9, 15],
  [4, 3, 5],
  [8, 6, 10],
  [12, 5, 13],
  [15, 8, 17],
  [16, 12, 20],
];

const r1 = (v: number) => roundHalfAwayFromZero(v, 1);

/** Two legs (and the hypotenuse when it is whole) for each level. */
function sides(rng: Rng, difficulty: Difficulty, context: boolean): { a: number; b: number; scale: number } {
  if (difficulty === 1) {
    // Small whole sides; sometimes a triple with a whole answer.
    if (rng.chance(0.4)) {
      const [a, b, c] = rng.pick(TRIPLES);
      const k = c <= 15 ? rng.pick([1, 1, 2]) : 1;
      return { a: a * k, b: b * k, scale: 1 };
    }
    return { a: rng.int(2, 12), b: rng.int(2, 12), scale: 1 };
  }
  if (!context) {
    for (;;) {
      const a = rng.int(2, 15);
      const b = rng.int(2, 15);
      if (!Number.isInteger(Math.sqrt(a * a + b * b))) return { a, b, scale: 1 };
    }
  }
  // Level 3: a ladder, lengths in metres with one decimal (stored as tenths).
  // A real ladder stands steep: the height is at least twice the distance.
  for (;;) {
    const a = rng.int(5, 25);
    const b = rng.int(Math.max(2 * a, 20), 80);
    if (!Number.isInteger(Math.sqrt(a * a + b * b))) return { a, b, scale: 10 };
  }
}

const RULE: Loc = L(
  "Pythagoras: in een rechthoekige driehoek is $a^2+b^2=c^2$. Hier is $c$ de schuine zijde, tegenover de rechte hoek.",
  "Pythagoras: in a right triangle $a^2+b^2=c^2$. Here $c$ is the hypotenuse, opposite the right angle.",
);

/** Verification by substituting back: the three sides must satisfy a² + b² = c². */
function satisfiesPythagoras(ex: GeneratedExercise): boolean {
  if (ex.answer.kind !== "expr" || !ex.figure) return false;
  const x = evaluate(parse(ex.answer.latex));
  if (x === null || x <= 0) return false;
  const side = (s?: string) => (s === "x" ? x : s === undefined ? NaN : Number(s));
  const { adjacent, opposite, hypotenuse } = ex.figure.labels;
  const a = side(adjacent);
  const b = side(opposite);
  const c = side(hypotenuse);
  return Math.abs(a * a + b * b - c * c) < 1e-6 * c * c;
}

export const pythagorasLong: Generator = {
  id: "u0.pythagoras-long",
  skillId: "u0.pythagoras-long",
  title: L("Pythagoras: de schuine zijde", "Pythagoras: the hypotenuse"),
  generate(rng, difficulty) {
    const context = difficulty === 3;
    const { a: A, b: B, scale } = sides(rng, difficulty, context);
    const a = A / scale;
    const b = B / scale;
    const sq = (v: number) => dec(v * v);
    const sum = a * a + b * b;
    const exact = `\\sqrt{${dec(sum)}}`;
    const whole = Number.isInteger(Math.sqrt(sum));
    const steps: Step[] = [
      { latex: `\\sqrt{${dec(a)}^{2}+${dec(b)}^{2}}`, note: L("Schuine zijde: kwadrateer, tel op, neem de wortel.", "Hypotenuse: square, add, take the square root.") },
      { latex: `\\sqrt{\\ask{${sq(a)}}+${dec(b)}^{2}}`, note: L(`$${dec(a)}^{2}=${dec(a)}\\cdot ${dec(a)}$.`, `$${dec(a)}^{2}=${dec(a)}\\cdot ${dec(a)}$.`) },
      { latex: `\\sqrt{${sq(a)}+\\ask{${sq(b)}}}`, note: L(`$${dec(b)}^{2}=${dec(b)}\\cdot ${dec(b)}$.`, `$${dec(b)}^{2}=${dec(b)}\\cdot ${dec(b)}$.`) },
      { latex: `\\sqrt{\\ask{${dec(sum)}}}`, note: L("Tel op. Dat is $c^2$.", "Add. That is $c^2$.") },
    ];
    if (whole) steps.push({ latex: `\\ask{${Math.sqrt(sum)}}`, note: L("Neem de wortel.", "Take the square root.") });
    else steps.push({ latex: `${exact}\\approx \\ask{${r1(Math.sqrt(sum))}}`, note: L("Neem de wortel en rond af.", "Take the square root and round."), approx: { decimals: 1 } });

    const mistakes: Mistake[] = [
      { id: "forgot-root", latex: dec(sum), explain: L(`Dat is $c^2$. Neem nog de wortel: $\\sqrt{${dec(sum)}}$.`, `That is $c^2$. Still take the square root: $\\sqrt{${dec(sum)}}$.`) },
      { id: "added-sides", latex: dec(a + b), explain: L("Je telde de zijden op. Bij Pythagoras tel je de kwadraten op, en dan neem je de wortel.", "You added the sides. With Pythagoras you add the squares, then take the square root.") },
    ];
    const unit = context ? "m" : "cm";
    return {
      prompt: context
        ? L(
            `Een ladder staat tegen een muur. De voet van de ladder staat $${dec(a)}$ m van de muur. De ladder raakt de muur op $${dec(b)}$ m hoogte. Hoe lang is de ladder? Rond af op $1$ decimaal.`,
            `A ladder leans against a wall. The foot of the ladder is $${dec(a)}$ m from the wall. The ladder touches the wall at a height of $${dec(b)}$ m. How long is the ladder? Round to $1$ decimal.`,
          )
        : L(
            `Bereken de schuine zijde $x$.${whole ? "" : " Rond af op $1$ decimaal."}`,
            `Work out the hypotenuse $x$.${whole ? "" : " Round to $1$ decimal."}`,
          ),
      // Level 1 shows the set-up as a scaffold.
      latex: difficulty === 1 ? `x^{2}=${dec(a)}^{2}+${dec(b)}^{2}` : undefined,
      figure: { kind: "right-triangle", angleDeg: 35, labels: { adjacent: dec(a), opposite: dec(b), hypotenuse: "x" } },
      visual: !context && a <= 20 && b <= 20 ? { kind: "pythagoras", a, b } : undefined,
      answer: whole ? { kind: "expr", latex: String(Math.sqrt(sum)), form: "any", unit } : { kind: "expr", latex: exact, form: "decimal", decimals: 1, unit },
      calculator: "allowed",
      hints: {
        nudge: context
          ? L(
              `De muur, de grond en de ladder vormen een rechthoekige driehoek. De ladder is de schuine zijde. Reken $${dec(a)}^{2}+${dec(b)}^{2}$.`,
              `The wall, the ground and the ladder make a right triangle. The ladder is the hypotenuse. Work out $${dec(a)}^{2}+${dec(b)}^{2}$.`,
            )
          : L(
              `$x$ ligt tegenover de rechte hoek: dat is de langste zijde. Reken eerst $${dec(a)}^{2}+${dec(b)}^{2}$.`,
              `$x$ is opposite the right angle: that is the longest side. First work out $${dec(a)}^{2}+${dec(b)}^{2}$.`,
            ),
        rule: { text: RULE, ruleId: "u0.pythagoras" },
        solution: { steps },
      },
      mistakes: mistakes.filter((m) => Math.abs(Number(m.latex) - Math.sqrt(sum)) > 0.05),
    };
  },
  verify: satisfiesPythagoras,
};

export const pythagorasShort: Generator = {
  id: "u0.pythagoras-short",
  skillId: "u0.pythagoras-short",
  title: L("Pythagoras: een korte zijde", "Pythagoras: a short side"),
  generate(rng, difficulty) {
    const context = difficulty === 3;
    let a: number, c: number;
    if (difficulty === 1 && rng.chance(0.4)) {
      [a, , c] = rng.pick(TRIPLES);
    } else if (difficulty === 1) {
      c = rng.int(5, 15);
      a = rng.int(2, c - 1);
    } else {
      // c is a bit longer than a; the missing side is not whole. A ladder
      // (level 3) stands steep: at least twice as long as its distance to the wall.
      const scale = context ? 10 : 1;
      for (;;) {
        const A = context ? rng.int(5, 25) : rng.int(2, 15);
        const C = context ? rng.int(Math.max(2 * A + 1, 20), 80) : A + rng.int(1, 10);
        if (!Number.isInteger(Math.sqrt(C * C - A * A))) {
          a = A / scale;
          c = C / scale;
          break;
        }
      }
    }
    const diff = c * c - a * a;
    const whole = Number.isInteger(Math.sqrt(diff)) && Number.isInteger(a) && Number.isInteger(c);
    const exact = `\\sqrt{${dec(diff)}}`;
    const steps: Step[] = [
      { latex: `\\sqrt{${dec(c)}^{2}-${dec(a)}^{2}}`, note: L("Korte zijde: kwadrateer, trek af, neem de wortel.", "Short side: square, subtract, take the square root.") },
      { latex: `\\sqrt{\\ask{${dec(c * c)}}-${dec(a)}^{2}}`, note: L("De schuine zijde in het kwadraat.", "The hypotenuse squared.") },
      { latex: `\\sqrt{${dec(c * c)}-\\ask{${dec(a * a)}}}`, note: L("De andere zijde in het kwadraat.", "The other side squared.") },
      { latex: `\\sqrt{\\ask{${dec(diff)}}}`, note: L("Trek af.", "Subtract.") },
    ];
    if (whole) steps.push({ latex: `\\ask{${Math.sqrt(diff)}}`, note: L("Neem de wortel.", "Take the square root.") });
    else steps.push({ latex: `${exact}\\approx \\ask{${r1(Math.sqrt(diff))}}`, note: L("Neem de wortel en rond af.", "Take the square root and round."), approx: { decimals: 1 } });

    const mistakes: Mistake[] = [
      {
        id: "added",
        latex: String(r1(Math.sqrt(c * c + a * a))),
        explain: L(
          "Je telde de kwadraten op. Je zoekt een korte zijde: trek af. Je antwoord moet kleiner zijn dan de schuine zijde.",
          "You added the squares. You want a short side: subtract. Your answer must be smaller than the hypotenuse.",
        ),
      },
      { id: "forgot-root", latex: dec(diff), explain: L(`Dat is het kwadraat. Neem nog de wortel: $\\sqrt{${dec(diff)}}$.`, `That is the square. Still take the square root: $\\sqrt{${dec(diff)}}$.`) },
    ];
    const unit = context ? "m" : "cm";
    return {
      prompt: context
        ? L(
            `Een ladder van $${dec(c)}$ m staat tegen een muur. De voet van de ladder staat $${dec(a)}$ m van de muur. Hoe hoog komt de ladder? Rond af op $1$ decimaal.`,
            `A ladder of $${dec(c)}$ m leans against a wall. The foot of the ladder is $${dec(a)}$ m from the wall. How high does the ladder reach? Round to $1$ decimal.`,
          )
        : L(`Bereken de zijde $x$.${whole ? "" : " Rond af op $1$ decimaal."}`, `Work out the side $x$.${whole ? "" : " Round to $1$ decimal."}`),
      latex: difficulty === 1 ? `x^{2}=${dec(c)}^{2}-${dec(a)}^{2}` : undefined,
      figure: { kind: "right-triangle", angleDeg: 35, labels: { adjacent: dec(a), opposite: "x", hypotenuse: dec(c) } },
      answer: whole ? { kind: "expr", latex: String(Math.sqrt(diff)), form: "any", unit } : { kind: "expr", latex: exact, form: "decimal", decimals: 1, unit },
      calculator: "allowed",
      hints: {
        nudge: context
          ? L(
              `De ladder is de schuine zijde: $${dec(c)}$. Je zoekt een korte zijde. Reken $${dec(c)}^{2}-${dec(a)}^{2}$.`,
              `The ladder is the hypotenuse: $${dec(c)}$. You want a short side. Work out $${dec(c)}^{2}-${dec(a)}^{2}$.`,
            )
          : L(
              `De schuine zijde is $${dec(c)}$, die ken je al. $x$ is een korte zijde. Dan trek je af: $${dec(c)}^{2}-${dec(a)}^{2}$.`,
              `The hypotenuse is $${dec(c)}$, you already know it. $x$ is a short side. Then you subtract: $${dec(c)}^{2}-${dec(a)}^{2}$.`,
            ),
        rule: { text: RULE, ruleId: "u0.pythagoras" },
        solution: { steps },
      },
      mistakes: mistakes.filter((m) => Math.abs(Number(m.latex) - Math.sqrt(diff)) > 0.05),
    };
  },
  verify: satisfiesPythagoras,
};
