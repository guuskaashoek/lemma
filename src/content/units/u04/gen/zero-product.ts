/**
 * Lesson 2 generators: "a product is zero" (A · B = 0 gives A = 0 or B = 0)
 * and equations of the form x² = getal.
 */
import Fraction from "fraction.js";
import type { Mistake } from "@/math/check";
import { frac, poly, term } from "@/math/latex";
import type { Generator, GeneratedExercise, Loc, Step } from "@/content/types";
import { L, countRootsNumerically, custom, holdsAt, linear, num, removeNote, rootFactor, rootFactorB, solutionValues } from "../helpers";

/** Visual: slide x and watch both factors and their product. */
export function zeroProductVisual(factors: Array<[number, number]>, k: number, step: number) {
  const shown = `${k === 1 ? "" : k}${factors.map(([a, b]) => (b === 0 && a === 1 ? "x" : linear(a, b))).join("")}`;
  return custom(
    "u4.zero-product",
    { factors, k, step },
    L(
      `De factoren van $${shown}$ met een schuif voor $x$. Je ziet wanneer het product nul is.`,
      `The factors of $${shown}$ with a slider for $x$. You see when the product is zero.`,
    ),
  );
}

const RULE: Loc = L(
  "Product is nul: als $A\\cdot B=0$, dan is $A=0$ of $B=0$. Maak elke factor apart nul.",
  "Product is zero: if $A\\cdot B=0$, then $A=0$ or $B=0$. Make each factor zero on its own.",
);

/** The value that makes `ax+b` zero, as a fraction. */
const zeroOf = (a: number, b: number) => new Fraction(-b, a);

/** Mistakes "wrong sign": the opposite of a root, only when it is not a root itself. */
function signMistakes(roots: Fraction[]): Mistake[] {
  const out: Mistake[] = [];
  for (const r of roots) {
    const wrong = r.neg();
    if (r.equals(0) || roots.some((s) => s.equals(wrong))) continue;
    out.push({
      id: `sign-${frac(r)}`,
      latex: frac(wrong),
      explain: L(
        `Kijk welk getal $${rootFactor(r)}$ nul maakt. Dat is $${frac(r)}$, niet $${frac(wrong)}$: $${frac(r)}${r.compare(0) > 0 ? "-" : "+"}${frac(r.abs())}=0$.`,
        `Look at which number makes $${rootFactor(r)}$ zero. That is $${frac(r)}$, not $${frac(wrong)}$: $${frac(r)}${r.compare(0) > 0 ? "-" : "+"}${frac(r.abs())}=0$.`,
      ),
    });
  }
  return out;
}

/** Independent check: every answer value makes the equation true, and no root is missing. */
function verifyRoots(ex: GeneratedExercise): boolean {
  const xs = solutionValues(ex);
  if (!xs || !ex.latex) return false;
  // Roots must be different and satisfy the equation.
  if (new Set(xs.map((x) => x.toFixed(9))).size !== xs.length) return false;
  if (!holdsAt(ex.latex, xs)) return false;
  // No root may be missing: count the roots numerically (sign changes).
  return xs.length >= 1 && xs.length <= 2 && countRootsNumerically(ex.latex) === xs.length;
}

