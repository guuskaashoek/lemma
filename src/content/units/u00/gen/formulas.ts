/**
 * Lesson 7 generators: filling in a formula (formules invullen) and reading
 * a table with a fixed step (tabellen en grafieken lezen).
 */
import Fraction from "fraction.js";
import { evaluate, parse } from "@/math/cas";
import type { Mistake } from "@/math/check";
import { poly } from "@/math/latex";
import type { Rng } from "@/math/random";
import type { Difficulty, Generator, Loc, Step } from "@/content/types";
import type { VisualSpec } from "@/visuals/types";
import { L, dec } from "../helpers";

// ---------------------------------------------------------------------------
// Filling in a formula
// ---------------------------------------------------------------------------

type Filled = {
  /** Output letter, e.g. "K". */
  out: string;
  /** The formula's right-hand side with letters, e.g. "4+2a". */
  rhs: string;
  /** Input letters with their values. */
  given: Array<[string, number]>;
  /** What the letters mean. */
  meaning: Loc;
  unit: string;
  /** Worked steps after the output letter, starting with the filled-in formula. */
  steps: Array<{ rhs: string; note: Loc }>;
  value: Fraction;
  mistakes: Mistake[];
  /** Right-hand side in x, for the function machine (one input only). */
  machine?: string;
};

/** "(-10)" for negative numbers, so a filled-in product stays readable. */
const br = (v: number) => (v < 0 ? `(${dec(v)})` : dec(v));

function linear(rng: Rng, difficulty: Difficulty): Filled {
  type Ctx = { out: string; inp: string; meaning: Loc; unit: string; s: () => number; r: () => number; x: (s: number, r: number) => number; minus?: boolean };
  const easy: Ctx[] = [
    {
      out: "K",
      inp: "a",
      meaning: L("$K$ is de prijs in euro. $a$ is het aantal kilometers.", "$K$ is the price in euros. $a$ is the number of kilometres."),
      unit: "euro",
      s: () => rng.int(3, 8),
      r: () => rng.int(2, 4),
      x: () => rng.int(2, 15),
    },
    {
      out: "L",
      inp: "w",
      meaning: L("$L$ is de lengte van een plant in cm. $w$ is het aantal weken.", "$L$ is the length of a plant in cm. $w$ is the number of weeks."),
      unit: "cm",
      s: () => rng.int(5, 20),
      r: () => rng.int(2, 5),
      x: () => rng.int(2, 10),
    },
    {
      out: "S",
      inp: "m",
      meaning: L("$S$ is je spaargeld in euro. $m$ is het aantal maanden.", "$S$ is your savings in euros. $m$ is the number of months."),
      unit: "euro",
      s: () => 10 * rng.int(2, 10),
      r: () => 5 * rng.int(1, 5),
      x: () => rng.int(2, 12),
    },
  ];
  const harder: Ctx[] = [
    {
      out: "K",
      inp: "a",
      meaning: L("$K$ is de prijs in euro. $a$ is het aantal kilometers.", "$K$ is the price in euros. $a$ is the number of kilometres."),
      unit: "euro",
      s: () => rng.pick([2.5, 3.5, 4.25, 5.75]),
      r: () => rng.pick([0.25, 0.35, 1.5, 2.2]),
      x: () => rng.int(3, 20),
    },
    {
      out: "L",
      inp: "t",
      meaning: L("$L$ is de lengte van een kaars in cm. $t$ is de brandtijd in uren.", "$L$ is the length of a candle in cm. $t$ is the burning time in hours."),
      unit: "cm",
      s: () => rng.int(20, 30),
      r: () => rng.pick([0.5, 1.5, 2.5]),
      x: (s, r) => rng.int(1, Math.floor(s / r) - 1),
      minus: true,
    },
    {
      out: "B",
      inp: "m",
      meaning: L("$B$ is het bedrag in euro. $m$ is het aantal belminuten.", "$B$ is the amount in euros. $m$ is the number of call minutes."),
      unit: "euro",
      s: () => rng.pick([10, 12.5, 15]),
      r: () => rng.pick([0.15, 0.2, 0.25]),
      x: () => rng.int(10, 90),
    },
  ];
  const c = rng.pick(difficulty === 1 ? easy : harder);
  const s = c.s();
  const r = c.r();
  const x = c.x(s, r);
  const sign = c.minus ? "-" : "+";
  const prod = new Fraction(r).mul(x);
  const value = c.minus ? new Fraction(s).sub(prod) : new Fraction(s).add(prod);
  const wrong = (c.minus ? new Fraction(s).sub(r) : new Fraction(s).add(r)).mul(x);
  return {
    out: c.out,
    rhs: `${dec(s)}${sign}${dec(r)}${c.inp}`,
    given: [[c.inp, x]],
    meaning: c.meaning,
    unit: c.unit,
    steps: [
      { rhs: `${dec(s)}${sign}${dec(r)}\\cdot\\hl{${x}}`, note: L(`Vul in: op de plek van $${c.inp}$ komt $${x}$.`, `Fill in: $${x}$ goes where $${c.inp}$ was.`) },
      { rhs: `${dec(s)}${sign}\\ask{${dec(prod)}}`, note: L("Keer gaat vóór plus en min.", "Multiply comes before add and subtract.") },
      { rhs: `\\ask{${dec(value)}}`, note: L("Reken uit.", "Work it out.") },
    ],
    value,
    mistakes: wrong.equals(value)
      ? []
      : [
          {
            id: "left-to-right",
            latex: dec(wrong),
            explain: L(
              `Je deed eerst $${dec(s)}${sign}${dec(r)}$. Maar keer gaat vóór ${c.minus ? "min" : "plus"}: eerst $${dec(r)}\\cdot ${x}$.`,
              `You did $${dec(s)}${sign}${dec(r)}$ first. But multiply comes before ${c.minus ? "subtract" : "add"}: first $${dec(r)}\\cdot ${x}$.`,
            ),
            relatedSkill: "u0.order-of-operations",
          },
        ],
    machine: `${dec(s)}${sign}${dec(r)}x`,
  };
}

