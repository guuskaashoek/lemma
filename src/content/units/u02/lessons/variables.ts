/**
 * Lessons 1 and 2: letters are numbers (variabelen, invullen) and combining
 * like terms (gelijksoortige termen samennemen). Both use algebra tiles:
 * a long block is one x, a small block is one 1.
 */
import type { Lesson } from "@/content/types";
import { custom, L } from "../helpers";

export const BY_HAND = L("De rekenmachine staat uit. Dit leer je met de hand.", "The calculator is off. You learn this by hand.");

export const variablesLesson: Lesson = {
  id: "u2.variables",
  title: L("Letters zijn getallen", "Letters are numbers"),
  goal: L("Je vult een getal in voor een letter, zoals $3x+2$ met $x=4$.", "You fill in a number for a letter, like $3x+2$ with $x=4$."),
  minutes: 8,
  calculator: "off",
  calculatorOffReason: BY_HAND,
  info: {
    what: L(
      "Een variabele is een letter die voor een getal staat. Invullen: je zet het getal op de plek van de letter en rekent uit.",
      "A variable is a letter that stands for a number. Filling in: you put the number where the letter is and work it out.",
    ),
    why: L(
      "Formules zitten overal: prijzen, afstanden, je telefoonabonnement. Met invullen reken je ze uit.",
      "Formulas are everywhere: prices, distances, your phone plan. Filling in is how you work them out.",
    ),
    later: L(
      "In alle wiskunde hierna. Ook een AI-model is een formule met heel veel letters. De computer vult daar steeds getallen in.",
      "In all the maths after this. An AI model is also a formula with lots of letters. The computer keeps filling in numbers.",
    ),
  },
  screens: [
    {
      kind: "explain",
      title: L("Een letter is een doosje", "A letter is a box"),
      body: L(
        "Soms weet je een getal nog niet.\nDan schrijf je een letter, bijvoorbeeld $x$.\nZie $x$ als een doosje met een getal erin.",
        "Sometimes you do not know a number yet.\nThen you write a letter, for example $x$.\nThink of $x$ as a box with a number inside.",
      ),
    },
    {
      kind: "visual",
      title: L("$3x$ is drie doosjes", "$3x$ is three boxes"),
      body: L(
        "Een lang blok is één $x$.\n$3x$ betekent $x+x+x$: drie dezelfde blokken.\nDat is $3\\cdot x$.",
        "A long block is one $x$.\n$3x$ means $x+x+x$: three of the same block.\nThat is $3\\cdot x$.",
      ),
      visual: custom("u2.tiles", { terms: [[3, "x"]], mode: "value", x: 2 }, L("Drie $x$-blokken.", "Three $x$-blocks.")),
      task: L("Klik op $+$ en $-$. Wat gebeurt er met $3x$ als $x$ verandert?", "Click $+$ and $-$. What happens to $3x$ when $x$ changes?"),
    },
    {
      kind: "explain",
      title: L("Een onzichtbare keer", "An invisible times"),
      body: L(
        "Tussen een getal en een letter staat een onzichtbare keer.\n$3x$ is $3\\cdot x$.\nAls $x=4$, dan is $3x=12$. Niet $34$!",
        "Between a number and a letter there is an invisible times.\n$3x$ is $3\\cdot x$.\nIf $x=4$, then $3x=12$. Not $34$!",
      ),
    },
    {
      kind: "visual",
      title: L("Invullen met blokken", "Filling in with blocks"),
      body: L(
        "Hier staat $3x+2$: drie $x$-blokken en twee kleine blokjes.\nElk $x$-blok is evenveel waard.",
        "This is $3x+2$: three $x$-blocks and two small blocks.\nEvery $x$-block is worth the same.",
      ),
      visual: custom("u2.tiles", { terms: [[3, "x"], [2, "1"]], mode: "value", x: 1 }, L("Blokken voor $3x+2$.", "Blocks for $3x+2$.")),
      task: L("Zet $x$ op $4$. Hoeveel is $3x+2$? Probeer ook $x=0$ en $x=-2$.", "Set $x$ to $4$. What is $3x+2$? Also try $x=0$ and $x=-2$."),
    },
    {
      kind: "example",
      title: L("Voorbeeld: $3x+2$ met $x=4$", "Example: $3x+2$ with $x=4$"),
      problem: L("Bereken $3x+2$ als $x=4$.", "Work out $3x+2$ when $x=4$."),
      visual: custom("u2.tiles", { terms: [[3, "x"], [2, "1"]], mode: "value", x: 4 }, L("Blokken voor $3x+2$ met $x=4$.", "Blocks for $3x+2$ with $x=4$.")),
      solution: {
        steps: [
          { latex: "3\\cdot\\hl{4}+2", note: L("Vul in: op de plek van $x$ komt $4$.", "Fill in: $4$ goes where $x$ was.") },
          { latex: "\\ask{12}+2", note: L("Eerst keer, dan plus.", "Multiply first, then add.") },
          { latex: "\\ask{14}", note: L("Reken uit.", "Work it out.") },
        ],
      },
    },
    {
      kind: "explain",
      title: L("Negatieve getallen invullen", "Filling in negative numbers"),
      body: L(
        "Is het getal negatief? Zet het tussen haakjes.\n$2x$ met $x=-3$: $2\\cdot(-3)=-6$.\n$x^2$ met $x=-3$: $(-3)^2=9$.\nZie [[rule:u2.variable]].",
        "Is the number negative? Put it in brackets.\n$2x$ with $x=-3$: $2\\cdot(-3)=-6$.\n$x^2$ with $x=-3$: $(-3)^2=9$.\nSee [[rule:u2.variable]].",
      ),
      ruleId: "u2.variable",
    },
    {
      kind: "example",
      title: L("Voorbeeld: een min-getal", "Example: a negative number"),
      problem: L("Bereken $5-2x$ als $x=-3$.", "Work out $5-2x$ when $x=-3$."),
      solution: {
        steps: [
          { latex: "5-2\\cdot(\\hl{-3})", note: L("Vul in, met haakjes.", "Fill in, with brackets.") },
          { latex: "5-(\\ask{-6})", note: L("Eerst keer: $2\\cdot(-3)=-6$.", "Multiply first: $2\\cdot(-3)=-6$.") },
          { latex: "5+\\ask{6}", note: L("Min een min-getal is plus.", "Minus a negative number is plus.") },
          { latex: "\\ask{11}", note: L("Reken uit.", "Work it out.") },
        ],
      },
    },
    {
      kind: "example",
      title: L("Voorbeeld: twee letters", "Example: two letters"),
      problem: L("Bereken $2a+3b$ als $a=5$ en $b=-1$.", "Work out $2a+3b$ when $a=5$ and $b=-1$."),
      solution: {
        steps: [
          { latex: "2\\cdot\\hl{5}+3\\cdot(\\hl{-1})", note: L("Elke letter krijgt zijn eigen getal.", "Every letter gets its own number.") },
          { latex: "\\ask{10}+3\\cdot(-1)", note: L("$2\\cdot 5=10$.", "$2\\cdot 5=10$.") },
          { latex: "10-\\ask{3}", note: L("$3\\cdot(-1)=-3$.", "$3\\cdot(-1)=-3$.") },
          { latex: "\\ask{7}", note: L("Reken uit.", "Work it out.") },
        ],
      },
    },
  ],
  practice: [
    { generatorId: "u2.evaluate", difficulty: 1, count: 3 },
    { generatorId: "u2.evaluate", difficulty: 2, count: 3 },
    { generatorId: "u2.evaluate", difficulty: 3, count: 2 },
  ],
};

