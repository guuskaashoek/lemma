/**
 * Lessons 9 and 10 generators: scientific notation (wetenschappelijke
 * notatie). Numbers are built from whole digits and a power of ten, never
 * with floating-point multiplication, so every printed digit is exact.
 */
import Fraction from "fraction.js";
import type { Generator, Loc, Step } from "@/content/types";
import type { Rng } from "@/math/random";
import type { VisualSpec } from "@/visuals/types";
import { br, custom, decimalFraction, decimalString, grouped, L, valueOf } from "../helpers";

/** Digits with 1 to 3 significant figures, last digit not 0: 4, 45, 307. */
function sigDigits(rng: Rng, max = 3): number {
  const len = rng.int(1, max);
  if (len === 1) return rng.int(1, 9);
  let d: number;
  do d = rng.int(10 ** (len - 1), 10 ** len - 1);
  while (d % 10 === 0);
  return d;
}

/** `a·10^n` for digits·10^shift, with 1 ≤ a < 10. */
function normalForm(digits: number, shift: number): { a: string; n: number } {
  const len = String(digits).length;
  return { a: decimalString(digits, -(len - 1)), n: shift + len - 1 };
}

const sci = (a: string, n: number) => `${a}\\cdot 10^{${n}}`;

/** The sliding-decimal-point widget. */
export function decimalShift(digits: number, shift: number): VisualSpec {
  const v = grouped(decimalString(digits, shift));
  return custom(
    "u1.decimal-shift",
    { digits, shift },
    L(`Het getal $${v}$ met een komma die je kunt verschuiven.`, `The number $${v}$ with a decimal point you can move.`),
  );
}

const sciRule = {
  text: L(
    "Wetenschappelijke notatie: $a\\cdot 10^{n}$ met precies één cijfer (geen $0$) vóór de komma. Komma naar links: $n$ omhoog. Komma naar rechts: $n$ omlaag.",
    "Scientific notation: $a\\cdot 10^{n}$ with exactly one digit (not $0$) before the point. Point to the left: $n$ goes up. Point to the right: $n$ goes down.",
  ),
  ruleId: "u1.scientific",
};

const parts = (a: string, n: number) => ({
  kind: "multi" as const,
  parts: [
    { label: "a=", answer: { latex: a } },
    { label: "n=", answer: { latex: String(n), form: "integer" as const } },
  ],
});

/** Independent check of a multi answer: 1 ≤ a < 10 and a·10^n equals the given value. */
function sciMatches(value: number | null, a: string, n: string): boolean {
  const av = valueOf(a);
  const total = valueOf(`${a}\\cdot 10^{${n}}`);
  return value !== null && av !== null && total !== null && av >= 1 && av < 10 && Math.abs(total - value) <= 1e-9 * Math.abs(value);
}

// ---------------------------------------------------------------------------
// Ordinary number → scientific notation
// ---------------------------------------------------------------------------

