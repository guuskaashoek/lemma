/**
 * Lesson 5: percentages. Percent of a number, the growth factor for a
 * discount or an increase, and "what percentage is this?".
 */
import type { Lesson } from "@/content/types";
import { L, custom } from "../helpers";

export const percentagesLesson: Lesson = {
  id: "u0.percentages",
  title: L("Procenten", "Percentages"),
  goal: L(
    "Je rekent een percentage uit, rekent met korting en verhoging, en zegt hoeveel procent iets is.",
    "You work out a percentage, calculate discounts and rises, and say what percentage something is.",
  ),
  minutes: 10,
  calculator: "allowed",
  calculatorOffReason: L(
    "Bij deze opgave staat de rekenmachine uit. Die reken je met de hand.",
    "The calculator is off for this exercise. You do this one by hand.",
  ),
  info: {
    what: L(
      "Procent betekent per honderd. $35\\%$ is $35$ van de $100$.",
      "Per cent means per hundred. $35\\%$ is $35$ out of $100$.",
    ),
    why: L(
      "Korting, btw, rente, loonsverhoging en uitslagen: overal staan procenten.",
      "Discounts, VAT, interest, pay rises and results: percentages are everywhere.",
    ),
    later: L(
      "De groeifactor komt terug bij exponentiële groei. Een AI-model geeft zijn zekerheid vaak in procenten.",
      "The growth factor returns in exponential growth. An AI model often gives its confidence as a percentage.",
    ),
  },
  screens: [
    {
      kind: "visual",
      title: L("Procent is per honderd", "Per cent is per hundred"),
      body: L(
        "Het hele vierkant is $100\\%$. Eén vakje is $1\\%$. Eén rij is $10\\%$.\nStel: het hele vierkant is $80$ euro waard.\nDan is één vakje $0.80$ euro.",
        "The whole square is $100\\%$. One square is $1\\%$. One row is $10\\%$.\nSay the whole square is worth $80$ euros.\nThen one square is $0.80$ euros.",
      ),
      visual: custom(
        "u0.hundred-grid",
        { percent: 25, whole: 80 },
        L("Honderd vakjes die samen $80$ zijn. Je kleurt er $25$.", "A hundred squares that together are $80$. You colour $25$."),
      ),
      task: L("Kleur $25\\%$: twee rijen en vijf vakjes. Hoeveel euro is dat?", "Colour $25\\%$: two rows and five squares. How many euros is that?"),
    },
    {
      kind: "explain",
      title: L("Handige procenten", "Handy percentages"),
      body: L(
        "$50\\%$ is de helft: deel door $2$.\n$25\\%$ is een kwart: deel door $4$.\n$10\\%$: deel door $10$. $1\\%$: deel door $100$.\nAndere procenten? Reken via $1\\%$, of doe keer het kommagetal: $35\\%$ is $0.35$ keer.\nZie [[rule:u0.percent]].",
        "$50\\%$ is a half: divide by $2$.\n$25\\%$ is a quarter: divide by $4$.\n$10\\%$: divide by $10$. $1\\%$: divide by $100$.\nOther percentages? Go through $1\\%$, or multiply by the decimal: $35\\%$ is $0.35$ times.\nSee [[rule:u0.percent]].",
      ),
      ruleId: "u0.percent",
    },
    {
      kind: "example",
      title: L("Voorbeeld: $35\\%$ van $60$", "Example: $35\\%$ of $60$"),
      problem: L("Hoeveel is $35\\%$ van $60$?", "What is $35\\%$ of $60$?"),
      solution: {
        steps: [
          { latex: "35\\%\\cdot 60", note: L("Van betekent keer.", "Of means times.") },
          { latex: "\\frac{60}{100}\\cdot 35", note: L("Reken via $1\\%$.", "Go through $1\\%$.") },
          { latex: "\\ask{0.6}\\cdot 35", note: L("$1\\%$ van $60$ is $0.6$.", "$1\\%$ of $60$ is $0.6$.") },
          { latex: "\\ask{21}", note: L("Keer $35$.", "Times $35$.") },
        ],
      },
    },
    {
      kind: "visual",
      title: L("Korting als strook", "A discount as a bar"),
      body: L(
        "Een jas kost $80$ euro. Je krijgt $25\\%$ korting.\nKnip $25\\%$ van de strook af. Er blijft $75\\%$ over.\n$75\\%$ is $0.75$ keer de prijs.",
        "A coat costs $80$ euros. You get $25\\%$ off.\nCut $25\\%$ off the bar. $75\\%$ is left.\n$75\\%$ is $0.75$ times the price.",
      ),
      visual: custom(
        "u0.percent-bar",
        { from: 80, percent: 25, up: false },
        L("Een strook van $100\\%$ is $80$ euro. Er gaat $25\\%$ af.", "A bar of $100\\%$ is $80$ euros. $25\\%$ comes off."),
      ),
      task: L("Klik drie keer op volgende stap. Wat is de nieuwe prijs?", "Click next step three times. What is the new price?"),
    },
    {
      kind: "visual",
      title: L("Verhoging als strook", "A rise as a bar"),
      body: L(
        "Er komt $21\\%$ btw bij een fiets van $500$ euro.\nDe strook groeit naar $121\\%$.\n$121\\%$ is $1.21$ keer de prijs.",
        "$21\\%$ VAT is added to a bike of $500$ euros.\nThe bar grows to $121\\%$.\n$121\\%$ is $1.21$ times the price.",
      ),
      visual: custom(
        "u0.percent-bar",
        { from: 500, percent: 21, up: true },
        L("Een strook van $100\\%$ is $500$ euro. Er komt $21\\%$ bij.", "A bar of $100\\%$ is $500$ euros. $21\\%$ is added."),
      ),
      task: L("Speel het af. Wat kost de fiets met btw?", "Play it. What does the bike cost with VAT?"),
    },
    {
      kind: "explain",
      title: L("De groeifactor", "The growth factor"),
      body: L(
        "$p\\%$ eraf: doe keer $\\frac{100-p}{100}$. Bij $25\\%$ korting is dat $0.75$.\n$p\\%$ erbij: doe keer $\\frac{100+p}{100}$. Bij $21\\%$ btw is dat $1.21$.\nTerugrekenen naar de oude prijs? Deel door de groeifactor.\nZie [[rule:u0.growth-factor]].",
        "$p\\%$ off: multiply by $\\frac{100-p}{100}$. For $25\\%$ off that is $0.75$.\n$p\\%$ added: multiply by $\\frac{100+p}{100}$. For $21\\%$ VAT that is $1.21$.\nGoing back to the old price? Divide by the growth factor.\nSee [[rule:u0.growth-factor]].",
      ),
      ruleId: "u0.growth-factor",
    },
    {
      kind: "example",
      title: L("Voorbeeld: hoeveel procent?", "Example: what percentage?"),
      problem: L("Van de $40$ leerlingen komen er $14$ op de fiets. Hoeveel procent is dat?", "Of the $40$ students, $14$ come by bike. What percentage is that?"),
      visual: custom("u0.hundred-grid", { percent: 35 }, L("Honderd vakjes. Je kleurt er $35$.", "A hundred squares. You colour $35$.")),
      solution: {
        steps: [
          { latex: "\\frac{14}{40}\\cdot 100", note: L("Deel gedeeld door geheel, keer $100$.", "Part divided by whole, times $100$.") },
          { latex: "\\ask{0.35}\\cdot 100", note: L("$14:40=0.35$.", "$14:40=0.35$.") },
          { latex: "\\ask{35}", note: L("Dus $35\\%$.", "So $35\\%$.") },
        ],
      },
    },
  ],
  practice: [
    { generatorId: "u0.percent-of", difficulty: 1, count: 2 },
    { generatorId: "u0.percent-of", difficulty: 2, count: 1 },
    { generatorId: "u0.percent-change", difficulty: 1, count: 1 },
    { generatorId: "u0.percent-what", difficulty: 1, count: 1 },
    { generatorId: "u0.percent-change", difficulty: 2, count: 1 },
    { generatorId: "u0.percent-what", difficulty: 2, count: 1 },
    { generatorId: "u0.percent-of", difficulty: 3, count: 1 },
    { generatorId: "u0.percent-change", difficulty: 3, count: 1 },
    { generatorId: "u0.percent-what", difficulty: 3, count: 1 },
  ],
};
