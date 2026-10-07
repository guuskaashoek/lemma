/**
 * Lessons 7 and 8 generators: the rules for powers (rekenregels voor
 * machten), the power of a product, and zero and negative exponents.
 *
 * "Write as one power" exercises ask only for the exponent (the box in
 * `a^□`). That way the learner cannot simply copy the question, and the
 * typical mistakes (multiplying instead of adding, ...) can be recognised.
 */
import Fraction from "fraction.js";
import type { Generator, Loc, Step } from "@/content/types";
import type { Mistake } from "@/math/check";
import { frac, gcd } from "@/math/latex";
import type { Rng } from "@/math/random";
import type { VisualSpec } from "@/visuals/types";
import { cleanMistakes, custom, L, subLetter, valueOf } from "../helpers";
import { powerSteps } from "./powers";

/** Bases: letters and small numbers. */
const BASES = ["a", "x", "p", "2", "3", "5", "10"];
const LETTERS = ["a", "b", "x", "y"];

const pw = (base: string, n: number | string) => `${base}^{${n}}`;
/** Like `pw`, but a bare letter for exponent 1: `x` instead of `x^{1}`. */
const pw1 = (base: string, n: number) => (n === 1 ? base : pw(base, n));

/**
 * Two exponents where the typical mistake gives a different answer.
 * With 2 and 2, adding and multiplying both give 4, so the mistake
 * "multiplied instead of added" (or the other way round) cannot be seen.
 */
function pair(rng: Rng, lo1: number, hi1: number, lo2: number, hi2: number): [number, number] {
  for (;;) {
    const [p, q] = [rng.int(lo1, hi1), rng.int(lo2, hi2)];
    if (!(p === 2 && q === 2)) return [p, q];
  }
}

/** The factor-chain widget. Tokens are single letters or numbers. */
export function chain(props: Record<string, unknown>, describe: Loc): VisualSpec {
  return custom("u1.factor-chain", props, describe);
}

const tokens = (base: string, n: number) => Array<string>(n).fill(base);

const RULES = {
  product: {
    text: L(
      "Keer: zelfde grondtal, tel de exponenten op. $a^{p}\\cdot a^{q}=a^{p+q}$. Je plakt de rijtjes aan elkaar.",
      "Multiply: same base, add the exponents. $a^{p}\\cdot a^{q}=a^{p+q}$. You glue the rows together.",
    ),
    ruleId: "u1.product-rule",
  },
  quotient: {
    text: L(
      "Delen: zelfde grondtal, trek de exponenten af. $\\frac{a^{p}}{a^{q}}=a^{p-q}$. Boven en onder vallen er even veel weg.",
      "Divide: same base, subtract the exponents. $\\frac{a^{p}}{a^{q}}=a^{p-q}$. The same number cancel at the top and the bottom.",
    ),
    ruleId: "u1.quotient-rule",
  },
  power: {
    text: L(
      "Macht van een macht: vermenigvuldig de exponenten. $(a^{p})^{q}=a^{p\\cdot q}$. Je neemt het rijtje $q$ keer.",
      "Power of a power: multiply the exponents. $(a^{p})^{q}=a^{p\\cdot q}$. You take the row $q$ times.",
    ),
    ruleId: "u1.power-of-power",
  },
};

type Kind = keyof typeof RULES;

