/**
 * Lessons 7 and 8: inequalities (ongelijkheden). What a solution is, solving
 * like an equation, and flipping the sign when you multiply or divide by a
 * negative number.
 */
import type { Difficulty, Generator, GeneratedExercise, Loc, Step } from "@/content/types";
import type { Mistake } from "@/math/check";
import { term } from "@/math/latex";
import type { Rng } from "@/math/random";
import type { VisualSpec } from "@/visuals/types";
import {
  boundaryPoints,
  custom,
  flipRel,
  isClosed,
  L,
  lin,
  pointsLeft,
  REL_NAME,
  relHolds,
  relLatex,
  relationTruth,
  splitRelation,
  type Rel,
} from "../helpers";

const RELS: Rel[] = ["<", ">", "\\le", "\\ge"];

/** `ax+b < cx+d` written out; `numberFirst` gives `7-2x` instead of `-2x+7`. */
function ineqLatex(a: number, b: number, c: number, d: number, op: Rel, numberFirst = false): string {
  const left = numberFirst ? `${b}${term(a, "x").startsWith("-") ? "" : "+"}${term(a, "x")}` : lin(a, b);
  return relLatex(left, op, lin(c, d));
}

/**
 * Worked steps for `ax+b op cx+d`, after the first line. Like an equation,
 * but dividing by a negative number flips the sign (marked with \hl).
 */
export function ineqSteps(a: number, b: number, c: number, d: number, op: Rel): { steps: Step[]; final: Rel; k: number } {
  const steps: Step[] = [];
  let A = a;
  if (c !== 0) {
    A = a - c;
    const cx = term(Math.abs(c), "x");
    steps.push({
      latex: relLatex(`\\ask{${term(A, "x")}}${b === 0 ? "" : b > 0 ? `+${b}` : b}`, op, String(d)),
      note: c > 0 ? L(`Haal links en rechts $${cx}$ weg.`, `Take $${cx}$ away on both sides.`) : L(`Tel links en rechts $${cx}$ op.`, `Add $${cx}$ on both sides.`),
    });
  }
  const rhs = d - b;
  if (b !== 0) {
    steps.push({
      latex: relLatex(term(A, "x"), op, `\\ask{${rhs}}`),
      note: b > 0 ? L(`Haal links en rechts $${b}$ weg. Het teken blijft.`, `Take $${b}$ away on both sides. The sign stays.`) : L(`Tel links en rechts $${-b}$ op. Het teken blijft.`, `Add $${-b}$ on both sides. The sign stays.`),
    });
  }
  const k = rhs / A;
  let final = op;
  if (A < 0) {
    final = flipRel(op);
    steps.push({
      latex: relLatex("x", `\\hl{${final}}` as Rel, `\\ask{${k}}`),
      note: L(`Deel links en rechts door $${A}$. Een negatief getal: het teken klapt om!`, `Divide both sides by $${A}$. A negative number: the sign flips!`),
    });
  } else if (A !== 1) {
    steps.push({
      latex: relLatex("x", op, `\\ask{${k}}`),
      note: L(`Deel links en rechts door $${A}$. Een positief getal: het teken blijft.`, `Divide both sides by $${A}$. A positive number: the sign stays.`),
    });
  }
  return { steps, final, k };
}

/** The number-line widget for this inequality, around its boundary. */
function lineFor(a: number, b: number, c: number, d: number, op: Rel, k: number, latex: string): VisualSpec {
  return custom(
    "u2.ineq-line",
    { a, b, c, d, op, min: k - 7, max: k + 7, test: k + 3 },
    L(`Een getallenlijn. Test getallen in $${latex}$.`, `A number line. Test numbers in $${latex}$.`),
  );
}

/** Independent check: both relations have the same truth value at many points. */
function sameSolutions(question: string, answer: string, k: number): boolean {
  const pts = [...boundaryPoints(k), ...Array.from({ length: 21 }, (_, i) => ({ x: k - 10 + i }))];
  return pts.every((p) => {
    const q = relationTruth(question, p);
    const r = relationTruth(answer, p);
    return q !== null && q === r;
  });
}

