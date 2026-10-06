/**
 * Helpers that build clean LaTeX strings for generated exercises.
 *
 * Generators should never glue strings like `"+ -3"` together by hand; these
 * helpers take care of signs, coefficients of 1 and -1, and fractions, so the
 * output always looks like a school textbook.
 */
import Fraction from "fraction.js";

/** Greatest common divisor of two integers (always >= 0). */
export function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a;
}

/** LaTeX for an exact rational number: `3`, `-3`, `\frac{1}{2}`, `-\frac{3}{4}`. */
export function frac(value: Fraction | number): string {
  const f = new Fraction(value);
  const n = Number(f.n) * Number(f.s);
  const d = Number(f.d);
  if (d === 1) return String(n);
  return `${n < 0 ? "-" : ""}\\frac{${Math.abs(n)}}{${d}}`;
}

/** Wraps negative numbers in parentheses: `(-3)`. Useful after an operator. */
export function paren(value: Fraction | number): string {
  const s = frac(value);
  return s.startsWith("-") ? `\\left(${s}\\right)` : s;
}

/**
 * A single term `coef · v` as LaTeX, without a leading `+`.
 * `term(1, "x")` → `x`, `term(-1, "x")` → `-x`, `term(3, "x^2")` → `3x^2`.
 */
export function term(coef: Fraction | number, v = ""): string {
  const f = new Fraction(coef);
  if (v === "") return frac(f);
  if (f.equals(1)) return v;
  if (f.equals(-1)) return `-${v}`;
  return `${frac(f)}${v}`;
}

/**
 * Joins terms into a sum, skipping zero coefficients and rewriting `+ -` as `-`.
 * `sum([[1, "x^2"], [-3, "x"], [2, ""]])` → `x^2-3x+2`.
 */
export function sum(terms: Array<[Fraction | number, string]>): string {
  let out = "";
  for (const [coef, v] of terms) {
    const f = new Fraction(coef);
    if (f.equals(0)) continue;
    const t = term(f, v);
    if (out === "") out = t;
    else out += t.startsWith("-") ? t : `+${t}`;
  }
  return out === "" ? "0" : out;
}

/** Polynomial in `x` from coefficients, highest degree first. */
export function poly(coefs: Array<Fraction | number>, x = "x"): string {
  const deg = coefs.length - 1;
  return sum(
    coefs.map((c, i) => {
      const p = deg - i;
      return [c, p === 0 ? "" : p === 1 ? x : `${x}^{${p}}`] as [Fraction | number, string];
    }),
  );
}

/** Writes a number with a Dutch decimal comma for display: `2.5` → `2{,}5`. */
export function decimalLatex(value: number, locale: "nl" | "en" = "nl"): string {
  const s = String(value);
  return locale === "nl" ? s.replace(".", "{,}") : s;
}