/** One rule applied to base^p and q. */
function single(kind: Kind, base: string, p: number, q: number) {
  const latex =
    kind === "product" ? `${pw(base, p)}\\cdot ${pw(base, q)}` : kind === "quotient" ? `\\frac{${pw(base, p)}}{${pw(base, q)}}` : `(${pw(base, p)})^{${q}}`;
  const n = kind === "product" ? p + q : kind === "quotient" ? p - q : p * q;
  const op = kind === "product" ? "+" : kind === "quotient" ? "-" : "\\cdot ";
  const steps: Step[] = [
    {
      latex: `${p}${op}${q}`,
      note:
        kind === "product"
          ? L(`Zelfde grondtal $${base}$, keer: tel de exponenten op.`, `Same base $${base}$, multiply: add the exponents.`)
          : kind === "quotient"
            ? L(`Zelfde grondtal $${base}$, delen: trek de exponenten af.`, `Same base $${base}$, divide: subtract the exponents.`)
            : L("Macht van een macht: vermenigvuldig de exponenten.", "Power of a power: multiply the exponents."),
    },
    { latex: `\\ask{${n}}`, note: L(`Dus $${latex}=${pw(base, n)}$.`, `So $${latex}=${pw(base, n)}$.`) },
  ];
  const nudge =
    kind === "product"
      ? L(
          `$${pw(base, p)}$ is $${p}$ keer $${base}$, en $${pw(base, q)}$ is $${q}$ keer $${base}$. Hoeveel keer $${base}$ is dat samen?`,
          `$${pw(base, p)}$ is $${base}$ $${p}$ times, and $${pw(base, q)}$ is $${base}$ $${q}$ times. How many times $${base}$ is that together?`,
        )
      : kind === "quotient"
        ? L(
            `Boven staat $${p}$ keer $${base}$, onder $${q}$ keer. Streep er boven en onder $${q}$ weg. Hoeveel blijven er over?`,
            `On top there are $${p}$ times $${base}$, below $${q}$ times. Cross out $${q}$ on top and below. How many are left?`,
          )
        : L(
            `$(${pw(base, p)})^{${q}}$ is $${q}$ keer het rijtje $${pw(base, p)}$. Hoeveel keer $${base}$ is dat?`,
            `$(${pw(base, p)})^{${q}}$ is $${q}$ times the row $${pw(base, p)}$. How many times $${base}$ is that?`,
          );
  const mistakes: Mistake[] =
    kind === "product"
      ? [
          {
            id: "multiplied",
            latex: String(p * q),
            explain: L(
              `Je deed de exponenten keer. Bij keer tel je ze op: $${p}+${q}$.`,
              `You multiplied the exponents. When multiplying powers you add them: $${p}+${q}$.`,
            ),
          },
        ]
      : kind === "quotient"
        ? [
            {
              id: "divided",
              latex: frac(new Fraction(p, q)),
              explain: L(
                `Je deelde de exponenten. Bij delen trek je ze af: $${p}-${q}$.`,
                `You divided the exponents. When dividing powers you subtract them: $${p}-${q}$.`,
              ),
            },
            {
              id: "added",
              latex: String(p + q),
              explain: L(`Bij delen tel je niet op, maar trek je af: $${p}-${q}$.`, `When dividing you do not add, you subtract: $${p}-${q}$.`),
            },
          ]
        : [
            {
              id: "added",
              latex: String(p + q),
              explain: L(
                `Je telde de exponenten op. Bij een macht van een macht doe je ze keer: $${p}\\cdot ${q}$.`,
                `You added the exponents. For a power of a power you multiply them: $${p}\\cdot ${q}$.`,
              ),
            },
          ];
  const picture =
    kind === "product"
      ? { mode: "product", left: tokens(base, p), right: tokens(base, q) }
      : kind === "quotient"
        ? { mode: "quotient", top: tokens(base, p), bottom: tokens(base, q) }
        : { mode: "power", group: tokens(base, p), times: q };
  const visual = p + q <= 14 && (kind !== "power" || p * q <= 16) ? chain(picture, L(`Rijtjes van $${base}$ voor $${latex}$.`, `Rows of $${base}$ for $${latex}$.`)) : undefined;
  return { latex, n, steps, nudge, mistakes, rule: RULES[kind], visual };
}