export const toScientific: Generator = {
  id: "u1.to-scientific",
  skillId: "u1.scientific",
  title: L("Naar wetenschappelijke notatie", "Into scientific notation"),
  generate(rng, difficulty) {
    const digits = sigDigits(rng);
    const len = String(digits).length;
    let shift: number;
    let start: { latex: string; digits: number; shift: number };
    if (difficulty === 1) {
      shift = rng.int(Math.max(1, 3 - len), 8 - len);
      start = { latex: grouped(decimalString(digits, shift)), digits, shift };
    } else if (difficulty === 2) {
      shift = -rng.int(len + 1, len + 5);
      start = { latex: decimalString(digits, shift), digits, shift };
    } else {
      // Not yet normalised: 32·10^5, 0.45·10^-3, 4500·10^-6.
      // The coefficient c = digits·10^coefShift is `offset` places away
      // from a proper one; the number is c·10^m.
      const offset = rng.pick([-2, -1, 1, 2, 3]);
      const m = rng.int(-6, 9);
      const coefShift = offset - (len - 1);
      const c = decimalString(digits, coefShift);
      shift = coefShift + m;
      start = { latex: `${grouped(c)}\\cdot 10^{${m}}`, digits, shift };
    }
    const { a, n } = normalForm(digits, shift);
    const plain = decimalString(digits, shift);
    const pow = Math.abs(n);
    const tenLatex = n >= 0 ? grouped(`1${"0".repeat(n)}`) : `\\frac{1}{${grouped(`1${"0".repeat(pow)}`)}}`;

    let steps: Step[];
    let nudge: Loc;
    if (difficulty < 3) {
      steps = [
        { latex: start.latex, note: L("Zet de komma achter het eerste cijfer dat geen $0$ is.", "Put the point after the first digit that is not $0$.") },
        {
          latex: `\\ask{${a}}\\cdot ${tenLatex}`,
          note:
            n >= 0
              ? L(`De komma gaat $${n}$ plaatsen naar links. Dat is $${n}$ keer delen door $10$.`, `The point moves $${n}$ places to the left. That is dividing by $10$ $${n}$ times.`)
              : L(`De komma gaat $${pow}$ plaatsen naar rechts. Dat is $${pow}$ keer vermenigvuldigen met $10$.`, `The point moves $${pow}$ places to the right. That is multiplying by $10$ $${pow}$ times.`),
        },
        { latex: `${a}\\cdot 10^{\\ask{${n}}}`, note: L(`$${tenLatex}=10^{${n}}$.`, `$${tenLatex}=10^{${n}}$.`) },
      ];
      nudge =
        n >= 0
          ? L(
              `Zet de komma achter de eerste $${String(digits)[0]}$. Tel hoeveel plaatsen de komma dan naar links schuift. Dat is $n$.`,
              `Put the point after the first $${String(digits)[0]}$. Count how many places the point moves to the left. That is $n$.`,
            )
          : L(
              `Het getal is kleiner dan $1$, dus $n$ wordt negatief. Schuif de komma naar rechts tot achter de $${String(digits)[0]}$. Tel de plaatsen.`,
              `The number is less than $1$, so $n$ becomes negative. Move the point to the right until it is after the $${String(digits)[0]}$. Count the places.`,
            );
    } else {
      const [c, m] = start.latex.split("\\cdot 10^");
      const mm = Number(m.slice(1, -1));
      const k = n - mm; // how far the point moves in the coefficient
      steps = [
        { latex: start.latex, note: L(`$${c}$ staat nog niet goed: er moet precies één cijfer vóór de komma.`, `$${c}$ is not right yet: exactly one digit must be before the point.`) },
        {
          latex: `\\ask{${a}}\\cdot 10^{${k}}\\cdot 10^{${mm}}`,
          note:
            k > 0
              ? L(`Komma $${k}$ naar links: $${c}=${a}\\cdot 10^{${k}}$.`, `Point $${k}$ to the left: $${c}=${a}\\cdot 10^{${k}}$.`)
              : L(`Komma $${-k}$ naar rechts: $${c}=${a}\\cdot 10^{${k}}$.`, `Point $${-k}$ to the right: $${c}=${a}\\cdot 10^{${k}}$.`),
        },
        { latex: `${a}\\cdot 10^{\\ask{${n}}}`, note: L(`Tel de exponenten op: $${k}+${br(mm)}=${n}$.`, `Add the exponents: $${k}+${br(mm)}=${n}$.`) },
      ];
      nudge = L(
        `Maak eerst van $${c}$ een getal met één cijfer vóór de komma. Hoeveel plaatsen schuift de komma? Pas $10^{${mm}}$ daarop aan.`,
        `First turn $${c}$ into a number with one digit before the point. How many places does the point move? Adjust $10^{${mm}}$ for that.`,
      );
    }
    return {
      prompt: L("Schrijf in wetenschappelijke notatie: $a\\cdot 10^{n}$.", "Write in scientific notation: $a\\cdot 10^{n}$."),
      latex: start.latex,
      visual: decimalShift(digits, shift),
      answer: parts(a, n),
      calculator: "off",
      hints: {
        nudge,
        rule: sciRule,
        solution: { steps: [...steps, { latex: sci(a, n), note: L(`Klaar: $${grouped(plain)}=${sci(a, n)}$.`, `Done: $${grouped(plain)}=${sci(a, n)}$.`) }] },
      },
    };
  },
  verify(ex) {
    // Independent check: the CAS evaluates the printed number and a·10^n.
    if (ex.answer.kind !== "multi" || !ex.latex) return false;
    const [a, n] = ex.answer.parts.map((p) => p.answer.latex);
    return sciMatches(valueOf(ex.latex), a, n);
  },
};

