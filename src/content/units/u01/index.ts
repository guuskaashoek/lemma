/**
 * Unit 1: Foundations (fundament). Negative numbers, powers, roots,
 * scientific notation and the rules for powers.
 *
 * Folder layout: `lessons/` has the lessons, `gen/` the exercise generators
 * per topic, `widgets/` the interactive pictures of this unit (with their
 * pure models in `*-model.ts`).
 */
import type { Skill, UnitBundle } from "@/content/types";
import { addSubtract, compareNumbers, multiplyDivide } from "./gen/negatives";
import { negativeExponent, powerRule, productPower } from "./gen/power-rules";
import { powerValue } from "./gen/powers";
import { rootEstimate, simplifyRoot, squareRoot } from "./gen/roots";
import { fromScientific, sciCalc, toScientific } from "./gen/scientific";
import { L } from "./helpers";
import { minusMinusLesson } from "./lessons/minus-minus";
import { multiplyNegativesLesson } from "./lessons/multiply-negatives";
import { negativeExponentsLesson } from "./lessons/negative-exponents";
import { numberLineLesson } from "./lessons/number-line";
import { powerRulesLesson } from "./lessons/power-rules";
import { powersLesson } from "./lessons/powers";
import { scientificBigLesson, scientificSmallLesson } from "./lessons/scientific";
import { simplifyRootsLesson } from "./lessons/simplify-roots";
import { squareRootsLesson } from "./lessons/square-roots";
import { rules } from "./rules";
import { DecimalShift } from "./widgets/decimal-shift";
import { FactorChain } from "./widgets/factor-chain";
import { PowerSteps } from "./widgets/power-steps";
import { RootSquare } from "./widgets/root-square";
import { SignPattern } from "./widgets/sign-pattern";
import { SquareFactor } from "./widgets/square-factor";
import { ZeroPairs } from "./widgets/zero-pairs";

/** One skill per practised thing. */
const skill = (id: string, name: [string, string], lessonId: string, ruleIds: string[], generatorIds: string[]): Skill => ({
  id,
  name: L(name[0], name[1]),
  lessonId,
  ruleIds,
  generatorIds,
});

const skills: Skill[] = [
  skill("u1.compare", ["Getallen vergelijken", "Comparing numbers"], "u1.number-line", ["u1.number-line"], ["u1.compare"]),
  skill("u1.add-subtract", ["Plus en min met negatieve getallen", "Adding and subtracting negatives"], "u1.minus-minus", ["u1.number-line", "u1.minus-minus"], ["u1.add-subtract"]),
  skill("u1.multiply-divide", ["Keer en delen met negatieve getallen", "Multiplying and dividing negatives"], "u1.multiply-negatives", ["u1.sign-rule"], ["u1.multiply-divide"]),
  skill("u1.powers", ["Machten uitrekenen", "Working out powers"], "u1.powers", ["u1.power", "u1.power-brackets"], ["u1.power-value"]),
  skill("u1.square-roots", ["Wortels uitrekenen", "Working out roots"], "u1.square-roots", ["u1.square-root"], ["u1.square-root"]),
  skill("u1.root-estimate", ["Wortels schatten", "Estimating roots"], "u1.square-roots", ["u1.square-root"], ["u1.root-estimate"]),
  skill("u1.simplify-roots", ["Wortels vereenvoudigen", "Simplifying roots"], "u1.simplify-roots", ["u1.simplify-root"], ["u1.simplify-root"]),
  skill("u1.power-rules", ["Rekenregels voor machten", "Rules for powers"], "u1.power-rules", ["u1.product-rule", "u1.quotient-rule", "u1.power-of-power"], ["u1.power-rule"]),
  skill("u1.product-power", ["Macht van een product", "Power of a product"], "u1.power-rules", ["u1.product-power"], ["u1.product-power"]),
  skill("u1.negative-exponents", ["Exponent nul en negatief", "Zero and negative exponents"], "u1.negative-exponents", ["u1.zero-exponent", "u1.negative-exponent"], ["u1.negative-exponent"]),
  skill("u1.scientific", ["Wetenschappelijke notatie", "Scientific notation"], "u1.scientific-big", ["u1.scientific"], ["u1.to-scientific", "u1.from-scientific"]),
  skill("u1.scientific-calc", ["Rekenen met wetenschappelijke notatie", "Calculating in scientific notation"], "u1.scientific-small", ["u1.scientific-calc"], ["u1.sci-calc"]),
];

export const bundle: UnitBundle = {
  unit: {
    id: "u1",
    index: 1,
    title: L("Fundament", "Foundations"),
    summary: L(
      "Negatieve getallen, machten, wortels, wetenschappelijke notatie.",
      "Negative numbers, powers, roots, scientific notation.",
    ),
    status: "available",
    lessons: [
      numberLineLesson,
      minusMinusLesson,
      multiplyNegativesLesson,
      powersLesson,
      squareRootsLesson,
      simplifyRootsLesson,
      powerRulesLesson,
      negativeExponentsLesson,
      scientificBigLesson,
      scientificSmallLesson,
    ],
    // Everything in this unit is done by hand.
    finalTest: {
      calculator: "off",
      blocks: [
        { generatorId: "u1.add-subtract", difficulty: 3, count: 1 },
        { generatorId: "u1.multiply-divide", difficulty: 2, count: 1 },
        { generatorId: "u1.power-value", difficulty: 2, count: 1 },
        { generatorId: "u1.square-root", difficulty: 3, count: 1 },
        { generatorId: "u1.simplify-root", difficulty: 2, count: 1 },
        { generatorId: "u1.power-rule", difficulty: 2, count: 1 },
        { generatorId: "u1.product-power", difficulty: 2, count: 1 },
        { generatorId: "u1.negative-exponent", difficulty: 2, count: 1 },
        { generatorId: "u1.to-scientific", difficulty: 2, count: 1 },
        { generatorId: "u1.sci-calc", difficulty: 2, count: 1 },
      ],
    },
    testOut: {
      calculator: "off",
      blocks: [
        { generatorId: "u1.add-subtract", difficulty: 3, count: 1 },
        { generatorId: "u1.multiply-divide", difficulty: 3, count: 1 },
        { generatorId: "u1.power-value", difficulty: 3, count: 1 },
        { generatorId: "u1.root-estimate", difficulty: 3, count: 1 },
        { generatorId: "u1.simplify-root", difficulty: 3, count: 1 },
        { generatorId: "u1.power-rule", difficulty: 3, count: 1 },
        { generatorId: "u1.product-power", difficulty: 3, count: 1 },
        { generatorId: "u1.negative-exponent", difficulty: 3, count: 1 },
        { generatorId: "u1.to-scientific", difficulty: 3, count: 1 },
        { generatorId: "u1.sci-calc", difficulty: 3, count: 1 },
      ],
    },
  },
  generators: [
    compareNumbers,
    addSubtract,
    multiplyDivide,
    powerValue,
    squareRoot,
    rootEstimate,
    simplifyRoot,
    powerRule,
    productPower,
    negativeExponent,
    toScientific,
    fromScientific,
    sciCalc,
  ],
  skills,
  rules,
  widgets: {
    "u1.zero-pairs": ZeroPairs,
    "u1.sign-pattern": SignPattern,
    "u1.power-steps": PowerSteps,
    "u1.root-square": RootSquare,
    "u1.square-factor": SquareFactor,
    "u1.factor-chain": FactorChain,
    "u1.decimal-shift": DecimalShift,
  },
};
