/**
 * Spoken mathematics: turns a formula into words for read-aloud.
 *
 * `x^2+2x` → nl: "x kwadraat plus 2 x", en: "x squared plus 2 x".
 *
 * We walk the expression tree *as written* (non-canonical), so the learner
 * hears exactly what is on screen. Numbers stay digits: the speech engine
 * pronounces them in the right language, including the Dutch decimal comma.
 */
import type { Locale } from "@/i18n/locale";
import { ce, type MathJson } from "./cas";
import { stripMarkup } from "./normalize";

type Words = {
  plus: string;
  minus: string;
  negative: string;
  times: string;
  dividedBy: string;
  squared: string;
  cubed: string;
  toThePower: string;
  sqrt: string;
  cbrt: string;
  root: (n: string) => string;
  open: string;
  close: string;
  equals: string;
  less: string;
  lessEq: string;
  greater: string;
  greaterEq: string;
  notEqual: string;
  or: string;
  and: string;
  abs: string;
  factorial: string;
  percent: string;
  degrees: string;
  fn: Record<string, string>;
  log: (base: string) => string;
  ordinalFraction: (num: number, den: number) => string | null;
  symbols: Record<string, string>;
};

const NL_DENOMINATORS: Record<number, [string, string]> = {
  // [singular, plural]: "een half" / "drie halven"
  2: ["half", "halven"],
  3: ["derde", "derde"],
  4: ["vierde", "vierde"],
  5: ["vijfde", "vijfde"],
  6: ["zesde", "zesde"],
  7: ["zevende", "zevende"],
  8: ["achtste", "achtste"],
  9: ["negende", "negende"],
  10: ["tiende", "tiende"],
};

const EN_DENOMINATORS: Record<number, [string, string]> = {
  2: ["half", "halves"],
  3: ["third", "thirds"],
  4: ["quarter", "quarters"],
  5: ["fifth", "fifths"],
  6: ["sixth", "sixths"],
  7: ["seventh", "sevenths"],
  8: ["eighth", "eighths"],
  9: ["ninth", "ninths"],
  10: ["tenth", "tenths"],
};

const GREEK: Record<string, string> = {
  alpha: "alfa",
  beta: "bèta",
  gamma: "gamma",
  delta: "delta",
  theta: "theta",
  lambda: "lambda",
  mu: "mu",
  sigma: "sigma",
  phi: "phi",
};

const WORDS: Record<Locale, Words> = {
  nl: {
    plus: "plus",
    minus: "min",
    negative: "min",
    times: "keer",
    dividedBy: "gedeeld door",
    squared: "kwadraat",
    cubed: "tot de derde",
    toThePower: "tot de macht",
    sqrt: "de wortel van",
    cbrt: "de derdemachtswortel van",
    root: (n) => `de ${n}e-machtswortel van`,
    open: "haakje openen",
    close: "haakje sluiten",
    equals: "is gelijk aan",
    less: "is kleiner dan",
    lessEq: "is kleiner dan of gelijk aan",
    greater: "is groter dan",
    greaterEq: "is groter dan of gelijk aan",
    notEqual: "is niet gelijk aan",
    or: "of",
    and: "en",
    abs: "de absolute waarde van",
    factorial: "faculteit",
    percent: "procent",
    degrees: "graden",
    fn: {
      Sin: "sinus",
      Cos: "cosinus",
      Tan: "tangens",
      Arcsin: "inverse sinus",
      Arccos: "inverse cosinus",
      Arctan: "inverse tangens",
      Ln: "natuurlijke logaritme van",
      Exp: "e tot de macht",
    },
    log: (base) => (base === "10" ? "log" : `${base}-log van`),
    ordinalFraction: (num, den) => {
      const d = NL_DENOMINATORS[den];
      if (!d || num < 1 || num > 20) return null;
      if (den === 2) return num === 1 ? "een half" : `${num} halven`;
      return num === 1 ? `een ${d[0]}` : `${num} ${d[1]}`;
    },
    symbols: { Pi: "pi", ExponentialE: "e", ...GREEK },
  },
  en: {
    plus: "plus",
    minus: "minus",
    negative: "minus",
    times: "times",
    dividedBy: "divided by",
    squared: "squared",
    cubed: "cubed",
    toThePower: "to the power",
    sqrt: "the square root of",
    cbrt: "the cube root of",
    root: (n) => `the ${n}th root of`,
    open: "open bracket",
    close: "close bracket",
    equals: "equals",
    less: "is less than",
    lessEq: "is less than or equal to",
    greater: "is greater than",
    greaterEq: "is greater than or equal to",
    notEqual: "is not equal to",
    or: "or",
    and: "and",
    abs: "the absolute value of",
    factorial: "factorial",
    percent: "percent",
    degrees: "degrees",
    fn: {
      Sin: "sine",
      Cos: "cosine",
      Tan: "tangent",
      Arcsin: "inverse sine",
      Arccos: "inverse cosine",
      Arctan: "inverse tangent",
      Ln: "natural log of",
      Exp: "e to the power",
    },
    log: (base) => (base === "10" ? "log" : `log base ${base} of`),
    ordinalFraction: (num, den) => {
      const d = EN_DENOMINATORS[den];
      if (!d || num < 1 || num > 20) return null;
      return num === 1 ? `one ${d[0]}` : `${num} ${d[1]}`;
    },
    symbols: { Pi: "pi", ExponentialE: "e", ...Object.fromEntries(Object.keys(GREEK).map((k) => [k, k])) },
  },
};

