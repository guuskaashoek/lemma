/**
 * Scientific calculator engine.
 *
 * A small, predictable expression evaluator that behaves like a school
 * calculator (Casio/TI):
 *
 * - Precedence: brackets, powers, (implicit) multiplication/division, then
 *   addition/subtraction. `-2^2` is `-4`, like on a school calculator.
 * - Implicit multiplication: `2π`, `3(4+1)`, `2sin(30)`.
 * - Degrees or radians for sin/cos/tan and their inverses.
 * - Dutch decimal comma or point; `:` and `÷` divide; `×` and `·` multiply.
 * - `ans` is the previous answer.
 *
 * It deliberately does not use the CAS: the calculator must give plain numbers,
 * fast, with clear error messages.
 */

export type AngleMode = "deg" | "rad";

export type CalcErrorCode = "syntax" | "divide-by-zero" | "domain" | "overflow" | "empty";

export class CalcError extends Error {
  constructor(public code: CalcErrorCode) {
    super(code);
  }
}

type Token =
  | { t: "num"; v: number }
  | { t: "op"; v: "+" | "-" | "*" | "/" | "^" }
  | { t: "lp" }
  | { t: "rp" }
  | { t: "fn"; v: FnName }
  | { t: "const"; v: "pi" | "e" | "ans" }
  | { t: "post"; v: "!" | "%" | "²" };

const FUNCTIONS = ["asin", "acos", "atan", "sin", "cos", "tan", "sqrt", "cbrt", "log", "ln", "abs"] as const;
type FnName = (typeof FUNCTIONS)[number];

/** Splits the input into tokens. */
export function tokenize(input: string): Token[] {
  const s = input
    .replace(/\s+/g, "")
    .replace(/[×·*]/g, "*")
    .replace(/[÷:]/g, "/")
    .replace(/[−–]/g, "-")
    .replace(/π/g, "pi")
    .replace(/√/g, "sqrt")
    .replace(/∛/g, "cbrt")
    .replace(/sin⁻¹/g, "asin")
    .replace(/cos⁻¹/g, "acos")
    .replace(/tan⁻¹/g, "atan")
    .toLowerCase();

  const tokens: Token[] = [];
  let i = 0;
  while (i < s.length) {
    const rest = s.slice(i);
    const num = rest.match(/^(\d+([.,]\d*)?|[.,]\d+)(e[+-]?\d+)?/);
    if (num) {
      tokens.push({ t: "num", v: Number(num[0].replace(",", ".")) });
      i += num[0].length;
      continue;
    }
    const fn = FUNCTIONS.find((f) => rest.startsWith(f));
    if (fn) {
      tokens.push({ t: "fn", v: fn });
      i += fn.length;
      continue;
    }
    if (rest.startsWith("pi")) {
      tokens.push({ t: "const", v: "pi" });
      i += 2;
      continue;
    }
    if (rest.startsWith("ans")) {
      tokens.push({ t: "const", v: "ans" });
      i += 3;
      continue;
    }
    const ch = s[i];
    if (ch === "e") tokens.push({ t: "const", v: "e" });
    else if ("+-*/^".includes(ch)) tokens.push({ t: "op", v: ch as "+" });
    else if (ch === "(") tokens.push({ t: "lp" });
    else if (ch === ")") tokens.push({ t: "rp" });
    else if (ch === "!" || ch === "%" || ch === "²") tokens.push({ t: "post", v: ch });
    else throw new CalcError("syntax");
    i++;
  }
  return tokens;
}

/** Can a value end here (so a following value means implicit multiplication)? */
const endsValue = (t?: Token) => !!t && (t.t === "num" || t.t === "const" || t.t === "rp" || t.t === "post");
const startsValue = (t?: Token) => !!t && (t.t === "num" || t.t === "const" || t.t === "lp" || t.t === "fn");

/**
 * Evaluates an expression. Throws `CalcError` with a code the UI translates
 * into a friendly message.
 */
