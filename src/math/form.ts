/**
 * Form checks: is the answer written the way the exercise asks?
 *
 * Mathematical equivalence alone is not always enough. When the exercise says
 * "ontbind in factoren", `x^2+2x` is equal to `x(x+2)` but it is not an answer
 * to the question. These checks look at the expression *as typed*
 * (non-canonical MathJSON) to decide that.
 */
import type { MathJson } from "./cas";
import { gcd } from "./latex";

type Node = MathJson;

const isArr = (n: Node): n is Node[] => Array.isArray(n);
const head = (n: Node) => (isArr(n) ? n[0] : null);
const args = (n: Node): Node[] => (isArr(n) ? n.slice(1) : []);

/** Removes surrounding brackets: `Delimiter(x)` → `x`. */
export function unwrap(n: Node): Node {
  while (isArr(n) && n[0] === "Delimiter" && n.length === 2) n = n[1];
  return n;
}

/** Integer value of a literal like `3` or `Negate(3)`, else `null`. */
export function integerLiteral(n: Node): number | null {
  n = unwrap(n);
  if (typeof n === "number") return Number.isInteger(n) ? n : null;
  if (isArr(n) && n[0] === "Negate" && n.length === 2) {
    const inner = integerLiteral(n[1]);
    return inner === null ? null : -inner;
  }
  if (isArr(n) && n[0] === "Rational" && n[2] === 1 && typeof n[1] === "number") return n[1];
  return null;
}

/** Decimal literal (any number literal), e.g. `0.75` or `-2.5`. */
export function numberLiteral(n: Node): number | null {
  n = unwrap(n);
  if (typeof n === "number") return n;
  if (isArr(n) && n[0] === "Negate" && n.length === 2) {
    const inner = numberLiteral(n[1]);
    return inner === null ? null : -inner;
  }
  // Large or precise numbers can come back as {num: "..."}.
  if (n && typeof n === "object" && !isArr(n) && "num" in n) {
    const v = Number((n as { num: string }).num);
    return Number.isFinite(v) ? v : null;
  }
  return null;
}

/** Number of decimals in a decimal literal as typed: `2.50` → 2. */
export function decimalPlaces(latexNormalized: string): number {
  const m = latexNormalized.match(/\.(\d+)/);
  return m ? m[1].length : 0;
}

/**
 * Is this an integer or a fraction in lowest terms with a positive denominator
 * larger than 1? `3`, `\frac{1}{2}`, `-\frac{3}{4}` pass; `\frac{2}{4}`,
 * `0.5` and `\frac{4}{2}` do not.
 */
export function isSimplestFraction(n: Node): boolean {
  n = unwrap(n);
  if (integerLiteral(n) !== null) return true;
  if (isArr(n) && n[0] === "Negate") return isSimplestFraction(n[1]);
  if (isArr(n) && (n[0] === "Divide" || n[0] === "Rational") && n.length === 3) {
    const num = integerLiteral(n[1]);
    const den = integerLiteral(n[2]);
    if (num === null || den === null) return false;
    if (den <= 1) return false; // also rejects negative denominators
    return gcd(num, den) === 1;
  }
  return false;
}

/** Does the subtree contain a variable (any symbol other than constants)? */
export function hasVariable(n: Node): boolean {
  if (typeof n === "string") return !["Pi", "ExponentialE", "Nothing"].includes(n);
  if (isArr(n)) return args(n).some(hasVariable);
  return false;
}

/** Flattens a product (also implicit multiplication and negation) into factors. */
export function factorsOf(n: Node): Node[] {
  n = unwrap(n);
  const h = head(n);
  if (h === "Multiply" || h === "InvisibleOperator") return args(n).flatMap(factorsOf);
  if (h === "Negate") return factorsOf(args(n)[0]);
  return [n];
}

/**
 * Counts the non-constant factors of a product. A power with a whole-number
 * exponent counts as that many factors: `(x+1)^2` counts as 2.
 * Returns 0 when the expression is a sum at the top level.
 */
export function countVariableFactors(n: Node): number {
  const top = unwrap(n);
  const h = head(top);
  if (h === "Add" || h === "Subtract") return 0;
  let count = 0;
  for (const f of factorsOf(top)) {
    if (!hasVariable(f)) continue;
    const fu = unwrap(f);
    if (head(fu) === "Power") {
      const exp = integerLiteral(args(fu)[1]);
      if (exp !== null && exp > 1 && hasVariable(args(fu)[0])) {
        count += exp;
        continue;
      }
    }
    count += 1;
  }
  return count;
}

/** True when a product contains a bracketed sum, e.g. `2(x+3)` or `(x+1)^2`. */
export function hasUnexpandedProduct(n: Node): boolean {
  n = unwrap(n);
  const h = head(n);
  if (h === "Multiply" || h === "InvisibleOperator" || h === "Negate") {
    const fs = factorsOf(n);
    if (fs.length > 1 || h === "Negate") {
      if (fs.some((f) => ["Add", "Subtract"].includes(String(head(unwrap(f)))) && hasVariable(f))) {
        return true;
      }
    }
  }
  if (h === "Power") {
    const base = unwrap(args(n)[0]);
    if (["Add", "Subtract"].includes(String(head(base))) && hasVariable(base)) return true;
  }
  return args(n).some(hasUnexpandedProduct);
}

/** The terms of a sum, as typed: `3x - 6` → [3x, 6]. Signs are dropped. */
function termsOf(n: Node): Node[] {
  n = unwrap(n);
  const h = head(n);
  if (h === "Add" || h === "Subtract") return args(n).flatMap(termsOf);
  if (h === "Negate") return termsOf(args(n)[0]);
  return [n];
}

/** Whole-number coefficient of a term: `6x^2` → 6, `x` → 1, `7` → 7. */
function coefficientOf(t: Node): number | null {
  const lit = integerLiteral(t);
  if (lit !== null) return lit;
  let coef = 1;
  for (const f of factorsOf(t)) {
    if (hasVariable(f)) continue;
    const v = integerLiteral(f);
    if (v === null) return null; // fractions, roots, ...: no claim
    coef *= v;
  }
  return coef;
}

/**
 * True when a bracketed sum inside a product still has a common whole-number
 * factor, e.g. `x(6x+9)`: 3 can still be taken out. Used for "zo ver mogelijk
 * ontbinden" (factor completely).
 */
export function hasCommonFactorLeft(n: Node): boolean {
  for (const f of factorsOf(n)) {
    const fu = unwrap(f);
    const base = head(fu) === "Power" ? unwrap(args(fu)[0]) : fu;
    if (head(base) !== "Add" && head(base) !== "Subtract") continue;
    const coefs = termsOf(base).map(coefficientOf);
    if (coefs.some((c) => c === null)) continue;
    const g = (coefs as number[]).reduce((acc, c) => gcd(acc, c), 0);
    if (g > 1) return true;
  }
  return false;
}
