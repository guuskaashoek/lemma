/**
 * Lesson 5 generator: the intersection with the x-axis (y = 0).
 */
import Fraction from "fraction.js";
import { evaluate, parse } from "@/math/cas";
import type { Mistake } from "@/math/check";
import { frac, sum, term } from "@/math/latex";
import type { Generator, Loc, Step } from "@/content/types";
import { den, F, intNot, L, lin } from "../helpers";
import { meetVisual } from "./visuals";
import { equationsHold, removeNote, rowLatex } from "./solve";

export const X_AXIS_RULE: Loc = L(
  "Snijpunt met de $x$-as: daar is $y=0$. Vul $y=0$ in en los $x$ op. Snijpunt met de $y$-as: daar is $x=0$.",
  "Intersection with the $x$-axis: there $y=0$. Put in $y=0$ and solve for $x$. Intersection with the $y$-axis: there $x=0$.",
);

/** Steps for the x-intercept of y = ax + b (`shown` is the right-hand side as written). */
export function xInterceptSteps(a: Fraction, b: Fraction, shown = lin(a, b)): Step[] {
  const steps: Step[] = [
    { latex: `${shown}=\\hl{0}`, note: L("Op de $x$-as is $y=0$. Zet de formule gelijk aan $0$.", "On the $x$-axis $y=0$. Set the formula equal to $0$.") },
    { latex: `${term(a, "x")}=\\ask{${frac(b.neg())}}`, note: removeNote(b) },
  ];
  if (!a.equals(1)) {
    steps.push({ latex: `x=\\ask{${frac(b.neg().div(a))}}`, note: L(`Balans: deel links en rechts door $${frac(a)}$.`, `Balance: divide both sides by $${frac(a)}$.`) });
  }
  return steps;
}

