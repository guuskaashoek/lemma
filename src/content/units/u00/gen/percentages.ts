/**
 * Lesson 5 generators: a percentage of an amount, a price that goes up or
 * down by a percentage (growth factor), and "what percentage is this?".
 */
import Fraction from "fraction.js";
import { equivalent, evaluate, parse } from "@/math/cas";
import { roundHalfAwayFromZero, type Mistake } from "@/math/check";
import type { Rng } from "@/math/random";
import type { Generator, Loc, Step } from "@/content/types";
import { L, custom, dec, money, propsOf } from "../helpers";

// ---------------------------------------------------------------------------
// p% of N
// ---------------------------------------------------------------------------

/** Easy percentages and the simple fraction they are. */
const EASY: Array<{ p: number; k: number }> = [
  { p: 50, k: 2 },
  { p: 25, k: 4 },
  { p: 20, k: 5 },
  { p: 10, k: 10 },
  { p: 1, k: 100 },
];

export const percentOf: Generator = {
  id: "u0.percent-of",
  skillId: "u0.percent-of",
  title: L("Procent van een getal", "Percentage of a number"),
  generate(rng, difficulty) {
    let p: number, N: number;
    let steps: Step[];
    let nudge: Loc;
    if (difficulty === 1) {
      const e = rng.pick(EASY);
      p = e.p;
      N = e.k * rng.int(e.k === 100 ? 2 : 3, e.k === 100 ? 9 : 40);
      const ans = N / e.k;
      steps = [
        { latex: `${p}\\%\\cdot ${N}`, note: L(`$${p}\\%$ is $\\frac{1}{${e.k}}$ deel.`, `$${p}\\%$ is $\\frac{1}{${e.k}}$ of it.`) },
        { latex: `\\frac{${N}}{\\hl{${e.k}}}`, note: L(`Deel door $${e.k}$.`, `Divide by $${e.k}$.`) },
        { latex: `\\ask{${ans}}`, note: L("Reken uit.", "Work it out.") },
      ];
      nudge = L(
        `$${p}\\%$ is $\\frac{1}{${e.k}}$ deel van het geheel. Wat is $${N}:${e.k}$?`,
        `$${p}\\%$ is $\\frac{1}{${e.k}}$ of the whole. What is $${N}:${e.k}$?`,
      );
    } else if (difficulty === 2) {
      // Via 1%: N is a multiple of 20, so every multiple of 5% is whole.
      do p = 5 * rng.int(1, 19);
      while (EASY.some((e) => e.p === p));
      N = 20 * rng.int(2, 25);
      const one = new Fraction(N, 100);
      steps = [
        { latex: `${p}\\%\\cdot ${N}`, note: L("Reken via $1\\%$.", "Work through $1\\%$.") },
        { latex: `\\frac{${N}}{100}\\cdot ${p}`, note: L("$1\\%$ is het geheel gedeeld door $100$.", "$1\\%$ is the whole divided by $100$.") },
        { latex: `\\ask{${dec(one)}}\\cdot ${p}`, note: L(`$1\\%$ van $${N}$.`, `$1\\%$ of $${N}$.`) },
        { latex: `\\ask{${dec(one.mul(p))}}`, note: L(`Keer $${p}$ voor $${p}\\%$.`, `Times $${p}$ for $${p}\\%$.`) },
      ];
      nudge = L(
        `Reken eerst $1\\%$ van $${N}$ uit: $${N}:100$. Doe dat daarna keer $${p}$.`,
        `First work out $1\\%$ of $${N}$: $${N}:100$. Then multiply that by $${p}$.`,
      );
    } else {
      // With the calculator: multiply by the decimal p/100.
      p = rng.int(2, 98);
      N = rng.int(40, 960);
      const f = new Fraction(p, 100);
      steps = [
        { latex: `${p}\\%\\cdot ${N}`, note: L(`$${p}\\%$ is $${dec(f)}$ deel.`, `$${p}\\%$ is $${dec(f)}$ of it.`) },
        { latex: `\\ask{${dec(f)}}\\cdot ${N}`, note: L(`Schrijf $${p}\\%$ als kommagetal: $${p}:100$.`, `Write $${p}\\%$ as a decimal: $${p}:100$.`) },
        { latex: `\\ask{${dec(f.mul(N))}}`, note: L("Reken uit met de rekenmachine.", "Work it out with the calculator.") },
      ];
      nudge = L(
        `$${p}\\%$ is $${p}$ honderdsten. Reken $${dec(f)}\\cdot ${N}$.`,
        `$${p}\\%$ is $${p}$ hundredths. Work out $${dec(f)}\\cdot ${N}$.`,
      );
    }
    const answer = new Fraction(p * N, 100);
    const mistakes: Mistake[] = [
      {
        id: "forgot-100",
        latex: String(p * N),
        explain: L(
          `Je deed $${p}\\cdot ${N}$. Vergeet niet te delen door $100$: procent betekent per honderd.`,
          `You did $${p}\\cdot ${N}$. Do not forget to divide by $100$: per cent means per hundred.`,
        ),
      },
    ];
    const divided = new Fraction(N, p);
    if (p > 1 && !divided.equals(answer) && Number.isInteger(divided.valueOf())) {
      mistakes.push({
        id: "divided-by-p",
        latex: dec(divided),
        explain: L(`Je deelde door $${p}$. Deel door $100$ en doe keer $${p}$.`, `You divided by $${p}$. Divide by $100$ and multiply by $${p}$.`),
      });
    }

    return {
      prompt: L(`Hoeveel is $${p}\\%$ van $${N}$? Van betekent keer.`, `What is $${p}\\%$ of $${N}$? Of means times.`),
      latex: `${p}\\%\\cdot ${N}`,
      visual: custom(
        "u0.hundred-grid",
        { percent: p, whole: N },
        L(`Honderd vakjes samen zijn $${N}$. Je kleurt er $${p}$.`, `A hundred squares together are $${N}$. You colour $${p}$ of them.`),
      ),
      answer: { kind: "expr", latex: dec(answer), form: "any" },
      calculator: difficulty === 3 ? "allowed" : "off",
      hints: {
        nudge,
        rule: {
          text: L(
            "Procent betekent per honderd. $1\\%$ is het geheel gedeeld door $100$. $p\\%$ van iets is $\\frac{p}{100}$ keer dat.",
            "Per cent means per hundred. $1\\%$ is the whole divided by $100$. $p\\%$ of something is $\\frac{p}{100}$ times it.",
          ),
          ruleId: "u0.percent",
        },
        solution: { steps },
      },
      mistakes,
    };
  },
  verify(ex) {
    // Independent check: the CAS reads "p\%" itself and multiplies.
    const props = propsOf(ex, "u0.hundred-grid") as { percent: number; whole: number } | null;
    if (!props || ex.answer.kind !== "expr") return false;
    return equivalent(`${props.percent}\\%\\cdot ${props.whole}`, ex.answer.latex);
  },
  isNice(ex) {
    return ex.answer.kind === "expr" && !/\.\d{3,}/.test(ex.answer.latex);
  },
};

