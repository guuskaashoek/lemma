/**
 * Lessons 6 and 7: the abc-formule with the discriminant, and the number
 * of solutions (D > 0, D = 0, D < 0).
 */
import type { Lesson } from "@/content/types";
import { parabolaVisual } from "../gen/abc";
import { L } from "../helpers";

export const abcLesson: Lesson = {
  id: "u4.abc",
  title: L("De abc-formule", "The quadratic formula"),
  goal: L(
    "Je lost elke vergelijking $ax^{2}+bx+c=0$ op met de abc-formule, ook als product-som niet lukt.",
    "You solve any equation $ax^{2}+bx+c=0$ with the quadratic formula, even when product-sum does not work.",
  ),
  minutes: 10,
  calculator: "allowed",
  info: {
    what: L(
      "Een vaste formule die altijd werkt voor $ax^{2}+bx+c=0$. Eerst bereken je de discriminant $D$.",
      "A fixed formula that always works for $ax^{2}+bx+c=0$. First you work out the discriminant $D$.",
    ),
    why: L(
      "Product-som werkt alleen bij mooie getallen. Bij $x^{2}-4x+1=0$ vind je geen paar. De abc-formule lukt altijd.",
      "Product-sum only works with tidy numbers. For $x^{2}-4x+1=0$ there is no pair. The quadratic formula always works.",
    ),
    later: L(
      "Overal waar $x^{2}$ voorkomt: natuurkunde, snijpunten, afgeleiden. Computers lossen zo ook vergelijkingen op, maar jij moet de uitkomst kunnen controleren.",
      "Everywhere $x^{2}$ shows up: physics, intersections, derivatives. Computers solve equations this way too, but you need to be able to check the result.",
    ),
  },
  screens: [
    {
      kind: "explain",
      title: L("Product-som lukt niet altijd", "Product-sum does not always work"),
      body: L(
        "Neem $x^{2}-4x+1=0$. Keer $1$, plus $-4$.\nGeen enkel paar hele getallen past.\nToch zijn er oplossingen. Daarvoor is de **abc-formule**.",
        "Take $x^{2}-4x+1=0$. Times $1$, plus $-4$.\nNo pair of whole numbers fits.\nStill there are solutions. That is what the **quadratic formula** is for.",
      ),
      latex: "x^{2}-4x+1=0",
    },
    {
      kind: "explain",
      title: L("Lees $a$, $b$ en $c$ af", "Read off $a$, $b$ and $c$"),
      body: L(
        "Schrijf eerst de vorm $ax^{2}+bx+c=0$. Rechts moet $0$ staan.\nBij $2x^{2}-3x-2=0$ is $a=2$, $b=-3$ en $c=-2$.\nHet min-teken hoort bij het getal.",
        "First write the form $ax^{2}+bx+c=0$. There must be $0$ on the right.\nIn $2x^{2}-3x-2=0$, $a=2$, $b=-3$ and $c=-2$.\nThe minus sign belongs to the number.",
      ),
      latex: "ax^{2}+bx+c=0",
    },
    {
      kind: "example",
      title: L("Stap 1: de discriminant", "Step 1: the discriminant"),
      problem: L(
        "Bereken $D=b^{2}-4ac$ voor $2x^{2}-3x-2=0$. Zet negatieve getallen tussen haakjes.",
        "Work out $D=b^{2}-4ac$ for $2x^{2}-3x-2=0$. Put negative numbers in brackets.",
      ),
      solution: {
        steps: [
          { latex: "(-3)^{2}-4\\cdot 2\\cdot (-2)", note: L("Vul in: $a=2$, $b=-3$, $c=-2$.", "Fill in: $a=2$, $b=-3$, $c=-2$.") },
          { latex: "\\ask{9}-4\\cdot 2\\cdot (-2)", note: L("Een kwadraat is nooit negatief.", "A square is never negative.") },
          { latex: "9-\\ask{(-16)}", note: L("$4\\cdot 2\\cdot(-2)=-16$.", "$4\\cdot 2\\cdot(-2)=-16$.") },
          { latex: "\\ask{25}", note: L("Min keer min is plus: $9+16=25$.", "Minus times minus is plus: $9+16=25$.") },
        ],
      },
    },
    {
      kind: "visual",
      title: L("Twee gelijke stappen", "Two equal steps"),
      body: L(
        "De oplossingen liggen even ver links en rechts van de as $x=-\\frac{b}{2a}$.\nDe stap is $\\frac{\\sqrt{D}}{2a}$.\nDaarom staat er $\\pm$ in de formule: één keer plus, één keer min.",
        "The solutions lie equally far left and right of the axis $x=-\\frac{b}{2a}$.\nThe step is $\\frac{\\sqrt{D}}{2a}$.\nThat is why the formula has $\\pm$: once plus, once minus.",
      ),
      visual: parabolaVisual(2, -3, -2, ["axis", "zeros", "abc"]),
      task: L("Kijk waar de grafiek de $x$-as snijdt. Zijn beide stappen even groot?", "Look where the graph crosses the $x$-axis. Are both steps the same size?"),
    },
    {
      kind: "explain",
      title: L("De abc-formule", "The quadratic formula"),
      body: L(
        "Eerst $D=b^{2}-4ac$.\nDan $x=\\frac{-b+\\sqrt{D}}{2a}$ of $x=\\frac{-b-\\sqrt{D}}{2a}$.\nLet op: bovenin staat $-b$. De hele bovenkant gaat door $2a$.\nZie [[rule:u4.abc-formula]] en [[rule:u4.discriminant]].",
        "First $D=b^{2}-4ac$.\nThen $x=\\frac{-b+\\sqrt{D}}{2a}$ or $x=\\frac{-b-\\sqrt{D}}{2a}$.\nCareful: the top has $-b$. The whole top is divided by $2a$.\nSee [[rule:u4.abc-formula]] and [[rule:u4.discriminant]].",
      ),
      latex: "x=\\frac{-b\\pm\\sqrt{D}}{2a}",
      ruleId: "u4.abc-formula",
    },
    {
      kind: "example",
      title: L("Voorbeeld: $2x^{2}-3x-2=0$", "Example: $2x^{2}-3x-2=0$"),
      problem: L(
        "Los op: $2x^{2}-3x-2=0$. Je weet al: $D=25$.",
        "Solve: $2x^{2}-3x-2=0$. You already know: $D=25$.",
      ),
      visual: parabolaVisual(2, -3, -2, ["axis", "zeros"]),
      solution: {
        steps: [
          { latex: "2x^{2}-3x-2=0", note: L("$a=2$, $b=-3$, $c=-2$ en $D=25$.", "$a=2$, $b=-3$, $c=-2$ and $D=25$.") },
          { latex: "x=\\frac{3+\\sqrt{25}}{\\ask{4}}\\lor x=\\frac{3-\\sqrt{25}}{4}", note: L("$-b=3$ en $2a=4$.", "$-b=3$ and $2a=4$.") },
          { latex: "x=\\frac{3+\\ask{5}}{4}\\lor x=\\frac{3-5}{4}", note: L("$\\sqrt{25}=5$.", "$\\sqrt{25}=5$.") },
          { latex: "x=\\ask{2}\\lor x=\\frac{3-5}{4}", note: L("$\\frac{8}{4}=2$.", "$\\frac{8}{4}=2$.") },
          { latex: "x=2\\lor x=\\ask{-\\frac{1}{2}}", note: L("$\\frac{-2}{4}=-\\frac{1}{2}$.", "$\\frac{-2}{4}=-\\frac{1}{2}$.") },
        ],
        solutions: [{ x: 2 }, { x: -0.5 }],
      },
    },
    {
      kind: "example",
      title: L("Voorbeeld: afronden", "Example: rounding"),
      problem: L(
        "Los op: $x^{2}-4x+1=0$. Rond af op $2$ decimalen.",
        "Solve: $x^{2}-4x+1=0$. Round to $2$ decimals.",
      ),
      visual: parabolaVisual(1, -4, 1, ["axis", "zeros"]),
      solution: {
        steps: [
          { latex: "x^{2}-4x+1=0", note: L("$a=1$, $b=-4$, $c=1$. $D=16-4=12$.", "$a=1$, $b=-4$, $c=1$. $D=16-4=12$.") },
          {
            latex: "x=\\frac{4+\\sqrt{\\ask{12}}}{2}\\lor x=\\frac{4-\\sqrt{12}}{2}",
            note: L(
              "$\\sqrt{12}$ komt niet mooi uit. Met de rekenmachine: $x\\approx 3{,}73$ of $x\\approx 0{,}27$.",
              "$\\sqrt{12}$ is not a whole number. With the calculator: $x\\approx 3.73$ or $x\\approx 0.27$.",
            ),
          },
        ],
        solutions: [{ x: 2 + Math.sqrt(3) }, { x: 2 - Math.sqrt(3) }],
      },
    },
  ],
  practice: [
    { generatorId: "u4.discriminant", difficulty: 1, count: 2 },
    { generatorId: "u4.abc", difficulty: 1, count: 2 },
    { generatorId: "u4.discriminant", difficulty: 2, count: 1 },
    { generatorId: "u4.abc", difficulty: 2, count: 2 },
    { generatorId: "u4.abc", difficulty: 3, count: 1 },
  ],
};

