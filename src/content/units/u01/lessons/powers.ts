/**
 * Lesson 4: powers (machten). Repeated multiplication, growing shapes,
 * negative bases and the brackets trap.
 */
import type { Lesson } from "@/content/types";
import { powerSteps } from "../gen/powers";
import { L } from "../helpers";

export const powersLesson: Lesson = {
  id: "u1.powers",
  title: L("Machten", "Powers"),
  goal: L(
    "Je rekent machten uit zoals $2^{5}$ en $(-3)^{2}$, en je ziet het verschil met $-3^{2}$.",
    "You work out powers like $2^{5}$ and $(-3)^{2}$, and you see the difference with $-3^{2}$.",
  ),
  minutes: 9,
  calculator: "off",
  calculatorOffReason: L(
    "De rekenmachine staat uit. Je leert hier wat een macht is.",
    "The calculator is off. Here you learn what a power is.",
  ),
  info: {
    what: L(
      "Een macht is een korte schrijfwijze voor herhaald vermenigvuldigen: $2^{5}=2\\cdot 2\\cdot 2\\cdot 2\\cdot 2$.",
      "A power is a short way to write repeated multiplication: $2^{5}=2\\cdot 2\\cdot 2\\cdot 2\\cdot 2$.",
    ),
    why: L(
      "Oppervlakte ($\\text{cm}^{2}$), inhoud ($\\text{cm}^{3}$), groei en rente: allemaal machten.",
      "Area ($\\text{cm}^{2}$), volume ($\\text{cm}^{3}$), growth and interest: all powers.",
    ),
    later: L(
      "Bij exponentiële groei, kwadratische formules en in AI: een computer rekent in machten van $2$ (bits).",
      "In exponential growth, quadratic formulas and in AI: a computer counts in powers of $2$ (bits).",
    ),
  },
  screens: [
    {
      kind: "explain",
      title: L("Herhaald vermenigvuldigen", "Repeated multiplication"),
      body: L(
        "$2\\cdot 2\\cdot 2\\cdot 2\\cdot 2$ is lang. Korter: $2^{5}$.\nDe $2$ heet het **grondtal**. De kleine $5$ heet de **exponent**.\nDe exponent zegt hoe vaak het grondtal in de keersom staat.",
        "$2\\cdot 2\\cdot 2\\cdot 2\\cdot 2$ is long. Shorter: $2^{5}$.\nThe $2$ is called the **base**. The small $5$ is called the **exponent**.\nThe exponent says how many times the base appears in the product.",
      ),
      latex: "2^{5}=2\\cdot 2\\cdot 2\\cdot 2\\cdot 2",
      ruleId: "u1.power",
    },
    {
      kind: "visual",
      title: L("Elke stap: keer $2$", "Every step: times $2$"),
      body: L(
        "Rechts staat een trap. Elke stap omhoog doe je keer $2$.\nLinks zie je de stippen verdubbelen.\nZo groeit een macht heel snel.",
        "On the right are stairs. Every step up you multiply by $2$.\nOn the left the dots double.\nThat is how fast a power grows.",
      ),
      visual: powerSteps(2, 1, 0, 7),
      task: L("Klik op ▲ tot je bij $2^{7}$ bent. Hoeveel stippen zijn het?", "Click ▲ until you reach $2^{7}$. How many dots is that?"),
    },
    {
      kind: "visual",
      title: L("Kwadraat en kubus", "Square and cube"),
      body: L(
        "$3^{2}$ is een vierkant van $3$ bij $3$. Daarom heet het een **kwadraat**.\n$3^{3}$ is drie van die vierkanten: een blok. Dat heet een **derde macht**.",
        "$3^{2}$ is a square of $3$ by $3$. That is why it is called **squared**.\n$3^{3}$ is three of those squares: a block. That is called **cubed**.",
      ),
      visual: powerSteps(3, 1, 0, 4),
      task: L("Ga naar $3^{2}$ en dan naar $3^{3}$. Zie je de vierkanten?", "Go to $3^{2}$ and then to $3^{3}$. Do you see the squares?"),
    },
    {
      kind: "explain",
      title: L("Pas op: niet keer de exponent", "Careful: not times the exponent"),
      body: L(
        "$2^{5}$ is **niet** $2\\cdot 5=10$.\n$2^{5}=2\\cdot 2\\cdot 2\\cdot 2\\cdot 2=32$.\nTip: reken stap voor stap. $2,\\ 4,\\ 8,\\ 16,\\ 32$.",
        "$2^{5}$ is **not** $2\\cdot 5=10$.\n$2^{5}=2\\cdot 2\\cdot 2\\cdot 2\\cdot 2=32$.\nTip: work step by step. $2,\\ 4,\\ 8,\\ 16,\\ 32$.",
      ),
      latex: "2^{5}=32\\neq 10",
    },
    {
      kind: "example",
      title: L("Voorbeeld: $3^{4}$", "Example: $3^{4}$"),
      problem: L("Bereken $3^{4}$.", "Work out $3^{4}$."),
      visual: powerSteps(3, 4),
      solution: {
        steps: [
          { latex: "3^{4}", note: L("Grondtal $3$, exponent $4$.", "Base $3$, exponent $4$.") },
          { latex: "\\hl{3\\cdot 3\\cdot 3\\cdot 3}", note: L("Vier keer $3$.", "Four times $3$.") },
          { latex: "\\ask{9}\\cdot 3\\cdot 3", note: L("Reken de eerste twee uit.", "Work out the first two.") },
          { latex: "\\ask{27}\\cdot 3", note: L("Keer $3$.", "Times $3$.") },
          { latex: "\\ask{81}", note: L("Keer $3$.", "Times $3$.") },
        ],
      },
    },
    {
      kind: "explain",
      title: L("Een negatief grondtal", "A negative base"),
      body: L(
        "$(-2)^{3}=(-2)\\cdot(-2)\\cdot(-2)=-8$. Drie mintekens: oneven, dus min.\n$(-2)^{4}=16$. Vier mintekens: even, dus plus.\nDit is de tekenregel uit les 3.",
        "$(-2)^{3}=(-2)\\cdot(-2)\\cdot(-2)=-8$. Three minus signs: odd, so minus.\n$(-2)^{4}=16$. Four minus signs: even, so plus.\nThis is the sign rule from lesson 3.",
      ),
      latex: "(-2)^{3}=-8\\qquad(-2)^{4}=16",
    },
    {
      kind: "explain",
      title: L("Haakjes of niet?", "Brackets or not?"),
      body: L(
        "De macht hoort alleen bij wat er direct onder staat.\n$(-3)^{2}$: de haakjes horen erbij, dus $(-3)\\cdot(-3)=9$.\n$-3^{2}$: alleen de $3$ krijgt het kwadraat, dus $-9$.\nMachten gaan vóór de min. Zie [[rule:u1.power-brackets]].",
        "The power only belongs to what is directly below it.\n$(-3)^{2}$: the brackets belong to it, so $(-3)\\cdot(-3)=9$.\n$-3^{2}$: only the $3$ is squared, so $-9$.\nPowers go before the minus. See [[rule:u1.power-brackets]].",
      ),
      latex: "(-3)^{2}=9\\qquad -3^{2}=-9",
      ruleId: "u1.power-brackets",
      mnemonic: "hmwvdoa",
    },
    {
      kind: "example",
      title: L("Voorbeeld: macht in een som", "Example: a power in a sum"),
      problem: L("Bereken $2\\cdot 3^{2}$. Denk aan de rekenvolgorde.", "Work out $2\\cdot 3^{2}$. Remember the order of operations."),
      solution: {
        steps: [
          { latex: "2\\cdot 3^{2}", note: L("De macht hoort alleen bij $3$. Machten gaan vóór keer.", "The power only belongs to $3$. Powers go before multiplying.") },
          { latex: "2\\cdot\\ask{9}", note: L("$3^{2}=3\\cdot 3$.", "$3^{2}=3\\cdot 3$.") },
          { latex: "\\ask{18}", note: L("Nu keer. Niet $6^{2}=36$!", "Now multiply. Not $6^{2}=36$!") },
        ],
      },
    },
  ],
  practice: [
    { generatorId: "u1.power-value", difficulty: 1, count: 3 },
    { generatorId: "u1.power-value", difficulty: 2, count: 3 },
    { generatorId: "u1.power-value", difficulty: 3, count: 2 },
  ],
};
