/**
 * Lesson 1 generators: from formula to table (a value of y), and "is this
 * point on the line?".
 */
import Fraction from "fraction.js";
import { evaluate, parse } from "@/math/cas";
import type { Mistake } from "@/math/check";
import { frac, gcd, paren } from "@/math/latex";
import type { Rng } from "@/math/random";
import type { Difficulty, Generator } from "@/content/types";
import type { VisualSpec } from "@/visuals/types";
import { den, F, intNot, isWhole, L, lin, pt, signed, times } from "../helpers";
import { planeWindow } from "../widgets/model";

/** A slope for difficulty 3: a simple fraction like 1/2, -2/3 or 3/4. */
export function simpleFraction(rng: Rng): Fraction {
  for (;;) {
    const den = rng.pick([2, 3, 4]);
    const num = rng.nonZeroInt(-5, 5);
    if (gcd(num, den) === 1) return new Fraction(num, den);
  }
}

/** Mistakes when filling in `y = ax + b` at x, deduplicated and never equal to the answer. */
export function fillInMistakes(a: Fraction, b: Fraction, x: Fraction): Mistake[] {
  const right = a.mul(x).add(b);
  const out: Mistake[] = [];
  const seen: Fraction[] = [right];
  const add = (id: string, value: Fraction, explain: ReturnType<typeof L>, relatedSkill?: string) => {
    if (seen.some((v) => v.equals(value))) return;
    seen.push(value);
    out.push({ id, latex: frac(value), explain, ...(relatedSkill ? { relatedSkill } : {}) });
  };
  // 2x with x = 3 read as "23".
  if (isWhole(a) && a.s > 0 && isWhole(x) && x.s > 0 && x.valueOf() < 10 && !x.equals(0)) {
    add(
      "digits-glued",
      F(Number(`${a.valueOf()}${x.valueOf()}`)).add(b),
      L(
        `$${frac(a)}x$ betekent $${frac(a)}\\cdot x$. Dus $${frac(a)}\\cdot ${frac(x)}$, niet de cijfers achter elkaar.`,
        `$${frac(a)}x$ means $${frac(a)}\\cdot x$. So $${frac(a)}\\cdot ${frac(x)}$, not the digits next to each other.`,
      ),
      "u0.formulas",
    );
  }
  // Sign slip in a·x.
  if (!a.mul(x).equals(0) && (a.s < 0 || x.s < 0)) {
    add(
      "sign",
      a.mul(x).neg().add(b),
      L(
        `Let op het minteken bij $${frac(a)}\\cdot ${paren(x)}$. Min keer plus is min. Min keer min is plus.`,
        `Watch the minus sign in $${frac(a)}\\cdot ${paren(x)}$. Minus times plus is minus. Minus times minus is plus.`,
      ),
    );
  }
  // Forgot the constant.
  if (!b.equals(0)) {
    add(
      "forgot-b",
      a.mul(x),
      L(`Je bent $${signed(b)}$ vergeten. Na het keer-rekenen komt die er nog bij.`, `You forgot $${signed(b)}$. After multiplying, it still has to be added.`),
    );
  }
  // Added before multiplying: a·(x + b).
  if (!b.equals(0) && !a.equals(1)) {
    add(
      "order",
      a.mul(x.add(b)),
      L("Keer gaat vóór plus en min. Reken eerst $a\\cdot x$ uit.", "Multiply comes before add and subtract. First work out $a\\cdot x$."),
      "u0.order-of-operations",
    );
  }
  return out;
}

/** Parameters of `y = ax + b` and an x, per difficulty. */
function pickLine(rng: Rng, difficulty: Difficulty): { a: Fraction; b: Fraction; x: Fraction } {
  if (difficulty === 1) return { a: F(rng.int(2, 6)), b: F(rng.int(1, 9)), x: F(rng.int(0, 6)) };
  if (difficulty === 2) return { a: F(intNot(rng, -6, 6, [0, 1, -1])), b: F(rng.nonZeroInt(-9, 9)), x: F(rng.nonZeroInt(-5, 5)) };
  const a = simpleFraction(rng);
  return { a, b: F(rng.nonZeroInt(-9, 9)), x: F(den(a)).mul(rng.nonZeroInt(-3, 3)) };
}

