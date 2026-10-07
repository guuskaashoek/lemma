/**
 * Lesson 2 generators: reading a and b from y = ax + b, and writing the
 * formula from a start value and a step (in words or as a table).
 */
import Fraction from "fraction.js";
import { evaluate, parse } from "@/math/cas";
import type { Mistake } from "@/math/check";
import { frac, paren, sum, term } from "@/math/latex";
import { validateSteps } from "@/math/steps";
import type { GeneratedExercise, Generator, Loc, Step } from "@/content/types";
import { absL, F, intNot, L, lin, pt, propsOf, upDown } from "../helpers";
import { toFrac } from "../widgets/model";
import { lineLabVisual, slopeWalkVisual, W } from "./visuals";

// ---------------------------------------------------------------------------
// Reading a and b
// ---------------------------------------------------------------------------

/** The right-hand side as written, as terms in display order. */
type Written = Array<[Fraction, "x" | ""]>;

const rhsOf = (w: Written) => sum(w.map(([c, v]) => [c, v]));
/** The right-hand side with a number filled in for x (marked). */
const rhsAt = (w: Written, x: number) =>
  w
    .map(([c, v], i) => {
      const t = v === "x" ? `${frac(c)}\\cdot\\hl{${x}}` : frac(c);
      return i === 0 || t.startsWith("-") ? t : `+${t}`;
    })
    .join("") || "0";

const RULE_AB: Loc = L(
  "In $y=ax+b$ is $a$ de richtingscoëfficiënt: de stap per $1$ naar rechts. $b$ is het startgetal: daar snijdt de lijn de $y$-as.",
  "In $y=ax+b$, $a$ is the slope: the step for every $1$ to the right. $b$ is the start value: where the line crosses the $y$-axis.",
);

