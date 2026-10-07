/**
 * Lesson 2: adding and subtracting negative numbers, with plus and minus
 * counters (fiches) and zero pairs. "Min min wordt plus".
 */
import type { Lesson } from "@/content/types";
import { custom, L } from "../helpers";

export const minusMinusLesson: Lesson = {
  id: "u1.minus-minus",
  title: L("Min min wordt plus", "Minus minus is plus"),
  goal: L(
    "Je rekent sommen zoals $3+(-5)$ en $-2-(-5)$ uit, en je snapt waarom min min plus wordt.",
    "You work out sums like $3+(-5)$ and $-2-(-5)$, and you understand why minus minus becomes plus.",
  ),
  minutes: 9,
  calculator: "off",
  calculatorOffReason: L(
    "De rekenmachine staat uit. Je leert hier waarom de tekens zo werken.",
    "The calculator is off. Here you learn why the signs work this way.",
  ),
  info: {
    what: L(
      "Een negatief getal optellen of aftrekken, zoals $-2-(-5)$.",
      "Adding or subtracting a negative number, like $-2-(-5)$.",
    ),
    why: L(
      "Twee mintekens naast elkaar zie je straks overal: bij haakjes wegwerken, formules invullen en vergelijkingen.",
      "Two minus signs next to each other will show up everywhere: when expanding brackets, filling in formulas and solving equations.",
    ),
    later: L(
      "Bij afgeleiden en bij gradient descent in AI: daar trek je een negatieve helling af, en dan ga je juist omhoog.",
      "In derivatives and in gradient descent in AI: there you subtract a negative slope, and then you actually go up.",
    ),
  },
  screens: [
    {
      kind: "visual",
      title: L("Plus-fiches en min-fiches", "Plus counters and minus counters"),
      body: L(
        "Een dichte fiche is $+1$. Een open fiche is $-1$.\nEen plus en een min samen zijn $0$. Dat heet een **nulpaar**.\nEen nulpaar mag je altijd erbij leggen of weghalen.",
        "A filled counter is $+1$. An open counter is $-1$.\nA plus and a minus together are $0$. That is called a **zero pair**.\nYou may always add or remove a zero pair.",
      ),
      visual: custom(
        "u1.zero-pairs",
        { a: 0, free: true },
        L("Een bak met fiches. Knoppen om fiches erbij te leggen of weg te halen.", "A tray of counters. Buttons to add or remove counters."),
      ),
      task: L(
        "Leg $3$ plus-fiches en $5$ min-fiches neer. Hoeveel is dat samen? Haal daarna de nulparen weg.",
        "Put down $3$ plus counters and $5$ minus counters. What is that together? Then remove the zero pairs.",
      ),
    },
    {
      kind: "visual",
      title: L("Plus een negatief getal", "Plus a negative number"),
      body: L(
        "$3+(-5)$: leg bij $3$ plus-fiches nog $5$ min-fiches.\nDe nulparen vallen weg.\nWat overblijft is het antwoord.",
        "$3+(-5)$: add $5$ minus counters to $3$ plus counters.\nThe zero pairs disappear.\nWhat is left is the answer.",
      ),
      visual: custom("u1.zero-pairs", { a: 3, op: "+", b: -5 }, L("Fiches voor $3+(-5)$.", "Counters for $3+(-5)$.")),
      task: L("Klik door alle stappen. Hoeveel blijft er over?", "Click through all the steps. How much is left?"),
    },
    {
      kind: "explain",
      title: L("Plus min wordt min", "Plus minus becomes minus"),
      body: L(
        "Een negatief getal optellen is hetzelfde als aftrekken.\n$3+(-5)$ is hetzelfde als $3-5$.\nOp de getallenlijn: $5$ naar links.",
        "Adding a negative number is the same as subtracting.\n$3+(-5)$ is the same as $3-5$.\nOn the number line: $5$ to the left.",
      ),
      latex: "3+(-5)=3-5=-2",
    },
    {
      kind: "visual",
      title: L("Een negatief getal weghalen", "Taking away a negative number"),
      body: L(
        "$-2-(-5)$: je moet $5$ min-fiches weghalen.\nEr liggen er maar $2$. Leg er dus nulparen bij.\nDie zijn samen $0$, dus de waarde verandert niet.",
        "$-2-(-5)$: you must take away $5$ minus counters.\nThere are only $2$. So add zero pairs.\nThey are $0$ together, so the value does not change.",
      ),
      visual: custom("u1.zero-pairs", { a: -2, op: "-", b: -5 }, L("Fiches voor $-2-(-5)$.", "Counters for $-2-(-5)$.")),
      task: L(
        "Klik door de stappen. Welke fiches blijven over als de min-fiches weg zijn?",
        "Click through the steps. Which counters are left when the minus counters are gone?",
      ),
    },
    {
      kind: "explain",
      title: L("Min min wordt plus", "Minus minus becomes plus"),
      body: L(
        "Je haalde $5$ min-fiches weg. Er bleven $3$ plus-fiches over.\nDat is hetzelfde als $5$ erbij doen: $-2+5=3$.\nDus: een negatief getal aftrekken is optellen. Zie [[rule:u1.minus-minus]].",
        "You took away $5$ minus counters. $3$ plus counters were left.\nThat is the same as adding $5$: $-2+5=3$.\nSo: subtracting a negative number is adding. See [[rule:u1.minus-minus]].",
      ),
      latex: "-2-(-5)=-2+5=3",
      ruleId: "u1.minus-minus",
    },
    {
      kind: "example",
      title: L("Voorbeeld: $-4-(-6)$", "Example: $-4-(-6)$"),
      problem: L("Bereken $-4-(-6)$.", "Work out $-4-(-6)$."),
      visual: { kind: "number-line", min: -5, max: 3, start: -4, jumps: [6] },
      solution: {
        steps: [
          { latex: "-4-(-6)", note: L("Twee mintekens naast elkaar.", "Two minus signs next to each other.") },
          { latex: "-4\\hl{+6}", note: L("Min min wordt plus.", "Minus minus becomes plus.") },
          { latex: "\\ask{2}", note: L("Start bij $-4$, spring $6$ naar rechts.", "Start at $-4$, jump $6$ to the right.") },
        ],
      },
    },
    {
      kind: "example",
      title: L("Voorbeeld: drie getallen", "Example: three numbers"),
      problem: L("Bereken $5+(-8)-(-2)$.", "Work out $5+(-8)-(-2)$."),
      visual: { kind: "number-line", min: -4, max: 6, start: 5, jumps: [-8, 2] },
      solution: {
        steps: [
          { latex: "5+(-8)-(-2)", note: L("Dit is de som.", "This is the sum.") },
          { latex: "5\\hl{-8}\\hl{+2}", note: L("Plus min wordt min. Min min wordt plus.", "Plus minus becomes minus. Minus minus becomes plus.") },
          { latex: "\\ask{-3}+2", note: L("Spring $8$ naar links.", "Jump $8$ to the left.") },
          { latex: "\\ask{-1}", note: L("Spring $2$ naar rechts.", "Jump $2$ to the right.") },
        ],
      },
    },
  ],
  practice: [
    { generatorId: "u1.add-subtract", difficulty: 1, count: 1 },
    { generatorId: "u1.add-subtract", difficulty: 2, count: 4 },
    { generatorId: "u1.add-subtract", difficulty: 3, count: 3 },
  ],
};
