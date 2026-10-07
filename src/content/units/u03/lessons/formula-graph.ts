/**
 * Lesson 1: from formula to table to graph. A linear formula gives points
 * on one straight line.
 */
import type { Lesson } from "@/content/types";
import { frac } from "@/math/latex";
import { F, L, signed, times } from "../helpers";
import { pointWalkVisual, tablePlotVisual } from "../gen/visuals";
import { planeWindow } from "../widgets/model";

const OFF = L("De rekenmachine staat uit. Deze sommen doe je met de hand.", "The calculator is off. You do these sums by hand.");

/** Example 1: y = 3x + 4 at x = -2, all numbers computed. */
const ex1 = (() => {
  const [a, b, x] = [F(3), F(4), F(-2)];
  const prod = a.mul(x);
  const y = prod.add(b);
  return {
    steps: [
      { latex: `y=${times(a, x, "hl")}${signed(b)}`, note: L("Vul $x=-2$ in. Een negatief getal zet je tussen haakjes.", "Put in $x=-2$. Put a negative number in brackets.") },
      { latex: `y=\\ask{${frac(prod)}}${signed(b)}`, note: L("Eerst keer: plus keer min is min.", "First multiply: plus times minus is minus.") },
      { latex: `y=\\ask{${frac(y)}}`, note: L("Dan plus $4$.", "Then add $4$.") },
    ],
    solutions: [{ y: y.valueOf() }],
  };
})();

/** Example 2: is P(4, 10) on y = 3x - 1? */
const ex2 = (() => {
  const [a, b, px, py] = [F(3), F(-1), F(4), F(10)];
  const y = a.mul(px).add(b);
  return {
    steps: [
      { latex: `y=${times(a, px, "hl")}${signed(b)}`, note: L("Vul de $x$ van $P$ in: $x=4$.", "Put in the $x$ of $P$: $x=4$.") },
      { latex: `y=\\ask{${frac(y)}}`, note: L(`Er komt $${frac(y)}$ uit. Maar $P$ heeft $y=${frac(py)}$. Dus: nee.`, `You get $${frac(y)}$. But $P$ has $y=${frac(py)}$. So: no.`) },
    ],
    solutions: [{ y: y.valueOf() }],
  };
})();

const win2 = planeWindow([
  [4, 10],
  [0, -1],
]);