export function evaluate(input: string, opts: { angle: AngleMode; ans?: number }): number {
  const raw = tokenize(input);
  if (raw.length === 0) throw new CalcError("empty");

  // Insert implicit multiplication: 2π, 3(4), (1)(2), 2sin(30).
  const tokens: Token[] = [];
  for (const tok of raw) {
    if (endsValue(tokens[tokens.length - 1]) && startsValue(tok)) tokens.push({ t: "op", v: "*" });
    tokens.push(tok);
  }

  let pos = 0;
  const peek = () => tokens[pos];
  const toRad = (x: number) => (opts.angle === "deg" ? (x * Math.PI) / 180 : x);
  const fromRad = (x: number) => (opts.angle === "deg" ? (x * 180) / Math.PI : x);

  // expr := term (('+'|'-') term)*
  function expr(): number {
    let v = term();
    for (let t = peek(); t && t.t === "op" && (t.v === "+" || t.v === "-"); t = peek()) {
      pos++;
      v = t.v === "+" ? v + term() : v - term();
    }
    return v;
  }

  // term := unary (('*'|'/') unary)*
  function term(): number {
    let v = unary();
    for (let t = peek(); t && t.t === "op" && (t.v === "*" || t.v === "/"); t = peek()) {
      pos++;
      const r = unary();
      if (t.v === "/") {
        if (r === 0) throw new CalcError("divide-by-zero");
        v = v / r;
      } else v = v * r;
    }
    return v;
  }

  // unary := ('-'|'+') unary | power   (so -2^2 = -(2^2) = -4)
  function unary(): number {
    const t = peek();
    if (t && t.t === "op" && (t.v === "-" || t.v === "+")) {
      pos++;
      const v = unary();
      return t.v === "-" ? -v : v;
    }
    return power();
  }

  // power := postfix ('^' unary)?   (right-associative: 2^3^2 = 2^9)
  function power(): number {
    const base = postfix();
    const t = peek();
    if (t && t.t === "op" && t.v === "^") {
      pos++;
      const exp = unary();
      const v = Math.pow(base, exp);
      if (Number.isNaN(v)) throw new CalcError("domain");
      return v;
    }
    return base;
  }

  // postfix := primary ('!' | '%' | '²')*
  function postfix(): number {
    let v = primary();
    for (let t = peek(); t && t.t === "post"; t = peek()) {
      pos++;
      if (t.v === "%") v = v / 100;
      else if (t.v === "²") v = v * v;
      else v = factorial(v);
    }
    return v;
  }

  function primary(): number {
    const t = tokens[pos++];
    if (!t) throw new CalcError("syntax");
    switch (t.t) {
      case "num":
        return t.v;
      case "const":
        if (t.v === "pi") return Math.PI;
        if (t.v === "e") return Math.E;
        if (opts.ans === undefined) throw new CalcError("syntax");
        return opts.ans;
      case "lp": {
        const v = expr();
        // A missing closing bracket at the very end is forgiven, like on most calculators.
        if (peek()?.t === "rp") pos++;
        else if (pos < tokens.length) throw new CalcError("syntax");
        return v;
      }
      case "fn": {
        // Functions take a bracketed argument or a single value: sin(30), sin 30, √9.
        const arg = peek()?.t === "lp" ? primary() : postfix();
        return applyFn(t.v, arg);
      }
      default:
        throw new CalcError("syntax");
    }
  }

  function applyFn(fn: FnName, x: number): number {
    switch (fn) {
      case "sin":
        return cleanTrig(Math.sin(toRad(x)));
      case "cos":
        return cleanTrig(Math.cos(toRad(x)));
      case "tan": {
        const c = Math.cos(toRad(x));
        if (Math.abs(c) < 1e-12) throw new CalcError("domain");
        return cleanTrig(Math.tan(toRad(x)));
      }
      case "asin":
        if (x < -1 || x > 1) throw new CalcError("domain");
        return fromRad(Math.asin(x));
      case "acos":
        if (x < -1 || x > 1) throw new CalcError("domain");
        return fromRad(Math.acos(x));
      case "atan":
        return fromRad(Math.atan(x));
      case "sqrt":
        if (x < 0) throw new CalcError("domain");
        return Math.sqrt(x);
      case "cbrt":
        return Math.cbrt(x);
      case "log":
        if (x <= 0) throw new CalcError("domain");
        return Math.log10(x);
      case "ln":
        if (x <= 0) throw new CalcError("domain");
        return Math.log(x);
      case "abs":
        return Math.abs(x);
    }
  }

  const value = expr();
  if (pos !== tokens.length) throw new CalcError("syntax");
  if (!Number.isFinite(value)) throw new CalcError(Number.isNaN(value) ? "domain" : "overflow");
  return value;
}

/** Removes floating-point noise so sin(30°) gives exactly 0.5. */
function cleanTrig(v: number): number {
  const r = Math.round(v * 1e12) / 1e12;
  return Math.abs(r - v) < 1e-14 ? r : v;
}

function factorial(n: number): number {
  if (!Number.isInteger(n) || n < 0) throw new CalcError("domain");
  if (n > 170) throw new CalcError("overflow");
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

/**
 * Formats a result for display: at most 10 significant digits, no
 * floating-point noise, Dutch decimal comma when requested.
 */
export function formatResult(value: number, locale: "nl" | "en"): string {
  let s: string;
  if (value !== 0 && (Math.abs(value) >= 1e10 || Math.abs(value) < 1e-6)) {
    const [mant, exp] = value.toExponential(9).split("e");
    s = `${String(Number(mant))}·10^${Number(exp)}`;
  } else {
    s = String(Number(value.toPrecision(10)));
  }
  return locale === "nl" ? s.replace(".", ",") : s;
}
