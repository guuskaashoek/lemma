/**
 * Lesson 8: zero and negative exponents, found by walking down the power
 * stairs (every step down: divided by the base).
 */
import type { Lesson } from "@/content/types";
import { chain } from "../gen/power-rules";
import { powerSteps } from "../gen/powers";
import { L } from "../helpers";

export const negativeExponentsLesson: Lesson = {
  id: "u1.negative-exponents",
  title: L("Exponent nul en negatief", "Zero and negative exponents"),
  goal: L(
    "Je weet waarom $2^{0}=1$ en $2^{-3}=\\frac{1}{8}$, en je rekent zulke machten uit.",
    "You know why $2^{0}=1$ and $2^{-3}=\\frac{1}{8}$, and you work out such powers.",
  ),
  minutes: 8,
  calculator: "off",
  calculatorOffReason: L(
    "De rekenmachine staat uit. Je leert hier wat de min in de exponent betekent.",
    "The calculator is off. Here you learn what the minus in the exponent means.",
  ),
  info: {
    what: L(
      "Machten met exponent $0$ of een negatieve exponent, zoals $5^{0}$ en $10^{-3}$.",
      "Powers with exponent $0$ or a negative exponent, like $5^{0}$ and $10^{-3}$.",
    ),
    why: L(
      "Heel kleine getallen schrijf je met negatieve exponenten. Dat heb je nodig in de volgende lessen.",
      "You write very small numbers with negative exponents. You need that in the next lessons.",
    ),
    later: L(
      "In formules zoals $\\frac{1}{x}=x^{-1}$, bij afgeleiden en in AI: de leersnelheid is vaak iets als $10^{-3}$.",
      "In formulas like $\\frac{1}{x}=x^{-1}$, in derivatives and in AI: the learning rate is often something like $10^{-3}$.",
    ),
  },
  screens: [
    {
      kind: "visual",
      title: L("De trap naar beneden", "The stairs going down"),
      body: L(
        "$2^{3}=8$, $2^{2}=4$, $2^{1}=2$.\nElke stap omlaag deel je door $2$.\nWat gebeurt er als je verder gaat dan $2^{1}$?",
        "$2^{3}=8$, $2^{2}=4$, $2^{1}=2$.\nEvery step down you divide by $2$.\nWhat happens if you go further than $2^{1}$?",
      ),
      visual: powerSteps(2, 3, -3, 4),
      task: L("Klik op ▼ tot $2^{0}$. Ga dan nog verder omlaag.", "Click ▼ until $2^{0}$. Then go further down."),
    },
    {
      kind: "explain",
      title: L("Tot de macht nul", "To the power zero"),
      body: L(
        "Van $2^{1}=2$ één stap omlaag: $2:2=1$.\nDus $2^{0}=1$. Dat geldt voor elk grondtal, behalve $0$.\n$5^{0}=1$, $100^{0}=1$, $x^{0}=1$. Zie [[rule:u1.zero-exponent]].",
        "From $2^{1}=2$ one step down: $2:2=1$.\nSo $2^{0}=1$. That holds for every base, except $0$.\n$5^{0}=1$, $100^{0}=1$, $x^{0}=1$. See [[rule:u1.zero-exponent]].",
      ),
      latex: "a^{0}=1",
      ruleId: "u1.zero-exponent",
    },
    {
      kind: "explain",
      title: L("Onder nul: breuken", "Below zero: fractions"),
      body: L(
        "Nog een stap: $1:2=\\frac{1}{2}$. Dus $2^{-1}=\\frac{1}{2}$.\nNog een: $2^{-2}=\\frac{1}{4}=\\frac{1}{2^{2}}$.\nDe min in de exponent betekent: **één gedeeld door**. Het getal wordt niet negatief! Zie [[rule:u1.negative-exponent]].",
        "One more step: $1:2=\\frac{1}{2}$. So $2^{-1}=\\frac{1}{2}$.\nAnother: $2^{-2}=\\frac{1}{4}=\\frac{1}{2^{2}}$.\nThe minus in the exponent means: **one divided by**. The number does not become negative! See [[rule:u1.negative-exponent]].",
      ),
      latex: "a^{-n}=\\frac{1}{a^{n}}",
      ruleId: "u1.negative-exponent",
    },
    {
      kind: "visual",
      title: L("Het klopt met delen", "It fits with dividing"),
      body: L(
        "$\\frac{a^{2}}{a^{5}}$: twee tegels boven, vijf onder.\nNa wegstrepen blijven er onder drie over: $\\frac{1}{a^{3}}$.\nMet de deelregel: $a^{2-5}=a^{-3}$. Hetzelfde!",
        "$\\frac{a^{2}}{a^{5}}$: two tiles on top, five below.\nAfter crossing out, three are left below: $\\frac{1}{a^{3}}$.\nWith the division rule: $a^{2-5}=a^{-3}$. The same!",
      ),
      visual: chain({ mode: "quotient", top: ["a", "a"], bottom: ["a", "a", "a", "a", "a"] }, L("Tegels voor $\\frac{a^{2}}{a^{5}}$.", "Tiles for $\\frac{a^{2}}{a^{5}}$.")),
      task: L("Streep weg tot het einde. Waar blijven tegels over: boven of onder?", "Cross out to the end. Where are tiles left: on top or below?"),
    },
    {
      kind: "example",
      title: L("Voorbeeld: $2^{-3}$", "Example: $2^{-3}$"),
      problem: L("Bereken $2^{-3}$.", "Work out $2^{-3}$."),
      visual: powerSteps(2, -3, -3, 3),
      solution: {
        steps: [
          { latex: "2^{-3}", note: L("Een min in de exponent.", "A minus in the exponent.") },
          { latex: "\\frac{1}{\\hl{2^{3}}}", note: L("Eén gedeeld door $2^{3}$.", "One divided by $2^{3}$.") },
          { latex: "\\frac{1}{\\ask{8}}", note: L("$2^{3}=8$.", "$2^{3}=8$.") },
        ],
      },
    },
    {
      kind: "example",
      title: L("Voorbeeld: $10^{-2}$", "Example: $10^{-2}$"),
      problem: L("Bereken $10^{-2}$. Schrijf het ook als kommagetal.", "Work out $10^{-2}$. Also write it as a decimal."),
      solution: {
        steps: [
          { latex: "10^{-2}", note: L("Een min in de exponent.", "A minus in the exponent.") },
          { latex: "\\frac{1}{\\ask{100}}", note: L("$10^{2}=100$.", "$10^{2}=100$.") },
          { latex: "\\ask{0.01}", note: L("Een honderdste. Dit gebruik je straks bij heel kleine getallen.", "One hundredth. You will use this soon for very small numbers.") },
        ],
      },
    },
    {
      kind: "example",
      title: L("Voorbeeld: een breuk", "Example: a fraction"),
      problem: L("Bereken $\\left(\\frac{2}{3}\\right)^{-2}$.", "Work out $\\left(\\frac{2}{3}\\right)^{-2}$."),
      solution: {
        steps: [
          { latex: "\\left(\\frac{2}{3}\\right)^{-2}", note: L("De min draait de breuk om.", "The minus flips the fraction.") },
          { latex: "\\left(\\hl{\\frac{3}{2}}\\right)^{2}", note: L("Eén gedeeld door $\\frac{2}{3}$ is $\\frac{3}{2}$.", "One divided by $\\frac{2}{3}$ is $\\frac{3}{2}$.") },
          { latex: "\\frac{\\ask{9}}{4}", note: L("$3^{2}=9$ en $2^{2}=4$.", "$3^{2}=9$ and $2^{2}=4$.") },
        ],
      },
    },
  ],
  practice: [
    { generatorId: "u1.negative-exponent", difficulty: 1, count: 3 },
    { generatorId: "u1.negative-exponent", difficulty: 2, count: 3 },
    { generatorId: "u1.negative-exponent", difficulty: 3, count: 2 },
  ],
};
