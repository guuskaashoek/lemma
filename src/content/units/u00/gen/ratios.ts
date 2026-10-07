/**
 * Lesson 4 generators: the ratio table (verhoudingstabel) and sharing in a
 * given ratio (verdelen in een verhouding).
 */
import Fraction from "fraction.js";
import { evaluate, parse } from "@/math/cas";
import { gcd } from "@/math/latex";
import type { Rng } from "@/math/random";
import type { Difficulty, Generator, Loc, Step } from "@/content/types";
import type { Mistake } from "@/math/check";
import { L, custom, dec, money, propsOf } from "../helpers";

// ---------------------------------------------------------------------------
// Ratio table
// ---------------------------------------------------------------------------

type TableContext = {
  top: Loc;
  bottom: Loc;
  /** Value per 1 on top: nice numbers for this situation. */
  perOne: (rng: Rng) => Fraction;
  money?: boolean;
  unit: string;
  question: (a: string, b: string, c: string) => Loc;
};

const TABLES: TableContext[] = [
  {
    top: L("personen", "people"),
    bottom: L("gram bloem", "grams of flour"),
    perOne: (rng) => new Fraction(rng.pick([25, 50, 75, 100, 125, 150])),
    unit: "g",
    question: (a, b, c) =>
      L(
        `Voor $${a}$ personen heb je $${b}$ gram bloem nodig. Hoeveel gram bloem heb je nodig voor $${c}$ personen?`,
        `For $${a}$ people you need $${b}$ grams of flour. How many grams of flour do you need for $${c}$ people?`,
      ),
  },
  {
    top: L("pakken sap", "cartons of juice"),
    bottom: L("euro", "euros"),
    perOne: (rng) => new Fraction(rng.int(2, 9), 4),
    money: true,
    unit: "euro",
    question: (a, b, c) =>
      L(`$${a}$ pakken sap kosten $${b}$ euro. Wat kosten $${c}$ pakken?`, `$${a}$ cartons of juice cost $${b}$ euros. How much do $${c}$ cartons cost?`),
  },
  {
    top: L("liter benzine", "litres of petrol"),
    bottom: L("kilometer", "kilometres"),
    perOne: (rng) => new Fraction(rng.int(12, 20)),
    unit: "km",
    question: (a, b, c) =>
      L(
        `Een auto rijdt $${b}$ km op $${a}$ liter benzine. Hoeveel km rijdt hij op $${c}$ liter?`,
        `A car drives $${b}$ km on $${a}$ litres of petrol. How many km does it drive on $${c}$ litres?`,
      ),
  },
  {
    top: L("minuten", "minutes"),
    bottom: L("meter", "metres"),
    perOne: (rng) => new Fraction(rng.pick([50, 60, 70, 75, 80, 90])),
    unit: "m",
    question: (a, b, c) =>
      L(
        `Je loopt $${b}$ meter in $${a}$ minuten. Hoeveel meter loop je in $${c}$ minuten?`,
        `You walk $${b}$ metres in $${a}$ minutes. How many metres do you walk in $${c}$ minutes?`,
      ),
  },
  {
    top: L("liter verf", "litres of paint"),
    bottom: L("m² muur", "m² of wall"),
    perOne: (rng) => new Fraction(rng.int(4, 12)),
    unit: "m²",
    question: (a, b, c) =>
      L(
        `Met $${a}$ liter verf schilder je $${b}$ m² muur. Hoeveel m² schilder je met $${c}$ liter?`,
        `With $${a}$ litres of paint you paint $${b}$ m² of wall. How many m² do you paint with $${c}$ litres?`,
      ),
  },
];

/** Picks a, c (and the in-between column) for each level. */
function tableNumbers(rng: Rng, difficulty: Difficulty): { a: number; c: number; via?: number } {
  if (difficulty === 1) {
    const a = rng.int(2, 6);
    return { a, c: a * rng.int(2, 5) };
  }
  if (difficulty === 2) {
    for (;;) {
      const a = rng.int(2, 8);
      const c = rng.int(2, 12);
      if (c % a !== 0 && a % c !== 0) return { a, c, via: 1 };
    }
  }
  // Level 3: through a common divisor g, not through 1: 4 → 2 → 6.
  for (;;) {
    const g = rng.pick([2, 3, 4]);
    const p = rng.int(2, 5);
    const q = rng.int(2, 7);
    if (p !== q && gcd(p, q) === 1) return { a: g * p, c: g * q, via: g };
  }
}

