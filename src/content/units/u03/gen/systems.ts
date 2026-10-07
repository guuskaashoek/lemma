/**
 * Lessons 7-9 generators: systems of two equations (stelsels), by
 * elimination (optellen of aftrekken), by substitution (invullen), and
 * word problems.
 */
import type Fraction from "fraction.js";
import { evaluate, parse } from "@/math/cas";
import { frac, gcd, sum } from "@/math/latex";
import type { GeneratedExercise, Generator, Loc, Step } from "@/content/types";
import type { AnswerSpec } from "@/math/check";
import type { Rng } from "@/math/random";
import { F, intNot, L, lin, propsOf } from "../helpers";
import { toNum } from "../widgets/model";
import { eliminationSteps, equationsHold, intersectionSteps, rowLatex, substitutionSteps, systemEquations, systemLatex, type Row } from "./solve";
import { meetVisual, shapeSystemVisual, W } from "./visuals";

const xyAnswer = (x: Fraction, y: Fraction): AnswerSpec => ({
  kind: "multi",
  parts: [
    { label: "x=", answer: { latex: frac(x), form: "fraction" } },
    { label: "y=", answer: { latex: frac(y), form: "fraction" } },
  ],
});

const answerPoint = (ex: GeneratedExercise): { x: number; y: number } | null => {
  if (ex.answer.kind !== "multi") return null;
  const [x, y] = ex.answer.parts.map((p) => evaluate(parse(p.answer.latex)));
  return x === null || y === null ? null : { x, y };
};

const ELIM_RULE: Loc = L(
  "Optellen of aftrekken: tel de vergelijkingen op of trek ze af, zodat één letter wegvalt. Zijn er niet evenveel? Vermenigvuldig eerst een hele vergelijking.",
  "Adding or subtracting: add or subtract the equations so one letter drops out. Not the same number? First multiply a whole equation.",
);

const SUBST_RULE: Loc = L(
  "Invullen: staat er al $y=\\ldots$ (of $x=\\ldots$)? Zet dat tussen haakjes in de andere vergelijking. Dan heb je nog maar één letter.",
  "Substitution: does one equation already say $y=\\ldots$ (or $x=\\ldots$)? Put that in brackets into the other equation. Then only one letter is left.",
);

const mk = (p: number, q: number, x: Fraction, y: Fraction): Row => ({ p: F(p), q: F(q), c: x.mul(p).add(y.mul(q)) });
const shape = (r: Row) => ({ x: r.p.valueOf(), y: r.q.valueOf(), c: r.c.valueOf() });

/** Multipliers that make the y-coefficients equal: q1·m1 = q2·m2. */
function matchY(q1: number, q2: number): [number, number] {
  const g = gcd(q1, q2);
  return [Math.abs(q2 / g), Math.abs(q1 / g)];
}

/** Parameters of an elimination system per difficulty. */
function eliminationSystem(rng: Rng, difficulty: number, x: Fraction, y: Fraction): { r1: Row; r2: Row; m: [number, number]; op: "add" | "sub" } {
  if (difficulty === 1) {
    const q = rng.int(1, 2);
    const p1 = rng.int(2, 4);
    const p2 = rng.int(1, p1 - 1);
    return { r1: mk(p1, q, x, y), r2: mk(p2, q, x, y), m: [1, 1], op: "sub" };
  }
  if (difficulty === 2) {
    const q = rng.int(1, 2);
    return { r1: mk(rng.int(1, 3), q, x, y), r2: mk(rng.int(1, 3), -q, x, y), m: [1, 1], op: "add" };
  }
  for (;;) {
    const q1 = rng.int(1, 3);
    const q2 = intNot(rng, 1, 3, [q1]);
    const [m1, m2] = matchY(q1, q2);
    const p1 = rng.int(1, 4);
    const p2 = rng.int(1, 4);
    if (p1 * m1 === p2 * m2) continue;
    // The row that ends up with more x goes first, so the number of x stays positive.
    return p1 * m1 > p2 * m2
      ? { r1: mk(p1, q1, x, y), r2: mk(p2, q2, x, y), m: [m1, m2], op: "sub" }
      : { r1: mk(p2, q2, x, y), r2: mk(p1, q1, x, y), m: [m2, m1], op: "sub" };
  }
}

