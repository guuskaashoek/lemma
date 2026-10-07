/**
 * Lesson 5 generators: parabolas. Valley or hill (dal- of bergparabool),
 * the axis of symmetry and the vertex (top).
 */
import Fraction from "fraction.js";
import type { Mistake } from "@/math/check";
import { frac, poly, sum, term } from "@/math/latex";
import type { Rng } from "@/math/random";
import type { Difficulty, GeneratedExercise, Generator, Loc, Step } from "@/content/types";
import { compileFn } from "@/visuals/models/plot";
import { L, f, num, par, parabolaPlane, quad, rootFactorB } from "../helpers";

/** The formula after `y=` in an exercise, compiled. */
function graphOf(ex: GeneratedExercise): ((x: number) => number) | null {
  const m = ex.latex?.match(/^y=(.+)$/);
  return m ? compileFn(m[1]) : null;
}

/** `a·m² + b·m + c` written out with the number m filled in. */
export function substituted(a: number, b: number, c: number, m: Fraction | number): string {
  const v = new Fraction(m);
  const x = v.compare(0) < 0 || Number(v.d) !== 1 ? `\\left(${frac(v)}\\right)` : frac(v);
  const t1 = a === 1 ? `${x}^{2}` : a === -1 ? `-${x}^{2}` : `${a}\\cdot ${x}^{2}`;
  const t2 = b === 0 ? "" : `${b < 0 ? "-" : "+"}${Math.abs(b)}\\cdot ${x}`;
  const t3 = c === 0 ? "" : `${c < 0 ? "-" : "+"}${Math.abs(c)}`;
  return `${t1}${t2}${t3}`;
}

/** `(x-p)(x-q)` with a bare `x` first: `x(x+6)`, not `(x+6)x`. */
function twoFactors(p: number, q: number): string {
  return q === 0 ? `x${rootFactorB(p)}` : `${rootFactorB(p)}${rootFactorB(q)}`;
}

/** The rest of a sum after its first term: `+3x-2`, or nothing for 0. */
const tail = (s: string) => (s === "0" ? "" : s.startsWith("-") ? s : `+${s}`);

// ---------------------------------------------------------------------------
// Valley or hill
// ---------------------------------------------------------------------------

/** Note for the number k in front of brackets or a square (k = 1 and -1 are not written). */
function frontNote(k: number, where: "brackets" | "square"): Loc {
  const nl = where === "brackets" ? "de haakjes" : "het kwadraat";
  const en = where === "brackets" ? "the brackets" : "the square";
  if (k === 1) return L(`Vóór ${nl} staat geen getal. Dus gewoon $x\\cdot x=x^{2}$.`, `There is no number in front of ${en}. So just $x\\cdot x=x^{2}$.`);
  if (k === -1) return L(`Vóór ${nl} staat alleen een min. Dus $-x\\cdot x=-x^{2}$.`, `In front of ${en} there is only a minus. So $-x\\cdot x=-x^{2}$.`);
  return L(`Vóór ${nl} staat $${k}$. Dus $${k}\\cdot x\\cdot x$.`, `In front of ${en} is $${k}$. So $${k}\\cdot x\\cdot x$.`);
}

const SHAPE_RULE: Loc = L(
  "Dal of berg: kijk naar het getal voor $x^{2}$. Positief: dalparabool $\\cup$. Negatief: bergparabool $\\cap$.",
  "Valley or hill: look at the number in front of $x^{2}$. Positive: valley parabola $\\cup$. Negative: hill parabola $\\cap$.",
);

