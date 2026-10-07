/**
 * Lesson 6: harder equations. The same balance, now with minus blocks,
 * a minus in front of x, fractions as answers, and brackets first.
 */
import type { Lesson } from "@/content/types";
import { custom, L } from "../helpers";
import { eqLatex, solveSteps } from "../gen/equations";
import { BY_HAND } from "./variables";

const start = (a: number, b: number, c: number, d: number) => ({
  latex: eqLatex(a, b, c, d),
  note: L("Dit is de vergelijking.", "This is the equation."),
});

export const equationsLesson: Lesson = {
  id: "u2.equations",
  title: L("Lastigere vergelijkingen", "Harder equations"),
  goal: L(
    "Je lost vergelijkingen op met min-getallen en haakjes, zoals $3(x-2)=2x+5$.",
    "You solve equations with negative numbers and brackets, like $3(x-2)=2x+5$.",
  ),
  minutes: 10,
  calculator: "off",
  calculatorOffReason: BY_HAND,
  info: {
    what: L(
      "Dezelfde balans als in de vorige les. Nu met min-getallen, haakjes en breuken als antwoord.",
      "The same balance as in the last lesson. Now with negative numbers, brackets and fractions as answers.",
    ),
    why: L(
      "Echte vergelijkingen zijn zelden netjes. Met deze vaste stappen los je ze toch op.",
      "Real equations are rarely tidy. With these fixed steps you can still solve them.",
    ),
    later: L(
      "Bij snijpunten van grafieken (unit 3) en de abc-formule (unit 4). In AI zoekt een computer ook stap voor stap naar de onbekende getallen.",
      "In intersections of graphs (unit 3) and the quadratic formula (unit 4). In AI a computer also searches step by step for the unknown numbers.",
    ),
  },
  screens: [
    {
      kind: "visual",
      title: L("Min-blokjes op de balans", "Minus blocks on the balance"),
      body: L(
        "Een gestippeld blokje is $-1$.\nLinks staat $2x-3$: twee $x$-blokken en drie min-blokjes.\nMin-blokjes weg? Tel aan beide kanten $3$ op.",
        "A dashed block is $-1$.\nThe left side is $2x-3$: two $x$-blocks and three minus blocks.\nRemove minus blocks? Add $3$ on both sides.",
      ),
      visual: { kind: "balance", a: 2, b: -3, c: 0, d: 5 },
      task: L("Klik op ▶ Laat zien. Wat gebeurt er met de min-blokjes?", "Click ▶ Show me. What happens to the minus blocks?"),
      metaphor: "balance",
    },
    {
      kind: "explain",
      title: L("Doe het omgekeerde", "Do the opposite"),
      body: L(
        "Elke stap maak je ongedaan met het omgekeerde.\n$-3$ weg? Doe $+3$.\nKeer $2$ weg? Deel door $2$.\nAltijd aan beide kanten.",
        "You undo every step with its opposite.\nRemove $-3$? Do $+3$.\nRemove times $2$? Divide by $2$.\nAlways on both sides.",
      ),
      metaphor: "balance",
    },
    {
      kind: "example",
      title: L("Voorbeeld: $2x-3=5$", "Example: $2x-3=5$"),
      problem: L("Los op: $2x-3=5$.", "Solve: $2x-3=5$."),
      visual: { kind: "balance", a: 2, b: -3, c: 0, d: 5 },
      solution: { steps: [start(2, -3, 0, 5), ...solveSteps(2, -3, 0, 5)], solutions: [{ x: 4 }] },
    },
    {
      kind: "explain",
      title: L("Een min voor de $x$", "A minus in front of $x$"),
      body: L(
        "Bij $-3x=12$ deel je door $-3$, met het minteken erbij.\n$x=12:(-3)=-4$.\nControleer: $-3\\cdot(-4)=12$. Klopt!",
        "For $-3x=12$ you divide by $-3$, minus sign included.\n$x=12:(-3)=-4$.\nCheck: $-3\\cdot(-4)=12$. Correct!",
      ),
    },
    {
      kind: "example",
      title: L("Voorbeeld: $7-2x=13$", "Example: $7-2x=13$"),
      problem: L("Los op: $7-2x=13$.", "Solve: $7-2x=13$."),
      solution: {
        steps: [
          { latex: "7-2x=13", note: L("Dit is de vergelijking.", "This is the equation.") },
          { latex: "-2x+7=13", note: L("Zet de $x$-term vooraan. Het minteken gaat mee.", "Put the $x$-term first. The minus sign moves with it.") },
          ...solveSteps(-2, 7, 0, 13),
        ],
        solutions: [{ x: -3 }],
      },
    },
    {
      kind: "explain",
      title: L("Een breuk als antwoord", "A fraction as the answer"),
      body: L(
        "Soms komt er geen heel getal uit. Dat is goed.\n$2x=5$ geeft $x=\\frac{5}{2}$.\nDat is hetzelfde als $2{,}5$. Allebei goed.",
        "Sometimes the answer is not a whole number. That is fine.\n$2x=5$ gives $x=\\frac{5}{2}$.\nThat is the same as $2.5$. Both are correct.",
      ),
    },
    {
      kind: "example",
      title: L("Voorbeeld: $4x+1=2x+6$", "Example: $4x+1=2x+6$"),
      problem: L("Los op: $4x+1=2x+6$.", "Solve: $4x+1=2x+6$."),
      solution: { steps: [start(4, 1, 2, 6), ...solveSteps(4, 1, 2, 6)], solutions: [{ x: 2.5 }] },
    },
    {
      kind: "visual",
      title: L("Eerst haakjes weg", "Brackets first"),
      body: L(
        "In $3(x-2)=2x+5$ staan haakjes.\nWerk die eerst weg: $3(x-2)=3x-6$.\nDaarna kan de balans het werk doen.",
        "$3(x-2)=2x+5$ has brackets.\nExpand them first: $3(x-2)=3x-6$.\nThen the balance can do the work.",
      ),
      visual: custom("u2.arrows", { left: [[3, 0]], right: [[1, 1], [-2, 0]] }, L("Pijlen voor $3(x-2)$.", "Arrows for $3(x-2)$.")),
      task: L("Klik door de pijlen. Wat staat er links zonder haakjes?", "Click through the arrows. What is on the left without brackets?"),
    },
    {
      kind: "explain",
      title: L("Het stappenplan", "The plan"),
      body: L(
        "1. Haakjes weg.\n2. $x$-termen naar links.\n3. Getallen naar rechts.\n4. Delen door het getal voor $x$.\nZie [[rule:u2.brackets-first]].",
        "1. Expand brackets.\n2. $x$-terms to the left.\n3. Numbers to the right.\n4. Divide by the number in front of $x$.\nSee [[rule:u2.brackets-first]].",
      ),
      ruleId: "u2.brackets-first",
    },
    {
      kind: "example",
      title: L("Voorbeeld: $3(x-2)=2x+5$", "Example: $3(x-2)=2x+5$"),
      problem: L("Los op: $3(x-2)=2x+5$.", "Solve: $3(x-2)=2x+5$."),
      visual: { kind: "balance", a: 3, b: -6, c: 2, d: 5 },
      solution: {
        steps: [
          { latex: "3(x-2)=2x+5", note: L("Dit is de vergelijking.", "This is the equation.") },
          { latex: "\\ask{3x-6}=2x+5", note: L("Stap 1: haakjes weg.", "Step 1: expand the brackets.") },
          ...solveSteps(3, -6, 2, 5),
        ],
        solutions: [{ x: 11 }],
      },
    },
  ],
  practice: [
    { generatorId: "u2.equation-negative", difficulty: 1, count: 2 },
    { generatorId: "u2.equation-negative", difficulty: 2, count: 2 },
    { generatorId: "u2.equation-brackets", difficulty: 1, count: 2 },
    { generatorId: "u2.equation-negative", difficulty: 3, count: 1 },
    { generatorId: "u2.equation-brackets", difficulty: 2, count: 1 },
    { generatorId: "u2.equation-brackets", difficulty: 3, count: 1 },
  ],
};