const isArr = (n: MathJson): n is MathJson[] => Array.isArray(n);

/** Is this node "small" enough to read without brackets? */
function isAtom(n: MathJson): boolean {
  if (typeof n === "number" || typeof n === "string") return true;
  if (isArr(n) && n[0] === "Negate") return isAtom(n[1]);
  if (isArr(n) && n[0] === "Power") return isAtom(n[1]);
  return false;
}

function speakNumber(n: number, locale: Locale): string {
  const s = String(n);
  return locale === "nl" ? s.replace(".", ",") : s;
}

/** Converts MathJSON to spoken words. */
export function speakJson(node: MathJson, locale: Locale): string {
  const w = WORDS[locale];
  const say = (n: MathJson) => speakJson(n, locale);

  if (typeof node === "number") return node < 0 ? `${w.negative} ${speakNumber(-node, locale)}` : speakNumber(node, locale);
  if (typeof node === "string") {
    if (node in w.symbols) return w.symbols[node];
    // Subscripted names such as "a_1" → "a 1".
    return node.replace(/_/g, " ");
  }
  if (!isArr(node)) {
    if (node && typeof node === "object" && "num" in node) return speakNumber(Number((node as { num: string }).num), locale);
    return "";
  }

  const [head, ...args] = node as [string, ...MathJson[]];
  const bracketed = (n: MathJson) => `${w.open}, ${say(n)}, ${w.close}`;

  switch (head) {
    case "Delimiter":
      return bracketed(args[0]);
    case "Add":
      return args
        .map((a, i) => {
          if (i > 0 && isArr(a) && a[0] === "Negate") return `${w.minus} ${say(a[1])}`;
          if (i > 0 && typeof a === "number" && a < 0) return `${w.minus} ${speakNumber(-a, locale)}`;
          return i === 0 ? say(a) : `${w.plus} ${say(a)}`;
        })
        .join(" ");
    case "Subtract":
      return `${say(args[0])} ${w.minus} ${say(args[1])}`;
    case "Negate":
      return `${w.negative} ${say(args[0])}`;
    case "Multiply":
    case "InvisibleOperator": {
      // "2x" is read as "2 x", explicit products as "times".
      const implicit =
        head === "InvisibleOperator" &&
        args.length === 2 &&
        typeof args[0] === "number" &&
        !(typeof args[1] === "number");
      return args.map(say).join(implicit ? " " : ` ${w.times} `);
    }
    case "Divide":
    case "Rational": {
      const [num, den] = args;
      if (typeof num === "number" && typeof den === "number" && Number.isInteger(num) && Number.isInteger(den)) {
        const ord = w.ordinalFraction(num, den);
        if (ord) return ord;
      }
      const left = isAtom(num) ? say(num) : `${say(num)},`;
      return `${left} ${w.dividedBy} ${isAtom(den) ? say(den) : bracketed(den)}`;
    }
    case "Power": {
      const [base, exp] = args;
      const b = isAtom(base) || (isArr(base) && base[0] === "Delimiter") ? say(base) : bracketed(base);
      if (base === "ExponentialE") return `${w.fn.Exp} ${say(exp)}`;
      if (exp === 2) return `${b} ${w.squared}`;
      if (exp === 3) return `${b} ${w.cubed}`;
      return `${b} ${w.toThePower} ${isAtom(exp) ? say(exp) : `${say(exp)},`}`;
    }
    case "Sqrt":
      return `${w.sqrt} ${isAtom(args[0]) ? say(args[0]) : `${say(args[0])},`}`;
    case "Root":
      return args[1] === 3 ? `${w.cbrt} ${say(args[0])}` : `${w.root(say(args[1]))} ${say(args[0])}`;
    case "Abs":
      return `${w.abs} ${say(args[0])}`;
    case "Factorial":
      return `${say(args[0])} ${w.factorial}`;
    case "Degrees":
      return `${say(args[0])} ${w.degrees}`;
    case "Log":
      return `${w.log(args[1] === undefined ? "10" : say(args[1]))} ${say(args[0])}`;
    case "Lb":
      return `${w.log("2")} ${say(args[0])}`;
    case "Lg":
      return `${w.log("10")} ${say(args[0])}`;
    case "Equal":
      return `${say(args[0])} ${w.equals} ${say(args[1])}`;
    case "Less":
      return `${say(args[0])} ${w.less} ${say(args[1])}`;
    case "LessEqual":
      return `${say(args[0])} ${w.lessEq} ${say(args[1])}`;
    case "Greater":
      return `${say(args[0])} ${w.greater} ${say(args[1])}`;
    case "GreaterEqual":
      return `${say(args[0])} ${w.greaterEq} ${say(args[1])}`;
    case "NotEqual":
      return `${say(args[0])} ${w.notEqual} ${say(args[1])}`;
    case "Or":
      return args.map(say).join(`, ${w.or} `);
    case "And":
      return args.map(say).join(`, ${w.and} `);
    case "Colon":
      return `${say(args[0])} ${w.dividedBy} ${say(args[1])}`;
    default:
      if (head in w.fn) return `${w.fn[head]} ${say(args[0])}`;
      return args.map(say).join(" ");
  }
}