// ---------------------------------------------------------------------------
// Scientific notation → ordinary number, and comparing
// ---------------------------------------------------------------------------

export const fromScientific: Generator = {
  id: "u1.from-scientific",
  skillId: "u1.scientific",
  title: L("Terug naar een gewoon getal", "Back to an ordinary number"),
  generate(rng, difficulty) {
    const digits = sigDigits(rng);
    const len = String(digits).length;
    const aStr = decimalString(digits, -(len - 1));

    if (difficulty === 1) {
      const n = rng.int(Math.max(2, len), 8);
      const shift = n - (len - 1);
      const plain = decimalString(digits, shift);
      const latex = sci(aStr, n);
      return {
        prompt: L("Schrijf als gewoon getal.", "Write as an ordinary number."),
        latex,
        visual: decimalShift(digits, shift),
        answer: { kind: "expr", latex: plain, form: "integer" },
        calculator: "off",
        hints: {
          nudge: L(
            `Er staat $10^{${n}}$. Neem $${aStr}$ en schuif de komma $${n}$ ${n === 1 ? "plaats" : "plaatsen"} naar rechts. Vul lege plekken op met nullen.`,
            `It says $10^{${n}}$. Take $${aStr}$ and move the point $${n}$ ${n === 1 ? "place" : "places"} to the right. Fill empty places with zeros.`,
          ),
          rule: sciRule,
          solution: {
            steps: [
              { latex, note: L(`$10^{${n}}$ is een $1$ met $${n}$ nullen.`, `$10^{${n}}$ is a $1$ with $${n}$ zeros.`) },
              { latex: `${aStr}\\cdot ${grouped(`1${"0".repeat(n)}`)}`, note: L(`Keer $${grouped(`1${"0".repeat(n)}`)}$: komma $${n}$ plaatsen naar rechts.`, `Times $${grouped(`1${"0".repeat(n)}`)}$: point $${n}$ places to the right.`) },
              { latex: `\\ask{${plain}}`, note: L(`Dus $${grouped(plain)}$.`, `So $${grouped(plain)}$.`) },
            ],
          },
        },
        mistakes:
          len > 1
            ? [
                {
                  id: "zeros-appended",
                  latex: decimalString(digits, n),
                  explain: L(
                    `Je zette $${n}$ nullen achter $${digits}$. Maar de komma schuift vanaf $${aStr}$: er komen ${shift} nullen bij.`,
                    `You put $${n}$ zeros after $${digits}$. But the point moves from $${aStr}$: ${shift} zeros are added.`,
                  ),
                },
              ]
            : [],
      };
    }

    if (difficulty === 2) {
      // Negative exponent: multiple choice (typing would let 3.2·10^-4 pass as itself).
      const n = -rng.int(1, 5);
      const shift = n - (len - 1);
      const opts = [shift, shift - 1, shift + 1, shift - 2].map((s) => decimalString(digits, s));
      const order = rng.shuffle([0, 1, 2, 3]);
      const latex = sci(aStr, n);
      return {
        prompt: L("Welk gewoon getal is dit?", "Which ordinary number is this?"),
        latex,
        visual: decimalShift(digits, shift),
        answer: { kind: "choice", options: order.map((i) => ({ latex: opts[i] })), correctIndex: order.indexOf(0) },
        calculator: "off",
        hints: {
          nudge: L(
            `Er staat $10^{${n}}$. Neem $${aStr}$ en schuif de komma $${-n}$ ${n === -1 ? "plaats" : "plaatsen"} naar links. Het getal wordt kleiner dan $1$.`,
            `It says $10^{${n}}$. Take $${aStr}$ and move the point $${-n}$ ${n === -1 ? "place" : "places"} to the left. The number becomes less than $1$.`,
          ),
          rule: sciRule,
          solution: {
            steps: [
              { latex, note: L(`$10^{${n}}=\\frac{1}{10^{${-n}}}$.`, `$10^{${n}}=\\frac{1}{10^{${-n}}}$.`) },
              { latex: `\\frac{${aStr}}{1${"0".repeat(-n)}}`, note: L(`Delen door $1${"0".repeat(-n)}$: komma $${-n}$ naar links.`, `Divide by $1${"0".repeat(-n)}$: point $${-n}$ to the left.`) },
              { latex: `\\ask{${opts[0]}}`, note: L("Vul lege plekken op met nullen.", "Fill empty places with zeros.") },
            ],
          },
        },
      };
    }

    // Difficulty 3: which number is the biggest (or smallest)?
    const ns = rng.shuffle([-6, -5, -4, -3, -2, -1, 2, 3, 4, 5, 6]).slice(0, 2);
    const nA = ns[0];
    const nums: Array<{ digits: number; n: number }> = [
      { digits: sigDigits(rng, 2), n: nA },
      { digits: sigDigits(rng, 2), n: nA - 1 },
      { digits: sigDigits(rng, 2), n: ns[1] },
    ];
    // Make sure no two values are equal.
    const val = (x: { digits: number; n: number }) => decimalFraction(x.digits, x.n - (String(x.digits).length - 1));
    if (val(nums[0]).equals(val(nums[1])) || val(nums[0]).equals(val(nums[2])) || val(nums[1]).equals(val(nums[2]))) nums[1].digits = nums[1].digits === 9 ? 8 : 9;
    const biggest = rng.chance();
    const values = nums.map(val);
    const target = values.reduce((best, v, i) => ((biggest ? v.compare(values[best]) > 0 : v.compare(values[best]) < 0) ? i : best), 0);
    const latexOf = nums.map((x) => sci(decimalString(x.digits, -(String(x.digits).length - 1)), x.n));
    const sorted = [...nums.keys()].sort((i, j) => values[i].compare(values[j]));
    return {
      prompt: biggest ? L("Welk getal is het grootst?", "Which number is the biggest?") : L("Welk getal is het kleinst?", "Which number is the smallest?"),
      answer: { kind: "choice", options: latexOf.map((latex) => ({ latex })), correctIndex: target },
      calculator: "off",
      hints: {
        nudge: L(
          `Kijk eerst naar de exponenten: ${nums.map((x) => `$${x.n}$`).join(", ")}. Een hogere exponent is een groter getal. Pas bij gelijke exponenten kijk je naar het getal ervoor.`,
          `First look at the exponents: ${nums.map((x) => `$${x.n}$`).join(", ")}. A higher exponent means a bigger number. Only when the exponents are equal do you look at the number in front.`,
        ),
        rule: sciRule,
        solution: {
          steps: [
            { latex: `${biggest ? "" : "\\ask{"}${latexOf[sorted[0]]}${biggest ? "" : "}"}<${latexOf[sorted[1]]}`, note: L("Vergelijk de exponenten.", "Compare the exponents.") },
            { latex: `${latexOf[sorted[1]]}<${biggest ? "\\ask{" : ""}${latexOf[sorted[2]]}${biggest ? "}" : ""}`, note: L("Van klein naar groot.", "From small to big.") },
          ],
        },
      },
    };
  },
  verify(ex) {
    // Independent check: the CAS evaluates the printed numbers.
    if (ex.answer.kind === "expr") {
      const l = ex.latex ? valueOf(ex.latex) : null;
      const r = valueOf(ex.answer.latex);
      return l !== null && r !== null && Math.abs(l - r) <= 1e-9 * Math.abs(l);
    }
    if (ex.answer.kind !== "choice") return false;
    const vals = ex.answer.options.map((o) => valueOf(o.latex ?? ""));
    if (vals.some((v) => v === null)) return false;
    const nums = vals as number[];
    const pick = ex.latex
      ? valueOf(ex.latex)
      : ex.prompt.en.includes("biggest")
        ? Math.max(...nums)
        : Math.min(...nums);
    if (pick === null) return false;
    const hits = nums.filter((v) => Math.abs(v - pick) <= 1e-12 * Math.max(1, Math.abs(pick)));
    return hits.length === 1 && Math.abs(nums[ex.answer.correctIndex] - pick) <= 1e-12 * Math.max(1, Math.abs(pick));
  },
};

