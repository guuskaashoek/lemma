/**
 * Lesson 6 generator: the intersection of two lines. Difficulty 1 asks
 * only for x (with targeted mistakes); 2 and 3 ask for the whole point.
 */
import type Fraction from "fraction.js";
import { evaluate, parse } from "@/math/cas";
import type { Mistake } from "@/math/check";
import { frac, sum } from "@/math/latex";
import type { Generator, Loc, Step } from "@/content/types";
import { F, intNot, L, lin } from "../helpers";
import { equalSidesSteps, equationsHold, intersectionSteps } from "./solve";
import { meetVisual } from "./visuals";

export const MEET_RULE: Loc = L(
  "Snijpunt van twee lijnen: daar is $y$ even groot. Zet de formules gelijk, los $x$ op met de balans, en vul $x$ in voor $y$.",
  "Intersection of two lines: there $y$ is the same. Set the formulas equal, solve for $x$ with the balance, and put $x$ back in for $y$.",
);

export const intersection: Generator = {
  id: "u3.intersection",
  skillId: "u3.intersection",
  title: L("Snijpunt van twee lijnen", "Intersection of two lines"),
  generate(rng, difficulty) {
    let a1: Fraction, a2: Fraction, x0: Fraction, y0: Fraction;
    if (difficulty === 1) {
      a1 = F(rng.int(2, 5));
      // a2 < a1, so the x-terms stay on the left (no turning around yet).
      a2 = F(rng.int(-3, Math.min(3, a1.valueOf() - 1)));
      x0 = F(rng.int(1, 5));
      y0 = F(rng.int(0, 9));
    } else if (difficulty === 2) {
      a1 = F(intNot(rng, -4, 4, [0]));
      a2 = F(intNot(rng, -4, 4, [a1.valueOf()]));
      x0 = F(rng.int(-4, 5));
      y0 = F(rng.int(-6, 8));
    } else {
      a1 = F(intNot(rng, -5, 5, [0]));
      a2 = F(intNot(rng, -5, 5, [a1.valueOf()]));
      x0 = F(rng.nonZeroInt(-6, 6));
      y0 = F(rng.int(-9, 9));
    }
    const b1 = y0.sub(a1.mul(x0));
    const b2 = y0.sub(a2.mul(x0));
    const f1 = lin(a1, b1);
    // Difficulty 3: the second line may be written start-first, like y = 6 - 2x.
    const f2 =
      difficulty === 3 && !b2.equals(0) && rng.chance()
        ? sum([
            [b2, ""],
            [a2, "x"],
          ])
        : lin(a2, b2);
    const both = `y=${f1},\\quad y=${f2}`;
    const visual = meetVisual(
      [
        { a: a1, b: b1 },
        { a: a2, b: b2 },
      ],
      x0.equals(0) ? 3 : 0,
    );
    const rule = { text: MEET_RULE, ruleId: "u3.intersection", metaphor: "balance" as const };

    if (difficulty === 1) {
      const k = a1.sub(a2);
      const steps: Step[] = [
        { latex: `${f1}=${f2}`, note: L("Op het snijpunt is $y$ even groot: zet de formules gelijk.", "At the intersection $y$ is the same: set the formulas equal.") },
        ...equalSidesSteps(a1, b1, a2, b2, (s) => s),
      ];
      const mistakes: Mistake[] = [];
      const seen = [x0];
      const add = (id: string, v: Fraction, explain: Loc) => {
        if (seen.some((s) => s.equals(v))) return;
        seen.push(v);
        mistakes.push({ id, latex: frac(v), explain });
      };
      add(
        "sign-number",
        b2.add(b1).div(k),
        b1.s < 0
          ? L(`Let op het teken: $${frac(b1)}$ weghalen doe je door aan beide kanten $${frac(b1.abs())}$ op te tellen.`, `Watch the sign: to remove $${frac(b1)}$, add $${frac(b1.abs())}$ on both sides.`)
          : L(`Let op het teken: $+${frac(b1)}$ weghalen doe je door aan beide kanten $${frac(b1)}$ af te trekken.`, `Watch the sign: to remove $+${frac(b1)}$, subtract $${frac(b1)}$ on both sides.`),
      );
      if (!a2.equals(0) && !a1.add(a2).equals(0)) {
        const ax = lin(a2.abs(), 0);
        add(
          "sign-x",
          b2.sub(b1).div(a1.add(a2)),
          a2.s < 0
            ? L(`Let op het teken bij de $x$: rechts staat $-${ax}$. Die haal je weg door aan beide kanten $${ax}$ op te tellen.`, `Watch the sign of the $x$-term: on the right there is $-${ax}$. Remove it by adding $${ax}$ on both sides.`)
            : L(`Let op het teken bij de $x$: rechts staat $+${ax}$. Die haal je weg door aan beide kanten $${ax}$ af te trekken.`, `Watch the sign of the $x$-term: on the right there is $+${ax}$. Remove it by subtracting $${ax}$ on both sides.`),
        );
      }
      add("gave-y", y0, L(`Dat is de $y$ van het snijpunt. De vraag is de $x$.`, `That is the $y$ of the intersection. The question asks for $x$.`));
      return {
        prompt: L(
          `De lijnen $y=${f1}$ en $y=${f2}$ snijden elkaar.\nBereken de $x$ van het snijpunt.`,
          `The lines $y=${f1}$ and $y=${f2}$ intersect.\nWork out the $x$ of the intersection.`,
        ),
        latex: both,
        visual,
        answer: { kind: "solutions", variable: "x", values: [frac(x0)] },
        calculator: "off",
        hints: {
          nudge: L(`Zet ze gelijk: $${f1}=${f2}$. Los dit op met de balans.`, `Set them equal: $${f1}=${f2}$. Solve it with the balance.`),
          rule,
          solution: { steps, solutions: [{ x: x0.valueOf() }] },
        },
        mistakes,
      };
    }

    return {
      prompt: L(
        `Bereken het snijpunt van de lijnen $y=${f1}$ en $y=${f2}$.`,
        `Work out the intersection of the lines $y=${f1}$ and $y=${f2}$.`,
      ),
      latex: both,
      visual,
      answer: {
        kind: "multi",
        parts: [
          { label: "x=", answer: { latex: frac(x0), form: "fraction" } },
          { label: "y=", answer: { latex: frac(y0), form: "fraction" } },
        ],
      },
      calculator: "off",
      hints: {
        nudge: L(
          `Zet ze gelijk: $${f1}=${f2}$. Los $x$ op. Vul $x$ daarna in bij $y=${f1}$.`,
          `Set them equal: $${f1}=${f2}$. Solve for $x$. Then put $x$ into $y=${f1}$.`,
        ),
        rule,
        solution: { steps: intersectionSteps(a1, b1, a2, b2, f1, f2, x0, y0), solutions: [{ x: x0.valueOf(), y: y0.valueOf() }] },
      },
    };
  },
  verify(ex) {
    // Independent check: the point must lie on both lines.
    if (!ex.latex) return false;
    const eqs = ex.latex.split(",\\quad ");
    if (ex.answer.kind === "multi") {
      const [x, y] = ex.answer.parts.map((p) => evaluate(parse(p.answer.latex)));
      return x !== null && y !== null && equationsHold(eqs, { x, y });
    }
    if (ex.answer.kind !== "solutions") return false;
    const x = evaluate(parse(ex.answer.values[0]));
    if (x === null) return false;
    const ys = eqs.map((eq) => evaluate(parse(eq.replace(/^y=/, "")), { x }));
    return ys[0] !== null && ys[1] !== null && Math.abs(ys[0] - ys[1]) < 1e-9;
  },
};