function verifyRelation(ex: GeneratedExercise): boolean {
  if (ex.answer.kind !== "relation" || !ex.latex) return false;
  const parts = splitRelation(ex.answer.latex);
  if (!parts || parts.lhs !== "x") return false;
  return sameSolutions(ex.latex, ex.answer.latex, Number(parts.rhs));
}

/** Mistakes for the answer `x final k`; `flipped` says whether the sign had to flip. */
function ineqMistakes(final: Rel, k: number, flipped: boolean, A: number): Mistake[] {
  const out: Mistake[] = [
    {
      id: flipped ? "no-flip" : "wrong-direction",
      latex: relLatex("x", flipRel(final), String(k)),
      explain: flipped
        ? L(`Je deelde door $${A}$, een negatief getal. Dan klapt het teken om.`, `You divided by $${A}$, a negative number. Then the sign flips.`)
        : L(`Kijk goed naar het teken. Je deelde niet door een negatief getal, dus het teken blijft staan.`, `Look closely at the sign. You did not divide by a negative number, so the sign stays.`),
    },
  ];
  const other: Rel = isClosed(final) ? (pointsLeft(final) ? "<" : ">") : pointsLeft(final) ? "\\le" : "\\ge";
  out.push({
    id: "boundary",
    latex: relLatex("x", other, String(k)),
    explain: isClosed(final)
      ? L(`Bij $${final === "\\le" ? "\\le" : "\\ge"}$ hoort de grens $${k}$ er wél bij.`, `With $${final === "\\le" ? "\\le" : "\\ge"}$ the boundary $${k}$ is included.`)
      : L(`Bij $${final}$ hoort de grens $${k}$ er niet bij.`, `With $${final}$ the boundary $${k}$ is not included.`),
  });
  return out;
}

function ruleHint(flip: boolean) {
  return flip
    ? {
        text: L(
          "Teken omklappen: deel of vermenigvuldig je met een negatief getal? Dan wordt $<$ een $>$, en $\\le$ een $\\ge$.",
          "Flip the sign: dividing or multiplying by a negative number? Then $<$ becomes $>$, and $\\le$ becomes $\\ge$.",
        ),
        ruleId: "u2.flip-sign",
      }
    : {
        text: L(
          "Los een ongelijkheid op zoals een vergelijking. Wat je links doet, doe je ook rechts. Bij plus en min, en bij keer of delen door een positief getal, blijft het teken staan.",
          "Solve an inequality like an equation. Whatever you do on the left, you also do on the right. Adding, subtracting, and multiplying or dividing by a positive number keep the sign.",
        ),
        ruleId: "u2.inequality",
      };
}

/** Hint 1 with the exercise's own numbers; `a` is the x-number after collecting (a − c). */
function nudge(a: number, b: number, c: number, op: Rel): Loc {
  if (c !== 0) {
    const warn = a < 0;
    const cx = term(Math.abs(c), "x");
    const move =
      c > 0
        ? L(`Rechts staat $${cx}$. Haal links en rechts $${cx}$ weg.`, `The right has $${cx}$. Take $${cx}$ away on both sides.`)
        : L(`Rechts staat $-${cx}$. Tel links en rechts $${cx}$ op.`, `The right has $-${cx}$. Add $${cx}$ on both sides.`);
    return L(
      `Er staat aan beide kanten een $x$-term. ${move.nl} Het teken $${op}$ schrijf je over.${warn ? " Straks deel je door een negatief getal: let dan op het teken!" : ""}`,
      `There is an $x$-term on both sides. ${move.en} Copy the sign $${op}$.${warn ? " Later you divide by a negative number: mind the sign then!" : ""}`,
    );
  }
  if (b !== 0) {
    return L(
      `Werk eerst $${b > 0 ? `+${b}` : b}$ weg: doe aan beide kanten $${b > 0 ? `-${b}` : `+${-b}`}$.${a < 0 ? ` Daarna deel je door $${a}$: let op het teken!` : ""}`,
      `First remove $${b > 0 ? `+${b}` : b}$: do $${b > 0 ? `-${b}` : `+${-b}`}$ on both sides.${a < 0 ? ` Then you divide by $${a}$: mind the sign!` : ""}`,
    );
  }
  return a < 0
    ? L(`Deel beide kanten door $${a}$. Dat is een negatief getal.`, `Divide both sides by $${a}$. That is a negative number.`)
    : L(`Deel beide kanten door $${a}$.`, `Divide both sides by $${a}$.`);
}

