/**
 * Unit 3: Linear functions (lineaire functies).
 *
 * Folder layout: `lessons/` has one file per lesson, `gen/` the exercise
 * generators per topic (plus shared worked-step builders in `gen/solve.ts`),
 * `widgets/` the interactive pictures of this unit.
 */
import type { Skill, UnitBundle } from "@/content/types";
import { pointOnLine, tableValue } from "./gen/graphs";
import { xIntercept } from "./gen/intercepts";
import { intersection } from "./gen/intersection";
import { findB, lineTwoPoints } from "./gen/line-formula";
import { slopeTwoPoints } from "./gen/slope";
import { formulaFromAB, readAB } from "./gen/start-step";
import { systemElimination, systemSubstitution, wordSystem } from "./gen/systems";
import { L } from "./helpers";
import { axisInterceptsLesson } from "./lessons/axis-intercepts";
import { eliminationLesson } from "./lessons/elimination";
import { formulaGraphLesson } from "./lessons/formula-graph";
import { intersectionLesson } from "./lessons/intersection";
import { lineFormulaLesson } from "./lessons/line-formula";
import { slopeLesson } from "./lessons/slope";
import { startStepLesson } from "./lessons/start-step";
import { substitutionLesson } from "./lessons/substitution";
import { wordSystemsLesson } from "./lessons/word-systems";
import { rules } from "./rules";
import { LineLab } from "./widgets/line-lab";
import { Meet } from "./widgets/meet";
import { PointWalk } from "./widgets/point-walk";
import { ShapeSystem } from "./widgets/shape-system";
import { SlopeWalk } from "./widgets/slope-walk";
import { TablePlot } from "./widgets/table-plot";

const skill = (id: string, name: [string, string], lessonId: string, ruleIds: string[], generatorIds: string[]): Skill => ({
  id,
  name: L(name[0], name[1]),
  lessonId,
  ruleIds,
  generatorIds,
});

const skills: Skill[] = [
  skill("u3.formula-table", ["Formule invullen", "Filling in a formula"], "u3.formula-graph", ["u3.formula-table"], ["u3.table-value"]),
  skill("u3.point-on-line", ["Ligt het punt op de lijn?", "Is the point on the line?"], "u3.formula-graph", ["u3.point-on-line"], ["u3.point-on-line"]),
  skill("u3.slope-intercept", ["a en b aflezen", "Reading a and b"], "u3.start-step", ["u3.slope-intercept"], ["u3.read-ab"]),
  skill("u3.write-formula", ["Formule bij start en stap", "Formula from start and step"], "u3.start-step", ["u3.slope-intercept"], ["u3.formula-from-ab"]),
  skill("u3.slope", ["Hellingsdriehoek", "Slope triangle"], "u3.slope", ["u3.slope"], ["u3.slope-two-points"]),
  skill("u3.find-b", ["Startgetal berekenen", "Working out the start value"], "u3.line-formula", ["u3.find-b"], ["u3.find-b"]),
  skill("u3.line-two-points", ["Formule bij twee punten", "Formula through two points"], "u3.line-formula", ["u3.slope", "u3.find-b"], ["u3.line-two-points"]),
  skill("u3.x-intercept", ["Snijpunten met de assen", "Crossing the axes"], "u3.axis-intercepts", ["u3.axis-intercepts"], ["u3.x-intercept"]),
  skill("u3.intersection", ["Snijpunt van twee lijnen", "Intersection of two lines"], "u3.intersection", ["u3.intersection"], ["u3.intersection"]),
  skill("u3.elimination", ["Stelsels: optellen of aftrekken", "Systems: adding or subtracting"], "u3.elimination", ["u3.elimination"], ["u3.system-elimination"]),
  skill("u3.substitution", ["Stelsels: invullen", "Systems: substitution"], "u3.substitution", ["u3.substitution"], ["u3.system-substitution"]),
  skill("u3.word-systems", ["Stelsels in het echt", "Systems in real life"], "u3.word-systems", ["u3.word-system", "u3.elimination", "u3.intersection"], ["u3.word-system"]),
];

export const bundle: UnitBundle = {
  unit: {
    id: "u3",
    index: 3,
    title: L("Lineaire functies", "Linear functions"),
    summary: L("Grafieken, richtingscoëfficiënt, snijpunten, stelsels.", "Graphs, slope, intersections, systems of equations."),
    status: "available",
    lessons: [
      formulaGraphLesson,
      startStepLesson,
      slopeLesson,
      lineFormulaLesson,
      axisInterceptsLesson,
      intersectionLesson,
      eliminationLesson,
      substitutionLesson,
      wordSystemsLesson,
    ],
    finalTest: {
      calculator: "off",
      blocks: [
        { generatorId: "u3.table-value", difficulty: 2, count: 1 },
        { generatorId: "u3.read-ab", difficulty: 2, count: 1 },
        { generatorId: "u3.formula-from-ab", difficulty: 2, count: 1 },
        { generatorId: "u3.slope-two-points", difficulty: 3, count: 1 },
        { generatorId: "u3.find-b", difficulty: 2, count: 1 },
        { generatorId: "u3.line-two-points", difficulty: 2, count: 1 },
        { generatorId: "u3.x-intercept", difficulty: 2, count: 1 },
        { generatorId: "u3.intersection", difficulty: 2, count: 1 },
        { generatorId: "u3.system-elimination", difficulty: 3, count: 1 },
        { generatorId: "u3.system-substitution", difficulty: 2, count: 1 },
        { generatorId: "u3.word-system", difficulty: 2, count: 1 },
      ],
    },
    testOut: {
      calculator: "off",
      blocks: [
        { generatorId: "u3.read-ab", difficulty: 3, count: 1 },
        { generatorId: "u3.formula-from-ab", difficulty: 3, count: 1 },
        { generatorId: "u3.slope-two-points", difficulty: 3, count: 1 },
        { generatorId: "u3.find-b", difficulty: 3, count: 1 },
        { generatorId: "u3.line-two-points", difficulty: 3, count: 1 },
        { generatorId: "u3.x-intercept", difficulty: 3, count: 1 },
        { generatorId: "u3.intersection", difficulty: 3, count: 1 },
        { generatorId: "u3.system-elimination", difficulty: 3, count: 1 },
        { generatorId: "u3.system-substitution", difficulty: 3, count: 1 },
        { generatorId: "u3.word-system", difficulty: 3, count: 1 },
      ],
    },
  },
  generators: [
    tableValue,
    pointOnLine,
    readAB,
    formulaFromAB,
    slopeTwoPoints,
    findB,
    lineTwoPoints,
    xIntercept,
    intersection,
    systemElimination,
    systemSubstitution,
    wordSystem,
  ],
  skills,
  rules,
  widgets: {
    "u3.line-lab": LineLab,
    "u3.table-plot": TablePlot,
    "u3.slope-walk": SlopeWalk,
    "u3.meet": Meet,
    "u3.shape-system": ShapeSystem,
    "u3.point-walk": PointWalk,
  },
};
