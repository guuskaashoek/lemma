/**
 * Worked steps shared by the intersection and system generators.
 *
 * A system is written as one relation with `\land` ("and"), so every step
 * stays equivalent to the one before and the CAS can check it.
 */
import Fraction from "fraction.js";
import { evaluate, parse } from "@/math/cas";
import { frac, paren, sum, term } from "@/math/latex";
import { stripMarkup } from "@/math/normalize";
import type { Loc, Step } from "@/content/types";
import { L, lin, signed } from "../helpers";

/** A coefficient in front of a filled-in value: `3\cdot`, nothing for 1, `-` for -1. */
function coef(p: Fraction): string {
  if (p.equals(1)) return "";
  if (p.equals(-1)) return "-";
  return `${frac(p)}\\cdot`;
}

/** The intersection of `y = a1 x + b1` and `y = a2 x + b2` (lines not parallel). */
export function meetPoint(a1: Fraction, b1: Fraction, a2: Fraction, b2: Fraction): { x: Fraction; y: Fraction } {
  const x = b2.sub(b1).div(a1.sub(a2));
  return { x, y: a1.mul(x).add(b1) };
}

/** The solution of the system `p1 x + q1 y = c1`, `p2 x + q2 y = c2` (Cramer's rule). */
export function solveRows(r1: Row, r2: Row): { x: Fraction; y: Fraction } {
  const det = r1.p.mul(r2.q).sub(r1.q.mul(r2.p));
  return {
    x: r1.c.mul(r2.q).sub(r1.q.mul(r2.c)).div(det),
    y: r1.p.mul(r2.c).sub(r1.c.mul(r2.p)).div(det),
  };
}

/** `px + qy = c` in LaTeX. */
export function rowLatex(p: Fraction, q: Fraction, c: Fraction): string {
  return `${sum([
    [p, "x"],
    [q, "y"],
  ])}=${frac(c)}`;
}

/** "Haal links en rechts 3 weg" / "Tel links en rechts 3 op" for removing `v` from a side. */
export function removeNote(v: Fraction, what = ""): Loc {
  const shown = what || frac(v.abs());
  return v.s < 0
    ? L(`Balans: tel links en rechts $${shown}$ op.`, `Balance: add $${shown}$ on both sides.`)
    : L(`Balans: haal links en rechts $${shown}$ weg.`, `Balance: subtract $${shown}$ on both sides.`);
}

/**
 * Steps that solve `kx + d = e` for x, each wrapped (e.g. `y=... \land <step>`).
 * The first step (the equation itself) is not included.
 */
export function solveLinearSteps(k: Fraction, d: Fraction, e: Fraction, v: "x" | "y", wrap: (s: string) => string): Step[] {
  const steps: Step[] = [];
  const rhs = e.sub(d);
  if (!d.equals(0)) {
    steps.push({ latex: wrap(`${term(k, v)}=\\ask{${frac(rhs)}}`), note: removeNote(d) });
  }
  if (!k.equals(1)) {
    steps.push({
      latex: wrap(`${v}=\\ask{${frac(rhs.div(k))}}`),
      note: L(`Balans: deel links en rechts door $${frac(k)}$.`, `Balance: divide both sides by $${frac(k)}$.`),
    });
  }
  return steps;
}

/** Does every equation in the list hold at the point? (CAS, for `verify`.) */
export function equationsHold(equations: string[], point: Record<string, number>): boolean {
  return equations.every((eq) => {
    const [lhs, rhs] = stripMarkup(eq).split("=");
    if (rhs === undefined) return false;
    const v = evaluate(parse(`(${lhs})-(${rhs})`), point);
    return v !== null && Math.abs(v) < 1e-9;
  });
}

/** The equations of a system shown as `\text{I: }... \qquad \text{II: }...`. */
export function systemLatex(eq1: string, eq2: string): string {
  return `\\text{I: }${eq1}\\qquad\\text{II: }${eq2}`;
}