export const readAB: Generator = {
  id: "u3.read-ab",
  skillId: "u3.slope-intercept",
  title: L("Richtingscoëfficiënt en startgetal aflezen", "Reading the slope and start value"),
  generate(rng, difficulty) {
    if (difficulty === 3) return readAbRearrange(rng.int(0, 2), rng);
    const a = difficulty === 1 ? F(intNot(rng, -6, 6, [0])) : F(rng.pick([-1, 1, 0, intNot(rng, -6, 6, [0, 1, -1])]));
    const b = difficulty === 1 ? F(rng.nonZeroInt(-9, 9)) : a.equals(0) ? F(rng.nonZeroInt(-9, 9)) : F(rng.int(-9, 9));
    // Difficulty 2: often the start value comes first, like y = 5 - 2x.
    const bFirst = difficulty === 2 && !b.equals(0) && !a.equals(0) && rng.chance(0.6);
    const order: Written = bFirst
      ? [
          [b, ""],
          [a, "x"],
        ]
      : [
          [a, "x"],
          [b, ""],
        ];
    const written = order.filter(([c]) => !c.equals(0));
    const f = rhsOf(written);
    const askA = rng.chance();
    const y0 = b;
    const y1 = a.add(b);

    const mistakes: Mistake[] = [];
    const add = (id: string, v: Fraction, explain: Loc) => {
      const right = askA ? a : b;
      if (!v.equals(right) && !mistakes.some((m) => m.id === id)) mistakes.push({ id, latex: frac(v), explain });
    };
    if (askA) {
      if (!b.equals(0)) add("took-b", b, L(`$${frac(b)}$ is het startgetal $b$. De richtingscoëfficiënt is het getal vóór $x$.`, `$${frac(b)}$ is the start value $b$. The slope is the number in front of $x$.`));
      if (a.s < 0) add("lost-minus", a.neg(), L(`Het minteken hoort erbij: vóór $x$ staat $${frac(a)}$.`, `The minus sign belongs to it: in front of $x$ there is $${frac(a)}$.`));
      if (a.abs().equals(1)) add("hidden-one", F(0), L(`Er staat geen getal vóór $x$, maar $${term(a, "x")}$ betekent $${frac(a)}\\cdot x$.`, `There is no number in front of $x$, but $${term(a, "x")}$ means $${frac(a)}\\cdot x$.`));
    } else {
      if (!a.equals(0)) add("took-a", a, L(`$${frac(a)}$ hoort bij $${term(a, "x")}$: dat is de richtingscoëfficiënt. Het startgetal is het getal zonder $x$.`, `$${frac(a)}$ belongs to $${term(a, "x")}$: that is the slope. The start value is the number without $x$.`));
      if (b.s < 0) add("lost-minus", b.neg(), L(`Het minteken hoort erbij: het startgetal is $${frac(b)}$.`, `The minus sign belongs to it: the start value is $${frac(b)}$.`));
    }

    const steps: Step[] = askA
      ? [
          { latex: `(${rhsAt(written, 1)})-(${rhsAt(written, 0)})`, note: L("$a$ is de stap: hoeveel $y$ verandert als $x$ van $0$ naar $1$ gaat.", "$a$ is the step: how much $y$ changes when $x$ goes from $0$ to $1$.") },
          { latex: `\\ask{${frac(y1)}}-${paren(y0)}`, note: L("Reken $y$ uit bij $x=1$ en bij $x=0$.", "Work out $y$ at $x=1$ and at $x=0$.") },
          {
            latex: `\\ask{${frac(a)}}`,
            note: a.equals(0)
              ? L("Er staat geen $x$: $y$ verandert niet. De lijn is vlak.", "There is no $x$: $y$ does not change. The line is flat.")
              : L("Dat is precies het getal vóór $x$.", "That is exactly the number in front of $x$."),
          },
        ]
      : [
          { latex: rhsAt(written, 0), note: L("$b$ is $y$ bij $x=0$: daar snijdt de lijn de $y$-as.", "$b$ is $y$ at $x=0$: where the line crosses the $y$-axis.") },
          { latex: `\\ask{${frac(b)}}`, note: L("Dat is het getal zonder $x$.", "That is the number without $x$.") },
        ];

    return {
      prompt: askA
        ? L(`Wat is de richtingscoëfficiënt $a$ van $y=${f}$?`, `What is the slope $a$ of $y=${f}$?`)
        : L(`Wat is het startgetal $b$ van $y=${f}$?`, `What is the start value $b$ of $y=${f}$?`),
      latex: `y=${f}`,
      visual: lineLabVisual(a, b, { stairs: true }),
      answer: { kind: "expr", latex: frac(askA ? a : b), form: "any" },
      calculator: "off",
      hints: {
        nudge: askA
          ? a.equals(0)
            ? L("Er staat geen $x$ in de formule. Hoeveel verandert $y$ dan per stap naar rechts?", "There is no $x$ in the formula. So how much does $y$ change per step to the right?")
            : L(
              written.length === 2 && bFirst
                ? `In $y=${f}$ staat het startgetal vooraan. Welk getal staat vlak vóór $x$, met zijn teken?`
                : a.abs().equals(1)
                  ? `In $y=${f}$ staat $${term(a, "x")}$. Dat betekent $${frac(a)}\\cdot x$.`
                  : `In $y=${f}$: welk getal staat vlak vóór $x$, met zijn teken?`,
              written.length === 2 && bFirst
                ? `In $y=${f}$ the start value comes first. Which number is right in front of $x$, with its sign?`
                : a.abs().equals(1)
                  ? `In $y=${f}$ you see $${term(a, "x")}$. That means $${frac(a)}\\cdot x$.`
                  : `In $y=${f}$: which number is right in front of $x$, with its sign?`,
            )
          : L(
              `Vul $x=0$ in: $y=${rhsAt(written, 0).replace(/\\hl\{0\}/g, "0")}$. Wat blijft er over?`,
              `Fill in $x=0$: $y=${rhsAt(written, 0).replace(/\\hl\{0\}/g, "0")}$. What is left?`,
            ),
        rule: { text: RULE_AB, ruleId: "u3.slope-intercept" },
        solution: { steps },
      },
      mistakes,
    };
  },
  verify(ex) {
    // Independent check: the slope is y(1) - y(0) and the start is y(0), via the CAS.
    if (!ex.latex) return false;
    const eq = ex.latex;
    if (ex.answer.kind === "multi") {
      const [pa, pb] = ex.answer.parts.map((p) => evaluate(parse(p.answer.latex)));
      if (pa === null || pb === null) return false;
      // Every point of y = a x + b must satisfy the given equation.
      return validateSteps([eq, `y=(${pa})x+(${pb})`]).ok;
    }
    if (ex.answer.kind !== "expr") return false;
    const rhs = eq.replace(/^y=/, "");
    const y0 = evaluate(parse(rhs), { x: 0 });
    const y1 = evaluate(parse(rhs), { x: 1 });
    const got = evaluate(parse(ex.answer.latex));
    if (y0 === null || y1 === null || got === null) return false;
    const want = /richtingscoëfficiënt/.test(ex.prompt.nl) ? y1 - y0 : y0;
    return Math.abs(want - got) < 1e-9;
  },
};