export const zeroProduct: Generator = {
  id: "u4.zero-product",
  skillId: "u4.zero-product",
  title: L("Product is nul", "Product is zero"),
  generate(rng, difficulty) {
    const steps: Step[] = [];
    let latex: string;
    let roots: Fraction[];
    let mistakes: Mistake[] = [];
    let nudge: Loc;
    let visual;

    const kind = difficulty === 1 ? "given" : difficulty === 2 ? "factor-x" : rng.pick(["fraction", "move", "fraction"] as const);

    if (kind === "given") {
      // (x - p)(x - q) = 0, sometimes x(x - q) = 0.
      const p = rng.chance(0.2) ? 0 : rng.nonZeroInt(-9, 9);
      let q: number;
      do q = rng.nonZeroInt(-9, 9);
      while (q === p);
      latex = `${rootFactorB(p)}${rootFactorB(q)}=0`;
      roots = [new Fraction(p), new Fraction(q)];
      steps.push(
        { latex, note: L("Een product is nul. Dan is een van de factoren nul.", "A product is zero. Then one of the factors is zero.") },
        { latex: `${rootFactor(p)}=0\\lor ${rootFactor(q)}=0`, note: L("Maak elke factor apart nul. Het teken $\\lor$ betekent 'of'.", "Make each factor zero on its own. The sign $\\lor$ means 'or'.") },
        { latex: `x=\\ask{${p}}\\lor ${rootFactor(q)}=0`, note: L(`Welk getal maakt $${rootFactor(p)}$ nul?`, `Which number makes $${rootFactor(p)}$ zero?`) },
        { latex: `x=${p}\\lor x=\\ask{${q}}`, note: L(`Welk getal maakt $${rootFactor(q)}$ nul?`, `Which number makes $${rootFactor(q)}$ zero?`) },
      );
      mistakes = signMistakes(roots);
      nudge = L(
        `Wanneer is $${rootFactor(q)}$ nul? Vul een paar getallen in. Doe daarna hetzelfde met $${rootFactor(p)}$.`,
        `When is $${rootFactor(q)}$ zero? Try a few numbers. Then do the same with $${rootFactor(p)}$.`,
      );
      visual = zeroProductVisual([[1, -p], [1, -q]], 1, 1);
    } else if (kind === "factor-x") {
      // kx^2 + kmx = 0  →  kx(x + m) = 0.
      const k = rng.pick([1, 1, 1, 2, 3, 4, 5]);
      const m = rng.nonZeroInt(-9, 9);
      latex = `${poly([k, k * m, 0])}=0`;
      const outer = term(k, "x");
      roots = [new Fraction(0), new Fraction(-m)];
      steps.push(
        { latex, note: L("Er is geen los getal. Beide termen hebben een $x$.", "There is no number on its own. Both terms have an $x$.") },
        { latex: `\\hl{${outer}}(\\ask{${rootFactor(-m)}})=0`, note: L(`Haal $${outer}$ buiten haakjes.`, `Take $${outer}$ out as a common factor.`) },
        { latex: `${outer}=0\\lor ${rootFactor(-m)}=0`, note: L("Product is nul: maak elke factor nul.", "Product is zero: make each factor zero.") },
        { latex: `x=\\ask{0}\\lor ${rootFactor(-m)}=0`, note: L(`Wanneer is $${outer}$ nul?`, `When is $${outer}$ zero?`) },
        { latex: `x=0\\lor x=\\ask{${-m}}`, note: L(`Welk getal maakt $${rootFactor(-m)}$ nul?`, `Which number makes $${rootFactor(-m)}$ zero?`) },
      );
      mistakes = [
        ...signMistakes(roots),
        {
          id: "forgot-zero",
          latex: String(-m),
          explain: L(
            `Goed, maar je mist er een. Ook $${outer}=0$ geeft een oplossing: $x=0$.`,
            `Good, but one is missing. $${outer}=0$ also gives a solution: $x=0$.`,
          ),
        },
      ];
      nudge = L(
        `In $${term(k, "x^{2}")}$ en in $${term(Math.abs(k * m), "x")}$ zit allebei $${outer}$. Haal dat eerst buiten haakjes.`,
        `Both $${term(k, "x^{2}")}$ and $${term(Math.abs(k * m), "x")}$ contain $${outer}$. Take that out first.`,
      );
      visual = zeroProductVisual([[1, 0], [1, m]], k, 1);
    } else if (kind === "fraction") {
      // (2x + b)(x - q) = 0 with b odd: one root is a half.
      const b = rng.pick([-9, -7, -5, -3, -1, 1, 3, 5, 7, 9]);
      let q: number;
      do q = rng.int(-8, 8);
      while (new Fraction(q).equals(zeroOf(2, b)));
      const r = zeroOf(2, b);
      // A bare x goes first: x(2x+3)=0, not (2x+3)x=0.
      latex = q === 0 ? `x${linear(2, b)}=0` : `${linear(2, b)}${rootFactorB(q)}=0`;
      roots = [r, new Fraction(q)];
      steps.push(
        { latex, note: L("Een product is nul. Dan is een van de factoren nul.", "A product is zero. Then one of the factors is zero.") },
        { latex: `${poly([2, b])}=0\\lor ${rootFactor(q)}=0`, note: L("Maak elke factor apart nul.", "Make each factor zero on its own.") },
        { latex: `2x=\\ask{${-b}}\\lor ${rootFactor(q)}=0`, note: removeNote(b) },
        { latex: `x=\\ask{${frac(r)}}\\lor ${rootFactor(q)}=0`, note: L("Deel beide kanten door $2$.", "Divide both sides by $2$.") },
        { latex: `x=${frac(r)}\\lor x=\\ask{${q}}`, note: L(`Welk getal maakt $${rootFactor(q)}$ nul?`, `Which number makes $${rootFactor(q)}$ zero?`) },
      );
      mistakes = [
        {
          id: "forgot-divide",
          latex: String(-b),
          explain: L(`Er staat $2x=${-b}$. Deel nog door $2$.`, `It says $2x=${-b}$. Still divide by $2$.`),
          relatedSkill: "u2.linear-equations",
        },
        {
          id: "divided-wrong-way",
          latex: frac(new Fraction(2, -b)),
          explain: L(`Bij $2x=${-b}$ deel je $${-b}$ door $2$, niet $2$ door $${-b}$.`, `For $2x=${-b}$ you divide $${-b}$ by $2$, not $2$ by $${-b}$.`),
          relatedSkill: "u2.linear-equations",
        },
      ].filter((m) => !roots.some((s) => Math.abs(s.valueOf() - (num(m.latex) ?? Number.NaN)) < 1e-9));
      nudge = L(
        `Maak $${poly([2, b])}$ nul: dat is een vergelijking zoals op de balans. Maak daarna ook $${rootFactor(q)}$ nul.`,
        `Make $${poly([2, b])}$ zero: that is an equation like on the balance. Then also make $${rootFactor(q)}$ zero.`,
      );
      visual = zeroProductVisual([[2, b], [1, -q]], 1, 0.5);
    } else {
      // x^2 = kx: move everything to one side first.
      const m = rng.nonZeroInt(-9, 9);
      latex = `x^{2}=${term(m, "x")}`;
      roots = [new Fraction(0), new Fraction(m)];
      steps.push(
        { latex, note: L("Zet eerst alles links, dan staat rechts $0$.", "First move everything to the left, so the right side is $0$.") },
        { latex: `x^{2}${m > 0 ? "-" : "+"}\\hl{${term(Math.abs(m), "x")}}=0`, note: removeNote(m, "x") },
        { latex: `x(\\ask{${rootFactor(m)}})=0`, note: L("Haal $x$ buiten haakjes.", "Take $x$ out as a common factor.") },
        { latex: `x=0\\lor ${rootFactor(m)}=0`, note: L("Product is nul: maak elke factor nul.", "Product is zero: make each factor zero.") },
        { latex: `x=0\\lor x=\\ask{${m}}`, note: L(`Welk getal maakt $${rootFactor(m)}$ nul?`, `Which number makes $${rootFactor(m)}$ zero?`) },
      );
      mistakes = [
        {
          id: "divided-by-x",
          latex: String(m),
          explain: L(
            "Je deelde door $x$. Dan raak je een oplossing kwijt: ook $x=0$ klopt. Zet alles links en haal $x$ buiten haakjes.",
            "You divided by $x$. That loses a solution: $x=0$ works too. Move everything left and take $x$ out.",
          ),
        },
      ];
      nudge = L(
        `Deel niet door $x$! Maak eerst rechts nul: $x^{2}${m > 0 ? "-" : "+"}${term(Math.abs(m), "x")}=0$.`,
        `Do not divide by $x$! First make the right side zero: $x^{2}${m > 0 ? "-" : "+"}${term(Math.abs(m), "x")}=0$.`,
      );
      visual = zeroProductVisual([[1, 0], [1, -m]], 1, 1);
    }

    return {
      prompt: L("Los op.", "Solve."),
      latex,
      visual,
      answer: { kind: "solutions", variable: "x", values: roots.map((r) => frac(r)) },
      calculator: "off",
      hints: {
        nudge,
        rule: { text: RULE, ruleId: "u4.zero-product" },
        solution: { steps, solutions: roots.map((r) => ({ x: r.valueOf() })) },
      },
      mistakes,
    };
  },
  verify: verifyRoots,
};

