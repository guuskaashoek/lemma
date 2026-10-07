/**
 * Lesson 5: parabolas. Valley or hill (dal- of bergparabool), the axis of
 * symmetry and the vertex (top).
 */
import type { Lesson } from "@/content/types";
import { parabolaVisual } from "../gen/abc";
import { L, parabolaPlane } from "../helpers";

export const parabolaLesson: Lesson = {
  id: "u4.parabola",
  title: L("Parabolen: dal, berg en top", "Parabolas: valley, hill and vertex"),
  goal: L(
    "Je ziet aan de formule of de grafiek een dal of een berg is, en je berekent de top.",
    "You see from the formula whether the graph is a valley or a hill, and you work out the vertex.",
  ),
  minutes: 10,
  calculator: "off",
  calculatorOffReason: L(
    "De rekenmachine staat uit. De getallen zijn klein, en je leert kijken naar de formule.",
    "The calculator is off. The numbers are small, and you learn to read the formula.",
  ),
  info: {
    what: L(
      "De grafiek van $y=ax^{2}+bx+c$ heet een **parabool**. Hij heeft een top en is symmetrisch.",
      "The graph of $y=ax^{2}+bx+c$ is called a **parabola**. It has a vertex and is symmetric.",
    ),
    why: L(
      "De top is het hoogste of laagste punt. Denk aan de hoogste plek van een bal die je gooit, of de laagste kosten.",
      "The vertex is the highest or lowest point. Think of the highest point of a ball you throw, or the lowest cost.",
    ),
    later: L(
      "Bij afgeleiden en optimaliseren. In AI is de fout van een model vaak een soort dalparabool. Leren is dan: naar het laagste punt lopen.",
      "With derivatives and optimisation. In AI the error of a model is often a kind of valley parabola. Learning then means: walking to the lowest point.",
    ),
  },
  screens: [
    {
      kind: "visual",
      title: L("Wat doet $a$?", "What does $a$ do?"),
      body: L(
        "Dit is de grafiek van $y=x^{2}$. Het getal voor $x^{2}$ heet $a$. Hier is $a=1$.\nMet de knoppen verander je $a$.",
        "This is the graph of $y=x^{2}$. The number in front of $x^{2}$ is called $a$. Here $a=1$.\nThe buttons change $a$.",
      ),
      visual: parabolaVisual(1, 0, 0, ["top"], ["a"]),
      task: L(
        "Maak $a$ groter. Maak $a$ daarna negatief. Wat gebeurt er met de vorm?",
        "Make $a$ bigger. Then make $a$ negative. What happens to the shape?",
      ),
    },
    {
      kind: "explain",
      title: L("Dal of berg", "Valley or hill"),
      body: L(
        "$a$ positief: een **dalparabool** $\\cup$. De top is het laagste punt.\n$a$ negatief: een **bergparabool** $\\cap$. De top is het hoogste punt.\nLet op: bij $-x^{2}$ is $a=-1$.\nZie [[rule:u4.parabola-shape]].",
        "$a$ positive: a **valley parabola** $\\cup$. The vertex is the lowest point.\n$a$ negative: a **hill parabola** $\\cap$. The vertex is the highest point.\nCareful: in $-x^{2}$, $a=-1$.\nSee [[rule:u4.parabola-shape]].",
      ),
      ruleId: "u4.parabola-shape",
    },
    {
      kind: "visual",
      title: L("Twee keer dezelfde hoogte", "The same height twice"),
      body: L(
        "Dit is $y=x^{2}-6x+5$. Sleep het punt over de grafiek.\nElke hoogte, behalve de top, kom je twee keer tegen: links en rechts.",
        "This is $y=x^{2}-6x+5$. Drag the point along the graph.\nEvery height, except the vertex, comes up twice: left and right.",
      ),
      visual: parabolaPlane(1, -6, 5),
      task: L(
        "Zoek de twee punten met hoogte $0$. Welke $x$ ligt precies in het midden?",
        "Find the two points at height $0$. Which $x$ is exactly halfway?",
      ),
    },
    {
      kind: "visual",
      title: L("Vouwen langs de as", "Folding along the axis"),
      body: L(
        "Een parabool is symmetrisch. Vouw je hem langs een rechte lijn, dan vallen de twee helften op elkaar.\nDie lijn heet de **symmetrie-as**. De top ligt erop.",
        "A parabola is symmetric. Fold it along a straight line and the two halves land on each other.\nThat line is called the **axis of symmetry**. The vertex lies on it.",
      ),
      visual: parabolaVisual(1, -6, 5, ["axis", "top", "zeros", "fold"]),
      task: L("Klik op vouwen. Passen de helften precies?", "Click fold. Do the halves fit exactly?"),
    },
    {
      kind: "example",
      title: L("Voorbeeld: top met nulpunten", "Example: vertex from the zeros"),
      problem: L(
        "Bereken de top van $y=(x-1)(x-5)$. De nulpunten zijn $1$ en $5$: daar is een haakje nul.",
        "Work out the vertex of $y=(x-1)(x-5)$. The zeros are $1$ and $5$: there a bracket is zero.",
      ),
      visual: parabolaVisual(1, -6, 5, ["axis", "top", "zeros"]),
      solution: {
        steps: [
          { latex: "x=\\frac{1+5}{2}\\land y=(x-1)(x-5)", note: L("De as ligt precies in het midden van de nulpunten. Het teken $\\land$ betekent 'en'.", "The axis is exactly halfway between the zeros. The sign $\\land$ means 'and'.") },
          { latex: "x=\\ask{3}\\land y=(x-1)(x-5)", note: L("$1+5=6$ en $6:2=3$.", "$1+5=6$ and $6\\div 2=3$.") },
          { latex: "x=3\\land y=(3-1)(3-5)", note: L("Vul $x=3$ in de formule in.", "Put $x=3$ into the formula.") },
          { latex: "x=3\\land y=\\ask{-4}", note: L("$2\\cdot(-2)=-4$. De top is $(3,-4)$.", "$2\\cdot(-2)=-4$. The vertex is $(3,-4)$.") },
        ],
      },
    },
    {
      kind: "explain",
      title: L("Zonder nulpunten", "Without zeros"),
      body: L(
        "Je ziet de nulpunten niet altijd. Dan is er een vaste formule voor de as:\n$x_{top}=-\\frac{b}{2a}$.\nDaarna vul je $x_{top}$ in de formule in. Zo vind je $y_{top}$.\nZie [[rule:u4.parabola-top]].",
        "You cannot always see the zeros. Then there is a fixed formula for the axis:\n$x_{top}=-\\frac{b}{2a}$.\nThen you put $x_{top}$ into the formula. That gives $y_{top}$.\nSee [[rule:u4.parabola-top]].",
      ),
      latex: "x_{top}=-\\frac{b}{2a}",
      ruleId: "u4.parabola-top",
    },
    {
      kind: "example",
      title: L("Voorbeeld: $y=-x^{2}+4x+1$", "Example: $y=-x^{2}+4x+1$"),
      problem: L(
        "Bereken de top van $y=-x^{2}+4x+1$. Hier is $a=-1$ en $b=4$. Het is een berg.",
        "Work out the vertex of $y=-x^{2}+4x+1$. Here $a=-1$ and $b=4$. It is a hill.",
      ),
      visual: parabolaVisual(-1, 4, 1, ["axis", "top"]),
      solution: {
        steps: [
          { latex: "x=-\\frac{4}{2\\cdot (-1)}\\land y=-x^{2}+4x+1", note: L("Vul in: $-\\frac{b}{2a}$.", "Fill in: $-\\frac{b}{2a}$.") },
          { latex: "x=\\ask{2}\\land y=-x^{2}+4x+1", note: L("$\\frac{4}{-2}=-2$, en min daarvoor geeft $2$.", "$\\frac{4}{-2}=-2$, and the minus in front gives $2$.") },
          { latex: "x=2\\land y=-2^{2}+4\\cdot 2+1", note: L("Vul $x=2$ in. Eerst het kwadraat: $-2^{2}=-4$.", "Put in $x=2$. Square first: $-2^{2}=-4$.") },
          { latex: "x=2\\land y=\\ask{5}", note: L("$-4+8+1=5$. De top is $(2,5)$, het hoogste punt.", "$-4+8+1=5$. The vertex is $(2,5)$, the highest point.") },
        ],
      },
    },
  ],
  practice: [
    { generatorId: "u4.parabola-shape", difficulty: 1, count: 1 },
    { generatorId: "u4.parabola-shape", difficulty: 2, count: 1 },
    { generatorId: "u4.parabola-axis", difficulty: 1, count: 2 },
    { generatorId: "u4.parabola-axis", difficulty: 2, count: 2 },
    { generatorId: "u4.parabola-top", difficulty: 1, count: 1 },
    { generatorId: "u4.parabola-shape", difficulty: 3, count: 1 },
    { generatorId: "u4.parabola-top", difficulty: 2, count: 2 },
    { generatorId: "u4.parabola-top", difficulty: 3, count: 1 },
  ],
};
