/**
 * Lessons 3 and 4 generators: factorising x² + bx + c with the product-sum
 * method (product-som methode), and solving x² + bx + c = 0 with it.
 */
import type { Mistake } from "@/math/check";
import { equivalent } from "@/math/cas";
import { checkExpr } from "@/math/check";
import { poly } from "@/math/latex";
import type { Rng } from "@/math/random";
import type { Difficulty, Generator, Loc, Step } from "@/content/types";
import { L, countRootsNumerically, custom, factorPairs, holdsAt, moveLeftNote, pairsText, quad, rootFactor, rootFactorB, solutionValues } from "../helpers";

/** Visual: algebra tiles. Split the x-strips into two groups until the rectangle closes. */
export function tilesVisual(b: number, c: number) {
  return custom(
    "u4.tiles",
    { b, c },
    L(
      `Tegels voor $${quad(1, b, c)}$: één groot vierkant $x^{2}$, strookjes $x$ en kleine blokjes. Verdeel de strookjes over twee kanten tot de rechthoek precies dicht is.`,
      `Tiles for $${quad(1, b, c)}$: one big square $x^{2}$, strips $x$ and small blocks. Split the strips over two sides until the rectangle closes exactly.`,
    ),
  );
}

/** `(x+p)(x+q)`, with the larger number second; `(x+p)^2` when equal. */
export function pairProduct(p: number, q: number): string {
  if (p === q) return `${rootFactorB(-p)}^{2}`;
  const [u, v] = p <= q ? [p, q] : [q, p];
  return `${rootFactorB(-u)}${rootFactorB(-v)}`;
}

/** Two numbers for x² + (p+q)x + pq at each difficulty. */
function pickPair(rng: Rng, difficulty: Difficulty): [number, number] {
  if (difficulty === 1) {
    const p = rng.int(1, 11);
    const q = rng.int(1, 11);
    return p <= q ? [p, q] : [q, p];
  }
  for (;;) {
    const p = rng.nonZeroInt(-9, 9);
    const q = rng.nonZeroInt(-9, 9);
    // Level 2 and up: at least one negative number.
    if (p > 0 && q > 0) continue;
    return p <= q ? [p, q] : [q, p];
  }
}

/** Hint text: the pairs with the right product, and the sum you need. */
function productSumNudge(b: number, c: number): Loc {
  const sign =
    c > 0
      ? b > 0
        ? L("Het product is positief en de som ook: beide getallen zijn positief.", "The product is positive and so is the sum: both numbers are positive.")
        : L("Het product is positief, de som negatief: beide getallen zijn negatief.", "The product is positive, the sum negative: both numbers are negative.")
      : L("Het product is negatief: één getal is positief en één is negatief.", "The product is negative: one number is positive and one is negative.");
  return L(
    `Zoek twee getallen. Keer elkaar: $${c}$. Opgeteld: $${b}$. Paren voor $${Math.abs(c)}$: ${pairsText(c)}. ${sign.nl}`,
    `Find two numbers. Multiplied: $${c}$. Added: $${b}$. Pairs for $${Math.abs(c)}$: ${pairsText(c)}. ${sign.en}`,
  );
}

const RULE: Loc = L(
  "Product-som: $x^{2}+bx+c=(x+p)(x+q)$ als $p\\cdot q=c$ en $p+q=b$. Denk aan een rechthoek: de stukken passen precies.",
  "Product-sum: $x^{2}+bx+c=(x+p)(x+q)$ when $p\\cdot q=c$ and $p+q=b$. Think of a rectangle: the pieces fit exactly.",
);

