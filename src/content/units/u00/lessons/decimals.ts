/**
 * Lesson 3: decimals. Place value, times and divided by 10/100/1000,
 * decimals and fractions, adding and multiplying decimals.
 */
import type { Lesson } from "@/content/types";
import { L, custom } from "../helpers";

export const decimalsLesson: Lesson = {
  id: "u0.decimals",
  title: L("Kommagetallen", "Decimals"),
  goal: L(
    "Je schuift cijfers bij keer $10$, schrijft kommagetallen als breuk en rekent met kommagetallen.",
    "You move digits when multiplying by $10$, write decimals as fractions and calculate with decimals.",
  ),
  minutes: 10,
  calculator: "off",
  calculatorOffReason: L(
    "De rekenmachine staat uit. Je leert hoe de komma werkt.",
    "The calculator is off. You learn how the decimal point works.",
  ),
  info: {
    what: L(
      "Kommagetallen zijn getallen met cijfers achter de komma, zoals $3.75$. Ze zijn breuken met $10$, $100$ of $1000$ onder de streep.",
      "Decimals are numbers with digits after the point, like $3.75$. They are fractions with $10$, $100$ or $1000$ at the bottom.",
    ),
    why: L(
      "Geld, metingen en de rekenmachine werken allemaal met kommagetallen.",
      "Money, measurements and the calculator all work with decimals.",
    ),
    later: L(
      "Bij eenheden omrekenen, procenten en wetenschappelijke notatie. Computers en AI rekenen bijna alles met kommagetallen.",
      "In unit conversion, percentages and scientific notation. Computers and AI do almost all their sums with decimals.",
    ),
  },
  screens: [
    {
      kind: "visual",
      title: L("Elk cijfer heeft een plek", "Every digit has a place"),
      body: L(
        "In $3.75$ staat de $3$ op de plek van de **enen**.\nDe $7$ staat op de **tienden**. De $5$ op de **honderdsten**.\nDe komma zit altijd rechts van de enen.",
        "In $3.75$ the $3$ is in the **ones** place.\nThe $7$ is in the **tenths**. The $5$ in the **hundredths**.\nThe point is always just right of the ones.",
      ),
      visual: custom("u0.place-value", { value: "3.75", factor: 100, op: "*" }, L("Een plaatswaardekaart met $3.75$.", "A place value chart with $3.75$.")),
      task: L("Klik twee keer op $\\times 10$. Waar staat de $7$ nu? Wat is het getal?", "Click $\\times 10$ twice. Where is the $7$ now? What is the number?"),
    },
    {
      kind: "explain",
      title: L("Keer en gedeeld door 10", "Times and divided by 10"),
      body: L(
        "Keer $10$: elk cijfer schuift één plek naar links.\nKeer $100$: twee plekken. Keer $1000$: drie plekken.\nGedeeld door: de cijfers schuiven naar rechts.\nTel de nullen: zoveel plekken schuif je.\nZie [[rule:u0.times-ten]].",
        "Times $10$: every digit moves one place to the left.\nTimes $100$: two places. Times $1000$: three places.\nDivided by: the digits move to the right.\nCount the zeros: that is how many places you move.\nSee [[rule:u0.times-ten]].",
      ),
      latex: "3.75\\cdot 100=375",
      ruleId: "u0.times-ten",
    },
    {
      kind: "example",
      title: L("Voorbeeld: $42:100$", "Example: $42:100$"),
      problem: L("Bereken $42:100$.", "Work out $42:100$."),
      visual: custom("u0.place-value", { value: "42", factor: 100, op: ":" }, L("Een plaatswaardekaart met $42$.", "A place value chart with $42$.")),
      solution: {
        steps: [
          { latex: "42:100", note: L("Gedeeld door $100$: twee plekken naar rechts.", "Divided by $100$: two places to the right.") },
          { latex: "42:\\hl{10}:\\hl{10}", note: L("$100$ is twee keer $10$.", "$100$ is $10$ twice.") },
          { latex: "\\ask{4.2}:10", note: L("Eén plek naar rechts.", "One place to the right.") },
          { latex: "\\ask{0.42}", note: L("Nog één plek. Er komt een $0$ voor de komma.", "One more place. A $0$ goes before the point.") },
        ],
      },
    },
    {
      kind: "visual",
      title: L("Kommagetal als breuk", "A decimal as a fraction"),
      body: L(
        "Het hele vierkant is $1$. Eén vakje is $0.01$.\n$0.35$ is $35$ vakjes van de $100$.\nDus $0.35=\\frac{35}{100}$.",
        "The whole square is $1$. One square is $0.01$.\n$0.35$ is $35$ squares out of $100$.\nSo $0.35=\\frac{35}{100}$.",
      ),
      visual: custom("u0.hundred-grid", { percent: 35, mode: "decimal" }, L("Honderd vakjes. Je kleurt er $35$.", "A hundred squares. You colour $35$.")),
      task: L("Kleur $0.35$: drie rijen en vijf losse vakjes.", "Colour $0.35$: three rows and five single squares."),
    },
    {
      kind: "example",
      title: L("Voorbeeld: $0.35$ als breuk", "Example: $0.35$ as a fraction"),
      problem: L("Schrijf $0.35$ als breuk. Vereenvoudig zo ver mogelijk.", "Write $0.35$ as a fraction. Simplify as far as possible."),
      solution: {
        steps: [
          { latex: "0.35", note: L("Twee cijfers achter de komma: honderdsten.", "Two digits after the point: hundredths.") },
          { latex: "\\frac{\\ask{35}}{100}", note: L("$35$ honderdsten.", "$35$ hundredths.") },
          { latex: "\\frac{\\hl{35:5}}{\\hl{100:5}}", note: L("Deel boven en onder door $5$.", "Divide top and bottom by $5$.") },
          { latex: "\\frac{\\ask{7}}{20}", note: L("Klaar.", "Done.") },
        ],
      },
    },
    {
      kind: "explain",
      title: L("Breuk naar kommagetal", "Fraction to decimal"),
      body: L(
        "Andersom kan ook. Maak de noemer $10$, $100$ of $1000$.\n$\\frac{3}{4}=\\frac{75}{100}=0.75$.\nZie [[rule:u0.decimal-fraction]].",
        "It works the other way too. Make the denominator $10$, $100$ or $1000$.\n$\\frac{3}{4}=\\frac{75}{100}=0.75$.\nSee [[rule:u0.decimal-fraction]].",
      ),
      ruleId: "u0.decimal-fraction",
    },
    {
      kind: "visual",
      title: L("Optellen op de getallenlijn", "Adding on the number line"),
      body: L(
        "$2.7+1.6$: begin bij $2.7$ en spring $1.6$ naar rechts.\nEerst de hele: $2+1=3$. Dan de tienden: $0.7+0.6=1.3$.\nSamen $4.3$.",
        "$2.7+1.6$: start at $2.7$ and jump $1.6$ to the right.\nFirst the wholes: $2+1=3$. Then the tenths: $0.7+0.6=1.3$.\nTogether $4.3$.",
      ),
      visual: { kind: "number-line", min: 0, max: 6, start: 2.7, jumps: [1.6], denominator: 10 },
      task: L("Speel de sprong af. Waar kom je uit?", "Play the jump. Where do you land?"),
    },
    {
      kind: "visual",
      title: L("Keer met kommagetallen", "Multiplying decimals"),
      body: L(
        "$0.3\\cdot 0.4$ is een rechthoek van $0.3$ bij $0.4$.\nDie rechthoek is $12$ vakjes van de $100$.\nDus $0.3\\cdot 0.4=0.12$. Niet $1.2$!",
        "$0.3\\cdot 0.4$ is a rectangle of $0.3$ by $0.4$.\nThat rectangle is $12$ squares out of $100$.\nSo $0.3\\cdot 0.4=0.12$. Not $1.2$!",
      ),
      visual: custom(
        "u0.hundred-grid",
        { percent: 12, mode: "decimal", rect: { cols: 3, rows: 4 } },
        L("Een vierkant van $1$ bij $1$ met een rechthoek van $0.3$ bij $0.4$.", "A $1$ by $1$ square with a $0.3$ by $0.4$ rectangle."),
      ),
      task: L("Speel het af en tel de gekleurde vakjes.", "Play it and count the coloured squares."),
    },
    {
      kind: "explain",
      title: L("Rekenen met kommagetallen", "Calculating with decimals"),
      body: L(
        "Optellen en aftrekken: zet de komma's onder elkaar.\nKeer: reken eerst zonder komma. Tel dan de cijfers achter de komma van beide getallen.\n$0.3\\cdot 0.4$: $3\\cdot 4=12$, en $1+1=2$ cijfers, dus $0.12$.\nZie [[rule:u0.decimal-arithmetic]].",
        "Adding and subtracting: line up the decimal points.\nMultiplying: first calculate without points. Then count the decimals of both numbers.\n$0.3\\cdot 0.4$: $3\\cdot 4=12$, and $1+1=2$ decimals, so $0.12$.\nSee [[rule:u0.decimal-arithmetic]].",
      ),
      ruleId: "u0.decimal-arithmetic",
    },
  ],
  practice: [
    { generatorId: "u0.times-ten", difficulty: 1, count: 1 },
    { generatorId: "u0.times-ten", difficulty: 2, count: 1 },
    { generatorId: "u0.decimal-fraction", difficulty: 1, count: 1 },
    { generatorId: "u0.decimal-fraction", difficulty: 2, count: 1 },
    { generatorId: "u0.decimal-arithmetic", difficulty: 1, count: 1 },
    { generatorId: "u0.decimal-arithmetic", difficulty: 2, count: 1 },
    { generatorId: "u0.times-ten", difficulty: 3, count: 1 },
    { generatorId: "u0.decimal-fraction", difficulty: 3, count: 1 },
    { generatorId: "u0.decimal-arithmetic", difficulty: 3, count: 1 },
  ],
};