function special(rng: Rng): Filled {
  const kind = rng.int(0, 2);
  if (kind === 0) {
    // Falling: h = 5t².
    const t = rng.int(2, 6);
    const value = new Fraction(5 * t * t);
    return {
      out: "h",
      rhs: "5t^{2}",
      given: [["t", t]],
      meaning: L("$h$ is hoe ver een steen valt, in meter. $t$ is de tijd in seconden.", "$h$ is how far a stone falls, in metres. $t$ is the time in seconds."),
      unit: "m",
      steps: [
        { rhs: `5\\cdot\\hl{${t}}^{2}`, note: L(`Vul in: $t=${t}$.`, `Fill in: $t=${t}$.`) },
        { rhs: `5\\cdot\\ask{${t * t}}`, note: L("Eerst de macht.", "First the power.") },
        { rhs: `\\ask{${value}}`, note: L("Dan keer $5$.", "Then times $5$.") },
      ],
      value,
      mistakes: [
        {
          id: "square-last",
          latex: String(25 * t * t),
          explain: L(`Het kwadraat hoort alleen bij $t$. Reken $${t}^{2}=${t * t}$ en doe dan keer $5$.`, `The square belongs only to $t$. Work out $${t}^{2}=${t * t}$ and then multiply by $5$.`),
          relatedSkill: "u0.order-of-operations",
        },
        {
          id: "times-two",
          latex: String(5 * t * 2),
          explain: L(`$${t}^{2}$ is $${t}\\cdot ${t}$, niet $${t}\\cdot 2$.`, `$${t}^{2}$ is $${t}\\cdot ${t}$, not $${t}\\cdot 2$.`),
        },
      ],
      machine: "5x^{2}",
    };
  }
  if (kind === 1) {
    // Temperature: F = 1.8C + 32.
    const C = 5 * rng.int(-4, 8);
    const prod = new Fraction(18, 10).mul(C);
    const value = prod.add(32);
    return {
      out: "F",
      rhs: "1.8C+32",
      given: [["C", C]],
      meaning: L("$F$ is de temperatuur in graden Fahrenheit. $C$ is de temperatuur in graden Celsius.", "$F$ is the temperature in degrees Fahrenheit. $C$ is the temperature in degrees Celsius."),
      unit: "°F",
      steps: [
        { rhs: `1.8\\cdot\\hl{${br(C)}}+32`, note: L(`Vul in: $C=${C}$.${C < 0 ? " Zet een negatief getal tussen haakjes." : ""}`, `Fill in: $C=${C}$.${C < 0 ? " Put a negative number in brackets." : ""}`) },
        { rhs: `\\ask{${dec(prod)}}+32`, note: L("Eerst keer.", "First multiply.") },
        { rhs: `\\ask{${dec(value)}}`, note: L("Dan plus $32$.", "Then add $32$.") },
      ],
      value,
      mistakes: [
        {
          id: "brackets",
          latex: dec(new Fraction(18, 10).mul(C + 32)),
          explain: L("Je telde eerst $32$ op. Keer gaat vóór plus.", "You added $32$ first. Multiply comes before add."),
          relatedSkill: "u0.order-of-operations",
        },
      ],
      machine: "1.8x+32",
    };
  }
  // Perimeter of a rectangle: O = 2(l + b).
  const l = rng.int(3, 20);
  const b = rng.int(2, l);
  const value = new Fraction(2 * (l + b));
  return {
    out: "O",
    rhs: "2(l+b)",
    given: [
      ["l", l],
      ["b", b],
    ],
    meaning: L("$O$ is de omtrek van een rechthoek. $l$ is de lengte en $b$ de breedte, in cm.", "$O$ is the perimeter of a rectangle. $l$ is the length and $b$ the width, in cm."),
    unit: "cm",
    steps: [
      { rhs: `2\\cdot(\\hl{${l}}+\\hl{${b}})`, note: L(`Vul in: $l=${l}$ en $b=${b}$.`, `Fill in: $l=${l}$ and $b=${b}$.`) },
      { rhs: `2\\cdot\\ask{${l + b}}`, note: L("Eerst de haakjes.", "First the brackets.") },
      { rhs: `\\ask{${value}}`, note: L("Dan keer $2$.", "Then times $2$.") },
    ],
    value,
    mistakes: [
      {
        id: "forgot-brackets",
        latex: String(2 * l + b),
        explain: L("De $2$ hoort bij alles tussen de haakjes. Tel eerst $l+b$ op.", "The $2$ belongs to everything in the brackets. First add $l+b$."),
        relatedSkill: "u0.order-of-operations",
      },
    ],
  };
}

