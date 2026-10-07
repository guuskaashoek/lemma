/**
 * Lesson 9: rearranging formulas (formules omwerken). A formula is a
 * machine; rearranging is running it backwards: undo every step, from last
 * to first. The steps, the answer and the picture all come from the same
 * machine model (`widgets/models.ts`).
 */
import type { Difficulty, Generator, Loc, Step } from "@/content/types";
import { equivalent, evaluate, freeVariables, parse } from "@/math/cas";
import type { Mistake } from "@/math/check";
import type { Rng } from "@/math/random";
import { custom, L } from "../helpers";
import { applyNumber, backwardChain, forwardChain, inverseOp, opWords, type MOp } from "../widgets/models";

export type Formula = {
  /** Output letter (left side) and the letter to solve for. */
  out: string;
  inp: string;
  ops: MOp[];
  /** How the formula is shown, when not in machine order (e.g. `4+2a`). */
  display?: string;
  meaning?: Loc;
};

const PAIRS: Array<[string, string]> = [
  ["y", "x"],
  ["K", "a"],
  ["L", "t"],
  ["B", "m"],
  ["P", "n"],
];

function pickFormula(rng: Rng, difficulty: Difficulty): Formula {
  const [out, inp] = rng.pick(PAIRS);
  const a = String(rng.int(2, 9));
  const b = String(rng.int(1, 12));
  if (difficulty === 1) {
    const kind = rng.int(0, 2);
    const ops: MOp[] = kind === 0 ? [{ op: "+", n: b }] : kind === 1 ? [{ op: "-", n: b }] : [{ op: "*", n: a }];
    return { out, inp, ops };
  }
  if (difficulty === 2) {
    const kind = rng.int(0, 3);
    if (kind === 0) {
      // Often written with the number first, like a taxi fare: K = 4 + 2a.
      const f: Formula = { out, inp, ops: [{ op: "*", n: a }, { op: "+", n: b }] };
      if (rng.chance(0.4)) f.display = `${b}+${a}${inp}`;
      return f;
    }
    if (kind === 1) return { out, inp, ops: [{ op: "*", n: a }, { op: "-", n: b }] };
    if (kind === 2) return { out, inp, ops: [{ op: "+", n: b }, { op: "*", n: a }] };
    return { out, inp, ops: [{ op: ":", n: a }, { op: "+", n: b }] };
  }
  if (rng.chance(0.6)) {
    // Two steps where one is a division or "number minus x".
    const kind = rng.int(0, 2);
    const big = String(rng.int(10, 30));
    if (kind === 0) return { out, inp, ops: [{ op: "*", n: a }, { op: "from", n: big }] };
    if (kind === 1) return { out, inp, ops: [{ op: "+", n: b }, { op: ":", n: a }] };
    return { out, inp, ops: [{ op: "from", n: big }, { op: "*", n: a }] };
  }
  const kind = rng.int(1, 5);
  switch (kind) {
    case 1:
      return {
        out: "A",
        inp: "b",
        ops: [{ op: "*", n: "l" }],
        display: "l\\cdot b",
        meaning: L("$A$ is de oppervlakte van een rechthoek met lengte $l$ en breedte $b$.", "$A$ is the area of a rectangle with length $l$ and width $b$."),
      };
    case 2:
      return {
        out: "O",
        inp: "b",
        ops: [{ op: "+", n: "l" }, { op: "*", n: "2" }],
        display: "2(l+b)",
        meaning: L("$O$ is de omtrek van een rechthoek met lengte $l$ en breedte $b$.", "$O$ is the perimeter of a rectangle with length $l$ and width $b$."),
      };
    case 3:
      return {
        out: "s",
        inp: "t",
        ops: [{ op: "*", n: "v" }],
        display: "v\\cdot t",
        meaning: L("$s$ is de afstand als je $t$ uur rijdt met snelheid $v$.", "$s$ is the distance when you drive for $t$ hours at speed $v$."),
      };
    case 4:
      return {
        out: "T",
        inp: "h",
        ops: [{ op: "*", n: "6" }, { op: "from", n: "15" }],
        meaning: L("Op een berg is het op $h$ km hoogte ongeveer $T$ graden.", "On a mountain, at a height of $h$ km it is about $T$ degrees."),
      };
    default:
      // A formula with letters only: y = ax + b, solved for x.
      return { out: "y", inp: "x", ops: [{ op: "*", n: "a" }, { op: "+", n: "b" }], display: "a\\cdot x+b" };
  }
}

/**
 * Steps: undo the machine one step at a time. The side with the letter is
 * written on the left from the first step on, so the last step is `x = ...`.
 */
export function undoSteps(f: Formula): { steps: Step[]; answer: string } {
  const fwd = forwardChain(f.ops, f.inp);
  const back = backwardChain(f.ops, f.out);
  const n = f.ops.length;
  const steps: Step[] = [{ latex: `${f.out}=${f.display ?? fwd[n]}`, note: L("Dit is de formule.", "This is the formula.") }];
  for (let k = 1; k <= n; k++) {
    const op = f.ops[n - k];
    const w = opWords(op);
    const iw = opWords(inverseOp(op));
    const undo =
      op.op === "from"
        ? L(`Maak "${w.nl}" ongedaan: $${op.n}$ min de andere kant.`, `Undo "${w.en}": $${op.n}$ minus the other side.`)
        : L(`Maak "${w.nl}" ongedaan: links en rechts ${iw.nl}.`, `Undo "${w.en}": ${iw.en} on both sides.`);
    steps.push({
      latex: `${fwd[n - k]}=\\ask{${back[k]}}`,
      note:
        k === 1
          ? L(`Zet de kant met $${f.inp}$ links. ${undo.nl}`, `Put the side with $${f.inp}$ on the left. ${undo.en}`)
          : undo,
    });
  }
  return { steps, answer: back[n] };
}

