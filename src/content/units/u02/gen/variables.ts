/**
 * Lessons 1 and 2: letters stand for numbers. Filling in a value
 * (invullen) and combining like terms (gelijksoortige termen samennemen).
 */
import type { Difficulty, Generator, Loc, Step } from "@/content/types";
import { equivalent, evaluate, parse } from "@/math/cas";
import type { Mistake } from "@/math/check";
import { sum, term } from "@/math/latex";
import type { Rng } from "@/math/random";
import { custom, givenValues, L, par } from "../helpers";
import { combineTerms, termsLatex, type TileTerm } from "../widgets/models";

/** Keeps the mistakes that are really wrong and different from each other. */
function realMistakes(answer: string, list: Mistake[]): Mistake[] {
  const out: Mistake[] = [];
  for (const m of list) {
    if (equivalent(m.latex, answer)) continue;
    if (out.some((o) => equivalent(o.latex, m.latex))) continue;
    out.push(m);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Filling in (invullen)
// ---------------------------------------------------------------------------

type Fill = {
  latex: string;
  values: Record<string, number>;
  steps: Step[];
  answer: number;
  nudge: Loc;
  mistakes: Mistake[];
  tiles?: TileTerm[];
};

/** `3x+2` with x = 4: fill in, multiply, add. */
function fillLinear(terms: TileTerm[], x: number): Fill {
  const latex = termsLatex(terms);
  const hlFilled = terms
    .map(([c, k], i) => {
      let s: string;
      if (k === "1") s = String(c);
      else if (c === 1) s = `\\hl{${par(x)}}`;
      else if (c === -1) s = `-\\hl{${par(x)}}`;
      else s = `${c}\\cdot\\hl{${par(x)}}`;
      return i === 0 || s.startsWith("-") ? s : `+${s}`;
    })
    .join("");
  const xi = terms.findIndex(([, k]) => k === "x");
  const [a] = terms[xi];
  const prod = a * x;
  // Products written out: the x-term becomes its value (asked), the number stays.
  const products = terms
    .map(([c, k], i) => {
      const v = k === "x" ? prod : c;
      let s = String(v);
      if (k === "x") s = i === 0 ? `\\ask{${v}}` : v < 0 ? `-\\ask{${-v}}` : `+\\ask{${v}}`;
      else if (i > 0 && v >= 0) s = `+${v}`;
      return s;
    })
    .join("");
  const answer = terms.reduce((s, [c, k]) => s + (k === "x" ? c * x : c), 0);
  const b = terms.find(([, k]) => k === "1")?.[0] ?? 0;
  const steps: Step[] = [
    { latex: hlFilled, note: L(`Vul in: op de plek van $x$ komt $${x}$.`, `Fill in: $${x}$ goes where $x$ was.`) },
    terms[0][1] === "1" && a < 0
      ? // `9-3x`: the step shows `9-9`, so the note works with $3\cdot 3$.
        { latex: products, note: L(`Eerst keer: $${-a}\\cdot ${par(x)}=${-prod}$.`, `Multiply first: $${-a}\\cdot ${par(x)}=${-prod}$.`) }
      : { latex: products, note: L(`Eerst keer: $${a}\\cdot ${par(x)}=${prod}$.`, `Multiply first: $${a}\\cdot ${par(x)}=${prod}$.`) },
    { latex: `\\ask{${answer}}`, note: L("Reken uit.", "Work it out.") },
  ];
  const mistakes: Mistake[] = [];
  if (x > 0 && x < 10 && a > 1) {
    mistakes.push({
      id: "glued",
      latex: String(terms.reduce((s, [c, k]) => s + (k === "x" ? 10 * c + x : c), 0)),
      explain: L(
        `$${a}x$ betekent $${a}\\cdot x$. Het is niet het getal $${a}${x}$.`,
        `$${a}x$ means $${a}\\cdot x$. It is not the number $${a}${x}$.`,
      ),
    });
  }
  if (a > 1) {
    mistakes.push({
      id: "plus-instead-of-times",
      latex: String(terms.reduce((s, [c, k]) => s + (k === "x" ? c + x : c), 0)),
      explain: L(
        `Tussen $${a}$ en $x$ staat een onzichtbare keer. Dus $${a}\\cdot ${par(x)}$, niet $${a}+${par(x)}$.`,
        `There is an invisible times between $${a}$ and $x$. So $${a}\\cdot ${par(x)}$, not $${a}+${par(x)}$.`,
      ),
    });
  }
  if (x < 0) {
    mistakes.push({
      id: "lost-minus",
      latex: String(terms.reduce((s, [c, k]) => s + (k === "x" ? c * -x : c), 0)),
      explain: L(
        `Let op het minteken van $x$: $${a}\\cdot ${par(x)}=${prod}$.`,
        `Mind the minus sign of $x$: $${a}\\cdot ${par(x)}=${prod}$.`,
      ),
    });
  }
  if (terms[0][1] === "1" && a < 0) {
    // b - ax worked out from left to right: (b - a)·x.
    mistakes.push({
      id: "left-to-right",
      latex: String((b + a) * x),
      explain: L(
        `Keer gaat vóór min. Reken eerst $${-a}\\cdot ${par(x)}$ uit.`,
        `Multiplying comes before subtracting. Work out $${-a}\\cdot ${par(x)}$ first.`,
      ),
      relatedSkill: "u0.order-of-operations",
    });
  }
  const sign = b > 0 ? `+${b}` : `${b}`;
  return {
    latex,
    values: { x },
    steps,
    answer,
    nudge:
      terms[0][1] === "1"
        ? L(
            `Keer gaat vóór min. Reken eerst $${-a}\\cdot ${x}$ uit. Haal dat daarna van $${b}$ af.`,
            `Multiplying comes before subtracting. First work out $${-a}\\cdot ${x}$. Then take that away from $${b}$.`,
          )
        : x < 0
        ? L(
            `Zet $${x}$ op de plek van $x$, tussen haakjes: $${a}\\cdot (${x})$. Plus keer min is min.`,
            `Put $${x}$ where $x$ is, in brackets: $${a}\\cdot (${x})$. Plus times minus is minus.`,
          )
        : L(
            `$${term(a, "x")}$ betekent $${a}\\cdot x$. Reken eerst $${a}\\cdot ${x}$ uit. Doe daarna $${sign}$.`,
            `$${term(a, "x")}$ means $${a}\\cdot x$. First work out $${a}\\cdot ${x}$. Then do $${sign}$.`,
          ),
    mistakes,
    tiles: terms,
  };
}

/** `x^2+bx` with a negative x. */
function fillSquare(rng: Rng): Fill {
  const x = -rng.int(2, 5);
  const b = rng.nonZeroInt(-6, 6);
  const latex = `x^{2}${b > 0 ? "+" : ""}${term(b, "x")}`;
  const sq = x * x;
  const bx = b * x;
  const answer = sq + bx;
  const bPart = b === 1 ? `+(\\hl{${x}})` : b === -1 ? `-(\\hl{${x}})` : `${b > 0 ? "+" : ""}${b}\\cdot(\\hl{${x}})`;
  const steps: Step[] = [
    { latex: `(\\hl{${x}})^{2}${bPart}`, note: L(`Vul in: $x=${x}$. Zet het tussen haakjes.`, `Fill in: $x=${x}$. Put it in brackets.`) },
    { latex: `\\ask{${sq}}${bPart.replace(/\\hl\{(-?\d+)\}/, "$1")}`, note: L(`Eerst de macht: $(${x})^{2}=(${x})\\cdot(${x})=${sq}$.`, `The power first: $(${x})^{2}=(${x})\\cdot(${x})=${sq}$.`) },
    {
      latex: `${sq}${bx < 0 ? `-\\ask{${-bx}}` : `+\\ask{${bx}}`}`,
      note:
        b === 1
          ? L(`Plus een min-getal is min: $+(${x})=${bx}$.`, `Adding a negative number is subtracting: $+(${x})=${bx}$.`)
          : b === -1
            ? L(`Min een min-getal is plus: $-(${x})=+${bx}$.`, `Subtracting a negative number is adding: $-(${x})=+${bx}$.`)
            : L(`Dan keer: $${b}\\cdot(${x})=${bx}$.`, `Then multiply: $${b}\\cdot(${x})=${bx}$.`),
    },
    { latex: `\\ask{${answer}}`, note: L("Reken uit.", "Work it out.") },
  ];
  return {
    latex,
    values: { x },
    steps,
    answer,
    nudge: L(
      `Vul $(${x})$ in, met haakjes. $(${x})^{2}$ betekent $(${x})\\cdot(${x})$.`,
      `Fill in $(${x})$, with brackets. $(${x})^{2}$ means $(${x})\\cdot(${x})$.`,
    ),
    mistakes: [
      {
        id: "minus-square",
        latex: String(-sq + bx),
        explain: L(
          `$(${x})^{2}=(${x})\\cdot(${x})=${sq}$. Min keer min is plus.`,
          `$(${x})^{2}=(${x})\\cdot(${x})=${sq}$. Minus times minus is plus.`,
        ),
      },
      {
        id: "times-two",
        latex: String(2 * x + bx),
        explain: L(`Kwadraat is keer zichzelf: $(${x})\\cdot(${x})$, niet $2\\cdot(${x})$.`, `Squaring is times itself: $(${x})\\cdot(${x})$, not $2\\cdot(${x})$.`),
      },
    ],
  };
}

/** `ap+bq` with two letters. */
function fillTwo(rng: Rng): Fill {
  const [v, w] = rng.pick([["p", "q"], ["a", "b"], ["s", "t"]] as const);
  const a = rng.int(2, 6);
  const b = rng.pick([-1, 1]) * rng.int(2, 6);
  const p = rng.nonZeroInt(-4, 6);
  const q = rng.nonZeroInt(-4, 6);
  const latex = `${a}${v}${b > 0 ? "+" : ""}${b}${w}`;
  const ap = a * p;
  const bq = b * q;
  const answer = ap + bq;
  const steps: Step[] = [
    {
      latex: `${a}\\cdot\\hl{${par(p)}}${b > 0 ? "+" : ""}${b}\\cdot\\hl{${par(q)}}`,
      note: L(`Vul in: $${v}=${p}$ en $${w}=${q}$.`, `Fill in: $${v}=${p}$ and $${w}=${q}$.`),
    },
    { latex: `\\ask{${ap}}${b > 0 ? "+" : ""}${b}\\cdot${par(q)}`, note: L(`$${a}\\cdot ${par(p)}=${ap}$.`, `$${a}\\cdot ${par(p)}=${ap}$.`) },
    { latex: `${ap}${bq < 0 ? `-\\ask{${-bq}}` : `+\\ask{${bq}}`}`, note: L(`$${b}\\cdot ${par(q)}=${bq}$.`, `$${b}\\cdot ${par(q)}=${bq}$.`) },
    { latex: `\\ask{${answer}}`, note: L("Reken uit.", "Work it out.") },
  ];
  const mistakes: Mistake[] = [];
  if (b < 0 && q < 0) {
    mistakes.push({
      id: "minus-times-minus",
      latex: String(ap - Math.abs(bq)),
      explain: L(`$${b}\\cdot(${q})$: min keer min is plus. Dat is $+${bq}$.`, `$${b}\\cdot(${q})$: minus times minus is plus. That is $+${bq}$.`),
    });
  }
  if (p > 0 && p < 10) {
    mistakes.push({
      id: "glued",
      latex: String(10 * a + p + bq),
      explain: L(`$${a}${v}$ betekent $${a}\\cdot ${v}$, niet het getal $${a}${p}$.`, `$${a}${v}$ means $${a}\\cdot ${v}$, not the number $${a}${p}$.`),
    });
  }
  return {
    latex,
    values: { [v]: p, [w]: q },
    steps,
    answer,
    nudge:
      p < 0 || q < 0
        ? L(
            `Vul $${p}$ in voor $${v}$ en $${q}$ in voor $${w}$. Zet negatieve getallen tussen haakjes.`,
            `Fill in $${p}$ for $${v}$ and $${q}$ for $${w}$. Put negative numbers in brackets.`,
          )
        : L(
            `Vul $${p}$ in voor $${v}$ en $${q}$ in voor $${w}$. Reken eerst de twee keersommen uit.`,
            `Fill in $${p}$ for $${v}$ and $${q}$ for $${w}$. Work out the two multiplications first.`,
          ),
    mistakes,
  };
}

function pickFill(rng: Rng, difficulty: Difficulty): Fill {
  if (difficulty === 1) {
    const a = rng.int(2, 6);
    const b = rng.int(1, 9);
    return fillLinear([[a, "x"], [b, "1"]], rng.int(1, 6));
  }
  if (difficulty === 2) {
    const a = rng.int(2, 5);
    const b = rng.int(1, 9);
    const kind = rng.int(0, 2);
    if (kind === 0) return fillLinear([[a, "x"], [-b, "1"]], -rng.int(1, 5));
    if (kind === 1) return fillLinear([[a, "x"], [b, "1"]], -rng.int(1, 5));
    return fillLinear([[b + rng.int(1, 6), "1"], [-a, "x"]], rng.int(2, 6));
  }
  return rng.chance() ? fillSquare(rng) : fillTwo(rng);
}

function valuesText(values: Record<string, number>, and: string): string {
  return Object.entries(values)
    .map(([k, v]) => `$${k}=${v}$`)
    .join(` ${and} `);
}

export const evaluateExpr: Generator = {
  id: "u2.evaluate",
  skillId: "u2.evaluate",
  title: L("Invullen", "Filling in"),
  generate(rng, difficulty) {
    const f = pickFill(rng, difficulty);
    const answer = String(f.answer);
    return {
      prompt: L(`Bereken $${f.latex}$ als ${valuesText(f.values, "en")}.`, `Work out $${f.latex}$ when ${valuesText(f.values, "and")}.`),
      latex: f.latex,
      answer: { kind: "expr", latex: answer, form: "integer" },
      calculator: "off",
      visual: f.tiles
        ? custom(
            "u2.tiles",
            { terms: f.tiles, mode: "value", x: f.values.x },
            L(`Blokken voor $${f.latex}$. Elk $x$-blok is $${f.values.x}$ waard.`, `Blocks for $${f.latex}$. Every $x$-block is worth $${f.values.x}$.`),
          )
        : undefined,
      hints: {
        nudge: f.nudge,
        rule: {
          text: L(
            "Een letter is een getal. Vul het getal in, tussen haakjes als het negatief is. Een getal voor een letter betekent keer.",
            "A letter is a number. Fill in the number, in brackets when it is negative. A number in front of a letter means times.",
          ),
          ruleId: "u2.variable",
          mnemonic: "hmwvdoa",
        },
        solution: { steps: f.steps },
      },
      mistakes: realMistakes(answer, f.mistakes),
    };
  },
  verify(ex) {
    // Independent check: let the CAS evaluate the original expression.
    if (ex.answer.kind !== "expr" || !ex.latex) return false;
    const v = evaluate(parse(ex.latex), givenValues(ex.prompt.nl));
    return v !== null && Math.abs(v - Number(ex.answer.latex)) < 1e-9;
  },
  isNice(ex) {
    return ex.answer.kind === "expr" && Number.isInteger(Number(ex.answer.latex)) && Math.abs(Number(ex.answer.latex)) <= 120;
  },
};

// ---------------------------------------------------------------------------
// Like terms (gelijksoortige termen samennemen)
// ---------------------------------------------------------------------------

/** Terms for each difficulty. The first term is always positive. */
function likeTerms(rng: Rng, difficulty: Difficulty): TileTerm[] {
  if (difficulty === 1) {
    if (rng.chance()) {
      const n = rng.int(2, 3);
      return Array.from({ length: n }, () => [rng.int(1, 6), "x"] as TileTerm);
    }
    return rng.shuffle([[rng.int(1, 6), "x"], [rng.int(1, 6), "x"], [rng.int(1, 7), "1"]] as TileTerm[]);
  }
  if (difficulty === 2) {
    const c = rng.int(1, 4);
    const a = c + rng.int(1, 4);
    const terms: TileTerm[] = [[a, "x"], [rng.int(1, 7), "1"], [-c, "x"], [rng.int(1, 7), "1"]];
    const [first, ...rest] = terms;
    return [first, ...rng.shuffle(rest)];
  }
  // Difficulty 3: minus signs everywhere, the answer may be negative.
  for (;;) {
    const terms: TileTerm[] = rng.shuffle([
      [rng.nonZeroInt(-6, 6), "x"],
      [rng.nonZeroInt(-6, 6), "x"],
      [rng.nonZeroInt(-7, 7), "1"],
      [rng.nonZeroInt(-7, 7), "1"],
    ] as TileTerm[]);
    const sum = combineTerms(terms);
    if (terms[0][0] > 0 && terms.some(([c]) => c < 0) && sum.x !== 0) return terms;
  }
}

export const combineLikeTerms: Generator = {
  id: "u2.like-terms",
  skillId: "u2.like-terms",
  title: L("Gelijksoortige termen samennemen", "Combining like terms"),
  generate(rng, difficulty) {
    const terms = likeTerms(rng, difficulty);
    const latex = termsLatex(terms);
    const xs = terms.filter(([, k]) => k === "x");
    const ones = terms.filter(([, k]) => k === "1");
    const { x: X, ones: C } = combineTerms(terms);
    const answer = sum([[X, "x"], [C, ""]]);

    const xsLatex = termsLatex(xs);
    const onesTail = termsLatex(ones).replace(/^(?=\d)/, "+");
    const steps: Step[] = [{ latex, note: L("Dit is de som.", "This is the expression.") }];
    if (ones.length > 0) {
      // Only reorder when the terms are not already sorted.
      if (`${xsLatex}${onesTail}` !== latex) {
        steps.push({ latex: `\\hl{${xsLatex}}${onesTail}`, note: L("Zet de $x$-termen naast elkaar, en de losse getallen ook.", "Put the $x$-terms together, and the plain numbers too.") });
      }
      steps.push({ latex: `\\ask{${term(X, "x")}}${onesTail}`, note: L(`Tel de $x$-blokken: $${xsLatex}=${term(X, "x")}$.`, `Count the $x$-blocks: $${xsLatex}=${term(X, "x")}$.`) });
      if (ones.length === 1) {
        // One plain number: nothing to add up, the previous line is the answer.
      } else if (C !== 0) {
        steps.push({
          latex: `${term(X, "x")}${C < 0 ? `-\\ask{${-C}}` : `+\\ask{${C}}`}`,
          note: L(`Tel de losse getallen: $${termsLatex(ones)}=${C}$.`, `Add the plain numbers: $${termsLatex(ones)}=${C}$.`),
        });
      } else {
        steps.push({ latex: term(X, "x"), note: L("De losse getallen samen zijn $0$.", "The plain numbers together make $0$.") });
      }
    } else {
      steps.push({ latex: `\\ask{${term(X, "x")}}`, note: L(`Tel de $x$-blokken: $${xsLatex}=${term(X, "x")}$.`, `Count the $x$-blocks: $${xsLatex}=${term(X, "x")}$.`) });
    }

    const mistakes: Mistake[] = [];
    if (xs.length >= 2) {
      mistakes.push({
        id: "squared",
        latex: sum([[X, "x^{2}"], [C, ""]]),
        explain: L(
          `$${xsLatex}=${term(X, "x")}$, niet $${term(X, "x^{2}")}$. Je telt blokken bij elkaar op. Je vermenigvuldigt niet.`,
          `$${xsLatex}=${term(X, "x")}$, not $${term(X, "x^{2}")}$. You add blocks together. You do not multiply.`,
        ),
      });
    }
    if (C !== 0 && X + C !== 0) {
      mistakes.push({
        id: "all-together",
        latex: term(X + C, "x"),
        explain: L(
          "Losse getallen zijn geen $x$-blokken. Die tel je apart.",
          "Plain numbers are not $x$-blocks. You add them separately.",
        ),
      });
    }
    const negX = xs.find(([c]) => c < 0);
    if (negX) {
      mistakes.push({
        id: "lost-minus",
        latex: sum([[X - 2 * negX[0], "x"], [C, ""]]),
        explain: L(
          `Het minteken hoort bij de term erachter. $${term(negX[0], "x")}$ betekent: $${term(-negX[0], "x")}$ eraf.`,
          `The minus sign belongs to the term after it. $${term(negX[0], "x")}$ means: take $${term(-negX[0], "x")}$ away.`,
        ),
      });
    }
    const listX = xs.map(([c]) => `$${term(c, "x")}$`).join(", ");
    const listOnes = ones.map(([c]) => `$${c > 0 ? "+" : ""}${c}$`).join(", ");

    return {
      prompt: L("Maak zo kort mogelijk.", "Make it as short as possible."),
      latex,
      answer: { kind: "expr", latex: answer, form: "expanded" },
      calculator: "off",
      visual: custom(
        "u2.tiles",
        { terms, mode: "combine" },
        L(`Blokken voor $${latex}$: lange blokken zijn $x$, kleine blokjes zijn $1$.`, `Blocks for $${latex}$: long blocks are $x$, small blocks are $1$.`),
      ),
      hints: {
        nudge:
          ones.length > 0
            ? L(`De $x$-termen zijn ${listX}. De losse getallen zijn ${listOnes}. Neem ze apart samen.`, `The $x$-terms are ${listX}. The plain numbers are ${listOnes}. Combine them separately.`)
            : L(`Tel alle $x$-blokken: ${listX}. Hoeveel $x$ is dat samen?`, `Count all $x$-blocks: ${listX}. How many $x$ is that together?`),
        rule: {
          text: L(
            "Gelijke soorten samen: $x$ bij $x$, getallen bij getallen. Het teken hoort bij de term erachter.",
            "Like with like: $x$ with $x$, numbers with numbers. The sign belongs to the term after it.",
          ),
          ruleId: "u2.like-terms",
        },
        solution: { steps },
      },
      mistakes: realMistakes(answer, mistakes),
    };
  },
  verify(ex) {
    // Independent check: the CAS compares the answer with the original, and
    // the answer must really be short (at most one x-term and one number).
    if (ex.answer.kind !== "expr" || !ex.latex) return false;
    const short = (ex.answer.latex.match(/x/g) ?? []).length <= 1;
    return short && equivalent(ex.latex, ex.answer.latex);
  },
};
