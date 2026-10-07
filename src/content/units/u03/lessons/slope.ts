/**
 * Lesson 3: the slope triangle (hellingsdriehoek). The slope from two
 * points: change in y divided by change in x.
 */
import type { Lesson } from "@/content/types";
import { L } from "../helpers";
import { slopeSteps } from "../gen/slope";
import { slopeWalkVisual } from "../gen/visuals";

export const slopeLesson: Lesson = {
  id: "u3.slope",
  title: L("De hellingsdriehoek", "The slope triangle"),
  goal: L(
    "Je berekent de richtingscoëfficiënt als je twee punten van de lijn weet.",
    "You work out the slope when you know two points of the line.",
  ),
  minutes: 8,
  calculator: "off",
  calculatorOffReason: L("De rekenmachine staat uit. Deze delingen doe je met de hand.", "The calculator is off. You do these divisions by hand."),
  info: {
    what: L(
      "De richtingscoëfficiënt $a$ uitrekenen als je alleen twee punten weet.",
      "Working out the slope $a$ when you only know two points.",
    ),
    why: L(
      "Vaak heb je geen formule, maar wel twee metingen. Daaruit haal je hoe snel iets stijgt of daalt.",
      "Often you have no formula, but you do have two measurements. From them you get how fast something rises or falls.",
    ),
    later: L(
      "De helling komt terug als de afgeleide: de helling op één punt van een kromme. AI leert door steeds de helling van de fout te volgen.",
      "The slope comes back as the derivative: the slope at one point of a curve. AI learns by following the slope of the error again and again.",
    ),
  },
  screens: [
    {
      kind: "explain",
      title: L("Hoe steil?", "How steep?"),
      body: L(
        "Een trap met hoge treden is steil.\nBij een lijn meet je dat met een **hellingsdriehoek**:\nhoeveel omhoog per hoeveel opzij.",
        "A staircase with high steps is steep.\nFor a line you measure that with a **slope triangle**:\nhow far up for how far sideways.",
      ),
    },
    {
      kind: "visual",
      title: L("Van A naar B", "From A to B"),
      body: L("Loop van $A$ naar $B$.\nEerst opzij, dan omhoog.", "Walk from $A$ to $B$.\nFirst sideways, then up."),
      visual: slopeWalkVisual([1, 2], [4, 8]),
      task: L("Klik op ‘Volgende stap’ tot je de deling ziet.", "Click ‘Next step’ until you see the division."),
    },
    {
      kind: "visual",
      title: L("Groot of klein: dezelfde helling", "Big or small: the same slope"),
      body: L("Schuif $B$ over de lijn.\nDe driehoek wordt groter of kleiner.", "Slide $B$ along the line.\nThe triangle gets bigger or smaller."),
      visual: slopeWalkVisual([0, 1], [2, 5], { movable: true }),
      task: L("Klik door tot de deling. Schuif dan $B$ een paar keer. Verandert de uitkomst?", "Click through to the division. Then slide $B$ a few times. Does the result change?"),
    },
    {
      kind: "explain",
      title: L("Delen", "Divide"),
      body: L(
        "De deling geeft steeds hetzelfde getal.\nDat getal is de richtingscoëfficiënt $a$.\nOmhoog gedeeld door opzij.",
        "The division always gives the same number.\nThat number is the slope $a$.\nUp divided by sideways.",
      ),
      latex: "a=\\frac{y_B-y_A}{x_B-x_A}",
    },
    {
      kind: "visual",
      title: L("Omlaag: negatief", "Down: negative"),
      body: L(
        "Gaat de lijn naar rechts omlaag? Dan is het verschil in $y$ negatief.\nDan is $a$ ook negatief.",
        "Does the line go down to the right? Then the change in $y$ is negative.\nThen $a$ is negative too.",
      ),
      visual: slopeWalkVisual([-1, 4], [2, -2]),
      task: L("Klik door. Welk teken krijgt $a$?", "Click through. What sign does $a$ get?"),
    },
    {
      kind: "example",
      title: L("Voorbeeld: stijgende lijn", "Example: increasing line"),
      problem: L("Een lijn gaat door $A(1,\\ 3)$ en $B(4,\\ 9)$. Bereken $a$.", "A line goes through $A(1,\\ 3)$ and $B(4,\\ 9)$. Work out $a$."),
      visual: slopeWalkVisual([1, 3], [4, 9]),
      solution: { steps: slopeSteps([1, 3], [4, 9]) },
    },
    {
      kind: "example",
      title: L("Voorbeeld: dalende lijn", "Example: decreasing line"),
      problem: L("Een lijn gaat door $A(-1,\\ 5)$ en $B(3,\\ -3)$. Bereken $a$.", "A line goes through $A(-1,\\ 5)$ and $B(3,\\ -3)$. Work out $a$."),
      visual: slopeWalkVisual([-1, 5], [3, -3]),
      solution: { steps: slopeSteps([-1, 5], [3, -3]) },
    },
    {
      kind: "explain",
      title: L("Steeds B min A", "Always B minus A"),
      body: L(
        "Boven: $y$ van $B$ min $y$ van $A$.\nOnder: $x$ van $B$ min $x$ van $A$.\nNeem boven en onder dezelfde volgorde. Anders klopt het teken niet.\nZie [[rule:u3.slope]].",
        "On top: $y$ of $B$ minus $y$ of $A$.\nBelow: $x$ of $B$ minus $x$ of $A$.\nUse the same order on top and below. Otherwise the sign is wrong.\nSee [[rule:u3.slope]].",
      ),
      ruleId: "u3.slope",
    },
  ],
  practice: [
    { generatorId: "u3.slope-two-points", difficulty: 1, count: 3 },
    { generatorId: "u3.slope-two-points", difficulty: 2, count: 3 },
    { generatorId: "u3.slope-two-points", difficulty: 3, count: 2 },
  ],
};
