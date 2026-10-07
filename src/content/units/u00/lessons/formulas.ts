/**
 * Lesson 7: formulas, tables and graphs. Filling in a formula, the table
 * it makes, and the graph through the points of that table.
 */
import type { Lesson } from "@/content/types";
import { L } from "../helpers";

export const formulasLesson: Lesson = {
  id: "u0.formulas",
  title: L("Formules, tabellen en grafieken", "Formulas, tables and graphs"),
  goal: L(
    "Je vult een formule in en leest een tabel en een grafiek af.",
    "You fill in a formula and read a table and a graph.",
  ),
  minutes: 9,
  calculator: "allowed",
  calculatorOffReason: L(
    "Bij deze opgave staat de rekenmachine uit. Die reken je met de hand.",
    "The calculator is off for this exercise. You do this one by hand.",
  ),
  info: {
    what: L(
      "Een formule is een rekenrecept. Stop er een getal in en er komt een getal uit. Alle uitkomsten samen geven een tabel en een grafiek.",
      "A formula is a recipe for calculating. Put a number in and a number comes out. All results together give a table and a graph.",
    ),
    why: L(
      "Prijzen, afstanden en groei schrijf je als formule. Met een tabel of grafiek zie je meteen wat er gebeurt.",
      "Prices, distances and growth are written as formulas. A table or graph shows straight away what happens.",
    ),
    later: L(
      "Dit is het begin van functies. Een AI-model is ook een formule: getallen erin, een voorspelling eruit.",
      "This is the start of functions. An AI model is a formula too: numbers in, a prediction out.",
    ),
  },
  screens: [
    {
      kind: "explain",
      title: L("Een formule is een machine", "A formula is a machine"),
      body: L(
        "Een taxi rekent $K=4+2a$.\n$a$ is het aantal kilometers. $K$ is de prijs in euro.\nStop een getal in de machine op de plek van $a$. Er komt een prijs uit.",
        "A taxi charges $K=4+2a$.\n$a$ is the number of kilometres. $K$ is the price in euros.\nPut a number into the machine in place of $a$. A price comes out.",
      ),
      latex: "K=4+2a",
      metaphor: "machine",
    },
    {
      kind: "visual",
      title: L("De machine maakt een tabel", "The machine makes a table"),
      body: L(
        "De machine doet: keer $2$, dan plus $4$.\nElk getal dat je erin stopt, komt in de tabel.",
        "The machine does: times $2$, then add $4$.\nEvery number you put in goes into the table.",
      ),
      visual: { kind: "function-machine", latex: "4+2x", inputs: [0, 1, 2, 3, 10] },
      task: L("Stop $0$, $1$, $2$ en $3$ erin. Hoeveel komt er steeds bij?", "Put in $0$, $1$, $2$ and $3$. How much is added each time?"),
      metaphor: "machine",
    },
    {
      kind: "example",
      title: L("Voorbeeld: invullen", "Example: filling in"),
      problem: L("Bereken $K$ als $a=7$. De formule is $K=4+2a$.", "Work out $K$ when $a=7$. The formula is $K=4+2a$."),
      solution: {
        steps: [
          { latex: "K=4+2\\cdot\\hl{7}", note: L("Op de plek van $a$ komt $7$. Let op: $2a$ betekent $2\\cdot a$.", "$7$ goes where $a$ was. Note: $2a$ means $2\\cdot a$.") },
          { latex: "K=4+\\ask{14}", note: L("Keer gaat vóór plus.", "Multiply comes before add.") },
          { latex: "K=\\ask{18}", note: L("De rit kost $18$ euro.", "The ride costs $18$ euros.") },
        ],
        solutions: [{ K: 18 }],
      },
    },
    {
      kind: "explain",
      title: L("Invullen: de regels", "Filling in: the rules"),
      body: L(
        "Vervang elke letter door zijn getal.\nEen getal vlak voor een letter betekent keer: $2a=2\\cdot a$.\nStaan er haakjes in de formule? Die blijven staan: $2(l+b)=2\\cdot(l+b)$.\nReken dan uit met de rekenvolgorde.\nZie [[rule:u0.substitute]].",
        "Replace every letter by its number.\nA number right before a letter means times: $2a=2\\cdot a$.\nAre there brackets in the formula? They stay: $2(l+b)=2\\cdot(l+b)$.\nThen work it out with the order of operations.\nSee [[rule:u0.substitute]].",
      ),
      ruleId: "u0.substitute",
    },
    {
      kind: "visual",
      title: L("Van tabel naar grafiek", "From table to graph"),
      body: L(
        "Elk paar uit de tabel is een punt: $(0,4)$, $(1,6)$, $(2,8)$, $(3,10)$.\nDe punten liggen op één rechte lijn.\nOp de lijn kun je ook tussen de punten aflezen.",
        "Every pair from the table is a point: $(0,4)$, $(1,6)$, $(2,8)$, $(3,10)$.\nThe points lie on one straight line.\nOn the line you can also read between the points.",
      ),
      visual: {
        kind: "plane",
        x: [-1, 8],
        y: [-2, 22],
        graphs: [{ latex: "2x+4" }],
        points: [
          { x: 0, y: 4 },
          { x: 1, y: 6 },
          { x: 2, y: 8 },
          { x: 3, y: 10 },
        ],
        tracer: { graph: 0, start: 0 },
      },
      task: L("Sleep de punt naar $x=5$. Welke $y$ lees je af? Klopt dat met $4+2\\cdot 5$?", "Drag the point to $x=5$. Which $y$ do you read? Does it match $4+2\\cdot 5$?"),
    },
    {
      kind: "explain",
      title: L("Startgetal en stap", "Starting number and step"),
      body: L(
        "Komt er in de tabel steeds hetzelfde bij? Dan is de grafiek een rechte lijn.\nHet **startgetal** is $y$ bij $x=0$. De **stap** is wat er steeds bij komt.\n$y=\\text{start}+\\text{stap}\\cdot x$.\nZie [[rule:u0.read-table]].",
        "Is the same added every time in the table? Then the graph is a straight line.\nThe **starting number** is $y$ at $x=0$. The **step** is what is added each time.\n$y=\\text{start}+\\text{step}\\cdot x$.\nSee [[rule:u0.read-table]].",
      ),
      ruleId: "u0.read-table",
    },
    {
      kind: "example",
      title: L("Voorbeeld: ver vooruit", "Example: far ahead"),
      problem: L(
        "In de tabel is $y$ bij $x=0$ gelijk aan $4$, en er komt steeds $2$ bij. Welke $y$ hoort bij $x=20$?",
        "In the table, $y$ at $x=0$ is $4$, and $2$ is added each time. Which $y$ goes with $x=20$?",
      ),
      solution: {
        steps: [
          { latex: "y=4+2\\cdot 20", note: L("Start $4$, dan $20$ stappen van $2$.", "Start at $4$, then $20$ steps of $2$.") },
          { latex: "y=4+\\ask{40}", note: L("$20$ stappen van $2$.", "$20$ steps of $2$.") },
          { latex: "y=\\ask{44}", note: L("Tel het startgetal erbij.", "Add the starting number.") },
        ],
        solutions: [{ y: 44 }],
      },
    },
  ],
  practice: [
    { generatorId: "u0.formula-substitute", difficulty: 1, count: 2 },
    { generatorId: "u0.table-read", difficulty: 1, count: 1 },
    { generatorId: "u0.formula-substitute", difficulty: 2, count: 2 },
    { generatorId: "u0.table-read", difficulty: 2, count: 1 },
    { generatorId: "u0.formula-substitute", difficulty: 3, count: 1 },
    { generatorId: "u0.table-read", difficulty: 3, count: 1 },
  ],
};