/** Typical wrong factorisations for x² + bx + c = (x+p)(x+q), times k. */
function factorMistakes(p: number, q: number, k: number, answer: string): Mistake[] {
  const b = p + q;
  const c = p * q;
  const pre = k === 1 ? "" : String(k);
  const out: Mistake[] = [
    {
      id: "signs-flipped",
      latex: `${pre}${pairProduct(-p, -q)}`,
      explain: L(
        `Controleer de tekens. In $(x+p)(x+q)$ zijn $p$ en $q$ de getallen zelf: $${p}$ en $${q}$. Werk de haakjes weg om te checken.`,
        `Check the signs. In $(x+p)(x+q)$, $p$ and $q$ are the numbers themselves: $${p}$ and $${q}$. Expand the brackets to check.`,
      ),
    },
  ];
  // Right product, wrong sum.
  const other = factorPairs(c).find(([r, s]) => r + s !== b);
  if (other) {
    out.push({
      id: "wrong-sum",
      latex: `${pre}${pairProduct(other[0], other[1])}`,
      explain: L(
        `Keer klopt: $${other[0]}\\cdot ${other[1] < 0 ? `(${other[1]})` : other[1]}=${c}$. Maar opgeteld is het $${other[0] + other[1]}$, en dat moet $${b}$ zijn.`,
        `The product is right: $${other[0]}\\cdot ${other[1] < 0 ? `(${other[1]})` : other[1]}=${c}$. But the sum is $${other[0] + other[1]}$, and it must be $${b}$.`,
      ),
    });
  }
  if (k !== 1) {
    out.push({
      id: "lost-factor",
      latex: pairProduct(p, q),
      explain: L(`Vergeet de $${k}$ vóór de haakjes niet.`, `Do not forget the $${k}$ in front of the brackets.`),
    });
  }
  return out.filter((m) => !equivalent(m.latex, answer));
}

export const productSum: Generator = {
  id: "u4.product-sum",
  skillId: "u4.product-sum",
  title: L("Ontbinden met product-som", "Factorising with product-sum"),
  generate(rng, difficulty) {
    const [p, q] = pickPair(rng, difficulty);
    const k = difficulty === 3 ? rng.pick([2, 3, 4, 5]) : 1;
    const b = p + q;
    const c = p * q;
    const inner = quad(1, b, c);
    const expr = quad(k, k * b, k * c);
    const pre = k === 1 ? "" : String(k);
    const answer = `${pre}${pairProduct(p, q)}`;
    const [u, v] = [p, q];

    const steps: Step[] = [
      {
        latex: expr,
        note:
          k === 1
            ? L(`Zoek twee getallen: keer elkaar $${c}$, opgeteld $${b}$.`, `Find two numbers: multiplied $${c}$, added $${b}$.`)
            : L(`Alle getallen zitten in de tafel van $${k}$. Haal eerst $${k}$ buiten haakjes.`, `All numbers are multiples of $${k}$. First take $${k}$ out.`),
      },
    ];
    if (k !== 1) {
      steps.push({
        latex: `\\hl{${k}}(\\ask{${inner}})`,
        note: L(`Deel elke term door $${k}$. Zoek daarna twee getallen: keer $${c}$, plus $${b}$.`, `Divide every term by $${k}$. Then find two numbers: times $${c}$, plus $${b}$.`),
      });
    }
    // The learner finds the partner of the first number.
    const second = p === q ? `${rootFactorB(-u)}^{2}` : `\\ask{${rootFactor(-v)}}`;
    steps.push({
      latex: p === q ? `${pre}\\ask{${rootFactorB(-u)}^{2}}` : `${pre}${rootFactorB(-u)}(${second})`,
      note:
        p === q
          ? L(`$${u}\\cdot ${u < 0 ? `(${u})` : u}=${c}$ en $${u}+${u < 0 ? `(${u})` : u}=${b}$. Twee keer hetzelfde haakje: schrijf het als kwadraat.`, `$${u}\\cdot ${u < 0 ? `(${u})` : u}=${c}$ and $${u}+${u < 0 ? `(${u})` : u}=${b}$. The same bracket twice: write it as a square.`)
          : L(
              `Eén getal is $${u}$. Welk getal geeft daarmee keer $${c}$ en plus $${b}$? Vul het tweede haakje in.`,
              `One number is $${u}$. Which number gives times $${c}$ and plus $${b}$ with it? Fill in the second bracket.`,
            ),
    });

    return {
      prompt: L("Ontbind in factoren.", "Factorise."),
      latex: expr,
      visual: tilesVisual(b, c),
      answer: { kind: "expr", latex: answer, form: "factored", minFactors: 2 },
      calculator: "off",
      hints: {
        nudge:
          k === 1
            ? productSumNudge(b, c)
            : L(
                `Haal eerst $${k}$ buiten haakjes. Zoek daarna twee getallen met keer $${c}$ en plus $${b}$.`,
                `First take $${k}$ out. Then find two numbers with times $${c}$ and plus $${b}$.`,
              ),
        rule: { text: RULE, ruleId: "u4.product-sum" },
        solution: { steps },
      },
      mistakes: factorMistakes(p, q, k, answer),
    };
  },
  verify(ex) {
    // Independent check: expanding the answer gives the expression back, and
    // the answer is fully factored.
    if (ex.answer.kind !== "expr" || !ex.latex) return false;
    return equivalent(ex.latex, ex.answer.latex) && checkExpr(ex.answer, ex.answer.latex).correct;
  },
  isNice(ex) {
    return ex.answer.kind === "expr" && !/frac|\./.test(ex.answer.latex);
  },
};

