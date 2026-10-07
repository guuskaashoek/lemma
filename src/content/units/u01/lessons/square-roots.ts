/**
 * Lesson 5: square roots as the side of a square, estimating roots, cube
 * roots, and roots inside a sum.
 */
import type { Lesson } from "@/content/types";
import { rootSquare } from "../gen/roots";
import { L } from "../helpers";

export const squareRootsLesson: Lesson = {
  id: "u1.square-roots",
  title: L("Wortels", "Square roots"),
  goal: L(
    "Je rekent wortels uit zoals $\\sqrt{49}$, en je schat $\\sqrt{40}$ tussen twee gehele getallen.",
    "You work out roots like $\\sqrt{49}$, and you place $\\sqrt{40}$ between two whole numbers.",
  ),
  minutes: 9,
  calculator: "off",
  calculatorOffReason: L(
    "De rekenmachine staat uit. Je leert hier wortels zien en schatten.",
    "The calculator is off. Here you learn to see and estimate roots.",
  ),
  info: {
    what: L(
      "De wortel van een getal is de zijde van een vierkant met die oppervlakte. $\\sqrt{36}=6$.",
      "The square root of a number is the side of a square with that area. $\\sqrt{36}=6$.",
    ),
    why: L(
      "Wortels zitten in Pythagoras, in de abc-formule en in elke afstand die je uitrekent.",
      "Roots are in Pythagoras, in the quadratic formula and in every distance you work out.",
    ),
    later: L(
      "In AI meet je hoe ver twee punten uit elkaar liggen met een wortel. Zo vindt een model ‘lijkende’ plaatjes of woorden.",
      "In AI you measure how far apart two points are with a root. That is how a model finds ‘similar’ pictures or words.",
    ),
  },
  screens: [
    {
      kind: "visual",
      title: L("Maak een vierkant", "Make a square"),
      body: L(
        "Je hebt $36$ hokjes. Je legt ze in rijen.\nKies hoe lang een rij is.\nBij één lengte vormen de hokjes precies een vierkant.",
        "You have $36$ cells. You put them in rows.\nChoose how long a row is.\nFor one length, the cells make an exact square.",
      ),
      visual: rootSquare(36),
      task: L("Maak de zijde groter tot het precies past. Hoe lang is de zijde dan?", "Make the side bigger until it fits exactly. How long is the side then?"),
    },
    {
      kind: "explain",
      title: L("De wortel is de zijde", "The root is the side"),
      body: L(
        "$36$ hokjes vormen een vierkant van $6$ bij $6$.\nDus de **wortel** van $36$ is $6$. Je schrijft $\\sqrt{36}=6$.\nControle: $6\\cdot 6=36$.\nEen wortel is nooit negatief. Zie [[rule:u1.square-root]].",
        "$36$ cells make a square of $6$ by $6$.\nSo the **square root** of $36$ is $6$. You write $\\sqrt{36}=6$.\nCheck: $6\\cdot 6=36$.\nA square root is never negative. See [[rule:u1.square-root]].",
      ),
      latex: "\\sqrt{36}=6",
      ruleId: "u1.square-root",
    },
    {
      kind: "explain",
      title: L("Ken je kwadraten", "Know your squares"),
      body: L(
        "Wortels gaan sneller als je de kwadraten kent.\n$1,\\ 4,\\ 9,\\ 16,\\ 25,\\ 36,\\ 49,\\ 64,\\ 81,\\ 100$.\nDaarna: $121,\\ 144,\\ 169,\\ 196,\\ 225$.",
        "Roots go faster when you know the squares.\n$1,\\ 4,\\ 9,\\ 16,\\ 25,\\ 36,\\ 49,\\ 64,\\ 81,\\ 100$.\nAfter that: $121,\\ 144,\\ 169,\\ 196,\\ 225$.",
      ),
      latex: "11^{2}=121\\quad 12^{2}=144\\quad 15^{2}=225",
    },
    {
      kind: "visual",
      title: L("Het past niet precies", "It does not fit exactly"),
      body: L(
        "Probeer nu $40$ hokjes.\n$6\\cdot 6=36$ is te weinig. $7\\cdot 7=49$ is te veel.\nDus $\\sqrt{40}$ ligt tussen $6$ en $7$.",
        "Now try $40$ cells.\n$6\\cdot 6=36$ is too few. $7\\cdot 7=49$ is too many.\nSo $\\sqrt{40}$ lies between $6$ and $7$.",
      ),
      visual: rootSquare(40),
      task: L("Probeer zijde $6$ en zijde $7$. Past het ooit precies?", "Try side $6$ and side $7$. Does it ever fit exactly?"),
    },
    {
      kind: "example",
      title: L("Voorbeeld: $\\sqrt{40}$ schatten", "Example: estimating $\\sqrt{40}$"),
      problem: L("Tussen welke twee gehele getallen ligt $\\sqrt{40}$?", "Between which two whole numbers is $\\sqrt{40}$?"),
      solution: {
        steps: [
          { latex: "6^{2}<40", note: L("$6^{2}=36$. Net te klein.", "$6^{2}=36$. Just too small.") },
          { latex: "40<7^{2}", note: L("$7^{2}=49$. Net te groot.", "$7^{2}=49$. Just too big.") },
          { latex: "\\ask{6}<\\sqrt{40}", note: L("Dus $\\sqrt{40}$ is groter dan $6$...", "So $\\sqrt{40}$ is bigger than $6$...") },
          { latex: "\\sqrt{40}<\\ask{7}", note: L("... en kleiner dan $7$.", "... and smaller than $7$.") },
        ],
      },
    },
    {
      kind: "explain",
      title: L("De derdemachtswortel", "The cube root"),
      body: L(
        "Een kubus van $27$ blokjes heeft ribbe $3$, want $3\\cdot 3\\cdot 3=27$.\nJe schrijft $\\sqrt[3]{27}=3$. Dit heet de **derdemachtswortel**.\nDeze mag wel negatief zijn: $\\sqrt[3]{-8}=-2$, want $(-2)^{3}=-8$. Zie [[rule:u1.cube-root]].",
        "A cube of $27$ blocks has edge $3$, because $3\\cdot 3\\cdot 3=27$.\nYou write $\\sqrt[3]{27}=3$. This is called the **cube root**.\nThis one may be negative: $\\sqrt[3]{-8}=-2$, because $(-2)^{3}=-8$. See [[rule:u1.cube-root]].",
      ),
      latex: "\\sqrt[3]{27}=3",
      ruleId: "u1.cube-root",
    },
    {
      kind: "explain",
      title: L("Kommagetallen en breuken", "Decimals and fractions"),
      body: L(
        "Ook hier: welk getal keer zichzelf geeft het getal?\n$\\sqrt{0.09}=0.3$, want $0.3\\cdot 0.3=0.09$.\nBij een breuk: neem de wortel van boven en van onder. $\\sqrt{\\frac{4}{9}}=\\frac{2}{3}$, want $\\frac{2}{3}\\cdot\\frac{2}{3}=\\frac{4}{9}$.",
        "Same question: which number times itself gives the number?\n$\\sqrt{0.09}=0.3$, because $0.3\\cdot 0.3=0.09$.\nWith a fraction: take the root of the top and of the bottom. $\\sqrt{\\frac{4}{9}}=\\frac{2}{3}$, because $\\frac{2}{3}\\cdot\\frac{2}{3}=\\frac{4}{9}$.",
      ),
      latex: "\\sqrt{\\frac{4}{9}}=\\frac{2}{3}",
    },
    {
      kind: "explain",
      title: L("Wortels in een som", "Roots in a sum"),
      body: L(
        "Een wortel werkt als haakjes: eerst uitrekenen wat eronder staat.\nTwee wortels mag je niet samenvoegen bij plus.\n$\\sqrt{9}+\\sqrt{16}=3+4=7$. Maar $\\sqrt{9+16}=\\sqrt{25}=5$.",
        "A root works like brackets: first work out what is under it.\nYou may not join two roots with plus.\n$\\sqrt{9}+\\sqrt{16}=3+4=7$. But $\\sqrt{9+16}=\\sqrt{25}=5$.",
      ),
      latex: "\\sqrt{9}+\\sqrt{16}\\neq\\sqrt{25}",
      mnemonic: "hmwvdoa",
    },
    {
      kind: "example",
      title: L("Voorbeeld: Pythagoras", "Example: Pythagoras"),
      problem: L("Bereken $\\sqrt{6^{2}+8^{2}}$. Ken je dit nog van Pythagoras?", "Work out $\\sqrt{6^{2}+8^{2}}$. Do you remember this from Pythagoras?"),
      solution: {
        steps: [
          { latex: "\\sqrt{6^{2}+8^{2}}", note: L("Eerst alles onder de wortel.", "First everything under the root.") },
          { latex: "\\sqrt{\\ask{36}+64}", note: L("$6^{2}=36$ en $8^{2}=64$.", "$6^{2}=36$ and $8^{2}=64$.") },
          { latex: "\\sqrt{\\ask{100}}", note: L("Tel op.", "Add.") },
          { latex: "\\ask{10}", note: L("$10\\cdot 10=100$. Niet $6+8=14$!", "$10\\cdot 10=100$. Not $6+8=14$!") },
        ],
      },
    },
  ],
  practice: [
    { generatorId: "u1.square-root", difficulty: 1, count: 3 },
    { generatorId: "u1.root-estimate", difficulty: 1, count: 2 },
    { generatorId: "u1.square-root", difficulty: 2, count: 2 },
    { generatorId: "u1.root-estimate", difficulty: 2, count: 1 },
    { generatorId: "u1.square-root", difficulty: 3, count: 2 },
  ],
};
