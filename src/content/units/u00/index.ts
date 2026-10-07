/**
 * Unit 0: Refresher (opfrissen), at pre-vocational (vmbo kader) level.
 */
import type { UnitBundle } from "@/content/types";
import { orderOfOperations } from "./generators";
import { orderOfOperationsLesson } from "./lessons";
import { rules } from "./rules";

export const bundle: UnitBundle = {
  unit: {
    id: "u0",
    index: 0,
    title: { nl: "Opfrissen", en: "Refresher" },
    summary: {
      nl: "Rekenen, breuken, procenten, eenheden, Pythagoras en SOS CAS TOA.",
      en: "Arithmetic, fractions, percentages, units, Pythagoras and SOH CAH TOA.",
    },
    status: "available",
    lessons: [orderOfOperationsLesson],
    finalTest: {
      calculator: "off",
      blocks: [
        { generatorId: "u0.order-of-operations", difficulty: 2, count: 5 },
        { generatorId: "u0.order-of-operations", difficulty: 3, count: 5 },
      ],
    },
    testOut: {
      calculator: "off",
      blocks: [{ generatorId: "u0.order-of-operations", difficulty: 3, count: 10 }],
    },
  },
  // `addFractions` (generators.ts) and `sohCahToaSide` (trig.ts) are ready
  // for the fractions and SOS CAS TOA lessons and get registered with them.
  generators: [orderOfOperations],
  skills: [
    {
      id: "u0.order-of-operations",
      name: { nl: "Rekenvolgorde", en: "Order of operations" },
      lessonId: "u0.order-of-operations",
      ruleIds: ["u0.order-of-operations"],
      generatorIds: ["u0.order-of-operations"],
    },
  ],
  rules,
};