// ---------------------------------------------------------------------------
// x² = getal
// ---------------------------------------------------------------------------

const SQUARE_RULE: Loc = L(
  "Kwadraat is getal: $x^{2}=c$ met $c>0$ geeft $x=\\sqrt{c}\\lor x=-\\sqrt{c}$. Bij $c=0$ is er één oplossing, bij $c<0$ geen.",
  "Square equals number: $x^{2}=c$ with $c>0$ gives $x=\\sqrt{c}$ or $x=-\\sqrt{c}$. With $c=0$ there is one solution, with $c<0$ none.",
);

/** `\sqrt{n}` simplified when n is a perfect square. */
const root = (n: number) => (Number.isInteger(Math.sqrt(n)) ? String(Math.sqrt(n)) : `\\sqrt{${n}}`);

export const squareEquation: Generator = {
  id: "u4.square-equation",
  skillId: "u4.square-equation",
  title: L("Kwadraat is getal", "Square equals number"),
  generate(rng, difficulty) {
    const steps: Step[] = [];
    let latex: string;
    let c: number; // x^2 = c (or (x+p)^2 = c)
    let p = 0;
    let mistakes: Mistake[] = [];
    let nudge: Loc;
    let exact = false; // the answer keeps a square root

    if (difficulty === 1) {
      // x^2 = perfect square, sometimes with a number to remove first.
      const s = rng.int(1, 12);
      c = s * s;
      const k = rng.chance(0.5) ? 0 : rng.nonZeroInt(-20, 20);
      latex = k === 0 ? `x^{2}=${c}` : `${poly([1, 0, k])}=${c + k}`;
      if (k !== 0) {
        steps.push({ latex, note: L("Zorg dat $x^{2}$ alleen staat.", "Get $x^{2}$ on its own.") });
        steps.push({ latex: `x^{2}=\\ask{${c}}`, note: removeNote(k) });
      } else {
        steps.push({ latex, note: L(`Welk getal keer zichzelf is $${c}$? Denk ook aan een negatief getal.`, `Which number times itself is $${c}$? Think of a negative number too.`) });
      }
      nudge = k === 0
        ? L(`$${s}\\cdot ${s}=${c}$. Maar wat is $(${-s})\\cdot(${-s})$?`, `$${s}\\cdot ${s}=${c}$. But what is $(${-s})\\cdot(${-s})$?`)
        : L(
            `Werk eerst $${k > 0 ? `+${k}` : k}$ weg. Dan staat er $x^{2}=\\ldots$ Welke twee getallen passen?`,
            `First get rid of $${k > 0 ? `+${k}` : k}$. Then it says $x^{2}=\\ldots$ Which two numbers fit?`,
          );
    } else if (difficulty === 2) {
      // a x^2 + k = m, with c = (m - k)/a a perfect square, zero or negative.
      const type = rng.pick(["pos", "pos", "pos", "zero", "neg"] as const);
      const a = type === "neg" ? 1 : rng.pick([1, 1, 2, 3]);
      const s = rng.int(1, 9);
      c = type === "pos" ? s * s : type === "zero" ? 0 : -s * s;
      const k = rng.nonZeroInt(-20, 20);
      const m = a * c + k;
      latex = `${poly([a, 0, k])}=${m}`;
      steps.push({ latex, note: L("Zorg dat $x^{2}$ alleen staat.", "Get $x^{2}$ on its own.") });
      if (a === 1) {
        steps.push({ latex: `x^{2}=\\ask{${c}}`, note: removeNote(k) });
      } else {
        steps.push({ latex: `${a}x^{2}=\\ask{${a * c}}`, note: removeNote(k) });
        steps.push({ latex: `x^{2}=\\ask{${c}}`, note: L(`Deel beide kanten door $${a}$.`, `Divide both sides by $${a}$.`) });
      }
      nudge = L(
        `Werk eerst $${k > 0 ? `+${k}` : k}$ weg${a === 1 ? "" : ` en deel daarna door $${a}$`}. Dan staat er $x^{2}=\\ldots$`,
        `First get rid of $${k > 0 ? `+${k}` : k}$${a === 1 ? "" : ` and then divide by $${a}$`}. Then it says $x^{2}=\\ldots$`,
      );
      // Wrong way round: adding k instead of removing it.
      const wrongC = new Fraction(m + k, a);
      if (wrongC.compare(0) > 0 && Number(wrongC.d) === 1 && Number.isInteger(Math.sqrt(Number(wrongC.n))) && wrongC.valueOf() !== c) {
        mistakes.push({
          id: "wrong-side",
          latex: String(Math.sqrt(Number(wrongC.n))),
          explain: L(
            `Bij $${k > 0 ? `+${k}` : k}$ hoort aan de andere kant $${k > 0 ? `-${k}` : `+${-k}`}$. Dan klopt de balans.`,
            `With $${k > 0 ? `+${k}` : k}$, the other side gets $${k > 0 ? `-${k}` : `+${-k}`}$. That keeps the balance.`,
          ),
          relatedSkill: "u2.linear-equations",
        });
      }
    } else {
      // (x + p)^2 = c, or x^2 = c with a non-square c (exact root).
      if (rng.chance(0.5)) {
        const s = rng.int(1, 9);
        c = s * s;
        p = rng.nonZeroInt(-9, 9);
        latex = `(${poly([1, p])})^{2}=${c}`;
        steps.push(
          { latex, note: L(`Iets in het kwadraat is $${c}$. Dat iets is $${s}$ of $${-s}$.`, `Something squared is $${c}$. That something is $${s}$ or $${-s}$.`) },
          { latex: `${poly([1, p])}=\\ask{${s}}\\lor ${poly([1, p])}=${-s}`, note: L(`Welk positief getal in het kwadraat is $${c}$?`, `Which positive number squared is $${c}$?`) },
          { latex: `x=\\ask{${s - p}}\\lor ${poly([1, p])}=${-s}`, note: removeNote(p) },
          { latex: `x=${s - p}\\lor x=\\ask{${-s - p}}`, note: L("Doe hetzelfde met de tweede.", "Do the same with the second one.") },
        );
        nudge = L(
          `Zie $(${poly([1, p])})$ als één blok. Welk getal in het kwadraat is $${c}$? Er zijn er twee.`,
          `See $(${poly([1, p])})$ as one block. Which number squared is $${c}$? There are two.`,
        );
        mistakes.push({
          id: "only-positive",
          latex: String(s - p),
          explain: L(`Goed, maar er is nog een. Ook $(${-s})^{2}=${c}$, dus ook $${poly([1, p])}=${-s}$.`, `Good, but there is another one. Also $(${-s})^{2}=${c}$, so also $${poly([1, p])}=${-s}$.`),
        });
      } else {
        // Square-free numbers only, so the root cannot be simplified (no sqrt(8) = 2 sqrt(2)).
        const choices = [2, 3, 5, 6, 7, 10, 11, 13, 14, 15, 17, 19, 21, 22, 23, 26, 29, 30];
        c = rng.pick(choices);
        exact = true;
        const a = rng.pick([1, 2, 3]);
        // With a = 1 there is always a number to remove, so x^2 is not alone yet.
        const k = a === 1 ? rng.nonZeroInt(-15, 15) : rng.int(-15, 15);
        latex = `${poly([a, 0, k])}=${a * c + k}`;
        steps.push({ latex, note: L("Zorg dat $x^{2}$ alleen staat.", "Get $x^{2}$ on its own.") });
        if (k !== 0) steps.push({ latex: `${term(a, "x^{2}")}=\\ask{${a * c}}`, note: removeNote(k) });
        if (a !== 1) steps.push({ latex: `x^{2}=\\ask{${c}}`, note: L(`Deel beide kanten door $${a}$.`, `Divide both sides by $${a}$.`) });
        const firstNl = [k !== 0 ? `werk $${k > 0 ? `+${k}` : k}$ weg` : "", a !== 1 ? `deel door $${a}$` : ""].filter(Boolean).join(" en ");
        const firstEn = [k !== 0 ? `get rid of $${k > 0 ? `+${k}` : k}$` : "", a !== 1 ? `divide by $${a}$` : ""].filter(Boolean).join(" and ");
        nudge = L(
          `Maak eerst $x^{2}$ alleen: ${firstNl}. De wortel komt niet mooi uit: laat $\\sqrt{\\ }$ dan gewoon staan.`,
          `First get $x^{2}$ on its own: ${firstEn}. The root is not a whole number: just leave the $\\sqrt{\\ }$ in.`,
        );
        mistakes.push({
          id: "half",
          latex: frac(new Fraction(c, 2)),
          explain: L(`De wortel is niet de helft. $\\sqrt{${c}}$ is het getal dat keer zichzelf $${c}$ is.`, `The square root is not half. $\\sqrt{${c}}$ is the number that times itself is $${c}$.`),
        });
      }
    }

    // The ending is the same for every type.
    let values: string[];
    const plain = p === 0;
    if (plain) {
      if (c > 0) {
        steps.push({ latex: `x=\\ask{${root(c)}}\\lor x=-${root(c)}`, note: L(`Neem de wortel. Er zijn twee getallen: een positief en een negatief.`, `Take the square root. There are two numbers: a positive one and a negative one.`) });
        values = [root(c), `-${root(c)}`];
        mistakes.push({
          id: "only-positive",
          latex: root(c),
          explain: L(`Goed, maar er is nog een. Ook $(-${root(c)})^{2}=${c}$.`, `Good, but there is another one. Also $(-${root(c)})^{2}=${c}$.`),
        });
      } else if (c === 0) {
        steps.push({ latex: "x=\\ask{0}", note: L("Alleen $0\\cdot 0=0$. Er is één oplossing.", "Only $0\\cdot 0=0$. There is one solution.") });
        values = ["0"];
      } else {
        values = [];
        mistakes.push({
          id: "root-of-negative",
          latex: root(-c),
          explain: L(
            `Een kwadraat is nooit negatief. $x^{2}=${c}$ heeft dus geen oplossing.`,
            `A square is never negative. So $x^{2}=${c}$ has no solution.`,
          ),
        });
      }
    } else {
      values = [String(Math.sqrt(c) - p), String(-Math.sqrt(c) - p)];
    }
    // Drop mistakes that equal a right answer (except "only positive", which
    // is exactly the case of one right answer given on its own).
    mistakes = mistakes.filter((m) => m.id === "only-positive" || !values.some((v) => v === m.latex));

    const none = values.length === 0;
    if (none) {
      // No extra step: the last step gets the conclusion.
      const last = steps[steps.length - 1];
      last.note = L(`${last.note.nl} Een kwadraat is nooit negatief. Er is geen oplossing.`, `${last.note.en} A square is never negative. There is no solution.`);
    }
    const window = Math.ceil(Math.sqrt(Math.max(c, 1))) + 2 + Math.abs(p);
    return {
      prompt: difficulty === 2
        ? L("Los op. Geen oplossing? Kies dan 'Geen oplossing'.", "Solve. No solution? Then choose 'No solution'.")
        : exact
          ? L("Los op. Geef het exacte antwoord: laat de wortel staan.", "Solve. Give the exact answer: leave the square root in.")
          : L("Los op.", "Solve."),
      latex,
      visual: {
        kind: "plane",
        x: [-window, window],
        y: [Math.min(c, 0) - 2, Math.max(c, 1) + 4],
        graphs: [{ latex: plain ? "x^{2}" : `(${poly([1, p])})^{2}` }, { latex: String(c) }],
      },
      answer: { kind: "solutions", variable: "x", values },
      calculator: "off",
      hints: {
        nudge,
        rule: { text: SQUARE_RULE, ruleId: "u4.square-equation" },
        solution: {
          steps,
          solutions: values.map((v) => ({ x: num(v) ?? Number.NaN })),
        },
      },
      mistakes,
    };
  },
  verify(ex) {
    // Substitute every answer back in; for "no solution", check numerically
    // that the two sides never meet.
    if (ex.answer.kind !== "solutions" || !ex.latex) return false;
    const xs = solutionValues(ex);
    if (!xs) return false;
    if (xs.length === 0) return countRootsNumerically(ex.latex) === 0;
    return holdsAt(ex.latex, xs) && countRootsNumerically(ex.latex) === xs.length;
  },
};

