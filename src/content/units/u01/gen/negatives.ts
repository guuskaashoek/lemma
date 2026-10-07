/**
 * Lessons 1-3 generators: negative numbers.
 * - comparing numbers on the number line,
 * - adding and subtracting (also "min min wordt plus"),
 * - multiplying and dividing (the sign rule).
 */
import type { Generator, Loc, Step } from "@/content/types";
import type { Mistake } from "@/math/check";
import type { Rng } from "@/math/random";
import type { VisualSpec } from "@/visuals/types";
import { br, cleanMistakes, custom, L, opTerm, valueOf } from "../helpers";

// ---------------------------------------------------------------------------
// Comparing numbers
// ---------------------------------------------------------------------------

/** Distinct values in tenths (so −2.5 is −25), at least `negatives` of them below zero. */
function pickTenths(rng: Rng, count: number, lo: number, hi: number, negatives: number, step: number): number[] {
  for (;;) {
    const vals = new Set<number>();
    while (vals.size < count) vals.add(rng.int(lo / step, hi / step) * step);
    const list = [...vals];
    if (list.filter((v) => v < 0).length >= negatives) return list;
  }
}

/** A number given in tenths, as LaTeX with a decimal point. */
const tenthsLatex = (t: number) => (t % 10 === 0 ? String(t / 10) : `${t < 0 ? "-" : ""}${Math.floor(Math.abs(t) / 10)}.${Math.abs(t) % 10}`);

export const compareNumbers: Generator = {
  id: "u1.compare",
  skillId: "u1.compare",
  title: L("Getallen vergelijken", "Comparing numbers"),
  generate(rng, difficulty) {
    // Values in tenths: whole numbers for difficulty 1 and 2, one decimal for 3.
    const tenths =
      difficulty === 1
        ? pickTenths(rng, 2, -100, 100, 1, 10)
        : difficulty === 2
          ? pickTenths(rng, 3, -150, 150, 2, 10)
          : pickTenths(rng, 3, -60, 20, 2, 1);
    const smallest = rng.chance();
    const target = smallest ? Math.min(...tenths) : Math.max(...tenths);
    const latexOf = tenths.map(tenthsLatex);
    const sorted = [...tenths].sort((a, b) => a - b);
    const letters = ["A", "B", "C"];
    // The number line always shows 0 (the widget's walk starts there).
    const lo = Math.min(0, Math.floor(sorted[0] / 10) - 1);
    const hi = Math.max(0, Math.ceil(sorted[sorted.length - 1] / 10)) + 1;

    // Hint 3: the numbers from small to big, the asked one is the blank.
    const steps: Step[] = [];
    for (let i = 0; i + 1 < sorted.length; i++) {
      const [a, b] = [tenthsLatex(sorted[i]), tenthsLatex(sorted[i + 1])];
      const askLeft = smallest && i === 0;
      const askRight = !smallest && i + 2 === sorted.length;
      steps.push({
        latex: `${askLeft ? `\\ask{${a}}` : a}<${askRight ? `\\ask{${b}}` : b}`,
        note: L(`$${a}$ ligt links van $${b}$. Dus is het kleiner.`, `$${a}$ is to the left of $${b}$, so it is smaller.`),
      });
    }
    const quoted = latexOf.map((l) => `$${l}$`);
    const listIn = (and: string) => `${quoted.slice(0, -1).join(", ")} ${and} ${quoted[quoted.length - 1]}`;
    const list = { nl: listIn("en"), en: listIn("and") };
    return {
      prompt: smallest
        ? L("Welk getal is het kleinst?", "Which number is the smallest?")
        : L("Welk getal is het grootst?", "Which number is the biggest?"),
      visual: {
        kind: "number-line",
        min: lo,
        max: hi,
        denominator: difficulty === 3 ? 10 : undefined,
        marks: tenths.map((t, i) => ({ value: t / 10, label: letters[i] })),
      },
      answer: {
        kind: "choice",
        options: latexOf.map((latex) => ({ latex })),
        correctIndex: tenths.indexOf(target),
      },
      calculator: "off",
      hints: {
        nudge: smallest
          ? L(`Zet ${list.nl} op de getallenlijn. Welk getal ligt het meest naar links?`, `Put ${list.en} on the number line. Which number is furthest to the left?`)
          : L(`Zet ${list.nl} op de getallenlijn. Welk getal ligt het meest naar rechts?`, `Put ${list.en} on the number line. Which number is furthest to the right?`),
        rule: {
          text: L(
            "De getallenlijn: links ligt kleiner, rechts ligt groter. $-8$ is kleiner dan $-2$: het is kouder.",
            "The number line: left is smaller, right is bigger. $-8$ is smaller than $-2$: it is colder.",
          ),
          ruleId: "u1.number-line",
        },
        solution: { steps },
      },
    };
  },
  verify(ex) {
    // Independent check: let the CAS evaluate every option.
    if (ex.answer.kind !== "choice") return false;
    const vals = ex.answer.options.map((o) => valueOf(o.latex ?? ""));
    if (vals.some((v) => v === null)) return false;
    const nums = vals as number[];
    const want = ex.prompt.en.includes("smallest") ? Math.min(...nums) : Math.max(...nums);
    return nums[ex.answer.correctIndex] === want && nums.filter((v) => v === want).length === 1;
  },
};

