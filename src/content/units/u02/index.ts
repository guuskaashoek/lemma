/**
 * Unit 2: Algebra.
 */
import type { UnitBundle } from "@/content/types";
import { linearEquation } from "./generators";
import { balanceLesson } from "./lessons";
import { rules } from "./rules";

export const bundle: UnitBundle = {
  unit: {
    id: "u2",
    index: 2,
    title: { nl: "Algebra", en: "Algebra" },
    summary: {
      nl: "Variabelen, haakjes wegwerken, vergelijkingen, ongelijkheden, formules omwerken.",
      en: "Variables, expanding brackets, equations, inequalities, rearranging formulas.",
    },
    status: "available",
    lessons: [balanceLesson],
    finalTest: {
      calculator: "off",
      blocks: [
        { generatorId: "u2.linear-equation", difficulty: 2, count: 5 },
        { generatorId: "u2.linear-equation", difficulty: 3, count: 5 },
      ],
    },
    testOut: {
      calculator: "off",
      blocks: [{ generatorId: "u2.linear-equation", difficulty: 3, count: 10 }],
    },
  },
  generators: [linearEquation],
  skills: [
    {
      id: "u2.linear-equations",
      name: { nl: "Vergelijkingen oplossen", en: "Solving equations" },
      lessonId: "u2.balance",
      ruleIds: ["u2.balance-method"],
      generatorIds: ["u2.linear-equation"],
    },
  ],
  rules,
};