function eliminationNudge(r1: Row, r2: Row, m: [number, number], op: "add" | "sub"): Loc {
  const q1 = frac(r1.q.abs());
  if (m[0] !== 1 || m[1] !== 1) {
    const target = r1.q.mul(m[0]).abs();
    return L(
      `In I staat $${sum([[r1.q, "y"]])}$, in II $${sum([[r2.q, "y"]])}$. Maak er in allebei $${sum([[target, "y"]])}$ van. Trek ze dan van elkaar af.`,
      `I has $${sum([[r1.q, "y"]])}$, II has $${sum([[r2.q, "y"]])}$. Make both $${sum([[target, "y"]])}$. Then subtract them.`,
    );
  }
  return op === "sub"
    ? L(`In I en II staat allebei $+${q1 === "1" ? "" : q1}y$. Trek II van I af: dan valt $y$ weg.`, `Both I and II have $+${q1 === "1" ? "" : q1}y$. Subtract II from I: then $y$ drops out.`)
    : L(
        `In I staat $+${q1 === "1" ? "" : q1}y$ en in II $-${q1 === "1" ? "" : q1}y$. Tel ze op: dan valt $y$ weg.`,
        `I has $+${q1 === "1" ? "" : q1}y$ and II has $-${q1 === "1" ? "" : q1}y$. Add them: then $y$ drops out.`,
      );
}

export const systemElimination: Generator = {
  id: "u3.system-elimination",
  skillId: "u3.elimination",
  title: L("Stelsels: optellen of aftrekken", "Systems: adding or subtracting"),
  generate(rng, difficulty) {
    const x = F(difficulty === 1 ? rng.int(1, 6) : rng.int(-3, 6));
    const y = F(difficulty === 1 ? rng.int(1, 6) : rng.int(-3, 6));
    const { r1, r2, m, op } = eliminationSystem(rng, difficulty, x, y);
    const e1 = rowLatex(r1.p, r1.q, r1.c);
    const e2 = rowLatex(r2.p, r2.q, r2.c);
    return {
      prompt: L("Los het stelsel op. Geef $x$ en $y$.", "Solve the system. Give $x$ and $y$."),
      latex: systemLatex(e1, e2),
      visual: shapeSystemVisual(shape(r1), shape(r2), m),
      answer: xyAnswer(x, y),
      calculator: "off",
      hints: {
        nudge: eliminationNudge(r1, r2, m, op),
        rule: { text: ELIM_RULE, ruleId: "u3.elimination", metaphor: "balance" },
        solution: { steps: eliminationSteps(r1, r2, m[0], m[1], op, x, y), solutions: [{ x: x.valueOf(), y: y.valueOf() }] },
      },
    };
  },
  verify(ex) {
    // Independent check: put the answer into both equations.
    const pnt = answerPoint(ex);
    return !!pnt && !!ex.latex && equationsHold(systemEquations(ex.latex), pnt);
  },
  isNice(ex) {
    const pnt = answerPoint(ex);
    return !!pnt && Number.isInteger(pnt.x) && Number.isInteger(pnt.y);
  },
};

export const systemSubstitution: Generator = {
  id: "u3.system-substitution",
  skillId: "u3.substitution",
  title: L("Stelsels: invullen", "Systems: substitution"),
  generate(rng, difficulty) {
    for (;;) {
      const x = F(rng.int(-3, 6));
      const y = F(rng.int(-3, 6));
      const iso: "x" | "y" = difficulty === 3 && rng.chance() ? "x" : "y";
      const a = F(intNot(rng, -3, 3, [0]));
      const p = difficulty === 1 ? 1 : rng.int(1, 4);
      const q = difficulty === 1 ? 1 : rng.pick([-3, -2, 2, 3]);
      const isoVal = iso === "y" ? y : x;
      const other = iso === "y" ? x : y;
      const b = isoVal.sub(a.mul(other));
      const r2 = mk(p, q, x, y);
      // The other letter must not drop out after substituting.
      const ci = iso === "y" ? r2.q : r2.p;
      const co = iso === "y" ? r2.p : r2.q;
      if (co.add(ci.mul(a)).equals(0)) continue;
      const oth = iso === "y" ? "x" : "y";
      const f = sum([
        [a, oth],
        [b, ""],
      ]);
      const e1 = `${iso}=${f}`;
      const e2 = rowLatex(r2.p, r2.q, r2.c);
      // Both lines as y = ... for the picture.
      const line1 = iso === "y" ? { a, b } : { a: F(1).div(a), b: b.neg().div(a) };
      const line2 = { a: r2.p.neg().div(r2.q), b: r2.c.div(r2.q) };
      return {
        prompt: L("Los het stelsel op. Geef $x$ en $y$.", "Solve the system. Give $x$ and $y$."),
        latex: systemLatex(e1, e2),
        visual: meetVisual([line1, line2], x.equals(0) ? 3 : 0),
        answer: xyAnswer(x, y),
        calculator: "off",
        hints: {
          nudge: L(
            `In I staat al $${e1}$. Zet $(${f})$ in II op de plek van $${iso}$. Dan heb je alleen nog $${oth}$.`,
            `I already says $${e1}$. Put $(${f})$ into II in place of $${iso}$. Then only $${oth}$ is left.`,
          ),
          rule: { text: SUBST_RULE, ruleId: "u3.substitution", metaphor: "balance" },
          solution: { steps: substitutionSteps(iso, a, b, r2, x, y), solutions: [{ x: x.valueOf(), y: y.valueOf() }] },
        },
      };
    }
  },
  verify(ex) {
    const pnt = answerPoint(ex);
    return !!pnt && !!ex.latex && equationsHold(systemEquations(ex.latex), pnt);
  },
  isNice(ex) {
    const pnt = answerPoint(ex);
    return !!pnt && Number.isInteger(pnt.x) && Number.isInteger(pnt.y);
  },
};