// ---------------------------------------------------------------------------
// Multiplying and dividing in scientific notation
// ---------------------------------------------------------------------------

export const sciCalc: Generator = {
  id: "u1.sci-calc",
  skillId: "u1.scientific-calc",
  title: L("Rekenen met wetenschappelijke notatie", "Calculating in scientific notation"),
  generate(rng, difficulty) {
    const p = rng.int(difficulty === 1 ? 2 : -8, 9);
    const q = rng.int(difficulty === 1 ? 2 : -8, 9);
    const divide = difficulty === 3 || (difficulty === 2 && rng.chance(0.4));
    let a: Fraction, b: Fraction;
    if (!divide) {
      if (difficulty === 1) {
        // No carry: a·b < 10.
        do [a, b] = [new Fraction(rng.int(1, 9)), new Fraction(rng.int(1, 9))];
        while (a.mul(b).compare(10) >= 0 || a.equals(1) || b.equals(1));
      } else {
        // With carry: a·b ≥ 10.
        do [a, b] = [new Fraction(rng.int(2, 9)), new Fraction(rng.int(2, 9))];
        while (a.mul(b).compare(10) < 0);
        if (rng.chance(0.4)) a = a.add(new Fraction(1, 2)); // e.g. 2.5
      }
    } else if (difficulty === 2) {
      // Division without carry: a/b ≥ 1 and exact.
      const bb = rng.int(2, 4);
      const c = rng.int(1, Math.floor(9 / bb));
      [a, b] = [new Fraction(bb * c), new Fraction(bb)];
      if (a.equals(b)) a = a.add(bb);
    } else {
      // Division with carry: a/b < 1, a terminating decimal.
      const bb = rng.pick([2, 4, 5, 8]);
      const aa = rng.int(1, bb - 1);
      [a, b] = [new Fraction(aa), new Fraction(bb)];
    }
    const sa = a.toString();
    const sb = b.toString();
    const latex = divide ? `\\frac{${sci(sa, p)}}{${sci(sb, q)}}` : `(${sci(sa, p)})\\cdot(${sci(sb, q)})`;
    const m = divide ? a.div(b) : a.mul(b); // the new number in front
    const e = divide ? p - q : p + q;
    let mant = m;
    let n = e;
    if (m.compare(10) >= 0) {
      mant = m.div(10);
      n = e + 1;
    } else if (m.compare(1) < 0) {
      mant = m.mul(10);
      n = e - 1;
    }
    const sm = m.toString();
    const sMant = mant.toString();
    const steps: Step[] = divide
      ? [
          { latex, note: L("Getallen apart delen, machten van $10$ apart delen.", "Divide the numbers separately and the powers of $10$ separately.") },
          { latex: `\\hl{\\frac{${sa}}{${sb}}}\\cdot\\hl{\\frac{10^{${p}}}{10^{${q}}}}`, note: L("Splits in twee breuken.", "Split into two fractions.") },
          { latex: `\\ask{${sm}}\\cdot\\frac{10^{${p}}}{10^{${q}}}`, note: L(`$${sa}:${sb}=${sm}$.`, `$${sa}:${sb}=${sm}$.`) },
          { latex: `${sm}\\cdot 10^{\\ask{${e}}}`, note: L(`Delen: exponenten aftrekken. $${p}-${br(q)}=${e}$.`, `Divide: subtract the exponents. $${p}-${br(q)}=${e}$.`) },
        ]
      : [
          { latex, note: L("Getallen bij elkaar, machten van $10$ bij elkaar.", "Numbers together, powers of $10$ together.") },
          { latex: `\\hl{${sa}\\cdot ${sb}}\\cdot\\hl{10^{${p}}\\cdot 10^{${q}}}`, note: L("Bij keer mag je de volgorde veranderen.", "When multiplying you may change the order.") },
          { latex: `\\ask{${sm}}\\cdot 10^{${p}}\\cdot 10^{${q}}`, note: L(`$${sa}\\cdot ${sb}=${sm}$.`, `$${sa}\\cdot ${sb}=${sm}$.`) },
          { latex: `${sm}\\cdot 10^{\\ask{${e}}}`, note: L(`Keer: exponenten optellen. $${p}+${br(q)}=${e}$.`, `Multiply: add the exponents. $${p}+${br(q)}=${e}$.`) },
        ];
    if (!mant.equals(m)) {
      const up = m.compare(10) >= 0;
      steps.push(
        {
          latex: `\\ask{${sMant}}\\cdot 10^{${up ? 1 : -1}}\\cdot 10^{${e}}`,
          note: up
            ? L(`$${sm}$ is te groot. Komma één naar links: $${sm}=${sMant}\\cdot 10^{1}$.`, `$${sm}$ is too big. Point one place left: $${sm}=${sMant}\\cdot 10^{1}$.`)
            : L(`$${sm}$ is te klein. Komma één naar rechts: $${sm}=${sMant}\\cdot 10^{-1}$.`, `$${sm}$ is too small. Point one place right: $${sm}=${sMant}\\cdot 10^{-1}$.`),
        },
        { latex: `${sMant}\\cdot 10^{\\ask{${n}}}`, note: L("Tel de exponenten op.", "Add the exponents.") },
      );
    }
    return {
      prompt: L("Bereken. Schrijf het antwoord als $a\\cdot 10^{n}$ in wetenschappelijke notatie.", "Work it out. Write the answer as $a\\cdot 10^{n}$ in scientific notation."),
      latex,
      answer: parts(sMant, n),
      calculator: "off",
      hints: {
        nudge: divide
          ? L(
              `Deel $${sa}$ door $${sb}$. Deel $10^{${p}}$ door $10^{${q}}$: trek de exponenten af. Staat er daarna precies één cijfer vóór de komma?`,
              `Divide $${sa}$ by $${sb}$. Divide $10^{${p}}$ by $10^{${q}}$: subtract the exponents. Is there exactly one digit before the point afterwards?`,
            )
          : L(
              `Doe $${sa}\\cdot ${sb}$. Doe $10^{${p}}\\cdot 10^{${q}}$: tel de exponenten op. Staat er daarna precies één cijfer vóór de komma?`,
              `Do $${sa}\\cdot ${sb}$. Do $10^{${p}}\\cdot 10^{${q}}$: add the exponents. Is there exactly one digit before the point afterwards?`,
            ),
        rule: {
          text: L(
            "Rekenen met $10$-machten: getallen keer (of delen), exponenten optellen (of aftrekken). Zorg dat er daarna één cijfer vóór de komma staat.",
            "Calculating with powers of $10$: multiply (or divide) the numbers, add (or subtract) the exponents. Then make sure there is one digit before the point.",
          ),
          ruleId: "u1.scientific-calc",
        },
        solution: { steps },
      },
    };
  },
  verify(ex) {
    // Independent check: the CAS evaluates the printed sum and a·10^n.
    if (ex.answer.kind !== "multi" || !ex.latex) return false;
    const [a, n] = ex.answer.parts.map((p) => p.answer.latex);
    return sciMatches(valueOf(ex.latex), a, n);
  },
};