/** Speaks a LaTeX formula. Falls back to a rough reading if parsing fails. */
export function latexToSpeech(latex: string, locale: Locale): string {
  try {
    // Percent signs are kept as words: CE would turn 5\% into 0.05.
    const pct = latex.match(/^(.*)\\%\s*$/);
    if (pct) return `${latexToSpeech(pct[1], locale)} ${WORDS[locale].percent}`;
    // Division written with ÷ or : must be read as "divided by", not as a
    // fraction ("12 : 4" is not "twelve quarters"), so keep it as a Colon.
    const prepared = stripMarkup(latex)
      .replace(/(\d)\s*\{,\}\s*(\d)/g, "$1.$2")
      .replace(/(\d),(\d)/g, "$1.$2")
      .replace(/\\div/g, ":");
    const expr = ce().parse(prepared, { form: "raw" });
    if (expr.isValid) return tidy(speakJson(expr.json as MathJson, locale));
  } catch {
    // fall through
  }
  return tidy(
    latex
      .replace(/\\[a-zA-Z]+/g, " ")
      .replace(/[{}^_]/g, " ")
      .replace(/\s+/g, " "),
  );
}

/**
 * Speaks rich text: plain words with inline formulas between `$...$`.
 * "Bereken $\frac{1}{2}+\frac{1}{4}$." → "Bereken een half plus een vierde."
 */
export function richTextToSpeech(text: string, locale: Locale): string {
  return tidy(
    text
      .split(/(\$[^$]+\$)/g)
      .map((part) => (part.startsWith("$") ? latexToSpeech(part.slice(1, -1), locale) : stripInlineMarkdown(part)))
      .join(""),
  );
}

/** Removes markdown emphasis characters so they are not read aloud. */
function stripInlineMarkdown(s: string): string {
  return s.replace(/\*\*|__|\*|`/g, "");
}

function tidy(s: string): string {
  return s.replace(/\s+/g, " ").replace(/\s+,/g, ",").replace(/,\s*,/g, ",").trim();
}