// ---------------------------------------------------------------------------
// Adding and subtracting
// ---------------------------------------------------------------------------

type Term = { op: "+" | "-"; n: number };

/** The jump on the number line for one term: `-(-6)` is a jump of +6. */
const jumpOf = (t: Term) => (t.op === "+" ? t.n : -t.n);

/** Rewrites `+(-b)` as `-b` and `-(-b)` as `+b`. */
const simpleTerm = (t: Term) => {
  const j = jumpOf(t);
  return j < 0 ? `-${-j}` : `+${j}`;
};

function sumLatex(a: number, terms: Term[]): string {
  return `${a}${terms.map((t) => opTerm(t.op, t.n)).join("")}`;
}

/** Number line for a walk; wide enough for every stop and zero. */
function walkLine(a: number, jumps: number[]): VisualSpec {
  const stops = [a];
  for (const j of jumps) stops.push(stops[stops.length - 1] + j);
  return {
    kind: "number-line",
    min: Math.min(0, ...stops) - 1,
    max: Math.max(0, ...stops) + 1,
    start: a,
    jumps,
  };
}

export const addSubtract: Generator = {
  id: "u1.add-subtract",
  skillId: "u1.add-subtract",
  title: L("Optellen en aftrekken met negatieve getallen", "Adding and subtracting negative numbers"),
  generate(rng, difficulty) {
    let a: number;
    let terms: Term[];
    if (difficulty === 1) {
      // a ± b with b positive; a negative start or a negative result.
      do {
        a = rng.nonZeroInt(-9, 9);
        terms = [{ op: rng.pick(["+", "-"] as const), n: rng.int(1, 9) }];
      } while (!(a < 0 || a + jumpOf(terms[0]) < 0));
    } else if (difficulty === 2) {
      // a + (−b) or a − (−b).
      a = rng.nonZeroInt(-12, 12);
      terms = [{ op: rng.pick(["+", "-"] as const), n: -rng.int(1, 9) }];
    } else {
      // Three numbers, at least one negative one in brackets.
      a = rng.int(-10, 10);
      do terms = [0, 1].map(() => ({ op: rng.pick(["+", "-"] as const), n: rng.nonZeroInt(-7, 7) }));
      while (!terms.some((t) => t.n < 0));
    }
    const latex = sumLatex(a, terms);
    const jumps = terms.map(jumpOf);
    const result = a + jumps.reduce((s, j) => s + j, 0);

    // Worked steps.
    const steps: Step[] = [{ latex, note: L("Dit is de som.", "This is the sum.") }];
    const rewrites = terms.filter((t) => t.n < 0);
    if (rewrites.length > 0) {
      steps.push({
        latex: `${a}${terms.map((t) => (t.n < 0 ? `\\hl{${simpleTerm(t)}}` : opTerm(t.op, t.n))).join("")}`,
        note: rewrites.every((t) => t.op === "-")
          ? L("Min min wordt plus.", "Minus minus becomes plus.")
          : rewrites.every((t) => t.op === "+")
            ? L("Plus min wordt min.", "Plus minus becomes minus.")
            : L("Min min wordt plus. Plus min wordt min.", "Minus minus becomes plus. Plus minus becomes minus."),
      });
    }
    let pos = a;
    jumps.forEach((j, i) => {
      pos += j;
      const rest = terms.slice(i + 1).map(simpleTerm).join("");
      steps.push({
        latex: `\\ask{${pos}}${rest}`,
        note:
          j > 0
            ? L(`Spring $${j}$ naar rechts.`, `Jump $${j}$ to the right.`)
            : L(`Spring $${-j}$ naar links.`, `Jump $${-j}$ to the left.`),
      });
    });

    // Hint 1 with this sum's numbers.
    const first = terms[0];
    const firstNeg = terms.find((t) => t.n < 0);
    const nudge: Loc = firstNeg
      ? firstNeg.op === "-"
        ? L(
            `Er staat $-(${firstNeg.n})$: je haalt een negatief getal weg. Min min wordt plus. Schrijf de som eerst zonder haakjes.`,
            `It says $-(${firstNeg.n})$: you take away a negative number. Minus minus becomes plus. First write the sum without brackets.`,
          )
        : L(
            `Er staat $+(${firstNeg.n})$: je telt een negatief getal op. Plus min wordt min. Schrijf de som eerst zonder haakjes.`,
            `It says $+(${firstNeg.n})$: you add a negative number. Plus minus becomes minus. First write the sum without brackets.`,
          )
        : jumps[0] > 0
          ? L(`Start bij $${a}$ op de getallenlijn. Spring $${jumps[0]}$ naar rechts.`, `Start at $${a}$ on the number line. Jump $${jumps[0]}$ to the right.`)
          : L(`Start bij $${a}$ op de getallenlijn. Spring $${-jumps[0]}$ naar links.`, `Start at $${a}$ on the number line. Jump $${-jumps[0]}$ to the left.`);

    // Typical mistakes, computed from the numbers.
    const neg = terms.find((t) => t.n < 0);
    const ignoredMinus = a + terms.reduce((s, t) => s + (t.n < 0 ? (t.op === "+" ? -t.n : t.n) : jumpOf(t)), 0);
    const mistakes: Array<Mistake | null> = [
      neg
        ? {
            id: neg.op === "-" ? "minus-minus" : "plus-minus",
            latex: String(ignoredMinus),
            explain:
              neg.op === "-"
                ? L(
                    `Let op $-(${neg.n})$. Min min wordt plus: $-(${neg.n})=+${-neg.n}$.`,
                    `Look at $-(${neg.n})$. Minus minus becomes plus: $-(${neg.n})=+${-neg.n}$.`,
                  )
                : L(
                    `Let op $+(${neg.n})$. Plus min wordt min: $+(${neg.n})=${neg.n}$.`,
                    `Look at $+(${neg.n})$. Plus minus becomes minus: $+(${neg.n})=${neg.n}$.`,
                  ),
            relatedSkill: "u1.add-subtract",
          }
        : null,
      difficulty === 1
        ? {
            id: "wrong-way",
            latex: String(a - jumps[0]),
            explain: L(
              `Je sprong de verkeerde kant op. ${jumps[0] > 0 ? `Plus $${jumps[0]}$ is naar rechts.` : `Min $${-jumps[0]}$ is naar links.`}`,
              `You jumped the wrong way. ${jumps[0] > 0 ? `Plus $${jumps[0]}$ is to the right.` : `Minus $${-jumps[0]}$ is to the left.`}`,
            ),
          }
        : null,
      result !== 0
        ? {
            id: "sign",
            latex: String(-result),
            explain: L(
              `Bijna: kijk naar het teken. Kom je links of rechts van $0$ uit?`,
              `Almost: check the sign. Do you end up left or right of $0$?`,
            ),
          }
        : null,
    ];

    const visual =
      difficulty === 2
        ? custom(
            "u1.zero-pairs",
            { a, op: first.op, b: first.n },
            L(
              `Fiches voor $${latex}$. Een plus-fiche en een min-fiche samen zijn nul.`,
              `Counters for $${latex}$. A plus counter and a minus counter together make zero.`,
            ),
          )
        : walkLine(a, jumps);

    return {
      prompt: L("Reken uit.", "Work it out."),
      latex,
      visual,
      answer: { kind: "expr", latex: String(result), form: "integer" },
      calculator: "off",
      hints: {
        nudge,
        rule:
          difficulty === 1
            ? {
                text: L(
                  "De getallenlijn: plus is naar rechts springen, min is naar links springen.",
                  "The number line: plus is jumping right, minus is jumping left.",
                ),
                ruleId: "u1.number-line",
              }
            : {
                text: L(
                  "Min min wordt plus: $a-(-b)=a+b$. Plus min wordt min: $a+(-b)=a-b$.",
                  "Minus minus becomes plus: $a-(-b)=a+b$. Plus minus becomes minus: $a+(-b)=a-b$.",
                ),
                ruleId: "u1.minus-minus",
              },
        solution: { steps },
      },
      mistakes: cleanMistakes(String(result), mistakes),
    };
  },
  verify(ex) {
    // Independent check: the CAS evaluates the printed sum.
    if (ex.answer.kind !== "expr" || !ex.latex) return false;
    return valueOf(ex.latex) === Number(ex.answer.latex);
  },
  isNice(ex) {
    return ex.answer.kind === "expr" && Number.isInteger(Number(ex.answer.latex));
  },
};

