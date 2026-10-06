/**
 * The roadmap: all units, in order, plus lookup helpers.
 *
 * Unit 0 is always the starting point. A unit unlocks once the final test of
 * the previous unit is passed (>= 80%) or the previous unit was skipped with
 * a "test out" score of >= 90%.
 */
import type { Lesson, Skill, Unit } from "./types";
import { demoLesson } from "./units/u00-demo";

/** Score needed to pass a final test. */
export const FINAL_PASS = 0.8;
/** Score needed to skip a unit with the "test out" test. */
export const TEST_OUT_PASS = 0.9;

/** Shorthand for a unit that is on the roadmap but not built yet. */
function planned(index: number, title: Unit["title"], summary: Unit["summary"]): Unit {
  return { id: `u${index}`, index, title, summary, status: "planned", lessons: [] };
}

export const UNITS: Unit[] = [
  {
    id: "u0",
    index: 0,
    title: { nl: "Opfrissen", en: "Refresher" },
    summary: {
      nl: "Rekenen, breuken, procenten, eenheden, Pythagoras en SOS CAS TOA.",
      en: "Arithmetic, fractions, percentages, units, Pythagoras and SOH CAH TOA.",
    },
    status: "available",
    lessons: [demoLesson],
    finalTest: {
      calculator: "allowed",
      blocks: [
        { generatorId: "arith.order-of-operations", difficulty: 2, count: 3 },
        { generatorId: "arith.add-fractions", difficulty: 2, count: 2 },
        { generatorId: "algebra.linear-equation", difficulty: 2, count: 2 },
        { generatorId: "algebra.common-factor", difficulty: 1, count: 1 },
        { generatorId: "trig.sohcahtoa-side", difficulty: 2, count: 2 },
      ],
    },
    testOut: {
      calculator: "allowed",
      blocks: [
        { generatorId: "arith.order-of-operations", difficulty: 3, count: 3 },
        { generatorId: "arith.add-fractions", difficulty: 3, count: 3 },
        { generatorId: "algebra.linear-equation", difficulty: 3, count: 2 },
        { generatorId: "trig.sohcahtoa-side", difficulty: 3, count: 2 },
      ],
    },
  },
  planned(1, { nl: "Fundament", en: "Foundations" }, {
    nl: "Negatieve getallen, machten, wortels, wetenschappelijke notatie.",
    en: "Negative numbers, powers, roots, scientific notation.",
  }),
  planned(2, { nl: "Algebra", en: "Algebra" }, {
    nl: "Variabelen, haakjes wegwerken, vergelijkingen, ongelijkheden, formules omwerken.",
    en: "Variables, expanding brackets, equations, inequalities, rearranging formulas.",
  }),
  planned(3, { nl: "Lineaire functies", en: "Linear functions" }, {
    nl: "Grafieken, richtingscoëfficiënt, snijpunten, stelsels.",
    en: "Graphs, slope, intersections, systems of equations.",
  }),
  planned(4, { nl: "Kwadratische functies", en: "Quadratic functions" }, {
    nl: "Ontbinden in factoren, abc-formule, parabolen, discriminant.",
    en: "Factorising, the quadratic formula, parabolas, discriminant.",
  }),
  planned(5, { nl: "Exponentiële functies en logaritmen", en: "Exponentials and logarithms" }, {
    nl: "Machten, groei, logaritmen en hun rekenregels.",
    en: "Powers, growth, logarithms and their rules.",
  }),
  planned(6, { nl: "Goniometrie", en: "Trigonometry" }, {
    nl: "Eenheidscirkel, radialen, sinus- en cosinusregel, goniometrische vergelijkingen.",
    en: "Unit circle, radians, sine and cosine rule, trigonometric equations.",
  }),
  planned(7, { nl: "Differentiëren", en: "Differentiation" }, {
    nl: "Limiet, afgeleide, som-, product-, quotiënt- en kettingregel, extremen, raaklijnen.",
    en: "Limits, derivatives, sum, product, quotient and chain rule, extremes, tangents.",
  }),
  planned(8, { nl: "Integreren", en: "Integration" }, {
    nl: "Primitiveren, oppervlakte onder een grafiek, substitutie, partieel integreren.",
    en: "Antiderivatives, area under a graph, substitution, integration by parts.",
  }),
  planned(9, { nl: "Vectoren en lineaire algebra", en: "Vectors and linear algebra" }, {
    nl: "Vectoren, inproduct, matrices, determinant, eigenwaarden.",
    en: "Vectors, dot product, matrices, determinant, eigenvalues.",
  }),
  planned(10, { nl: "Kansrekening en statistiek", en: "Probability and statistics" }, {
    nl: "Kansregels, Bayes, verdelingen, verwachtingswaarde, normale verdeling.",
    en: "Probability rules, Bayes, distributions, expected value, normal distribution.",
  }),
  planned(11, { nl: "Logica en bewijzen", en: "Logic and proofs" }, {
    nl: "Propositielogica, kwantoren, bewijs uit het ongerijmde, inductie.",
    en: "Propositional logic, quantifiers, proof by contradiction, induction.",
  }),
  planned(12, { nl: "WO-brug: wiskunde voor AI", en: "University bridge: maths for AI" }, {
    nl: "Meerdere variabelen, partiële afgeleiden, gradiënt, gradient descent.",
    en: "Several variables, partial derivatives, gradient, gradient descent.",
  }),
];

/** Skills: the unit of spaced repetition and of strong/weak statistics. */
export const SKILLS: Skill[] = [
  {
    id: "order-of-operations",
    name: { nl: "Rekenvolgorde", en: "Order of operations" },
    lessonId: "u0-demo",
    ruleIds: ["order-of-operations"],
    generatorIds: ["arith.order-of-operations"],
  },
  {
    id: "fractions-add",
    name: { nl: "Breuken optellen", en: "Adding fractions" },
    lessonId: "u0-demo",
    ruleIds: ["fractions-add"],
    generatorIds: ["arith.add-fractions"],
  },
  {
    id: "linear-equations",
    name: { nl: "Vergelijkingen oplossen", en: "Solving equations" },
    lessonId: "u0-demo",
    ruleIds: ["balance-method"],
    generatorIds: ["algebra.linear-equation"],
  },
  {
    id: "common-factor",
    name: { nl: "Buiten haakjes halen", en: "Common factor" },
    lessonId: "u0-demo",
    ruleIds: ["common-factor"],
    generatorIds: ["algebra.common-factor"],
  },
  {
    id: "sos-cas-toa",
    name: { nl: "SOS CAS TOA", en: "SOH CAH TOA" },
    lessonId: "u0-demo",
    ruleIds: ["sos-cas-toa"],
    generatorIds: ["trig.sohcahtoa-side"],
  },
];

const unitById = new Map(UNITS.map((u) => [u.id, u]));
const lessonIndex = new Map<string, { lesson: Lesson; unit: Unit; index: number }>();
for (const u of UNITS) u.lessons.forEach((l, index) => lessonIndex.set(l.id, { lesson: l, unit: u, index }));
const skillById = new Map(SKILLS.map((s) => [s.id, s]));

export const getUnit = (id: string) => unitById.get(id);
export const getLessonEntry = (id: string) => lessonIndex.get(id);
export const getSkill = (id: string) => skillById.get(id);