// ---------------------------------------------------------------------------
// Word problems
// ---------------------------------------------------------------------------

type Shop = { x: Loc; y: Loc; xs: Loc; ys: Loc; who: Loc };
const SHOPS: Shop[] = [
  { x: L("broodje", "sandwich"), xs: L("broodjes", "sandwiches"), y: L("koffie", "coffee"), ys: L("koffie", "coffees"), who: L("In de kantine", "In the canteen") },
  { x: L("ijsje", "ice cream"), xs: L("ijsjes", "ice creams"), y: L("flesje water", "bottle of water"), ys: L("flesjes water", "bottles of water"), who: L("Op het strand", "At the beach") },
  { x: L("schrift", "notebook"), xs: L("schriften", "notebooks"), y: L("pen", "pen"), ys: L("pennen", "pens"), who: L("In de boekwinkel", "In the bookshop") },
];

type Plan = { thing: Loc; unit: Loc; units: Loc; fixed: Loc };
const PLANS: Plan[] = [
  { thing: L("Sportschool", "Gym"), unit: L("maand", "month"), units: L("maanden", "months"), fixed: L("inschrijfgeld", "sign-up fee") },
  { thing: L("Fietsverhuur", "Bike hire"), unit: L("uur", "hour"), units: L("uur", "hours"), fixed: L("starttarief", "starting fee") },
  { thing: L("Streamingdienst", "Streaming service"), unit: L("maand", "month"), units: L("maanden", "months"), fixed: L("aansluitkosten", "connection fee") },
];

const n = (k: number, one: Loc, many: Loc) => (k === 1 ? one : many);

