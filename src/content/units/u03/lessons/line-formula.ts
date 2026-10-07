/**
 * Lesson 4: writing the formula of a line. First b from a point (shift the
 * line until it hits the point), then the whole formula from two points.
 */
import type { Lesson } from "@/content/types";
import { L } from "../helpers";
import { findBSteps, twoPointSteps } from "../gen/line-formula";
import { lineLabVisual, slopeWalkVisual } from "../gen/visuals";

export const lineFormulaLesson: Lesson = {
  id: "u3.line-formula",
  title: L("De formule van een lijn opstellen", "Writing the formula of a line"),
  goal: L(
    "Je stelt $y=ax+b$ op als je een punt en $a$ weet, of twee punten.",
    "You write $y=ax+b$ when you know a point and $a$, or two points.",
  ),
  minutes: 9,
  calculator: "off",
  calculatorOffReason: L("De rekenmachine staat uit. Je rekent met kleine getallen met de hand.", "The calculator is off. You work with small numbers by hand."),
  info: {
    what: L(
      "De formule $y=ax+b$ vinden uit punten waar de lijn door gaat.",
      "Finding the formula $y=ax+b$ from points the line goes through.",
    ),
    why: L(
      "Uit twee metingen maak je een formule. Daarmee voorspel je alles daartussen en daarna.",
      "From two measurements you make a formula. With it you predict everything in between and after.",
    ),
    later: L(
      "Een AI-model uit data halen is hetzelfde idee: zoek $a$ en $b$ die bij de punten passen. Met heel veel punten heet dat lineaire regressie.",
      "Getting an AI model from data is the same idea: find $a$ and $b$ that fit the points. With lots of points it is called linear regression.",
    ),
  },
  screens: [
    {
      kind: "explain",
      title: L("Wat weet je al?", "What do you know?"),
      body: L(
        "Je weet $a$: de stap.\nJe weet één punt waar de lijn door gaat.\nAlleen $b$ ontbreekt nog.",
        "You know $a$: the step.\nYou know one point the line goes through.\nOnly $b$ is still missing.",
      ),
    },
    {
      kind: "visual",
      title: L("Schuif de lijn", "Move the line"),
      body: L(
        "De lijn $y=2x+b$ moet door $(3,\\ 10)$.\nMet $b$ schuif je de lijn omhoog of omlaag. De stap $a=2$ blijft hetzelfde.",
        "The line $y=2x+b$ must go through $(3,\\ 10)$.\nWith $b$ you move the line up or down. The step $a=2$ stays the same.",
      ),
      visual: lineLabVisual(2, 4, { edit: "b", start: { a: 2, b: 0 }, point: [3, 10] }),
      task: L("Schuif tot de lijn door het rondje gaat. Welke $b$ is het?", "Move until the line goes through the circle. Which $b$ is it?"),
    },
    {
      kind: "explain",
      title: L("Rekenen gaat sneller", "Calculating is faster"),
      body: L(
        "Het punt ligt op de lijn. Dus de formule klopt voor dat punt.\nVul $x=3$ en $y=10$ in: $10=2\\cdot 3+b$.\nLos $b$ op met de balans.",
        "The point is on the line. So the formula is true for that point.\nPut in $x=3$ and $y=10$: $10=2\\cdot 3+b$.\nSolve for $b$ with the balance.",
      ),
      metaphor: "balance",
    },
    {
      kind: "example",
      title: L("Voorbeeld: b berekenen", "Example: working out b"),
      problem: L("De lijn $y=2x+b$ gaat door $(3,\\ 10)$. Bereken $b$.", "The line $y=2x+b$ goes through $(3,\\ 10)$. Work out $b$."),
      solution: { steps: findBSteps(2, 3, 10), solutions: [{ b: 4 }] },
    },
    {
      kind: "explain",
      title: L("Twee punten", "Two points"),
      body: L(
        "Weet je twee punten? Dan doe je twee dingen:\n1. $a$ met de hellingsdriehoek.\n2. $b$ door één punt in te vullen.",
        "Do you know two points? Then you do two things:\n1. $a$ with the slope triangle.\n2. $b$ by putting in one point.",
      ),
    },
    {
      kind: "visual",
      title: L("Twee punten, één lijn", "Two points, one line"),
      body: L(
        "Eerst de hellingsdriehoek voor $a$.\nDaarna loop je over de lijn naar de $y$-as. Daar is $b$.",
        "First the slope triangle for $a$.\nThen you walk along the line to the $y$-axis. There is $b$.",
      ),
      visual: slopeWalkVisual([1, 1], [3, 5], { intercept: true }),
      task: L("Klik door tot je $b$ ziet.", "Click through until you see $b$."),
    },
    {
      kind: "example",
      title: L("Voorbeeld: twee punten", "Example: two points"),
      problem: L(
        "Een lijn gaat door $A(1,\\ 1)$ en $B(3,\\ 5)$. Bereken $a$ en $b$ van $y=ax+b$.",
        "A line goes through $A(1,\\ 1)$ and $B(3,\\ 5)$. Work out $a$ and $b$ of $y=ax+b$.",
      ),
      visual: slopeWalkVisual([1, 1], [3, 5], { intercept: true }),
      solution: { steps: twoPointSteps([1, 1], [3, 5]), solutions: [{ a: 2, b: -1 }] },
    },
    {
      kind: "explain",
      title: L("Zo stel je de formule op", "How to write the formula"),
      body: L(
        "1. Bereken $a$ met de hellingsdriehoek.\n2. Vul één punt in $y=ax+b$ in.\n3. Los $b$ op met de balans.\nZie [[rule:u3.find-b]].",
        "1. Work out $a$ with the slope triangle.\n2. Put one point into $y=ax+b$.\n3. Solve for $b$ with the balance.\nSee [[rule:u3.find-b]].",
      ),
      ruleId: "u3.find-b",
    },
  ],
  practice: [
    { generatorId: "u3.find-b", difficulty: 1, count: 2 },
    { generatorId: "u3.find-b", difficulty: 2, count: 2 },
    { generatorId: "u3.line-two-points", difficulty: 1, count: 2 },
    { generatorId: "u3.find-b", difficulty: 3, count: 1 },
    { generatorId: "u3.line-two-points", difficulty: 2, count: 2 },
    { generatorId: "u3.line-two-points", difficulty: 3, count: 1 },
  ],
};
