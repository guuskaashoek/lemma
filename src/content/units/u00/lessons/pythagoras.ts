/**
 * Lesson 9: Pythagoras, for the long side and for a short side.
 */
import type { Lesson } from "@/content/types";
import { L } from "../helpers";

export const pythagorasLesson: Lesson = {
  id: "u0.pythagoras",
  title: L("Pythagoras", "Pythagoras"),
  goal: L(
    "Je berekent een zijde van een rechthoekige driehoek met de stelling van Pythagoras.",
    "You work out a side of a right triangle with Pythagoras' theorem.",
  ),
  minutes: 9,
  calculator: "allowed",
  calculatorOffReason: L(
    "Bij deze opgave staat de rekenmachine uit. Die reken je met de hand.",
    "The calculator is off for this exercise. You do this one by hand.",
  ),
  info: {
    what: L(
      "Een regel over rechthoekige driehoeken: ken je twee zijden, dan kun je de derde uitrekenen.",
      "A rule about right triangles: if you know two sides, you can work out the third.",
    ),
    why: L(
      "Afstanden die je niet kunt meten: een schuine ladder, een diagonaal, een route schuin over een veld.",
      "Distances you cannot measure: a leaning ladder, a diagonal, a route straight across a field.",
    ),
    later: L(
      "Bij afstanden in een assenstelsel, de eenheidscirkel en vectoren. In AI meet je zo hoe ver twee datapunten van elkaar liggen.",
      "In distances on a coordinate plane, the unit circle and vectors. In AI this is how you measure how far apart two data points are.",
    ),
  },
  screens: [
    {
      kind: "explain",
      title: L("De zijden hebben namen", "The sides have names"),
      body: L(
        "Een rechthoekige driehoek heeft één hoek van $90^{\\circ}$.\nDe twee zijden bij die hoek heten de **rechthoekszijden**.\nDe lange zijde tegenover de rechte hoek heet de **schuine zijde**. Die is altijd de langste.",
        "A right triangle has one angle of $90^{\\circ}$.\nThe two sides at that angle are the **legs**.\nThe long side opposite the right angle is the **hypotenuse**. It is always the longest.",
      ),
    },
    {
      kind: "visual",
      title: L("Vierkanten op de zijden", "Squares on the sides"),
      body: L(
        "Zet op elke zijde een vierkant.\nDe twee kleine vierkanten zijn samen precies zo groot als het grote vierkant.\n$9+16=25$.",
        "Put a square on every side.\nThe two small squares together are exactly as big as the large square.\n$9+16=25$.",
      ),
      visual: { kind: "pythagoras", a: 3, b: 4 },
      task: L("Klik twee keer op volgende stap. Hoe lang is de schuine zijde?", "Click next step twice. How long is the hypotenuse?"),
    },
    {
      kind: "explain",
      title: L("De stelling van Pythagoras", "Pythagoras' theorem"),
      body: L(
        "$a$ en $b$ zijn de rechthoekszijden. $c$ is de schuine zijde.\nDan geldt: $a^2+b^2=c^2$.\nZie [[rule:u0.pythagoras]].",
        "$a$ and $b$ are the legs. $c$ is the hypotenuse.\nThen: $a^2+b^2=c^2$.\nSee [[rule:u0.pythagoras]].",
      ),
      latex: "a^{2}+b^{2}=c^{2}",
      ruleId: "u0.pythagoras",
    },
    {
      kind: "example",
      title: L("Voorbeeld: de schuine zijde", "Example: the hypotenuse"),
      problem: L("De rechthoekszijden zijn $6$ en $8$. Hoe lang is de schuine zijde?", "The legs are $6$ and $8$. How long is the hypotenuse?"),
      visual: { kind: "pythagoras", a: 6, b: 8 },
      solution: {
        steps: [
          { latex: "\\sqrt{6^{2}+8^{2}}", note: L("Kwadrateer, tel op, neem de wortel.", "Square, add, take the square root.") },
          { latex: "\\sqrt{\\ask{36}+8^{2}}", note: L("$6^{2}=36$.", "$6^{2}=36$.") },
          { latex: "\\sqrt{36+\\ask{64}}", note: L("$8^{2}=64$.", "$8^{2}=64$.") },
          { latex: "\\sqrt{\\ask{100}}", note: L("Samen $100$.", "Together $100$.") },
          { latex: "\\ask{10}", note: L("$\\sqrt{100}=10$, want $10\\cdot 10=100$.", "$\\sqrt{100}=10$, because $10\\cdot 10=100$.") },
        ],
      },
    },
    {
      kind: "explain",
      title: L("Een korte zijde zoeken", "Finding a short side"),
      body: L(
        "Ken je de schuine zijde al? Dan zoek je een korte zijde.\nDan trek je af: $b^2=c^2-a^2$.\nControle: een korte zijde is altijd korter dan de schuine zijde.",
        "Do you already know the hypotenuse? Then you are looking for a short side.\nThen you subtract: $b^2=c^2-a^2$.\nCheck: a short side is always shorter than the hypotenuse.",
      ),
      latex: "b^{2}=c^{2}-a^{2}",
      ruleId: "u0.pythagoras",
    },
    {
      kind: "example",
      title: L("Voorbeeld: een korte zijde", "Example: a short side"),
      problem: L("De schuine zijde is $13$ en een rechthoekszijde is $5$. Hoe lang is de andere?", "The hypotenuse is $13$ and one leg is $5$. How long is the other one?"),
      solution: {
        steps: [
          { latex: "\\sqrt{13^{2}-5^{2}}", note: L("Kwadrateer, trek af, neem de wortel.", "Square, subtract, take the square root.") },
          { latex: "\\sqrt{\\ask{169}-25}", note: L("$13^{2}=169$ en $5^{2}=25$.", "$13^{2}=169$ and $5^{2}=25$.") },
          { latex: "\\sqrt{\\ask{144}}", note: L("Trek af.", "Subtract.") },
          { latex: "\\ask{12}", note: L("$12\\cdot 12=144$. En $12$ is kleiner dan $13$: klopt.", "$12\\cdot 12=144$. And $12$ is smaller than $13$: correct.") },
        ],
      },
    },
  ],
  practice: [
    { generatorId: "u0.pythagoras-long", difficulty: 1, count: 2 },
    { generatorId: "u0.pythagoras-short", difficulty: 1, count: 1 },
    { generatorId: "u0.pythagoras-long", difficulty: 2, count: 2 },
    { generatorId: "u0.pythagoras-short", difficulty: 2, count: 1 },
    { generatorId: "u0.pythagoras-long", difficulty: 3, count: 1 },
    { generatorId: "u0.pythagoras-short", difficulty: 3, count: 1 },
  ],
};