export const tableValue: Generator = {
  id: "u3.table-value",
  skillId: "u3.formula-table",
  title: L("Formule invullen", "Filling in a formula"),
  generate(rng, difficulty) {
    const { a, b, x } = pickLine(rng, difficulty);
    const prod = a.mul(x);
    const y = prod.add(b);
    const f = lin(a, b);
    const negX = x.s < 0;
    return {
      prompt: L(`De formule is $y=${f}$.\nBereken $y$ als $x=${frac(x)}$.`, `The formula is $y=${f}$.\nWork out $y$ when $x=${frac(x)}$.`),
      latex: `y=${f},\\quad x=${frac(x)}`,
      visual: { kind: "function-machine", latex: f, inputs: [...new Set([0, 1, x.valueOf()])].sort((p, q) => p - q) },
      answer: { kind: "expr", latex: frac(y), form: "any" },
      calculator: "off",
      hints: {
        nudge: L(
          `Zet $${frac(x)}$ op de plek van $x$: $y=${times(a, x)}${signed(b)}$. Wat is $${times(a, x)}$?`,
          `Put $${frac(x)}$ in place of $x$: $y=${times(a, x)}${signed(b)}$. What is $${times(a, x)}$?`,
        ),
        rule: {
          text: L(
            "De formule is een machine: vervang $x$ door het getal. Eerst keer, dan plus of min.",
            "The formula is a machine: replace $x$ by the number. First multiply, then add or subtract.",
          ),
          ruleId: "u3.formula-table",
          metaphor: "machine",
        },
        solution: {
          steps: [
            {
              latex: `y=${times(a, x, "hl")}${signed(b)}`,
              note: negX
                ? L(`Vul $x=${frac(x)}$ in. Een negatief getal zet je tussen haakjes.`, `Fill in $x=${frac(x)}$. Put a negative number in brackets.`)
                : L(`Vul $x=${frac(x)}$ in. $${frac(a)}x$ betekent $${frac(a)}\\cdot x$.`, `Fill in $x=${frac(x)}$. $${frac(a)}x$ means $${frac(a)}\\cdot x$.`),
            },
            { latex: `y=\\ask{${frac(prod)}}${signed(b)}`, note: L("Eerst keer.", "First multiply.") },
            { latex: `y=\\ask{${frac(y)}}`, note: L("Dan plus of min.", "Then add or subtract.") },
          ],
          solutions: [{ y: y.valueOf() }],
        },
      },
      mistakes: fillInMistakes(a, b, x),
    };
  },
  verify(ex) {
    // Independent check: let the CAS evaluate the formula at x.
    if (ex.answer.kind !== "expr" || !ex.latex) return false;
    const [eq, xs] = ex.latex.split(",\\quad ");
    const rhs = eq.replace(/^y=/, "");
    const x = evaluate(parse(xs.replace(/^x=/, "")));
    if (x === null) return false;
    const want = evaluate(parse(rhs), { x });
    const got = evaluate(parse(ex.answer.latex));
    return want !== null && got !== null && Math.abs(want - got) < 1e-9;
  },
  isNice(ex) {
    return ex.answer.kind === "expr" && /^-?\d+$/.test(ex.answer.latex) && Math.abs(Number(ex.answer.latex)) <= 60;
  },
};

const YES = L("Ja, het punt ligt op de lijn.", "Yes, the point is on the line.");
const NO = L("Nee, het punt ligt niet op de lijn.", "No, the point is not on the line.");

