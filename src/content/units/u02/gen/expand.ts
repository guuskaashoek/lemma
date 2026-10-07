/**
 * Lessons 3 and 4: expanding brackets (haakjes wegwerken). Single brackets
 * `a(x+b)` and double brackets `(x+a)(x+b)` (the "papegaaienbek").
 */
import type { Difficulty, Generator, Step } from "@/content/types";
import { equivalent } from "@/math/cas";
import type { Mistake } from "@/math/check";
import type { Rng } from "@/math/random";
import type { VisualSpec } from "@/visuals/types";
import { custom, L } from "../helpers";
import { collect, monoLatex, monosLatex, products, type Mono } from "../widgets/models";

const paren = (s: string) => (s.startsWith("-") ? `(${s})` : s);

/** `3(x+4)`, `-(x-5)`, `x(x+2)`, `(x+2)(x-5)`. */
export function productLatex(left: Mono[], right: Mono[]): string {
  if (left.length > 1) return `(${monosLatex(left)})(${monosLatex(right)})`;
  const [c, p] = left[0];
  const outside = p === 0 && c === -1 ? "-" : monoLatex(left[0]);
  return `${outside}(${monosLatex(right)})`;
}

/** Every product written out: `3\cdot x+3\cdot 4`. */
function writtenProducts(left: Mono[], right: Mono[], hl: boolean): string {
  return products(left, right)
    .map(({ i, j }, k) => {
      const a = monoLatex(left[i]);
      const s = `${k === 0 ? a : paren(a)}\\cdot ${paren(monoLatex(right[j]))}`;
      return hl ? `\\hl{${s}}` : s;
    })
    .join("+");
}

/** A sum of terms where the last one is a blank to fill in. */
function lastAsked(terms: Mono[]): string {
  const head = terms.slice(0, -1).map((m, i) => monoLatex(m, i === 0)).join("");
  const last = terms[terms.length - 1];
  if (terms.length === 1) return `\\ask{${monoLatex(last)}}`;
  return last[0] < 0 ? `${head}-\\ask{${monoLatex([-last[0], last[1]])}}` : `${head}+\\ask{${monoLatex(last)}}`;
}

/** Keeps the mistakes that are really wrong and different from each other. */
function realMistakes(answer: string, list: Mistake[]): Mistake[] {
  const out: Mistake[] = [];
  for (const m of list) {
    if (equivalent(m.latex, answer)) continue;
    if (out.some((o) => equivalent(o.latex, m.latex))) continue;
    out.push(m);
  }
  return out;
}

const positive = (ms: Mono[]) => ms.every(([c]) => c > 0);

/** The area model for positive terms, the arrows otherwise. */
function pictureFor(left: Mono[], right: Mono[], latex: string): VisualSpec {
  if (positive(left) && positive(right)) {
    return { kind: "area-model", rows: left.map((m) => monoLatex(m)), cols: right.map((m) => monoLatex(m)) };
  }
  return custom(
    "u2.arrows",
    { left, right },
    L(`Pijlen van elke term naar elke term in $${latex}$.`, `Arrows from every term to every term in $${latex}$.`),
  );
}

// ---------------------------------------------------------------------------
// Single brackets
// ---------------------------------------------------------------------------

function singleParts(rng: Rng, difficulty: Difficulty): { left: Mono[]; right: Mono[] } {
  if (difficulty === 1) return { left: [[rng.int(2, 9), 0]], right: [[1, 1], [rng.int(1, 9), 0]] };
  if (difficulty === 2) {
    for (;;) {
      const a = rng.pick([-1, 1]) * rng.int(2, 9);
      const c = rng.pick([1, 1, 2, 3]);
      const b = rng.nonZeroInt(-9, 9);
      if (a < 0 || b < 0) return { left: [[a, 0]], right: [[c, 1], [b, 0]] };
    }
  }
  const kind = rng.int(0, 2);
  const b = rng.nonZeroInt(-9, 9);
  if (kind === 0) return { left: [[1, 1]], right: [[1, 1], [b, 0]] };
  if (kind === 1) return { left: [[rng.pick([-1, 1]) * rng.int(2, 5), 1]], right: [[rng.int(2, 4), 1], [b, 0]] };
  return { left: [[-1, 0]], right: [[1, 1], [b, 0]] };
}

