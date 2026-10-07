/**
 * Lessons 3 and 4: expanding brackets. First as a rectangle cut into parts
 * (area model), then as arrows from term to term (papegaaienbek).
 */
import type { Lesson } from "@/content/types";
import { custom, L } from "../helpers";
import { BY_HAND } from "./variables";

const arrows = (left: Array<[number, number]>, right: Array<[number, number]>, what: string) =>
  custom("u2.arrows", { left, right }, L(`Pijlen voor $${what}$.`, `Arrows for $${what}$.`));

export const expandLesson: Lesson = {
  id: "u2.expand",
  title: L("Haakjes wegwerken", "Expanding brackets"),
  goal: L("Je werkt haakjes weg, zoals $3(x+4)=3x+12$.", "You expand brackets, like $3(x+4)=3x+12$."),
  minutes: 9,
  calculator: "off",
  calculatorOffReason: BY_HAND,
  info: {
    what: L(
      "Haakjes wegwerken: het getal voor de haakjes gaat keer alles tussen de haakjes.",
      "Expanding brackets: the number in front of the brackets multiplies everything inside.",
    ),
    why: L(
      "Zonder haakjes kun je termen samennemen en vergelijkingen oplossen.",
      "Without brackets you can combine terms and solve equations.",
    ),
    later: L(
      "Bij vergelijkingen, ontbinden in factoren en de abc-formule. Computers in AI rekenen ook zo: elk stuk keer elk stuk.",
      "In equations, factorising and the quadratic formula. Computers in AI calculate like this too: every part times every part.",
    ),
  },
  screens: [
    {
      kind: "visual",
      title: L("Een rechthoek in twee stukken", "A rectangle in two parts"),
      body: L(
        "Een rechthoek is $3$ hoog en $x+4$ breed.\nDe oppervlakte is $3(x+4)$.\nKnip hem in twee stukken: $3$ keer $x$, en $3$ keer $4$.",
        "A rectangle is $3$ high and $x+4$ wide.\nIts area is $3(x+4)$.\nCut it into two parts: $3$ times $x$, and $3$ times $4$.",
      ),
      visual: { kind: "area-model", rows: ["3"], cols: ["x", "4"] },
      task: L("Klik op het volgende vak. Wat is de oppervlakte van elk stuk? Tel ze op.", "Click the next part. What is the area of each part? Add them up."),
    },
    {
      kind: "visual",
      title: L("Twee pijlen", "Two arrows"),
      body: L(
        "Zonder rechthoek teken je pijlen.\nVanaf de $3$ gaat een pijl naar $x$ en een pijl naar $4$.\nElke pijl is één keersom.",
        "Without a rectangle you draw arrows.\nFrom the $3$, one arrow goes to $x$ and one to $4$.\nEvery arrow is one multiplication.",
      ),
      visual: arrows([[3, 0]], [[1, 1], [4, 0]], "3(x+4)"),
      task: L("Klik op Volgende stap. Welk stuk hoort bij elke pijl?", "Click Next step. Which part belongs to each arrow?"),
    },
    {
      kind: "explain",
      title: L("De regel", "The rule"),
      body: L(
        "Het getal voor de haakjes gaat keer elke term tussen de haakjes.\nVergeet er geen: tel de pijlen.\nZie [[rule:u2.expand]].",
        "The number in front of the brackets multiplies every term inside.\nDo not forget one: count the arrows.\nSee [[rule:u2.expand]].",
      ),
      latex: "a(b+c)=ab+ac",
      ruleId: "u2.expand",
    },
    {
      kind: "example",
      title: L("Voorbeeld: $5(x+2)$", "Example: $5(x+2)$"),
      problem: L("Werk de haakjes weg: $5(x+2)$.", "Expand the brackets: $5(x+2)$."),
      visual: { kind: "area-model", rows: ["5"], cols: ["x", "2"] },
      solution: {
        steps: [
          { latex: "5(x+2)", note: L("Twee pijlen vanaf de $5$.", "Two arrows from the $5$.") },
          { latex: "\\hl{5\\cdot x}+\\hl{5\\cdot 2}", note: L("$5$ keer elke term.", "$5$ times every term.") },
          { latex: "\\ask{5x}+5\\cdot 2", note: L("Pijl 1.", "Arrow 1.") },
          { latex: "5x+\\ask{10}", note: L("Pijl 2.", "Arrow 2.") },
        ],
      },
    },
    {
      kind: "visual",
      title: L("Min keer min", "Minus times minus"),
      body: L(
        "Staat er een min voor het getal? Neem hem mee in elke pijl.\nMin keer min is plus: $(-2)\\cdot(-3)=6$.",
        "Is there a minus in front of the number? Take it along in every arrow.\nMinus times minus is plus: $(-2)\\cdot(-3)=6$.",
      ),
      visual: arrows([[-2, 0]], [[1, 1], [-3, 0]], "-2(x-3)"),
      task: L("Klik door. Welk teken krijgt het tweede stuk?", "Click through. Which sign does the second part get?"),
    },
    {
      kind: "example",
      title: L("Voorbeeld: $-2(x-3)$", "Example: $-2(x-3)$"),
      problem: L("Werk de haakjes weg: $-2(x-3)$.", "Expand the brackets: $-2(x-3)$."),
      solution: {
        steps: [
          { latex: "-2(x-3)", note: L("Twee pijlen vanaf $-2$.", "Two arrows from $-2$.") },
          { latex: "\\hl{-2\\cdot x}+\\hl{(-2)\\cdot(-3)}", note: L("$-2$ keer elke term.", "$-2$ times every term.") },
          { latex: "\\ask{-2x}+(-2)\\cdot(-3)", note: L("Pijl 1.", "Arrow 1.") },
          { latex: "-2x+\\ask{6}", note: L("Pijl 2: min keer min is plus.", "Arrow 2: minus times minus is plus.") },
        ],
      },
    },
    {
      kind: "explain",
      title: L("Alleen een min", "Just a minus"),
      body: L(
        "$-(x-5)$ betekent $-1\\cdot(x-5)$.\nAlle tekens tussen de haakjes draaien om.\n$-(x-5)=-x+5$.",
        "$-(x-5)$ means $-1\\cdot(x-5)$.\nEvery sign inside the brackets turns around.\n$-(x-5)=-x+5$.",
      ),
    },
    {
      kind: "visual",
      title: L("Een $x$ voor de haakjes", "An $x$ in front of the brackets"),
      body: L(
        "Staat er een $x$ voor de haakjes? Het werkt precies zo.\n$x$ keer $x$ is een vierkant: $x^2$.",
        "Is there an $x$ in front of the brackets? It works exactly the same.\n$x$ times $x$ is a square: $x^2$.",
      ),
      visual: { kind: "area-model", rows: ["x"], cols: ["x", "3"] },
      task: L("Klik door de vakken. Welk vak is een vierkant?", "Click through the parts. Which part is a square?"),
    },
    {
      kind: "example",
      title: L("Voorbeeld: $x(x+3)$", "Example: $x(x+3)$"),
      problem: L("Werk de haakjes weg: $x(x+3)$.", "Expand the brackets: $x(x+3)$."),
      solution: {
        steps: [
          { latex: "x(x+3)", note: L("Twee pijlen vanaf $x$.", "Two arrows from $x$.") },
          { latex: "\\hl{x\\cdot x}+\\hl{x\\cdot 3}", note: L("$x$ keer elke term.", "$x$ times every term.") },
          { latex: "\\ask{x^{2}}+x\\cdot 3", note: L("$x\\cdot x=x^2$.", "$x\\cdot x=x^2$.") },
          { latex: "x^{2}+\\ask{3x}", note: L("$x\\cdot 3=3x$.", "$x\\cdot 3=3x$.") },
        ],
      },
    },
    {
      kind: "example",
      title: L("Voorbeeld: $2x(3x-4)$", "Example: $2x(3x-4)$"),
      problem: L("Werk de haakjes weg: $2x(3x-4)$.", "Expand the brackets: $2x(3x-4)$."),
      visual: arrows([[2, 1]], [[3, 1], [-4, 0]], "2x(3x-4)"),
      solution: {
        steps: [
          { latex: "2x(3x-4)", note: L("Twee pijlen vanaf $2x$.", "Two arrows from $2x$.") },
          { latex: "\\hl{2x\\cdot 3x}+\\hl{2x\\cdot(-4)}", note: L("$2x$ keer elke term.", "$2x$ times every term.") },
          {
            latex: "\\ask{6x^{2}}+2x\\cdot(-4)",
            note: L("Getal keer getal: $2\\cdot 3=6$. En $x\\cdot x=x^2$.", "Number times number: $2\\cdot 3=6$. And $x\\cdot x=x^2$."),
          },
          { latex: "6x^{2}-\\ask{8x}", note: L("$2x\\cdot(-4)=-8x$.", "$2x\\cdot(-4)=-8x$.") },
        ],
      },
    },
  ],
  practice: [
    { generatorId: "u2.expand-single", difficulty: 1, count: 3 },
    { generatorId: "u2.expand-single", difficulty: 2, count: 3 },
    { generatorId: "u2.expand-single", difficulty: 3, count: 2 },
  ],
};