export const formulaSubstitute: Generator = {
  id: "u0.formula-substitute",
  skillId: "u0.formulas",
  title: L("Formules invullen", "Filling in formulas"),
  generate(rng, difficulty) {
    const f = difficulty === 3 ? special(rng) : linear(rng, difficulty);
    const assign = f.given.map(([k, v]) => `${k}=${v}`);
    const latex = `${f.out}=${f.rhs},\\quad ${assign.join(",\\quad ")}`;
    const steps: Step[] = f.steps.map((s) => ({ latex: `${f.out}=${s.rhs}`, note: s.note }));
    const assignText = (and: string) => assign.map((a) => `$${a}$`).join(` ${and} `);
    const visual: VisualSpec | undefined = f.machine
      ? { kind: "function-machine", latex: f.machine, inputs: [...new Set([0, 1, f.given[0][1]])].sort((a, b) => a - b) }
      : undefined;
    return {
      prompt: L(
        `De formule is $${f.out}=${f.rhs}$.\n${f.meaning.nl}\nBereken $${f.out}$ als ${assignText("en")}.`,
        `The formula is $${f.out}=${f.rhs}$.\n${f.meaning.en}\nWork out $${f.out}$ when ${assignText("and")}.`,
      ),
      latex,
      visual,
      answer: { kind: "expr", latex: dec(f.value), form: "any", unit: f.unit },
      calculator: difficulty === 1 ? "off" : "allowed",
      hints: {
        nudge: L(
          `Schrijf de formule op en zet ${assignText("en")} op de plek van de ${f.given.length > 1 ? "letters" : "letter"}. Let daarna op de rekenvolgorde.`,
          `Write down the formula and put ${assignText("and")} in place of the ${f.given.length > 1 ? "letters" : "letter"}. Then mind the order of operations.`,
        ),
        rule: {
          text: L(
            "Formule invullen: vervang elke letter door zijn getal. Negatief getal? Zet het tussen haakjes. Reken dan uit met de rekenvolgorde.",
            "Filling in a formula: replace every letter by its number. Negative number? Put it in brackets. Then work it out with the order of operations.",
          ),
          ruleId: "u0.substitute",
          metaphor: "machine",
        },
        solution: { steps, solutions: [{ [f.out]: f.value.valueOf() }] },
      },
      mistakes: f.mistakes.filter((m) => !new Fraction(m.latex).equals(f.value)),
    };
  },
  verify(ex) {
    // Independent check: the CAS fills the values into the printed formula.
    if (ex.answer.kind !== "expr" || !ex.latex) return false;
    const [formula, ...assign] = ex.latex.split(",\\quad ");
    const rhs = formula.slice(formula.indexOf("=") + 1);
    const values: Record<string, number> = {};
    for (const a of assign) {
      const [k, v] = a.split("=");
      values[k] = Number(v);
    }
    const expected = evaluate(parse(rhs), values);
    const given = evaluate(parse(ex.answer.latex));
    return expected !== null && given !== null && Math.abs(expected - given) < 1e-9;
  },
};

