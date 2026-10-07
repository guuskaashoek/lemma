/**
 * Lesson 4: ratios. The ratio table and sharing in a ratio.
 */
import type { Lesson } from "@/content/types";
import { L, custom } from "../helpers";

export const ratiosLesson: Lesson = {
  id: "u0.ratios",
  title: L("Verhoudingen", "Ratios"),
  goal: L(
    "Je rekent met een verhoudingstabel en je verdeelt iets in een verhouding.",
    "You calculate with a ratio table and you share something in a ratio.",
  ),
  minutes: 8,
  calculator: "off",
  calculatorOffReason: L(
    "De rekenmachine staat uit. Met een verhoudingstabel lukt het met de hand.",
    "The calculator is off. With a ratio table you can do it by hand.",
  ),
  info: {
    what: L(
      "Twee dingen die samen groeien: twee keer zoveel pakken kost twee keer zoveel geld.",
      "Two things that grow together: twice as many cartons cost twice as much money.",
    ),
    why: L(
      "Recepten, prijzen, kaarten en snelheid werken zo. En procenten bouwen hierop.",
      "Recipes, prices, maps and speed work like this. And percentages build on it.",
    ),
    later: L(
      "Bij procenten, schaal, lineaire formules en kansen. In AI worden gegevens vaak met dezelfde verhouding geschaald.",
      "In percentages, scale, linear formulas and probability. In AI, data is often scaled by one ratio.",
    ),
  },
  screens: [
    {
      kind: "visual",
      title: L("De verhoudingstabel", "The ratio table"),
      body: L(
        "$3$ pakken sap kosten $4.50$ euro.\nWat kosten $6$ pakken? Twee keer zoveel pakken, dus twee keer zoveel geld.\nBoven keer $2$, onder ook keer $2$.",
        "$3$ cartons of juice cost $4.50$ euros.\nWhat do $6$ cartons cost? Twice as many cartons, so twice as much money.\nTop times $2$, below times $2$ too.",
      ),
      visual: custom(
        "u0.ratio-table",
        { top: L("pakken", "cartons"), bottom: L("euro", "euros"), a: 3, b: 4.5, c: 6, money: true },
        L("Een verhoudingstabel: $3$ pakken kosten $4.50$ euro, $6$ pakken kosten een vraagteken.", "A ratio table: $3$ cartons cost $4.50$ euros, $6$ cartons cost a question mark."),
      ),
      task: L("Klik op volgende stap. Welke pijl komt onder?", "Click next step. Which arrow appears below?"),
    },
    {
      kind: "visual",
      title: L("Via $1$", "Through $1$"),
      body: L(
        "Wat kosten $7$ pakken? $7$ is geen keer-getal van $3$.\nGa dan eerst naar $1$ pak: deel door $3$.\nGa daarna naar $7$: keer $7$.",
        "What do $7$ cartons cost? $7$ is not a multiple of $3$.\nThen first go to $1$ carton: divide by $3$.\nThen go to $7$: times $7$.",
      ),
      visual: custom(
        "u0.ratio-table",
        { top: L("pakken", "cartons"), bottom: L("euro", "euros"), a: 3, b: 4.5, c: 7, via: 1, money: true },
        L("Een verhoudingstabel van $3$ via $1$ naar $7$ pakken.", "A ratio table from $3$ through $1$ to $7$ cartons."),
      ),
      task: L("Speel het af. Wat kost $1$ pak? En $7$ pakken?", "Play it. What does $1$ carton cost? And $7$ cartons?"),
    },
    {
      kind: "example",
      title: L("Voorbeeld: recept", "Example: recipe"),
      problem: L(
        "Voor $4$ personen heb je $300$ gram pasta nodig. Hoeveel gram voor $6$ personen?",
        "For $4$ people you need $300$ grams of pasta. How many grams for $6$ people?",
      ),
      visual: custom(
        "u0.ratio-table",
        { top: L("personen", "people"), bottom: L("gram", "grams"), a: 4, b: 300, c: 6, via: 2 },
        L("Een verhoudingstabel van $4$ via $2$ naar $6$ personen.", "A ratio table from $4$ through $2$ to $6$ people."),
      ),
      solution: {
        steps: [
          { latex: "300:2\\cdot 3", note: L("$2$ past in $4$ én in $6$. Ga van $4$ naar $2$ (gedeeld door $2$), dan naar $6$ (keer $3$).", "$2$ goes into $4$ and into $6$. Go from $4$ to $2$ (divided by $2$), then to $6$ (times $3$).") },
          { latex: "\\ask{150}\\cdot 3", note: L("Voor $2$ personen: $150$ gram.", "For $2$ people: $150$ grams.") },
          { latex: "\\ask{450}", note: L("Voor $6$ personen: $450$ gram.", "For $6$ people: $450$ grams.") },
        ],
      },
    },
    {
      kind: "explain",
      title: L("De regel", "The rule"),
      body: L(
        "Wat je boven doet, doe je onder ook.\nAlleen keer en gedeeld door. Nooit plus of min.\nLastig getal? Ga eerst naar $1$, of naar een getal dat in allebei past.\nZie [[rule:u0.ratio-table]].",
        "Whatever you do on top, you also do below.\nOnly multiply and divide. Never add or subtract.\nAwkward number? First go to $1$, or to a number that goes into both.\nSee [[rule:u0.ratio-table]].",
      ),
      ruleId: "u0.ratio-table",
    },
    {
      kind: "visual",
      title: L("Verdelen in een verhouding", "Sharing in a ratio"),
      body: L(
        "Anna en Bram verdelen $40$ euro in de verhouding $2:3$.\nDat zijn $2+3=5$ gelijke groepjes.\nAnna krijgt $2$ groepjes, Bram $3$.",
        "Anna and Bram share $40$ euros in the ratio $2:3$.\nThat is $2+3=5$ equal groups.\nAnna gets $2$ groups, Bram $3$.",
      ),
      visual: custom(
        "u0.groups",
        { total: 40, parts: [2, 3], names: [L("Anna", "Anna"), L("Bram", "Bram")] },
        L("$40$ stippen in $5$ groepjes van $8$: $2$ voor Anna en $3$ voor Bram.", "$40$ dots in $5$ groups of $8$: $2$ for Anna and $3$ for Bram."),
      ),
      task: L("Speel het af. Hoeveel krijgt Anna? Hoeveel Bram?", "Play it. How much does Anna get? How much does Bram get?"),
    },
    {
      kind: "example",
      title: L("Voorbeeld: limonade", "Example: lemonade"),
      problem: L(
        "Siroop en water gaan in de verhouding $1:4$. Je maakt $500$ ml limonade. Hoeveel ml siroop?",
        "Syrup and water go in the ratio $1:4$. You make $500$ ml of lemonade. How many ml of syrup?",
      ),
      solution: {
        steps: [
          { latex: "\\frac{500}{1+4}\\cdot 1", note: L("Tel de delen op: $1+4$.", "Add the parts: $1+4$.") },
          { latex: "\\frac{500}{\\ask{5}}", note: L("$5$ groepjes.", "$5$ groups.") },
          { latex: "\\ask{100}", note: L("Eén groepje is $100$ ml. Siroop is $1$ groepje.", "One group is $100$ ml. Syrup is $1$ group.") },
        ],
      },
    },
    {
      kind: "explain",
      title: L("Verdelen: de stappen", "Sharing: the steps"),
      body: L(
        "1. Tel de delen op.\n2. Deel het totaal door die som. Dat is één groepje.\n3. Doe keer het aantal groepjes dat je zoekt.\nZie [[rule:u0.ratio-share]].",
        "1. Add the parts.\n2. Divide the total by that sum. That is one group.\n3. Multiply by the number of groups you want.\nSee [[rule:u0.ratio-share]].",
      ),
      ruleId: "u0.ratio-share",
    },
  ],
  practice: [
    { generatorId: "u0.ratio-table", difficulty: 1, count: 2 },
    { generatorId: "u0.ratio-share", difficulty: 1, count: 1 },
    { generatorId: "u0.ratio-table", difficulty: 2, count: 2 },
    { generatorId: "u0.ratio-share", difficulty: 2, count: 2 },
    { generatorId: "u0.ratio-table", difficulty: 3, count: 1 },
    { generatorId: "u0.ratio-share", difficulty: 3, count: 1 },
  ],
};
