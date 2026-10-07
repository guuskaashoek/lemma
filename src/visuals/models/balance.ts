/**
 * Model of the balance (weegschaal) for linear equations `ax + b = cx + d`.
 *
 * The balance is the fixed metaphor for equations: whatever you do on the
 * left, you also do on the right. This file holds the pure maths; the widget
 * only draws it. Tests check that every state still has the same solution
 * and that the solving steps match the CAS.
 */
import Fraction from "fraction.js";
import { sum, term } from "@/math/latex";

/** One pan: some x-blocks and some unit blocks (negative = "minus" blocks). */
export type Pan = { x: number; ones: number };
export type BalanceState = { left: Pan; right: Pan };

export type BalanceOp =
  | { kind: "subtract-ones"; amount: number }
  | { kind: "add-ones"; amount: number }
  | { kind: "subtract-x"; amount: number }
  | { kind: "divide"; by: number }
  | { kind: "swap" };

export function initBalance(a: number, b: number, c = 0, d = 0): BalanceState {
  return { left: { x: a, ones: b }, right: { x: c, ones: d } };
}

/** Applies an operation to both pans (the balance rule). */
export function applyOp(s: BalanceState, op: BalanceOp): BalanceState {
  const both = (f: (p: Pan) => Pan) => ({ left: f(s.left), right: f(s.right) });
  switch (op.kind) {
    case "subtract-ones":
      return both((p) => ({ ...p, ones: p.ones - op.amount }));
    case "add-ones":
      return both((p) => ({ ...p, ones: p.ones + op.amount }));
    case "subtract-x":
      return both((p) => ({ ...p, x: p.x - op.amount }));
    case "divide":
      if (op.by === 0) throw new Error("cannot divide by zero");
      return both((p) => ({ x: p.x / op.by, ones: p.ones / op.by }));
    case "swap":
      return { left: s.right, right: s.left };
  }
}

/** Applies an operation to one pan only. The balance then tips. */
export function applyOneSide(s: BalanceState, side: "left" | "right", op: BalanceOp): BalanceState {
  const changed = applyOp(s, op);
  return side === "left" ? { left: changed.left, right: s.right } : { left: s.left, right: changed.right };
}

/** Weight of a pan when x has a given value. */
export const panWeight = (p: Pan, x: number) => p.x * x + p.ones;

/** -1 = left side down, 1 = right side down, 0 = level. */
export function tilt(s: BalanceState, x: number): -1 | 0 | 1 {
  const diff = panWeight(s.left, x) - panWeight(s.right, x);
  if (Math.abs(diff) < 1e-9) return 0;
  return diff > 0 ? -1 : 1;
}

const panLatex = (p: Pan) => sum([[new Fraction(p.x), "x"], [new Fraction(p.ones), ""]]);

/** `2x+3=7` for the current state. */
export function balanceLatex(s: BalanceState): string {
  return `${panLatex(s.left)}=${panLatex(s.right)}`;
}

/** The solution of the equation, or null if there is none / infinitely many. */
export function solution(s: BalanceState): Fraction | null {
  const a = s.left.x - s.right.x;
  if (a === 0) return null;
  return new Fraction(s.right.ones - s.left.ones, a);
}

/**
 * The balance method as a list of operations, ending in `x = ...`:
 * 1. remove x-blocks from the side with fewer, 2. put x on the left,
 * 3. remove the loose blocks next to x, 4. split into equal groups.
 */
export function solveOps(start: BalanceState): BalanceOp[] {
  const ops: BalanceOp[] = [];
  let s = start;
  const push = (op: BalanceOp) => {
    ops.push(op);
    s = applyOp(s, op);
  };
  const fewer = Math.min(s.left.x, s.right.x);
  if (fewer > 0) push({ kind: "subtract-x", amount: fewer });
  if (s.left.x === 0) push({ kind: "swap" });
  if (s.left.ones > 0) push({ kind: "subtract-ones", amount: s.left.ones });
  else if (s.left.ones < 0) push({ kind: "add-ones", amount: -s.left.ones });
  if (s.left.x !== 1) push({ kind: "divide", by: s.left.x });
  return ops;
}

/** Short Dutch/English description of an operation, for notes and buttons. */
export function opText(op: BalanceOp): { nl: string; en: string } {
  switch (op.kind) {
    case "subtract-ones":
      return { nl: `Haal links en rechts $${op.amount}$ weg.`, en: `Take $${op.amount}$ away on both sides.` };
    case "add-ones":
      return { nl: `Tel links en rechts $${op.amount}$ op.`, en: `Add $${op.amount}$ on both sides.` };
    case "subtract-x":
      return {
        nl: `Haal links en rechts $${term(op.amount, "x")}$ weg.`,
        en: `Take $${term(op.amount, "x")}$ away on both sides.`,
      };
    case "divide":
      return { nl: `Deel links en rechts door $${op.by}$.`, en: `Divide both sides by $${op.by}$.` };
    case "swap":
      return { nl: "Draai de balans om, zodat $x$ links staat.", en: "Turn the balance around, so $x$ is on the left." };
  }
}