// ---------------------------------------------------------------------------
// Price up or down by p% (groeifactor)
// ---------------------------------------------------------------------------

type ChangeContext = {
  up: boolean;
  /** Realistic percentages for level 2, when only a few make sense (btw is 9% or 21%). */
  percents?: number[];
  /** A realistic starting amount for level 2. */
  amount: (rng: Rng) => Fraction;
  text: (N: string, p: number) => Loc;
  reverse?: (X: string, p: number) => Loc;
};

const DOWN: ChangeContext[] = [
  {
    up: false,
    amount: (rng) => new Fraction(rng.int(8, 40) * 5),
    text: (N, p) => L(`Een jas kost $${N}$ euro. Je krijgt $${p}\\%$ korting. Wat is de nieuwe prijs?`, `A coat costs $${N}$ euros. You get $${p}\\%$ off. What is the new price?`),
    reverse: (X, p) =>
      L(`Na $${p}\\%$ korting kost een jas $${X}$ euro. Wat was de oude prijs?`, `After $${p}\\%$ off, a coat costs $${X}$ euros. What was the old price?`),
  },
  {
    up: false,
    amount: (rng) => new Fraction(rng.int(20, 200) * 5),
    text: (N, p) =>
      L(`Een telefoon kost $${N}$ euro. Hij wordt $${p}\\%$ goedkoper. Wat kost hij nu?`, `A phone costs $${N}$ euros. It gets $${p}\\%$ cheaper. What does it cost now?`),
    reverse: (X, p) =>
      L(`Een telefoon is $${p}\\%$ goedkoper geworden. Hij kost nu $${X}$ euro. Wat kostte hij eerst?`, `A phone got $${p}\\%$ cheaper. It now costs $${X}$ euros. What did it cost before?`),
  },
];
const UP: ChangeContext[] = [
  {
    up: true,
    amount: (rng) => new Fraction(rng.int(1100, 1800), 100),
    text: (N, p) =>
      L(`Je verdient $${N}$ euro per uur. Je krijgt $${p}\\%$ loonsverhoging. Wat verdien je nu per uur?`, `You earn $${N}$ euros per hour. You get a $${p}\\%$ pay rise. What do you earn per hour now?`),
  },
  {
    up: true,
    percents: [9, 21],
    amount: (rng) => new Fraction(rng.int(30, 120) * 10),
    text: (N, p) =>
      L(`Een fiets kost $${N}$ euro zonder btw. Er komt $${p}\\%$ btw bij. Wat is de prijs met btw?`, `A bike costs $${N}$ euros without VAT. $${p}\\%$ VAT is added. What is the price with VAT?`),
    reverse: (X, p) =>
      L(`Een fiets kost $${X}$ euro met $${p}\\%$ btw. Wat is de prijs zonder btw?`, `A bike costs $${X}$ euros including $${p}\\%$ VAT. What is the price without VAT?`),
  },
];