// ---------------------------------------------------------------------------
// Solving x² + bx + c = 0 with product-sum
// ---------------------------------------------------------------------------

export const productSumSolve: Generator = {
  id: "u4.product-sum-solve",
  skillId: "u4.product-sum-solve",
  title: L("Oplossen met product-som", "Solving with product-sum"),
  generate(rng, difficulty) {
    // Roots r1 <= r2; then x² + bx + c = (x - r1)(x - r2).
    let r1: number, r2: number;
    do {
      r1 = rng.int(-9, 9);
      r2 = rng.int(-9, 9);
    } while (r1 === 0 || r2 === 0 || (r1 === r2 && !rng.chance(0.15)) || (difficulty === 1 && r1 + r2 === 0));
    if (r1 > r2) [r1, r2] = [r2, r1];
    const b = -(r1 + r2);
    const c = r1 * r2;
    const std = `${quad(1, b, c)}=0`;
    const steps: Step[] = [];
    let latex = std;
    let nudge: Loc;

    const form = difficulty === 1 ? "std" : difficulty === 2 ? rng.pick(["std", "move"] as const) : rng.pick(["move-x", "brackets", "times-k"] as const);
    if (form === "std") {
      steps.push({ latex: std, note: L("Rechts staat al $0$. Ontbind de linkerkant.", "The right side is already $0$. Factorise the left side.") });
      nudge = productSumNudge(b, c);
    } else if (form === "move") {
      // x² + bx = -c
      latex = `${poly([1, b, 0])}=${-c}`;
      steps.push(
        { latex, note: L("Product-som werkt alleen als rechts $0$ staat.", "Product-sum only works when the right side is $0$.") },
        { latex: `\\ask{${quad(1, b, c)}}=0`, note: moveLeftNote(0, -c) },
      );
      nudge = L(
        `Maak eerst rechts $0$. ${moveLeftNote(0, -c).nl} Zoek dan twee getallen met keer $${c}$ en plus $${b}$.`,
        `First make the right side $0$. ${moveLeftNote(0, -c).en} Then find two numbers with times $${c}$ and plus $${b}$.`,
      );
    } else if (form === "move-x") {
      // x² = -bx - c
      latex = `x^{2}=${poly([-b, -c])}`;
      steps.push(
        { latex, note: L("Breng alles naar links, dan staat rechts $0$.", "Move everything to the left, so the right side is $0$.") },
        { latex: `\\ask{${quad(1, b, c)}}=0`, note: moveLeftNote(-b, -c) },
      );
      nudge = L(
        `Breng eerst $${poly([-b, -c])}$ naar links. Let op de tekens: ze draaien om.`,
        `First move $${poly([-b, -c])}$ to the left. Watch the signs: they flip.`,
      );
    } else if (form === "brackets") {
      // x(x + b) = -c
      latex = `x${rootFactorB(-b)}=${-c}`;
      if (b === 0) latex = `x\\cdot x=${-c}`;
      steps.push(
        { latex, note: L("Werk eerst de haakjes weg. Maak daarna rechts $0$.", "First expand the brackets. Then make the right side $0$.") },
        {
          latex: `\\ask{${quad(1, b, c)}}=0`,
          note: L(
            `$x$ keer alles tussen de haakjes geeft $${poly([1, b, 0])}$. Doe dan aan beide kanten $${c > 0 ? `+${c}` : c}$.`,
            `$x$ times everything inside the brackets gives $${poly([1, b, 0])}$. Then do $${c > 0 ? `+${c}` : c}$ on both sides.`,
          ),
        },
      );
      nudge = L(
        `Rechts staat $${-c}$, niet $0$. Werk de haakjes weg en breng $${-c}$ naar links.`,
        `The right side is $${-c}$, not $0$. Expand the brackets and move $${-c}$ to the left.`,
      );
    } else {
      // k x² + kbx + kc = 0
      const k = rng.pick([2, 3, 5, -1]);
      latex = `${quad(k, k * b, k * c)}=0`;
      steps.push(
        { latex, note: L(`Deel eerst beide kanten door $${k}$. Rechts blijft $0$.`, `First divide both sides by $${k}$. The right side stays $0$.`) },
        { latex: `\\ask{${quad(1, b, c)}}=0`, note: L(`Deel elke term door $${k}$.`, `Divide every term by $${k}$.`) },
      );
      nudge = L(
        `Alle getallen zitten in de tafel van $${Math.abs(k)}$. Deel eerst beide kanten door $${k}$, dan staat er $x^{2}+\\ldots$`,
        `All numbers are multiples of $${Math.abs(k)}$. First divide both sides by $${k}$, then it says $x^{2}+\\ldots$`,
      );
    }

    if (r1 === r2) {
      steps.push(
        { latex: `\\ask{${rootFactorB(r1)}^{2}}=0`, note: L(`Ontbind: twee getallen met keer $${c}$ en plus $${b}$. Het is twee keer hetzelfde getal.`, `Factorise: two numbers with times $${c}$ and plus $${b}$. It is the same number twice.`) },
        { latex: `${rootFactor(r1)}=0`, note: L("Een kwadraat is alleen nul als het getal zelf nul is.", "A square is only zero when the number itself is zero.") },
        { latex: `x=\\ask{${r1}}`, note: L("Er is maar één oplossing.", "There is only one solution.") },
      );
    } else {
      steps.push(
        { latex: `${rootFactorB(r1)}(\\ask{${rootFactor(r2)}})=0`, note: L(`Ontbind. Eén getal is $${-r1}$. Welk getal geeft keer $${c}$ en plus $${b}$?`, `Factorise. One number is $${-r1}$. Which number gives times $${c}$ and plus $${b}$?`) },
        { latex: `${rootFactor(r1)}=0\\lor ${rootFactor(r2)}=0`, note: L("Product is nul: maak elke factor nul.", "Product is zero: make each factor zero.") },
        { latex: `x=\\ask{${r1}}\\lor ${rootFactor(r2)}=0`, note: L(`Welk getal maakt $${rootFactor(r1)}$ nul?`, `Which number makes $${rootFactor(r1)}$ zero?`) },
        { latex: `x=${r1}\\lor x=\\ask{${r2}}`, note: L(`Welk getal maakt $${rootFactor(r2)}$ nul?`, `Which number makes $${rootFactor(r2)}$ zero?`) },
      );
    }

    const roots = r1 === r2 ? [r1] : [r1, r2];
    // Sign mistake: giving the numbers from the brackets instead of the roots.
    const mistakes: Mistake[] = roots
      .filter((r) => !roots.includes(-r))
      .map((r) => ({
        id: `sign-${r}`,
        latex: String(-r),
        explain: L(
          `$${-r}$ is het getal in het haakje $${rootFactorB(r)}$. De oplossing is het getal dat het haakje nul maakt: $x=${r}$.`,
          `$${-r}$ is the number in the bracket $${rootFactorB(r)}$. The solution is the number that makes the bracket zero: $x=${r}$.`,
        ),
      }));

    return {
      prompt: L("Los op met product-som.", "Solve with product-sum."),
      latex,
      visual: tilesVisual(b, c),
      answer: { kind: "solutions", variable: "x", values: roots.map(String) },
      calculator: "off",
      hints: {
        nudge,
        rule: { text: RULE, ruleId: "u4.product-sum" },
        solution: { steps, solutions: roots.map((x) => ({ x })) },
      },
      mistakes,
    };
  },
  verify(ex) {
    // Substitute the roots back in, and count the roots numerically so none is missing.
    const xs = solutionValues(ex);
    if (!xs || !ex.latex) return false;
    return holdsAt(ex.latex, xs) && countRootsNumerically(ex.latex) === xs.length;
  },
  isNice(ex) {
    const xs = solutionValues(ex);
    return xs !== null && xs.every((x) => Number.isInteger(x));
  },
};

