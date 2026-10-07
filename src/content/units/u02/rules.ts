/**
 * Rule cards of unit 2. Each card's example is checked by the tests.
 */
import type { RuleCard } from "@/content/types";
import { L } from "./helpers";

export const rules: RuleCard[] = [
  {
    id: "u2.variable",
    name: L("Letter = getal", "Letter = number"),
    statement: L(
      "Een letter staat voor een getal. Een getal voor een letter betekent keer: $3x=3\\cdot x$. Vul je een negatief getal in? Zet het tussen haakjes.",
      "A letter stands for a number. A number in front of a letter means times: $3x=3\\cdot x$. Filling in a negative number? Put it in brackets.",
    ),
    lessonId: "u2.variables",
    mnemonic: "hmwvdoa",
    example: {
      problem: L("Bereken $3x+2$ als $x=4$.", "Work out $3x+2$ when $x=4$."),
      steps: [
        { latex: "3\\cdot\\hl{4}+2", note: L("Vul in: op de plek van $x$ komt $4$.", "Fill in: $4$ goes where $x$ was.") },
        { latex: "\\hl{12}+2", note: L("Eerst keer.", "Multiply first.") },
        { latex: "\\hl{14}", note: L("Dan plus.", "Then add.") },
      ],
    },
  },
  {
    id: "u2.like-terms",
    name: L("Gelijke soorten samen", "Like with like"),
    statement: L(
      "Tel $x$-termen bij $x$-termen op en losse getallen bij losse getallen. Het teken vóór een term hoort bij die term.",
      "Add $x$-terms to $x$-terms and plain numbers to plain numbers. The sign in front of a term belongs to that term.",
    ),
    lessonId: "u2.like-terms",
    example: {
      problem: L("Maak korter: $3x+2+4x-5$.", "Make shorter: $3x+2+4x-5$."),
      steps: [
        { latex: "3x+2+4x-5", note: L("Dit is de som.", "This is the expression.") },
        { latex: "\\hl{3x+4x}+2-5", note: L("Zet gelijke soorten bij elkaar.", "Put like terms together.") },
        { latex: "\\hl{7x}-3", note: L("$3x+4x=7x$ en $2-5=-3$.", "$3x+4x=7x$ and $2-5=-3$.") },
      ],
    },
  },
  {
    id: "u2.expand",
    name: L("Haakjes wegwerken", "Expanding brackets"),
    statement: L(
      "Het getal voor de haakjes gaat keer elke term tussen de haakjes. Een min gaat mee: min keer min is plus.",
      "The number in front of the brackets multiplies every term inside. A minus goes along: minus times minus is plus.",
    ),
    latex: "a(b+c)=ab+ac",
    lessonId: "u2.expand",
    example: {
      problem: L("Werk de haakjes weg: $-3(x-4)$.", "Expand the brackets: $-3(x-4)$."),
      steps: [
        { latex: "-3(x-4)", note: L("Twee pijlen vanaf $-3$.", "Two arrows from $-3$.") },
        { latex: "\\hl{-3\\cdot x}+\\hl{(-3)\\cdot(-4)}", note: L("$-3$ keer elke term.", "$-3$ times every term.") },
        { latex: "-3x+\\hl{12}", note: L("Min keer min is plus.", "Minus times minus is plus.") },
      ],
    },
  },
  {
    id: "u2.expand-double",
    name: L("Papegaaienbek", "Double brackets"),
    statement: L(
      "Bij twee haakjes gaat elke term links keer elke term rechts: vier pijlen, vier vakken. Neem daarna de $x$-termen samen.",
      "With two brackets, every term on the left multiplies every term on the right: four arrows, four boxes. Then combine the $x$-terms.",
    ),
    latex: "(a+b)(c+d)=ac+ad+bc+bd",
    lessonId: "u2.expand-double",
    example: {
      problem: L("Werk de haakjes weg: $(x+2)(x+5)$.", "Expand the brackets: $(x+2)(x+5)$."),
      steps: [
        { latex: "(x+2)(x+5)", note: L("Vier pijlen.", "Four arrows.") },
        { latex: "x\\cdot x+x\\cdot 5+2\\cdot x+2\\cdot 5", note: L("Elke term keer elke term.", "Every term times every term.") },
        { latex: "x^{2}+5x+2x+10", note: L("Reken de vier vakken uit.", "Work out the four boxes.") },
        { latex: "x^{2}+\\hl{7x}+10", note: L("Neem de $x$-termen samen.", "Combine the $x$-terms.") },
      ],
    },
  },
  {
    id: "u2.balance-method",
    name: L("De balans", "The balance"),
    statement: L(
      "Een vergelijking is een balans. Wat je links doet, doe je ook rechts. Zo blijft de vergelijking kloppen.",
      "An equation is a balance. Whatever you do on the left, you also do on the right. That keeps the equation true.",
    ),
    lessonId: "u2.balance",
    example: {
      problem: L("Los op: $2x+3=11$.", "Solve: $2x+3=11$."),
      steps: [
        { latex: "2x+3=11", note: L("Dit is de vergelijking.", "This is the equation.") },
        { latex: "2x=\\hl{8}", note: L("Haal links en rechts $3$ weg.", "Subtract $3$ on both sides.") },
        { latex: "x=\\hl{4}", note: L("Deel links en rechts door $2$.", "Divide both sides by $2$.") },
      ],
      solutions: [{ x: 4 }],
    },
  },
  {
    id: "u2.brackets-first",
    name: L("Eerst haakjes weg", "Brackets first"),
    statement: L(
      "Staan er haakjes in een vergelijking? Werk ze eerst weg. Los daarna op met de balans.",
      "Are there brackets in an equation? Expand them first. Then solve with the balance.",
    ),
    lessonId: "u2.equations",
    example: {
      problem: L("Los op: $3(x-2)=2x+5$.", "Solve: $3(x-2)=2x+5$."),
      steps: [
        { latex: "3(x-2)=2x+5", note: L("Dit is de vergelijking.", "This is the equation.") },
        { latex: "\\hl{3x-6}=2x+5", note: L("Eerst haakjes weg.", "Brackets first.") },
        { latex: "\\hl{x}-6=5", note: L("Haal links en rechts $2x$ weg.", "Take $2x$ away on both sides.") },
        { latex: "x=\\hl{11}", note: L("Tel links en rechts $6$ op.", "Add $6$ on both sides.") },
      ],
      solutions: [{ x: 11 }],
    },
  },
  {
    id: "u2.inequality",
    name: L("Ongelijkheid oplossen", "Solving an inequality"),
    statement: L(
      "Los een ongelijkheid op zoals een vergelijking. Het teken blijft staan. Op de getallenlijn: open bolletje bij $<$ en $>$, dicht bolletje bij $\\le$ en $\\ge$.",
      "Solve an inequality like an equation. The sign stays. On the number line: an open dot for $<$ and $>$, a closed dot for $\\le$ and $\\ge$.",
    ),
    lessonId: "u2.inequalities",
    example: {
      problem: L("Los op: $2x+1<9$.", "Solve: $2x+1<9$."),
      steps: [
        { latex: "2x+1<9", note: L("Dit is de ongelijkheid.", "This is the inequality.") },
        { latex: "2x<\\hl{8}", note: L("Haal links en rechts $1$ weg.", "Take $1$ away on both sides.") },
        { latex: "x<\\hl{4}", note: L("Deel links en rechts door $2$.", "Divide both sides by $2$.") },
      ],
    },
  },
  {
    id: "u2.flip-sign",
    name: L("Teken omklappen", "Flip the sign"),
    statement: L(
      "Vermenigvuldig of deel je links en rechts door een negatief getal? Dan klapt het teken om: $<$ wordt $>$ en $\\le$ wordt $\\ge$.",
      "Multiplying or dividing both sides by a negative number? Then the sign flips: $<$ becomes $>$ and $\\le$ becomes $\\ge$.",
    ),
    lessonId: "u2.flip",
    example: {
      problem: L("Los op: $-2x+1\\ge 7$.", "Solve: $-2x+1\\ge 7$."),
      steps: [
        { latex: "-2x+1\\ge 7", note: L("Dit is de ongelijkheid.", "This is the inequality.") },
        { latex: "-2x\\ge \\hl{6}", note: L("Haal links en rechts $1$ weg.", "Take $1$ away on both sides.") },
        { latex: "x\\hl{\\le} -3", note: L("Deel door $-2$: het teken klapt om.", "Divide by $-2$: the sign flips.") },
      ],
    },
  },
  {
    id: "u2.rearrange",
    name: L("Terugrekenen", "Working backwards"),
    statement: L(
      "Een formule is een machine. Omwerken is de machine achteruit draaien: maak elke stap ongedaan, van achter naar voren. Doe het links en rechts.",
      "A formula is a machine. Rearranging is running the machine backwards: undo every step, from last to first. Do it on both sides.",
    ),
    lessonId: "u2.rearrange",
    example: {
      problem: L("Schrijf $y=2x+3$ als $x=\\ldots$.", "Write $y=2x+3$ as $x=\\ldots$."),
      steps: [
        { latex: "y=2x+3", note: L("De machine: eerst keer $2$, dan plus $3$.", "The machine: first times $2$, then add $3$.") },
        {
          latex: "2x=\\hl{y-3}",
          note: L("Zet $x$ links. Maak plus $3$ ongedaan: links en rechts min $3$.", "Put $x$ on the left. Undo add $3$: subtract $3$ on both sides."),
        },
        { latex: "x=\\hl{\\frac{y-3}{2}}", note: L("Maak keer $2$ ongedaan: links en rechts gedeeld door $2$.", "Undo times $2$: divide both sides by $2$.") },
      ],
    },
  },
];