// ---------------------------------------------------------------------------
// Solving (the sign stays)
// ---------------------------------------------------------------------------

function solveParts(rng: Rng, difficulty: Difficulty): [number, number, number, number, Rel, number] {
  const op = rng.pick(RELS);
  const k = rng.int(-5, 9);
  if (difficulty === 1) {
    const b = rng.nonZeroInt(-9, 9);
    return [1, b, 0, k + b, op, k];
  }
  if (difficulty === 2) {
    const a = rng.int(2, 6);
    const b = rng.nonZeroInt(-10, 10);
    return [a, b, 0, a * k + b, op, k];
  }
  // x on both sides: neither a nor c may be 0.
  for (;;) {
    const c = rng.nonZeroInt(-3, 5);
    const A = rng.int(1, 5);
    const b = rng.int(-10, 10);
    if (c + A !== 0) return [c + A, b, c, A * k + b, op, k];
  }
}

export const inequalitySolve: Generator = {
  id: "u2.inequality-solve",
  skillId: "u2.inequalities",
  title: L("Ongelijkheden oplossen", "Solving inequalities"),
  generate(rng, difficulty) {
    const [a, b, c, d, op, k] = solveParts(rng, difficulty);
    const latex = ineqLatex(a, b, c, d, op);
    const { steps, final } = ineqSteps(a, b, c, d, op);
    const answer = relLatex("x", final, String(k));
    return {
      prompt: L("Los de ongelijkheid op. Schrijf je antwoord als $x<\\ldots$, $x>\\ldots$, $x\\le\\ldots$ of $x\\ge\\ldots$.", "Solve the inequality. Write your answer as $x<\\ldots$, $x>\\ldots$, $x\\le\\ldots$ or $x\\ge\\ldots$."),
      latex,
      visual: lineFor(a, b, c, d, op, k, latex),
      answer: { kind: "relation", latex: answer, points: boundaryPoints(k) },
      calculator: "off",
      hints: {
        nudge: nudge(a - c, b, c, op),
        rule: ruleHint(false),
        solution: { steps: [{ latex, note: L("Dit is de ongelijkheid.", "This is the inequality.") }, ...steps] },
      },
      mistakes: ineqMistakes(final, k, false, a - c),
    };
  },
  verify: verifyRelation,
};

// ---------------------------------------------------------------------------
// Flipping the sign
// ---------------------------------------------------------------------------

function flipParts(rng: Rng, difficulty: Difficulty): { a: number; b: number; c: number; d: number; op: Rel; k: number; numberFirst: boolean } {
  const op = rng.pick(RELS);
  const k = rng.int(-6, 6);
  if (difficulty === 1) {
    const a = -rng.int(1, 5);
    return { a, b: 0, c: 0, d: a * k, op, k, numberFirst: false };
  }
  if (difficulty === 2) {
    const a = -rng.int(2, 5);
    const b = rng.nonZeroInt(-9, 9);
    return { a, b, c: 0, d: a * k + b, op, k, numberFirst: b > 0 && rng.chance() };
  }
  // x on both sides: neither a nor c may be 0.
  for (;;) {
    const a = rng.nonZeroInt(-3, 4);
    const A = -rng.int(1, 4);
    const b = rng.int(-10, 10);
    const c = a - A;
    if (c !== 0) return { a, b, c, d: A * k + b, op, k, numberFirst: false };
  }
}

