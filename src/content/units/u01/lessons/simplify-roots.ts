/**
 * Lesson 6: simplifying roots, √50 = 5√2, and the way back.
 */
import type { Lesson } from "@/content/types";
import { squareFactor } from "../gen/roots";
import { L } from "../helpers";

export const simplifyRootsLesson: Lesson = {
  id: "u1.simplify-roots",
  title: L("Wortels vereenvoudigen", "Simplifying roots"),
  goal: L(
    "Je schrijft een wortel zoals $\\sqrt{50}$ als $5\\sqrt{2}$, en terug.",
    "You write a root like $\\sqrt{50}$ as $5\\sqrt{2}$, and back.",
  ),
  minutes: 8,
  calculator: "off",
  calculatorOffReason: L(
    "De rekenmachine staat uit. Een rekenmachine rondt af, maar jij leert het exacte antwoord.",
    "The calculator is off. A calculator rounds, but you learn the exact answer.",
  ),
  info: {
    what: L(
      "Een wortel zo eenvoudig mogelijk schrijven: $\\sqrt{50}=5\\sqrt{2}$. Het getal onder de wortel wordt zo klein mogelijk.",
      "Writing a root as simply as possible: $\\sqrt{50}=5\\sqrt{2}$. The number under the root becomes as small as possible.",
    ),
    why: L(
      "Op vwo krijg je vaak de vraag: ‘geef het exacte antwoord’. Dan is $5\\sqrt{2}$ goed en $7.07$ niet.",
      "At pre-university level you are often asked: ‘give the exact answer’. Then $5\\sqrt{2}$ is right and $7.07$ is not.",
    ),
    later: L(
      "Bij de abc-formule, bij lengtes van vectoren en bij de eenheidscirkel ($\\frac{1}{2}\\sqrt{2}$).",
      "In the quadratic formula, for lengths of vectors and on the unit circle ($\\frac{1}{2}\\sqrt{2}$).",
    ),
  },
  screens: [
    {
      kind: "explain",
      title: L("Splitsen onder de wortel", "Splitting under the root"),
      body: L(
        "Kijk: $\\sqrt{4\\cdot 9}=\\sqrt{36}=6$.\nEn ook: $\\sqrt{4}\\cdot\\sqrt{9}=2\\cdot 3=6$.\nDus bij keer mag je een wortel splitsen.\nBij plus mag dat niet!",
        "Look: $\\sqrt{4\\cdot 9}=\\sqrt{36}=6$.\nAnd also: $\\sqrt{4}\\cdot\\sqrt{9}=2\\cdot 3=6$.\nSo with times you may split a root.\nWith plus you may not!",
      ),
      latex: "\\sqrt{a\\cdot b}=\\sqrt{a}\\cdot\\sqrt{b}",
    },
    {
      kind: "visual",
      title: L("Kwadraten zoeken", "Looking for square numbers"),
      body: L(
        "$50$ is geen kwadraat. Maar zit er een kwadraat **in**?\n$50=25\\cdot 2$: twee vierkanten van $5$ bij $5$.\nElk vierkant heeft zijde $5$. Die $5$ mag uit de wortel.",
        "$50$ is not a square number. But is there a square number **inside** it?\n$50=25\\cdot 2$: two squares of $5$ by $5$.\nEach square has side $5$. That $5$ may come out of the root.",
      ),
      visual: squareFactor(50),
      task: L("Probeer $4$, $9$ en $25$. Welke past in $50$?", "Try $4$, $9$ and $25$. Which one fits into $50$?"),
    },
    {
      kind: "explain",
      title: L("Zo vereenvoudig je", "How to simplify"),
      body: L(
        "1. Zoek het **grootste** kwadraat dat in het getal past.\n2. Splits: $\\sqrt{50}=\\sqrt{25}\\cdot\\sqrt{2}$.\n3. Neem de wortel van het kwadraat: $5\\sqrt{2}$.\nZie [[rule:u1.simplify-root]].",
        "1. Find the **biggest** square number that fits into the number.\n2. Split: $\\sqrt{50}=\\sqrt{25}\\cdot\\sqrt{2}$.\n3. Take the root of the square number: $5\\sqrt{2}$.\nSee [[rule:u1.simplify-root]].",
      ),
      latex: "\\sqrt{50}=5\\sqrt{2}",
      ruleId: "u1.simplify-root",
    },
    {
      kind: "example",
      title: L("Voorbeeld: $\\sqrt{72}$", "Example: $\\sqrt{72}$"),
      problem: L("Vereenvoudig $\\sqrt{72}$.", "Simplify $\\sqrt{72}$."),
      visual: squareFactor(72),
      solution: {
        steps: [
          { latex: "\\sqrt{72}", note: L("$4$ en $9$ passen, maar $36$ is het grootst.", "$4$ and $9$ fit, but $36$ is the biggest.") },
          { latex: "\\sqrt{\\hl{36\\cdot 2}}", note: L("$72=36\\cdot 2$.", "$72=36\\cdot 2$.") },
          { latex: "\\hl{\\sqrt{36}\\cdot\\sqrt{2}}", note: L("Splits de wortel.", "Split the root.") },
          { latex: "\\ask{6}\\sqrt{2}", note: L("$\\sqrt{36}=6$.", "$\\sqrt{36}=6$.") },
        ],
      },
    },
    {
      kind: "explain",
      title: L("Neem het grootste kwadraat", "Take the biggest square number"),
      body: L(
        "Kies je bij $\\sqrt{72}$ eerst $4$? Dan krijg je $2\\sqrt{18}$.\nDat klopt, maar in $18$ zit nog $9$.\nGa door: $2\\sqrt{18}=2\\cdot 3\\sqrt{2}=6\\sqrt{2}$.",
        "Do you choose $4$ first for $\\sqrt{72}$? Then you get $2\\sqrt{18}$.\nThat is right, but $18$ still contains $9$.\nKeep going: $2\\sqrt{18}=2\\cdot 3\\sqrt{2}=6\\sqrt{2}$.",
      ),
      latex: "2\\sqrt{18}=6\\sqrt{2}",
    },
    {
      kind: "example",
      title: L("Voorbeeld: terug onder de wortel", "Example: back under the root"),
      problem: L("Schrijf $3\\sqrt{5}$ als één wortel.", "Write $3\\sqrt{5}$ as one root."),
      solution: {
        steps: [
          { latex: "3\\sqrt{5}", note: L("$3=\\sqrt{9}$.", "$3=\\sqrt{9}$.") },
          { latex: "\\hl{\\sqrt{9}}\\cdot\\sqrt{5}", note: L("Schrijf $3$ als wortel.", "Write $3$ as a root.") },
          { latex: "\\sqrt{\\ask{45}}", note: L("$9\\cdot 5=45$.", "$9\\cdot 5=45$.") },
        ],
      },
    },
    {
      kind: "example",
      title: L("Voorbeeld: twee wortels keer elkaar", "Example: two roots multiplied"),
      problem: L("Vereenvoudig $\\sqrt{6}\\cdot\\sqrt{3}$.", "Simplify $\\sqrt{6}\\cdot\\sqrt{3}$."),
      solution: {
        steps: [
          { latex: "\\sqrt{6}\\cdot\\sqrt{3}", note: L("Bij keer: één wortel.", "With times: one root.") },
          { latex: "\\sqrt{\\ask{18}}", note: L("$6\\cdot 3=18$.", "$6\\cdot 3=18$.") },
          { latex: "\\sqrt{\\hl{9\\cdot 2}}", note: L("$9$ past in $18$.", "$9$ fits into $18$.") },
          { latex: "\\ask{3}\\sqrt{2}", note: L("$\\sqrt{9}=3$.", "$\\sqrt{9}=3$.") },
        ],
      },
    },
  ],
  practice: [
    { generatorId: "u1.simplify-root", difficulty: 1, count: 3 },
    { generatorId: "u1.simplify-root", difficulty: 2, count: 3 },
    { generatorId: "u1.simplify-root", difficulty: 3, count: 2 },
  ],
};
