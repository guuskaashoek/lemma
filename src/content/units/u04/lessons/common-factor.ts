/**
 * Lesson 1: taking out a common factor (buiten haakjes halen), the first
 * kind of factorising (ontbinden in factoren). Expanding brackets, but
 * backwards, with the area model from unit 2.
 */
import type { Lesson } from "@/content/types";
import { commonHeightVisual } from "../gen/common-factor";
import { L } from "../helpers";

export const commonFactorLesson: Lesson = {
  id: "u4.common-factor",
  title: L("Buiten haakjes halen", "Taking out a common factor"),
  goal: L(
    "Je schrijft een som zoals $6x+9$ als een product: $3(2x+3)$.",
    "You write a sum like $6x+9$ as a product: $3(2x+3)$.",
  ),
  minutes: 8,
  calculator: "off",
  calculatorOffReason: L(
    "De rekenmachine staat uit. Ontbinden doe je met de hand.",
    "The calculator is off. You factorise by hand.",
  ),
  info: {
    what: L(
      "Ontbinden in factoren: een som omschrijven tot een keersom. Buiten haakjes halen is de eerste manier.",
      "Factorising: rewriting a sum as a product. Taking out a common factor is the first way.",
    ),
    why: L(
      "Een keersom is vaak handiger. Je ziet sneller wanneer hij nul is. Dat heb je nodig om vergelijkingen met $x^{2}$ op te lossen.",
      "A product is often handier. You see faster when it is zero. You need that to solve equations with $x^{2}$.",
    ),
    later: L(
      "Bij elke vergelijking met $x^{2}$, bij breuken met letters en bij afgeleiden. Ook programma's die formules vereenvoudigen doen dit.",
      "In every equation with $x^{2}$, in fractions with letters and in derivatives. Programs that simplify formulas do this too.",
    ),
  },
  screens: [
    {
      kind: "explain",
      title: L("Haakjes wegwerken, maar andersom", "Expanding brackets, in reverse"),
      body: L(
        "In unit 2 werkte je haakjes weg: $3(2x+3)=6x+9$.\nNu doe je het andersom. Je begint met $6x+9$.\nJe zoekt de keersom die erbij hoort.\nDat heet **ontbinden in factoren**.",
        "In unit 2 you expanded brackets: $3(2x+3)=6x+9$.\nNow you do it in reverse. You start with $6x+9$.\nYou look for the product that belongs to it.\nThis is called **factorising**.",
      ),
      latex: "3(2x+3)\\ \\leftrightarrow\\ 6x+9",
    },
    {
      kind: "visual",
      title: L("Een rechthoek met twee vakken", "A rectangle with two boxes"),
      body: L(
        "Dit is $3(2x+3)$ als rechthoek.\nDe hoogte is $3$. De breedte is $2x+3$.\nDe vakken samen zijn $6x+9$.",
        "This is $3(2x+3)$ as a rectangle.\nThe height is $3$. The width is $2x+3$.\nTogether the boxes are $6x+9$.",
      ),
      visual: { kind: "area-model", rows: ["3"], cols: ["2x", "3"], reveal: "step" },
      task: L(
        "Klik door de vakken. Ontbinden is: je kent de vakken, en je zoekt de hoogte en de breedte.",
        "Click through the boxes. Factorising is: you know the boxes, and you look for the height and the width.",
      ),
    },
    {
      kind: "visual",
      title: L("Zoek de hoogte", "Find the height"),
      body: L(
        "$6x$ is zes blokken $x$. $9$ is negen blokjes.\nKies een aantal rijen.\nPast alles precies in die rijen? Dan heb je een **gemeenschappelijke factor**.",
        "$6x$ is six $x$-blocks. $9$ is nine small blocks.\nChoose a number of rows.\nDoes everything fit those rows exactly? Then you found a **common factor**.",
      ),
      visual: commonHeightVisual([
        [6, "x"],
        [9, ""],
      ]),
      task: L(
        "Probeer $2$ rijen. Probeer daarna $3$ rijen. Welke past precies?",
        "Try $2$ rows. Then try $3$ rows. Which one fits exactly?",
      ),
    },
    {
      kind: "example",
      title: L("Voorbeeld: $6x+9$", "Example: $6x+9$"),
      problem: L("Haal zoveel mogelijk buiten haakjes: $6x+9$.", "Take out as much as possible: $6x+9$."),
      visual: { kind: "area-model", rows: ["3"], cols: ["2x", "3"], reveal: "all" },
      solution: {
        steps: [
          { latex: "6x+9", note: L("Welk getal past in $6$ én in $9$? Dat is $3$.", "Which number goes into $6$ and into $9$? That is $3$.") },
          { latex: "\\hl{3}\\cdot \\ask{2x}+\\hl{3}\\cdot 3", note: L("Schrijf $6x$ als $3$ keer iets.", "Write $6x$ as $3$ times something.") },
          { latex: "\\hl{3}\\cdot 2x+\\hl{3}\\cdot \\ask{3}", note: L("Schrijf $9$ als $3$ keer iets.", "Write $9$ as $3$ times something.") },
          { latex: "\\hl{3}(\\ask{2x+3})", note: L("Zet $3$ vóór de haakjes. Wat overblijft, komt erin.", "Put $3$ in front of the brackets. What is left goes inside.") },
        ],
      },
    },
    {
      kind: "explain",
      title: L("Ook een $x$ kan eruit", "An $x$ can come out too"),
      body: L(
        "In $x^{2}+5x$ zit in beide termen een $x$.\n$x^{2}$ is $x\\cdot x$. En $5x$ is $x\\cdot 5$.\nDus haal je $x$ buiten haakjes: $x(x+5)$.",
        "In $x^{2}+5x$ both terms have an $x$.\n$x^{2}$ is $x\\cdot x$. And $5x$ is $x\\cdot 5$.\nSo you take $x$ out: $x(x+5)$.",
      ),
      latex: "x^{2}+5x=x(x+5)",
    },
    {
      kind: "example",
      title: L("Voorbeeld: $4x^{2}-12x$", "Example: $4x^{2}-12x$"),
      problem: L(
        "Haal zoveel mogelijk buiten haakjes: $4x^{2}-12x$. Hier passen een getal én een $x$ eruit.",
        "Take out as much as possible: $4x^{2}-12x$. Here a number and an $x$ both come out.",
      ),
      visual: { kind: "area-model", rows: ["4x"], cols: ["x", "-3"], reveal: "all" },
      solution: {
        steps: [
          { latex: "4x^{2}-12x", note: L("$4$ past in $4$ en in $12$. En beide termen hebben een $x$.", "$4$ goes into $4$ and into $12$. And both terms have an $x$.") },
          { latex: "\\hl{4x}\\cdot \\ask{x}-\\hl{4x}\\cdot 3", note: L("Schrijf $4x^{2}$ als $4x$ keer iets.", "Write $4x^{2}$ as $4x$ times something.") },
          { latex: "\\hl{4x}\\cdot x-\\hl{4x}\\cdot \\ask{3}", note: L("Schrijf $12x$ als $4x$ keer iets.", "Write $12x$ as $4x$ times something.") },
          { latex: "\\hl{4x}(\\ask{x-3})", note: L("Zet $4x$ vóór de haakjes. Het min-teken gaat mee.", "Put $4x$ in front of the brackets. The minus sign comes along.") },
        ],
      },
    },
    {
      kind: "explain",
      title: L("Controleer altijd", "Always check"),
      body: L(
        "Werk de haakjes weer weg. Krijg je de som van het begin? Dan klopt het.\n$4x(x-3)=4x^{2}-12x$. Klopt!\nZie [[rule:u4.common-factor]].",
        "Expand the brackets again. Do you get the sum you started with? Then it is right.\n$4x(x-3)=4x^{2}-12x$. Correct!\nSee [[rule:u4.common-factor]].",
      ),
      ruleId: "u4.common-factor",
    },
  ],
  practice: [
    { generatorId: "u4.common-factor", difficulty: 1, count: 3 },
    { generatorId: "u4.common-factor", difficulty: 2, count: 3 },
    { generatorId: "u4.common-factor", difficulty: 3, count: 3 },
  ],
};