/** Two rules combined (difficulty 3). */
function combined(rng: Rng, base: string) {
  const t = rng.int(0, 2);
  if (t === 0) {
    // a^p · a^q / a^r
    const [p, q] = pair(rng, 2, 6, 2, 6);
    const r = rng.int(1, p + q - 1);
    const latex = `\\frac{${pw(base, p)}\\cdot ${pw(base, q)}}{${pw(base, r)}}`;
    const n = p + q - r;
    return {
      latex,
      n,
      steps: [
        { latex: `${p}+${q}-${r}`, note: L("Boven: tel op. Delen: trek af.", "On top: add. Dividing: subtract.") },
        { latex: `\\ask{${p + q}}-${r}`, note: L(`Boven staat $${pw(base, p + q)}$.`, `On top it says $${pw(base, p + q)}$.`) },
        { latex: `\\ask{${n}}`, note: L(`Dus $${pw(base, n)}$.`, `So $${pw(base, n)}$.`) },
      ] as Step[],
      nudge: L(
        `Maak eerst boven één macht: $${pw(base, p)}\\cdot ${pw(base, q)}=${pw(base, "?")}$. Deel daarna door $${pw(base, r)}$.`,
        `First make the top one power: $${pw(base, p)}\\cdot ${pw(base, q)}=${pw(base, "?")}$. Then divide by $${pw(base, r)}$.`,
      ),
      mistakes: [
        {
          id: "multiplied",
          latex: String(p * q - r),
          explain: L(`Boven doe je keer, dus tel je de exponenten op: $${p}+${q}$, niet $${p}\\cdot ${q}$.`, `On top you multiply, so you add the exponents: $${p}+${q}$, not $${p}\\cdot ${q}$.`),
        },
      ] as Mistake[],
      rule: RULES.quotient,
    };
  }
  if (t === 1) {
    // (a^p)^q · a^r
    const [p, q] = pair(rng, 2, 4, 2, 4);
    const r = rng.int(1, 6);
    const latex = `(${pw(base, p)})^{${q}}\\cdot ${pw(base, r)}`;
    const n = p * q + r;
    return {
      latex,
      n,
      steps: [
        { latex: `${p}\\cdot ${q}+${r}`, note: L("Eerst de macht van de macht (keer), dan keer $" + pw(base, r) + "$ (optellen).", "First the power of the power (multiply), then times $" + pw(base, r) + "$ (add).") },
        { latex: `\\ask{${p * q}}+${r}`, note: L(`$(${pw(base, p)})^{${q}}=${pw(base, p * q)}$.`, `$(${pw(base, p)})^{${q}}=${pw(base, p * q)}$.`) },
        { latex: `\\ask{${n}}`, note: L(`Dus $${pw(base, n)}$.`, `So $${pw(base, n)}$.`) },
      ] as Step[],
      nudge: L(
        `Begin met $(${pw(base, p)})^{${q}}$: dat is $${q}$ keer het rijtje $${pw(base, p)}$. Doe het daarna keer $${pw(base, r)}$.`,
        `Start with $(${pw(base, p)})^{${q}}$: that is the row $${pw(base, p)}$ $${q}$ times. Then multiply by $${pw(base, r)}$.`,
      ),
      mistakes: [
        {
          id: "added",
          latex: String(p + q + r),
          explain: L(`Bij $(${pw(base, p)})^{${q}}$ doe je de exponenten keer: $${p}\\cdot ${q}$.`, `For $(${pw(base, p)})^{${q}}$ you multiply the exponents: $${p}\\cdot ${q}$.`),
        },
      ] as Mistake[],
      rule: RULES.power,
    };
  }
  // a^r · (a^p)^q / a^s
  const [p, q] = pair(rng, 2, 3, 2, 4);
  const r = rng.int(1, 5);
  const s = rng.int(1, p * q + r - 1);
  const latex = `\\frac{${pw(base, r)}\\cdot(${pw(base, p)})^{${q}}}{${pw(base, s)}}`;
  const n = r + p * q - s;
  return {
    latex,
    n,
    steps: [
      { latex: `${r}+${p}\\cdot ${q}-${s}`, note: L("Macht van een macht: keer. Keer: optellen. Delen: aftrekken.", "Power of a power: multiply. Multiply: add. Divide: subtract.") },
      { latex: `${r}+\\ask{${p * q}}-${s}`, note: L(`$(${pw(base, p)})^{${q}}=${pw(base, p * q)}$.`, `$(${pw(base, p)})^{${q}}=${pw(base, p * q)}$.`) },
      { latex: `\\ask{${r + p * q}}-${s}`, note: L("Tel op voor de teller.", "Add for the top.") },
      { latex: `\\ask{${n}}`, note: L(`Dus $${pw(base, n)}$.`, `So $${pw(base, n)}$.`) },
    ] as Step[],
    nudge: L(
      `Werk in stappen. Eerst $(${pw(base, p)})^{${q}}$. Dan de teller als één macht. Dan delen door $${pw(base, s)}$.`,
      `Work in steps. First $(${pw(base, p)})^{${q}}$. Then the top as one power. Then divide by $${pw(base, s)}$.`,
    ),
    mistakes: [
      {
        id: "added",
        latex: String(r + p + q - s),
        explain: L(`Bij $(${pw(base, p)})^{${q}}$ doe je de exponenten keer, niet plus.`, `For $(${pw(base, p)})^{${q}}$ you multiply the exponents, not add them.`),
      },
    ] as Mistake[],
    rule: RULES.power,
  };
}

/** A test value for a letter base, so the CAS can compare numbers. */
const testValue = (base: string) => (/^[a-z]$/.test(base) ? 1.37 : Number(base));

