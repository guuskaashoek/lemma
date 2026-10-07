/**
 * Lessons 3 and 4: factorising x² + bx + c with the product-sum method
 * (product-som methode), and solving x² + bx + c = 0 with it.
 */
import type { Lesson } from "@/content/types";
import { tilesVisual } from "../gen/product-sum";
import { zeroProductVisual } from "../gen/zero-product";
import { L } from "../helpers";

export const productSumLesson: Lesson = {
  id: "u4.product-sum",
  title: L("Ontbinden met product-som", "Factorising with product-sum"),
  goal: L(
    "Je schrijft $x^{2}+5x+6$ als $(x+2)(x+3)$.",
    "You write $x^{2}+5x+6$ as $(x+2)(x+3)$.",
  ),
  minutes: 10,
  calculator: "off",
  calculatorOffReason: L(
    "De rekenmachine staat uit. Je zoekt getallen met de tafels in je hoofd.",
    "The calculator is off. You look for numbers with the times tables in your head.",
  ),
  info: {
    what: L(
      "Een manier om $x^{2}+bx+c$ te ontbinden: zoek twee getallen met het goede product en de goede som.",
      "A way to factorise $x^{2}+bx+c$: find two numbers with the right product and the right sum.",
    ),
    why: L(
      "Zo los je veel vergelijkingen met $x^{2}$ snel op, zonder rekenmachine.",
      "This way you solve many equations with $x^{2}$ quickly, without a calculator.",
    ),
    later: L(
      "Bij breuken met $x$, bij snijpunten van grafieken en bij integralen. Puzzelen met product en som komt vaak terug.",
      "In fractions with $x$, where graphs meet and in integrals. Puzzling with product and sum comes back often.",
    ),
  },
  screens: [
    {
      kind: "visual",
      title: L("Eerst vooruit", "Forwards first"),
      body: L(
        "Werk $(x+2)(x+3)$ weg met de rechthoek.\nDe vakken zijn $x^{2}$, $3x$, $2x$ en $6$.\nSamen: $x^{2}+5x+6$.",
        "Expand $(x+2)(x+3)$ with the rectangle.\nThe boxes are $x^{2}$, $3x$, $2x$ and $6$.\nTogether: $x^{2}+5x+6$.",
      ),
      visual: { kind: "area-model", rows: ["x", "2"], cols: ["x", "3"], reveal: "step" },
      task: L(
        "Klik door de vakken. Waar komt de $5$ vandaan? En de $6$?",
        "Click through the boxes. Where does the $5$ come from? And the $6$?",
      ),
    },
    {
      kind: "explain",
      title: L("Zie je het patroon?", "Do you see the pattern?"),
      body: L(
        "In $(x+2)(x+3)$ staan de getallen $2$ en $3$.\nOpgeteld: $2+3=5$. Dat staat voor de $x$.\nKeer elkaar: $2\\cdot 3=6$. Dat is het losse getal.",
        "In $(x+2)(x+3)$ you see the numbers $2$ and $3$.\nAdded: $2+3=5$. That is in front of the $x$.\nMultiplied: $2\\cdot 3=6$. That is the number on its own.",
      ),
      latex: "x^{2}+\\hl{5}x+\\hl{6}=(x+2)(x+3)",
    },
    {
      kind: "visual",
      title: L("Tegels leggen", "Laying tiles"),
      body: L(
        "Hier is $x^{2}+7x+12$ als tegels: een groot vierkant, $7$ strookjes en $12$ blokjes.\nVerdeel de strookjes over twee kanten.\nPast het hoekje precies met $12$ blokjes? Dan is de rechthoek dicht.",
        "Here is $x^{2}+7x+12$ as tiles: a big square, $7$ strips and $12$ small blocks.\nSplit the strips over two sides.\nDoes the corner fit exactly with $12$ blocks? Then the rectangle is closed.",
      ),
      visual: tilesVisual(7, 12),
      task: L(
        "Probeer $1$ en $6$ strookjes. Dan $2$ en $5$. Dan $3$ en $4$. Welke past?",
        "Try $1$ and $6$ strips. Then $2$ and $5$. Then $3$ and $4$. Which one fits?",
      ),
    },
    {
      kind: "example",
      title: L("Voorbeeld: $x^{2}+7x+12$", "Example: $x^{2}+7x+12$"),
      problem: L(
        "Ontbind: $x^{2}+7x+12$. Zoek twee getallen: keer elkaar $12$, opgeteld $7$.",
        "Factorise: $x^{2}+7x+12$. Find two numbers: multiplied $12$, added $7$.",
      ),
      visual: { kind: "area-model", rows: ["x", "3"], cols: ["x", "4"], reveal: "all" },
      solution: {
        steps: [
          { latex: "x^{2}+7x+12", note: L("Paren voor $12$: $1\\cdot 12$, $2\\cdot 6$, $3\\cdot 4$. Alleen $3+4=7$.", "Pairs for $12$: $1\\cdot 12$, $2\\cdot 6$, $3\\cdot 4$. Only $3+4=7$.") },
          { latex: "(x+3)(\\ask{x+4})", note: L("De getallen zijn $3$ en $4$. Zet ze in de haakjes.", "The numbers are $3$ and $4$. Put them in the brackets.") },
        ],
      },
    },
    {
      kind: "explain",
      title: L("Min-tekens", "Minus signs"),
      body: L(
        "Het product is **negatief**? Dan is één getal negatief en één positief.\nHet product is positief, maar de som negatief? Dan zijn beide getallen negatief.\nTip: $(-3)\\cdot 5=-15$ en $-3+5=2$.",
        "The product is **negative**? Then one number is negative and one is positive.\nThe product is positive but the sum is negative? Then both numbers are negative.\nTip: $(-3)\\cdot 5=-15$ and $-3+5=2$.",
      ),
    },
    {
      kind: "example",
      title: L("Voorbeeld: $x^{2}-2x-15$", "Example: $x^{2}-2x-15$"),
      problem: L(
        "Ontbind: $x^{2}-2x-15$. Keer elkaar $-15$, opgeteld $-2$.",
        "Factorise: $x^{2}-2x-15$. Multiplied $-15$, added $-2$.",
      ),
      visual: tilesVisual(-2, -15),
      solution: {
        steps: [
          { latex: "x^{2}-2x-15", note: L("Het product is negatief: één getal is negatief. $3\\cdot(-5)=-15$ en $3+(-5)=-2$.", "The product is negative: one number is negative. $3\\cdot(-5)=-15$ and $3+(-5)=-2$.") },
          { latex: "(x+3)(\\ask{x-5})", note: L("De getallen zijn $3$ en $-5$.", "The numbers are $3$ and $-5$.") },
        ],
      },
    },
    {
      kind: "example",
      title: L("Voorbeeld: eerst buiten haakjes", "Example: common factor first"),
      problem: L(
        "Ontbind: $2x^{2}+10x+12$. Er staat geen $1x^{2}$. Haal eerst $2$ buiten haakjes.",
        "Factorise: $2x^{2}+10x+12$. It does not start with $1x^{2}$. Take out $2$ first.",
      ),
      solution: {
        steps: [
          { latex: "2x^{2}+10x+12", note: L("Alle getallen zitten in de tafel van $2$.", "All numbers are in the $2$ times table.") },
          { latex: "\\hl{2}(\\ask{x^{2}+5x+6})", note: L("Deel elke term door $2$.", "Divide every term by $2$.") },
          { latex: "2(x+2)(\\ask{x+3})", note: L("Keer $6$, plus $5$: dat zijn $2$ en $3$.", "Times $6$, plus $5$: that is $2$ and $3$.") },
        ],
      },
    },
    {
      kind: "explain",
      title: L("Product-som", "Product-sum"),
      body: L(
        "Zoek twee getallen. Keer elkaar geeft het losse getal. Opgeteld geeft het getal voor $x$.\nBegin met keer: daar zijn minder paren.\nControleer door de haakjes weg te werken.\nZie [[rule:u4.product-sum]].",
        "Find two numbers. Multiplied they give the number on its own. Added they give the number in front of $x$.\nStart with times: there are fewer pairs.\nCheck by expanding the brackets.\nSee [[rule:u4.product-sum]].",
      ),
      latex: "x^{2}+bx+c=(x+p)(x+q)",
      ruleId: "u4.product-sum",
    },
  ],
  practice: [
    { generatorId: "u4.product-sum", difficulty: 1, count: 3 },
    { generatorId: "u4.product-sum", difficulty: 2, count: 3 },
    { generatorId: "u4.product-sum", difficulty: 3, count: 2 },
  ],
};