export const parabolaShape: Generator = {
  id: "u4.parabola-shape",
  skillId: "u4.parabola-shape",
  title: L("Dal of berg", "Valley or hill"),
  generate(rng, difficulty) {
    const a = rng.nonZeroInt(-5, 5);
    const b = difficulty === 2 ? rng.nonZeroInt(-9, 9) : rng.int(-9, 9);
    const c = difficulty === 2 ? rng.nonZeroInt(-9, 9) : rng.int(-9, 9);
    let lead = a;
    let formula: string;
    const steps: Step[] = [];
    let nudge: Loc;

    if (difficulty === 1) {
      formula = quad(a, b, c);
      steps.push({ latex: formula, note: L(`Het getal voor $x^{2}$ is $${a}$.`, `The number in front of $x^{2}$ is $${a}$.`) });
      nudge = L(`Kijk alleen naar $${term(a, "x^{2}")}$. Is het getal ervoor positief of negatief?`, `Only look at $${term(a, "x^{2}")}$. Is the number in front positive or negative?`);
    } else if (difficulty === 2) {
      // The x² term is not at the front.
      const order = rng.pick([
        [[c, ""], [b, "x"], [a, "x^{2}"]],
        [[b, "x"], [a, "x^{2}"], [c, ""]],
        [[c, ""], [a, "x^{2}"], [b, "x"]],
      ] as Array<Array<[number, string]>>);
      formula = sum(order);
      steps.push(
        { latex: formula, note: L("Zoek de term met $x^{2}$. Die staat niet vooraan.", "Find the term with $x^{2}$. It is not at the front.") },
        { latex: `\\ask{${term(a, "x^{2}")}}${tail(poly([b, c]))}`, note: L("Zet de $x^{2}$-term vooraan.", "Put the $x^{2}$ term at the front.") },
      );
      nudge = L(`De term met $x^{2}$ is $${term(a, "x^{2}")}$. Let op het teken ervoor.`, `The term with $x^{2}$ is $${term(a, "x^{2}")}$. Watch the sign in front of it.`);
    } else {
      // Brackets: k(x - p)(x - q) or k(x - p)^2 + q.
      const k = rng.nonZeroInt(-4, 4);
      lead = k;
      const p = rng.int(-6, 6);
      const q = rng.int(-6, 6);
      const pre = k === 1 ? "" : k === -1 ? "-" : String(k);
      if (rng.chance(0.5)) {
        const q2 = q === p ? q + 1 : q;
        formula = `${pre}${twoFactors(p, q2)}`;
        steps.push(
          { latex: formula, note: L("Werk in gedachten de haakjes weg. Alleen $x\\cdot x$ geeft $x^{2}$.", "Expand the brackets in your head. Only $x\\cdot x$ gives $x^{2}$.") },
          { latex: `\\ask{${term(k, "x^{2}")}}${tail(poly([-k * (p + q2), k * p * q2]))}`, note: frontNote(k, "brackets") },
        );
      } else {
        formula = `${pre}${rootFactorB(p)}^{2}${q === 0 ? "" : q > 0 ? `+${q}` : q}`;
        steps.push(
          { latex: formula, note: L("Werk in gedachten de haakjes weg. Alleen $x\\cdot x$ geeft $x^{2}$.", "Expand the brackets in your head. Only $x\\cdot x$ gives $x^{2}$.") },
          { latex: `\\ask{${term(k, "x^{2}")}}${tail(poly([-2 * k * p, k * p * p + q]))}`, note: frontNote(k, "square") },
        );
      }
      nudge =
        k === 1
          ? L(
              "Je hoeft niet alles uit te rekenen. Alleen $x\\cdot x$ geeft $x^{2}$. Staat er een getal of een min-teken vóór?",
              "You do not need to work everything out. Only $x\\cdot x$ gives $x^{2}$. Is there a number or a minus sign in front?",
            )
          : k === -1
            ? L(
                "Je hoeft niet alles uit te rekenen. Alleen $x\\cdot x$ geeft $x^{2}$. Wat doet het min-teken vooraan?",
                "You do not need to work everything out. Only $x\\cdot x$ gives $x^{2}$. What does the minus sign at the front do?",
              )
            : L(
                `Je hoeft niet alles uit te rekenen. Alleen $x\\cdot x$ geeft $x^{2}$. Wat gebeurt er met de $${k}$ ervoor?`,
                `You do not need to work everything out. Only $x\\cdot x$ gives $x^{2}$. What happens to the $${k}$ in front?`,
              );
    }

    return {
      prompt: L("Is de grafiek van deze formule een dalparabool of een bergparabool?", "Is the graph of this formula a valley parabola or a hill parabola?"),
      latex: `y=${formula}`,
      answer: {
        kind: "choice",
        options: [{ text: L("Dalparabool $\\cup$", "Valley parabola $\\cup$") }, { text: L("Bergparabool $\\cap$", "Hill parabola $\\cap$") }],
        correctIndex: lead > 0 ? 0 : 1,
      },
      calculator: "off",
      hints: { nudge, rule: { text: SHAPE_RULE, ruleId: "u4.parabola-shape" }, solution: { steps } },
    };
  },
  verify(ex) {
    // Far away from the vertex the x² term wins: look at y for a large x.
    const g = graphOf(ex);
    if (!g || ex.answer.kind !== "choice") return false;
    const far = g(1000) + g(-1000);
    return ex.answer.correctIndex === (far > 0 ? 0 : 1);
  },
};

// ---------------------------------------------------------------------------
// Axis of symmetry and vertex
// ---------------------------------------------------------------------------

type Parabola = {
  a: number;
  b: number;
  c: number;
  /** The formula as shown. */
  formula: string;
  /** Zeros when the formula is given in factored form. */
  zeros?: [number, number];
};