export const powerRule: Generator = {
  id: "u1.power-rule",
  skillId: "u1.power-rules",
  title: L("Rekenregels voor machten", "Rules for powers"),
  generate(rng, difficulty) {
    const base = rng.pick(BASES);
    let b;
    if (difficulty === 1) b = single("product", base, ...pair(rng, 2, 7, 2, 7));
    else if (difficulty === 2) {
      const kind = rng.pick(["product", "quotient", "power"] as const);
      if (kind === "quotient") {
        // Not 4 and 2: then 4 : 2 and 4 − 2 are both 2.
        let q = rng.int(2, 6);
        let p = q + rng.int(1, 6);
        while (p * (q - 1) === q * q) {
          q = rng.int(2, 6);
          p = q + rng.int(1, 6);
        }
        b = single(kind, base, p, q);
      } else if (kind === "power") b = single(kind, base, ...pair(rng, 2, 5, 2, 4));
      else b = single(kind, base, rng.int(3, 9), rng.int(3, 9));
    } else b = combined(rng, base);
    const latex = `${b.latex}=${pw(base, "\\square")}`;
    return {
      prompt: L("Schrijf als één macht. Welke exponent komt in het vakje?", "Write as one power. Which exponent goes in the box?"),
      latex,
      visual: "visual" in b ? (b.visual as VisualSpec | undefined) : undefined,
      answer: { kind: "expr", latex: String(b.n), form: "integer" },
      calculator: "off",
      hints: { nudge: b.nudge, rule: b.rule, solution: { steps: b.steps } },
      mistakes: cleanMistakes(String(b.n), b.mistakes),
    };
  },
  verify(ex) {
    // Independent check: give the base a number and compare both sides with the CAS.
    if (ex.answer.kind !== "expr" || !ex.latex) return false;
    const [lhs, rhs] = ex.latex.split("=");
    const base = rhs.match(/^(.+)\^\{\\square\}$/)?.[1];
    if (!base) return false;
    const v = testValue(base);
    const l = valueOf(/^[a-z]$/.test(base) ? subLetter(lhs, base, v) : lhs);
    const r = valueOf(`(${v})^{${ex.answer.latex}}`);
    return l !== null && r !== null && Math.abs(l - r) <= 1e-9 * Math.max(1, Math.abs(r));
  },
};

// ---------------------------------------------------------------------------
// Power of a product: (c·a^p)^n = c^n·a^(p·n)
// ---------------------------------------------------------------------------