/** The two equations back out of `systemLatex` (for `verify`). */
export function systemEquations(latex: string): string[] {
  return latex
    .split("\\qquad")
    .map((s) => s.replace(/\\text\{[^}]*\}/g, "").trim())
    .filter(Boolean);
}

export type Row = { p: Fraction; q: Fraction; c: Fraction };

/** Highlight a row only when it was multiplied (changed). */
const mark = (m: number, latex: string) => (m === 1 ? latex : `\\hl{${latex}}`);

/**
 * Elimination: rows I and II, optional multipliers, then I − II or I + II so
 * y drops out. Then x, then x back into row II for y.
 */
export function eliminationSteps(r1: Row, r2: Row, m1: number, m2: number, op: "add" | "sub", x: Fraction, y: Fraction): Step[] {
  const s1 = { p: r1.p.mul(m1), q: r1.q.mul(m1), c: r1.c.mul(m1) };
  const s2 = { p: r2.p.mul(m2), q: r2.q.mul(m2), c: r2.c.mul(m2) };
  const sign = op === "add" ? 1 : -1;
  const k = s1.p.add(s2.p.mul(sign));
  const c = s1.c.add(s2.c.mul(sign));
  const row2 = rowLatex(r2.p, r2.q, r2.c);
  const steps: Step[] = [{ latex: `${rowLatex(r1.p, r1.q, r1.c)}\\land ${row2}`, note: L("Dit is het stelsel: vergelijking I en vergelijking II.", "This is the system: equation I and equation II.") }];
  if (m1 !== 1 || m2 !== 1) {
    const parts: Loc[] = [];
    if (m1 !== 1) parts.push(L(`I keer $${m1}$`, `I times $${m1}$`));
    if (m2 !== 1) parts.push(L(`II keer $${m2}$`, `II times $${m2}$`));
    steps.push({
      latex: `${mark(m1, rowLatex(s1.p, s1.q, s1.c))}\\land ${mark(m2, rowLatex(s2.p, s2.q, s2.c))}`,
      note: L(
        `Maak het aantal $y$ gelijk: ${parts.map((q) => q.nl).join(" en ")}. Alles in de rij keer hetzelfde getal.`,
        `Make the number of $y$ the same: ${parts.map((q) => q.en).join(" and ")}. Everything in the row times the same number.`,
      ),
    });
  }
  steps.push({
    latex: `${term(k, "x")}=\\ask{${frac(c)}}\\land ${row2}`,
    note:
      op === "sub"
        ? L("I min II: links min links, rechts min rechts. De $y$ valt weg.", "I minus II: left minus left, right minus right. The $y$ drops out.")
        : L("I plus II: links plus links, rechts plus rechts. De $y$ valt weg.", "I plus II: left plus left, right plus right. The $y$ drops out."),
  });
  if (!k.equals(1)) {
    steps.push({ latex: `x=\\ask{${frac(x)}}\\land ${row2}`, note: L(`Balans: deel links en rechts door $${frac(k)}$.`, `Balance: divide both sides by $${frac(k)}$.`) });
  }
  steps.push({
    latex: `x=${frac(x)}\\land ${coef(r2.p)}\\hl{${paren(x)}}${r2.q.s < 0 ? "-" : "+"}${term(r2.q.abs(), "y")}=${frac(r2.c)}`,
    note: L(`Vul $x=${frac(x)}$ in bij II.`, `Put $x=${frac(x)}$ into II.`),
  });
  const px = r2.p.mul(x);
  const wrap = (t: string) => `x=${frac(x)}\\land ${t}`;
  if (px.equals(0)) {
    // x = 0: the x-term drops out. Show that step, then divide if needed.
    const zero = L(`$${frac(r2.p)}\\cdot 0=0$, dus die valt weg.`, `$${frac(r2.p)}\\cdot 0=0$, so it drops out.`);
    if (r2.q.equals(1)) {
      steps.push({ latex: wrap(`y=\\ask{${frac(y)}}`), note: zero });
    } else {
      steps.push({ latex: wrap(`${term(r2.q, "y")}=${frac(r2.c)}`), note: zero });
      for (const s of solveLinearSteps(r2.q, px, r2.c, "y", wrap)) steps.push(s);
    }
  } else {
    for (const s of solveLinearSteps(r2.q, px, r2.c, "y", wrap)) steps.push(s);
  }
  return steps;
}

