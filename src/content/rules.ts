/**
 * Rule cards (regelkaarten).
 *
 * Every rule gets a short, fixed name and a card. Lessons and hints link to
 * these cards with `[[rule:id]]`, and together they form the reference
 * section of the app. Each card's example is checked by the tests.
 */
import type { RuleCard } from "./types";

export const RULES: RuleCard[] = [
  {
    id: "order-of-operations",
    name: { nl: "Rekenvolgorde", en: "Order of operations" },
    statement: {
      nl: "Eerst haakjes. Dan machten en wortels. Dan keer en gedeeld door. Tot slot plus en min. Bij gelijke stappen: van links naar rechts.",
      en: "First brackets. Then powers and roots. Then multiply and divide. Finally add and subtract. Equal steps: from left to right.",
    },
    mnemonic: "hmwvdoa",
    lessonId: "u0-demo",
    example: {
      problem: { nl: "Bereken $2+3\\cdot 4$.", en: "Work out $2+3\\cdot 4$." },
      steps: [
        { latex: "2+3\\cdot 4", note: { nl: "Keer gaat vóór plus.", en: "Multiply comes before add." } },
        { latex: "2+\\hl{12}", note: { nl: "Eerst $3\\cdot 4=12$.", en: "First $3\\cdot 4=12$." } },
        { latex: "\\hl{14}", note: { nl: "Dan de plus.", en: "Then the addition." } },
      ],
    },
  },
  {
    id: "fractions-add",
    name: { nl: "Breuken optellen", en: "Adding fractions" },
    statement: {
      nl: "Maak eerst de noemers gelijk. Tel dan alleen de tellers op. De noemer blijft hetzelfde.",
      en: "First make the denominators equal. Then add only the numerators. The denominator stays the same.",
    },
    latex: "\\frac{a}{n}+\\frac{b}{n}=\\frac{a+b}{n}",
    lessonId: "u0-demo",
    example: {
      problem: { nl: "Bereken $\\frac{1}{2}+\\frac{1}{3}$.", en: "Work out $\\frac{1}{2}+\\frac{1}{3}$." },
      steps: [
        { latex: "\\frac{1}{2}+\\frac{1}{3}", note: { nl: "Noemers 2 en 3 zijn niet gelijk.", en: "Denominators 2 and 3 are not equal." } },
        {
          latex: "\\hl{\\frac{3}{6}}+\\hl{\\frac{2}{6}}",
          note: { nl: "Maak van beide noemers 6.", en: "Make both denominators 6." },
        },
        { latex: "\\frac{\\hl{5}}{6}", note: { nl: "Tel de tellers op.", en: "Add the numerators." } },
      ],
    },
  },
  {
    id: "balance-method",
    name: { nl: "De balans", en: "The balance" },
    statement: {
      nl: "Een vergelijking is een balans. Wat je links doet, doe je ook rechts. Zo blijft de vergelijking kloppen.",
      en: "An equation is a balance. Whatever you do on the left, you also do on the right. That keeps the equation true.",
    },
    lessonId: "u0-demo",
    example: {
      problem: { nl: "Los op: $2x+3=11$.", en: "Solve: $2x+3=11$." },
      steps: [
        { latex: "2x+3=11", note: { nl: "Dit is de vergelijking.", en: "This is the equation." } },
        { latex: "2x=\\hl{8}", note: { nl: "Haal links en rechts $3$ weg.", en: "Subtract $3$ on both sides." } },
        { latex: "x=\\hl{4}", note: { nl: "Deel links en rechts door $2$.", en: "Divide both sides by $2$." } },
      ],
      solutions: [{ x: 4 }],
    },
  },
  {
    id: "common-factor",
    name: { nl: "Buiten haakjes halen", en: "Common factor" },
    statement: {
      nl: "Zit iets in alle termen? Zet het vóór de haakjes. Dit is haakjes wegwerken, maar dan andersom.",
      en: "Is something in every term? Put it in front of the brackets. This is expanding brackets, in reverse.",
    },
    latex: "ab+ac=a(b+c)",
    lessonId: "u0-demo",
    example: {
      problem: { nl: "Haal buiten haakjes: $6x+9$.", en: "Factor out: $6x+9$." },
      steps: [
        { latex: "6x+9", note: { nl: "Beide termen zitten in de tafel van 3.", en: "Both terms are multiples of 3." } },
        { latex: "\\hl{3}\\cdot 2x+\\hl{3}\\cdot 3", note: { nl: "Schrijf elke term als $3$ keer iets.", en: "Write each term as $3$ times something." } },
        { latex: "\\hl{3}(2x+3)", note: { nl: "Zet de $3$ vóór de haakjes.", en: "Put the $3$ in front of the brackets." } },
      ],
    },
  },
  {
    id: "sos-cas-toa",
    name: { nl: "SOS CAS TOA", en: "SOH CAH TOA" },
    statement: {
      nl: "In een rechthoekige driehoek: sinus = overstaand / schuin, cosinus = aanliggend / schuin, tangens = overstaand / aanliggend.",
      en: "In a right triangle: sine = opposite / hypotenuse, cosine = adjacent / hypotenuse, tangent = opposite / adjacent.",
    },
    mnemonic: "soscastoa",
    lessonId: "u0-demo",
    example: {
      problem: {
        nl: "De schuine zijde is $10$, de hoek is $30^{\\circ}$. Hoe lang is de overstaande zijde $x$?",
        en: "The hypotenuse is $10$ and the angle is $30^{\\circ}$. How long is the opposite side $x$?",
      },
      steps: [
        { latex: "\\sin(30^{\\circ})=\\frac{x}{10}", note: { nl: "SOS: overstaand en schuin.", en: "SOH: opposite and hypotenuse." } },
        { latex: "x=\\hl{10\\cdot\\sin(30^{\\circ})}", note: { nl: "Keer $10$, links en rechts.", en: "Times $10$, on both sides." } },
        { latex: "x=\\hl{5}", note: { nl: "$\\sin(30^{\\circ})=0{,}5$, dus $x=5$.", en: "$\\sin(30^{\\circ})=0.5$, so $x=5$." } },
      ],
      solutions: [{ x: 5 }],
    },
  },
];

const byId = new Map(RULES.map((r) => [r.id, r]));

export function getRule(id: string): RuleCard | undefined {
  return byId.get(id);
}
