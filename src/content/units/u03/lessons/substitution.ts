/**
 * Lesson 8: systems of equations by substitution (invullen).
 */
import Fraction from "fraction.js";
import type { Lesson } from "@/content/types";
import { L } from "../helpers";
import { substitutionSteps } from "../gen/solve";
import { meetVisual } from "../gen/visuals";

const F = (v: number) => new Fraction(v);

export const substitutionLesson: Lesson = {
  id: "u3.substitution",
  title: L("Stelsels: invullen", "Systems: substitution"),
  goal: L(
    "Je lost een stelsel op door de ene vergelijking in de andere in te vullen.",
    "You solve a system by putting one equation into the other.",
  ),
  minutes: 8,
  calculator: "off",
  calculatorOffReason: L("De rekenmachine staat uit. Hier leer je de methode.", "The calculator is off. Here you learn the method."),
  info: {
    what: L(
      "Een stelsel oplossen door wat er al bekend is in de andere vergelijking te zetten.",
      "Solving a system by putting what you already know into the other equation.",
    ),
    why: L(
      "Staat er al $y=\\ldots$? Dan is invullen de snelste route.",
      "Does one equation already say $y=\\ldots$? Then substitution is the fastest route.",
    ),
    later: L(
      "Invullen gebruik je overal waar formules op elkaar aansluiten. Ook een neuraal netwerk is een formule ingevuld in een formule.",
      "You use substitution wherever formulas connect. A neural network is also a formula put into a formula.",
    ),
  },
  screens: [
    {
      kind: "explain",
      title: L("Al bijna klaar", "Almost done already"),
      body: L(
        "Kijk naar $y=2x$ en $x+y=9$.\nDe eerste zegt al wat $y$ is: $2x$.\nDan mag je $y$ in de tweede vervangen door $(2x)$.",
        "Look at $y=2x$ and $x+y=9$.\nThe first already says what $y$ is: $2x$.\nSo you may replace $y$ in the second by $(2x)$.",
      ),
    },
    {
      kind: "visual",
      title: L("Ook dit zijn twee lijnen", "These are two lines too"),
      body: L(
        "$x+y=9$ is hetzelfde als $y=-x+9$.\nDe oplossing van het stelsel is het snijpunt van de lijnen.",
        "$x+y=9$ is the same as $y=-x+9$.\nThe solution of the system is the intersection of the lines.",
      ),
      visual: meetVisual(
        [
          { a: 2, b: 0 },
          { a: -1, b: 9 },
        ],
        0,
      ),
      task: L("Loop tot de lijnen even hoog zijn.", "Walk until the lines are equally high."),
    },
    {
      kind: "explain",
      title: L("Tussen haakjes", "In brackets"),
      body: L(
        "Zet wat je invult altijd tussen haakjes.\nUit $x+y=9$ wordt $x+(2x)=9$.\nNu staat er nog maar één letter: $3x=9$.",
        "Always put what you substitute in brackets.\n$x+y=9$ becomes $x+(2x)=9$.\nNow there is only one letter: $3x=9$.",
      ),
    },
    {
      kind: "example",
      title: L("Voorbeeld", "Example"),
      problem: L("Los op: $y=2x$ en $x+y=9$.", "Solve: $y=2x$ and $x+y=9$."),
      solution: { steps: substitutionSteps("y", F(2), F(0), { p: F(1), q: F(1), c: F(9) }, F(3), F(6)), solutions: [{ x: 3, y: 6 }] },
    },
    {
      kind: "example",
      title: L("Voorbeeld: haakjes wegwerken", "Example: expanding brackets"),
      problem: L("Los op: $y=x-1$ en $2x+3y=12$.", "Solve: $y=x-1$ and $2x+3y=12$."),
      visual: meetVisual(
        [
          { a: 1, b: -1 },
          { a: F(-2).div(3), b: 4 },
        ],
        0,
      ),
      solution: { steps: substitutionSteps("y", F(1), F(-1), { p: F(2), q: F(3), c: F(12) }, F(3), F(2)), solutions: [{ x: 3, y: 2 }] },
    },
    {
      kind: "explain",
      title: L("Welke methode?", "Which method?"),
      body: L(
        "Staat er al $y=\\ldots$ of $x=\\ldots$? Kies **invullen**.\nStaan $x$ en $y$ allebei links? Kies **optellen of aftrekken**.\nZie [[rule:u3.substitution]] en [[rule:u3.elimination]].",
        "Does one equation say $y=\\ldots$ or $x=\\ldots$? Choose **substitution**.\nAre $x$ and $y$ both on the left? Choose **adding or subtracting**.\nSee [[rule:u3.substitution]] and [[rule:u3.elimination]].",
      ),
      ruleId: "u3.substitution",
    },
  ],
  practice: [
    { generatorId: "u3.system-substitution", difficulty: 1, count: 3 },
    { generatorId: "u3.system-substitution", difficulty: 2, count: 3 },
    { generatorId: "u3.system-substitution", difficulty: 3, count: 2 },
  ],
};