/**
 * Substitution: I gives one letter (`iso = f(other)`); put it into II.
 * `f` is `a·other + b`.
 */
export function substitutionSteps(
  iso: "x" | "y",
  a: Fraction,
  b: Fraction,
  r2: Row,
  x: Fraction,
  y: Fraction,
): Step[] {
  const oth = iso === "y" ? "x" : "y";
  const f = sum([
    [a, oth],
    [b, ""],
  ]);
  const eq1 = `${iso}=${f}`;
  const row2 = rowLatex(r2.p, r2.q, r2.c);
  // Coefficients in II of the isolated letter (ci) and the other letter (co).
  const ci = iso === "y" ? r2.q : r2.p;
  const co = iso === "y" ? r2.p : r2.q;
  const other = iso === "y" ? x : y;
  const isoVal = iso === "y" ? y : x;
  const k = co.add(ci.mul(a));
  const d = ci.mul(b);
  const otherTerm = term(co, oth);
  const isoPart = `${ci.equals(1) ? "" : ci.equals(-1) ? "-" : `${frac(ci)}\\cdot`}\\hl{(${f})}`;
  const subst = iso === "y" ? `${otherTerm}${isoPart.startsWith("-") ? "" : "+"}${isoPart}` : `${isoPart}${co.s < 0 ? "" : "+"}${otherTerm}`;
  const steps: Step[] = [
    { latex: `${eq1}\\land ${row2}`, note: L(`Dit is het stelsel. In I staat al $${iso}=\\ldots$`, `This is the system. I already says $${iso}=\\ldots$`) },
    {
      latex: `${eq1}\\land ${subst}=${frac(r2.c)}`,
      note: L(`Vul I in bij II: op de plek van $${iso}$ komt $(${f})$.`, `Put I into II: $(${f})$ goes in place of $${iso}$.`),
    },
    {
      latex: `${eq1}\\land \\ask{${sum([
        [k, oth],
        [d, ""],
      ])}}=${frac(r2.c)}`,
      note: L("Haakjes wegwerken en de letters samennemen.", "Expand the brackets and combine the letters."),
    },
  ];
  for (const s of solveLinearSteps(k, d, r2.c, oth, (t) => `${eq1}\\land ${t}`)) steps.push(s);
  steps.push({
    latex: `${iso}=${frac(a)}\\cdot\\hl{${paren(other)}}${signed(b)}\\land ${oth}=${frac(other)}`,
    note: L(`Vul $${oth}=${frac(other)}$ in bij I.`, `Put $${oth}=${frac(other)}$ into I.`),
  });
  steps.push({ latex: `${iso}=\\ask{${frac(isoVal)}}\\land ${oth}=${frac(other)}`, note: L("Reken uit.", "Work it out.") });
  return steps;
}

/**
 * Intersection of y = a1 x + b1 and y = a2 x + b2: set equal, solve x, then y.
 * Written as a system with `\land`.
 */
export function intersectionSteps(a1: Fraction, b1: Fraction, a2: Fraction, b2: Fraction, f1: string, f2: string, x: Fraction, y: Fraction): Step[] {
  const eq1 = `y=${f1}`;
  const steps: Step[] = [
    { latex: `${eq1}\\land y=${f2}`, note: L("Twee lijnen. Het snijpunt ligt op allebei ($\\land$ betekent **en**).", "Two lines. The intersection lies on both ($\\land$ means **and**).") },
    { latex: `${eq1}\\land ${f1}=${f2}`, note: L("Op het snijpunt is $y$ even groot: zet de formules gelijk.", "At the intersection $y$ is the same: set the formulas equal.") },
    ...equalSidesSteps(a1, b1, a2, b2, (s) => `${eq1}\\land ${s}`),
    {
      latex: `y=${frac(a1)}\\cdot\\hl{${paren(x)}}${signed(b1)}\\land x=${frac(x)}`,
      note: L(`Vul $x=${frac(x)}$ in bij de eerste formule.`, `Put $x=${frac(x)}$ into the first formula.`),
    },
    { latex: `y=\\ask{${frac(y)}}\\land x=${frac(x)}`, note: L("Reken uit.", "Work it out.") },
  ];
  return steps;
}

