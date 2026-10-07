/**
 * Lesson 1: negative numbers on the number line. Comparing, and adding or
 * subtracting a positive number as a jump to the right or left.
 */
import type { Lesson } from "@/content/types";
import { L } from "../helpers";

export const numberLineLesson: Lesson = {
  id: "u1.number-line",
  title: L("Negatieve getallen: de getallenlijn", "Negative numbers: the number line"),
  goal: L(
    "Je zet negatieve getallen op volgorde en rekent sommen zoals $-3+5$ en $2-6$ op de getallenlijn.",
    "You put negative numbers in order and work out sums like $-3+5$ and $2-6$ on the number line.",
  ),
  minutes: 7,
  calculator: "off",
  calculatorOffReason: L(
    "De rekenmachine staat uit. Je leert hier zien waar een getal ligt.",
    "The calculator is off. Here you learn to see where a number lies.",
  ),
  info: {
    what: L(
      "Negatieve getallen zijn getallen onder nul, zoals $-5$. Op de getallenlijn liggen ze links van $0$.",
      "Negative numbers are numbers below zero, like $-5$. On the number line they lie to the left of $0$.",
    ),
    why: L(
      "Temperatuur, geld op je rekening, hoogte onder zeeniveau: overal kom je ze tegen. En vanaf nu in bijna elke som.",
      "Temperature, money in your account, height below sea level: you meet them everywhere. And from now on in almost every sum.",
    ),
    later: L(
      "In grafieken (links van de $y$-as), bij vergelijkingen en in AI: de gewichten van een neuraal netwerk zijn vaak negatief.",
      "In graphs (left of the $y$-axis), in equations and in AI: the weights of a neural network are often negative.",
    ),
  },
  screens: [
    {
      kind: "explain",
      title: L("Onder nul", "Below zero"),
      body: L(
        "Getallen onder nul heten **negatief**. Je schrijft een min ervoor.\nBij $-5$ graden is het $5$ graden onder nul.\nSta je $20$ euro rood? Dan heb je $-20$ euro.",
        "Numbers below zero are called **negative**. You write a minus in front.\nAt $-5$ degrees it is $5$ degrees below zero.\nAre you $20$ euros overdrawn? Then you have $-20$ euros.",
      ),
      latex: "-5",
    },
    {
      kind: "visual",
      title: L("De getallenlijn", "The number line"),
      body: L(
        "Rechts van $0$ liggen de positieve getallen.\nLinks van $0$ liggen de negatieve getallen.\nHoe verder naar links, hoe kleiner.",
        "To the right of $0$ are the positive numbers.\nTo the left of $0$ are the negative numbers.\nThe further to the left, the smaller.",
      ),
      visual: {
        kind: "number-line",
        min: -8,
        max: 5,
        marks: [
          { value: -6, label: "A" },
          { value: -2, label: "B" },
          { value: 3, label: "C" },
        ],
      },
      task: L(
        "Punt A is $-6$, punt B is $-2$. Welk punt ligt het meest links? Dat is het kleinste getal.",
        "Point A is $-6$, point B is $-2$. Which point is furthest to the left? That is the smallest number.",
      ),
    },
    {
      kind: "explain",
      title: L("Kleiner en groter", "Smaller and bigger"),
      body: L(
        "$-6$ is kleiner dan $-2$. Je schrijft $-6<-2$.\nDenk aan de temperatuur: $-6$ graden is kouder.\nLet op: de $6$ lijkt groot, maar met de min ervoor ligt hij verder links. Zie [[rule:u1.number-line]].",
        "$-6$ is smaller than $-2$. You write $-6<-2$.\nThink of temperature: $-6$ degrees is colder.\nCareful: the $6$ looks big, but with the minus in front it lies further to the left. See [[rule:u1.number-line]].",
      ),
      latex: "-6<-2",
      ruleId: "u1.number-line",
    },
    {
      kind: "visual",
      title: L("Plus: spring naar rechts", "Plus: jump to the right"),
      body: L(
        "Bij $-3+5$ start je bij $-3$.\nPlus $5$ betekent: $5$ stappen naar rechts.\nHet wordt $5$ graden warmer.",
        "For $-3+5$ you start at $-3$.\nPlus $5$ means: $5$ steps to the right.\nIt gets $5$ degrees warmer.",
      ),
      visual: { kind: "number-line", min: -5, max: 4, start: -3, jumps: [5] },
      task: L("Klik op de knop voor de sprong. Waar kom je uit?", "Click the button for the jump. Where do you land?"),
    },
    {
      kind: "visual",
      title: L("Min: spring naar links", "Minus: jump to the left"),
      body: L(
        "Bij $2-6$ start je bij $2$.\nMin $6$ betekent: $6$ stappen naar links.\nJe gaat dus voorbij de $0$.",
        "For $2-6$ you start at $2$.\nMinus $6$ means: $6$ steps to the left.\nSo you go past $0$.",
      ),
      visual: { kind: "number-line", min: -6, max: 4, start: 2, jumps: [-6] },
      task: L("Klik op de knop. Kom je links of rechts van $0$ uit?", "Click the button. Do you land left or right of $0$?"),
    },
    {
      kind: "example",
      title: L("Voorbeeld: $-3+5$", "Example: $-3+5$"),
      problem: L("Bereken $-3+5$.", "Work out $-3+5$."),
      visual: { kind: "number-line", min: -5, max: 4, start: -3, jumps: [5] },
      solution: {
        steps: [
          { latex: "-3+5", note: L("Start bij $-3$.", "Start at $-3$.") },
          { latex: "\\ask{2}", note: L("Spring $5$ naar rechts.", "Jump $5$ to the right.") },
        ],
      },
    },
    {
      kind: "example",
      title: L("Voorbeeld: $-4-3$", "Example: $-4-3$"),
      problem: L("Bereken $-4-3$.", "Work out $-4-3$."),
      visual: { kind: "number-line", min: -9, max: 1, start: -4, jumps: [-3] },
      solution: {
        steps: [
          { latex: "-4-3", note: L("Start bij $-4$.", "Start at $-4$.") },
          { latex: "\\ask{-7}", note: L("Spring $3$ naar links. Het wordt nog kouder.", "Jump $3$ to the left. It gets even colder.") },
        ],
      },
    },
  ],
  practice: [
    { generatorId: "u1.compare", difficulty: 1, count: 2 },
    { generatorId: "u1.add-subtract", difficulty: 1, count: 4 },
    { generatorId: "u1.compare", difficulty: 2, count: 2 },
    { generatorId: "u1.compare", difficulty: 3, count: 1 },
  ],
};
