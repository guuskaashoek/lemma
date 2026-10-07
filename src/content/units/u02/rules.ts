/**
 * Rule cards of unit 2. Each card's example is checked by the tests.
 */
import type { RuleCard } from "@/content/types";

export const rules: RuleCard[] = [
  {
    id: "u2.balance-method",
    name: { nl: "De balans", en: "The balance" },
    statement: {
      nl: "Een vergelijking is een balans. Wat je links doet, doe je ook rechts. Zo blijft de vergelijking kloppen.",
      en: "An equation is a balance. Whatever you do on the left, you also do on the right. That keeps the equation true.",
    },
    lessonId: "u2.balance",
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
];
