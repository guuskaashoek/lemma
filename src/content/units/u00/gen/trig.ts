/**
 * Lesson 10 generators: trigonometry in a right triangle (SOS CAS TOA).
 * Choosing the ratio, finding a side, and finding an angle.
 */
import { evaluate as calc } from "@/calculator/engine";
import { evaluate, parse } from "@/math/cas";
import { roundHalfAwayFromZero, type Mistake } from "@/math/check";
import type { Figure, GeneratedExercise, Generator, Loc, Step } from "@/content/types";
import { L, dec } from "../helpers";

type Ratio = "sin" | "cos" | "tan";
type Side = "opposite" | "adjacent" | "hypotenuse";

const SIDE_NAME: Record<Side, Loc> = {
  opposite: L("overstaande zijde", "opposite side"),
  adjacent: L("aanliggende zijde", "adjacent side"),
  hypotenuse: L("schuine zijde", "hypotenuse"),
};

/** Letter of each side in the mnemonic. */
const LETTER: Record<Side, Loc> = {
  opposite: L("O", "O"),
  adjacent: L("A", "A"),
  hypotenuse: L("S", "H"),
};

const MNEMONIC_PART: Record<Ratio, Loc> = {
  sin: L("SOS: sinus = overstaand / schuin.", "SOH: sine = opposite / hypotenuse."),
  cos: L("CAS: cosinus = aanliggend / schuin.", "CAH: cosine = adjacent / hypotenuse."),
  tan: L("TOA: tangens = overstaand / aanliggend.", "TOA: tangent = opposite / adjacent."),
};

/** Which ratio uses these two sides? Worked out from the side names, not from a table of cases. */
function ratioFor(a: Side, b: Side): Ratio {
  const set = new Set([a, b]);
  if (set.has("hypotenuse")) return set.has("opposite") ? "sin" : "cos";
  return "tan";
}

/** Top and bottom side of each ratio. */
const PARTS: Record<Ratio, [Side, Side]> = {
  sin: ["opposite", "hypotenuse"],
  cos: ["adjacent", "hypotenuse"],
  tan: ["opposite", "adjacent"],
};

/** The sides labelled in a figure, with their values ("x" for the unknown). */
function labelled(fig: Figure): Array<[Side, string]> {
  return (Object.entries(fig.labels) as Array<[Side, string | undefined]>).filter((e): e is [Side, string] => e[1] !== undefined);
}

/** Nudge with the exercise's own sides: given, asked, and their letters. */
function sidesNudge(given: Side, givenValue: string, asked: Side): Loc {
  return L(
    `Gegeven: de ${SIDE_NAME[given].nl} ($${givenValue}$), letter ${LETTER[given].nl}. Gevraagd: de ${SIDE_NAME[asked].nl}, letter ${LETTER[asked].nl}. Welk woord van SOS CAS TOA heeft die twee letters?`,
    `Given: the ${SIDE_NAME[given].en} ($${givenValue}$), letter ${LETTER[given].en}. Asked: the ${SIDE_NAME[asked].en}, letter ${LETTER[asked].en}. Which part of SOH CAH TOA has those two letters?`,
  );
}

// ---------------------------------------------------------------------------
// Choosing the ratio
// ---------------------------------------------------------------------------

const ALL: Side[] = ["opposite", "adjacent", "hypotenuse"];

