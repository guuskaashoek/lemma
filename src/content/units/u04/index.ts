/**
 * Unit 4: Quadratic functions (kwadratische functies).
 *
 * Folder layout: `lessons/` has one file per lesson, `gen/` the exercise
 * generators per topic, `widgets/` the interactive pictures of this unit.
 */
import type { Skill, UnitBundle } from "@/content/types";
import { abcFormula, discriminant, oneSolution, solutionCount } from "./gen/abc";
import { commonFactor } from "./gen/common-factor";
import { parabolaAxis, parabolaShape, parabolaTop } from "./gen/parabola";
import { productSum, productSumSolve } from "./gen/product-sum";
import { squareEquation, zeroProduct } from "./gen/zero-product";
import { L } from "./helpers";
import { abcLesson, discriminantLesson } from "./lessons/abc";
import { commonFactorLesson } from "./lessons/common-factor";
import { parabolaLesson } from "./lessons/parabola";
import { productSumLesson, productSumSolveLesson } from "./lessons/product-sum";
import { zeroProductLesson } from "./lessons/zero-product";
import { rules } from "./rules";
import { CommonHeight } from "./widgets/common-height";
import { Parabola } from "./widgets/parabola";
import { Tiles } from "./widgets/tiles";
import { ZeroProduct } from "./widgets/zero-product";

const skill = (id: string, name: [string, string], lessonId: string, ruleIds: string[], generatorIds: string[]): Skill => ({
  id,
  name: L(name[0], name[1]),
  lessonId,
  ruleIds,
  generatorIds,
});

const skills: Skill[] = [
  skill("u4.common-factor", ["Buiten haakjes halen", "Taking out a common factor"], "u4.common-factor", ["u4.common-factor"], ["u4.common-factor"]),
  skill("u4.zero-product", ["Product is nul", "Product is zero"], "u4.zero-product", ["u4.zero-product"], ["u4.zero-product"]),
  skill("u4.square-equation", ["Kwadraat is getal", "Square equals number"], "u4.zero-product", ["u4.square-equation"], ["u4.square-equation"]),
  skill("u4.product-sum", ["Ontbinden met product-som", "Factorising with product-sum"], "u4.product-sum", ["u4.product-sum"], ["u4.product-sum"]),
  skill("u4.product-sum-solve", ["Oplossen met product-som", "Solving with product-sum"], "u4.product-sum-solve", ["u4.product-sum", "u4.zero-product"], ["u4.product-sum-solve"]),
  skill("u4.parabola-shape", ["Dal of berg", "Valley or hill"], "u4.parabola", ["u4.parabola-shape"], ["u4.parabola-shape"]),
  skill("u4.parabola-top", ["Symmetrie-as en top", "Axis of symmetry and vertex"], "u4.parabola", ["u4.parabola-top"], ["u4.parabola-axis", "u4.parabola-top"]),
  skill("u4.discriminant", ["De discriminant", "The discriminant"], "u4.abc", ["u4.discriminant"], ["u4.discriminant"]),
  skill("u4.abc", ["De abc-formule", "The quadratic formula"], "u4.abc", ["u4.abc-formula", "u4.discriminant"], ["u4.abc"]),
  skill("u4.solution-count", ["Aantal oplossingen", "Number of solutions"], "u4.discriminant", ["u4.solution-count", "u4.discriminant"], ["u4.solution-count", "u4.one-solution"]),
];

export const bundle: UnitBundle = {
  unit: {
    id: "u4",
    index: 4,
    title: L("Kwadratische functies", "Quadratic functions"),
    summary: L(
      "Ontbinden in factoren, abc-formule, parabolen, discriminant.",
      "Factorising, the quadratic formula, parabolas, discriminant.",
    ),
    status: "available",
    lessons: [
      commonFactorLesson,
      zeroProductLesson,
      productSumLesson,
      productSumSolveLesson,
      parabolaLesson,
      abcLesson,
      discriminantLesson,
    ],
    finalTest: {
      calculator: "allowed",
      blocks: [
        { generatorId: "u4.common-factor", difficulty: 2, count: 1 },
        { generatorId: "u4.zero-product", difficulty: 2, count: 1 },
        { generatorId: "u4.square-equation", difficulty: 2, count: 1 },
        { generatorId: "u4.product-sum", difficulty: 2, count: 1 },
        { generatorId: "u4.product-sum-solve", difficulty: 2, count: 1 },
        { generatorId: "u4.parabola-shape", difficulty: 2, count: 1 },
        { generatorId: "u4.parabola-top", difficulty: 2, count: 1 },
        { generatorId: "u4.discriminant", difficulty: 2, count: 1 },
        { generatorId: "u4.abc", difficulty: 2, count: 1 },
        { generatorId: "u4.solution-count", difficulty: 3, count: 1 },
        { generatorId: "u4.one-solution", difficulty: 2, count: 1 },
      ],
    },
    testOut: {
      calculator: "allowed",
      blocks: [
        { generatorId: "u4.common-factor", difficulty: 3, count: 1 },
        { generatorId: "u4.zero-product", difficulty: 3, count: 1 },
        { generatorId: "u4.product-sum", difficulty: 3, count: 1 },
        { generatorId: "u4.product-sum-solve", difficulty: 3, count: 1 },
        { generatorId: "u4.parabola-shape", difficulty: 3, count: 1 },
        { generatorId: "u4.parabola-top", difficulty: 3, count: 1 },
        { generatorId: "u4.discriminant", difficulty: 3, count: 1 },
        { generatorId: "u4.abc", difficulty: 3, count: 1 },
        { generatorId: "u4.solution-count", difficulty: 3, count: 1 },
        { generatorId: "u4.one-solution", difficulty: 3, count: 1 },
      ],
    },
  },
  generators: [
    commonFactor,
    zeroProduct,
    squareEquation,
    productSum,
    productSumSolve,
    parabolaShape,
    parabolaAxis,
    parabolaTop,
    discriminant,
    abcFormula,
    solutionCount,
    oneSolution,
  ],
  skills,
  rules,
  widgets: {
    "u4.common-height": CommonHeight,
    "u4.tiles": Tiles,
    "u4.zero-product": ZeroProduct,
    "u4.parabola": Parabola,
  },
};
