/**
 * Model behind the "tap the next operation" widget: reads the LaTeX of a
 * simple sum back into an arithmetic tree and applies one operation.
 * Pure functions, so they are tested in `tests/units/u00-widgets.test.ts`.
 */
import { bin, evalTree, nextOperation, num, paren, pow, type ArithNode, type Op } from "@/content/shared/arith-tree";

/**
 * Parses the LaTeX that `toLatex` prints: whole numbers, `+ - \cdot :`,
 * brackets and powers `^{n}`. Returns null for anything else.
 */
export function parseSum(latex: string): ArithNode | null {
  const src = latex.replace(/\\cdot\s*/g, "*").replace(/\\left|\\right|\s+/g, "");
  let i = 0;
  const peek = () => src[i];

  function atom(): ArithNode | null {
    let node: ArithNode | null;
    if (peek() === "(") {
      i++;
      const inner = expr();
      if (!inner || src[i] !== ")") return null;
      i++;
      // "(-3)" is a negative number, not a bracket group.
      node = inner.k === "num" && inner.v.compare(0) < 0 ? inner : paren(inner);
    } else {
      const m = src.slice(i).match(/^-?\d+/);
      if (!m) return null;
      i += m[0].length;
      node = num(Number(m[0]));
    }
    const p = src.slice(i).match(/^\^\{?(\d+)\}?/);
    if (p) {
      i += p[0].length;
      node = pow(node, Number(p[1]));
    }
    return node;
  }

  function term(): ArithNode | null {
    let left = atom();
    while (left && (peek() === "*" || peek() === ":")) {
      const op = peek() as Op;
      i++;
      const right = atom();
      if (!right) return null;
      left = bin(op, left, right);
    }
    return left;
  }

  function expr(): ArithNode | null {
    let left = term();
    while (left && (peek() === "+" || peek() === "-")) {
      const op = peek() as Op;
      i++;
      const right = term();
      if (!right) return null;
      left = bin(op, left, right);
    }
    return left;
  }

  const tree = expr();
  return tree && i === src.length ? tree : null;
}

/** Replaces `target` by its value. Brackets around a single positive number disappear. */
export function applyOperation(tree: ArithNode, target: ArithNode): { tree: ArithNode; result: ArithNode } {
  const result = num(evalTree(target));
  const walk = (n: ArithNode): ArithNode => {
    if (n === target) return result;
    switch (n.k) {
      case "num":
        return n;
      case "paren": {
        const inner = walk(n.e);
        return inner.k === "num" && inner.v.compare(0) >= 0 ? inner : { k: "paren", e: inner };
      }
      case "pow":
        return { k: "pow", base: walk(n.base), exp: n.exp };
      case "bin":
        return { k: "bin", op: n.op, l: walk(n.l), r: walk(n.r) };
    }
  };
  return { tree: walk(tree), result };
}

/** Is `target` inside a bracket group of `tree`? */
function insideParen(tree: ArithNode, target: ArithNode, inParen = false): boolean | null {
  if (tree === target) return inParen;
  switch (tree.k) {
    case "num":
      return null;
    case "paren":
      return insideParen(tree.e, target, true);
    case "pow":
      return insideParen(tree.base, target, inParen);
    case "bin":
      return insideParen(tree.l, target, inParen) ?? insideParen(tree.r, target, inParen);
  }
}

export type TapVerdict = "ok" | "brackets" | "power" | "muldiv" | "left-to-right";

/** Is tapping `target` right? If not, which rule says so? */
export function judgeTap(tree: ArithNode, target: ArithNode): TapVerdict {
  const first = nextOperation(tree);
  if (!first || first === target) return "ok";
  if (insideParen(tree, first)) return "brackets";
  if (first.k === "pow") return "power";
  if (first.k === "bin" && (first.op === "*" || first.op === ":") && target.k === "bin" && (target.op === "+" || target.op === "-")) {
    return "muldiv";
  }
  return "left-to-right";
}