export const productSumSolveLesson: Lesson = {
  id: "u4.product-sum-solve",
  title: L("Oplossen met product-som", "Solving with product-sum"),
  goal: L(
    "Je lost $x^{2}-6x+8=0$ op: eerst ontbinden, dan elke factor nul.",
    "You solve $x^{2}-6x+8=0$: first factorise, then make each factor zero.",
  ),
  minutes: 8,
  calculator: "off",
  calculatorOffReason: L(
    "De rekenmachine staat uit. Product-som doe je met de hand.",
    "The calculator is off. You do product-sum by hand.",
  ),
  info: {
    what: L(
      "Een vergelijking met $x^{2}$ oplossen in drie stappen: rechts $0$, ontbinden, elke factor nul.",
      "Solving an equation with $x^{2}$ in three steps: $0$ on the right, factorise, each factor zero.",
    ),
    why: L(
      "Dit is de snelste manier als de getallen mooi zijn. Lukt het niet? Dan komt straks de abc-formule.",
      "This is the fastest way when the numbers are tidy. Does it not work? Then the quadratic formula comes later.",
    ),
    later: L(
      "Bij snijpunten van een parabool met de $x$-as, en bij de top en de afgeleide.",
      "For where a parabola meets the $x$-axis, and with the vertex and the derivative.",
    ),
  },
  screens: [
    {
      kind: "explain",
      title: L("Twee lessen samen", "Two lessons together"),
      body: L(
        "Je kunt al ontbinden met product-som.\nJe weet al: is een product nul, dan is een factor nul.\nSamen lossen ze $x^{2}-6x+8=0$ op.",
        "You can already factorise with product-sum.\nYou already know: if a product is zero, a factor is zero.\nTogether they solve $x^{2}-6x+8=0$.",
      ),
      latex: "x^{2}-6x+8=0",
    },
    {
      kind: "visual",
      title: L("Bekijk het product", "Look at the product"),
      body: L(
        "$x^{2}-6x+8$ is hetzelfde als $(x-2)(x-4)$.\nSchuif $x$ en kijk wanneer het product nul is.",
        "$x^{2}-6x+8$ is the same as $(x-2)(x-4)$.\nSlide $x$ and watch when the product is zero.",
      ),
      visual: zeroProductVisual(
        [
          [1, -2],
          [1, -4],
        ],
        1,
        1,
      ),
      task: L("Vind de twee plekken waar het product nul is.", "Find the two places where the product is zero."),
    },
    {
      kind: "example",
      title: L("Voorbeeld: $x^{2}-6x+8=0$", "Example: $x^{2}-6x+8=0$"),
      problem: L("Los op: $x^{2}-6x+8=0$.", "Solve: $x^{2}-6x+8=0$."),
      solution: {
        steps: [
          { latex: "x^{2}-6x+8=0", note: L("Rechts staat al $0$. Keer $8$, plus $-6$: dat zijn $-2$ en $-4$.", "There is already $0$ on the right. Times $8$, plus $-6$: that is $-2$ and $-4$.") },
          { latex: "(x-2)(\\ask{x-4})=0", note: L("Ontbind de linkerkant.", "Factorise the left side.") },
          { latex: "x-2=0\\lor x-4=0", note: L("Product is nul: maak elke factor nul.", "Product is zero: make each factor zero.") },
          { latex: "x=\\ask{2}\\lor x-4=0", note: L("Welk getal maakt $x-2$ nul?", "Which number makes $x-2$ zero?") },
          { latex: "x=2\\lor x=\\ask{4}", note: L("Welk getal maakt $x-4$ nul?", "Which number makes $x-4$ zero?") },
        ],
        solutions: [{ x: 2 }, { x: 4 }],
      },
    },
    {
      kind: "explain",
      title: L("Eerst rechts nul", "Zero on the right first"),
      body: L(
        "Staat er $x^{2}-x=6$? Dan helpt ontbinden niet direct.\n$A\\cdot B=6$ zegt niets over $A$ of $B$.\nAlleen bij nul weet je zeker dat een factor nul is.\nBreng dus eerst alles naar links.",
        "Does it say $x^{2}-x=6$? Then factorising does not help yet.\n$A\\cdot B=6$ tells you nothing about $A$ or $B$.\nOnly with zero do you know for sure a factor is zero.\nSo first move everything to the left.",
      ),
    },
    {
      kind: "example",
      title: L("Voorbeeld: $x^{2}=3x+10$", "Example: $x^{2}=3x+10$"),
      problem: L("Los op: $x^{2}=3x+10$.", "Solve: $x^{2}=3x+10$."),
      solution: {
        steps: [
          { latex: "x^{2}=3x+10", note: L("Rechts staat geen $0$.", "There is no $0$ on the right.") },
          { latex: "\\ask{x^{2}-3x-10}=0", note: L("Haal aan beide kanten $3x$ en $10$ weg.", "Subtract $3x$ and $10$ on both sides.") },
          { latex: "(x+2)(\\ask{x-5})=0", note: L("Keer $-10$, plus $-3$: dat zijn $2$ en $-5$.", "Times $-10$, plus $-3$: that is $2$ and $-5$.") },
          { latex: "x+2=0\\lor x-5=0", note: L("Maak elke factor nul.", "Make each factor zero.") },
          { latex: "x=\\ask{-2}\\lor x-5=0", note: L("Let op: $x+2=0$ geeft $x=-2$.", "Careful: $x+2=0$ gives $x=-2$.") },
          { latex: "x=-2\\lor x=\\ask{5}", note: L("Welk getal maakt $x-5$ nul?", "Which number makes $x-5$ zero?") },
        ],
        solutions: [{ x: -2 }, { x: 5 }],
      },
    },
    {
      kind: "explain",
      title: L("Andere vormen", "Other forms"),
      body: L(
        "Staat er $2x^{2}-12x+16=0$? Deel eerst beide kanten door $2$: $x^{2}-6x+8=0$.\nStaat er $x(x+3)=10$? Werk eerst de haakjes weg: $x^{2}+3x=10$. Breng dan $10$ naar links.\nDaarna gaat het zoals altijd.",
        "Does it say $2x^{2}-12x+16=0$? First divide both sides by $2$: $x^{2}-6x+8=0$.\nDoes it say $x(x+3)=10$? First expand the brackets: $x^{2}+3x=10$. Then move $10$ to the left.\nAfter that it works as always.",
      ),
      metaphor: "balance",
    },
    {
      kind: "explain",
      title: L("Het stappenplan", "The plan"),
      body: L(
        "1. Zorg dat rechts $0$ staat.\n2. Ontbind met product-som. Zie [[rule:u4.product-sum]].\n3. Maak elke factor nul. Zie [[rule:u4.zero-product]].\n4. Controleer: vul je antwoorden in.",
        "1. Make sure there is $0$ on the right.\n2. Factorise with product-sum. See [[rule:u4.product-sum]].\n3. Make each factor zero. See [[rule:u4.zero-product]].\n4. Check: put your answers back in.",
      ),
      ruleId: "u4.product-sum",
    },
  ],
  practice: [
    { generatorId: "u4.product-sum-solve", difficulty: 1, count: 3 },
    { generatorId: "u4.product-sum-solve", difficulty: 2, count: 3 },
    { generatorId: "u4.product-sum-solve", difficulty: 3, count: 2 },
  ],
};