export const percentChange: Generator = {
  id: "u0.percent-change",
  skillId: "u0.percent-change",
  title: L("Procent erbij of eraf", "Percentage up or down"),
  generate(rng, difficulty) {
    let ctx: ChangeContext, p: number, N: Fraction;
    const reverse = difficulty === 3;
    if (difficulty === 1) {
      ctx = rng.pick(DOWN);
      p = rng.pick([10, 20, 25, 50]);
      N = new Fraction(20 * rng.int(2, 30));
    } else if (difficulty === 2) {
      ctx = rng.pick([...DOWN, ...UP]);
      p = ctx.percents ? rng.pick(ctx.percents) : ctx.up ? rng.int(2, 9) : rng.int(3, 15) * 2;
      N = ctx.amount(rng);
    } else {
      ctx = rng.pick([...DOWN, ...UP].filter((c) => c.reverse));
      p = ctx.up ? rng.pick([9, 21]) : rng.pick([10, 20, 25, 30, 40]);
      N = new Fraction(ctx.up ? 100 * rng.int(2, 15) : 5 * rng.int(10, 150));
    }
    const factor = new Fraction(ctx.up ? 100 + p : 100 - p, 100);
    const X = N.mul(factor);
    const F = dec(factor);
    const sign = ctx.up ? "+" : "-";

    let steps: Step[];
    let answer: string;
    let prompt: Loc;
    let decimals: number | undefined;
    const mistakes: Mistake[] = [];

    if (!reverse) {
      const cents = !X.mul(100).equals(X.mul(100).floor());
      prompt = cents
        ? L(`${ctx.text(money(N), p).nl} Rond af op centen.`, `${ctx.text(money(N), p).en} Round to cents.`)
        : ctx.text(money(N), p);
      steps = [
        {
          latex: `${dec(N)}\\cdot\\frac{100${sign}${p}}{100}`,
          note: ctx.up
            ? L(`Er komt $${p}\\%$ bij. Je hebt dan $100+${p}$ procent.`, `$${p}\\%$ is added. Then you have $100+${p}$ per cent.`)
            : L(`Er gaat $${p}\\%$ af. Je houdt $100-${p}$ procent over.`, `$${p}\\%$ comes off. You keep $100-${p}$ per cent.`),
        },
        { latex: `${dec(N)}\\cdot\\ask{${F}}`, note: L("Dat is de groeifactor.", "That is the growth factor.") },
        { latex: `\\ask{${dec(X)}}`, note: L("Reken uit.", "Work it out.") },
      ];
      // Money: round to cents when needed.
      if (cents) {
        decimals = 2;
        steps.push({ latex: `${dec(X)}\\approx \\ask{${roundHalfAwayFromZero(X.valueOf(), 2)}}`, note: L("Rond af op centen.", "Round to cents."), approx: { decimals: 2 } });
      }
      answer = dec(X);
      const onlyChange = N.mul(p).div(100);
      if (!onlyChange.equals(X)) mistakes.push({
        id: "only-change",
        latex: dec(onlyChange),
        explain: ctx.up
          ? L(`Dat is alleen de verhoging. Tel die nog op bij $${money(N)}$.`, `That is only the increase. Add it to $${money(N)}$.`)
          : L(`Dat is alleen de korting. Haal die nog van $${money(N)}$ af.`, `That is only the discount. Take it off $${money(N)}$.`),
      });
      const otherWay = N.mul(new Fraction(ctx.up ? 100 - p : 100 + p, 100));
      mistakes.push({
        id: "wrong-way",
        latex: dec(otherWay),
        explain: ctx.up
          ? L(`Er komt iets bij, dus het wordt meer. Neem $100+${p}=${100 + p}$ procent.`, `Something is added, so it gets more. Take $100+${p}=${100 + p}$ per cent.`)
          : L(`Er gaat iets af, dus het wordt minder. Neem $100-${p}=${100 - p}$ procent.`, `Something comes off, so it gets less. Take $100-${p}=${100 - p}$ per cent.`),
      });
    } else {
      prompt = ctx.reverse!(money(X), p);
      steps = [
        { latex: `\\frac{${dec(X)}}{${F}}`, note: L(`$${money(X)}$ is $${ctx.up ? 100 + p : 100 - p}\\%$ van de oude prijs. Deel door de groeifactor $${F}$.`, `$${money(X)}$ is $${ctx.up ? 100 + p : 100 - p}\\%$ of the old price. Divide by the growth factor $${F}$.`) },
        { latex: `\\ask{${dec(N)}}`, note: L("Reken uit.", "Work it out.") },
      ];
      answer = dec(N);
      const naive = X.mul(new Fraction(ctx.up ? 100 - p : 100 + p, 100));
      if (!naive.equals(N)) {
        mistakes.push({
          id: "percent-of-new",
          latex: dec(naive),
          explain: L(
            `Je rekende $${p}\\%$ van de nieuwe prijs. Maar de $${p}\\%$ hoort bij de oude prijs. Deel daarom door $${F}$.`,
            `You took $${p}\\%$ of the new price. But the $${p}\\%$ belongs to the old price. So divide by $${F}$.`,
          ),
        });
      }
    }

    return {
      prompt,
      visual: custom(
        "u0.percent-bar",
        { from: N.valueOf(), to: X.valueOf(), percent: p, up: ctx.up, reverse },
        L(
          `Een strook van $100\\%$. Er gaat $${p}\\%$ ${ctx.up ? "bij" : "af"}. De nieuwe strook is $${ctx.up ? 100 + p : 100 - p}\\%$.`,
          `A bar of $100\\%$. $${p}\\%$ is ${ctx.up ? "added" : "taken off"}. The new bar is $${ctx.up ? 100 + p : 100 - p}\\%$.`,
        ),
      ),
      answer: decimals ? { kind: "expr", latex: answer, form: "decimal", decimals, unit: "euro" } : { kind: "expr", latex: answer, form: "any", unit: "euro" },
      calculator: difficulty === 1 ? "off" : "allowed",
      hints: {
        nudge: reverse
          ? L(
              `De nieuwe prijs $${money(X)}$ is $${ctx.up ? 100 + p : 100 - p}\\%$ van de oude. Welk getal keer $${F}$ geeft $${money(X)}$?`,
              `The new price $${money(X)}$ is $${ctx.up ? 100 + p : 100 - p}\\%$ of the old one. Which number times $${F}$ gives $${money(X)}$?`,
            )
          : ctx.up
            ? L(`Na de verhoging heb je $100\\%+${p}\\%=${100 + p}\\%$. Als kommagetal: $${F}$.`, `After the rise you have $100\\%+${p}\\%=${100 + p}\\%$. As a decimal: $${F}$.`)
            : L(`Na de korting houd je $100\\%-${p}\\%=${100 - p}\\%$ over. Als kommagetal: $${F}$.`, `After the discount you keep $100\\%-${p}\\%=${100 - p}\\%$. As a decimal: $${F}$.`),
        rule: {
          text: L(
            "Groeifactor: er komt $p\\%$ bij, doe keer $\\frac{100+p}{100}$. Er gaat $p\\%$ af, doe keer $\\frac{100-p}{100}$. Terugrekenen: delen door de groeifactor.",
            "Growth factor: $p\\%$ added, multiply by $\\frac{100+p}{100}$. $p\\%$ off, multiply by $\\frac{100-p}{100}$. Going back: divide by the growth factor.",
          ),
          ruleId: "u0.growth-factor",
        },
        solution: { steps },
      },
      // Mistakes at the precision of the answer, so a learner's typed value matches them.
      mistakes: mistakes.map((m) => (decimals ? { ...m, latex: String(roundHalfAwayFromZero(Number(m.latex), decimals)) } : m)),
    };
  },
  verify(ex) {
    // Independent check without the growth factor: take the change itself
    // (p% of the old price) and add it or take it off. For "back to the old
    // price" the answer is the old price: its change must lead to the new price.
    const props = propsOf(ex, "u0.percent-bar") as { from: number; to: number; percent: number; up: boolean; reverse: boolean } | null;
    if (!props || ex.answer.kind !== "expr") return false;
    const ans = evaluate(parse(ex.answer.latex));
    if (ans === null) return false;
    const after = (old: number) => (props.up ? old + (old * props.percent) / 100 : old - (old * props.percent) / 100);
    return props.reverse ? Math.abs(after(ans) - props.to) < 1e-9 : Math.abs(ans - after(props.from)) < 1e-9;
  },
};

