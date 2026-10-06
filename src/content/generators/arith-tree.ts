/**
 * Tiny arithmetic expression trees for "rekenvolgorde" exercises.
 *
 * A tree can be printed as LaTeX, evaluated exactly, and reduced one
 * operation at a time following the Dutch order of operations
 * (Hoe Moeten Wij Van De Onvoldoendes Afkomen). That gives us the worked
 * solution for free, with the changed part highlighted in every step.
 */
import Fraction from "fraction.js";
import { frac } from "@/math/latex";

export type Op = "+" | "-" | "*" | ":";
export type ArithNode =
  | { k: "num"; v: Fraction }
  | { k: "bin"; op: Op; l: ArithNode; r: ArithNode }
  | { k: "pow"; base: ArithNode; exp: number }
  | { k: "paren"; e: ArithNode };

export const num = (v: number | Fraction): ArithNode => ({ k: "num", v: new Fraction(v) });
export const bin = (op: Op, l: ArithNode, r: ArithNode): ArithNode => ({ k: "bin", op, l, r });
export const pow = (base: ArithNode, exp: number): ArithNode => ({ k: "pow", base, exp });
export const paren = (e: ArithNode): ArithNode => ({ k: "paren", e });

/** Exact value. Throws on division by zero so generators can never produce it. */
export function evalTree(n: ArithNode): Fraction {
  switch (n.k) {
    case "num":
      return n.v;
    case "paren":
      return evalTree(n.e);
    case "pow":
      return evalTree(n.base).pow(n.exp);
    case "bin": {
      const l = evalTree(n.l);
      const r = evalTree(n.r);
      if (n.op === "+") return l.add(r);
      if (n.op === "-") return l.sub(r);
      if (n.op === "*") return l.mul(r);
      if (r.equals(0)) throw new Error("division by zero");
      return l.div(r);
    }
  }
}

const OP_LATEX: Record<Op, string> = { "+": "+", "-": "-", "*": "\\cdot ", ":": ":" };

/**
 * LaTeX for a tree. `highlight` marks one node with `\hl{...}`. Negative
 * numbers after an operator get brackets: `3-(-2)`.
 */
export function toLatex(n: ArithNode, highlight?: ArithNode, first = true): string {
  const wrap = (s: string) => (n === highlight ? `\\hl{${s}}` : s);
  switch (n.k) {
    case "num": {
      const s = frac(n.v);
      return wrap(!first && s.startsWith("-") ? `(${s})` : s);
    }
    case "paren":
      return wrap(`(${toLatex(n.e, highlight, true)})`);
    case "pow":
      return wrap(`${toLatex(n.base, highlight, false)}^{${n.exp}}`);
    case "bin":
      return wrap(`${toLatex(n.l, highlight, first)}${OP_LATEX[n.op]}${toLatex(n.r, highlight, false)}`);
  }
}

/** Priority of an operation in the order of operations (lower = earlier). */
function priority(n: ArithNode): number {
  if (n.k === "pow") return 1;
  if (n.k === "bin" && (n.op === "*" || n.op === ":")) return 2;
  return 3;
}

/** Is this node an operation whose operands are already plain numbers? */
function isReady(n: ArithNode): boolean {
  if (n.k === "pow") return n.base.k === "num";
  if (n.k === "bin") return n.l.k === "num" && n.r.k === "num";
  return false;
}

type Candidate = { node: ArithNode; inParen: boolean; order: number };

/** Collects all ready operations, in left-to-right order. */
function candidates(n: ArithNode, inParen: boolean, out: Candidate[]): void {
  if (n.k === "num") return;
  if (n.k === "paren") return candidates(n.e, true, out);
  if (n.k === "pow") candidates(n.base, inParen, out);
  if (n.k === "bin") {
    candidates(n.l, inParen, out);
    if (isReady(n)) out.push({ node: n, inParen, order: out.length });
    candidates(n.r, inParen, out);
    return;
  }
  if (isReady(n)) out.push({ node: n, inParen, order: out.length });
}

/** The next operation to carry out according to HMWVDOA. */
export function nextOperation(root: ArithNode): ArithNode | null {
  const list: Candidate[] = [];
  candidates(root, false, list);
  if (list.length === 0) return null;
  list.sort(
    (a, b) =>
      Number(b.inParen) - Number(a.inParen) || priority(a.node) - priority(b.node) || a.order - b.order,
  );
  return list[0].node;
}

/** Replaces `target` by `replacement`, dropping brackets around a lone number. */
function replace(n: ArithNode, target: ArithNode, replacement: ArithNode): ArithNode {
  if (n === target) return replacement;
  switch (n.k) {
    case "num":
      return n;
    case "paren": {
      const inner = replace(n.e, target, replacement);
      // "(7)" becomes "7" once the inside is a single number, unless it is negative.
      if (inner.k === "num" && inner.v.compare(0) >= 0) return inner;
      return { k: "paren", e: inner };
    }
    case "pow":
      return { k: "pow", base: replace(n.base, target, replacement), exp: n.exp };
    case "bin":
      return { k: "bin", op: n.op, l: replace(n.l, target, replacement), r: replace(n.r, target, replacement) };
  }
}

/**
 * Reduces the tree one operation at a time. Each returned step is
 * `{ before, after, op }` where `after` has the new number highlighted.
 */
export function reduceSteps(root: ArithNode): Array<{ latex: string; node: ArithNode; kind: "paren" | "pow" | "muldiv" | "addsub" }> {
  const steps: Array<{ latex: string; node: ArithNode; kind: "paren" | "pow" | "muldiv" | "addsub" }> = [];
  let tree = root;
  for (let guard = 0; guard < 50; guard++) {
    const op = nextOperation(tree);
    if (!op) break;
    const list: Candidate[] = [];
    candidates(tree, false, list);
    const inParen = list.find((c) => c.node === op)?.inParen ?? false;
    const value = num(evalTree(op));
    tree = replace(tree, op, value);
    const kind = inParen ? "paren" : op.k === "pow" ? "pow" : priority(op) === 2 ? "muldiv" : "addsub";
    steps.push({ latex: toLatex(tree, value), node: tree, kind });
  }
  return steps;
}

/**
 * The classic mistake: working strictly from left to right and ignoring the
 * order of operations (brackets are still respected). Returns `null` when it
 * would hit a division by zero.
 */
export function leftToRight(n: ArithNode): Fraction | null {
  // Flatten one level of binary operations into a token list.
  const flat: Array<Fraction | Op> = [];
  const walk = (m: ArithNode): boolean => {
    if (m.k === "bin") return walk(m.l) && (flat.push(m.op), true) && walk(m.r);
    const v = m.k === "paren" ? leftToRight(m.e) : m.k === "pow" ? leftToRight(m.base)?.pow(m.exp) ?? null : m.v;
    if (v === null) return false;
    flat.push(v);
    return true;
  };
  if (!walk(n)) return null;
  let acc = flat[0] as Fraction;
  for (let i = 1; i < flat.length; i += 2) {
    const op = flat[i] as Op;
    const r = flat[i + 1] as Fraction;
    if (op === "+") acc = acc.add(r);
    else if (op === "-") acc = acc.sub(r);
    else if (op === "*") acc = acc.mul(r);
    else {
      if (r.equals(0)) return null;
      acc = acc.div(r);
    }
  }
  return acc;
}
