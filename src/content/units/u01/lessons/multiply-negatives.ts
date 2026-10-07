/**
 * Lesson 3: multiplying and dividing with negative numbers (the sign rule).
 */
import type { Lesson } from "@/content/types";
import { custom, L } from "../helpers";

export const multiplyNegativesLesson: Lesson = {
  id: "u1.multiply-negatives",
  title: L("Keer en delen met negatieve getallen", "Multiplying and dividing negative numbers"),
  goal: L(
    "Je rekent sommen zoals $3\\cdot(-4)$, $-6\\cdot(-4)$ en $-24:6$ uit met de tekenregel.",
    "You work out sums like $3\\cdot(-4)$, $-6\\cdot(-4)$ and $-24:6$ with the sign rule.",
  ),
  minutes: 8,
  calculator: "off",
  calculatorOffReason: L(
    "De rekenmachine staat uit. De tekenregel leer je met je hoofd.",
    "The calculator is off. You learn the sign rule with your head.",
  ),
  info: {
    what: L(
      "Vermenigvuldigen en delen als er een min in de som staat.",
      "Multiplying and dividing when there is a minus in the sum.",
    ),
    why: L(
      "Het teken van een antwoord is vaak het belangrijkste. Gaat iets omhoog of omlaag? Winst of verlies?",
      "The sign of an answer is often what matters most. Does something go up or down? Profit or loss?",
    ),
    later: L(
      "Bij haakjes wegwerken, bij de abc-formule en in AI: een neuraal netwerk vermenigvuldigt de hele tijd met negatieve gewichten.",
      "When expanding brackets, with the quadratic formula and in AI: a neural network multiplies by negative weights all the time.",
    ),
  },
  screens: [
    {
      kind: "visual",
      title: L("Keer is herhaald optellen", "Times is repeated adding"),
      body: L(
        "$3\\cdot(-4)$ betekent: drie keer $-4$.\nDat is $(-4)+(-4)+(-4)$.\nOp de getallenlijn: drie sprongen van $4$ naar links.",
        "$3\\cdot(-4)$ means: three times $-4$.\nThat is $(-4)+(-4)+(-4)$.\nOn the number line: three jumps of $4$ to the left.",
      ),
      visual: { kind: "number-line", min: -13, max: 1, start: 0, jumps: [-4, -4, -4] },
      task: L("Klik drie keer op de knop. Waar kom je uit?", "Click the button three times. Where do you land?"),
    },
    {
      kind: "explain",
      title: L("Eén min: negatief", "One minus: negative"),
      body: L(
        "$3\\cdot(-4)=-12$.\nOmdraaien mag bij keer: $-4\\cdot 3$ is ook $-12$.\nEén minteken in een keersom: het antwoord is negatief.",
        "$3\\cdot(-4)=-12$.\nYou may swap the order in a product: $-4\\cdot 3$ is also $-12$.\nOne minus sign in a product: the answer is negative.",
      ),
      latex: "3\\cdot(-4)=-12",
    },
    {
      kind: "visual",
      title: L("En min keer min?", "And minus times minus?"),
      body: L(
        "Kijk naar de tafel van $-2$, van boven naar beneden.\nElke rij omlaag komt er $2$ bij.\nDat patroon gaat gewoon door, ook onder nul.",
        "Look at the times table of $-2$, from top to bottom.\nEvery row down, $2$ is added.\nThat pattern simply goes on, also below zero.",
      ),
      visual: custom("u1.sign-pattern", { b: -2 }, L("De tafel van $-2$ met staafjes.", "The times table of $-2$ with bars.")),
      task: L(
        "Klik op Volgende rij. Bij $-1\\cdot(-2)$ moet je raden. Volg het patroon.",
        "Click Next row. At $-1\\cdot(-2)$ you have to guess. Follow the pattern.",
      ),
    },
    {
      kind: "explain",
      title: L("De tekenregel", "The sign rule"),
      body: L(
        "Gelijke tekens: plus. Verschillende tekens: min.\nTel de mintekens. Even aantal: plus. Oneven aantal: min.\nReken eerst zonder tekens. Zet daarna het teken. Zie [[rule:u1.sign-rule]].",
        "Equal signs: plus. Different signs: minus.\nCount the minus signs. Even number: plus. Odd number: minus.\nFirst work without signs. Then add the sign. See [[rule:u1.sign-rule]].",
      ),
      latex: "-\\cdot -=+\\qquad -\\cdot +=-",
      ruleId: "u1.sign-rule",
    },
    {
      kind: "explain",
      title: L("Delen werkt net zo", "Dividing works the same"),
      body: L(
        "Delen is keer andersom.\n$-12:3=-4$, want $3\\cdot(-4)=-12$.\n$-12:(-3)=4$, want $-3\\cdot 4=-12$.\nDus ook bij delen geldt de tekenregel.",
        "Dividing is multiplying backwards.\n$-12:3=-4$, because $3\\cdot(-4)=-12$.\n$-12:(-3)=4$, because $-3\\cdot 4=-12$.\nSo the sign rule also holds for dividing.",
      ),
      latex: "-12:(-3)=4",
    },
    {
      kind: "example",
      title: L("Voorbeeld: $-6\\cdot(-4)$", "Example: $-6\\cdot(-4)$"),
      problem: L("Bereken $-6\\cdot(-4)$.", "Work out $-6\\cdot(-4)$."),
      solution: {
        steps: [
          { latex: "-6\\cdot(-4)", note: L("Tel de mintekens: $2$.", "Count the minus signs: $2$.") },
          { latex: "\\hl{6\\cdot 4}", note: L("Twee mintekens: even, dus plus.", "Two minus signs: even, so plus.") },
          { latex: "\\ask{24}", note: L("Reken uit.", "Work it out.") },
        ],
      },
    },
    {
      kind: "example",
      title: L("Voorbeeld: drie getallen", "Example: three numbers"),
      problem: L("Bereken $-2\\cdot 3\\cdot(-5)$.", "Work out $-2\\cdot 3\\cdot(-5)$."),
      solution: {
        steps: [
          { latex: "-2\\cdot 3\\cdot(-5)", note: L("Tel de mintekens: $2$.", "Count the minus signs: $2$.") },
          { latex: "\\hl{2\\cdot 3\\cdot 5}", note: L("Even aantal: het antwoord is positief.", "Even number: the answer is positive.") },
          { latex: "\\ask{6}\\cdot 5", note: L("Van links naar rechts: $2\\cdot 3$.", "From left to right: $2\\cdot 3$.") },
          { latex: "\\ask{30}", note: L("Dan $6\\cdot 5$.", "Then $6\\cdot 5$.") },
        ],
      },
    },
  ],
  practice: [
    { generatorId: "u1.multiply-divide", difficulty: 1, count: 3 },
    { generatorId: "u1.multiply-divide", difficulty: 2, count: 3 },
    { generatorId: "u1.multiply-divide", difficulty: 3, count: 2 },
  ],
};