export const sohCahToaChoose: Generator = {
  id: "u0.sohcahtoa-choose",
  skillId: "u0.sos-cas-toa-choose",
  title: L("Kies sinus, cosinus of tangens", "Choose sine, cosine or tangent"),
  generate(rng, difficulty) {
    const angle = rng.int(20, 70);
    const [given, asked] = rng.shuffle(ALL).slice(0, 2) as [Side, Side];
    const value = difficulty === 3 ? dec(rng.int(25, 150) / 10) : String(rng.int(3, 20));
    const ratio = ratioFor(given, asked);
    const options: Ratio[] = ["sin", "cos", "tan"];
    const [top, bottom] = PARTS[ratio];
    const num = top === asked ? "x" : value;
    const den = bottom === asked ? "x" : value;
    const fn = `\\${ratio}(${angle}^{\\circ})`;
    const x = evaluate(parse(top === asked ? `${value}\\cdot ${fn}` : bottom === asked ? `\\frac{${value}}{${fn}}` : "0"))!;
    return {
      prompt: L(
        `Je wilt $x$ uitrekenen. Welke verhouding gebruik je bij de hoek van $${angle}^{\\circ}$?`,
        `You want to work out $x$. Which ratio do you use with the $${angle}^{\\circ}$ angle?`,
      ),
      latex: `\\alpha=${angle}^{\\circ}`,
      figure: { kind: "right-triangle", angleDeg: angle, angleLabel: `${angle}^{\\circ}`, labels: { [given]: value, [asked]: "x" } },
      visual: { kind: "right-triangle", angle, show: [ratio], interactive: true },
      answer: {
        kind: "choice",
        options: options.map((o) => ({ latex: `\\${o}` })),
        correctIndex: options.indexOf(ratio),
      },
      calculator: "off",
      hints: {
        nudge: sidesNudge(given, value, asked),
        rule: { text: MNEMONIC_PART[ratio], ruleId: "u0.sos-cas-toa", mnemonic: "soscastoa" },
        solution: {
          steps: [
            {
              latex: `${fn}=\\frac{${num}}{${den}}`,
              note: L(
                `${SIDE_NAME[given].nl[0].toUpperCase()}${SIDE_NAME[given].nl.slice(1)} en ${SIDE_NAME[asked].nl}: dat is ${ratio === "sin" ? "SOS" : ratio === "cos" ? "CAS" : "TOA"}.`,
                `${SIDE_NAME[given].en[0].toUpperCase()}${SIDE_NAME[given].en.slice(1)} and ${SIDE_NAME[asked].en}: that is ${ratio === "sin" ? "SOH" : ratio === "cos" ? "CAH" : "TOA"}.`,
              ),
            },
          ],
          solutions: [{ x }],
        },
      },
    };
  },
  verify(ex) {
    // Independent check: the chosen ratio must use exactly the two labelled sides.
    if (ex.answer.kind !== "choice" || !ex.figure) return false;
    const sides = labelled(ex.figure).map(([s]) => s);
    if (sides.length !== 2) return false;
    const chosen = (["sin", "cos", "tan"] as Ratio[])[ex.answer.correctIndex];
    const uses = new Set(PARTS[chosen]);
    return sides.every((s) => uses.has(s));
  },
};

// ---------------------------------------------------------------------------
// Finding a side
// ---------------------------------------------------------------------------

/**
 * The exercise types: which side is given and which one is asked.
 * The ratio follows from SOS CAS TOA.
 */
const CASES: Array<{ given: Side; asked: Side; inverse: "multiply" | "divide" }> = [
  { given: "hypotenuse", asked: "opposite", inverse: "multiply" },
  { given: "hypotenuse", asked: "adjacent", inverse: "multiply" },
  { given: "adjacent", asked: "opposite", inverse: "multiply" },
  { given: "opposite", asked: "hypotenuse", inverse: "divide" },
  { given: "adjacent", asked: "hypotenuse", inverse: "divide" },
  { given: "opposite", asked: "adjacent", inverse: "divide" },
];