/** A parabola for each level, with a whole (level 1–2) x of the top. */
function pickParabola(rng: Rng, difficulty: Difficulty, wholeTop: boolean): Parabola {
  if (difficulty === 1) {
    // y = (x - p)(x - q) with p + q even.
    let p: number, q: number;
    do {
      p = rng.int(-8, 8);
      q = rng.int(-8, 8);
    } while (p >= q || (p + q) % 2 !== 0);
    return { a: 1, b: -(p + q), c: p * q, formula: twoFactors(p, q), zeros: [p, q] };
  }
  if (difficulty === 2) {
    const m = rng.nonZeroInt(-6, 6);
    const c = rng.int(-9, 9);
    return { a: 1, b: -2 * m, c, formula: quad(1, -2 * m, c) };
  }
  const a = rng.pick([-3, -2, -1, 2, 3]);
  if (wholeTop) {
    const m = rng.nonZeroInt(-4, 4);
    const c = rng.int(-9, 9);
    return { a, b: -2 * a * m, c, formula: quad(a, -2 * a * m, c) };
  }
  let b: number;
  do b = rng.nonZeroInt(-9, 9);
  while (b % (2 * a) === 0);
  const c = rng.int(-9, 9);
  return { a, b, c, formula: quad(a, b, c) };
}

const TOP_RULE: Loc = L(
  "De top ligt op de symmetrie-as. $x_{top}=-\\frac{b}{2a}$, of precies tussen de twee nulpunten in. Daarna: $y_{top}$ = de formule met $x_{top}$ ingevuld.",
  "The vertex lies on the axis of symmetry. $x_{top}=-\\frac{b}{2a}$, or exactly halfway between the two zeros. Then: $y_{top}$ = the formula with $x_{top}$ filled in.",
);

/** The first step: the x of the top, from the zeros or with -b/(2a). */
function axisStart(P: Parabola): { latex: string; note: Loc } {
  if (P.zeros) {
    const [p, q] = P.zeros;
    return {
      latex: `\\frac{${p}+${par(q)}}{2}`,
      note: L(`De nulpunten zijn $${p}$ en $${q}$. De as ligt precies in het midden.`, `The zeros are $${p}$ and $${q}$. The axis is exactly halfway.`),
    };
  }
  return {
    latex: `-\\frac{${P.b}}{2\\cdot ${par(P.a)}}`,
    note: L(`$a=${P.a}$ en $b=${P.b}$. Vul in: $-\\frac{b}{2a}$.`, `$a=${P.a}$ and $b=${P.b}$. Fill in: $-\\frac{b}{2a}$.`),
  };
}

function axisNudge(P: Parabola): Loc {
  if (P.zeros) {
    const [p, q] = P.zeros;
    return L(
      `De grafiek snijdt de $x$-as bij $x=${p}$ en $x=${q}$ (daar is een haakje nul). Wat ligt precies in het midden?`,
      `The graph crosses the $x$-axis at $x=${p}$ and $x=${q}$ (a bracket is zero there). What is exactly halfway?`,
    );
  }
  return L(
    `Hier is $a=${P.a}$ en $b=${P.b}$. Reken $-\\frac{b}{2a}$ uit. Let op het min-teken vooraan.`,
    `Here $a=${P.a}$ and $b=${P.b}$. Work out $-\\frac{b}{2a}$. Watch the minus sign at the front.`,
  );
}

export const parabolaAxis: Generator = {
  id: "u4.parabola-axis",
  skillId: "u4.parabola-top",
  title: L("De symmetrie-as", "The axis of symmetry"),
  generate(rng, difficulty) {
    const P = pickParabola(rng, difficulty, false);
    const m = new Fraction(-P.b, 2 * P.a);
    const start = axisStart(P);
    const steps: Step[] = [start];
    if (P.zeros) steps.push({ latex: `\\frac{\\ask{${P.zeros[0] + P.zeros[1]}}}{2}`, note: L("Tel de nulpunten op.", "Add the zeros.") });
    else steps.push({ latex: `-\\frac{${P.b}}{\\ask{${2 * P.a}}}`, note: L("Reken $2a$ uit.", "Work out $2a$.") });
    steps.push({ latex: `\\ask{${frac(m)}}`, note: L("Reken de breuk uit. Vereenvoudig als het kan.", "Work out the fraction. Simplify if you can.") });

    const mistakes: Mistake[] = [];
    if (!P.zeros) {
      mistakes.push(
        { id: "lost-minus", latex: frac(m.neg()), explain: L("Vergeet het min-teken niet: $x_{top}=-\\frac{b}{2a}$.", "Do not forget the minus sign: $x_{top}=-\\frac{b}{2a}$.") },
        { id: "no-two", latex: frac(new Fraction(-P.b, P.a)), explain: L(`Je deelde door $a$. Deel door $2a=${2 * P.a}$.`, `You divided by $a$. Divide by $2a=${2 * P.a}$.`) },
      );
    } else {
      const [p, q] = P.zeros;
      mistakes.push({ id: "difference", latex: frac(new Fraction(q - p, 2)), explain: L("Tel de nulpunten op en deel door $2$. Niet aftrekken.", "Add the zeros and divide by $2$. Do not subtract.") });
    }

    return {
      prompt: L("De symmetrie-as is de lijn $x=\\ldots$ Wat staat er op de puntjes?", "The axis of symmetry is the line $x=\\ldots$ What goes on the dots?"),
      latex: `y=${P.formula}`,
      visual: parabolaPlane(P.a, P.b, P.c),
      answer: { kind: "expr", latex: frac(m), form: "fraction" },
      calculator: "off",
      hints: { nudge: axisNudge(P), rule: { text: TOP_RULE, ruleId: "u4.parabola-top" }, solution: { steps } },
      mistakes: mistakes.filter((x) => x.latex !== frac(m)),
    };
  },
  verify(ex) {
    // The graph is symmetric around the answer: f(m - t) = f(m + t).
    const g = graphOf(ex);
    if (!g || ex.answer.kind !== "expr") return false;
    const m = num(ex.answer.latex);
    if (m === null) return false;
    return [0.5, 1, 2.5].every((t) => Math.abs(g(m - t) - g(m + t)) < 1e-9);
  },
};