export const productPower: Generator = {
  id: "u1.product-power",
  skillId: "u1.product-power",
  title: L("Macht van een product", "Power of a product"),
  generate(rng, difficulty) {
    const v = rng.pick(LETTERS);
    let c: number, p: number, n: number;
    let extra: { k: number; r: number } | null = null;
    // Not c = 2 with n = 2 (then 2^2 = 2·2 and "not 2·2" would be false),
    // and not p = 2 with n = 2 (then multiplying and adding exponents agree).
    do {
      if (difficulty === 1) {
        c = rng.int(2, 6);
        p = rng.int(1, 2);
        n = rng.int(2, c <= 3 ? 4 : 3);
      } else if (difficulty === 2) {
        c = rng.int(2, 5) * (rng.chance(0.4) ? -1 : 1);
        p = rng.int(2, 4);
        n = rng.int(2, 3);
      } else {
        c = rng.int(2, 4) * (rng.chance(0.5) ? -1 : 1);
        p = rng.int(1, 3);
        n = rng.int(2, 3);
        extra = { k: rng.int(2, 5), r: rng.int(1, 4) };
      }
    } while ((Math.abs(c) === 2 && n === 2) || (p === 2 && n === 2));
    const vp = pw1(v, p);
    const inner = `${c}${vp}`;
    const tail = extra ? `\\cdot ${extra.k}${pw1(v, extra.r)}` : "";
    const latex = `(${inner})^{${n}}${tail}`;
    const cn = c ** n;
    const coef = cn * (extra?.k ?? 1);
    const e = p * n + (extra?.r ?? 0);
    const cl = c < 0 ? `(${c})` : String(c);
    // The letter part to the power n: (x^p)^n, or just x^n when p = 1.
    const letterPow = p === 1 ? pw(v, n) : `(${vp})^{${n}}`;
    const steps: Step[] = [
      { latex, note: L(`Binnen de haakjes staan twee factoren: $${c}$ en $${vp}$.`, `Inside the brackets there are two factors: $${c}$ and $${vp}$.`) },
      {
        latex: `\\hl{${cl}^{${n}}}\\cdot \\hl{${letterPow}}${tail}`,
        note: L(`Elke factor krijgt de macht $${n}$.`, `Every factor gets the power $${n}$.`),
      },
      {
        latex: `\\ask{${cn}}\\cdot ${letterPow}${tail}`,
        note: L(`$${cl}^{${n}}=${cn}$.`, `$${cl}^{${n}}=${cn}$.`),
      },
    ];
    if (p > 1) {
      steps.push({
        latex: `${cn}${pw(v, `\\ask{${p * n}}`)}${tail}`,
        note: L(`Macht van een macht: $${p}\\cdot ${n}=${p * n}$.`, `Power of a power: $${p}\\cdot ${n}=${p * n}$.`),
      });
    }
    if (extra) {
      steps.push(
        { latex: `\\ask{${coef}}\\cdot ${pw(v, p * n)}\\cdot ${pw1(v, extra.r)}`, note: L(`Getallen keer elkaar: $${cn}\\cdot ${extra.k}=${coef}$.`, `Numbers multiplied: $${cn}\\cdot ${extra.k}=${coef}$.`) },
        {
          latex: `${coef}${pw(v, `\\ask{${e}}`)}`,
          note: L(
            `Zelfde grondtal: tel de exponenten op, $${p * n}+${extra.r}=${e}$.${extra.r === 1 ? ` Een losse $${v}$ is $${v}^{1}$.` : ""}`,
            `Same base: add the exponents, $${p * n}+${extra.r}=${e}$.${extra.r === 1 ? ` A single $${v}$ is $${v}^{1}$.` : ""}`,
          ),
        },
      );
    }
    return {
      prompt: L(`Werk uit. Schrijf als $c\\cdot ${pw(v, "n")}$.`, `Work it out. Write it as $c\\cdot ${pw(v, "n")}$.`),
      latex,
      visual:
        !extra && Math.abs(c) <= 9 && p * n <= 12
          ? chain({ mode: "power", group: [String(c), ...tokens(v, p)], times: n }, L(`Het rijtje $${inner}$, $${n}$ keer.`, `The row $${inner}$, $${n}$ times.`))
          : undefined,
      answer: {
        kind: "multi",
        parts: [
          { label: "c=", answer: { latex: String(coef), form: "integer" } },
          { label: "n=", answer: { latex: String(e), form: "integer" } },
        ],
      },
      calculator: "off",
      hints: {
        nudge: L(
          `Ook de $${c}$ krijgt de macht $${n}$: $${cl}^{${n}}$. ${c < 0 ? `Let op het teken: $${n}$ mintekens.` : `Niet $${c}\\cdot ${n}$!`}`,
          `The $${c}$ also gets the power $${n}$: $${cl}^{${n}}$. ${c < 0 ? `Watch the sign: $${n}$ minus signs.` : `Not $${c}\\cdot ${n}$!`}`,
        ),
        rule: {
          text: L(
            "Macht van een product: elke factor krijgt de macht. $(c\\cdot a)^{n}=c^{n}\\cdot a^{n}$.",
            "Power of a product: every factor gets the power. $(c\\cdot a)^{n}=c^{n}\\cdot a^{n}$.",
          ),
          ruleId: "u1.product-power",
        },
        solution: { steps },
      },
    };
  },
  verify(ex) {
    // Independent check: put a number in for the letter on both sides.
    if (ex.answer.kind !== "multi" || !ex.latex) return false;
    const letter = ex.latex.replace(/\\[a-zA-Z]+/g, "").match(/[abxy]/)?.[0];
    if (!letter) return false;
    const [c, n] = ex.answer.parts.map((p) => p.answer.latex);
    const t = 1.21;
    const l = valueOf(subLetter(ex.latex, letter, t));
    const r = valueOf(`${c}\\cdot(${t})^{${n}}`);
    return l !== null && r !== null && Math.abs(l - r) <= 1e-9 * Math.max(1, Math.abs(r));
  },
};

// ---------------------------------------------------------------------------
// Zero and negative exponents
// ---------------------------------------------------------------------------

