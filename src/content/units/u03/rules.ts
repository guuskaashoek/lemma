/**
 * Rule cards of unit 3. Each card's example is checked by the tests.
 */
import Fraction from "fraction.js";
import type { RuleCard } from "@/content/types";
import { L } from "./helpers";
import { eliminationSteps, intersectionSteps, substitutionSteps } from "./gen/solve";

const F = (v: number) => new Fraction(v);

export const rules: RuleCard[] = [
  {
    id: "u3.formula-table",
    name: L("Formule → tabel", "Formula → table"),
    statement: L(
      "Vervang $x$ door een getal en reken $y$ uit. Eerst keer, dan plus of min. Elk paar $(x,\\ y)$ is een punt van de grafiek.",
      "Replace $x$ by a number and work out $y$. First multiply, then add or subtract. Every pair $(x,\\ y)$ is a point of the graph.",
    ),
    lessonId: "u3.formula-graph",
    example: {
      problem: L("Bereken $y$ als $x=3$. De formule is $y=2x+1$.", "Work out $y$ when $x=3$. The formula is $y=2x+1$."),
      steps: [
        { latex: "y=2\\cdot\\hl{3}+1", note: L("Op de plek van $x$ komt $3$.", "$3$ goes in place of $x$.") },
        { latex: "y=\\hl{6}+1", note: L("Eerst keer.", "First multiply.") },
        { latex: "y=\\hl{7}", note: L("Dan plus. Het punt is $(3,\\ 7)$.", "Then add. The point is $(3,\\ 7)$.") },
      ],
      solutions: [{ y: 7 }],
    },
  },
  {
    id: "u3.point-on-line",
    name: L("Ligt het punt erop?", "Is the point on it?"),
    statement: L(
      "Vul de $x$ van het punt in de formule in. Komt de $y$ van het punt eruit? Dan ligt het punt op de lijn.",
      "Put the $x$ of the point into the formula. Do you get the $y$ of the point? Then the point is on the line.",
    ),
    lessonId: "u3.formula-graph",
    example: {
      problem: L("Ligt $(2,\\ 5)$ op de lijn $y=3x-1$?", "Is $(2,\\ 5)$ on the line $y=3x-1$?"),
      steps: [
        { latex: "y=3\\cdot\\hl{2}-1", note: L("Vul $x=2$ in.", "Put in $x=2$.") },
        { latex: "y=\\hl{5}", note: L("Er komt $5$ uit, net als bij het punt. Dus: ja.", "You get $5$, the same as the point. So: yes.") },
      ],
      solutions: [{ y: 5 }],
    },
  },
  {
    id: "u3.slope-intercept",
    name: L("$y=ax+b$", "$y=ax+b$"),
    statement: L(
      "$a$ is de richtingscoëfficiënt: zoveel gaat $y$ omhoog (of omlaag) bij elke stap van $1$ naar rechts. $b$ is het startgetal: daar snijdt de lijn de $y$-as.",
      "$a$ is the slope: how much $y$ goes up (or down) for every step of $1$ to the right. $b$ is the start value: where the line crosses the $y$-axis.",
    ),
    latex: "y=ax+b",
    lessonId: "u3.start-step",
    example: {
      problem: L("Wat is het startgetal van $y=-2x+5$?", "What is the start value of $y=-2x+5$?"),
      steps: [
        { latex: "-2\\cdot\\hl{0}+5", note: L("Het startgetal is $y$ bij $x=0$.", "The start value is $y$ at $x=0$.") },
        { latex: "\\hl{5}", note: L("Dus $b=5$. En $a=-2$: elke stap $2$ omlaag.", "So $b=5$. And $a=-2$: every step $2$ down.") },
      ],
    },
  },
  {
    id: "u3.slope",
    name: L("Hellingsdriehoek", "Slope triangle"),
    statement: L(
      "Richtingscoëfficiënt uit twee punten: $a=\\frac{\\text{verschil in }y}{\\text{verschil in }x}$. Omhoog gedeeld door opzij. Neem boven en onder dezelfde volgorde.",
      "Slope from two points: $a=\\frac{\\text{change in }y}{\\text{change in }x}$. Up divided by sideways. Use the same order on top and below.",
    ),
    latex: "a=\\frac{y_B-y_A}{x_B-x_A}",
    lessonId: "u3.slope",
    example: {
      problem: L("Een lijn gaat door $A(1,\\ 3)$ en $B(4,\\ 9)$. Bereken $a$.", "A line goes through $A(1,\\ 3)$ and $B(4,\\ 9)$. Work out $a$."),
      steps: [
        { latex: "\\frac{9-3}{4-1}", note: L("Verschil in $y$ boven, verschil in $x$ onder.", "Change in $y$ on top, change in $x$ below.") },
        { latex: "\\frac{\\hl{6}}{\\hl{3}}", note: L("$6$ omhoog en $3$ opzij.", "$6$ up and $3$ sideways.") },
        { latex: "\\hl{2}", note: L("Dus $a=2$: elke stap $2$ omhoog.", "So $a=2$: every step $2$ up.") },
      ],
    },
  },
  {
    id: "u3.find-b",
    name: L("$b$ berekenen", "Finding $b$"),
    statement: L(
      "Weet je $a$ en één punt? Vul het punt in $y=ax+b$ in. Los $b$ op met de balans.",
      "Do you know $a$ and one point? Put the point into $y=ax+b$. Solve for $b$ with the balance.",
    ),
    lessonId: "u3.line-formula",
    example: {
      problem: L("De lijn $y=2x+b$ gaat door $(3,\\ 10)$. Bereken $b$.", "The line $y=2x+b$ goes through $(3,\\ 10)$. Work out $b$."),
      steps: [
        { latex: "10=2\\cdot\\hl{3}+b", note: L("Vul $x=3$ en $y=10$ in.", "Put in $x=3$ and $y=10$.") },
        { latex: "10=\\hl{6}+b", note: L("Reken het keer-stuk uit.", "Work out the multiplication.") },
        { latex: "b=\\hl{4}", note: L("Balans: haal links en rechts $6$ weg. Dus $y=2x+4$.", "Balance: subtract $6$ on both sides. So $y=2x+4$.") },
      ],
      solutions: [{ b: 4 }],
    },
  },
  {
    id: "u3.axis-intercepts",
    name: L("Snijpunten met de assen", "Crossing the axes"),
    statement: L(
      "Met de $x$-as: daar is $y=0$. Met de $y$-as: daar is $x=0$. Vul $0$ in en reken de andere letter uit.",
      "With the $x$-axis: there $y=0$. With the $y$-axis: there $x=0$. Put in $0$ and work out the other letter.",
    ),
    lessonId: "u3.axis-intercepts",
    example: {
      problem: L("Waar snijdt $y=2x-6$ de $x$-as?", "Where does $y=2x-6$ cross the $x$-axis?"),
      steps: [
        { latex: "2x-6=\\hl{0}", note: L("Op de $x$-as is $y=0$.", "On the $x$-axis $y=0$.") },
        { latex: "2x=\\hl{6}", note: L("Balans: tel links en rechts $6$ op.", "Balance: add $6$ on both sides.") },
        { latex: "x=\\hl{3}", note: L("Deel door $2$. Het snijpunt is $(3,\\ 0)$.", "Divide by $2$. The intersection is $(3,\\ 0)$.") },
      ],
      solutions: [{ x: 3 }],
    },
  },
  {
    id: "u3.intersection",
    name: L("Stel gelijk", "Set equal"),
    statement: L(
      "Snijpunt van twee lijnen: daar is $y$ even groot. Zet de formules gelijk, los $x$ op, en vul $x$ in voor $y$.",
      "Intersection of two lines: there $y$ is the same. Set the formulas equal, solve for $x$, and put $x$ back in for $y$.",
    ),
    lessonId: "u3.intersection",
    example: {
      problem: L("Bereken het snijpunt van $y=2x+1$ en $y=-x+7$.", "Work out the intersection of $y=2x+1$ and $y=-x+7$."),
      steps: intersectionSteps(F(2), F(1), F(-1), F(7), "2x+1", "-x+7", F(2), F(5)),
      solutions: [{ x: 2, y: 5 }],
    },
  },
  {
    id: "u3.elimination",
    name: L("Optellen of aftrekken", "Add or subtract"),
    statement: L(
      "Tel de twee vergelijkingen op of trek ze af, zodat één letter wegvalt. Niet evenveel? Vermenigvuldig eerst een hele vergelijking.",
      "Add or subtract the two equations so one letter drops out. Not the same number? First multiply a whole equation.",
    ),
    lessonId: "u3.elimination",
    example: {
      problem: L("Los op: $2x+y=11$ en $x+y=7$.", "Solve: $2x+y=11$ and $x+y=7$."),
      steps: eliminationSteps({ p: F(2), q: F(1), c: F(11) }, { p: F(1), q: F(1), c: F(7) }, 1, 1, "sub", F(4), F(3)),
      solutions: [{ x: 4, y: 3 }],
    },
  },
  {
    id: "u3.substitution",
    name: L("Invullen", "Substitution"),
    statement: L(
      "Staat er al $y=\\ldots$? Zet dat tussen haakjes in de andere vergelijking. Dan houd je één letter over.",
      "Does one equation already say $y=\\ldots$? Put it in brackets into the other equation. Then one letter is left.",
    ),
    lessonId: "u3.substitution",
    example: {
      problem: L("Los op: $y=2x$ en $x+y=9$.", "Solve: $y=2x$ and $x+y=9$."),
      steps: substitutionSteps("y", F(2), F(0), { p: F(1), q: F(1), c: F(9) }, F(3), F(6)),
      solutions: [{ x: 3, y: 6 }],
    },
  },
  {
    id: "u3.word-system",
    name: L("Van verhaal naar stelsel", "From story to system"),
    statement: L(
      "Kies een letter voor elk onbekend getal. Schrijf elke zin met een bedrag als vergelijking. Los dan het stelsel op en controleer met het verhaal.",
      "Choose a letter for each unknown number. Write each sentence with an amount as an equation. Then solve the system and check with the story.",
    ),
    lessonId: "u3.word-systems",
    example: {
      problem: L(
        "$3$ broodjes en $1$ koffie kosten €$11$. $1$ broodje en $1$ koffie kosten €$5$. $x$ is een broodje, $y$ een koffie.",
        "$3$ sandwiches and $1$ coffee cost €$11$. $1$ sandwich and $1$ coffee cost €$5$. $x$ is a sandwich, $y$ a coffee.",
      ),
      steps: eliminationSteps({ p: F(3), q: F(1), c: F(11) }, { p: F(1), q: F(1), c: F(5) }, 1, 1, "sub", F(3), F(2)),
      solutions: [{ x: 3, y: 2 }],
    },
  },
];
