/**
 * Lesson 2: fractions. What a fraction is, equal fractions and simplifying,
 * a fraction of a number, adding and subtracting fractions.
 */
import type { Lesson } from "@/content/types";
import { L } from "../helpers";

export const fractionsLesson: Lesson = {
  id: "u0.fractions",
  title: L("Breuken", "Fractions"),
  goal: L(
    "Je vereenvoudigt breuken, neemt een breuk van een getal en telt breuken op.",
    "You simplify fractions, take a fraction of a number and add fractions.",
  ),
  minutes: 10,
  calculator: "off",
  calculatorOffReason: L(
    "De rekenmachine staat uit. Breuken leer je met de hand en met plaatjes.",
    "The calculator is off. You learn fractions by hand and with pictures.",
  ),
  info: {
    what: L(
      "Een breuk is een deel van een geheel, zoals $\\frac{3}{4}$ van een pizza.",
      "A fraction is a part of a whole, like $\\frac{3}{4}$ of a pizza.",
    ),
    why: L(
      "Breuken zitten overal: in recepten, kansen, formules en hellingen.",
      "Fractions are everywhere: in recipes, chances, formulas and slopes.",
    ),
    later: L(
      "Bij vergelijkingen, kansrekenen en afgeleiden. In AI zijn kansen tussen $0$ en $1$ vaak breuken.",
      "In equations, probability and derivatives. In AI, probabilities between $0$ and $1$ are often fractions.",
    ),
  },
  screens: [
    {
      kind: "visual",
      title: L("Wat is een breuk?", "What is a fraction?"),
      body: L(
        "Verdeel een strook in $4$ gelijke stukken. Kleur er $3$.\nDat is $\\frac{3}{4}$.\nOnder (de **noemer**): in hoeveel stukken.\nBoven (de **teller**): hoeveel stukken je neemt.",
        "Cut a strip into $4$ equal pieces. Colour $3$ of them.\nThat is $\\frac{3}{4}$.\nBottom (the **denominator**): how many pieces.\nTop (the **numerator**): how many pieces you take.",
      ),
      visual: { kind: "fraction-bar", bars: [{ num: 3, den: 4 }], allowSplit: false },
      task: L("Tel de gekleurde stukken. Tel daarna alle stukken.", "Count the coloured pieces. Then count all pieces."),
    },
    {
      kind: "visual",
      title: L("Gelijke breuken", "Equal fractions"),
      body: L(
        "Knip elk stuk in tweeën. Er is evenveel gekleurd.\nDus $\\frac{1}{2}=\\frac{2}{4}=\\frac{3}{6}$.\nDe breuk ziet er anders uit, maar is even groot.",
        "Cut every piece in two. The same amount is coloured.\nSo $\\frac{1}{2}=\\frac{2}{4}=\\frac{3}{6}$.\nThe fraction looks different, but it is the same size.",
      ),
      visual: { kind: "fraction-bar", bars: [{ num: 1, den: 2 }], allowSplit: true },
      task: L("Klik een paar keer op splitsen. Kijk naar de breuk rechts.", "Click split a few times. Watch the fraction on the right."),
    },
    {
      kind: "example",
      title: L("Voorbeeld: vereenvoudigen", "Example: simplifying"),
      problem: L("Vereenvoudig $\\frac{12}{18}$. Beide stroken zijn even ver gekleurd.", "Simplify $\\frac{12}{18}$. Both strips are coloured just as far."),
      visual: { kind: "fraction-bar", bars: [{ num: 12, den: 18 }, { num: 2, den: 3 }], allowSplit: false },
      solution: {
        steps: [
          { latex: "\\frac{12}{18}", note: L("$12$ en $18$ zitten allebei in de tafel van $6$.", "$12$ and $18$ are both in the times table of $6$.") },
          { latex: "\\frac{\\hl{12:6}}{\\hl{18:6}}", note: L("Deel boven en onder door $6$.", "Divide top and bottom by $6$.") },
          { latex: "\\frac{\\ask{2}}{18:6}", note: L("Boven: $12:6=2$.", "Top: $12:6=2$.") },
          { latex: "\\frac{2}{\\ask{3}}", note: L("Onder: $18:6=3$.", "Bottom: $18:6=3$.") },
        ],
      },
    },
    {
      kind: "explain",
      title: L("Vereenvoudigen", "Simplifying"),
      body: L(
        "Deel teller en noemer door hetzelfde getal.\nDe breuk blijft even groot. Hij wordt alleen kleiner geschreven.\nGa door tot het niet meer kan.\nZie [[rule:u0.simplify-fraction]].",
        "Divide numerator and denominator by the same number.\nThe fraction stays the same size. It is just written smaller.\nKeep going until you cannot.\nSee [[rule:u0.simplify-fraction]].",
      ),
      latex: "\\frac{12}{18}=\\frac{2}{3}",
      ruleId: "u0.simplify-fraction",
    },
    {
      kind: "visual",
      title: L("Een breuk van een getal", "A fraction of a number"),
      body: L(
        "Hoeveel is $\\frac{3}{4}$ van $20$?\nVerdeel $20$ stippen in $4$ gelijke groepjes.\nNeem er $3$ groepjes van.",
        "What is $\\frac{3}{4}$ of $20$?\nShare $20$ dots into $4$ equal groups.\nTake $3$ of the groups.",
      ),
      visual: {
        kind: "custom",
        widget: "u0.groups",
        props: { total: 20, parts: [3, 1] },
        describe: L("$20$ stippen, verdeeld in $4$ groepjes van $5$. $3$ groepjes zijn gekleurd.", "$20$ dots, shared into $4$ groups of $5$. $3$ groups are coloured."),
      },
      task: L("Klik op de knop tot alles gekleurd is. Hoeveel stippen zijn gekleurd?", "Click the button until everything is coloured. How many dots are coloured?"),
    },
    {
      kind: "explain",
      title: L("Van betekent keer", "Of means times"),
      body: L(
        "$\\frac{3}{4}$ van $20$ is $\\frac{3}{4}\\cdot 20$.\nDeel door de noemer: $20:4=5$. Dat is één groepje.\nDoe keer de teller: $3\\cdot 5=15$.\nZie [[rule:u0.fraction-of]].",
        "$\\frac{3}{4}$ of $20$ is $\\frac{3}{4}\\cdot 20$.\nDivide by the denominator: $20:4=5$. That is one group.\nMultiply by the numerator: $3\\cdot 5=15$.\nSee [[rule:u0.fraction-of]].",
      ),
      ruleId: "u0.fraction-of",
    },
    {
      kind: "visual",
      title: L("Breuken optellen", "Adding fractions"),
      body: L(
        "$\\frac{1}{2}+\\frac{1}{3}$: de stukken zijn niet even groot.\nJe kunt ze pas optellen als de stukken gelijk zijn.\nSplits beide stroken tot ze dezelfde stukken hebben.",
        "$\\frac{1}{2}+\\frac{1}{3}$: the pieces are not the same size.\nYou can only add them when the pieces are equal.\nSplit both strips until they have the same pieces.",
      ),
      visual: { kind: "fraction-bar", bars: [{ num: 1, den: 2 }, { num: 1, den: 3 }], allowSplit: true },
      task: L(
        "Maak van allebei zesden. Splits de bovenste strook tot $\\frac{3}{6}$. Splits de onderste tot $\\frac{2}{6}$.",
        "Turn both into sixths. Split the top strip to $\\frac{3}{6}$. Split the bottom one to $\\frac{2}{6}$.",
      ),
    },
    {
      kind: "example",
      title: L("Voorbeeld: $\\frac{2}{3}+\\frac{1}{4}$", "Example: $\\frac{2}{3}+\\frac{1}{4}$"),
      problem: L("Tel op: $\\frac{2}{3}+\\frac{1}{4}$.", "Add: $\\frac{2}{3}+\\frac{1}{4}$."),
      visual: { kind: "fraction-bar", bars: [{ num: 2, den: 3 }, { num: 1, den: 4 }], allowSplit: true },
      solution: {
        steps: [
          { latex: "\\frac{2}{3}+\\frac{1}{4}", note: L("De noemers $3$ en $4$ zijn niet gelijk.", "The denominators $3$ and $4$ are not equal.") },
          {
            latex: "\\frac{\\hl{2\\cdot 4}}{\\hl{3\\cdot 4}}+\\frac{\\hl{1\\cdot 3}}{\\hl{4\\cdot 3}}",
            note: L(
              "$12$ zit in de tafel van $3$ én van $4$. Maak van beide twaalfden: boven en onder keer hetzelfde getal.",
              "$12$ is in the times table of $3$ and of $4$. Turn both into twelfths: top and bottom times the same number.",
            ),
          },
          { latex: "\\frac{\\ask{8}}{12}+\\frac{1\\cdot 3}{4\\cdot 3}", note: L("Boven: $2\\cdot 4=8$.", "Top: $2\\cdot 4=8$.") },
          { latex: "\\frac{8}{12}+\\frac{\\ask{3}}{12}", note: L("Boven: $1\\cdot 3=3$.", "Top: $1\\cdot 3=3$.") },
          { latex: "\\frac{\\ask{11}}{12}", note: L("Tel de tellers op: $8+3=11$.", "Add the numerators: $8+3=11$.") },
        ],
      },
    },
    {
      kind: "explain",
      title: L("Breuken optellen", "Adding fractions"),
      body: L(
        "Maak eerst de noemers gelijk. Doe boven en onder keer hetzelfde getal.\nTel dan alleen de tellers op. De noemer blijft hetzelfde.\nAftrekken gaat net zo.\nZie [[rule:u0.add-fractions]].",
        "First make the denominators equal. Multiply top and bottom by the same number.\nThen add only the numerators. The denominator stays the same.\nSubtracting works the same way.\nSee [[rule:u0.add-fractions]].",
      ),
      latex: "\\frac{a}{n}+\\frac{b}{n}=\\frac{a+b}{n}",
      ruleId: "u0.add-fractions",
    },
  ],
  practice: [
    { generatorId: "u0.simplify-fraction", difficulty: 1, count: 1 },
    { generatorId: "u0.fraction-of", difficulty: 1, count: 1 },
    { generatorId: "u0.add-fractions", difficulty: 1, count: 1 },
    { generatorId: "u0.simplify-fraction", difficulty: 2, count: 1 },
    { generatorId: "u0.fraction-of", difficulty: 2, count: 1 },
    { generatorId: "u0.add-fractions", difficulty: 2, count: 2 },
    { generatorId: "u0.simplify-fraction", difficulty: 3, count: 1 },
    { generatorId: "u0.fraction-of", difficulty: 3, count: 1 },
    { generatorId: "u0.add-fractions", difficulty: 3, count: 1 },
  ],
};