// ---------------------------------------------------------------------------
// Reading a table (and its graph)
// ---------------------------------------------------------------------------

export const tableRead: Generator = {
  id: "u0.table-read",
  skillId: "u0.tables-graphs",
  title: L("Tabellen lezen", "Reading tables"),
  generate(rng, difficulty) {
    const s = difficulty === 3 ? rng.int(-5, 25) : rng.int(1, 20);
    const r = difficulty === 3 && rng.chance(0.4) ? -rng.int(2, 5) : rng.int(2, difficulty === 1 ? 9 : 6);
    const x0 = difficulty === 3 ? rng.int(3, 6) : 0;
    const xs = [x0, x0 + 1, x0 + 2, x0 + 3];
    const y = (x: number) => s + r * x;
    const ys = xs.map(y);
    // Level 1: one or two steps past the table. Level 3: back to x = 0 or 1.
    const X = difficulty === 1 ? x0 + rng.int(4, 5) : difficulty === 2 ? rng.int(8, 20) : rng.int(0, 1);
    const answer = y(X);

    let steps: Step[];
    let nudge: Loc;
    if (difficulty === 1) {
      const more = X - xs[3];
      steps = [
        {
          latex: more === 1 ? `y=${ys[3]}+${r}` : `y=${ys[3]}+${r}+${r}`,
          note: L(`Er komt steeds $${r}$ bij. Van $x=${xs[3]}$ naar $x=${X}$ ${more === 1 ? "is één stap" : "zijn twee stappen"}.`, `Each time $${r}$ is added. From $x=${xs[3]}$ to $x=${X}$ ${more === 1 ? "is one step" : "is two steps"}.`),
        },
        { latex: `y=\\ask{${answer}}`, note: L(`Dit hoort bij $x=${X}$.`, `This goes with $x=${X}$.`) },
      ];
      nudge = L(
        `Van $${ys[0]}$ naar $${ys[1]}$: hoeveel komt erbij? Komt er steeds hetzelfde bij?`,
        `From $${ys[0]}$ to $${ys[1]}$: how much is added? Is the same added every time?`,
      );
    } else if (difficulty === 2) {
      steps = [
        { latex: `y=${s}+${r}\\cdot ${X}`, note: L(`Bij $x=0$ is $y=${s}$. Elke stap komt er $${r}$ bij. Tot $x=${X}$ zijn dat $${X}$ stappen.`, `At $x=0$, $y=${s}$. Every step adds $${r}$. Up to $x=${X}$ that is $${X}$ steps.`) },
        { latex: `y=${s}+\\ask{${r * X}}`, note: L(`$${X}$ stappen van $${r}$.`, `$${X}$ steps of $${r}$.`) },
        { latex: `y=\\ask{${answer}}`, note: L("Tel het startgetal erbij.", "Add the starting number.") },
      ];
      nudge = L(
        `Bij $x=0$ hoort $y=${s}$: het startgetal. Per stap komt er $${r}$ bij. Hoeveel stappen is het tot $x=${X}$?`,
        `$x=0$ goes with $y=${s}$: the starting number. Each step adds $${r}$. How many steps is it to $x=${X}$?`,
      );
    } else {
      const up = r > 0;
      const back = x0 - X;
      steps = [
        {
          latex: up ? `y=${ys[0]}-${back}\\cdot ${r}` : `y=${ys[0]}+${back}\\cdot ${-r}`,
          note: up
            ? L(`Ga terug van $x=${x0}$ naar $x=${X}$: $${back}$ stappen terug. Elke stap terug gaat er $${r}$ af.`, `Go back from $x=${x0}$ to $x=${X}$: $${back}$ steps back. Each step back takes off $${r}$.`)
            : L(`Ga terug van $x=${x0}$ naar $x=${X}$: $${back}$ stappen terug. Elke stap terug komt er $${-r}$ bij.`, `Go back from $x=${x0}$ to $x=${X}$: $${back}$ steps back. Each step back adds $${-r}$.`),
        },
        { latex: `y=${ys[0]}${up ? "-" : "+"}\\ask{${Math.abs(r * back)}}`, note: L(`$${back}$ stappen van $${Math.abs(r)}$.`, `$${back}$ steps of $${Math.abs(r)}$.`) },
        { latex: `y=\\ask{${answer}}`, note: L(X === 0 ? "Dit is het startgetal." : `Dit hoort bij $x=${X}$.`, X === 0 ? "This is the starting number." : `This goes with $x=${X}$.`) },
      ];
      nudge = L(
        `Hoeveel verandert $y$ per stap? Hoeveel stappen is het terug van $x=${x0}$ naar $x=${X}$?`,
        `How much does $y$ change per step? How many steps is it back from $x=${x0}$ to $x=${X}$?`,
      );
    }

    const row = (label: string, vals: number[]) => `$${label}:\\quad ${vals.join("\\quad ")}$`;
    const all = [...ys, answer, 0];
    const lo = Math.min(...all);
    const hi = Math.max(...all);
    const pad = Math.max(2, Math.ceil((hi - lo) / 10));
    const mistakes: Mistake[] = [];
    if (difficulty === 2) {
      mistakes.push({
        id: "no-start",
        latex: String(r * X),
        explain: L(`Vergeet het startgetal niet: bij $x=0$ is $y$ al $${s}$.`, `Do not forget the starting number: at $x=0$, $y$ is already $${s}$.`),
      });
      if ((ys[3] / 3) * X !== answer && Number.isInteger((ys[3] * X) / 3)) {
        mistakes.push({
          id: "proportional",
          latex: String((ys[3] * X) / 3),
          explain: L("De tabel begint niet bij $0$. Je mag dus niet zomaar keer doen. Gebruik het startgetal en de stap.", "The table does not start at $0$. So you cannot just multiply. Use the starting number and the step."),
        });
      }
    }
    if (difficulty === 3) {
      mistakes.push({
        id: "wrong-way",
        latex: String(ys[0] + r * (x0 - X)),
        explain: L(`Je ging de verkeerde kant op. Terug naar $x=${X}$ gaat de stap andersom.`, `You went the wrong way. Going back to $x=${X}$ the step goes the other way.`),
      });
    }

    return {
      prompt: L(
        `Kijk naar de tabel.\n${row("x", xs)}\n${row("y", ys)}\nWelke $y$ hoort bij $x=${X}$?`,
        `Look at the table.\n${row("x", xs)}\n${row("y", ys)}\nWhich $y$ goes with $x=${X}$?`,
      ),
      latex: `x=${X}\\quad\\Rightarrow\\quad y=\\ ?`,
      visual: {
        kind: "plane",
        x: [Math.min(-1, x0 - 1), Math.max(xs[3], X) + 1],
        y: [lo - pad, hi + pad],
        graphs: [{ latex: poly([r, s]) }],
        points: xs.map((x, i) => ({ x, y: ys[i] })),
      },
      answer: { kind: "expr", latex: String(answer), form: "integer" },
      calculator: "off",
      hints: {
        nudge,
        rule: {
          text: L(
            "Komt er steeds hetzelfde bij? Dan is $y=\\text{start}+\\text{stap}\\cdot x$. Het startgetal hoort bij $x=0$.",
            "Is the same added every time? Then $y=\\text{start}+\\text{step}\\cdot x$. The starting number goes with $x=0$.",
          ),
          ruleId: "u0.read-table",
        },
        solution: { steps, solutions: [{ y: answer }] },
      },
      mistakes: mistakes.filter((m) => Number(m.latex) !== answer),
    };
  },
  verify(ex) {
    // Independent check from the data: the step between two table points,
    // continued to the asked x.
    if (ex.answer.kind !== "expr" || !ex.latex || ex.visual?.kind !== "plane" || !ex.visual.points) return false;
    const m = ex.latex.match(/^x=(-?\d+)/);
    if (!m) return false;
    const [p0, p1] = ex.visual.points;
    const step = (p1.y - p0.y) / (p1.x - p0.x);
    const expected = p0.y + step * (Number(m[1]) - p0.x);
    return Math.abs(expected - Number(ex.answer.latex)) < 1e-9;
  },
};
