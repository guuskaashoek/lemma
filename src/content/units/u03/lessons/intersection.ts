/**
 * Lesson 6: the intersection of two lines. Walk until both lines are
 * equally high, then calculate: set the formulas equal.
 */
import Fraction from "fraction.js";
import type { Lesson } from "@/content/types";
import { L } from "../helpers";
import { intersectionSteps } from "../gen/solve";
import { meetVisual } from "../gen/visuals";

const F = (v: number) => new Fraction(v);

export const intersectionLesson: Lesson = {
  id: "u3.intersection",
  title: L("Het snijpunt van twee lijnen", "Where two lines cross"),
  goal: L("Je berekent het snijpunt van twee lijnen.", "You work out where two lines cross."),
  minutes: 9,
  calculator: "off",
  calculatorOffReason: L("De rekenmachine staat uit. Je lost dit op met de balans.", "The calculator is off. You solve this with the balance."),
  info: {
    what: L("Het punt vinden waar twee lijnen elkaar kruisen.", "Finding the point where two lines cross."),
    why: L(
      "Wanneer zijn twee abonnementen even duur? Wanneer haalt de ene fietser de andere in? Dat is steeds een snijpunt.",
      "When do two plans cost the same? When does one cyclist catch up with the other? Each time that is an intersection.",
    ),
    later: L(
      "Snijpunten van grafieken komen terug bij elke soort functie. Een eenvoudige AI-classifier trekt een grens: de plek waar twee formules even groot zijn.",
      "Intersections of graphs come back with every kind of function. A simple AI classifier draws a boundary: the place where two formulas are equal.",
    ),
  },
  screens: [
    {
      kind: "explain",
      title: L("Twee lijnen", "Two lines"),
      body: L(
        "Twee schuine lijnen kruisen elkaar in één punt.\nDat punt ligt op allebei.\nDaar hebben ze dezelfde $x$ én dezelfde $y$.",
        "Two sloping lines cross at one point.\nThat point lies on both.\nThere they have the same $x$ and the same $y$.",
      ),
    },
    {
      kind: "visual",
      title: L("Waar zijn ze even hoog?", "Where are they equally high?"),
      body: L(
        "Loop langs de $x$-as. De tabel geeft $y$ van beide lijnen.\nWaar zijn ze even groot?",
        "Walk along the $x$-axis. The table gives $y$ for both lines.\nWhere are they equal?",
      ),
      visual: meetVisual(
        [
          { a: 2, b: 1 },
          { a: -1, b: 7 },
        ],
        0,
      ),
      task: L("Loop tot het verschil $0$ is.", "Walk until the gap is $0$."),
    },
    {
      kind: "explain",
      title: L("Stel gelijk", "Set equal"),
      body: L(
        "Op het snijpunt is $y$ even groot.\nDus zet je de formules gelijk: $2x+1=-x+7$.\nDat is een vergelijking. Die los je op met de balans.",
        "At the intersection $y$ is the same.\nSo you set the formulas equal: $2x+1=-x+7$.\nThat is an equation. You solve it with the balance.",
      ),
      metaphor: "balance",
      ruleId: "u2.balance-method",
    },
    {
      kind: "visual",
      title: L("De balans helpt", "The balance helps"),
      body: L(
        "Tel links en rechts $x$ op. Dan staat er $3x+1=7$.\nNu kan de balans het laten zien.",
        "Add $x$ on both sides. Then it says $3x+1=7$.\nNow the balance can show it.",
      ),
      visual: { kind: "balance", a: 3, b: 1, c: 0, d: 7 },
      task: L("Haal links en rechts $1$ weg. Verdeel dan in $3$ groepjes.", "Take $1$ away on both sides. Then split into $3$ groups."),
      metaphor: "balance",
    },
    {
      kind: "explain",
      title: L("Het teken ∧", "The sign ∧"),
      body: L(
        "Bij een snijpunt weet je twee dingen tegelijk.\nDan schrijf je $\\land$. Dat betekent **en**.\n$x=2\\land y=5$: $x$ is $2$ en $y$ is $5$.",
        "At an intersection you know two things at once.\nThen you write $\\land$. It means **and**.\n$x=2\\land y=5$: $x$ is $2$ and $y$ is $5$.",
      ),
    },
    {
      kind: "example",
      title: L("Voorbeeld", "Example"),
      problem: L("Bereken het snijpunt van $y=2x+1$ en $y=-x+7$.", "Work out the intersection of $y=2x+1$ and $y=-x+7$."),
      visual: meetVisual(
        [
          { a: 2, b: 1 },
          { a: -1, b: 7 },
        ],
        0,
      ),
      solution: { steps: intersectionSteps(F(2), F(1), F(-1), F(7), "2x+1", "-x+7", F(2), F(5)), solutions: [{ x: 2, y: 5 }] },
    },
    {
      kind: "example",
      title: L("Voorbeeld: allebei stijgend", "Example: both increasing"),
      problem: L("Bereken het snijpunt van $y=3x-4$ en $y=x+2$.", "Work out the intersection of $y=3x-4$ and $y=x+2$."),
      visual: meetVisual(
        [
          { a: 3, b: -4 },
          { a: 1, b: 2 },
        ],
        0,
      ),
      solution: { steps: intersectionSteps(F(3), F(-4), F(1), F(2), "3x-4", "x+2", F(3), F(5)), solutions: [{ x: 3, y: 5 }] },
    },
    {
      kind: "explain",
      title: L("Zo vind je het snijpunt", "How to find the intersection"),
      body: L(
        "1. Zet de formules gelijk.\n2. Los $x$ op met de balans.\n3. Vul $x$ in bij een van de formules. Dat geeft $y$.\nZie [[rule:u3.intersection]].",
        "1. Set the formulas equal.\n2. Solve for $x$ with the balance.\n3. Put $x$ into one of the formulas. That gives $y$.\nSee [[rule:u3.intersection]].",
      ),
      ruleId: "u3.intersection",
    },
  ],
  practice: [
    { generatorId: "u3.intersection", difficulty: 1, count: 3 },
    { generatorId: "u3.intersection", difficulty: 2, count: 3 },
    { generatorId: "u3.intersection", difficulty: 3, count: 2 },
  ],
};