// ---------------------------------------------------------------------------
// Multiplying and dividing
// ---------------------------------------------------------------------------

type Factor = { n: number; op: "\\cdot" | ":" };

/** `-6\cdot(-4):3`: the first number without brackets, the others with. */
function productLatex(first: number, rest: Factor[]): string {
  return `${first}${rest.map((f) => `${f.op === ":" ? ":" : "\\cdot "}${br(f.n)}`).join("")}`;
}

export const multiplyDivide: Generator = {
  id: "u1.multiply-divide",
  skillId: "u1.multiply-divide",
  title: L("Keer en delen met negatieve getallen", "Multiplying and dividing negative numbers"),
  generate(rng, difficulty) {
    let first: number;
    let rest: Factor[];
    const sgn = () => rng.sign();
    if (difficulty === 1) {
      // One negative number: a·b or a:b.
      const x = rng.int(2, 9);
      const y = rng.int(2, 9);
      const negFirst = rng.chance();
      if (rng.chance(0.6)) {
        first = negFirst ? -x : x;
        rest = [{ n: negFirst ? y : -y, op: "\\cdot" }];
      } else {
        first = negFirst ? -x * y : x * y;
        rest = [{ n: negFirst ? y : -y, op: ":" }];
      }
    } else if (difficulty === 2) {
      // Both signs random, at least one negative.
      let s1: number, s2: number;
      do [s1, s2] = [sgn(), sgn()];
      while (s1 > 0 && s2 > 0);
      const x = rng.int(2, 12);
      const y = rng.int(2, 9);
      if (rng.chance()) {
        first = s1 * x;
        rest = [{ n: s2 * y, op: "\\cdot" }];
      } else {
        first = s1 * x * y;
        rest = [{ n: s2 * y, op: ":" }];
      }
    } else {
      // Three numbers: a·b·c or a·b:c, with an exact division.
      const signs = [sgn(), sgn(), sgn()];
      if (!signs.some((s) => s < 0)) signs[rng.int(0, 2)] = -1;
      const x = rng.int(2, 6);
      const y = rng.int(2, 6);
      if (rng.chance()) {
        first = signs[0] * x;
        rest = [
          { n: signs[1] * y, op: "\\cdot" },
          { n: signs[2] * rng.int(2, 5), op: "\\cdot" },
        ];
      } else {
        const c = rng.pick([2, 3, 4, 6].filter((d) => (x * y) % d === 0).concat([x]));
        first = signs[0] * x;
        rest = [
          { n: signs[1] * y, op: "\\cdot" },
          { n: signs[2] * c, op: ":" },
        ];
      }
    }
    const latex = productLatex(first, rest);
    const numbers = [first, ...rest.map((f) => f.n)];
    const minus = numbers.filter((n) => n < 0).length;
    const negative = minus % 2 === 1;
    // The size of the answer, computed without signs, left to right.
    let size = Math.abs(first);
    const partials: number[] = [];
    for (const f of rest) {
      size = f.op === ":" ? size / Math.abs(f.n) : size * Math.abs(f.n);
      partials.push(size);
    }
    const result = negative ? -size : size;

    const plain = productLatex(Math.abs(first), rest.map((f) => ({ ...f, n: Math.abs(f.n) })));
    const steps: Step[] = [
      { latex, note: L(`Tel de mintekens: ${minus}.`, `Count the minus signs: ${minus}.`) },
      {
        latex: negative ? `-(\\hl{${plain}})` : `\\hl{${plain}}`,
        note: negative
          ? L(
              minus === 1 ? "Eén minteken: het antwoord wordt negatief. Reken verder zonder tekens." : "Drie mintekens: oneven, dus negatief. Reken verder zonder tekens.",
              minus === 1 ? "One minus sign: the answer is negative. Go on without signs." : "Three minus signs: odd, so negative. Go on without signs.",
            )
          : L("Twee mintekens: die heffen elkaar op. Het antwoord is positief.", "Two minus signs: they cancel. The answer is positive."),
      },
    ];
    // Intermediate results for three numbers.
    if (rest.length === 2) {
      const tail = `${rest[1].op === ":" ? ":" : "\\cdot "}${Math.abs(rest[1].n)}`;
      steps.push({
        latex: negative ? `-(\\ask{${partials[0]}}${tail})` : `\\ask{${partials[0]}}${tail}`,
        note: L("Eerst de eerste twee, van links naar rechts.", "First the first two, from left to right."),
      });
    }
    steps.push({ latex: `\\ask{${result}}`, note: L("Zet het teken voor het antwoord.", "Put the sign in front of the answer.") });

    // Visual: repeated jumps for a small product, else the sign pattern.
    let visual: VisualSpec | undefined;
    if (rest.length === 1 && rest[0].op === "\\cdot") {
      const [p, q] = [first, rest[0].n];
      const k = p > 0 ? p : q > 0 ? q : null; // how many jumps
      const step = p > 0 ? q : p; // size of each jump
      if (k !== null && k <= 5 && Math.abs(step) <= 6) {
        visual = { kind: "number-line", min: Math.min(0, k * step) - 1, max: Math.max(0, k * step) + 1, start: 0, jumps: Array(k).fill(step) };
      } else if (Math.abs(p) <= 5) {
        visual = custom(
          "u1.sign-pattern",
          { b: q, k: p },
          L(`Een tabel met de tafel van $${br(q)}$, van boven naar beneden.`, `A table with the times table of $${br(q)}$, from top to bottom.`),
        );
      }
    }

    const nudge: Loc =
      minus === 1
        ? L(
            `Er staat één minteken. Reken eerst $${plain}$ uit zonder tekens. Wordt het antwoord positief of negatief?`,
            `There is one minus sign. First work out $${plain}$ without signs. Is the answer positive or negative?`,
          )
        : L(
            `Er staan ${minus} mintekens. Reken eerst $${plain}$ uit zonder tekens. Is ${minus} even of oneven?`,
            `There are ${minus} minus signs. First work out $${plain}$ without signs. Is ${minus} even or odd?`,
          );

    return {
      prompt: L("Reken uit.", "Work it out."),
      latex,
      visual,
      answer: { kind: "expr", latex: String(result), form: "integer" },
      calculator: "off",
      hints: {
        nudge,
        rule: {
          text: L(
            "Tekenregel: gelijke tekens geven plus, verschillende tekens geven min. Elk paar mintekens valt weg.",
            "Sign rule: equal signs give plus, different signs give minus. Every pair of minus signs cancels.",
          ),
          ruleId: "u1.sign-rule",
        },
        solution: { steps },
      },
      mistakes: cleanMistakes(String(result), [
        {
          id: "sign",
          latex: String(-result),
          explain: negative
            ? L(`Het getal klopt, het teken niet. Er ${minus === 1 ? "staat één minteken" : `staan ${minus} mintekens`}: oneven, dus negatief.`, `The number is right, the sign is not. There ${minus === 1 ? "is one minus sign" : `are ${minus} minus signs`}: odd, so negative.`)
            : L(`Het getal klopt, het teken niet. Twee mintekens heffen elkaar op: positief.`, `The number is right, the sign is not. Two minus signs cancel: positive.`),
        },
      ]),
    };
  },
  verify(ex) {
    // Independent check: the CAS evaluates the printed product.
    if (ex.answer.kind !== "expr" || !ex.latex) return false;
    return valueOf(ex.latex) === Number(ex.answer.latex);
  },
  isNice(ex) {
    return ex.answer.kind === "expr" && Number.isInteger(Number(ex.answer.latex));
  },
};