/**
 * Balance steps for `a1 x + b1 = a2 x + b2` (after the equation itself).
 * The x-terms go to the side with the bigger coefficient, so the number of
 * x stays positive.
 */
export function equalSidesSteps(a1: Fraction, b1: Fraction, a2: Fraction, b2: Fraction, wrap: (s: string) => string): Step[] {
  // Keep x on the left: subtract a2 x on both sides (k = a1 - a2).
  let k = a1.sub(a2);
  let d = b1;
  let e = b2;
  let note = a2.equals(0)
    ? null
    : a2.s < 0
      ? L(`Balans: tel links en rechts $${term(a2.abs(), "x")}$ op.`, `Balance: add $${term(a2.abs(), "x")}$ on both sides.`)
      : L(`Balans: haal links en rechts $${term(a2, "x")}$ weg.`, `Balance: subtract $${term(a2, "x")}$ on both sides.`);
  let first: string | null = note ? `${lin(k, d)}=${frac(e)}` : null;
  if (k.s < 0) {
    // Put the x-terms on the right instead, then turn the equation around.
    k = a2.sub(a1);
    d = b2;
    e = b1;
    note = a1.equals(0)
      ? null
      : a1.s < 0
        ? L(`Balans: tel links en rechts $${term(a1.abs(), "x")}$ op.`, `Balance: add $${term(a1.abs(), "x")}$ on both sides.`)
        : L(`Balans: haal links en rechts $${term(a1, "x")}$ weg.`, `Balance: subtract $${term(a1, "x")}$ on both sides.`);
    first = `${frac(e)}=${lin(k, d)}`;
    const steps: Step[] = [];
    if (note) steps.push({ latex: wrap(first), note });
    steps.push({ latex: wrap(`${lin(k, d)}=${frac(e)}`), note: L("Draai de vergelijking om: $x$ links.", "Turn the equation around: $x$ on the left.") });
    return [...steps, ...solveLinearSteps(k, d, e, "x", wrap)];
  }
  const steps: Step[] = [];
  if (note && first) steps.push({ latex: wrap(first), note });
  return [...steps, ...solveLinearSteps(k, d, e, "x", wrap)];
}


// ---------------------------------------------------------------------------
// Worked examples for lessons and rule cards: the answer is computed, never typed.
// ---------------------------------------------------------------------------

const num = (v: Fraction) => v.valueOf();

/** Intersection of `y = a1 x + b1` and `y = a2 x + b2` as a worked example. */
export function intersectionExample(a1: Fraction, b1: Fraction, a2: Fraction, b2: Fraction) {
  const { x, y } = meetPoint(a1, b1, a2, b2);
  return { steps: intersectionSteps(a1, b1, a2, b2, lin(a1, b1), lin(a2, b2), x, y), solutions: [{ x: num(x), y: num(y) }] };
}

/** A system by elimination as a worked example. */
export function eliminationExample(r1: Row, r2: Row, m1: number, m2: number, op: "add" | "sub") {
  const { x, y } = solveRows(r1, r2);
  return { steps: eliminationSteps(r1, r2, m1, m2, op, x, y), solutions: [{ x: num(x), y: num(y) }] };
}

/** The system `y = a x + b`, row II, by substitution as a worked example. */
export function substitutionExample(a: Fraction, b: Fraction, r2: Row) {
  const { x, y } = solveRows({ p: a.neg(), q: new Fraction(1), c: b }, r2);
  return { steps: substitutionSteps("y", a, b, r2, x, y), solutions: [{ x: num(x), y: num(y) }] };
}
