/**
 * Lessons 9 and 10: scientific notation, first for big numbers, then for
 * small numbers and for calculating with it.
 */
import type { Lesson } from "@/content/types";
import { decimalShift } from "../gen/scientific";
import { L } from "../helpers";

export const scientificBigLesson: Lesson = {
  id: "u1.scientific-big",
  title: L("Wetenschappelijke notatie: grote getallen", "Scientific notation: big numbers"),
  goal: L(
    "Je schrijft $45\\,000$ als $4.5\\cdot 10^{4}$, en terug.",
    "You write $45\\,000$ as $4.5\\cdot 10^{4}$, and back.",
  ),
  minutes: 7,
  calculator: "off",
  calculatorOffReason: L(
    "De rekenmachine staat uit. Je leert hier de komma verschuiven.",
    "The calculator is off. Here you learn to move the decimal point.",
  ),
  info: {
    what: L(
      "Een korte schrijfwijze voor heel grote getallen: een getal tussen $1$ en $10$, keer een macht van $10$.",
      "A short way to write very big numbers: a number between $1$ and $10$, times a power of $10$.",
    ),
    why: L(
      "Tel maar eens de nullen in $70\\,000\\,000\\,000$. Met $7\\cdot 10^{10}$ zie je meteen hoe groot het is.",
      "Try counting the zeros in $70\\,000\\,000\\,000$. With $7\\cdot 10^{10}$ you see at once how big it is.",
    ),
    later: L(
      "In natuurkunde, scheikunde en informatica. Een groot AI-taalmodel heeft zo'n $7\\cdot 10^{10}$ getallen (parameters).",
      "In physics, chemistry and computer science. A big AI language model has about $7\\cdot 10^{10}$ numbers (parameters).",
    ),
  },
  screens: [
    {
      kind: "explain",
      title: L("Machten van $10$", "Powers of $10$"),
      body: L(
        "$10^{1}=10$, $10^{2}=100$, $10^{3}=1000$.\nDe exponent is het aantal nullen.\n$10^{6}$ is een miljoen: een $1$ met $6$ nullen.",
        "$10^{1}=10$, $10^{2}=100$, $10^{3}=1000$.\nThe exponent is the number of zeros.\n$10^{6}$ is a million: a $1$ with $6$ zeros.",
      ),
      latex: "10^{6}=1\\,000\\,000",
    },
    {
      kind: "visual",
      title: L("Schuif de komma", "Move the point"),
      body: L(
        "De cijfers blijven staan. Alleen de komma schuift.\nEén plaats naar links: het getal ervoor wordt $10$ keer zo klein.\nDaarom gaat de macht van $10$ één omhoog. Het getal blijft gelijk.",
        "The digits stay where they are. Only the point moves.\nOne place to the left: the front number becomes $10$ times smaller.\nThat is why the power of $10$ goes one up. The number stays the same.",
      ),
      visual: decimalShift(45, 3),
      task: L(
        "Schuif de komma naar links tot er één cijfer vóór staat. Wat wordt de exponent?",
        "Move the point to the left until one digit is in front of it. What does the exponent become?",
      ),
    },
    {
      kind: "explain",
      title: L("De afspraak", "The agreement"),
      body: L(
        "Wetenschappelijke notatie: $a\\cdot 10^{n}$.\nVóór de komma staat precies één cijfer, en dat is geen $0$.\nDus $4.5\\cdot 10^{4}$ is goed. $45\\cdot 10^{3}$ is even groot, maar niet de afspraak. Zie [[rule:u1.scientific]].",
        "Scientific notation: $a\\cdot 10^{n}$.\nThere is exactly one digit before the point, and it is not $0$.\nSo $4.5\\cdot 10^{4}$ is right. $45\\cdot 10^{3}$ is just as big, but not the agreement. See [[rule:u1.scientific]].",
      ),
      latex: "45\\,000=4.5\\cdot 10^{4}",
      ruleId: "u1.scientific",
    },
    {
      kind: "example",
      title: L("Voorbeeld: $3\\,070\\,000$", "Example: $3\\,070\\,000$"),
      problem: L("Schrijf $3\\,070\\,000$ in wetenschappelijke notatie.", "Write $3\\,070\\,000$ in scientific notation."),
      visual: decimalShift(307, 4),
      solution: {
        steps: [
          { latex: "3\\,070\\,000", note: L("De komma moet achter de $3$.", "The point must go after the $3$.") },
          { latex: "\\ask{3.07}\\cdot 1\\,000\\,000", note: L("Komma $6$ plaatsen naar links.", "Point $6$ places to the left.") },
          { latex: "3.07\\cdot 10^{\\ask{6}}", note: L("$1\\,000\\,000=10^{6}$.", "$1\\,000\\,000=10^{6}$.") },
        ],
      },
    },
    {
      kind: "example",
      title: L("Voorbeeld: terug", "Example: back"),
      problem: L("Schrijf $7\\cdot 10^{10}$ als gewoon getal.", "Write $7\\cdot 10^{10}$ as an ordinary number."),
      solution: {
        steps: [
          { latex: "7\\cdot 10^{10}", note: L("$10^{10}$ is een $1$ met $10$ nullen.", "$10^{10}$ is a $1$ with $10$ zeros.") },
          { latex: "\\ask{70\\,000\\,000\\,000}", note: L("Komma $10$ plaatsen naar rechts: $10$ nullen achter de $7$.", "Point $10$ places to the right: $10$ zeros after the $7$.") },
        ],
      },
    },
    {
      kind: "explain",
      title: L("Op de rekenmachine", "On the calculator"),
      body: L(
        "Een rekenmachine laat soms $4.5\\text{E}4$ zien.\nDie $\\text{E}$ betekent: keer $10$ tot de macht.\nDus $4.5\\text{E}4=4.5\\cdot 10^{4}$.",
        "A calculator sometimes shows $4.5\\text{E}4$.\nThat $\\text{E}$ means: times $10$ to the power.\nSo $4.5\\text{E}4=4.5\\cdot 10^{4}$.",
      ),
    },
  ],
  practice: [
    { generatorId: "u1.to-scientific", difficulty: 1, count: 4 },
    { generatorId: "u1.from-scientific", difficulty: 1, count: 4 },
  ],
};