export const expandSingle: Generator = {
  id: "u2.expand-single",
  skillId: "u2.expand",
  title: L("Haakjes wegwerken", "Expanding brackets"),
  generate(rng, difficulty) {
    const { left, right } = singleParts(rng, difficulty);
    const latex = productLatex(left, right);
    const prods = products(left, right).map((p) => p.mono);
    const answer = monosLatex(collect(prods));
    const outside = monoLatex(left[0]);
    const minusOnly = left[0][0] === -1 && left[0][1] === 0;

    const steps: Step[] = [
      { latex, note: L("Dit staat er.", "This is the expression.") },
      {
        latex: writtenProducts(left, right, true),
        note: minusOnly
          ? L("Een min voor de haakjes is keer $-1$. Doe keer $-1$ bij elke term.", "A minus in front of the brackets is times $-1$. Multiply every term by $-1$.")
          : L(`Twee pijlen: $${outside}$ keer elke term tussen de haakjes.`, `Two arrows: $${outside}$ times every term inside the brackets.`),
      },
      {
        latex: `\\ask{${monoLatex(prods[0])}}+${writtenProducts(left, right, false).split("+").slice(1).join("+")}`,
        note: L("Pijl 1: reken het eerste stuk uit.", "Arrow 1: work out the first part."),
      },
      { latex: lastAsked(prods), note: L("Pijl 2: reken het tweede stuk uit. Let op het teken.", "Arrow 2: work out the second part. Mind the sign.") },
    ];

    const [r0, r1] = right;
    const mistakes: Mistake[] = [
      {
        id: "only-first",
        latex: monosLatex([prods[0], r1]),
        explain: L(
          `Je deed alleen $${outside}$ keer $${monoLatex(r0)}$. Ook $${monoLatex(r1)}$ moet keer $${paren(outside)}$: twee pijlen.`,
          `You only did $${outside}$ times $${monoLatex(r0)}$. $${monoLatex(r1)}$ must be multiplied by $${paren(outside)}$ too: two arrows.`,
        ),
      },
    ];
    if (left[0][0] < 0 && r1[0] < 0) {
      mistakes.push({
        id: "minus-times-minus",
        latex: monosLatex([prods[0], [-prods[1][0], prods[1][1]]]),
        explain: L(
          `Min keer min is plus: $${paren(outside)}\\cdot(${monoLatex(r1)})=${monoLatex(prods[1])}$.`,
          `Minus times minus is plus: $${paren(outside)}\\cdot(${monoLatex(r1)})=${monoLatex(prods[1])}$.`,
        ),
      });
    }
    if (left[0][1] === 1) {
      // x·x read as 2x, or 2x·3x read as 6x.
      const c = left[0][0] * r0[0];
      mistakes.push({
        id: "x-times-x",
        latex: monosLatex(collect([[c === 1 ? 2 : c, 1], prods[1]])),
        explain:
          c === 1
            ? L("$x\\cdot x=x^2$, niet $2x$. Het is een vierkant.", "$x\\cdot x=x^2$, not $2x$. It is a square.")
            : L(
                `$${outside}\\cdot ${monoLatex(r0)}=${monoLatex(prods[0])}$. De getallen gaan keer elkaar, en $x\\cdot x=x^2$.`,
                `$${outside}\\cdot ${monoLatex(r0)}=${monoLatex(prods[0])}$. The numbers multiply, and $x\\cdot x=x^2$.`,
              ),
      });
    }

    return {
      prompt: L("Werk de haakjes weg.", "Expand the brackets."),
      latex,
      answer: { kind: "expr", latex: answer, form: "expanded" },
      calculator: "off",
      visual: pictureFor(left, right, latex),
      hints: {
        nudge: minusOnly
          ? L(
              `De min voor de haakjes geldt voor allebei: $${monoLatex(r0)}$ en $${monoLatex(r1)}$. Draai bij allebei het teken om.`,
              `The minus in front of the brackets applies to both: $${monoLatex(r0)}$ and $${monoLatex(r1)}$. Turn both signs around.`,
            )
          : L(
              `Doe $${outside}$ keer $${monoLatex(r0)}$, en ook $${outside}$ keer $${paren(monoLatex(r1))}$.`,
              `Do $${outside}$ times $${monoLatex(r0)}$, and also $${outside}$ times $${paren(monoLatex(r1))}$.`,
            ),
        rule: {
          text: L(
            "Haakjes wegwerken: het getal voor de haakjes gaat keer elke term tussen de haakjes. $a(b+c)=ab+ac$.",
            "Expanding brackets: the number in front goes times every term inside. $a(b+c)=ab+ac$.",
          ),
          ruleId: "u2.expand",
        },
        solution: { steps },
      },
      mistakes: realMistakes(answer, mistakes),
    };
  },
  verify(ex) {
    // Independent check: the CAS compares both sides at many points; the
    // answer must not contain brackets.
    if (ex.answer.kind !== "expr" || !ex.latex) return false;
    return !ex.answer.latex.includes("(") && equivalent(ex.latex, ex.answer.latex);
  },
};