export const xIntercept: Generator = {
  id: "u3.x-intercept",
  skillId: "u3.x-intercept",
  title: L("Snijpunt met de $x$-as", "Intersection with the $x$-axis"),
  generate(rng, difficulty) {
    // Standard form p x + q y = c only at difficulty 3, half of the time.
    if (difficulty === 3 && rng.chance()) {
      const p = F(rng.int(2, 6));
      const q = F(intNot(rng, -5, 5, [0]));
      let c = F(rng.nonZeroInt(-12, 12));
      if (den(c.div(p)) === 1 && rng.chance()) c = c.add(1).equals(0) ? c.add(2) : c.add(1);
      const x0 = c.div(p);
      const eq = rowLatex(p, q, c);
      const yInt = c.div(q);
      const mistakes: Mistake[] = [];
      const seen = [x0];
      const add = (id: string, v: Fraction, explain: Loc) => {
        if (seen.some((s) => s.equals(v))) return;
        seen.push(v);
        mistakes.push({ id, latex: frac(v), explain });
      };
      add("y-axis", yInt, L(`Dat is het snijpunt met de $y$-as: daar is $x=0$. Op de $x$-as is juist $y=0$.`, `That is the intersection with the $y$-axis: there $x=0$. On the $x$-axis it is $y=0$.`));
      add("upside-down", p.div(c), L(`Je deelde $${frac(p)}$ door $${frac(c)}$. Het is andersom: $${frac(c)}$ gedeeld door $${frac(p)}$.`, `You divided $${frac(p)}$ by $${frac(c)}$. It is the other way round: $${frac(c)}$ divided by $${frac(p)}$.`));
      const steps: Step[] = [
        { latex: `${term(p, "x")}${q.s < 0 ? "-" : "+"}${frac(q.abs())}\\cdot\\hl{0}=${frac(c)}`, note: L("Op de $x$-as is $y=0$. Vul dat in.", "On the $x$-axis $y=0$. Put that in.") },
        { latex: `${term(p, "x")}=\\ask{${frac(c)}}`, note: L(`$${frac(q.abs())}\\cdot 0=0$, dus die valt weg.`, `$${frac(q.abs())}\\cdot 0=0$, so it drops out.`) },
        { latex: `x=\\ask{${frac(x0)}}`, note: L(`Balans: deel links en rechts door $${frac(p)}$.`, `Balance: divide both sides by $${frac(p)}$.`) },
      ];
      return {
        prompt: L(
          `Bereken het snijpunt van de lijn $${eq}$ met de $x$-as.\nGeef de $x$ van dat punt.`,
          `Work out where the line $${eq}$ crosses the $x$-axis.\nGive the $x$ of that point.`,
        ),
        latex: eq,
        visual: meetVisual([{ a: p.neg().div(q), b: c.div(q) }], 0, new Fraction(1, den(x0))),
        answer: { kind: "solutions", variable: "x", values: [frac(x0)], form: "fraction" },
        calculator: "off",
        hints: {
          nudge: L(`Op de $x$-as is $y=0$. Wat blijft er over van $${eq}$ als je $y=0$ invult?`, `On the $x$-axis $y=0$. What is left of $${eq}$ when you put in $y=0$?`),
          rule: { text: X_AXIS_RULE, ruleId: "u3.axis-intercepts", metaphor: "balance" },
          solution: { steps, solutions: [{ x: x0.valueOf() }] },
        },
        mistakes,
      };
    }

    let a: Fraction, b: Fraction;
    if (difficulty === 1) {
      a = F(rng.int(2, 5));
      b = a.mul(-rng.int(1, 6));
    } else if (difficulty === 2) {
      a = F(intNot(rng, -5, 5, [0]));
      b = a.mul(-rng.nonZeroInt(-6, 6));
    } else {
      a = F(intNot(rng, -6, 6, [0, 1, -1]));
      b = F(rng.nonZeroInt(-12, 12));
      if (den(b.div(a)) === 1) b = b.add(b.s < 0 ? -1 : 1);
    }
    const x0 = b.neg().div(a);
    const f = lin(a, b);
    // Difficulty 2: sometimes written start-first, like y = 6 - 2x.
    const shown =
      difficulty >= 2 && rng.chance(0.4)
        ? sum([
            [b, ""],
            [a, "x"],
          ])
        : f;
    const mistakes: Mistake[] = [];
    const seen = [x0];
    const add = (id: string, v: Fraction, explain: Loc) => {
      if (seen.some((s) => s.equals(v))) return;
      seen.push(v);
      mistakes.push({ id, latex: frac(v), explain });
    };
    add("sign", x0.neg(), L(`Let op het teken. $${frac(b)}$ naar de andere kant maakt $${frac(b.neg())}$.`, `Watch the sign. Moving $${frac(b)}$ to the other side makes $${frac(b.neg())}$.`));
    add("y-axis", b, L(`$${frac(b)}$ is het snijpunt met de $y$-as (daar is $x=0$). Op de $x$-as is juist $y=0$.`, `$${frac(b)}$ is the intersection with the $y$-axis (there $x=0$). On the $x$-axis it is $y=0$.`));
    add("upside-down", a.div(b.neg()), L(`Je deelde $${frac(a)}$ door $${frac(b.neg())}$. Het is andersom.`, `You divided $${frac(a)}$ by $${frac(b.neg())}$. It is the other way round.`));

    const steps = xInterceptSteps(a, b, shown);

    return {
      prompt: L(
        `Bereken het snijpunt van $y=${shown}$ met de $x$-as.\nGeef de $x$ van dat punt.`,
        `Work out where $y=${shown}$ crosses the $x$-axis.\nGive the $x$ of that point.`,
      ),
      latex: `y=${shown}`,
      visual: meetVisual([{ a, b }], 0, new Fraction(1, den(x0))),
      answer: { kind: "solutions", variable: "x", values: [frac(x0)], form: "fraction" },
      calculator: "off",
      hints: {
        nudge: L(`Op de $x$-as is $y=0$. Los dus op: $${shown}=0$.`, `On the $x$-axis $y=0$. So solve: $${shown}=0$.`),
        rule: { text: X_AXIS_RULE, ruleId: "u3.axis-intercepts", metaphor: "balance" },
        solution: { steps, solutions: [{ x: x0.valueOf() }] },
      },
      mistakes,
    };
  },
  verify(ex) {
    // Independent check: (x, 0) must satisfy the equation of the line.
    if (ex.answer.kind !== "solutions" || !ex.latex) return false;
    const x = evaluate(parse(ex.answer.values[0]));
    return x !== null && equationsHold([ex.latex], { x, y: 0 });
  },
  isNice(ex) {
    return ex.answer.kind === "solutions" && den(new Fraction(evaluate(parse(ex.answer.values[0])) ?? 0).simplify(1e-9)) <= 6;
  },
};