export const ratioTable: Generator = {
  id: "u0.ratio-table",
  skillId: "u0.ratio-table",
  title: L("Verhoudingstabel", "Ratio table"),
  generate(rng, difficulty) {
    const ctx = rng.pick(TABLES);
    const { a, c, via } = tableNumbers(rng, difficulty);
    // On level 3 the value per group is nice, the value per 1 may not be.
    let b: Fraction;
    if (difficulty === 3 && via !== undefined) {
      const perGroup = ctx.money ? new Fraction(rng.int(3, 18), 2) : ctx.perOne(rng).mul(via).add(rng.pick([0, 0, 1, 2]) * (ctx.money ? 0 : 1));
      b = perGroup.mul(a / via);
    } else b = ctx.perOne(rng).mul(a);
    const answer = b.mul(c).div(a);
    const show = (v: Fraction) => (ctx.money ? money(v) : dec(v));
    const B = show(b);
    const ans = show(answer);

    let steps: Step[];
    let nudge: Loc;
    if (via === undefined) {
      const k = c / a;
      steps = [
        { latex: `${B}\\cdot ${k}`, note: L(`Boven: van $${a}$ naar $${c}$ is keer $${k}$. Onder doe je ook keer $${k}$.`, `Top: from $${a}$ to $${c}$ is times $${k}$. Below you also multiply by $${k}$.`) },
        { latex: `\\ask{${ans}}`, note: L("Reken uit.", "Work it out.") },
      ];
      nudge = L(
        `Van $${a}$ naar $${c}$: hoe vaak past $${a}$ in $${c}$? Doe hetzelfde met $${B}$.`,
        `From $${a}$ to $${c}$: how many times does $${a}$ go into $${c}$? Do the same with $${B}$.`,
      );
    } else {
      const down = a / via;
      const up = c / via;
      const mid = show(b.div(down));
      steps = [
        {
          latex: `${B}:${down}\\cdot ${up}`,
          note:
            via === 1
              ? L(`Ga eerst naar $1$: deel boven en onder door $${a}$. Ga dan naar $${c}$: keer $${c}$.`, `First go to $1$: divide top and bottom by $${a}$. Then go to $${c}$: times $${c}$.`)
              : L(
                  `Ga eerst naar $${via}$: deel door $${down}$. Ga dan naar $${c}$: keer $${up}$.`,
                  `First go to $${via}$: divide by $${down}$. Then go to $${c}$: times $${up}$.`,
                ),
        },
        { latex: `\\ask{${mid}}\\cdot ${up}`, note: L(`Dit getal hoort bij $${via}$ in de bovenste rij.`, `This number goes with $${via}$ in the top row.`) },
        { latex: `\\ask{${ans}}`, note: L(`Dit getal hoort bij $${c}$ in de bovenste rij.`, `This number goes with $${c}$ in the top row.`) },
      ];
      nudge =
        via === 1
          ? L(`$${c}$ is geen keer-getal van $${a}$. Reken eerst uit wat bij $1$ hoort: $${B}:${a}$.`, `$${c}$ is not a multiple of $${a}$. First work out what goes with $1$: $${B}:${a}$.`)
          : L(
              `Ga niet naar $1$, maar naar $${via}$. Dat past in $${a}$ én in $${c}$. Wat hoort bij $${via}$?`,
              `Do not go to $1$, but to $${via}$. It goes into $${a}$ and into $${c}$. What goes with $${via}$?`,
            );
    }

    const mistakes: Mistake[] = [];
    const added = b.add(c - a);
    if (!added.equals(answer)) {
      mistakes.push({
        id: "added",
        latex: dec(added),
        explain:
          c > a
            ? L(
                `Je telde $${c - a}$ erbij op. In een verhoudingstabel doe je keer of gedeeld door, boven en onder hetzelfde.`,
                `You added $${c - a}$. In a ratio table you multiply or divide, the same on top and below.`,
              )
            : L(
                `Je haalde $${a - c}$ eraf. In een verhoudingstabel doe je keer of gedeeld door, boven en onder hetzelfde.`,
                `You subtracted $${a - c}$. In a ratio table you multiply or divide, the same on top and below.`,
              ),
      });
    }
    const flipped = b.mul(a).div(c);
    if (!flipped.equals(answer) && !flipped.equals(added)) {
      mistakes.push({
        id: "flipped",
        latex: dec(flipped),
        explain: L(
          `Meer ${ctx.top.nl} geeft ook meer ${ctx.bottom.nl}. Je antwoord moet dus ${c > a ? "groter" : "kleiner"} zijn dan $${B}$.`,
          `More ${ctx.top.en} also gives more ${ctx.bottom.en}. So your answer must be ${c > a ? "bigger" : "smaller"} than $${B}$.`,
        ),
      });
    }

    return {
      prompt: ctx.question(String(a), B, String(c)),
      visual: custom(
        "u0.ratio-table",
        { top: ctx.top, bottom: ctx.bottom, a, b: b.valueOf(), c, via, money: !!ctx.money },
        L(
          `Een verhoudingstabel. Boven ${ctx.top.nl}: $${a}$ en $${c}$. Onder ${ctx.bottom.nl}: $${B}$ en een vraagteken.`,
          `A ratio table. Top ${ctx.top.en}: $${a}$ and $${c}$. Below ${ctx.bottom.en}: $${B}$ and a question mark.`,
        ),
      ),
      answer: { kind: "expr", latex: dec(answer), form: "any", unit: ctx.unit },
      calculator: "off",
      hints: {
        nudge,
        rule: {
          text: L(
            "Verhoudingstabel: wat je boven doet, doe je onder ook. Alleen keer en gedeeld door, nooit plus of min.",
            "Ratio table: whatever you do on top, you also do below. Only multiply and divide, never add or subtract.",
          ),
          ruleId: "u0.ratio-table",
        },
        solution: { steps },
      },
      mistakes,
    };
  },
  verify(ex) {
    // Independent check: cross-multiplying, answer · a = b · c.
    const p = propsOf(ex, "u0.ratio-table");
    if (!p || ex.answer.kind !== "expr") return false;
    const ans = evaluate(parse(ex.answer.latex));
    const { a, b, c } = p as { a: number; b: number; c: number };
    return ans !== null && Math.abs(ans * a - b * c) < 1e-9;
  },
  isNice(ex) {
    // At most two decimals (money), so it can be done by hand.
    return ex.answer.kind === "expr" && !/\.\d{3,}/.test(ex.answer.latex);
  },
};