export const expandDoubleLesson: Lesson = {
  id: "u2.expand-double",
  title: L("Dubbele haakjes", "Double brackets"),
  goal: L("Je werkt $(x+2)(x+5)$ weg met vier pijlen.", "You expand $(x+2)(x+5)$ with four arrows."),
  minutes: 9,
  calculator: "off",
  calculatorOffReason: BY_HAND,
  info: {
    what: L(
      "Twee haakjes keer elkaar: elke term uit de eerste gaat keer elke term uit de tweede.",
      "Two brackets multiplied: every term of the first multiplies every term of the second.",
    ),
    why: L(
      "Dit heb je nodig voor kwadratische vergelijkingen en parabolen.",
      "You need this for quadratic equations and parabolas.",
    ),
    later: L(
      "In unit 4 doe je het omgekeerde: ontbinden in factoren. Parabolen kom je ook tegen bij het trainen van AI: de fout is vaak een parabool.",
      "In unit 4 you do the reverse: factorising. You also meet parabolas when training AI: the error is often a parabola.",
    ),
  },
  screens: [
    {
      kind: "visual",
      title: L("Een rechthoek in vier vakken", "A rectangle in four parts"),
      body: L(
        "Een rechthoek is $x+2$ hoog en $x+5$ breed.\nDe oppervlakte is $(x+2)(x+5)$.\nKnip hem in vier vakken.",
        "A rectangle is $x+2$ high and $x+5$ wide.\nIts area is $(x+2)(x+5)$.\nCut it into four parts.",
      ),
      visual: { kind: "area-model", rows: ["x", "2"], cols: ["x", "5"] },
      task: L("Klik door de vier vakken. Wat is de oppervlakte van elk vak?", "Click through the four parts. What is the area of each part?"),
    },
    {
      kind: "visual",
      title: L("De papegaaienbek", "Four arrows"),
      body: L(
        "Elke term links gaat keer elke term rechts.\nTwee keer twee: vier pijlen.\nSamen lijken ze op de snavel van een papegaai.",
        "Every term on the left multiplies every term on the right.\nTwo times two: four arrows.\nIn Dutch this shape is called the parrot's beak.",
      ),
      visual: arrows([[1, 1], [2, 0]], [[1, 1], [5, 0]], "(x+2)(x+5)"),
      task: L("Klik op Volgende stap. Welke vier stukken komen eruit? Welke twee kun je samennemen?", "Click Next step. Which four parts come out? Which two can you combine?"),
    },
    {
      kind: "explain",
      title: L("De regel", "The rule"),
      body: L(
        "Vier pijlen, vier stukken.\nDaarna neem je de $x$-termen samen.\nZie [[rule:u2.expand-double]].",
        "Four arrows, four parts.\nThen you combine the $x$-terms.\nSee [[rule:u2.expand-double]].",
      ),
      latex: "(a+b)(c+d)=ac+ad+bc+bd",
      ruleId: "u2.expand-double",
    },
    {
      kind: "example",
      title: L("Voorbeeld: $(x+2)(x+5)$", "Example: $(x+2)(x+5)$"),
      problem: L("Werk de haakjes weg: $(x+2)(x+5)$.", "Expand the brackets: $(x+2)(x+5)$."),
      visual: { kind: "area-model", rows: ["x", "2"], cols: ["x", "5"] },
      solution: {
        steps: [
          { latex: "(x+2)(x+5)", note: L("Vier pijlen.", "Four arrows.") },
          { latex: "\\hl{x\\cdot x+x\\cdot 5+2\\cdot x+2\\cdot 5}", note: L("Elke term keer elke term.", "Every term times every term.") },
          { latex: "x^{2}+5x+2x+\\ask{10}", note: L("Reken de vier vakken uit.", "Work out the four parts.") },
          { latex: "x^{2}+\\ask{7x}+10", note: L("$5x+2x=7x$.", "$5x+2x=7x$.") },
        ],
      },
    },
    {
      kind: "example",
      title: L("Voorbeeld: met een min", "Example: with a minus"),
      problem: L("Werk de haakjes weg: $(x+3)(x-4)$.", "Expand the brackets: $(x+3)(x-4)$."),
      visual: arrows([[1, 1], [3, 0]], [[1, 1], [-4, 0]], "(x+3)(x-4)"),
      solution: {
        steps: [
          { latex: "(x+3)(x-4)", note: L("Vier pijlen. De min hoort bij de $4$.", "Four arrows. The minus belongs to the $4$.") },
          { latex: "\\hl{x\\cdot x+x\\cdot(-4)+3\\cdot x+3\\cdot(-4)}", note: L("Elke term keer elke term.", "Every term times every term.") },
          { latex: "x^{2}-4x+3x-\\ask{12}", note: L("$3\\cdot(-4)=-12$.", "$3\\cdot(-4)=-12$.") },
          { latex: "x^{2}-\\ask{x}-12", note: L("$-4x+3x=-x$.", "$-4x+3x=-x$.") },
        ],
      },
    },
    {
      kind: "example",
      title: L("Voorbeeld: $(2x+1)(x+3)$", "Example: $(2x+1)(x+3)$"),
      problem: L("Werk de haakjes weg: $(2x+1)(x+3)$.", "Expand the brackets: $(2x+1)(x+3)$."),
      visual: { kind: "area-model", rows: ["2x", "1"], cols: ["x", "3"] },
      solution: {
        steps: [
          { latex: "(2x+1)(x+3)", note: L("Vier pijlen. Nu staat er een getal voor de eerste $x$.", "Four arrows. Now there is a number in front of the first $x$.") },
          { latex: "\\hl{2x\\cdot x+2x\\cdot 3+1\\cdot x+1\\cdot 3}", note: L("Elke term keer elke term.", "Every term times every term.") },
          {
            latex: "\\ask{2x^{2}}+6x+x+3",
            note: L("$2x\\cdot x=2x^2$. En $2x\\cdot 3=6x$: getal keer getal.", "$2x\\cdot x=2x^2$. And $2x\\cdot 3=6x$: number times number."),
          },
          { latex: "2x^{2}+\\ask{7x}+3", note: L("$6x+x=7x$.", "$6x+x=7x$.") },
        ],
      },
    },
    {
      kind: "explain",
      title: L("Een kwadraat", "A square"),
      body: L(
        "$(x+3)^2$ betekent $(x+3)(x+3)$.\nDus ook vier vakken: $x^2+3x+3x+9$.\nNiet alleen $x^2+9$! Dan mis je twee vakken.",
        "$(x+3)^2$ means $(x+3)(x+3)$.\nSo four parts again: $x^2+3x+3x+9$.\nNot just $x^2+9$! Then you miss two parts.",
      ),
    },
    {
      kind: "example",
      title: L("Voorbeeld: $(x+3)^2$", "Example: $(x+3)^2$"),
      problem: L("Werk de haakjes weg: $(x+3)^{2}$.", "Expand the brackets: $(x+3)^{2}$."),
      visual: { kind: "area-model", rows: ["x", "3"], cols: ["x", "3"] },
      solution: {
        steps: [
          { latex: "(x+3)^{2}", note: L("Dit staat er.", "This is the expression.") },
          { latex: "(x+3)(x+3)", note: L("Kwadraat: twee keer dezelfde haakjes.", "Squared: the same brackets twice.") },
          { latex: "\\hl{x\\cdot x+x\\cdot 3+3\\cdot x+3\\cdot 3}", note: L("Vier pijlen.", "Four arrows.") },
          { latex: "x^{2}+3x+3x+\\ask{9}", note: L("Reken de vier vakken uit.", "Work out the four parts.") },
          { latex: "x^{2}+\\ask{6x}+9", note: L("$3x+3x=6x$.", "$3x+3x=6x$.") },
        ],
      },
    },
  ],
  practice: [
    { generatorId: "u2.expand-double", difficulty: 1, count: 3 },
    { generatorId: "u2.expand-double", difficulty: 2, count: 3 },
    { generatorId: "u2.expand-double", difficulty: 3, count: 2 },
  ],
};
