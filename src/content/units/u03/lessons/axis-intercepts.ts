/**
 * Lesson 5: where a line crosses the axes. On the x-axis y = 0, on the
 * y-axis x = 0.
 */
import Fraction from "fraction.js";
import type { Lesson } from "@/content/types";
import { L } from "../helpers";
import { xInterceptSteps } from "../gen/intercepts";
import { meetVisual } from "../gen/visuals";

const F = (v: number) => new Fraction(v);
const xInterceptExample = (a: Fraction, b: Fraction) => ({ steps: xInterceptSteps(a, b), solutions: [{ x: b.neg().div(a).valueOf() }] });

export const axisInterceptsLesson: Lesson = {
  id: "u3.axis-intercepts",
  title: L("Snijpunten met de assen", "Crossing the axes"),
  goal: L(
    "Je berekent waar een lijn de $x$-as en de $y$-as snijdt.",
    "You work out where a line crosses the $x$-axis and the $y$-axis.",
  ),
  minutes: 7,
  calculator: "off",
  calculatorOffReason: L("De rekenmachine staat uit. Je lost dit op met de balans.", "The calculator is off. You solve this with the balance."),
  info: {
    what: L("Uitrekenen waar een lijn de $x$-as en de $y$-as snijdt.", "Working out where a line crosses the $x$-axis and the $y$-axis."),
    why: L(
      "Wanneer is iets precies nul? Bijvoorbeeld: wanneer is je accu leeg, of je geld op?",
      "When is something exactly zero? For example: when is your battery empty, or your money gone?",
    ),
    later: L(
      "Nulpunten zoeken komt steeds terug: bij parabolen met de abc-formule en bij afgeleiden. Een AI zoekt waar de fout zo klein mogelijk is.",
      "Finding zeros keeps coming back: with parabolas and the quadratic formula, and with derivatives. An AI looks for where the error is as small as possible.",
    ),
  },
  screens: [
    {
      kind: "explain",
      title: L("Twee assen", "Two axes"),
      body: L(
        "Een schuine lijn snijdt de $y$-as in één punt. Daar is $x=0$.\nHij snijdt de $x$-as ook in één punt. Daar is $y=0$.",
        "A sloping line crosses the $y$-axis at one point. There $x=0$.\nIt also crosses the $x$-axis at one point. There $y=0$.",
      ),
    },
    {
      kind: "visual",
      title: L("Op zoek naar y = 0", "Looking for y = 0"),
      body: L(
        "Dit is $y=2x-6$. Loop langs de $x$-as.\nDe tabel laat $y$ zien. Waar is $y$ precies $0$?",
        "This is $y=2x-6$. Walk along the $x$-axis.\nThe table shows $y$. Where is $y$ exactly $0$?",
      ),
      visual: meetVisual([{ a: 2, b: -6 }], 0),
      task: L("Klik op de pijl naar rechts tot $y=0$.", "Click the right arrow until $y=0$."),
    },
    {
      kind: "explain",
      title: L("Rekenen: y = 0", "Calculating: y = 0"),
      body: L(
        "Op de $x$-as is $y=0$.\nDus: zet de formule gelijk aan $0$.\nLos dan $x$ op met de balans.",
        "On the $x$-axis $y=0$.\nSo: set the formula equal to $0$.\nThen solve for $x$ with the balance.",
      ),
      metaphor: "balance",
    },
    {
      kind: "example",
      title: L("Voorbeeld: stijgende lijn", "Example: increasing line"),
      problem: L("Waar snijdt $y=2x-6$ de $x$-as?", "Where does $y=2x-6$ cross the $x$-axis?"),
      visual: meetVisual([{ a: 2, b: -6 }], 0),
      solution: xInterceptExample(F(2), F(-6)),
    },
    {
      kind: "example",
      title: L("Voorbeeld: dalende lijn", "Example: decreasing line"),
      problem: L("Waar snijdt $y=-3x+6$ de $x$-as?", "Where does $y=-3x+6$ cross the $x$-axis?"),
      visual: meetVisual([{ a: -3, b: 6 }], 0),
      solution: xInterceptExample(F(-3), F(6)),
    },
    {
      kind: "explain",
      title: L("En de y-as?", "And the y-axis?"),
      body: L(
        "Op de $y$-as is $x=0$.\nVul $x=0$ in. Dan blijft $b$ over.\n$y=2x-6$ snijdt de $y$-as dus in $(0,\\ -6)$.",
        "On the $y$-axis $x=0$.\nPut in $x=0$. Then $b$ is left.\nSo $y=2x-6$ crosses the $y$-axis at $(0,\\ -6)$.",
      ),
    },
    {
      kind: "explain",
      title: L("Kort", "In short"),
      body: L(
        "$x$-as: maak $y=0$ en los $x$ op.\n$y$-as: maak $x=0$ en reken $y$ uit.\nZie [[rule:u3.axis-intercepts]].",
        "$x$-axis: make $y=0$ and solve for $x$.\n$y$-axis: make $x=0$ and work out $y$.\nSee [[rule:u3.axis-intercepts]].",
      ),
      ruleId: "u3.axis-intercepts",
    },
  ],
  practice: [
    { generatorId: "u3.x-intercept", difficulty: 1, count: 3 },
    { generatorId: "u3.x-intercept", difficulty: 2, count: 3 },
    { generatorId: "u3.x-intercept", difficulty: 3, count: 2 },
  ],
};
