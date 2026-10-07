/**
 * Unit 0: Refresher (opfrissen), at pre-vocational (vmbo kader) level.
 *
 * Folder layout: `lessons/` has one file per lesson, `gen/` the exercise
 * generators per topic, `widgets/` the interactive pictures of this unit.
 */
import type { Skill, UnitBundle } from "@/content/types";
import { orderOfOperations, splitMultiply } from "./gen/arithmetic";
import { decimalArithmetic, decimalFraction, timesTen } from "./gen/decimals";
import { formulaSubstitute, tableRead } from "./gen/formulas";
import { addFractions, fractionOf, simplifyFraction } from "./gen/fractions";
import { perimeterArea, volume } from "./gen/geometry";
import { percentChange, percentOf, percentWhat } from "./gen/percentages";
import { pythagorasLong, pythagorasShort } from "./gen/pythagoras";
import { ratioShare, ratioTable } from "./gen/ratios";
import { sohCahToaAngle, sohCahToaChoose, sohCahToaSide } from "./gen/trig";
import { unitConvert } from "./gen/units";
import { L } from "./helpers";
import { arithmeticLesson } from "./lessons/arithmetic";
import { decimalsLesson } from "./lessons/decimals";
import { formulasLesson } from "./lessons/formulas";
import { fractionsLesson } from "./lessons/fractions";
import { geometryLesson } from "./lessons/geometry";
import { percentagesLesson } from "./lessons/percentages";
import { pythagorasLesson } from "./lessons/pythagoras";
import { ratiosLesson } from "./lessons/ratios";
import { trigLesson } from "./lessons/trig";
import { unitsLesson } from "./lessons/units";
import { rules } from "./rules";
import { CubeStack } from "./widgets/cube-stack";
import { Groups } from "./widgets/groups";
import { HundredGrid } from "./widgets/hundred-grid";
import { OrderTap } from "./widgets/order-tap";
import { PercentBar } from "./widgets/percent-bar";
import { PlaceValue } from "./widgets/place-value";
import { RatioTable } from "./widgets/ratio-table";
import { ShapeGrid } from "./widgets/shape-grid";
import { UnitStairs } from "./widgets/unit-stairs";

/** One skill per practised thing; each has one generator here. */
const skill = (id: string, name: [string, string], lessonId: string, ruleIds: string[], generatorIds: string[]): Skill => ({
  id,
  name: L(name[0], name[1]),
  lessonId,
  ruleIds,
  generatorIds,
});

const skills: Skill[] = [
  skill("u0.mental-arithmetic", ["Hoofdrekenen: splitsen", "Mental maths: splitting"], "u0.order-of-operations", ["u0.split-multiply"], ["u0.split-multiply"]),
  skill("u0.order-of-operations", ["Rekenvolgorde", "Order of operations"], "u0.order-of-operations", ["u0.order-of-operations"], ["u0.order-of-operations"]),
  skill("u0.simplify-fraction", ["Breuken vereenvoudigen", "Simplifying fractions"], "u0.fractions", ["u0.simplify-fraction"], ["u0.simplify-fraction"]),
  skill("u0.fraction-of", ["Breuk van een getal", "Fraction of a number"], "u0.fractions", ["u0.fraction-of"], ["u0.fraction-of"]),
  skill("u0.add-fractions", ["Breuken optellen", "Adding fractions"], "u0.fractions", ["u0.add-fractions"], ["u0.add-fractions"]),
  skill("u0.times-ten", ["Keer en gedeeld door 10", "Times and divided by 10"], "u0.decimals", ["u0.times-ten"], ["u0.times-ten"]),
  skill("u0.decimals", ["Kommagetal en breuk", "Decimal and fraction"], "u0.decimals", ["u0.decimal-fraction"], ["u0.decimal-fraction"]),
  skill("u0.decimal-arithmetic", ["Rekenen met kommagetallen", "Calculating with decimals"], "u0.decimals", ["u0.decimal-arithmetic"], ["u0.decimal-arithmetic"]),
  skill("u0.ratio-table", ["Verhoudingstabel", "Ratio table"], "u0.ratios", ["u0.ratio-table"], ["u0.ratio-table"]),
  skill("u0.ratio-share", ["Verdelen in een verhouding", "Sharing in a ratio"], "u0.ratios", ["u0.ratio-share"], ["u0.ratio-share"]),
  skill("u0.percent-of", ["Procent van een getal", "Percentage of a number"], "u0.percentages", ["u0.percent"], ["u0.percent-of"]),
  skill("u0.percent-change", ["Korting en verhoging", "Discount and increase"], "u0.percentages", ["u0.growth-factor"], ["u0.percent-change"]),
  skill("u0.percent-what", ["Hoeveel procent?", "What percentage?"], "u0.percentages", ["u0.percent"], ["u0.percent-what"]),
  skill("u0.units", ["Eenheden omrekenen", "Converting units"], "u0.units", ["u0.unit-stairs", "u0.area-units"], ["u0.unit-convert"]),
  skill("u0.formulas", ["Formules invullen", "Filling in formulas"], "u0.formulas", ["u0.substitute"], ["u0.formula-substitute"]),
  skill("u0.tables-graphs", ["Tabellen en grafieken lezen", "Reading tables and graphs"], "u0.formulas", ["u0.read-table"], ["u0.table-read"]),
  skill("u0.perimeter-area", ["Omtrek en oppervlakte", "Perimeter and area"], "u0.perimeter-area-volume", ["u0.perimeter", "u0.area"], ["u0.perimeter-area"]),
  skill("u0.volume", ["Inhoud", "Volume"], "u0.perimeter-area-volume", ["u0.volume"], ["u0.volume"]),
  skill("u0.pythagoras-long", ["Pythagoras: schuine zijde", "Pythagoras: hypotenuse"], "u0.pythagoras", ["u0.pythagoras"], ["u0.pythagoras-long"]),
  skill("u0.pythagoras-short", ["Pythagoras: korte zijde", "Pythagoras: short side"], "u0.pythagoras", ["u0.pythagoras"], ["u0.pythagoras-short"]),
  skill("u0.sos-cas-toa-choose", ["SOS CAS TOA kiezen", "Choosing SOH CAH TOA"], "u0.sos-cas-toa", ["u0.sos-cas-toa"], ["u0.sohcahtoa-choose"]),
  skill("u0.sos-cas-toa", ["Zijde met SOS CAS TOA", "Side with SOH CAH TOA"], "u0.sos-cas-toa", ["u0.sos-cas-toa"], ["u0.sohcahtoa-side"]),
  skill("u0.sos-cas-toa-angle", ["Hoek met SOS CAS TOA", "Angle with SOH CAH TOA"], "u0.sos-cas-toa", ["u0.inverse-trig", "u0.sos-cas-toa"], ["u0.sohcahtoa-angle"]),
];

