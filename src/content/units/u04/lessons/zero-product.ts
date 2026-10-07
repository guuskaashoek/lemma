/**
 * Lesson 2: a product is zero (A · B = 0 gives A = 0 or B = 0), and
 * equations like x² = 25 with two solutions.
 */
import type { Lesson } from "@/content/types";
import { zeroProductVisual } from "../gen/zero-product";
import { L } from "../helpers";

export const zeroProductLesson: Lesson = {
  id: "u4.zero-product",
  title: L("Product is nul", "Product is zero"),
  goal: L(
    "Je lost $(x-3)(x+5)=0$ en $x^{2}=25$ op, en je vindt beide oplossingen.",
    "You solve $(x-3)(x+5)=0$ and $x^{2}=25$, and you find both solutions.",
  ),
  minutes: 9,
  calculator: "off",
  calculatorOffReason: L(
    "De rekenmachine staat uit. Je leert hier een denkstap, geen rekensom.",
    "The calculator is off. Here you learn a way of thinking, not a calculation.",
  ),
  info: {
    what: L(
      "Een vergelijking met $x^{2}$ heeft vaak twee oplossingen. Hier leer je ze allebei te vinden.",
      "An equation with $x^{2}$ often has two solutions. Here you learn to find both of them.",
    ),
    why: L(
      "Met de balans alleen kom je bij $x^{2}$ niet verder. Een product dat nul is, maakt het makkelijk.",
      "With the balance alone you get stuck at $x^{2}$. A product that is zero makes it easy.",
    ),
    later: L(
      "In elke les hierna: product-som, de abc-formule en snijpunten van grafieken. Ook bij het zoeken naar het laagste punt van een functie, zoals in AI.",
      "In every lesson after this: product-sum, the quadratic formula and where graphs meet. Also when looking for the lowest point of a function, like in AI.",
    ),
  },
  screens: [
    {
      kind: "explain",
      title: L("Keer nul is nul", "Times zero is zero"),
      body: L(
        "$7\\cdot 0=0$ en $0\\cdot 7=0$.\nAndersom geldt het ook. Is een keersom nul? Dan is minstens één van de getallen nul.\nDat is het hele idee van deze les.",
        "$7\\cdot 0=0$ and $0\\cdot 7=0$.\nIt also works the other way. Is a product zero? Then at least one of the numbers is zero.\nThat is the whole idea of this lesson.",
      ),
    },
    {
      kind: "visual",
      title: L("Wanneer is het product nul?", "When is the product zero?"),
      body: L(
        "Hier zie je $x-3$, $x+5$ en hun product als staven.\nSchuif $x$ heen en weer.",
        "Here you see $x-3$, $x+5$ and their product as bars.\nSlide $x$ back and forth.",
      ),
      visual: zeroProductVisual(
        [
          [1, -3],
          [1, 5],
        ],
        1,
        1,
      ),
      task: L(
        "Zoek alle $x$ waarbij de product-staaf verdwijnt. Welke staaf is dan nul?",
        "Find every $x$ where the product bar disappears. Which bar is zero then?",
      ),
    },
    {
      kind: "example",
      title: L("Voorbeeld: $(x-3)(x+5)=0$", "Example: $(x-3)(x+5)=0$"),
      problem: L("Los op: $(x-3)(x+5)=0$.", "Solve: $(x-3)(x+5)=0$."),
      solution: {
        steps: [
          { latex: "(x-3)(x+5)=0", note: L("Een product is nul.", "A product is zero.") },
          { latex: "x-3=0\\lor x+5=0", note: L("Maak elke factor apart nul. Het teken $\\lor$ betekent 'of'.", "Make each factor zero on its own. The sign $\\lor$ means 'or'.") },
          { latex: "x=\\ask{3}\\lor x+5=0", note: L("Welk getal maakt $x-3$ nul?", "Which number makes $x-3$ zero?") },
          { latex: "x=3\\lor x=\\ask{-5}", note: L("Welk getal maakt $x+5$ nul? Let op: dat is $-5$.", "Which number makes $x+5$ zero? Careful: that is $-5$.") },
        ],
        solutions: [{ x: 3 }, { x: -5 }],
      },
    },
    {
      kind: "example",
      title: L("Voorbeeld: $x^{2}-7x=0$", "Example: $x^{2}-7x=0$"),
      problem: L(
        "Los op: $x^{2}-7x=0$. Maak er eerst een product van, zoals in de vorige les.",
        "Solve: $x^{2}-7x=0$. First turn it into a product, like in the last lesson.",
      ),
      solution: {
        steps: [
          { latex: "x^{2}-7x=0", note: L("Beide termen hebben een $x$.", "Both terms have an $x$.") },
          { latex: "\\hl{x}(\\ask{x-7})=0", note: L("Haal $x$ buiten haakjes.", "Take $x$ out of the brackets.") },
          { latex: "x=0\\lor x-7=0", note: L("Product is nul: maak elke factor nul.", "Product is zero: make each factor zero.") },
          { latex: "x=0\\lor x=\\ask{7}", note: L("Vergeet $x=0$ niet. Dat is ook een oplossing.", "Do not forget $x=0$. That is a solution too.") },
        ],
        solutions: [{ x: 0 }, { x: 7 }],
      },
    },
    {
      kind: "explain",
      title: L("Product is nul", "Product is zero"),
      body: L(
        "Is $A\\cdot B=0$? Dan is $A=0$ of $B=0$.\nMaak elke factor apart nul. Zo vind je alle oplossingen.\nZie [[rule:u4.zero-product]].",
        "Is $A\\cdot B=0$? Then $A=0$ or $B=0$.\nMake each factor zero on its own. That gives every solution.\nSee [[rule:u4.zero-product]].",
      ),
      latex: "A\\cdot B=0\\ \\Rightarrow\\ A=0\\lor B=0",
      ruleId: "u4.zero-product",
    },
    {
      kind: "visual",
      title: L("Kwadraat is getal", "Square equals number"),
      body: L(
        "Bij $x^{2}=9$ zoek je de $x$ waar de parabool $y=x^{2}$ op hoogte $9$ is.\nDat gebeurt twee keer: links en rechts.",
        "For $x^{2}=9$ you look for the $x$ where the parabola $y=x^{2}$ is at height $9$.\nThat happens twice: left and right.",
      ),
      visual: {
        kind: "plane",
        x: [-5, 5],
        y: [-2, 14],
        graphs: [{ latex: "x^{2}" }, { latex: "9" }],
        tracer: { graph: 0, start: -4 },
      },
      task: L(
        "Sleep het punt over de parabool. Bij welke twee $x$ is de hoogte $9$?",
        "Drag the point along the parabola. At which two $x$ is the height $9$?",
      ),
    },
    {
      kind: "example",
      title: L("Voorbeeld: $x^{2}+7=16$", "Example: $x^{2}+7=16$"),
      problem: L("Los op: $x^{2}+7=16$.", "Solve: $x^{2}+7=16$."),
      solution: {
        steps: [
          { latex: "x^{2}+7=16", note: L("Zorg eerst dat $x^{2}$ alleen staat.", "First get $x^{2}$ on its own.") },
          { latex: "x^{2}=\\ask{9}", note: L("Haal aan beide kanten $7$ weg.", "Subtract $7$ on both sides.") },
          { latex: "x=\\ask{3}\\lor x=-3", note: L("$3\\cdot 3=9$ en ook $(-3)\\cdot(-3)=9$.", "$3\\cdot 3=9$ and also $(-3)\\cdot(-3)=9$.") },
        ],
        solutions: [{ x: 3 }, { x: -3 }],
      },
    },
    {
      kind: "explain",
      title: L("Twee, één of geen", "Two, one or none"),
      body: L(
        "$x^{2}=9$: twee oplossingen, $3$ en $-3$.\n$x^{2}=0$: één oplossing, $0$.\n$x^{2}=-9$: geen oplossing. Een kwadraat is nooit negatief.\nZie [[rule:u4.square-equation]].",
        "$x^{2}=9$: two solutions, $3$ and $-3$.\n$x^{2}=0$: one solution, $0$.\n$x^{2}=-9$: no solution. A square is never negative.\nSee [[rule:u4.square-equation]].",
      ),
      ruleId: "u4.square-equation",
    },
  ],
  practice: [
    { generatorId: "u4.zero-product", difficulty: 1, count: 2 },
    { generatorId: "u4.zero-product", difficulty: 2, count: 2 },
    { generatorId: "u4.square-equation", difficulty: 1, count: 2 },
    { generatorId: "u4.zero-product", difficulty: 3, count: 2 },
    { generatorId: "u4.square-equation", difficulty: 2, count: 1 },
    { generatorId: "u4.square-equation", difficulty: 3, count: 1 },
  ],
};