export const wordSystem: Generator = {
  id: "u3.word-system",
  skillId: "u3.word-systems",
  title: L("Stelsels in het echt", "Systems in real life"),
  generate(rng, difficulty) {
    if (difficulty === 2) {
      // Two price plans: when do they cost the same?
      const plan = rng.pick(PLANS);
      const a2 = 5 * rng.int(3, 7);
      const a1 = a2 - 5 * rng.int(1, 2);
      const x = F(rng.int(2, 10));
      const b2 = 10 * rng.int(0, 2);
      const b1 = b2 + (a2 - a1) * x.valueOf();
      const y = x.mul(a1).add(b1);
      const [A1, B1, A2, B2] = [F(a1), F(b1), F(a2), F(b2)];
      const f1 = lin(A1, B1);
      const f2 = lin(A2, B2);
      const steps: Step[] = intersectionSteps(A1, B1, A2, B2, f1, f2, x, y);
      steps[0] = {
        latex: steps[0].latex,
        note: L(
          `Stel de formules op. A: $y=${f1}$. B: $y=${f2}$. Het moment dat ze even duur zijn, ligt op allebei ($\\land$ betekent **en**).`,
          `Set up the formulas. A: $y=${f1}$. B: $y=${f2}$. The moment they cost the same lies on both ($\\land$ means **and**).`,
        ),
      };
      const fee = (b: number, l: "nl" | "en") => (b === 0 ? (l === "nl" ? "geen " + plan.fixed.nl : "no " + plan.fixed.en) : l === "nl" ? `€${b} ${plan.fixed.nl}` : `a €${b} ${plan.fixed.en}`);
      return {
        prompt: L(
          `${plan.thing.nl} A kost ${fee(b1, "nl")} en €${a1} per ${plan.unit.nl}.\n${plan.thing.nl} B kost ${fee(b2, "nl")} en €${a2} per ${plan.unit.nl}.\nNoem het aantal ${plan.units.nl} $x$ en de kosten in euro $y$.\nNa hoeveel ${plan.units.nl} kosten ze evenveel? En hoeveel is dat dan?`,
          `${plan.thing.en} A costs ${fee(b1, "en")} and €${a1} per ${plan.unit.en}.\n${plan.thing.en} B costs ${fee(b2, "en")} and €${a2} per ${plan.unit.en}.\nCall the number of ${plan.units.en} $x$ and the cost in euros $y$.\nAfter how many ${plan.units.en} do they cost the same? And how much is that?`,
        ),
        visual: meetVisual(
          [
            { a: A1, b: B1 },
            { a: A2, b: B2 },
          ],
          0,
        ),
        answer: xyAnswer(x, y),
        calculator: "off",
        hints: {
          nudge: L(
            `A: $y=${f1}$. B: $y=${f2}$. Zet ze gelijk: $${f1}=${f2}$.`,
            `A: $y=${f1}$. B: $y=${f2}$. Set them equal: $${f1}=${f2}$.`,
          ),
          rule: { text: L("Vaste kosten zijn het startgetal $b$, de kosten per keer zijn $a$. Even duur: zet de formules gelijk.", "Fixed costs are the start value $b$, the cost per time is $a$. Same price: set the formulas equal."), ruleId: "u3.intersection", metaphor: "balance" },
          solution: { steps, solutions: [{ x: x.valueOf(), y: y.valueOf() }] },
        },
      };
    }

    // Shopping: two receipts.
    const shop = rng.pick(SHOPS);
    const x = F(difficulty === 1 ? rng.int(2, 5) : rng.int(6, 12));
    const y = F(difficulty === 1 ? rng.int(1, 4) : rng.int(2, 5));
    let r1: Row, r2: Row, m: [number, number];
    if (difficulty === 1) {
      const q = rng.int(1, 3);
      const p1 = rng.int(2, 4);
      const p2 = rng.int(1, p1 - 1);
      r1 = mk(p1, q, x, y);
      r2 = mk(p2, q, x, y);
      m = [1, 1];
    } else {
      const sys = eliminationSystem(rng, 3, x, y);
      r1 = sys.r1;
      r2 = sys.r2;
      m = sys.m;
    }
    const line = (r: Row, l: "nl" | "en") => {
      const p = r.p.valueOf();
      const q = r.q.valueOf();
      return l === "nl" ? `${p} ${n(p, shop.x, shop.xs).nl} en ${q} ${n(q, shop.y, shop.ys).nl}` : `${p} ${n(p, shop.x, shop.xs).en} and ${q} ${n(q, shop.y, shop.ys).en}`;
    };
    const steps = eliminationSteps(r1, r2, m[0], m[1], "sub", x, y);
    steps[0] = {
      latex: steps[0].latex,
      note: L(
        `Stel de vergelijkingen op. $x$ is de prijs van een ${shop.x.nl}, $y$ van een ${shop.y.nl}.`,
        `Set up the equations. $x$ is the price of a ${shop.x.en}, $y$ of a ${shop.y.en}.`,
      ),
    };
    return {
      prompt: L(
        `${shop.who.nl} betaal je voor ${line(r1, "nl")} samen €${frac(r1.c)}.\nVoor ${line(r2, "nl")} betaal je €${frac(r2.c)}.\nNoem de prijs van een ${shop.x.nl} $x$ en van een ${shop.y.nl} $y$ (in euro).\nBereken $x$ en $y$.`,
        `${shop.who.en} you pay €${frac(r1.c)} for ${line(r1, "en")} together.\nFor ${line(r2, "en")} you pay €${frac(r2.c)}.\nCall the price of a ${shop.x.en} $x$ and of a ${shop.y.en} $y$ (in euros).\nWork out $x$ and $y$.`,
      ),
      visual: shapeSystemVisual(shape(r1), shape(r2), m),
      answer: xyAnswer(x, y),
      calculator: "off",
      hints: {
        nudge: L(
          `Schrijf het als twee vergelijkingen: $${rowLatex(r1.p, r1.q, r1.c)}$ en $${rowLatex(r2.p, r2.q, r2.c)}$.`,
          `Write it as two equations: $${rowLatex(r1.p, r1.q, r1.c)}$ and $${rowLatex(r2.p, r2.q, r2.c)}$.`,
        ),
        rule: { text: ELIM_RULE, ruleId: "u3.elimination", metaphor: "balance" },
        solution: { steps, solutions: [{ x: x.valueOf(), y: y.valueOf() }] },
      },
    };
  },
  verify(ex) {
    // Independent check: the answer satisfies both equations from the picture.
    const pnt = answerPoint(ex);
    if (!pnt) return false;
    const rows = propsOf(ex, W.shapeSystem);
    if (rows) {
      return [rows.r1, rows.r2].every((r) => {
        const { x, y, c } = r as { x: number; y: number; c: number };
        return Math.abs(x * pnt.x + y * pnt.y - c) < 1e-9;
      });
    }
    const lines = propsOf(ex, W.meet);
    if (!lines) return false;
    return (lines.lines as Array<{ a: string; b: string }>).every((ln) => Math.abs(toNum(ln.a) * pnt.x + toNum(ln.b) - pnt.y) < 1e-9);
  },
  isNice(ex) {
    const pnt = answerPoint(ex);
    return !!pnt && Number.isInteger(pnt.x) && Number.isInteger(pnt.y) && pnt.x > 0 && pnt.y > 0;
  },
};