export const negativeExponent: Generator = {
  id: "u1.negative-exponent",
  skillId: "u1.negative-exponents",
  title: L("Exponent nul en negatief", "Zero and negative exponents"),
  generate(rng, difficulty) {
    const zeroRule = {
      text: L("Tot de macht nul: $a^{0}=1$. Eén stap omlaag op de trap van $a^{1}=a$ is delen door $a$.", "To the power zero: $a^{0}=1$. One step down the stairs from $a^{1}=a$ is dividing by $a$."),
      ruleId: "u1.zero-exponent",
    };
    const negRule = {
      text: L("Negatieve exponent: $a^{-n}=\\frac{1}{a^{n}}$. Een min in de exponent betekent: één gedeeld door.", "Negative exponent: $a^{-n}=\\frac{1}{a^{n}}$. A minus in the exponent means: one divided by."),
      ruleId: "u1.negative-exponent",
    };
    let latex: string;
    let value: Fraction;
    let steps: Step[];
    let nudge: Loc;
    let rule = negRule;
    let visual: VisualSpec | undefined;
    const mistakes: Array<Mistake | null> = [];

    if (difficulty === 1 && rng.chance(0.45)) {
      // a^0 = 1, with all kinds of bases.
      const base = rng.chance()
        ? String(rng.int(2, 99))
        : rng.pick(["x", "a", "(-3)", "(-8)", "\\left(\\frac{1}{2}\\right)", "\\left(\\frac{2}{3}\\right)", "1.5", "365", "(-1)", "1000"]);
      latex = `${base}^{0}`;
      value = new Fraction(1);
      steps = [
        { latex, note: L("Exponent $0$: het grondtal staat er nul keer.", "Exponent $0$: the base appears zero times.") },
        { latex: "\\ask{1}", note: L("Altijd $1$ (als het grondtal niet $0$ is).", "Always $1$ (when the base is not $0$).") },
      ];
      nudge = L(
        `Denk aan de trap: $${base}^{1}$ is $${base}$. Eén stap omlaag is delen door $${base}$. Wat is $${base}$ gedeeld door zichzelf?`,
        `Think of the stairs: $${base}^{1}$ is $${base}$. One step down is dividing by $${base}$. What is $${base}$ divided by itself?`,
      );
      rule = zeroRule;
      mistakes.push({ id: "zero", latex: "0", explain: L("Niet $0$! Een stap omlaag is delen door het grondtal. Iets gedeeld door zichzelf is $1$.", "Not $0$! A step down is dividing by the base. Something divided by itself is $1$.") });
      if (/^\d+$/.test(base) && Number(base) <= 10) visual = powerSteps(Number(base), 0, -2, 2);
    } else if (difficulty === 2 && rng.chance(0.35)) {
      // a^p · a^q with a negative result: first the product rule, then 1/a^n.
      const a = rng.pick([2, 3, 10]);
      const p = rng.int(1, 4);
      const lim = a === 2 ? 6 : 3;
      const n = rng.int(1, lim); // the final exponent is −n
      const q = -(p + n);
      latex = `${a}^{${p}}\\cdot ${a}^{${q}}`;
      value = new Fraction(1, a ** n);
      steps = [
        { latex, note: L("Zelfde grondtal, keer: tel de exponenten op.", "Same base, multiply: add the exponents.") },
        { latex: `${a}^{\\ask{${-n}}}`, note: L(`$${p}+(${q})=${-n}$.`, `$${p}+(${q})=${-n}$.`) },
        ...(n > 1
          ? [
              { latex: `\\frac{1}{${a}^{${n}}}`, note: L("Een min in de exponent: één gedeeld door.", "A minus in the exponent: one divided by.") },
              { latex: `\\frac{1}{\\ask{${a ** n}}}`, note: L(`$${a}^{${n}}=${a ** n}$.`, `$${a}^{${n}}=${a ** n}$.`) },
            ]
          : [{ latex: `\\frac{1}{\\ask{${a}}}`, note: L("Een min in de exponent: één gedeeld door.", "A minus in the exponent: one divided by.") }]),
      ];
      nudge = L(
        `Tel eerst de exponenten op: $${p}+(${q})$. Wat betekent een negatieve exponent?`,
        `First add the exponents: $${p}+(${q})$. What does a negative exponent mean?`,
      );
      mistakes.push({
        id: "negative-number",
        latex: String(-(a ** n)),
        explain: L(`$${a}^{${-n}}$ is niet negatief. Het is één gedeeld door $${a}^{${n}}$.`, `$${a}^{${-n}}$ is not negative. It is one divided by $${a}^{${n}}$.`),
      });
    } else if (difficulty <= 2) {
      // a^-n = 1/a^n, also with a negative base.
      let a: number, n: number;
      if (difficulty === 1) [a, n] = [rng.int(2, 20), 1];
      else {
        a = rng.int(2, 12);
        // Keep a^n something you can work out by hand.
        const maxN = a === 2 ? 7 : a === 3 ? 4 : a <= 5 ? 3 : a === 10 ? 3 : 2;
        n = rng.int(2, maxN);
        if (a <= 5 && n <= 3 && rng.chance(0.25)) a = -a;
      }
      const al = a < 0 ? `(${a})` : String(a);
      latex = `${al}^{-${n}}`;
      value = new Fraction(1, a ** n);
      // a^n, or just a when n = 1.
      const an = n === 1 ? al : `${al}^{${n}}`;
      steps =
        n === 1
          ? [
              { latex, note: L("Een min in de exponent.", "A minus in the exponent.") },
              { latex: `\\frac{1}{\\ask{${a}}}`, note: L(`Eén gedeeld door $${al}$.`, `One divided by $${al}$.`) },
            ]
          : [
              { latex, note: L("Een min in de exponent.", "A minus in the exponent.") },
              { latex: `\\frac{1}{\\hl{${an}}}`, note: L(`Eén gedeeld door $${an}$.`, `One divided by $${an}$.`) },
              { latex: `\\frac{1}{\\ask{${a ** n}}}`, note: L(`$${an}=${a ** n}$.`, `$${an}=${a ** n}$.`) },
            ];
      nudge =
        a > 0
          ? L(
              `Ga op de trap van $${a}$ omlaag: $${a}^{1}=${a}$, $${a}^{0}=1$, $${a}^{-1}=\\frac{1}{${a}}$... Elke stap: gedeeld door $${a}$.`,
              `Go down the stairs of $${a}$: $${a}^{1}=${a}$, $${a}^{0}=1$, $${a}^{-1}=\\frac{1}{${a}}$... Every step: divided by $${a}$.`,
            )
          : L(
              `Schrijf het eerst als breuk: $\\frac{1}{${an}}$. Let daarna op het teken van $${an}$.`,
              `First write it as a fraction: $\\frac{1}{${an}}$. Then watch the sign of $${an}$.`,
            );
      mistakes.push(
        a > 0
          ? {
              id: "negative-number",
              latex: String(-(a ** n)),
              explain: L(
                `Een min in de exponent maakt het getal niet negatief. Het betekent: één gedeeld door $${an}$.`,
                `A minus in the exponent does not make the number negative. It means: one divided by $${an}$.`,
              ),
            }
          : null,
        {
          id: "not-divided",
          latex: String(a ** n),
          explain: L(`Je vergat ‘één gedeeld door’. $${latex}=\\frac{1}{${an}}$.`, `You forgot ‘one divided by’. $${latex}=\\frac{1}{${an}}$.`),
        },
        {
          id: "times",
          latex: String(-a * n),
          explain: L(`Een macht is geen keersom van grondtal en exponent. $${latex}=\\frac{1}{${an}}$.`, `A power is not base times exponent. $${latex}=\\frac{1}{${an}}$.`),
        },
      );
      if (a > 0 && a ** n <= 64) visual = powerSteps(a, -n, -Math.max(n, 2), 2);
    } else {
      const t = rng.int(0, 1);
      if (t === 0) {
        // c · a^-n
        const a = rng.pick([2, 3, 4, 5, 10]);
        const n = a === 2 ? rng.int(1, 4) : rng.int(1, 2);
        let c: number;
        // c and a share no factor, so c/a^n is already in lowest terms.
        do c = rng.int(2, 9);
        while (gcd(c, a) !== 1);
        latex = `${c}\\cdot ${a}^{-${n}}`;
        value = new Fraction(c, a ** n);
        steps = [
          { latex, note: L("Eerst de macht, dan keer.", "First the power, then multiply.") },
          { latex: `${c}\\cdot\\frac{1}{\\ask{${a ** n}}}`, note: L(`$${a}^{-${n}}=\\frac{1}{${n === 1 ? a : `${a}^{${n}}`}}$.`, `$${a}^{-${n}}=\\frac{1}{${n === 1 ? a : `${a}^{${n}}`}}$.`) },
          { latex: `\\ask{${frac(value)}}`, note: L(`$${c}\\cdot\\frac{1}{${a ** n}}=\\frac{${c}}{${a ** n}}$.`, `$${c}\\cdot\\frac{1}{${a ** n}}=\\frac{${c}}{${a ** n}}$.`) },
        ];
        nudge = L(
          `De macht hoort alleen bij $${a}$. Schrijf $${a}^{-${n}}$ als breuk. Doe die daarna keer $${c}$.`,
          `The power only belongs to $${a}$. Write $${a}^{-${n}}$ as a fraction. Then multiply it by $${c}$.`,
        );
        mistakes.push({
          id: "multiply-first",
          latex: frac(new Fraction(1, (c * a) ** n)),
          explain: L(`De macht hoort alleen bij $${a}$, niet bij $${c}\\cdot ${a}$. Eerst de macht, dan keer.`, `The power only belongs to $${a}$, not to $${c}\\cdot ${a}$. First the power, then multiply.`),
          relatedSkill: "u0.order-of-operations",
        });
      } else {
        // (p/q)^-n = (q/p)^n
        let p: number, q: number;
        do [p, q] = [rng.int(1, 5), rng.int(2, 6)];
        while (p >= q || gcd(p, q) !== 1);
        const n = p === 1 ? rng.int(2, 3) : rng.int(1, 2);
        const exp = n === 1 ? "-1" : `-${n}`;
        latex = `\\left(\\frac{${p}}{${q}}\\right)^{${exp}}`;
        value = new Fraction(q, p).pow(n);
        const flipped = p === 1 ? String(q) : `\\frac{${q}}{${p}}`;
        steps = [
          { latex, note: L("Een min in de exponent: één gedeeld door.", "A minus in the exponent: one divided by.") },
          n === 1
            ? { latex: `\\ask{${flipped}}`, note: L("Eén gedeeld door een breuk: zet de breuk op zijn kop.", "One divided by a fraction: turn the fraction upside down.") }
            : { latex: `${p === 1 ? flipped : `\\left(${flipped}\\right)`}^{${n}}`, note: L("Eén gedeeld door een breuk: zet de breuk op zijn kop.", "One divided by a fraction: turn the fraction upside down.") },
        ];
        if (n > 1) {
          steps.push({
            latex: `\\ask{${frac(value)}}`,
            note: p === 1 ? L(`$${q}^{${n}}=${q ** n}$.`, `$${q}^{${n}}=${q ** n}$.`) : L("Teller en noemer apart tot de macht.", "Numerator and denominator to the power separately."),
          });
        }
        nudge =
          n === 1
            ? L(
                `De min in de exponent draait de breuk $\\frac{${p}}{${q}}$ om. Wat komt er boven, wat onder?`,
                `The minus in the exponent flips the fraction $\\frac{${p}}{${q}}$. What goes on top, what goes below?`,
              )
            : L(
                `$\\left(\\frac{${p}}{${q}}\\right)^{-1}=${flipped}$: de min draait de breuk om. Doe daarna tot de macht $${n}$.`,
                `$\\left(\\frac{${p}}{${q}}\\right)^{-1}=${flipped}$: the minus flips the fraction. Then raise it to the power $${n}$.`,
              );
        mistakes.push({
          id: "not-flipped",
          latex: frac(new Fraction(p, q).pow(n)),
          explain: L("Bijna: door de min in de exponent moet de breuk op zijn kop.", "Almost: the minus in the exponent flips the fraction upside down."),
        });
      }
    }
    return {
      prompt: L("Bereken. Geef een geheel getal of een breuk.", "Work it out. Give a whole number or a fraction."),
      latex,
      visual,
      answer: { kind: "expr", latex: frac(value), form: "fraction" },
      calculator: "off",
      hints: { nudge, rule, solution: { steps } },
      mistakes: cleanMistakes(frac(value), mistakes),
    };
  },
  verify(ex) {
    // Independent check: the CAS evaluates the printed power (letters get a test value).
    if (ex.answer.kind !== "expr" || !ex.latex) return false;
    const l = valueOf(ex.latex.replace(/^[ax]\^/, "(1.7)^"));
    const r = valueOf(ex.answer.latex);
    return l !== null && r !== null && Math.abs(l - r) < 1e-9;
  },
  isNice(ex) {
    // Denominators stay small.
    return ex.answer.kind === "expr" && !/\{\d{5,}\}/.test(ex.answer.latex);
  },
};