export const scientificSmallLesson: Lesson = {
  id: "u1.scientific-small",
  title: L("Wetenschappelijke notatie: kleine getallen en rekenen", "Scientific notation: small numbers and calculating"),
  goal: L(
    "Je schrijft $0.00032$ als $3.2\\cdot 10^{-4}$, en je rekent $(3\\cdot 10^{4})\\cdot(5\\cdot 10^{2})$ uit.",
    "You write $0.00032$ as $3.2\\cdot 10^{-4}$, and you work out $(3\\cdot 10^{4})\\cdot(5\\cdot 10^{2})$.",
  ),
  minutes: 10,
  calculator: "off",
  calculatorOffReason: L(
    "De rekenmachine staat uit. Met de rekenregels voor machten gaat het zonder.",
    "The calculator is off. With the rules for powers you can do it without.",
  ),
  info: {
    what: L(
      "Heel kleine getallen schrijven met een negatieve exponent, en rekenen met getallen in wetenschappelijke notatie.",
      "Writing very small numbers with a negative exponent, and calculating with numbers in scientific notation.",
    ),
    why: L(
      "Een bacterie, een atoom, een kans van één op een miljoen: allemaal heel klein.",
      "A bacterium, an atom, a chance of one in a million: all very small.",
    ),
    later: L(
      "In AI rekent een computer met ‘floating point’-getallen: dat is wetenschappelijke notatie in bits.",
      "In AI a computer calculates with ‘floating point’ numbers: that is scientific notation in bits.",
    ),
  },
  screens: [
    {
      kind: "explain",
      title: L("Negatieve machten van $10$", "Negative powers of $10$"),
      body: L(
        "Uit les 8: $10^{-1}=\\frac{1}{10}=0.1$.\n$10^{-2}=0.01$ en $10^{-3}=0.001$.\nBij $10^{-3}$ staat de $1$ op de derde plaats na de komma.",
        "From lesson 8: $10^{-1}=\\frac{1}{10}=0.1$.\n$10^{-2}=0.01$ and $10^{-3}=0.001$.\nIn $10^{-3}$ the $1$ is in the third place after the point.",
      ),
      latex: "10^{-3}=0.001",
    },
    {
      kind: "visual",
      title: L("De komma naar rechts", "The point to the right"),
      body: L(
        "Bij een klein getal schuif je de komma naar **rechts**.\nElke plaats naar rechts: de exponent gaat één omlaag.\nZo wordt de exponent negatief.",
        "For a small number you move the point to the **right**.\nEvery place to the right: the exponent goes one down.\nThat is how the exponent becomes negative.",
      ),
      visual: decimalShift(32, -5),
      task: L("Schuif de komma tot achter de $3$. Wat wordt de exponent?", "Move the point until it is after the $3$. What does the exponent become?"),
    },
    {
      kind: "example",
      title: L("Voorbeeld: $0.00032$", "Example: $0.00032$"),
      problem: L("Schrijf $0.00032$ in wetenschappelijke notatie.", "Write $0.00032$ in scientific notation."),
      visual: decimalShift(32, -5),
      solution: {
        steps: [
          { latex: "0.00032", note: L("De komma moet achter de $3$.", "The point must go after the $3$.") },
          { latex: "\\ask{3.2}\\cdot\\frac{1}{10000}", note: L("Komma $4$ plaatsen naar rechts: $3.2$ is $10000$ keer zo groot. Dus keer $\\frac{1}{10000}$.", "Point $4$ places to the right: $3.2$ is $10000$ times as big. So times $\\frac{1}{10000}$.") },
          { latex: "3.2\\cdot 10^{\\ask{-4}}", note: L("$\\frac{1}{10000}=10^{-4}$.", "$\\frac{1}{10000}=10^{-4}$.") },
        ],
      },
    },
    {
      kind: "explain",
      title: L("Groot of klein?", "Big or small?"),
      body: L(
        "Positieve exponent: een groot getal, $10$ of meer.\nNegatieve exponent: een klein getal, kleiner dan $1$.\nVergelijken? Kijk eerst naar de exponent. $2\\cdot 10^{-3}$ is groter dan $9\\cdot 10^{-4}$.",
        "Positive exponent: a big number, $10$ or more.\nNegative exponent: a small number, smaller than $1$.\nComparing? Look at the exponent first. $2\\cdot 10^{-3}$ is bigger than $9\\cdot 10^{-4}$.",
      ),
      latex: "9\\cdot 10^{-4}<2\\cdot 10^{-3}",
    },
    {
      kind: "explain",
      title: L("Rekenen: keer", "Calculating: multiply"),
      body: L(
        "Bij keer mag je de volgorde veranderen.\nZet de getallen bij elkaar en de machten van $10$ bij elkaar.\nGetallen: keer. Exponenten: optellen (les 7). Zie [[rule:u1.scientific-calc]].",
        "When multiplying you may change the order.\nPut the numbers together and the powers of $10$ together.\nNumbers: multiply. Exponents: add (lesson 7). See [[rule:u1.scientific-calc]].",
      ),
      latex: "(a\\cdot 10^{p})\\cdot(b\\cdot 10^{q})=(a\\cdot b)\\cdot 10^{p+q}",
      ruleId: "u1.scientific-calc",
    },
    {
      kind: "example",
      title: L("Voorbeeld: keer", "Example: multiply"),
      problem: L("Bereken $(3\\cdot 10^{4})\\cdot(5\\cdot 10^{2})$.", "Work out $(3\\cdot 10^{4})\\cdot(5\\cdot 10^{2})$."),
      solution: {
        steps: [
          { latex: "(3\\cdot 10^{4})\\cdot(5\\cdot 10^{2})", note: L("Getallen bij elkaar, machten bij elkaar.", "Numbers together, powers together.") },
          { latex: "\\hl{3\\cdot 5}\\cdot\\hl{10^{4}\\cdot 10^{2}}", note: L("Volgorde veranderen mag bij keer.", "Changing the order is allowed when multiplying.") },
          { latex: "\\ask{15}\\cdot 10^{6}", note: L("$3\\cdot 5=15$ en $4+2=6$.", "$3\\cdot 5=15$ and $4+2=6$.") },
          { latex: "1.5\\cdot 10^{\\ask{7}}", note: L("$15$ is te groot: komma één naar links, exponent één omhoog.", "$15$ is too big: point one place left, exponent one up.") },
        ],
      },
    },
    {
      kind: "example",
      title: L("Voorbeeld: delen", "Example: divide"),
      problem: L("Bereken $\\frac{8\\cdot 10^{9}}{2\\cdot 10^{3}}$.", "Work out $\\frac{8\\cdot 10^{9}}{2\\cdot 10^{3}}$."),
      solution: {
        steps: [
          { latex: "\\frac{8\\cdot 10^{9}}{2\\cdot 10^{3}}", note: L("Getallen apart delen, machten apart delen.", "Divide the numbers and the powers separately.") },
          { latex: "\\hl{\\frac{8}{2}}\\cdot\\hl{\\frac{10^{9}}{10^{3}}}", note: L("Splits in twee breuken.", "Split into two fractions.") },
          { latex: "\\ask{4}\\cdot 10^{6}", note: L("$8:2=4$ en $9-3=6$.", "$8:2=4$ and $9-3=6$.") },
        ],
      },
    },
    {
      kind: "example",
      title: L("Voorbeeld: te klein ervoor", "Example: too small in front"),
      problem: L("Bereken $\\frac{3\\cdot 10^{8}}{6\\cdot 10^{2}}$.", "Work out $\\frac{3\\cdot 10^{8}}{6\\cdot 10^{2}}$."),
      solution: {
        steps: [
          { latex: "\\frac{3\\cdot 10^{8}}{6\\cdot 10^{2}}", note: L("Getallen apart delen, machten apart delen.", "Divide the numbers and the powers separately.") },
          { latex: "\\hl{\\frac{3}{6}}\\cdot\\hl{\\frac{10^{8}}{10^{2}}}", note: L("Splits in twee breuken.", "Split into two fractions.") },
          { latex: "\\ask{0.5}\\cdot 10^{6}", note: L("$3:6=0.5$ en $8-2=6$.", "$3:6=0.5$ and $8-2=6$.") },
          { latex: "\\ask{5}\\cdot 10^{-1}\\cdot 10^{6}", note: L("$0.5$ is te klein: vóór de komma staat $0$. Komma één naar rechts: $0.5=5\\cdot 10^{-1}$.", "$0.5$ is too small: there is a $0$ before the point. Point one place right: $0.5=5\\cdot 10^{-1}$.") },
          { latex: "5\\cdot 10^{\\ask{5}}", note: L("Tel de exponenten op: $-1+6=5$.", "Add the exponents: $-1+6=5$.") },
        ],
      },
    },
  ],
  practice: [
    { generatorId: "u1.to-scientific", difficulty: 2, count: 2 },
    { generatorId: "u1.from-scientific", difficulty: 2, count: 2 },
    { generatorId: "u1.sci-calc", difficulty: 1, count: 2 },
    { generatorId: "u1.to-scientific", difficulty: 3, count: 1 },
    { generatorId: "u1.from-scientific", difficulty: 3, count: 1 },
    { generatorId: "u1.sci-calc", difficulty: 2, count: 1 },
    { generatorId: "u1.sci-calc", difficulty: 3, count: 1 },
  ],
};