/** Difficulty 3: the formula must be rewritten first (unit 2, rearranging). */
function readAbRearrange(kind: number, rng: { int(a: number, b: number): number; nonZeroInt(a: number, b: number): number; pick<T>(x: readonly T[]): T }): GeneratedExercise {
  const a = F(rng.nonZeroInt(-5, 5));
  const b = F(rng.nonZeroInt(-9, 9));
  let given: string;
  let note: Loc;
  if (kind === 0) {
    // y - p = a x + q, with b = p + q
    const p = F(rng.nonZeroInt(-6, 6));
    const q = b.sub(p);
    given = `y${p.s < 0 ? "+" : "-"}${absL(p)}=${lin(a, q)}`;
    note =
      p.s > 0
        ? L(`Maak $y$ alleen: tel aan beide kanten $${frac(p)}$ op.`, `Get $y$ on its own: add $${frac(p)}$ to both sides.`)
        : L(`Maak $y$ alleen: haal aan beide kanten $${absL(p)}$ weg.`, `Get $y$ on its own: subtract $${absL(p)}$ on both sides.`);
  } else if (kind === 1) {
    // k y = k a x + k b
    const k = rng.pick([2, 3, 4]);
    given = `${k}y=${lin(a.mul(k), b.mul(k))}`;
    note = L(`Maak $y$ alleen: deel beide kanten door $${k}$.`, `Get $y$ on its own: divide both sides by $${k}$.`);
  } else {
    // y - a x = b  (x on the left)
    const ax = term(a.abs(), "x");
    given = `y${a.s < 0 ? "+" : "-"}${ax}=${frac(b)}`;
    note =
      a.s > 0
        ? L(`Maak $y$ alleen: tel aan beide kanten $${ax}$ op.`, `Get $y$ on its own: add $${ax}$ to both sides.`)
        : L(`Maak $y$ alleen: haal aan beide kanten $${ax}$ weg.`, `Get $y$ on its own: subtract $${ax}$ on both sides.`);
  }
  return {
    prompt: L(
      `Schrijf $${given}$ als $y=ax+b$. Geef dan $a$ en $b$.`,
      `Write $${given}$ as $y=ax+b$. Then give $a$ and $b$.`,
    ),
    latex: given,
    visual: lineLabVisual(a, b, { stairs: true }),
    answer: {
      kind: "multi",
      parts: [
        { label: "a=", answer: { latex: frac(a), form: "any" } },
        { label: "b=", answer: { latex: frac(b), form: "any" } },
      ],
    },
    calculator: "off",
    hints: {
      nudge: L(`Links staat nu niet alleen $y$. ${note.nl}`, `On the left there is not just $y$. ${note.en}`),
      rule: {
        text: L(
          "Eerst moet er $y=\\ldots$ staan, met de balans. Daarna lees je af: $a$ staat vóór $x$, $b$ is het losse getal.",
          "First you need $y=\\ldots$, using the balance. Then read off: $a$ is in front of $x$, $b$ is the number on its own.",
        ),
        ruleId: "u3.slope-intercept",
        metaphor: "balance",
      },
      solution: {
        steps: [
          { latex: given, note: L("Dit is de formule.", "This is the formula.") },
          { latex: `y=\\ask{${lin(a, b)}}`, note },
        ],
      },
    },
  };
}

