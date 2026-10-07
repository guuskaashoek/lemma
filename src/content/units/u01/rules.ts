/**
 * Rule cards of unit 1. Each card's example is checked by the tests.
 */
import type { RuleCard } from "@/content/types";
import { L } from "./helpers";

const start = L("Dit is de som.", "This is the sum.");

export const rules: RuleCard[] = [
  // Lesson 1: the number line ------------------------------------------------
  {
    id: "u1.number-line",
    name: L("De getallenlijn", "The number line"),
    statement: L(
      "Links ligt kleiner, rechts ligt groter. Plus een getal: spring naar rechts. Min een getal: spring naar links.",
      "Left is smaller, right is bigger. Plus a number: jump to the right. Minus a number: jump to the left.",
    ),
    lessonId: "u1.number-line",
    example: {
      problem: L("Bereken $-3+5$.", "Work out $-3+5$."),
      steps: [
        { latex: "-3+5", note: L("Start bij $-3$.", "Start at $-3$.") },
        { latex: "\\hl{2}", note: L("Spring $5$ naar rechts. Je komt op $2$.", "Jump $5$ to the right. You land on $2$.") },
      ],
    },
  },

  // Lesson 2: minus minus ------------------------------------------------------
  {
    id: "u1.minus-minus",
    name: L("Min min wordt plus", "Minus minus is plus"),
    statement: L(
      "Een negatief getal aftrekken is hetzelfde als optellen: $a-(-b)=a+b$. Een negatief getal optellen is aftrekken: $a+(-b)=a-b$.",
      "Subtracting a negative number is the same as adding: $a-(-b)=a+b$. Adding a negative number is subtracting: $a+(-b)=a-b$.",
    ),
    latex: "a-(-b)=a+b",
    lessonId: "u1.minus-minus",
    example: {
      problem: L("Bereken $-4-(-6)$.", "Work out $-4-(-6)$."),
      steps: [
        { latex: "-4-(-6)", note: start },
        { latex: "-4\\hl{+6}", note: L("Min min wordt plus.", "Minus minus becomes plus.") },
        { latex: "\\hl{2}", note: L("Start bij $-4$, spring $6$ naar rechts.", "Start at $-4$, jump $6$ to the right.") },
      ],
    },
  },

  // Lesson 3: multiplying and dividing -----------------------------------------
  {
    id: "u1.sign-rule",
    name: L("Tekenregel", "Sign rule"),
    statement: L(
      "Bij keer en delen: gelijke tekens geven plus, verschillende tekens geven min. Reken eerst zonder tekens, zet dan het teken.",
      "For multiplying and dividing: equal signs give plus, different signs give minus. First work without signs, then add the sign.",
    ),
    latex: "(-a)\\cdot(-b)=a\\cdot b",
    lessonId: "u1.multiply-negatives",
    example: {
      problem: L("Bereken $-6\\cdot(-4)$.", "Work out $-6\\cdot(-4)$."),
      steps: [
        { latex: "-6\\cdot(-4)", note: L("Twee mintekens: gelijke tekens.", "Two minus signs: equal signs.") },
        { latex: "\\hl{6\\cdot 4}", note: L("Gelijke tekens geven plus.", "Equal signs give plus.") },
        { latex: "\\hl{24}", note: L("$6\\cdot 4=24$.", "$6\\cdot 4=24$.") },
      ],
    },
  },

  // Lesson 4: powers ------------------------------------------------------------
  {
    id: "u1.power",
    name: L("Macht", "Power"),
    statement: L(
      "Een macht is herhaald vermenigvuldigen. Het kleine getal boven (de exponent) zegt hoe vaak het grondtal in de keersom staat.",
      "A power is repeated multiplication. The small number at the top (the exponent) says how many times the base appears in the product.",
    ),
    latex: "a^{3}=a\\cdot a\\cdot a",
    lessonId: "u1.powers",
    example: {
      problem: L("Bereken $2^{5}$.", "Work out $2^{5}$."),
      steps: [
        { latex: "2^{5}", note: L("Grondtal $2$, exponent $5$.", "Base $2$, exponent $5$.") },
        { latex: "\\hl{2\\cdot 2\\cdot 2\\cdot 2\\cdot 2}", note: L("Vijf keer $2$ in de keersom.", "Five times $2$ in the product.") },
        { latex: "\\hl{32}", note: L("Reken uit: $2,4,8,16,32$.", "Work it out: $2,4,8,16,32$.") },
      ],
    },
  },
  {
    id: "u1.power-brackets",
    name: L("Haakjes bij een macht", "Brackets with a power"),
    statement: L(
      "De macht hoort alleen bij wat er direct onder staat. $(-3)^{2}$: de min doet mee, dus $9$. $-3^{2}$: alleen de $3$ doet mee, dus $-9$.",
      "The power only belongs to what is directly below it. $(-3)^{2}$: the minus takes part, so $9$. $-3^{2}$: only the $3$ takes part, so $-9$.",
    ),
    latex: "(-3)^{2}=9\\qquad -3^{2}=-9",
    lessonId: "u1.powers",
    example: {
      problem: L("Bereken $-3^{2}$.", "Work out $-3^{2}$."),
      steps: [
        { latex: "-3^{2}", note: L("Geen haakjes: de macht hoort alleen bij $3$.", "No brackets: the power only belongs to $3$.") },
        { latex: "-(\\hl{3\\cdot 3})", note: L("Eerst de macht, de min blijft ervoor.", "First the power, the minus stays in front.") },
        { latex: "\\hl{-9}", note: L("$3\\cdot 3=9$, met de min ervoor.", "$3\\cdot 3=9$, with the minus in front.") },
      ],
    },
  },

  // Lesson 5: square roots --------------------------------------------------------
  {
    id: "u1.square-root",
    name: L("Wortel", "Square root"),
    statement: L(
      "$\\sqrt{a}$ is het getal dat keer zichzelf $a$ geeft. Het is nooit negatief. Denk aan een vierkant: de wortel van de oppervlakte is de zijde.",
      "$\\sqrt{a}$ is the number that times itself gives $a$. It is never negative. Think of a square: the root of the area is the side.",
    ),
    latex: "7^{2}=49\\ \\Rightarrow\\ \\sqrt{49}=7",
    lessonId: "u1.square-roots",
    example: {
      problem: L("Bereken $\\sqrt{64}$.", "Work out $\\sqrt{64}$."),
      steps: [
        { latex: "\\sqrt{64}", note: L("Welk getal keer zichzelf is $64$?", "Which number times itself is $64$?") },
        { latex: "\\sqrt{\\hl{8\\cdot 8}}", note: L("$64=8\\cdot 8$.", "$64=8\\cdot 8$.") },
        { latex: "\\hl{8}", note: L("Dus $\\sqrt{64}=8$.", "So $\\sqrt{64}=8$.") },
      ],
    },
  },
  {
    id: "u1.simplify-root",
    name: L("Wortel vereenvoudigen", "Simplifying a root"),
    statement: L(
      "Zoek het grootste kwadraat dat in het getal past. Haal de wortel daarvan naar voren: $\\sqrt{k^{2}\\cdot b}=k\\sqrt{b}$.",
      "Find the biggest square number that fits into the number. Take its root out to the front: $\\sqrt{k^{2}\\cdot b}=k\\sqrt{b}$.",
    ),
    latex: "\\sqrt{a\\cdot b}=\\sqrt{a}\\cdot\\sqrt{b}",
    lessonId: "u1.simplify-roots",
    example: {
      problem: L("Vereenvoudig $\\sqrt{50}$.", "Simplify $\\sqrt{50}$."),
      steps: [
        { latex: "\\sqrt{50}", note: L("$25$ is het grootste kwadraat in $50$.", "$25$ is the biggest square number in $50$.") },
        { latex: "\\sqrt{\\hl{25\\cdot 2}}", note: L("$50=25\\cdot 2$.", "$50=25\\cdot 2$.") },
        { latex: "\\hl{\\sqrt{25}\\cdot\\sqrt{2}}", note: L("Splits de wortel.", "Split the root.") },
        { latex: "\\hl{5}\\sqrt{2}", note: L("$\\sqrt{25}=5$.", "$\\sqrt{25}=5$.") },
      ],
    },
  },

  // Lesson 7: rules for powers -----------------------------------------------------
  {
    id: "u1.product-rule",
    name: L("Keer: exponenten optellen", "Multiply: add the exponents"),
    statement: L(
      "Zelfde grondtal keer elkaar: tel de exponenten op. Je plakt de rijtjes aan elkaar.",
      "Same base multiplied: add the exponents. You glue the rows together.",
    ),
    latex: "a^{p}\\cdot a^{q}=a^{p+q}",
    lessonId: "u1.power-rules",
    example: {
      problem: L("Schrijf $a^{3}\\cdot a^{4}$ als één macht.", "Write $a^{3}\\cdot a^{4}$ as one power."),
      steps: [
        { latex: "a^{3}\\cdot a^{4}", note: L("Drie $a$'s en vier $a$'s.", "Three $a$'s and four $a$'s.") },
        { latex: "a^{\\hl{3+4}}", note: L("Zelfde grondtal: tel de exponenten op.", "Same base: add the exponents.") },
        { latex: "a^{\\hl{7}}", note: L("$3+4=7$.", "$3+4=7$.") },
      ],
    },
  },
  {
    id: "u1.quotient-rule",
    name: L("Delen: exponenten aftrekken", "Divide: subtract the exponents"),
    statement: L(
      "Zelfde grondtal gedeeld door elkaar: trek de exponenten af. Boven en onder vallen er even veel weg.",
      "Same base divided: subtract the exponents. The same number cancels at the top and the bottom.",
    ),
    latex: "\\frac{a^{p}}{a^{q}}=a^{p-q}",
    lessonId: "u1.power-rules",
    example: {
      problem: L("Schrijf $\\frac{a^{6}}{a^{2}}$ als één macht.", "Write $\\frac{a^{6}}{a^{2}}$ as one power."),
      steps: [
        { latex: "\\frac{a^{6}}{a^{2}}", note: L("Zes $a$'s boven, twee onder.", "Six $a$'s on top, two below.") },
        { latex: "a^{\\hl{6-2}}", note: L("Twee $a$'s vallen weg tegen elkaar.", "Two $a$'s cancel against each other.") },
        { latex: "a^{\\hl{4}}", note: L("$6-2=4$.", "$6-2=4$.") },
      ],
    },
  },
  {
    id: "u1.power-of-power",
    name: L("Macht van een macht: keer", "Power of a power: multiply"),
    statement: L(
      "Een macht nog een keer tot een macht: vermenigvuldig de exponenten. Je neemt het rijtje een paar keer.",
      "A power raised to a power again: multiply the exponents. You take the row a few times.",
    ),
    latex: "(a^{p})^{q}=a^{p\\cdot q}",
    lessonId: "u1.power-rules",
    example: {
      problem: L("Schrijf $(a^{2})^{3}$ als één macht.", "Write $(a^{2})^{3}$ as one power."),
      steps: [
        { latex: "(a^{2})^{3}", note: L("Drie keer het rijtje $a\\cdot a$.", "Three times the row $a\\cdot a$.") },
        { latex: "a^{\\hl{2\\cdot 3}}", note: L("Vermenigvuldig de exponenten.", "Multiply the exponents.") },
        { latex: "a^{\\hl{6}}", note: L("$2\\cdot 3=6$.", "$2\\cdot 3=6$.") },
      ],
    },
  },
  {
    id: "u1.product-power",
    name: L("Macht van een product", "Power of a product"),
    statement: L(
      "Staat er een product tussen haakjes? Dan krijgt elke factor de macht: $(ab)^{n}=a^{n}b^{n}$.",
      "Is there a product in brackets? Then every factor gets the power: $(ab)^{n}=a^{n}b^{n}$.",
    ),
    latex: "(a\\cdot b)^{n}=a^{n}\\cdot b^{n}",
    lessonId: "u1.power-rules",
    example: {
      problem: L("Werk uit: $(3a^{2})^{2}$.", "Work out $(3a^{2})^{2}$."),
      steps: [
        { latex: "(3a^{2})^{2}", note: L("Twee factoren: $3$ en $a^{2}$.", "Two factors: $3$ and $a^{2}$.") },
        { latex: "\\hl{3^{2}}\\cdot\\hl{(a^{2})^{2}}", note: L("Elke factor krijgt de macht $2$.", "Every factor gets the power $2$.") },
        { latex: "\\hl{9}\\cdot a^{\\hl{4}}", note: L("$3^{2}=9$ en $2\\cdot 2=4$.", "$3^{2}=9$ and $2\\cdot 2=4$.") },
      ],
    },
  },

  // Lesson 8: zero and negative exponents ---------------------------------------
  {
    id: "u1.zero-exponent",
    name: L("Tot de macht nul", "To the power zero"),
    statement: L(
      "Elk getal (behalve $0$) tot de macht $0$ is $1$. Eén stap omlaag op de trap is delen door het grondtal: $a^{1}:a=1$.",
      "Every number (except $0$) to the power $0$ is $1$. One step down the stairs is dividing by the base: $a^{1}:a=1$.",
    ),
    latex: "a^{0}=1",
    lessonId: "u1.negative-exponents",
    example: {
      problem: L("Bereken $7^{0}$.", "Work out $7^{0}$."),
      steps: [
        { latex: "7^{0}", note: L("Eén stap onder $7^{1}$.", "One step below $7^{1}$.") },
        { latex: "\\hl{7^{1}:7}", note: L("Een stap omlaag is delen door $7$.", "A step down is dividing by $7$.") },
        { latex: "\\hl{1}", note: L("$7:7=1$.", "$7:7=1$.") },
      ],
    },
  },
  {
    id: "u1.negative-exponent",
    name: L("Negatieve exponent", "Negative exponent"),
    statement: L(
      "Een min in de exponent betekent: één gedeeld door. $a^{-n}=\\frac{1}{a^{n}}$.",
      "A minus in the exponent means: one divided by. $a^{-n}=\\frac{1}{a^{n}}$.",
    ),
    latex: "a^{-n}=\\frac{1}{a^{n}}",
    lessonId: "u1.negative-exponents",
    example: {
      problem: L("Bereken $2^{-3}$.", "Work out $2^{-3}$."),
      steps: [
        { latex: "2^{-3}", note: L("Een min in de exponent.", "A minus in the exponent.") },
        { latex: "\\frac{1}{\\hl{2^{3}}}", note: L("Eén gedeeld door $2^{3}$.", "One divided by $2^{3}$.") },
        { latex: "\\frac{1}{\\hl{8}}", note: L("$2^{3}=8$.", "$2^{3}=8$.") },
      ],
    },
  },

  // Lessons 9 and 10: scientific notation ----------------------------------------
  {
    id: "u1.scientific",
    name: L("Wetenschappelijke notatie", "Scientific notation"),
    statement: L(
      "Schrijf een getal als $a\\cdot 10^{n}$, met precies één cijfer (niet $0$) vóór de komma. Komma naar links: $n$ één hoger. Komma naar rechts: $n$ één lager.",
      "Write a number as $a\\cdot 10^{n}$, with exactly one digit (not $0$) before the decimal point. Point to the left: $n$ one higher. Point to the right: $n$ one lower.",
    ),
    latex: "a\\cdot 10^{n},\\quad 1\\le a<10",
    lessonId: "u1.scientific-big",
    example: {
      problem: L("Schrijf $45\\,000$ in wetenschappelijke notatie.", "Write $45\\,000$ in scientific notation."),
      steps: [
        { latex: "45000", note: L("De komma staat achter de laatste $0$.", "The point is after the last $0$.") },
        { latex: "\\hl{4.5}\\cdot\\hl{10000}", note: L("Komma $4$ plaatsen naar links. Dat is $4$ keer delen door $10$.", "Move the point $4$ places left. That is dividing by $10$ four times.") },
        { latex: "4.5\\cdot 10^{\\hl{4}}", note: L("$10000=10^{4}$.", "$10000=10^{4}$.") },
      ],
    },
  },
  {
    id: "u1.scientific-calc",
    name: L("Rekenen met $10$-machten", "Calculating with powers of $10$"),
    statement: L(
      "Keer: getallen keer elkaar, exponenten optellen. Delen: getallen delen, exponenten aftrekken. Zet het antwoord daarna weer goed.",
      "Multiply: multiply the numbers, add the exponents. Divide: divide the numbers, subtract the exponents. Then tidy up the answer.",
    ),
    latex: "(a\\cdot 10^{p})\\cdot(b\\cdot 10^{q})=(a\\cdot b)\\cdot 10^{p+q}",
    lessonId: "u1.scientific-small",
    example: {
      problem: L("Bereken $(3\\cdot 10^{4})\\cdot(5\\cdot 10^{2})$.", "Work out $(3\\cdot 10^{4})\\cdot(5\\cdot 10^{2})$."),
      steps: [
        { latex: "(3\\cdot 10^{4})\\cdot(5\\cdot 10^{2})", note: start },
        { latex: "\\hl{15}\\cdot 10^{\\hl{6}}", note: L("$3\\cdot 5=15$ en $4+2=6$.", "$3\\cdot 5=15$ and $4+2=6$.") },
        { latex: "\\hl{1.5}\\cdot 10^{\\hl{7}}", note: L("$15$ is te groot: komma één naar links, exponent één hoger.", "$15$ is too big: point one place left, exponent one higher.") },
      ],
    },
  },
];