export const discriminantLesson: Lesson = {
  id: "u4.discriminant",
  title: L("Hoeveel oplossingen?", "How many solutions?"),
  goal: L(
    "Je ziet aan $D$ of een vergelijking twee, één of geen oplossingen heeft.",
    "You can tell from $D$ whether an equation has two, one or no solutions.",
  ),
  minutes: 8,
  calculator: "off",
  calculatorOffReason: L(
    "De rekenmachine staat uit. Je hoeft alleen te zien of $D$ positief, nul of negatief is.",
    "The calculator is off. You only need to see whether $D$ is positive, zero or negative.",
  ),
  info: {
    what: L(
      "De discriminant $D=b^{2}-4ac$ vertelt hoeveel oplossingen er zijn, nog vóór je ze uitrekent.",
      "The discriminant $D=b^{2}-4ac$ tells you how many solutions there are, before you work them out.",
    ),
    why: L(
      "Zo weet je snel of rekenen zin heeft. En je kunt een getal $p$ zo kiezen dat er precies één oplossing is.",
      "That way you know quickly whether calculating makes sense. And you can choose a number $p$ so that there is exactly one solution.",
    ),
    later: L(
      "Bij raaklijnen, bij snijpunten van grafieken en bij vergelijkingen met een onbekende $p$.",
      "With tangent lines, where graphs meet and in equations with an unknown $p$.",
    ),
  },
  screens: [
    {
      kind: "visual",
      title: L("Schuif de parabool", "Slide the parabola"),
      body: L(
        "Dit is $y=x^{2}-4x+3$. De oplossingen van $x^{2}-4x+3=0$ zijn de punten op de $x$-as.\nMet de knoppen schuif je de parabool omhoog en omlaag.",
        "This is $y=x^{2}-4x+3$. The solutions of $x^{2}-4x+3=0$ are the points on the $x$-axis.\nThe buttons slide the parabola up and down.",
      ),
      visual: parabolaVisual(1, -4, 3, ["zeros", "d"], ["c"]),
      task: L(
        "Maak $c$ groter. Wanneer raakt de parabool de $x$-as? Wat is $D$ dan?",
        "Make $c$ bigger. When does the parabola touch the $x$-axis? What is $D$ then?",
      ),
    },
    {
      kind: "explain",
      title: L("Twee, één of geen", "Two, one or none"),
      body: L(
        "$D>0$: twee oplossingen. De parabool snijdt de $x$-as twee keer.\n$D=0$: één oplossing. De parabool raakt de $x$-as.\n$D<0$: geen oplossing. De parabool mist de $x$-as. Je kunt geen wortel nemen van een negatief getal.\nZie [[rule:u4.solution-count]].",
        "$D>0$: two solutions. The parabola crosses the $x$-axis twice.\n$D=0$: one solution. The parabola touches the $x$-axis.\n$D<0$: no solution. The parabola misses the $x$-axis. You cannot take the root of a negative number.\nSee [[rule:u4.solution-count]].",
      ),
      latex: "D>0:\\ 2\\qquad D=0:\\ 1\\qquad D<0:\\ 0",
      ruleId: "u4.solution-count",
    },
    {
      kind: "example",
      title: L("Voorbeeld: $x^{2}+2x+5=0$", "Example: $x^{2}+2x+5=0$"),
      problem: L("Hoeveel oplossingen heeft $x^{2}+2x+5=0$?", "How many solutions does $x^{2}+2x+5=0$ have?"),
      visual: parabolaVisual(1, 2, 5, ["zeros", "d"]),
      solution: {
        steps: [
          { latex: "2^{2}-4\\cdot 1\\cdot 5", note: L("$a=1$, $b=2$, $c=5$. Vul in: $b^{2}-4ac$.", "$a=1$, $b=2$, $c=5$. Fill in: $b^{2}-4ac$.") },
          { latex: "4-\\ask{20}", note: L("$4\\cdot 1\\cdot 5=20$.", "$4\\cdot 1\\cdot 5=20$.") },
          { latex: "\\ask{-16}", note: L("$D<0$: geen oplossing.", "$D<0$: no solution.") },
        ],
      },
    },
    {
      kind: "explain",
      title: L("Een onbekend getal $p$", "An unknown number $p$"),
      body: L(
        "Soms staat er een letter $p$ in de vergelijking.\nVraag: voor welke $p$ is er precies één oplossing?\nDan moet $D=0$. Dat is een vergelijking met $p$. Die los je op met de balans.",
        "Sometimes there is a letter $p$ in the equation.\nQuestion: for which $p$ is there exactly one solution?\nThen $D=0$. That is an equation in $p$. You solve it with the balance.",
      ),
      metaphor: "balance",
    },
    {
      kind: "example",
      title: L("Voorbeeld: $x^{2}+6x+p=0$", "Example: $x^{2}+6x+p=0$"),
      problem: L(
        "Voor welke $p$ heeft $x^{2}+6x+p=0$ precies één oplossing?",
        "For which $p$ does $x^{2}+6x+p=0$ have exactly one solution?",
      ),
      visual: parabolaVisual(1, 6, 0, ["zeros"], ["c"]),
      solution: {
        steps: [
          { latex: "6^{2}-4\\cdot 1\\cdot p=0", note: L("$a=1$, $b=6$, $c=p$. Eén oplossing: $D=0$.", "$a=1$, $b=6$, $c=p$. One solution: $D=0$.") },
          { latex: "\\ask{36}-4p=0", note: L("$6^{2}=36$.", "$6^{2}=36$.") },
          { latex: "36=\\ask{4p}", note: L("Tel aan beide kanten $4p$ op.", "Add $4p$ on both sides.") },
          { latex: "p=\\ask{9}", note: L("Deel door $4$. Check: $x^{2}+6x+9=(x+3)^{2}$.", "Divide by $4$. Check: $x^{2}+6x+9=(x+3)^{2}$.") },
        ],
        solutions: [{ p: 9 }],
      },
    },
  ],
  practice: [
    { generatorId: "u4.solution-count", difficulty: 1, count: 2 },
    { generatorId: "u4.solution-count", difficulty: 2, count: 2 },
    { generatorId: "u4.one-solution", difficulty: 1, count: 2 },
    { generatorId: "u4.solution-count", difficulty: 3, count: 1 },
    { generatorId: "u4.one-solution", difficulty: 2, count: 1 },
    { generatorId: "u4.one-solution", difficulty: 3, count: 1 },
  ],
};
