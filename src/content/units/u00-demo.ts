/**
 * Demo lesson: a guided tour of the lesson player.
 *
 * It shows every building block once (explanation, worked example, metaphor,
 * mnemonic, all exercise types, hints, calculator on/off) and is used to test
 * the player in phase 1. The real Unit 0 lessons replace it in phase 2.
 */
import type { Lesson } from "../types";

export const demoLesson: Lesson = {
  id: "u0-demo",
  title: { nl: "Kennismaken met Lemma", en: "Getting to know Lemma" },
  goal: {
    nl: "Je weet hoe een les werkt: uitleg, voorbeeld, oefenen en hints.",
    en: "You know how a lesson works: explanation, example, practice and hints.",
  },
  minutes: 8,
  calculator: "allowed",
  info: {
    what: {
      nl: "Een korte rondleiding. Je ziet elk soort scherm één keer.",
      en: "A short tour. You see every kind of screen once.",
    },
    why: {
      nl: "Als je weet hoe de app werkt, kun je je richten op de wiskunde.",
      en: "Once you know how the app works, you can focus on the maths.",
    },
    later: {
      nl: "Elke les in Lemma is op dezelfde manier opgebouwd. Ook straks bij differentiëren en machine learning.",
      en: "Every lesson in Lemma has the same structure. Later on too, for derivatives and machine learning.",
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
      ruleId: "order-of-operations",
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
    {
      kind: "explain",
      title: { nl: "Een vergelijking is een balans", en: "An equation is a balance" },
      body: {
        nl: "Bij een vergelijking zoek je het getal dat op de plek van $x$ hoort.\nJe werkt alsof het een balans is.",
        en: "With an equation you look for the number that belongs in place of $x$.\nYou work as if it is a balance.",
      },
      metaphor: "balance",
      ruleId: "balance-method",
    },
    {
      kind: "example",
      title: { nl: "Voorbeeld: de balans", en: "Example: the balance" },
      problem: { nl: "Los op: $2x+3=7$.", en: "Solve: $2x+3=7$." },
      solution: {
        steps: [
          { latex: "2x+3=7", note: { nl: "Dit is de vergelijking.", en: "This is the equation." } },
          { latex: "2x+3\\hl{-3}=7\\hl{-3}", note: { nl: "Haal links en rechts $3$ weg.", en: "Subtract $3$ on both sides." } },
          { latex: "2x=\\hl{4}", note: { nl: "Reken uit.", en: "Work it out." } },
          { latex: "x=\\hl{2}", note: { nl: "Deel links en rechts door $2$.", en: "Divide both sides by $2$." } },
        ],
        solutions: [{ x: 2 }],
      },
    },
  ],
  practice: [
    { generatorId: "arith.order-of-operations", difficulty: 1, count: 2 },
    { generatorId: "arith.order-of-operations", difficulty: 2, count: 1 },
    { generatorId: "arith.add-fractions", difficulty: 1, count: 1 },
    { generatorId: "algebra.linear-equation", difficulty: 1, count: 1 },
    { generatorId: "algebra.linear-equation", difficulty: 2, count: 1 },
    { generatorId: "algebra.common-factor", difficulty: 1, count: 1 },
    { generatorId: "trig.sohcahtoa-side", difficulty: 1, count: 1 },
  ],
};