// ---------------------------------------------------------------------------
// Double brackets
// ---------------------------------------------------------------------------

function doubleParts(rng: Rng, difficulty: Difficulty): { left: Mono[]; right: Mono[]; square: boolean } {
  if (difficulty === 1) return { left: [[1, 1], [rng.int(1, 9), 0]], right: [[1, 1], [rng.int(1, 9), 0]], square: false };
  if (difficulty === 2) {
    for (;;) {
      const a = rng.nonZeroInt(-9, 9);
      const b = rng.nonZeroInt(-9, 9);
      if (a < 0 || b < 0) return { left: [[1, 1], [a, 0]], right: [[1, 1], [b, 0]], square: false };
    }
  }
  if (rng.chance(0.3)) {
    const a = rng.nonZeroInt(-8, 8);
    return { left: [[1, 1], [a, 0]], right: [[1, 1], [a, 0]], square: true };
  }
  for (;;) {
    const a = rng.int(1, 4);
    const c = rng.int(1, 4);
    if (a === 1 && c === 1) continue;
    return { left: [[a, 1], [rng.nonZeroInt(-7, 7), 0]], right: [[c, 1], [rng.nonZeroInt(-7, 7), 0]], square: false };
  }
}

export const expandDouble: Generator = {
  id: "u2.expand-double",
  skillId: "u2.expand-double",
  title: L("Dubbele haakjes", "Double brackets"),
  generate(rng, difficulty) {
    const { left, right, square } = doubleParts(rng, difficulty);
    const plain = productLatex(left, right);
    const latex = square ? `(${monosLatex(left)})^{2}` : plain;
    const prods = products(left, right).map((p) => p.mono);
    const total = collect(prods);
    const answer = monosLatex(total);

    const steps: Step[] = [{ latex, note: L("Dit staat er.", "This is the expression.") }];
    if (square) {
      steps.push({ latex: plain, note: L("Kwadraat: twee keer dezelfde haakjes.", "Squared: the same brackets twice.") });
    }
    steps.push(
      { latex: writtenProducts(left, right, true), note: L("Vier pijlen: elke term links keer elke term rechts.", "Four arrows: every term on the left times every term on the right.") },
      { latex: lastAsked(prods), note: L("Reken de vier vakken uit. Let op de tekens.", "Work out the four boxes. Mind the signs.") },
    );
    const middle = prods[1][0] + prods[2][0];
    if (middle !== 0) {
      const t0 = monoLatex(total[0]);
      const tail = total.length > 2 ? monoLatex(total[2], false) : "";
      steps.push({
        latex: `${t0}${middle < 0 ? `-\\ask{${monoLatex([-middle, 1])}}` : `+\\ask{${monoLatex([middle, 1])}}`}${tail}`,
        note: L(
          `Neem de $x$-termen samen: $${monoLatex(prods[1])}${monoLatex(prods[2], false)}=${monoLatex([middle, 1])}$.`,
          `Combine the $x$-terms: $${monoLatex(prods[1])}${monoLatex(prods[2], false)}=${monoLatex([middle, 1])}$.`,
        ),
      });
    } else {
      steps.push({ latex: answer, note: L("De $x$-termen vallen tegen elkaar weg.", "The $x$-terms cancel out.") });
    }

    const [l0, l1] = left;
    const [r0, r1] = right;
    const mistakes: Mistake[] = [
      {
        id: "two-boxes",
        latex: monosLatex(collect([prods[0], prods[3]])),
        explain: square
          ? L(
              `$${latex}$ is $${plain}$. Dat zijn vier vakken, niet twee. Je mist de $x$-termen in het midden.`,
              `$${latex}$ is $${plain}$. That is four boxes, not two. You are missing the $x$-terms in the middle.`,
            )
          : L(
              "Je deed alleen eerste keer eerste en laatste keer laatste. Er zijn vier pijlen: vier vakken.",
              "You only did first times first and last times last. There are four arrows: four boxes.",
            ),
      },
    ];
    if (l1[0] < 0 || r1[0] < 0) {
      mistakes.push({
        id: "last-sign",
        latex: monosLatex(collect([prods[0], prods[1], prods[2], [-prods[3][0], 0]])),
        explain: L(
          `Kijk naar het teken van $${paren(monoLatex(l1))}\\cdot ${paren(monoLatex(r1))}=${monoLatex(prods[3])}$.`,
          `Look at the sign of $${paren(monoLatex(l1))}\\cdot ${paren(monoLatex(r1))}=${monoLatex(prods[3])}$.`,
        ),
      });
    }
    if (l0[0] * r0[0] !== 1) {
      mistakes.push({
        id: "first-box",
        latex: monosLatex(collect([[l0[0] + r0[0], 2], prods[1], prods[2], prods[3]])),
        explain: L(
          `$${monoLatex(l0)}\\cdot ${monoLatex(r0)}=${monoLatex(prods[0])}$: de getallen gaan keer elkaar.`,
          `$${monoLatex(l0)}\\cdot ${monoLatex(r0)}=${monoLatex(prods[0])}$: the numbers are multiplied.`,
        ),
      });
    }

    return {
      prompt: L("Werk de haakjes weg.", "Expand the brackets."),
      latex,
      answer: { kind: "expr", latex: answer, form: "expanded" },
      calculator: "off",
      visual: { kind: "area-model", rows: left.map((m) => monoLatex(m)), cols: right.map((m) => monoLatex(m)) },
      hints: {
        nudge: L(
          `Maak vier vakken: $${monoLatex(l0)}$ en $${monoLatex(l1)}$ gaan allebei keer $${monoLatex(r0)}$ en keer $${paren(monoLatex(r1))}$.`,
          `Make four boxes: $${monoLatex(l0)}$ and $${monoLatex(l1)}$ each go times $${monoLatex(r0)}$ and times $${paren(monoLatex(r1))}$.`,
        ),
        rule: {
          text: L(
            "Dubbele haakjes: elke term links keer elke term rechts. Vier pijlen, de papegaaienbek. Neem daarna de $x$-termen samen.",
            "Double brackets: every term on the left times every term on the right. Four arrows. Then combine the $x$-terms.",
          ),
          ruleId: "u2.expand-double",
        },
        solution: { steps },
      },
      mistakes: realMistakes(answer, mistakes),
    };
  },
  verify(ex) {
    if (ex.answer.kind !== "expr" || !ex.latex) return false;
    return !ex.answer.latex.includes("(") && equivalent(ex.latex, ex.answer.latex);
  },
};
