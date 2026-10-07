/**
 * Lesson 1: mental arithmetic (splitting) and the order of operations.
 * The first lesson of the app, so it also explains how lessons work.
 */
import type { Lesson } from "@/content/types";
import { L } from "../helpers";

export const arithmeticLesson: Lesson = {
  id: "u0.order-of-operations",
  title: L("Hoofdrekenen en rekenvolgorde", "Mental maths and order of operations"),
  goal: L(
    "Je rekent keersommen uit door te splitsen, en je kent de vaste rekenvolgorde.",
    "You work out products by splitting, and you know the fixed order of operations.",
  ),
  minutes: 9,
  calculator: "off",
  calculatorOffReason: L(
    "De rekenmachine staat uit. Hoofdrekenen leer je met je hoofd.",
    "The calculator is off. You learn mental maths with your head.",
  ),
  info: {
    what: L(
      "Slim rekenen zonder rekenmachine. En afspraken over welke bewerking je eerst doet.",
      "Smart calculating without a calculator. And agreements about which operation comes first.",
    ),
    why: L(
      "Zonder vaste volgorde krijgt iedereen een ander antwoord op dezelfde som. Splitsen maakt grote sommen klein.",
      "Without a fixed order, everyone gets a different answer to the same sum. Splitting makes big sums small.",
    ),
    later: L(
      "Bij elke formule die je invult. Computers en programmeertalen, ook voor AI, gebruiken precies deze volgorde.",
      "In every formula you fill in. Computers and programming languages, also for AI, use exactly this order.",
    ),
  },
  screens: [
    {
      kind: "explain",
      title: L("Welkom", "Welcome"),
      body: L(
        "Elke les heeft vier delen.\n**Uitleg**: één idee per scherm.\n**Voorbeeld**: stap voor stap.\n**Oefenen**: van makkelijk naar moeilijk.\n**Hints**: altijd mogen, nooit straf.",
        "Every lesson has four parts.\n**Explanation**: one idea per screen.\n**Example**: step by step.\n**Practice**: from easy to hard.\n**Hints**: always allowed, never punished.",
      ),
    },
    {
      kind: "explain",
      title: L("Kleuren hebben betekenis", "Colours have meaning"),
      body: L(
        "In formules betekent kleur altijd hetzelfde.\nLetters zoals $x$ hebben één kleur. Getallen zoals $3$ een andere.\nWat in een stap verandert, krijgt een accent: $2+\\hl{12}$.\nDe legenda zie je altijd met toets **L**.",
        "In formulas, colour always means the same thing.\nLetters like $x$ have one colour. Numbers like $3$ another.\nWhat changes in a step gets an accent: $2+\\hl{12}$.\nPress **L** to see the legend at any time.",
      ),
    },
    {
      kind: "visual",
      title: L("Een keersom is een rechthoek", "A product is a rectangle"),
      body: L(
        "$7\\cdot 14$ is een rechthoek van $7$ bij $14$.\nKnip $14$ in $10$ en $4$.\nNu heb je twee kleine rechthoeken. Die zijn makkelijk.",
        "$7\\cdot 14$ is a rectangle of $7$ by $14$.\nCut $14$ into $10$ and $4$.\nNow you have two small rectangles. Those are easy.",
      ),
      visual: { kind: "area-model", rows: ["7"], cols: ["10", "4"], reveal: "step" },
      task: L(
        "Klik twee keer op de knop. Hoeveel is elk vak? Tel de vakken op.",
        "Click the button twice. How much is each box? Add the boxes.",
      ),
    },
    {
      kind: "example",
      title: L("Voorbeeld: $6\\cdot 23$", "Example: $6\\cdot 23$"),
      problem: L("Bereken $6\\cdot 23$ door te splitsen.", "Work out $6\\cdot 23$ by splitting."),
      visual: { kind: "area-model", rows: ["6"], cols: ["20", "3"], reveal: "step" },
      solution: {
        steps: [
          { latex: "6\\cdot 23", note: L("Dit is de som.", "This is the sum.") },
          { latex: "6\\cdot(\\hl{20+3})", note: L("Splits $23$ in $20$ en $3$.", "Split $23$ into $20$ and $3$.") },
          { latex: "\\hl{6\\cdot 20+6\\cdot 3}", note: L("Beide stukken keer $6$.", "Both parts times $6$.") },
          { latex: "\\ask{120}+6\\cdot 3", note: L("$6\\cdot 20=120$.", "$6\\cdot 20=120$.") },
          { latex: "120+\\ask{18}", note: L("$6\\cdot 3=18$.", "$6\\cdot 3=18$.") },
          { latex: "\\ask{138}", note: L("Tel op.", "Add.") },
        ],
      },
    },
    {
      kind: "explain",
      title: L("Splitsen", "Splitting"),
      body: L(
        "Knip een getal in tientallen en eenheden.\nReken elk stuk uit.\nTel de stukken op.\nZie [[rule:u0.split-multiply]].",
        "Cut a number into tens and ones.\nWork out each part.\nAdd the parts.\nSee [[rule:u0.split-multiply]].",
      ),
      latex: "7\\cdot 14=7\\cdot 10+7\\cdot 4",
      ruleId: "u0.split-multiply",
    },
    {
      kind: "visual",
      title: L("Wat doe je eerst?", "What comes first?"),
      body: L(
        "Neem $3+4\\cdot 2$.\nReken je eerst $3+4$? Dan krijg je $14$.\nReken je eerst $4\\cdot 2$? Dan krijg je $11$.\nAllebei kan niet. Daarom is er een vaste volgorde.",
        "Take $3+4\\cdot 2$.\nAdd $3+4$ first? Then you get $14$.\nMultiply $4\\cdot 2$ first? Then you get $11$.\nBoth cannot be right. That is why there is a fixed order.",
      ),
      visual: {
        kind: "custom",
        widget: "u0.order-tap",
        props: { expr: "3+4\\cdot 2" },
        describe: L("De som $3+4\\cdot 2$ met knoppen voor elke bewerking.", "The sum $3+4\\cdot 2$ with a button for each operation."),
      },
      task: L("Tik eerst op de $+$. Wat zegt de app? Tik dan op de $\\cdot$.", "First tap the $+$. What does the app say? Then tap the $\\cdot$."),
    },
    {
      kind: "explain",
      title: L("De rekenvolgorde", "The order of operations"),
      body: L(
        "Onthoud de zin hieronder. De beginletters geven de volgorde.\nHaakjes, dan Machten en Wortels, dan Vermenigvuldigen en Delen, dan Optellen en Aftrekken.\nZie [[rule:u0.order-of-operations]].",
        "Remember the line below. Its first letters give the order.\nBrackets, then Powers and roots, then Multiply and Divide, then Add and Subtract.\nSee [[rule:u0.order-of-operations]].",
      ),
      mnemonic: "hmwvdoa",
      ruleId: "u0.order-of-operations",
    },
    {
      kind: "visual",
      title: L("Probeer het zelf", "Try it yourself"),
      body: L(
        "Hier staan haakjes en een macht.\nTik steeds op de bewerking die nu aan de beurt is.",
        "Here are brackets and a power.\nEach time, tap the operation whose turn it is.",
      ),
      visual: {
        kind: "custom",
        widget: "u0.order-tap",
        props: { expr: "2+3\\cdot(5-1)^{2}" },
        describe: L("De som $2+3\\cdot(5-1)^{2}$ met knoppen voor elke bewerking.", "The sum $2+3\\cdot(5-1)^{2}$ with a button for each operation."),
      },
      task: L("Maak de som helemaal af. Je moet op $50$ uitkomen.", "Finish the whole sum. You should end up at $50$."),
    },
    {
      kind: "example",
      title: L("Voorbeeld: haakjes en keer", "Example: brackets and multiply"),
      problem: L("Bereken $20-2\\cdot(3+4)$.", "Work out $20-2\\cdot(3+4)$."),
      solution: {
        steps: [
          { latex: "20-2\\cdot(3+4)", note: L("Er staan haakjes, een keer en een min.", "There are brackets, a multiply and a minus.") },
          { latex: "20-2\\cdot\\ask{7}", note: L("Eerst de haakjes: $3+4=7$.", "First the brackets: $3+4=7$.") },
          { latex: "20-\\ask{14}", note: L("Dan keer: $2\\cdot 7=14$.", "Then multiply: $2\\cdot 7=14$.") },
          { latex: "\\ask{6}", note: L("Tot slot de min: $20-14=6$.", "Finally the minus: $20-14=6$.") },
        ],
      },
    },
  ],
  practice: [
    { generatorId: "u0.split-multiply", difficulty: 1, count: 2 },
    { generatorId: "u0.split-multiply", difficulty: 2, count: 1 },
    { generatorId: "u0.order-of-operations", difficulty: 1, count: 2 },
    { generatorId: "u0.order-of-operations", difficulty: 2, count: 2 },
    { generatorId: "u0.split-multiply", difficulty: 3, count: 1 },
    { generatorId: "u0.order-of-operations", difficulty: 3, count: 2 },
  ],
};
