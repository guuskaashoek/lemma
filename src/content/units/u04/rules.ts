/**
 * Rule cards of unit 4. Each card's example is checked by the tests.
 */
import type { RuleCard } from "@/content/types";

export const rules: RuleCard[] = [
  {
    id: "u4.common-factor",
    name: { nl: "Buiten haakjes halen", en: "Common factor" },
    statement: {
      nl: "Zit iets in alle termen? Zet het vóór de haakjes. Dit is haakjes wegwerken, maar dan andersom.",
      en: "Is something in every term? Put it in front of the brackets. This is expanding brackets, in reverse.",
    },
    latex: "ab+ac=a(b+c)",
    example: {
      problem: { nl: "Haal buiten haakjes: $6x+9$.", en: "Factor out: $6x+9$." },
      steps: [
        { latex: "6x+9", note: { nl: "Beide termen zitten in de tafel van 3.", en: "Both terms are multiples of 3." } },
        { latex: "\\hl{3}\\cdot 2x+\\hl{3}\\cdot 3", note: { nl: "Schrijf elke term als $3$ keer iets.", en: "Write each term as $3$ times something." } },
        { latex: "\\hl{3}(2x+3)", note: { nl: "Zet de $3$ vóór de haakjes.", en: "Put the $3$ in front of the brackets." } },
      ],
    },
  },
];