export const pointOnLine: Generator = {
  id: "u3.point-on-line",
  skillId: "u3.point-on-line",
  title: L("Ligt het punt op de lijn?", "Is the point on the line?"),
  generate(rng, difficulty) {
    let a: Fraction, b: Fraction, px: Fraction, py: Fraction;
    let swapped = false;
    if (difficulty === 1) {
      a = F(rng.int(2, 4));
      b = F(rng.int(0, 6));
      px = F(rng.int(0, 5));
    } else if (difficulty === 2) {
      a = F(intNot(rng, -4, 4, [0]));
      b = F(rng.int(-6, 6));
      px = F(rng.int(-4, 4));
    } else {
      a = rng.chance() ? simpleFraction(rng) : F(intNot(rng, -4, 4, [0, 1]));
      b = F(rng.int(-6, 6));
      px = F(den(a)).mul(rng.int(-2, 2));
    }
    const yOn = a.mul(px).add(b);
    const on = rng.chance();
    if (on) py = yOn;
    else if (difficulty === 3 && !px.equals(yOn) && rng.chance()) {
      // Trap: the coordinates swapped. (yOn, px) is usually not on the line.
      swapped = true;
      [px, py] = [yOn, px];
    } else py = yOn.add(rng.nonZeroInt(-3, 3));
    const yAt = a.mul(px).add(b);
    const isOn = yAt.equals(py);
    const f = lin(a, b);
    const P = pt(px, py);
    const win = planeWindow([[px.valueOf(), py.valueOf()], [0, b.valueOf()]], 8);
    const visual: VisualSpec = { kind: "plane", x: win.x, y: win.y, graphs: [{ latex: f }], points: [{ x: px.valueOf(), y: py.valueOf(), label: "P" }] };
    return {
      prompt: L(`Ligt het punt $P${P}$ op de lijn $y=${f}$?`, `Is the point $P${P}$ on the line $y=${f}$?`),
      latex: `y=${f},\\quad P${P}`,
      visual,
      answer: { kind: "choice", options: [{ text: YES }, { text: NO }], correctIndex: isOn ? 0 : 1 },
      calculator: "off",
      hints: {
        nudge: L(
          `$P$ heeft $x=${frac(px)}$. Vul $${frac(px)}$ in de formule in. Komt er $y=${frac(py)}$ uit?`,
          `$P$ has $x=${frac(px)}$. Put $${frac(px)}$ into the formula. Do you get $y=${frac(py)}$?`,
        ),
        rule: {
          text: L(
            "Een punt ligt op de lijn als de formule klopt. Vul de $x$ van het punt in en kijk of je de $y$ van het punt krijgt.",
            "A point is on the line when the formula fits. Put in the $x$ of the point and see if you get the $y$ of the point.",
          ),
          ruleId: "u3.point-on-line",
          metaphor: "machine",
        },
        solution: {
          steps: [
            {
              latex: `y=${times(a, px, "hl")}${signed(b)}`,
              note: swapped
                ? L(`Let op: in $${P}$ staat eerst $x$, dan $y$. Dus $x=${frac(px)}$.`, `Careful: in $${P}$ the $x$ comes first, then $y$. So $x=${frac(px)}$.`)
                : L(`Vul de $x$ van $P$ in: $x=${frac(px)}$.`, `Put in the $x$ of $P$: $x=${frac(px)}$.`),
            },
            {
              latex: `y=\\ask{${frac(yAt)}}`,
              note: isOn
                ? L(`Er komt $${frac(yAt)}$ uit. Dat is de $y$ van $P$. Dus: ja.`, `You get $${frac(yAt)}$. That is the $y$ of $P$. So: yes.`)
                : L(`Er komt $${frac(yAt)}$ uit, maar $P$ heeft $y=${frac(py)}$. Dus: nee.`, `You get $${frac(yAt)}$, but $P$ has $y=${frac(py)}$. So: no.`),
            },
          ],
          solutions: [{ y: yAt.valueOf() }],
        },
      },
    };
  },
  verify(ex) {
    // Independent check: evaluate the graph with the CAS at the point's x.
    const v = ex.visual;
    if (ex.answer.kind !== "choice" || !v || v.kind !== "plane" || !v.graphs || !v.points) return false;
    const p = v.points[0];
    const y = evaluate(parse(v.graphs[0].latex), { x: p.x });
    if (y === null) return false;
    return ex.answer.correctIndex === (Math.abs(y - p.y) < 1e-9 ? 0 : 1);
  },
};