// ---------------------------------------------------------------------------
// Writing the formula from start and step
// ---------------------------------------------------------------------------

export const formulaFromAB: Generator = {
  id: "u3.formula-from-ab",
  skillId: "u3.write-formula",
  title: L("Formule bij start en stap", "Formula from start and step"),
  generate(rng, difficulty) {
    const a = F(intNot(rng, -5, 5, [0]));
    const b = F(rng.int(-8, 8));
    const f = lin(a, b);
    const yAt = (x: number) => a.mul(x).add(b);
    let prompt: Loc;
    let latex: string | undefined;
    let steps: Step[];
    let nudge: Loc;
    let visual;
    if (difficulty === 1) {
      const dir = upDown(a);
      prompt = L(
        `Een lijn snijdt de $y$-as in $${pt(0, b)}$.\nBij elke stap van $1$ naar rechts gaat de lijn $${absL(a)}$ ${dir.nl}.\nGeef de formule.`,
        `A line crosses the $y$-axis at $${pt(0, b)}$.\nFor every step of $1$ to the right, the line goes $${absL(a)}$ ${dir.en}.\nGive the formula.`,
      );
      steps = [
        {
          latex: `y=\\hl{${frac(b)}}${a.s < 0 ? "-" : "+"}${term(a.abs(), "x")}`,
          note: L(
            `Start bij $${frac(b)}$. Elke stap gaat er $${absL(a)}$ ${a.s < 0 ? "af" : "bij"}: dat is $${a.s < 0 ? "-" : "+"}${term(a.abs(), "x")}$.`,
            `Start at $${frac(b)}$. Every step ${a.s < 0 ? "takes away" : "adds"} $${absL(a)}$: that is $${a.s < 0 ? "-" : "+"}${term(a.abs(), "x")}$.`,
          ),
        },
        { latex: `y=\\ask{${f}}`, note: L("Schrijf het als $y=ax+b$: eerst de $x$-term.", "Write it as $y=ax+b$: the $x$ term first.") },
      ];
      nudge = L(
        `Het startgetal is $b=${frac(b)}$. De stap is $${absL(a)}$ ${dir.nl}, dus $a=${frac(a)}$.`,
        `The start value is $b=${frac(b)}$. The step is $${absL(a)}$ ${dir.en}, so $a=${frac(a)}$.`,
      );
      visual = slopeWalkVisual([0, b], [1, a.add(b)], { intercept: true, reveal: false });
    } else {
      // A table, given as points. Difficulty 2 has x = 0 in it; difficulty 3 does not.
      const x0 = difficulty === 2 ? rng.int(-1, 0) : rng.int(1, 3);
      const xs = [x0, x0 + 1, x0 + 2, x0 + 3];
      const list = xs.map((x) => pt(x, yAt(x))).join(",\\ ");
      latex = list;
      prompt = L(
        `Deze punten uit een tabel liggen op een rechte lijn:\n$${list}$\nGeef de formule.`,
        `These points from a table lie on a straight line:\n$${list}$\nGive the formula.`,
      );
      const [p0, p1] = [yAt(x0), yAt(x0 + 1)];
      if (difficulty === 2) {
        steps = [
          {
            latex: `y=(${frac(p1)}-${paren(p0)})x+${paren(b)}`,
            note: L(
              `$a$: $y$ verandert per stap met $${frac(p1)}-${paren(p0)}$. $b$: bij $x=0$ is $y=${frac(b)}$.`,
              `$a$: $y$ changes per step by $${frac(p1)}-${paren(p0)}$. $b$: at $x=0$, $y=${frac(b)}$.`,
            ),
          },
          { latex: `y=\\ask{${f}}`, note: L("Reken uit en schrijf netjes.", "Work it out and write it neatly.") },
        ];
        nudge = L(
          `Het punt $${pt(0, b)}$ ligt op de $y$-as: dat geeft $b$. Van $x=${x0}$ naar $x=${x0 + 1}$ gaat $y$ van $${frac(p0)}$ naar $${frac(p1)}$. Hoeveel is die stap?`,
          `The point $${pt(0, b)}$ is on the $y$-axis: that gives $b$. From $x=${x0}$ to $x=${x0 + 1}$, $y$ goes from $${frac(p0)}$ to $${frac(p1)}$. How big is that step?`,
        );
      } else {
        steps = [
          {
            latex: `y=${term(a, "x")}+(${frac(p0)}-${x0}\\cdot ${paren(a)})`,
            note: L(
              `$a=${frac(p1)}-${paren(p0)}=${frac(a)}$. Voor $b$ loop je terug van $x=${x0}$ naar $x=0$: $${x0}$ ${x0 === 1 ? "stap" : "stappen"} van $${frac(a)}$. ${a.s < 0 ? "Terug gaat de lijn dus omhoog." : "Terug gaat de lijn dus omlaag."} Dat is $${frac(p0)}-${x0}\\cdot ${paren(a)}$.`,
              `$a=${frac(p1)}-${paren(p0)}=${frac(a)}$. For $b$, walk back from $x=${x0}$ to $x=0$: $${x0}$ ${x0 === 1 ? "step" : "steps"} of $${frac(a)}$. ${a.s < 0 ? "Going back, the line goes up." : "Going back, the line goes down."} That is $${frac(p0)}-${x0}\\cdot ${paren(a)}$.`,
            ),
          },
          { latex: `y=\\ask{${f}}`, note: L("Reken uit en schrijf netjes.", "Work it out and write it neatly.") },
        ];
        nudge = L(
          `$x=0$ staat er niet bij. Van $${frac(p0)}$ naar $${frac(p1)}$: hoeveel verandert $y$ per stap? Loop dan $${x0}$ ${x0 === 1 ? "stap" : "stappen"} terug naar $x=0$.`,
          `$x=0$ is not there. From $${frac(p0)}$ to $${frac(p1)}$: how much does $y$ change per step? Then walk $${x0}$ ${x0 === 1 ? "step" : "steps"} back to $x=0$.`,
        );
      }
      visual = slopeWalkVisual([x0, p0], [x0 + 1, p1], { intercept: true, reveal: false });
    }
    // No typical mistakes here: the app only matches them for expression and
    // single-solution answers (see the shared change requests).
    return {
      prompt,
      ...(latex ? { latex } : {}),
      visual,
      answer: { kind: "relation", latex: `y=${f}` },
      calculator: "off",
      hints: {
        nudge,
        rule: { text: RULE_AB, ruleId: "u3.slope-intercept" },
        solution: { steps },
      },
    };
  },
  verify(ex) {
    // Independent check: the slope triangle in the picture gives a and b;
    // the answer, evaluated by the CAS, must agree at x = 0 and x = 1, and
    // every listed table point must lie on it.
    const p = propsOf(ex, W.slopeWalk);
    if (!p || ex.answer.kind !== "relation") return false;
    const [A, B] = [p.A as [string, string], p.B as [string, string]];
    const a = toFrac(B[1]).sub(toFrac(A[1])).div(toFrac(B[0]).sub(toFrac(A[0])));
    const b = toFrac(A[1]).sub(a.mul(toFrac(A[0])));
    const pts = [...(ex.latex ?? "").matchAll(/\((-?\d+),\\ (-?\d+)\)/g)].map((m) => [Number(m[1]), Number(m[2])]);
    const rhs = parse(ex.answer.latex.replace(/^y=/, ""));
    const at = (x: number) => evaluate(rhs, { x }) ?? Number.NaN;
    const onLine = pts.every(([x, y]) => Math.abs(at(x) - y) < 1e-9);
    return onLine && Math.abs(at(0) - b.valueOf()) < 1e-9 && Math.abs(at(1) - a.add(b).valueOf()) < 1e-9;
  },
};