export const formulaGraphLesson: Lesson = {
  id: "u3.formula-graph",
  title: L("Van formule naar grafiek", "From formula to graph"),
  goal: L(
    "Je rekent met een formule punten uit en ziet dat ze op een rechte lijn liggen.",
    "You work out points with a formula and see that they lie on a straight line.",
  ),
  minutes: 8,
  calculator: "off",
  calculatorOffReason: OFF,
  info: {
    what: L(
      "Een lineaire formule zoals $y=2x+1$ maakt van elke $x$ een $y$. Alle punten samen vormen een rechte lijn.",
      "A linear formula like $y=2x+1$ turns every $x$ into a $y$. All the points together form a straight line.",
    ),
    why: L(
      "Met een formule kun je voorspellen: prijzen, afstanden, tijd. De grafiek laat het in één plaatje zien.",
      "With a formula you can predict: prices, distances, time. The graph shows it in one picture.",
    ),
    later: L(
      "Eén neuron in een neuraal netwerk rekent ook zoiets: getal keer gewicht, plus een getal. Lijnen zijn de basis van AI.",
      "One neuron in a neural network computes something similar: number times weight, plus a number. Lines are the basis of AI.",
    ),
  },
  screens: [
    {
      kind: "explain",
      title: L("Een formule is een machine", "A formula is a machine"),
      body: L(
        "$y=2x+1$ is een machine.\nEr gaat een getal $x$ in.\nDe machine doet keer $2$, dan plus $1$.\nEr komt een getal $y$ uit.",
        "$y=2x+1$ is a machine.\nA number $x$ goes in.\nThe machine does times $2$, then plus $1$.\nA number $y$ comes out.",
      ),
      latex: "y=2x+1",
      metaphor: "machine",
    },
    {
      kind: "visual",
      title: L("Probeer de machine", "Try the machine"),
      body: L("Stop een getal in de machine. Kijk wat eruit komt.", "Put a number into the machine. See what comes out."),
      visual: { kind: "function-machine", latex: "2x+1", inputs: [0, 1, 2, 3] },
      task: L("Stop $0$, $1$, $2$ en $3$ erin. Hoeveel komt er elke keer bij?", "Put in $0$, $1$, $2$ and $3$. How much is added each time?"),
      metaphor: "machine",
    },
    {
      kind: "explain",
      title: L("Een punt: eerst x, dan y", "A point: first x, then y"),
      body: L(
        "Een $x$ en zijn $y$ samen zijn een punt: $(x,\\ y)$.\nEerst opzij: $x$. Dan omhoog of omlaag: $y$.\n$(2,\\ 5)$ is $2$ naar rechts en $5$ omhoog.",
        "An $x$ and its $y$ together are a point: $(x,\\ y)$.\nFirst sideways: $x$. Then up or down: $y$.\n$(2,\\ 5)$ is $2$ to the right and $5$ up.",
      ),
    },
    {
      kind: "visual",
      title: L("Punten in het assenstelsel", "Points in the plane"),
      body: L(
        "Hier staan drie punten.\nLinks van de $y$-as is $x$ negatief. Onder de $x$-as is $y$ negatief.",
        "Here are three points.\nLeft of the $y$-axis, $x$ is negative. Below the $x$-axis, $y$ is negative.",
      ),
      visual: pointWalkVisual([
        [2, 5],
        [-3, 1],
        [1, -2],
      ]),
      task: L("Klik op elk punt. Waar ga je eerst heen: opzij of omhoog?", "Click each point. Where do you go first: sideways or up?"),
    },
    {
      kind: "visual",
      title: L("Van tabel naar grafiek", "From table to graph"),
      body: L(
        "De machine $y=2x+1$ vult een tabel.\nElke kolom van de tabel wordt een punt.",
        "The machine $y=2x+1$ fills a table.\nEvery column of the table becomes a point.",
      ),
      visual: tablePlotVisual(2, 1, [0, 1, 2, 3]),
      task: L("Klik op ‘Volgend punt’ tot alle punten staan. Wat zie je?", "Click ‘Next point’ until all points are there. What do you see?"),
      metaphor: "machine",
    },
    {
      kind: "explain",
      title: L("Een rechte lijn", "A straight line"),
      body: L(
        "Alle punten liggen op één rechte lijn.\nDat komt doordat er bij elke stap evenveel bijkomt: steeds $+2$.\nZo'n formule heet **lineair**: een lijn.",
        "All points lie on one straight line.\nThat is because every step adds the same amount: always $+2$.\nSuch a formula is called **linear**: a line.",
      ),
    },
    {
      kind: "example",
      title: L("Voorbeeld: invullen", "Example: filling in"),
      problem: L("De formule is $y=3x+4$. Bereken $y$ als $x=-2$.", "The formula is $y=3x+4$. Work out $y$ when $x=-2$."),
      solution: ex1,
      visual: { kind: "function-machine", latex: "3x+4", inputs: [-2, 0, 1] },
    },
    {
      kind: "example",
      title: L("Voorbeeld: ligt het punt op de lijn?", "Example: is the point on the line?"),
      problem: L("Ligt $P(4,\\ 10)$ op de lijn $y=3x-1$?", "Is $P(4,\\ 10)$ on the line $y=3x-1$?"),
      solution: ex2,
      visual: { kind: "plane", x: win2.x, y: win2.y, graphs: [{ latex: "3x-1" }], points: [{ x: 4, y: 10, label: "P" }] },
    },
    {
      kind: "explain",
      title: L("Zo doe je het", "How to do it"),
      body: L(
        "Vervang $x$ door het getal. Eerst keer, dan plus of min.\nKomt de $y$ van het punt eruit? Dan ligt het punt op de lijn.\nZie [[rule:u3.formula-table]] en [[rule:u3.point-on-line]].",
        "Replace $x$ by the number. First multiply, then add or subtract.\nDo you get the $y$ of the point? Then the point is on the line.\nSee [[rule:u3.formula-table]] and [[rule:u3.point-on-line]].",
      ),
      ruleId: "u3.formula-table",
    },
  ],
  practice: [
    { generatorId: "u3.table-value", difficulty: 1, count: 3 },
    { generatorId: "u3.point-on-line", difficulty: 1, count: 2 },
    { generatorId: "u3.table-value", difficulty: 2, count: 2 },
    { generatorId: "u3.point-on-line", difficulty: 2, count: 1 },
    { generatorId: "u3.table-value", difficulty: 3, count: 1 },
    { generatorId: "u3.point-on-line", difficulty: 3, count: 1 },
  ],
};
