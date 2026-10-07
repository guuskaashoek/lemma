/**
 * Unit 0 lessons.
 */
import type { Lesson } from "@/content/types";

export const orderOfOperationsLesson: Lesson = {
  id: "u0.order-of-operations",
  title: { nl: "Rekenvolgorde", en: "Order of operations" },
  goal: {
    nl: "Je rekent sommen met meer bewerkingen uit in de goede volgorde.",
    en: "You work out sums with several operations in the right order.",
  },
  minutes: 7,
  calculator: "off",
  calculatorOffReason: {
    nl: "De rekenmachine staat uit. De rekenvolgorde leer je met de hand.",
    en: "The calculator is off. You learn the order of operations by hand.",
  },
  info: {
    what: {
      nl: "Afspraken over welke bewerking je eerst doet: haakjes, machten, keer en delen, plus en min.",
      en: "Agreements about which operation comes first: brackets, powers, multiply and divide, add and subtract.",
    },
    why: {
      nl: "Zonder vaste volgorde krijgt iedereen een ander antwoord op dezelfde som.",
      en: "Without a fixed order, everyone would get a different answer to the same sum.",
    },
    later: {
      nl: "Bij elke formule die je invult. Ook computers en programmeertalen gebruiken precies deze volgorde.",
      en: "In every formula you fill in. Computers and programming languages use exactly this order too.",
    },
  },
  screens: [
    {
      kind: "explain",
      title: { nl: "Welkom", en: "Welcome" },
      body: {
        nl: "Elke les heeft vier delen.\n**Uitleg**: één idee per scherm.\n**Voorbeeld**: stap voor stap.\n**Oefenen**: van makkelijk naar moeilijk.\n**Hints**: altijd mogen, nooit straf.",
        en: "Every lesson has four parts.\n**Explanation**: one idea per screen.\n**Example**: step by step.\n**Practice**: from easy to hard.\n**Hints**: always allowed, never punished.",
      },
    },
    {
      kind: "explain",
      title: { nl: "Kleuren hebben betekenis", en: "Colours have meaning" },
      body: {
        nl: "In formules betekent kleur altijd hetzelfde.\nLetters zoals $x$ hebben één kleur. Getallen zoals $3$ een andere.\nWat in een stap verandert, krijgt een accent: $2+\\hl{12}$.\nDe legenda zie je altijd met toets **L**.",
        en: "In formulas, colour always means the same thing.\nLetters like $x$ have one colour. Numbers like $3$ another.\nWhat changes in a step gets an accent: $2+\\hl{12}$.\nPress **L** to see the legend at any time.",
      },
    },
    {
      kind: "explain",
      title: { nl: "Rekenvolgorde", en: "Order of operations" },
      body: {
        nl: "Bij een som met meer bewerkingen geldt een vaste volgorde.\nOnthoud de zin hieronder. De beginletters geven de volgorde.",
        en: "A sum with several operations has a fixed order.\nRemember the sentence below. Its first letters give the order.",
      },
      mnemonic: "hmwvdoa",
      ruleId: "u0.order-of-operations",
    },
    {
      kind: "example",
      title: { nl: "Voorbeeld: rekenvolgorde", en: "Example: order of operations" },
      problem: { nl: "Bereken $3+4\\cdot 2$.", en: "Work out $3+4\\cdot 2$." },
      solution: {
        steps: [
          { latex: "3+4\\cdot 2", note: { nl: "Er staan een plus en een keer.", en: "There is an add and a multiply." } },
          { latex: "3+\\hl{8}", note: { nl: "Keer gaat vóór plus: $4\\cdot 2=8$.", en: "Multiply comes before add: $4\\cdot 2=8$." } },
          { latex: "\\hl{11}", note: { nl: "Dan de plus: $3+8=11$.", en: "Then the addition: $3+8=11$." } },
        ],
      },
    },
  ],
  practice: [
    { generatorId: "u0.order-of-operations", difficulty: 1, count: 3 },
    { generatorId: "u0.order-of-operations", difficulty: 2, count: 3 },
    { generatorId: "u0.order-of-operations", difficulty: 3, count: 2 },
  ],
};