export const inequalityFlip: Generator = {
  id: "u2.inequality-flip",
  skillId: "u2.inequality-flip",
  title: L("Teken omklappen", "Flipping the sign"),
  generate(rng, difficulty) {
    const { a, b, c, d, op, k, numberFirst } = flipParts(rng, difficulty);
    const latex = ineqLatex(a, b, c, d, op, numberFirst);
    const { steps, final } = ineqSteps(a, b, c, d, op);
    const answer = relLatex("x", final, String(k));
    const first: Step[] = [{ latex, note: L("Dit is de ongelijkheid.", "This is the inequality.") }];
    if (numberFirst) first.push({ latex: ineqLatex(a, b, c, d, op), note: L("Zet de $x$-term vooraan. Het minteken gaat mee.", "Put the $x$-term first. The minus sign moves with it.") });
    return {
      prompt: L("Los de ongelijkheid op. Schrijf je antwoord als $x<\\ldots$, $x>\\ldots$, $x\\le\\ldots$ of $x\\ge\\ldots$.", "Solve the inequality. Write your answer as $x<\\ldots$, $x>\\ldots$, $x\\le\\ldots$ or $x\\ge\\ldots$."),
      latex,
      visual: lineFor(a, b, c, d, op, k, latex),
      answer: { kind: "relation", latex: answer, points: boundaryPoints(k) },
      calculator: "off",
      hints: {
        nudge: nudge(a - c, b, c, op),
        rule: ruleHint(true),
        solution: { steps: [...first, ...steps] },
      },
      mistakes: ineqMistakes(final, k, true, a - c),
    };
  },
  verify: verifyRelation,
};

// ---------------------------------------------------------------------------
// What is a solution? (multiple choice)
// ---------------------------------------------------------------------------

const DRAWINGS: Loc[] = [
  L("Dicht bolletje, pijl naar links", "Closed dot, arrow to the left"),
  L("Open bolletje, pijl naar links", "Open dot, arrow to the left"),
  L("Dicht bolletje, pijl naar rechts", "Closed dot, arrow to the right"),
  L("Open bolletje, pijl naar rechts", "Open dot, arrow to the right"),
];

/** Index in DRAWINGS for `x op k`. */
const drawingIndex = (op: Rel) => (pointsLeft(op) ? 0 : 2) + (isClosed(op) ? 0 : 1);

