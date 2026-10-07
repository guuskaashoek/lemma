/**
 * Rule cards of unit 0. Each card's example is checked by the tests.
 */
import type { RuleCard } from "@/content/types";

export const rules: RuleCard[] = [
  {
    id: "u0.order-of-operations",
    name: { nl: "Rekenvolgorde", en: "Order of operations" },
    statement: {
      nl: "Eerst haakjes. Dan machten en wortels. Dan keer en gedeeld door. Tot slot plus en min. Bij gelijke stappen: van links naar rechts.",
      en: "First brackets. Then powers and roots. Then multiply and divide. Finally add and subtract. Equal steps: from left to right.",
    },
    mnemonic: "hmwvdoa",
    lessonId: "u0.order-of-operations",
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
    id: "u0.add-fractions",
    name: { nl: "Breuken optellen", en: "Adding fractions" },
    statement: {
      nl: "Maak eerst de noemers gelijk. Tel dan alleen de tellers op. De noemer blijft hetzelfde.",
      en: "First make the denominators equal. Then add only the numerators. The denominator stays the same.",
    },
    latex: "\\frac{a}{n}+\\frac{b}{n}=\\frac{a+b}{n}",
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
    id: "u0.sos-cas-toa",
    name: { nl: "SOS CAS TOA", en: "SOH CAH TOA" },
    statement: {
      nl: "In een rechthoekige driehoek: sinus = overstaand / schuin, cosinus = aanliggend / schuin, tangens = overstaand / aanliggend.",
      en: "In a right triangle: sine = opposite / hypotenuse, cosine = adjacent / hypotenuse, tangent = opposite / adjacent.",
    },
    mnemonic: "soscastoa",
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