// ---------------------------------------------------------------------------
// Sharing in a ratio
// ---------------------------------------------------------------------------

type ShareContext = {
  names: (rng: Rng) => [Loc, Loc];
  unit: string;
  /** Size of one "group" is a multiple of this. */
  step: number;
  question: (n: [string, string], p: number, q: number, total: string, ask: string) => Loc;
  given: (n: [string, string], p: number, q: number, has: string, amount: string, ask: string) => Loc;
};

const PEOPLE: Array<[string, string]> = [
  ["Anna", "Bram"],
  ["Sanne", "Daan"],
  ["Fatima", "Luuk"],
  ["Noor", "Sem"],
  ["Mila", "Yusuf"],
];

const SHARES: ShareContext[] = [
  {
    names: (rng) => {
      const [x, y] = rng.pick(PEOPLE);
      return [L(x, x), L(y, y)];
    },
    unit: "euro",
    step: 1,
    question: (n, p, q, total, ask) =>
      L(
        `${n[0]} en ${n[1]} verdelen $${total}$ euro in de verhouding $${p}:${q}$. Hoeveel euro krijgt ${ask}?`,
        `${n[0]} and ${n[1]} share $${total}$ euros in the ratio $${p}:${q}$. How many euros does ${ask} get?`,
      ),
    given: (n, p, q, has, amount, ask) =>
      L(
        `${n[0]} en ${n[1]} verdelen geld in de verhouding $${p}:${q}$. ${has} krijgt $${amount}$ euro. Hoeveel euro krijgt ${ask}?`,
        `${n[0]} and ${n[1]} share money in the ratio $${p}:${q}$. ${has} gets $${amount}$ euros. How many euros does ${ask} get?`,
      ),
  },
  {
    names: () => [L("siroop", "syrup"), L("water", "water")],
    unit: "ml",
    step: 10,
    question: (n, p, q, total, ask) =>
      L(
        `Je mengt siroop en water in de verhouding $${p}:${q}$. Je maakt $${total}$ ml limonade. Hoeveel ml ${ask} gebruik je?`,
        `You mix syrup and water in the ratio $${p}:${q}$. You make $${total}$ ml of lemonade. How many ml of ${ask} do you use?`,
      ),
    given: (n, p, q, has, amount, ask) =>
      L(
        `Je mengt siroop en water in de verhouding $${p}:${q}$. Je gebruikt $${amount}$ ml ${has}. Hoeveel ml ${ask} heb je nodig?`,
        `You mix syrup and water in the ratio $${p}:${q}$. You use $${amount}$ ml of ${has}. How many ml of ${ask} do you need?`,
      ),
  },
  {
    names: () => [L("blauwe verf", "blue paint"), L("gele verf", "yellow paint")],
    unit: "dl",
    step: 1,
    question: (n, p, q, total, ask) =>
      L(
        `Groene verf maak je van blauwe en gele verf in de verhouding $${p}:${q}$. Je maakt $${total}$ dl groen. Hoeveel dl ${ask} gebruik je?`,
        `You make green paint from blue and yellow paint in the ratio $${p}:${q}$. You make $${total}$ dl of green. How many dl of ${ask} do you use?`,
      ),
    given: (n, p, q, has, amount, ask) =>
      L(
        `Groene verf maak je van blauwe en gele verf in de verhouding $${p}:${q}$. Je hebt $${amount}$ dl ${has}. Hoeveel dl ${ask} heb je nodig?`,
        `You make green paint from blue and yellow paint in the ratio $${p}:${q}$. You have $${amount}$ dl of ${has}. How many dl of ${ask} do you need?`,
      ),
  },
];

