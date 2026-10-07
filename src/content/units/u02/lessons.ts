/**
 * Unit 2 lessons.
 *
 * `balanceLesson` is the reference lesson for all units: short screens, an
 * interactive visual before any rule, worked examples whose steps come from
 * the same model as the picture, and practice from easy to hard.
 */
import type { Lesson } from "@/content/types";
import { initBalance } from "@/visuals/models/balance";
import { balanceSteps } from "./generators";

export const balanceLesson: Lesson = {
  id: "u2.balance",
  title: { nl: "Vergelijkingen: de balans", en: "Equations: the balance" },
  goal: {
    nl: "Je lost een vergelijking zoals $2x+3=7$ op met de balans.",
    en: "You solve an equation like $2x+3=7$ with the balance.",
  },
  minutes: 9,
  calculator: "off",
  calculatorOffReason: {
    nl: "De rekenmachine staat uit. Hier leer je de balansmethode.",
    en: "The calculator is off. Here you learn the balance method.",
  },
  info: {
    what: {
      nl: "Een vergelijking oplossen: uitzoeken welk getal op de plek van $x$ hoort.",
      en: "Solving an equation: finding out which number belongs in place of $x$.",
    },
    why: {
      nl: "Bijna alle wiskunde hierna gebruikt dit: formules omwerken, snijpunten, de abc-formule.",
      en: "Almost all maths after this uses it: rearranging formulas, intersections, the quadratic formula.",
    },
    later: {
      nl: "In AI zoek je de getallen in een model waarbij de fout zo klein mogelijk is. Ook dat is vergelijkingen oplossen.",
      en: "In AI you look for the numbers in a model that make the error as small as possible. That is solving equations too.",
    },
  },
  screens: [
    {
      kind: "explain",
      title: { nl: "Wat is een vergelijking?", en: "What is an equation?" },
      body: {
        nl: "Een vergelijking zegt: links is evenveel als rechts.\nIn $2x+3=7$ is $x$ een getal dat we nog niet kennen.\nWe zoeken welk getal het is.",
        en: "An equation says: the left side equals the right side.\nIn $2x+3=7$, $x$ is a number we do not know yet.\nWe look for which number it is.",
      },
      latex: "2x+3=7",
    },
    {
      kind: "visual",
      title: { nl: "Een vergelijking is een balans", en: "An equation is a balance" },
      body: {
        nl: "Elk blok $x$ weegt evenveel. Elk klein blokje weegt $1$.\nLinks: twee blokken $x$ en drie blokjes. Rechts: zeven blokjes.\nDe balans is in evenwicht.",
        en: "Every $x$-block weighs the same. Every small block weighs $1$.\nLeft: two $x$-blocks and three small blocks. Right: seven small blocks.\nThe balance is level.",
      },
      visual: { kind: "balance", a: 2, b: 3, c: 0, d: 7 },
      task: {
        nl: "Klik op één klein blokje links. Wat gebeurt er? Klik daarna op één blokje rechts.",
        en: "Click one small block on the left. What happens? Then click one block on the right.",
      },
      metaphor: "balance",
    },
    {
      kind: "visual",
      title: { nl: "Weghalen aan beide kanten", en: "Take away on both sides" },
      body: {
        nl: "Haal je links iets weg? Haal rechts precies hetzelfde weg.\nDan blijft de balans recht.",
        en: "Take something away on the left? Take exactly the same away on the right.\nThen the balance stays level.",
      },
      visual: { kind: "balance", a: 2, b: 3, c: 0, d: 7 },
      task: {
        nl: "Haal links en rechts $3$ blokjes weg. Wat blijft er over?",
        en: "Take $3$ blocks away on both sides. What is left?",
      },
      metaphor: "balance",
    },
    {
      kind: "visual",
      title: { nl: "Verdelen in groepjes", en: "Splitting into groups" },
      body: {
        nl: "Nu staat er $2x=4$: twee blokken $x$ wegen samen $4$.\nVerdeel beide kanten in $2$ gelijke groepjes.\nEén blok $x$ weegt dan de helft van $4$.",
        en: "Now it says $2x=4$: two $x$-blocks weigh $4$ together.\nSplit both sides into $2$ equal groups.\nOne $x$-block then weighs half of $4$.",
      },
      visual: { kind: "balance", a: 2, b: 0, c: 0, d: 4 },
      task: { nl: "Klik op “Deel links en rechts door $2$”.", en: "Click “Divide both sides by $2$”." },
      metaphor: "balance",
    },
    {
      kind: "example",
      title: { nl: "Voorbeeld: $2x+3=7$", en: "Example: $2x+3=7$" },
      problem: {
        nl: "Los op: $2x+3=7$. Kijk hoe de balans elke stap meedoet.",
        en: "Solve: $2x+3=7$. Watch the balance follow every step.",
      },
      visual: { kind: "balance", a: 2, b: 3, c: 0, d: 7 },
      solution: { steps: balanceSteps(initBalance(2, 3, 0, 7)), solutions: [{ x: 2 }] },
    },
    {
      kind: "example",
      title: { nl: "Voorbeeld: $x$ aan beide kanten", en: "Example: $x$ on both sides" },
      problem: {
        nl: "Los op: $3x+2=x+10$. Haal eerst de blokken $x$ weg die aan beide kanten staan.",
        en: "Solve: $3x+2=x+10$. First take away the $x$-blocks that are on both sides.",
      },
      visual: { kind: "balance", a: 3, b: 2, c: 1, d: 10 },
      solution: { steps: balanceSteps(initBalance(3, 2, 1, 10)), solutions: [{ x: 4 }] },
    },
    {
      kind: "explain",
      title: { nl: "Controleer je antwoord", en: "Check your answer" },
      body: {
        nl: "Vul je antwoord in en kijk of het klopt.\nBij $2x+3=7$ vond je $x=2$.\n$2\\cdot 2+3=7$. Klopt!\nZo weet je zeker dat je goed zit. Zie [[rule:u2.balance-method]].",
        en: "Put your answer back in and see if it works.\nFor $2x+3=7$ you found $x=2$.\n$2\\cdot 2+3=7$. Correct!\nNow you know for sure. See [[rule:u2.balance-method]].",
      },
      ruleId: "u2.balance-method",
    },
  ],
  practice: [
    { generatorId: "u2.linear-equation", difficulty: 1, count: 3 },
    { generatorId: "u2.linear-equation", difficulty: 2, count: 3 },
    { generatorId: "u2.linear-equation", difficulty: 3, count: 2 },
  ],
};