export const inequalityMeaning: Generator = {
  id: "u2.inequality-meaning",
  skillId: "u2.inequality-meaning",
  title: L("Wat is een oplossing?", "What is a solution?"),
  generate(rng, difficulty) {
    const k = rng.int(-4, 8);
    const op = rng.pick(RELS);

    if (difficulty < 3 && rng.chance(0.4)) {
      // How do you draw x op k?
      const latex = relLatex("x", op, String(k));
      return {
        prompt: L(`Hoe teken je $${latex}$ op de getallenlijn?`, `How do you draw $${latex}$ on the number line?`),
        latex,
        answer: { kind: "choice", options: DRAWINGS.map((text) => ({ text })), correctIndex: drawingIndex(op) },
        calculator: "off",
        hints: {
          nudge: L(
            `$${op}$ betekent ${REL_NAME[op].nl}. Hoort $${k}$ er zelf bij? Liggen de oplossingen links of rechts van $${k}$?`,
            `$${op}$ means ${REL_NAME[op].en}. Does $${k}$ itself count? Are the solutions to the left or right of $${k}$?`,
          ),
          rule: ruleHint(false),
          solution: {
            steps: [
              {
                latex,
                note: L(
                  `${isClosed(op) ? `$${k}$ doet mee: een dicht bolletje.` : `$${k}$ doet niet mee: een open bolletje.`} ${pointsLeft(op) ? "Kleinere getallen liggen links." : "Grotere getallen liggen rechts."}`,
                  `${isClosed(op) ? `$${k}$ counts: a closed dot.` : `$${k}$ does not count: an open dot.`} ${pointsLeft(op) ? "Smaller numbers are on the left." : "Larger numbers are on the right."}`,
                ),
              },
            ],
          },
        },
      };
    }

    // Which number is a solution?
    let a = 1;
    let b = 0;
    let useOp = op;
    if (difficulty === 2) {
      a = rng.int(2, 5);
      b = rng.nonZeroInt(-9, 9);
    } else if (difficulty === 3) {
      a = rng.pick([-1, 1]) * rng.int(2, 5);
      b = rng.nonZeroInt(-9, 9);
      if (rng.chance(0.4)) useOp = rng.pick(["\\le", "\\ge"] as Rel[]);
    }
    const c = a * k + b;
    const latex = relLatex(lin(a, b), useOp, String(c));
    const works = (t: number) => relHolds(a * t + b, useOp, c);
    // d3 with a closed sign: the boundary is the only correct option.
    const boundaryOnly = difficulty === 3 && isClosed(useOp) && rng.chance(0.5);
    const near = rng.shuffle([-3, -2, -1, 1, 2, 3, 4, -4, 5, -5].map((dlt) => k + dlt));
    let correct: number;
    if (boundaryOnly) correct = k;
    else correct = near.find(works) ?? k;
    const wrongs = [k, ...near].filter((t) => !works(t) && t !== correct).slice(0, 3);
    const options = rng.shuffle([correct, ...wrongs]);
    const { steps, final } = ineqSteps(a, b, 0, c, useOp);
    const solved = relLatex("x", final, String(k));
    return {
      prompt: L(`Welk getal is een oplossing van $${latex}$?`, `Which number is a solution of $${latex}$?`),
      latex,
      visual: lineFor(a, b, 0, c, useOp, k, latex),
      answer: { kind: "choice", options: options.map((t) => ({ latex: String(t) })), correctIndex: options.indexOf(correct) },
      calculator: "off",
      hints: {
        nudge:
          a === 1 && b === 0
            ? L(`Zoek het getal dat ${REL_NAME[useOp].nl} $${k}$ is.`, `Find the number that is ${REL_NAME[useOp].en} $${k}$.`)
            : L(
                `Vul elk getal in voor $x$. Bijvoorbeeld $x=${options[0]}$: klopt $${a}\\cdot ${options[0] < 0 ? `(${options[0]})` : options[0]}${b > 0 ? `+${b}` : b}${useOp === "<" || useOp === ">" ? useOp : `${useOp} `}${c}$?`,
                `Fill in each number for $x$. For example $x=${options[0]}$: is $${a}\\cdot ${options[0] < 0 ? `(${options[0]})` : options[0]}${b > 0 ? `+${b}` : b}${useOp === "<" || useOp === ">" ? useOp : `${useOp} `}${c}$ true?`,
              ),
        rule: ruleHint(a < 0),
        solution: {
          steps: [
            {
              latex,
              note:
                steps.length === 0
                  ? L(`Zoek het getal dat ${REL_NAME[useOp].nl} $${k}$ is.`, `Look for the number that is ${REL_NAME[useOp].en} $${k}$.`)
                  : L("Los de ongelijkheid eerst op.", "First solve the inequality."),
            },
            ...steps,
          ].map((s, i, all) =>
            i === all.length - 1
              ? {
                  ...s,
                  note:
                    steps.length === 0
                      ? L(`${s.note.nl} Alleen $${correct}$ past daarbij.`, `${s.note.en} Only $${correct}$ fits.`)
                      : L(`${s.note.nl} Dus: $${solved}$. Alleen $${correct}$ past daarbij.`, `${s.note.en} So: $${solved}$. Only $${correct}$ fits.`),
                }
              : s,
          ),
        },
      },
    };
  },
  verify(ex) {
    if (ex.answer.kind !== "choice" || !ex.latex) return false;
    const parts = splitRelation(ex.latex);
    if (!parts || parts.op === "=") return false;
    if (parts.lhs === "x" && ex.answer.options.every((o) => o.text)) {
      // Drawing question: work out the picture from the symbol alone.
      const closed = parts.op === "\\le" || parts.op === "\\ge";
      const left = parts.op === "<" || parts.op === "\\le";
      return ex.answer.correctIndex === (left ? 0 : 2) + (closed ? 0 : 1);
    }
    // Number question: exactly the correct option satisfies the inequality.
    const truths = ex.answer.options.map((o) => relationTruth(ex.latex!, { x: Number(o.latex) }));
    return truths.filter(Boolean).length === 1 && truths[ex.answer.correctIndex] === true;
  },
};