export const ratioShare: Generator = {
  id: "u0.ratio-share",
  skillId: "u0.ratio-share",
  title: L("Verdelen in een verhouding", "Sharing in a ratio"),
  generate(rng, difficulty) {
    const ctx = rng.pick(SHARES);
    const names = ctx.names(rng);
    let p: number, q: number;
    do {
      p = difficulty === 1 ? 1 : rng.int(difficulty === 3 ? 2 : 1, 5);
      q = rng.int(2, difficulty === 1 ? 4 : 6);
    } while (p === q || gcd(p, q) !== 1);
    const k = rng.int(2, difficulty === 1 ? 20 : 12) * ctx.step; // one group
    const parts = [p, q];
    const total = (p + q) * k;
    const ask = difficulty === 1 ? 0 : rng.int(0, 1);
    const other = 1 - ask;
    const answer = parts[ask] * k;
    const nameOf = (i: number, lang: "nl" | "en") => names[i][lang];
    const groupsWord = (n: number) => L(n === 1 ? "groepje" : "groepjes", n === 1 ? "group" : "groups");

    let prompt: Loc;
    let steps: Step[];
    let nudge: Loc;
    const mistakes: Mistake[] = [];
    let given: { index: number; amount: number } | undefined;

    if (difficulty < 3) {
      prompt = L(
        ctx.question([nameOf(0, "nl"), nameOf(1, "nl")], p, q, String(total), nameOf(ask, "nl")).nl,
        ctx.question([nameOf(0, "en"), nameOf(1, "en")], p, q, String(total), nameOf(ask, "en")).en,
      );
      steps = [
        { latex: `\\frac{${total}}{${p}+${q}}\\cdot ${parts[ask]}`, note: L("Tel de delen op. Verdeel het totaal in zoveel groepjes.", "Add the parts. Share the total into that many groups.") },
        { latex: `\\frac{${total}}{\\ask{${p + q}}}\\cdot ${parts[ask]}`, note: L(`$${p}+${q}$ delen samen.`, `$${p}+${q}$ parts together.`) },
        { latex: `\\ask{${k}}\\cdot ${parts[ask]}`, note: L("Eén groepje.", "One group.") },
        { latex: `\\ask{${answer}}`, note: L(`Je zoekt $${parts[ask]}$ ${groupsWord(parts[ask]).nl}.`, `You want $${parts[ask]}$ ${groupsWord(parts[ask]).en}.`) },
      ];
      nudge = L(
        `De verhouding $${p}:${q}$ betekent: $${p}+${q}=${p + q}$ gelijke groepjes. Hoeveel is één groepje van $${total}$?`,
        `The ratio $${p}:${q}$ means: $${p}+${q}=${p + q}$ equal groups. How much is one group of $${total}$?`,
      );
      if (total / 2 !== answer && total % 2 === 0) {
        mistakes.push({
          id: "half",
          latex: String(total / 2),
          explain: L(
            `Je verdeelde in twee gelijke helften. Maar de verhouding is $${p}:${q}$: dat zijn $${p + q}$ groepjes.`,
            `You split it into two equal halves. But the ratio is $${p}:${q}$: that is $${p + q}$ groups.`,
          ),
        });
      }
      mistakes.push({
        id: "other-part",
        latex: String(parts[other] * k),
        explain: L(
          `Dat hoort bij ${nameOf(other, "nl")}. Je zoekt ${nameOf(ask, "nl")}: dat is $${parts[ask]}$ ${groupsWord(parts[ask]).nl}.`,
          `That goes with ${nameOf(other, "en")}. You want ${nameOf(ask, "en")}: that is $${parts[ask]}$ ${groupsWord(parts[ask]).en}.`,
        ),
      });
    } else {
      given = { index: other, amount: parts[other] * k };
      const has = given.amount;
      prompt = L(
        ctx.given([nameOf(0, "nl"), nameOf(1, "nl")], p, q, nameOf(other, "nl"), String(has), nameOf(ask, "nl")).nl,
        ctx.given([nameOf(0, "en"), nameOf(1, "en")], p, q, nameOf(other, "en"), String(has), nameOf(ask, "en")).en,
      );
      steps = [
        {
          latex: `\\frac{${has}}{${parts[other]}}\\cdot ${parts[ask]}`,
          note: L(`$${has}$ is $${parts[other]}$ ${groupsWord(parts[other]).nl}. Zoek eerst één groepje.`, `$${has}$ is $${parts[other]}$ ${groupsWord(parts[other]).en}. First find one group.`),
        },
        { latex: `\\ask{${k}}\\cdot ${parts[ask]}`, note: L("Eén groepje.", "One group.") },
        { latex: `\\ask{${answer}}`, note: L(`Je zoekt $${parts[ask]}$ ${groupsWord(parts[ask]).nl}.`, `You want $${parts[ask]}$ ${groupsWord(parts[ask]).en}.`) },
      ];
      nudge = L(
        `In de verhouding $${p}:${q}$ hoort $${has}$ bij de $${parts[other]}$. Hoeveel is dan één groepje?`,
        `In the ratio $${p}:${q}$, $${has}$ goes with the $${parts[other]}$. So how much is one group?`,
      );
      const swapped = new Fraction(has * parts[other], parts[ask]);
      if (!swapped.equals(answer)) {
        mistakes.push({
          id: "swapped",
          latex: dec(swapped),
          explain: L(
            `Andersom. Deel $${has}$ door $${parts[other]}$, want dat is het deel van ${nameOf(other, "nl")}.`,
            `The other way round. Divide $${has}$ by $${parts[other]}$, because that is the share of ${nameOf(other, "en")}.`,
          ),
        });
      }
    }

    return {
      prompt,
      // The ratio itself, big, so it stands out from the text.
      latex: `${p}:${q}`,
      visual: custom(
        "u0.groups",
        { total, parts, names, ask, given },
        L(
          `Het geheel verdeeld in $${p + q}$ gelijke groepjes: $${p}$ voor ${nameOf(0, "nl")} en $${q}$ voor ${nameOf(1, "nl")}.`,
          `The whole shared into $${p + q}$ equal groups: $${p}$ for ${nameOf(0, "en")} and $${q}$ for ${nameOf(1, "en")}.`,
        ),
      ),
      answer: { kind: "expr", latex: String(answer), form: "any", unit: ctx.unit },
      calculator: "off",
      hints: {
        nudge,
        rule: {
          text: L(
            "Verdelen in een verhouding: tel de delen op. Deel het totaal door die som: dat is één groepje. Doe keer het aantal delen.",
            "Sharing in a ratio: add the parts. Divide the total by that sum: that is one group. Multiply by the number of parts.",
          ),
          ruleId: "u0.ratio-share",
        },
        solution: { steps },
      },
      mistakes,
    };
  },
  verify(ex) {
    // Independent check: the two amounts really are in the ratio p : q
    // (cross-multiplying), and together they make the total.
    const props = propsOf(ex, "u0.groups") as { total: number; parts: number[]; ask: number } | null;
    if (!props || ex.answer.kind !== "expr") return false;
    const ans = evaluate(parse(ex.answer.latex));
    if (ans === null) return false;
    const rest = props.total - ans;
    const [mine, theirs] = [props.parts[props.ask], props.parts[1 - props.ask]];
    return Math.abs(ans * theirs - rest * mine) < 1e-9 && rest > 0;
  },
  isNice(ex) {
    return ex.answer.kind === "expr" && Number.isInteger(Number(ex.answer.latex));
  },
};