export const bundle: UnitBundle = {
  unit: {
    id: "u0",
    index: 0,
    title: L("Opfrissen", "Refresher"),
    summary: L(
      "Rekenen, breuken, procenten, eenheden, Pythagoras en SOS CAS TOA.",
      "Arithmetic, fractions, percentages, units, Pythagoras and SOH CAH TOA.",
    ),
    status: "available",
    lessons: [
      arithmeticLesson,
      fractionsLesson,
      decimalsLesson,
      ratiosLesson,
      percentagesLesson,
      unitsLesson,
      formulasLesson,
      geometryLesson,
      pythagorasLesson,
      trigLesson,
    ],
    // Every exercise sets its own calculator policy (off for the hand skills).
    finalTest: {
      calculator: "allowed",
      blocks: [
        { generatorId: "u0.order-of-operations", difficulty: 3, count: 1 },
        { generatorId: "u0.add-fractions", difficulty: 2, count: 1 },
        { generatorId: "u0.decimal-arithmetic", difficulty: 3, count: 1 },
        { generatorId: "u0.ratio-table", difficulty: 2, count: 1 },
        { generatorId: "u0.percent-change", difficulty: 2, count: 1 },
        { generatorId: "u0.unit-convert", difficulty: 3, count: 1 },
        { generatorId: "u0.formula-substitute", difficulty: 3, count: 1 },
        { generatorId: "u0.perimeter-area", difficulty: 3, count: 1 },
        { generatorId: "u0.pythagoras-long", difficulty: 2, count: 1 },
        { generatorId: "u0.sohcahtoa-side", difficulty: 2, count: 1 },
      ],
    },
    testOut: {
      calculator: "allowed",
      blocks: [
        { generatorId: "u0.order-of-operations", difficulty: 3, count: 1 },
        { generatorId: "u0.add-fractions", difficulty: 3, count: 1 },
        { generatorId: "u0.decimal-fraction", difficulty: 3, count: 1 },
        { generatorId: "u0.ratio-table", difficulty: 3, count: 1 },
        { generatorId: "u0.percent-change", difficulty: 3, count: 1 },
        { generatorId: "u0.unit-convert", difficulty: 3, count: 1 },
        { generatorId: "u0.formula-substitute", difficulty: 3, count: 1 },
        { generatorId: "u0.volume", difficulty: 3, count: 1 },
        { generatorId: "u0.pythagoras-short", difficulty: 3, count: 1 },
        { generatorId: "u0.sohcahtoa-side", difficulty: 3, count: 1 },
        { generatorId: "u0.sohcahtoa-angle", difficulty: 3, count: 1 },
      ],
    },
  },
  generators: [
    splitMultiply,
    orderOfOperations,
    fractionOf,
    simplifyFraction,
    addFractions,
    timesTen,
    decimalFraction,
    decimalArithmetic,
    ratioTable,
    ratioShare,
    percentOf,
    percentChange,
    percentWhat,
    unitConvert,
    formulaSubstitute,
    tableRead,
    perimeterArea,
    volume,
    pythagorasLong,
    pythagorasShort,
    sohCahToaChoose,
    sohCahToaSide,
    sohCahToaAngle,
  ],
  skills,
  rules,
  widgets: {
    "u0.order-tap": OrderTap,
    "u0.groups": Groups,
    "u0.hundred-grid": HundredGrid,
    "u0.place-value": PlaceValue,
    "u0.ratio-table": RatioTable,
    "u0.percent-bar": PercentBar,
    "u0.unit-stairs": UnitStairs,
    "u0.shape-grid": ShapeGrid,
    "u0.cube-stack": CubeStack,
  },
};