export const likeTermsLesson: Lesson = {
  id: "u2.like-terms",
  title: L("Gelijke termen samennemen", "Combining like terms"),
  goal: L("Je maakt een som als $3x+2+4x-5$ zo kort mogelijk.", "You make an expression like $3x+2+4x-5$ as short as possible."),
  minutes: 8,
  calculator: "off",
  calculatorOffReason: BY_HAND,
  info: {
    what: L(
      "Termen met $x$ tel je bij elkaar op. Losse getallen ook. Zo wordt een lange som kort.",
      "You add terms with $x$ together. Plain numbers too. That makes a long expression short.",
    ),
    why: L(
      "Met een korte formule reken je makkelijker. Bij vergelijkingen doe je dit bijna altijd.",
      "A short formula is easier to work with. You do this in almost every equation.",
    ),
    later: L(
      "Bij haakjes wegwerken, vergelijkingen en formules. Computers maken formules ook eerst zo kort mogelijk voordat ze rekenen.",
      "In expanding brackets, equations and formulas. Computers also make formulas as short as possible before they calculate.",
    ),
  },
  screens: [
    {
      kind: "visual",
      title: L("Sorteren als blokken", "Sorting like blocks"),
      body: L(
        "Hier liggen lange $x$-blokken en kleine blokjes door elkaar.\nLeg gelijke blokken bij elkaar. Dan kun je ze tellen.",
        "Long $x$-blocks and small blocks are mixed up here.\nPut the same blocks together. Then you can count them.",
      ),
      visual: custom("u2.tiles", { terms: [[2, "x"], [3, "1"], [4, "x"], [1, "1"]], mode: "combine" }, L("Blokken voor $2x+3+4x+1$.", "Blocks for $2x+3+4x+1$.")),
      task: L("Klik op Volgende stap. Hoeveel $x$-blokken en hoeveel kleine blokjes zijn het?", "Click Next step. How many $x$-blocks and how many small blocks are there?"),
    },
    {
      kind: "explain",
      title: L("Gelijke soorten", "Like terms"),
      body: L(
        "$x$-termen zijn één soort. Losse getallen zijn een andere soort.\n$2x+4x=6x$: zes $x$-blokken.\n$2x+3$ kun je níet korter maken. Dat zijn twee soorten.",
        "$x$-terms are one kind. Plain numbers are another kind.\n$2x+4x=6x$: six $x$-blocks.\n$2x+3$ cannot be made shorter. Those are two kinds.",
      ),
    },
    {
      kind: "visual",
      title: L("Min-blokken", "Minus blocks"),
      body: L(
        "Een gestippeld blok is een min-blok. Het haalt er één af.\nEen plus-blok en een min-blok samen zijn $0$.",
        "A dashed block is a minus block. It takes one away.\nA plus block and a minus block together make $0$.",
      ),
      visual: custom("u2.tiles", { terms: [[3, "x"], [2, "1"], [-1, "x"], [-5, "1"]], mode: "combine" }, L("Blokken voor $3x+2-x-5$.", "Blocks for $3x+2-x-5$.")),
      task: L("Klik door tot het eind. Welke blokken vallen weg? Wat blijft er over?", "Click through to the end. Which blocks disappear? What is left?"),
    },
    {
      kind: "explain",
      title: L("Het teken hoort erbij", "The sign belongs to the term"),
      body: L(
        "Het teken vóór een term hoort bij die term.\nIn $5x+3-2x$ is de term $-2x$, niet $2x$.\nNeem het teken altijd mee. Zie [[rule:u2.like-terms]].",
        "The sign in front of a term belongs to that term.\nIn $5x+3-2x$ the term is $-2x$, not $2x$.\nAlways take the sign along. See [[rule:u2.like-terms]].",
      ),
      ruleId: "u2.like-terms",
    },
    {
      kind: "example",
      title: L("Voorbeeld: $3x+2+4x-5$", "Example: $3x+2+4x-5$"),
      problem: L("Maak zo kort mogelijk: $3x+2+4x-5$.", "Make as short as possible: $3x+2+4x-5$."),
      visual: custom("u2.tiles", { terms: [[3, "x"], [2, "1"], [4, "x"], [-5, "1"]], mode: "combine" }, L("Blokken voor $3x+2+4x-5$.", "Blocks for $3x+2+4x-5$.")),
      solution: {
        steps: [
          { latex: "3x+2+4x-5", note: L("Dit is de som.", "This is the expression.") },
          { latex: "\\hl{3x+4x}+2-5", note: L("Zet de $x$-termen naast elkaar, en de getallen ook.", "Put the $x$-terms together, and the numbers too.") },
          { latex: "\\ask{7x}+2-5", note: L("$3x+4x=7x$.", "$3x+4x=7x$.") },
          { latex: "7x-\\ask{3}", note: L("$2-5=-3$.", "$2-5=-3$.") },
        ],
      },
    },
    {
      kind: "example",
      title: L("Voorbeeld: met minnen", "Example: with minus signs"),
      problem: L("Maak zo kort mogelijk: $x-4-3x+1$.", "Make as short as possible: $x-4-3x+1$."),
      solution: {
        steps: [
          { latex: "x-4-3x+1", note: L("Dit is de som.", "This is the expression.") },
          { latex: "\\hl{x-3x}-4+1", note: L("Gelijke soorten bij elkaar. De min van $-3x$ gaat mee.", "Like terms together. The minus of $-3x$ moves with it.") },
          { latex: "\\ask{-2x}-4+1", note: L("$1$ blok min $3$ blokken is $-2$ blokken.", "$1$ block minus $3$ blocks is $-2$ blocks.") },
          { latex: "-2x-\\ask{3}", note: L("$-4+1=-3$.", "$-4+1=-3$.") },
        ],
      },
    },
    {
      kind: "explain",
      title: L("$x+x$ is geen $x^2$", "$x+x$ is not $x^2$"),
      body: L(
        "Let op: $x+x=2x$. Twee blokken naast elkaar.\n$x\\cdot x=x^2$ is iets anders: een vierkant.\nDat zie je in de volgende les.",
        "Careful: $x+x=2x$. Two blocks side by side.\n$x\\cdot x=x^2$ is something else: a square.\nYou will see that in the next lesson.",
      ),
    },
  ],
  practice: [
    { generatorId: "u2.like-terms", difficulty: 1, count: 3 },
    { generatorId: "u2.like-terms", difficulty: 2, count: 3 },
    { generatorId: "u2.like-terms", difficulty: 3, count: 2 },
  ],
};