// ---------------------------------------------------------------------------
// What percentage? (deel / geheel · 100)
// ---------------------------------------------------------------------------

const WHAT: Array<(part: number, whole: number) => Loc> = [
  (part, whole) =>
    L(
      `Van de $${whole}$ leerlingen komen er $${part}$ op de fiets. Hoeveel procent is dat?`,
      `Of the $${whole}$ students, $${part}$ come by bike. What percentage is that?`,
    ),
  (part, whole) => L(`Je hebt $${part}$ van de $${whole}$ vragen goed. Hoeveel procent is dat?`, `You got $${part}$ of the $${whole}$ questions right. What percentage is that?`),
  (part, whole) =>
    L(
      `Van de $${whole}$ bezoekers kopen er $${part}$ iets. Hoeveel procent is dat?`,
      `Of the $${whole}$ visitors, $${part}$ buy something. What percentage is that?`,
    ),
];

export const percentWhat: Generator = {
  id: "u0.percent-what",
  skillId: "u0.percent-what",
  title: L("Hoeveel procent?", "What percentage?"),
  generate(rng, difficulty) {
    let part: number, whole: number;
    if (difficulty === 1) {
      whole = rng.pick([10, 20, 25, 50]);
      part = rng.int(1, whole - 1);
    } else if (difficulty === 2) {
      // The percentage is whole, the numbers are bigger.
      const pct = rng.int(2, 19) * 5;
      whole = rng.pick([40, 60, 80, 120, 160, 200, 240, 300, 400]);
      part = (pct * whole) / 100;
      if (!Number.isInteger(part)) {
        whole = 200;
        part = pct * 2;
      }
    } else {
      whole = rng.int(30, 400);
      do part = rng.int(2, whole - 1);
      while (Number.isInteger((part * 100) / whole));
    }
    const exact = new Fraction(part * 100, whole);
    const isWhole = exact.equals(exact.floor());
    const ratio = new Fraction(part, whole);
    const steps: Step[] = [
      { latex: `\\frac{${part}}{${whole}}\\cdot 100`, note: L("Deel door het geheel. Doe keer $100$.", "Divide by the whole. Multiply by $100$.") },
    ];
    if (difficulty === 1) {
      const k = 100 / whole;
      steps.push(
        { latex: `\\frac{\\hl{${part}\\cdot ${k}}}{\\hl{${whole}\\cdot ${k}}}\\cdot 100`, note: L(`Maak de noemer $100$: boven en onder keer $${k}$.`, `Make the denominator $100$: top and bottom times $${k}$.`) },
        { latex: `\\frac{\\ask{${part * k}}}{100}\\cdot 100`, note: L("Zoveel honderdsten.", "That many hundredths.") },
      );
    } else if (isWhole) {
      steps.push({ latex: `\\ask{${dec(ratio)}}\\cdot 100`, note: L("Reken de breuk uit.", "Work out the fraction.") });
    }
    if (isWhole) steps.push({ latex: `\\ask{${dec(exact)}}`, note: L("Dat is het percentage.", "That is the percentage.") });
    else steps.push({ latex: `\\frac{${part}}{${whole}}\\cdot 100\\approx \\ask{${roundHalfAwayFromZero(exact.valueOf(), 1)}}`, note: L("Reken uit en rond af op $1$ decimaal.", "Work it out and round to $1$ decimal."), approx: { decimals: 1 } });

    const latexAnswer = isWhole ? dec(exact) : `\\frac{${part * 100}}{${whole}}`;
    const flipped = new Fraction(whole * 100, part);
    const mistakes: Mistake[] = [
      {
        id: "forgot-100",
        latex: isWhole ? dec(ratio) : String(roundHalfAwayFromZero(ratio.valueOf(), 2)),
        explain: L("Bijna! Dat is het deel als kommagetal. Doe nog keer $100$ voor procenten.", "Almost! That is the part as a decimal. Multiply by $100$ for per cent."),
      },
    ];
    if (isWhole ? !flipped.equals(exact) : true) {
      mistakes.push({
        id: "flipped",
        latex: isWhole && flipped.mul(10).equals(flipped.mul(10).floor()) ? dec(flipped) : String(roundHalfAwayFromZero(flipped.valueOf(), 1)),
        explain: L(
          `Andersom: het deel ($${part}$) gaat boven, het geheel ($${whole}$) onder.`,
          `The other way round: the part ($${part}$) goes on top, the whole ($${whole}$) at the bottom.`,
        ),
      });
    }

    return {
      prompt: (() => {
        const q = rng.pick(WHAT)(part, whole);
        return isWhole ? q : L(`${q.nl} Rond af op $1$ decimaal.`, `${q.en} Round to $1$ decimal.`);
      })(),
      latex: `\\frac{${part}}{${whole}}`,
      visual: isWhole
        ? custom("u0.hundred-grid", { percent: exact.valueOf() }, L(`Honderd vakjes. Het deel is $${dec(exact)}$ vakjes.`, `A hundred squares. The part is $${dec(exact)}$ squares.`))
        : undefined,
      answer: isWhole
        ? { kind: "expr", latex: latexAnswer, form: "any", unit: "%" }
        : { kind: "expr", latex: latexAnswer, form: "decimal", decimals: 1, unit: "%" },
      calculator: difficulty === 1 ? "off" : "allowed",
      hints: {
        nudge: L(
          `Het deel is $${part}$, het geheel is $${whole}$. Welk deel van het geheel is dat? Maak er daarna procenten van.`,
          `The part is $${part}$, the whole is $${whole}$. What part of the whole is it? Then turn it into per cent.`,
        ),
        rule: {
          text: L("Hoeveel procent: deel gedeeld door geheel, keer $100$.", "What percentage: part divided by whole, times $100$."),
          ruleId: "u0.percent",
        },
        solution: { steps },
      },
      mistakes,
    };
  },
  verify(ex) {
    // Independent check: take that percentage of the whole; it must give the part back.
    if (ex.answer.kind !== "expr" || !ex.latex) return false;
    const m = ex.latex.match(/^\\frac\{(\d+)\}\{(\d+)\}$/);
    const pct = evaluate(parse(ex.answer.latex));
    if (!m || pct === null) return false;
    return Math.abs((pct / 100) * Number(m[2]) - Number(m[1])) < 1e-9;
  },
};