export const parabolaTop: Generator = {
  id: "u4.parabola-top",
  skillId: "u4.parabola-top",
  title: L("De top van een parabool", "The vertex of a parabola"),
  generate(rng, difficulty) {
    const P = pickParabola(rng, difficulty, true);
    const m = -P.b / (2 * P.a);
    const yt = f(P.a, P.b, P.c, m);
    const start = axisStart(P);
    // Each bracket x - p with m filled in: (m - p), or just m when p = 0.
    const bracket = (p: number) => (p === 0 ? par(m) : `(${m}${p > 0 ? `-${p}` : `+${-p}`})`);
    // Same order as in the formula (twoFactors puts a bare x first).
    const zs = P.zeros && P.zeros[1] === 0 ? [0, P.zeros[0]] : P.zeros;
    const sub = zs ? `${bracket(zs[0])}\\cdot ${bracket(zs[1])}` : substituted(P.a, P.b, P.c, m);
    const workNote = P.zeros
      ? L("Reken eerst elk haakje uit. Doe dan keer.", "First work out each bracket. Then multiply.")
      : L("Reken uit. Eerst het kwadraat, dan keer, dan plus en min.", "Work it out. First the square, then multiply, then add and subtract.");
    const steps: Step[] = [
      { latex: `x=${start.latex}\\land y=${P.formula}`, note: L(`${start.note.nl} Het teken $\\land$ betekent 'en'.`, `${start.note.en} The sign $\\land$ means 'and'.`) },
      { latex: `x=\\ask{${m}}\\land y=${P.formula}`, note: L("Reken $x_{top}$ uit.", "Work out $x_{top}$.") },
      { latex: `x=${m}\\land y=${sub}`, note: L(`Vul $x=${m}$ in de formule in.`, `Put $x=${m}$ into the formula.`) },
      { latex: `x=${m}\\land y=\\ask{${yt}}`, note: workNote },
    ];
    return {
      prompt: L("Bereken de top van de parabool.", "Work out the vertex of the parabola."),
      latex: `y=${P.formula}`,
      visual: parabolaPlane(P.a, P.b, P.c),
      answer: {
        kind: "multi",
        parts: [
          { label: "x_{top}", answer: { latex: String(m), form: "fraction" } },
          { label: "y_{top}", answer: { latex: String(yt), form: "fraction" } },
        ],
      },
      calculator: "off",
      hints: {
        nudge: L(
          `${axisNudge(P).nl} Vul daarna die $x$ in de formule in.`,
          `${axisNudge(P).en} Then put that $x$ into the formula.`,
        ),
        rule: { text: TOP_RULE, ruleId: "u4.parabola-top" },
        solution: { steps, solutions: [{ x: m, y: yt }] },
      },
    };
  },
  verify(ex) {
    // The top is where the graph is symmetric, and its y is on the graph.
    const g = graphOf(ex);
    if (!g || ex.answer.kind !== "multi") return false;
    const [mx, my] = ex.answer.parts.map((p) => Number(p.answer.latex));
    return [0.5, 1, 3].every((t) => Math.abs(g(mx - t) - g(mx + t)) < 1e-9) && Math.abs(g(mx) - my) < 1e-9;
  },
  isNice(ex) {
    return ex.answer.kind === "multi" && ex.answer.parts.every((p) => Number.isInteger(Number(p.answer.latex)));
  },
};