/** "First ×2, then +3": the machine's steps in words. */
function stepsInWords(ops: MOp[], lang: "nl" | "en"): string {
  const words = ops.map((o) => opWords(o)[lang]);
  if (words.length === 1) return words[0];
  return lang === "nl" ? `eerst ${words.slice(0, -1).join(", ")}, dan ${words[words.length - 1]}` : `first ${words.slice(0, -1).join(", ")}, then ${words[words.length - 1]}`;
}

export const rearrange: Generator = {
  id: "u2.rearrange",
  skillId: "u2.rearrange",
  title: L("Formules omwerken", "Rearranging formulas"),
  generate(rng, difficulty) {
    const f = pickFormula(rng, difficulty);
    const n = f.ops.length;
    const latex = `${f.out}=${f.display ?? forwardChain(f.ops, f.inp)[n]}`;
    const { steps, answer } = undoSteps(f);
    const last = f.ops[n - 1];

    const mistakes: Mistake[] = [];
    if (n >= 2) {
      // Undoing in the same order as the machine instead of backwards.
      mistakes.push({
        id: "wrong-order",
        latex: backwardChain([...f.ops].reverse(), f.out)[n],
        explain: L(
          `Achteruit gaat in omgekeerde volgorde. De machine deed ${stepsInWords(f.ops, "nl")}. Maak dus eerst "${opWords(last).nl}" ongedaan.`,
          `Backwards goes in reverse order. The machine did ${stepsInWords(f.ops, "en")}. So undo "${opWords(last).en}" first.`,
        ),
      });
    }
    if (last.op !== "from") {
      // The last step "undone" with the same operation instead of its inverse.
      const wrongOps = [...f.ops.slice(0, -1), inverseOp(last)];
      mistakes.push({
        id: "not-inverted",
        latex: backwardChain(wrongOps, f.out)[n],
        explain: L(
          `"${opWords(last).nl}" maak je ongedaan met het omgekeerde: ${opWords(inverseOp(last)).nl}.`,
          `You undo "${opWords(last).en}" with the opposite: ${opWords(inverseOp(last)).en}.`,
        ),
      });
    }
    const real = mistakes.filter((m, i) => !equivalent(m.latex, answer) && mistakes.findIndex((o) => equivalent(o.latex, m.latex)) === i);

    const numeric = f.ops.every((o) => /^\d+(\.\d+)?$/.test(o.n));
    let start: number | undefined;
    let target: number | undefined;
    if (numeric) {
      start = 2;
      target = f.ops.reduce<number | null>((v, o) => (v === null ? null : applyNumber(o, v)), start) ?? undefined;
    }

    return {
      prompt: f.meaning
        ? L(`${f.meaning.nl} Werk de formule om. Schrijf als $${f.inp}=\\ldots$.`, `${f.meaning.en} Rearrange the formula. Write it as $${f.inp}=\\ldots$.`)
        : L(`Werk de formule om. Schrijf als $${f.inp}=\\ldots$.`, `Rearrange the formula. Write it as $${f.inp}=\\ldots$.`),
      latex,
      answer: { kind: "expr", latex: answer },
      calculator: "off",
      visual: custom(
        "u2.undo-machine",
        { ops: f.ops, input: f.inp, output: f.out, ...(start !== undefined ? { start, target } : {}) },
        L(`Een machine voor $${latex}$, vooruit en achteruit.`, `A machine for $${latex}$, forwards and backwards.`),
      ),
      hints: {
        nudge: L(
          `De formule doet met $${f.inp}$: ${stepsInWords(f.ops, "nl")}. Begin achteraan: maak eerst "${opWords(last).nl}" ongedaan.`,
          `The formula does this to $${f.inp}$: ${stepsInWords(f.ops, "en")}. Start at the end: first undo "${opWords(last).en}".`,
        ),
        rule: {
          text: L(
            "Terugrekenen: maak de stappen van de machine ongedaan, van achter naar voren. Wat je links doet, doe je ook rechts.",
            "Working backwards: undo the steps of the machine, from last to first. Whatever you do on the left, you also do on the right.",
          ),
          ruleId: "u2.rearrange",
          metaphor: "machine",
        },
        solution: { steps },
      },
      mistakes: real,
    };
  },
  verify(ex) {
    // Independent check: put the answer back into the original formula and
    // see that it gives the output, for some values of the other letters.
    if (ex.answer.kind !== "expr" || !ex.latex) return false;
    const solveFor = ex.prompt.nl.match(/\$([a-zA-Z])=\\ldots\$/)?.[1];
    const [lhs, rhs] = ex.latex.split("=");
    if (!solveFor || !rhs) return false;
    const answer = parse(ex.answer.latex);
    const right = parse(rhs);
    const others = [...new Set([...freeVariables(right), ...freeVariables(answer), lhs.trim()])].filter((v) => v !== solveFor);
    for (const trial of [0, 1, 2]) {
      const values: Record<string, number> = {};
      others.forEach((v, i) => (values[v] = 1.3 + 0.7 * i + 1.1 * trial));
      const x = evaluate(answer, values);
      if (x === null) return false;
      const y = evaluate(right, { ...values, [solveFor]: x });
      if (y === null || Math.abs(y - values[lhs.trim()]) > 1e-9 * Math.max(1, Math.abs(y))) return false;
    }
    return true;
  },
};
