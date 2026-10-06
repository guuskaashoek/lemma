/**
 * Generators for trigonometry in a right triangle (SOS CAS TOA).
 */
import { evaluate as calc } from "@/calculator/engine";
import { evaluate, parse } from "@/math/cas";
import { roundHalfAwayFromZero } from "@/math/check";
import type { Generator, Loc, Step } from "../types";

type Ratio = "sin" | "cos" | "tan";
type Side = "opposite" | "adjacent" | "hypotenuse";

const SIDE_NAME: Record<Side, Loc> = {
  opposite: { nl: "overstaande zijde", en: "opposite side" },
  adjacent: { nl: "aanliggende zijde", en: "adjacent side" },
  hypotenuse: { nl: "schuine zijde", en: "hypotenuse" },
};

/**
 * The four exercise types: which side is given and which one is asked.
 * The ratio follows from SOS CAS TOA.
 */
const CASES: Array<{ given: Side; asked: Side; ratio: Ratio; inverse: "multiply" | "divide" }> = [
  { given: "hypotenuse", asked: "opposite", ratio: "sin", inverse: "multiply" },
  { given: "hypotenuse", asked: "adjacent", ratio: "cos", inverse: "multiply" },
  { given: "adjacent", asked: "opposite", ratio: "tan", inverse: "multiply" },
  { given: "opposite", asked: "hypotenuse", ratio: "sin", inverse: "divide" },
];

const MNEMONIC_PART: Record<Ratio, Loc> = {
  sin: { nl: "SOS: sinus = overstaand / schuin.", en: "SOH: sine = opposite / hypotenuse." },
  cos: { nl: "CAS: cosinus = aanliggend / schuin.", en: "CAH: cosine = adjacent / hypotenuse." },
  tan: { nl: "TOA: tangens = overstaand / aanliggend.", en: "TOA: tangent = opposite / adjacent." },
};

export const sohCahToaSide: Generator = {
  id: "trig.sohcahtoa-side",
  skillId: "sos-cas-toa",
  title: { nl: "Zijde berekenen met SOS CAS TOA", en: "Finding a side with SOH CAH TOA" },
  generate(rng, difficulty) {
    const c = difficulty === 1 ? CASES[rng.int(0, 1)] : difficulty === 2 ? CASES[2] : CASES[3];
    const angle = rng.int(20, 70);
    const given = rng.int(3, 20);
    const fn = `\\${c.ratio}(${angle}^{\\circ})`;

    // Ratio = top / bottom, with the asked side as unknown x.
    const top = c.ratio === "cos" ? "adjacent" : "opposite";
    const fracLatex = top === c.asked ? `\\frac{x}{${given}}` : `\\frac{${given}}{x}`;
    const exact = c.inverse === "multiply" ? `${given}\\cdot ${fn}` : `\\frac{${given}}{${fn}}`;
    const value = evaluate(parse(exact))!;
    const rounded = roundHalfAwayFromZero(value, 1);

    const steps: Step[] = [
      {
        latex: `${fn}=${fracLatex}`,
        note: { nl: `Kies de juiste verhouding. ${MNEMONIC_PART[c.ratio].nl}`, en: `Choose the right ratio. ${MNEMONIC_PART[c.ratio].en}` },
      },
      {
        latex: `x=\\hl{${exact}}`,
        note:
          c.inverse === "multiply"
            ? { nl: `Vermenigvuldig links en rechts met $${given}$.`, en: `Multiply both sides by $${given}$.` }
            : {
                nl: `Wissel $x$ en $${fn}$ van plaats. Dat mag bij een breuk die gelijk is aan een getal.`,
                en: `Swap $x$ and $${fn}$. You may do that when a fraction equals a number.`,
              },
      },
      {
        latex: `x\\approx ${rounded}`,
        note: { nl: "Reken uit met de rekenmachine en rond af op 1 decimaal.", en: "Use the calculator and round to 1 decimal." },
        approx: { decimals: 1 },
      },
    ];

    const labels: Partial<Record<Side, string>> = { [c.given]: String(given), [c.asked]: "x" };
    return {
      prompt: {
        nl: `Bereken $x$ (de ${SIDE_NAME[c.asked].nl}). Rond af op 1 decimaal.`,
        en: `Find $x$ (the ${SIDE_NAME[c.asked].en}). Round to 1 decimal.`,
      },
      figure: { kind: "right-triangle", angleDeg: angle, angleLabel: `${angle}^{\\circ}`, labels },
      answer: { kind: "expr", latex: exact, form: "decimal", decimals: 1 },
      calculator: "allowed",
      hints: {
        nudge: {
          nl: `Welke zijden doen mee? Gegeven: de ${SIDE_NAME[c.given].nl}. Gevraagd: de ${SIDE_NAME[c.asked].nl}.`,
          en: `Which sides are involved? Given: the ${SIDE_NAME[c.given].en}. Asked: the ${SIDE_NAME[c.asked].en}.`,
        },
        rule: { text: MNEMONIC_PART[c.ratio], ruleId: "sos-cas-toa", mnemonic: "soscastoa" },
        solution: { steps, solutions: [{ x: value }] },
      },
      mistakes: [
        {
          // Calculator in radians instead of degrees.
          id: "radians-mode",
          latex: String(
            roundHalfAwayFromZero(
              c.inverse === "multiply"
                ? given * Math[c.ratio](angle)
                : given / Math.sin(angle),
              1,
            ),
          ),
          explain: {
            nl: "Staat je rekenmachine op radialen? Zet hem op graden (DEG).",
            en: "Is your calculator set to radians? Switch it to degrees (DEG).",
          },
        },
      ],
    };
  },
  verify(ex) {
    // Independent check with the inverse function on the calculator engine:
    // the angle computed back from the sides must be the angle in the figure.
    if (ex.answer.kind !== "expr" || !ex.figure) return false;
    const x = evaluate(parse(ex.answer.latex));
    if (x === null || x <= 0) return false;
    const { labels, angleDeg } = ex.figure;
    const side = (s: Side) => (labels[s] === "x" ? x : labels[s] !== undefined ? Number(labels[s]) : undefined);
    const o = side("opposite");
    const a = side("adjacent");
    const h = side("hypotenuse");
    let back: number;
    if (o !== undefined && h !== undefined) back = calc(`asin(${o}/${h})`, { angle: "deg" });
    else if (a !== undefined && h !== undefined) back = calc(`acos(${a}/${h})`, { angle: "deg" });
    else if (o !== undefined && a !== undefined) back = calc(`atan(${o}/${a})`, { angle: "deg" });
    else return false;
    return Math.abs(back - angleDeg) < 1e-6;
  },
};
