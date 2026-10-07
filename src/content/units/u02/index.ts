/**
 * Unit 2: Algebra.
 *
 * Folder layout: `lessons.ts` holds the reference lesson (the balance),
 * `lessons/` the other lessons, `generators.ts` the reference generator,
 * `gen/` the other generators, and `widgets/` the interactive pictures.
 */
import type { Skill, UnitBundle } from "@/content/types";
import { equationBrackets, equationNegative } from "./gen/equations";
import { expandDouble, expandSingle } from "./gen/expand";
import { inequalityFlip, inequalityMeaning, inequalitySolve } from "./gen/inequalities";
import { rearrange } from "./gen/rearrange";
import { combineLikeTerms, evaluateExpr } from "./gen/variables";
import { linearEquation } from "./generators";
import { L } from "./helpers";
import { balanceLesson } from "./lessons";
import { equationsLesson } from "./lessons/equations";
import { expandDoubleLesson, expandLesson } from "./lessons/expand";
import { flipLesson, inequalitiesLesson } from "./lessons/inequalities";
import { rearrangeLesson } from "./lessons/rearrange";
import { likeTermsLesson, variablesLesson } from "./lessons/variables";
import { rules } from "./rules";
import { Arrows } from "./widgets/arrows";
import { Flip } from "./widgets/flip";
import { IneqLine } from "./widgets/ineq-line";
import { Tiles } from "./widgets/tiles";
import { UndoMachine } from "./widgets/undo-machine";

const skill = (id: string, name: [string, string], lessonId: string, ruleIds: string[], generatorIds: string[]): Skill => ({
  id,
  name: L(name[0], name[1]),
  lessonId,
  ruleIds,
  generatorIds,
});

const skills: Skill[] = [
  skill("u2.evaluate", ["Invullen", "Filling in"], "u2.variables", ["u2.variable"], ["u2.evaluate"]),
  skill("u2.like-terms", ["Gelijke termen samennemen", "Combining like terms"], "u2.like-terms", ["u2.like-terms"], ["u2.like-terms"]),
  skill("u2.expand", ["Haakjes wegwerken", "Expanding brackets"], "u2.expand", ["u2.expand"], ["u2.expand-single"]),
  skill("u2.expand-double", ["Dubbele haakjes", "Double brackets"], "u2.expand-double", ["u2.expand-double"], ["u2.expand-double"]),
  skill("u2.linear-equations", ["Vergelijkingen oplossen", "Solving equations"], "u2.balance", ["u2.balance-method"], ["u2.linear-equation"]),
  skill("u2.equations-negative", ["Vergelijkingen met min-getallen", "Equations with negative numbers"], "u2.equations", ["u2.balance-method"], ["u2.equation-negative"]),
  skill("u2.equations-brackets", ["Vergelijkingen met haakjes", "Equations with brackets"], "u2.equations", ["u2.brackets-first", "u2.balance-method"], ["u2.equation-brackets"]),
  skill("u2.inequality-meaning", ["Wat is een oplossing?", "What is a solution?"], "u2.inequalities", ["u2.inequality"], ["u2.inequality-meaning"]),
  skill("u2.inequalities", ["Ongelijkheden oplossen", "Solving inequalities"], "u2.inequalities", ["u2.inequality"], ["u2.inequality-solve"]),
  skill("u2.inequality-flip", ["Teken omklappen", "Flipping the sign"], "u2.flip", ["u2.flip-sign"], ["u2.inequality-flip"]),
  skill("u2.rearrange", ["Formules omwerken", "Rearranging formulas"], "u2.rearrange", ["u2.rearrange"], ["u2.rearrange"]),
];

export const bundle: UnitBundle = {
  unit: {
    id: "u2",
    index: 2,
    title: L("Algebra", "Algebra"),
    summary: L(
      "Variabelen, haakjes wegwerken, vergelijkingen, ongelijkheden, formules omwerken.",
      "Variables, expanding brackets, equations, inequalities, rearranging formulas.",
    ),
    status: "available",
    lessons: [
      variablesLesson,
      likeTermsLesson,
      expandLesson,
      expandDoubleLesson,
      balanceLesson,
      equationsLesson,
      inequalitiesLesson,
      flipLesson,
      rearrangeLesson,
    ],
    finalTest: {
      calculator: "off",
      blocks: [
        { generatorId: "u2.evaluate", difficulty: 2, count: 1 },
        { generatorId: "u2.like-terms", difficulty: 3, count: 1 },
        { generatorId: "u2.expand-single", difficulty: 2, count: 1 },
        { generatorId: "u2.expand-double", difficulty: 2, count: 1 },
        { generatorId: "u2.linear-equation", difficulty: 3, count: 1 },
        { generatorId: "u2.equation-negative", difficulty: 2, count: 1 },
        { generatorId: "u2.equation-brackets", difficulty: 2, count: 1 },
        { generatorId: "u2.inequality-solve", difficulty: 2, count: 1 },
        { generatorId: "u2.inequality-flip", difficulty: 2, count: 1 },
        { generatorId: "u2.rearrange", difficulty: 2, count: 1 },
      ],
    },
    testOut: {
      calculator: "off",
      blocks: [
        { generatorId: "u2.evaluate", difficulty: 3, count: 1 },
        { generatorId: "u2.like-terms", difficulty: 3, count: 1 },
        { generatorId: "u2.expand-single", difficulty: 3, count: 1 },
        { generatorId: "u2.expand-double", difficulty: 3, count: 1 },
        { generatorId: "u2.equation-negative", difficulty: 3, count: 1 },
        { generatorId: "u2.equation-brackets", difficulty: 3, count: 2 },
        { generatorId: "u2.inequality-solve", difficulty: 3, count: 1 },
        { generatorId: "u2.inequality-flip", difficulty: 3, count: 1 },
        { generatorId: "u2.rearrange", difficulty: 3, count: 1 },
      ],
    },
  },
  generators: [
    evaluateExpr,
    combineLikeTerms,
    expandSingle,
    expandDouble,
    linearEquation,
    equationNegative,
    equationBrackets,
    inequalityMeaning,
    inequalitySolve,
    inequalityFlip,
    rearrange,
  ],
  skills,
  rules,
  widgets: {
    "u2.tiles": Tiles,
    "u2.arrows": Arrows,
    "u2.ineq-line": IneqLine,
    "u2.flip": Flip,
    "u2.undo-machine": UndoMachine,
  },
};