export const sohCahToaSide: Generator = {
  id: "u0.sohcahtoa-side",
  skillId: "u0.sos-cas-toa",
  title: L("Zijde berekenen met SOS CAS TOA", "Finding a side with SOH CAH TOA"),
  generate(rng, difficulty) {
    const c = difficulty === 1 ? CASES[rng.int(0, 1)] : difficulty === 2 ? CASES[rng.int(0, 2)] : CASES[rng.int(3, 5)];
    const ratio = ratioFor(c.given, c.asked);
    const angle = rng.int(20, 70);
    const given = rng.int(3, 20);
    const fn = `\\${ratio}(${angle}^{\\circ})`;

    // Ratio = top / bottom, with the asked side as unknown x.
    const top = PARTS[ratio][0];
    const fracLatex = top === c.asked ? `\\frac{x}{${given}}` : `\\frac{${given}}{x}`;
    const exact = c.inverse === "multiply" ? `${given}\\cdot ${fn}` : `\\frac{${given}}{${fn}}`;
    const value = evaluate(parse(exact))!;
    const rounded = roundHalfAwayFromZero(value, 1);

    const steps: Step[] = [
      {
        latex: `${fn}=${fracLatex}`,
        note: L(`Kies de juiste verhouding. ${MNEMONIC_PART[ratio].nl}`, `Choose the right ratio. ${MNEMONIC_PART[ratio].en}`),
      },
      {
        latex: `x=\\hl{${exact}}`,
        note:
          c.inverse === "multiply"
            ? L(`Vermenigvuldig links en rechts met $${given}$.`, `Multiply both sides by $${given}$.`)
            : L(
                `$x$ staat onder de streep. Doe links en rechts keer $x$, en deel dan door $${fn}$.`,
                `$x$ is at the bottom. Multiply both sides by $x$, then divide by $${fn}$.`,
              ),
      },
      {
        latex: `x\\approx \\ask{${rounded}}`,
        note: L("Reken uit met de rekenmachine (op DEG) en rond af op $1$ decimaal.", "Use the calculator (in DEG) and round to $1$ decimal."),
        approx: { decimals: 1 },
      },
    ];

    // Typical mistakes: calculator in radians, and the wrong ratio.
    const rad = (r: Ratio, v: number) => (r === "sin" ? Math.sin(v) : r === "cos" ? Math.cos(v) : Math.tan(v));
    const deg = (r: Ratio) => rad(r, (angle * Math.PI) / 180);
    const wrongRatio: Ratio = ratio === "sin" ? "cos" : ratio === "cos" ? "sin" : "sin";
    const mistakes: Mistake[] = [
      {
        id: "radians-mode",
        latex: dec(roundHalfAwayFromZero(c.inverse === "multiply" ? given * rad(ratio, angle) : given / rad(ratio, angle), 1)),
        explain: L("Staat je rekenmachine op radialen? Zet hem op graden (DEG).", "Is your calculator set to radians? Switch it to degrees (DEG)."),
      },
      {
        id: "wrong-ratio",
        latex: dec(roundHalfAwayFromZero(c.inverse === "multiply" ? given * deg(wrongRatio) : given / deg(wrongRatio), 1)),
        explain: L(
          `Je gebruikte ${wrongRatio}. Kijk welke twee zijden meedoen: ${SIDE_NAME[c.given].nl} en ${SIDE_NAME[c.asked].nl}. Dat is ${ratio}.`,
          `You used ${wrongRatio}. Look at which two sides are involved: ${SIDE_NAME[c.given].en} and ${SIDE_NAME[c.asked].en}. That is ${ratio}.`,
        ),
      },
    ];

    const labels: Partial<Record<Side, string>> = { [c.given]: String(given), [c.asked]: "x" };
    return {
      prompt: L(`Bereken $x$ (de ${SIDE_NAME[c.asked].nl}). Rond af op $1$ decimaal.`, `Find $x$ (the ${SIDE_NAME[c.asked].en}). Round to $1$ decimal.`),
      figure: { kind: "right-triangle", angleDeg: angle, angleLabel: `${angle}^{\\circ}`, labels },
      visual: { kind: "right-triangle", angle, show: [ratio], interactive: true },
      answer: { kind: "expr", latex: exact, form: "decimal", decimals: 1 },
      calculator: "allowed",
      hints: {
        nudge: sidesNudge(c.given, String(given), c.asked),
        rule: { text: MNEMONIC_PART[ratio], ruleId: "u0.sos-cas-toa", mnemonic: "soscastoa" },
        solution: { steps, solutions: [{ x: value }] },
      },
      mistakes: mistakes.filter((m) => Number(m.latex) !== rounded && Number(m.latex) > 0),
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

// ---------------------------------------------------------------------------
// Finding an angle
// ---------------------------------------------------------------------------

const INV: Record<Ratio, string> = { sin: "\\sin^{-1}", cos: "\\cos^{-1}", tan: "\\tan^{-1}" };
const JS_INV: Record<Ratio, (v: number) => number> = { sin: Math.asin, cos: Math.acos, tan: Math.atan };
const inRange = (v: number, lo: number, hi: number) => v >= lo && v <= hi;

export const sohCahToaAngle: Generator = {
  id: "u0.sohcahtoa-angle",
  skillId: "u0.sos-cas-toa-angle",
  title: L("Hoek berekenen met SOS CAS TOA", "Finding an angle with SOH CAH TOA"),
  generate(rng, difficulty) {
    const ratio: Ratio = difficulty === 1 ? "tan" : difficulty === 2 ? rng.pick(["sin", "cos"] as const) : rng.pick(["sin", "cos", "tan"] as const);
    const [topSide, bottomSide] = PARTS[ratio];
    let t: number, b: number;
    do {
      if (difficulty === 3) {
        t = rng.int(15, 120) / 10;
        b = rng.int(15, 150) / 10;
      } else {
        t = rng.int(2, 15);
        b = rng.int(2, 20);
      }
      // Angles between 10° and 80°. For cosine at least 22°: cos(A°) = r also
      // holds for −A, and a small −A would be a second, wrong root.
    } while (
      (ratio !== "tan" ? t >= b : t === b) ||
      !inRange((JS_INV[ratio](t / b) * 180) / Math.PI, ratio === "cos" ? 22 : 10, 80)
    );
    const deg = (JS_INV[ratio](t / b) * 180) / Math.PI;
    const rounded = roundHalfAwayFromZero(deg, 1);
    const fracL = `\\frac{${dec(t)}}{${dec(b)}}`;
    const exactValue = `\\frac{180}{\\pi}\\cdot ${INV[ratio]}\\left(${fracL}\\right)`;

    // One checked step. (A pair of steps like tan(A°) = 5/8 → A° = tan⁻¹(5/8)
    // is too slow for the step checker: it has no roots in its search range.)
    // The choice of the ratio is in the note.
    const steps: Step[] = [
      {
        latex: `A^{\\circ}=${INV[ratio]}\\left(\\ask{${fracL}}\\right)`,
        note: L(
          `${MNEMONIC_PART[ratio].nl} Dus $\\${ratio}(A)=${fracL}$. Reken terug met $${INV[ratio]}$ (shift ${ratio}). Afgerond: $A\\approx ${rounded}$.`,
          `${MNEMONIC_PART[ratio].en} So $\\${ratio}(A)=${fracL}$. Work back with $${INV[ratio]}$ (shift ${ratio}). Rounded: $A\\approx ${rounded}$.`,
        ),
      },
    ];

    const radians = roundHalfAwayFromZero(JS_INV[ratio](t / b), 1);
    const mistakes: Mistake[] = [
      { id: "radians-mode", latex: dec(radians), explain: L("Staat je rekenmachine op radialen? Zet hem op graden (DEG).", "Is your calculator set to radians? Switch it to degrees (DEG).") },
    ];
    if (ratio === "tan") {
      mistakes.push({
        id: "flipped",
        latex: dec(roundHalfAwayFromZero((Math.atan(b / t) * 180) / Math.PI, 1)),
        explain: L("Je draaide de breuk om. TOA: overstaand boven, aanliggend onder.", "You turned the fraction upside down. TOA: opposite on top, adjacent at the bottom."),
      });
    } else {
      const other: Ratio = ratio === "sin" ? "cos" : "sin";
      mistakes.push({
        id: "wrong-ratio",
        latex: dec(roundHalfAwayFromZero((JS_INV[other](t / b) * 180) / Math.PI, 1)),
        explain: L(`Je gebruikte ${other}${"⁻¹"}. Kijk welke zijden bekend zijn: dat geeft ${ratio}.`, `You used ${other}${"⁻¹"}. Look at which sides are known: that gives ${ratio}.`),
      });
    }

    return {
      prompt: L(`Bereken hoek $A$ in graden. Rond af op $1$ decimaal.`, `Work out angle $A$ in degrees. Round to $1$ decimal.`),
      figure: { kind: "right-triangle", angleDeg: Math.round(deg), angleLabel: "A", labels: { [topSide]: dec(t), [bottomSide]: dec(b) } },
      visual: { kind: "right-triangle", angle: Math.round(deg), show: [ratio], interactive: true },
      answer: { kind: "solutions", variable: "A", values: [exactValue], form: "decimal", decimals: 1 },
      calculator: "allowed",
      hints: {
        nudge: L(
          `Bekend: de ${SIDE_NAME[topSide].nl} ($${dec(t)}$) en de ${SIDE_NAME[bottomSide].nl} ($${dec(b)}$). Welk woord van SOS CAS TOA hoort daarbij? Reken dan terug met ${ratio}⁻¹.`,
          `Known: the ${SIDE_NAME[topSide].en} ($${dec(t)}$) and the ${SIDE_NAME[bottomSide].en} ($${dec(b)}$). Which part of SOH CAH TOA goes with that? Then work back with ${ratio}⁻¹.`,
        ),
        rule: {
          text: L(
            "Hoek terugrekenen: kies SOS, CAS of TOA en gebruik $\\sin^{-1}$, $\\cos^{-1}$ of $\\tan^{-1}$. Rekenmachine op graden (DEG).",
            "Finding an angle: choose SOH, CAH or TOA and use $\\sin^{-1}$, $\\cos^{-1}$ or $\\tan^{-1}$. Calculator in degrees (DEG).",
          ),
          ruleId: "u0.inverse-trig",
          mnemonic: "soscastoa",
        },
        solution: { steps, solutions: [{ A: deg }] },
      },
      mistakes: mistakes.filter((m) => Number(m.latex) !== rounded),
    };
  },
  verify(ex: GeneratedExercise) {
    // Independent check: the calculator engine (in degrees) applied to the
    // answer angle must give the ratio of the two sides in the figure.
    if (ex.answer.kind !== "solutions" || !ex.figure) return false;
    const A = evaluate(parse(ex.answer.values[0]));
    if (A === null) return false;
    const sides = Object.fromEntries(labelled(ex.figure).map(([s, v]) => [s, Number(v)])) as Partial<Record<Side, number>>;
    const { opposite: o, adjacent: a, hypotenuse: h } = sides;
    if (o !== undefined && h !== undefined) return Math.abs(calc(`sin(${A})`, { angle: "deg" }) - o / h) < 1e-9;
    if (a !== undefined && h !== undefined) return Math.abs(calc(`cos(${A})`, { angle: "deg" }) - a / h) < 1e-9;
    if (o !== undefined && a !== undefined) return Math.abs(calc(`tan(${A})`, { angle: "deg" }) - o / a) < 1e-9;
    return false;
  },
};
