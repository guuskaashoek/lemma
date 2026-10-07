/**
 * Lesson 3 generators: decimals and fractions, multiplying and dividing by
 * 10, 100 and 1000, and adding and multiplying decimals.
 */
import Fraction from "fraction.js";
import { checkExpr, type Mistake } from "@/math/check";
import { equivalent, evaluate, parse } from "@/math/cas";
import { frac, gcd } from "@/math/latex";
import type { Generator, Step } from "@/content/types";
import { L, custom, dec } from "../helpers";

/** Number of decimals of a terminating decimal string. */
const places = (s: string) => (s.includes(".") ? s.split(".")[1].length : 0);

// ---------------------------------------------------------------------------
// Decimals and fractions (kommagetallen en breuken)
// ---------------------------------------------------------------------------

const PLACE_NAME = {
  10: L("tienden", "tenths"),
  100: L("honderdsten", "hundredths"),
  1000: L("duizendsten", "thousandths"),
} as const;

export const decimalFraction: Generator = {
  id: "u0.decimal-fraction",
  skillId: "u0.decimals",
  title: L("Kommagetal en breuk", "Decimal and fraction"),
  generate(rng, difficulty) {
    // Level 1 mixes in "read off": 37/100 → 0.37.
    const readOff = difficulty === 1 && rng.chance();
    if (difficulty < 3 && !readOff) {
      // Decimal → fraction in lowest terms.
      const P = difficulty === 1 ? 10 : 100;
      let k: number;
      do k = rng.int(1, P - 1);
      while (difficulty === 2 && k % 10 === 0);
      const value = new Fraction(k, P);
      const latex = dec(value);
      const g = gcd(k, P);
      const steps: Step[] = [
        { latex, note: L("Dit is het kommagetal.", "This is the decimal.") },
        {
          latex: `\\frac{\\ask{${k}}}{${P}}`,
          note: L(
            `Het laatste cijfer staat op de plek van de ${PLACE_NAME[P].nl}. Dus delen door $${P}$.`,
            `The last digit is in the ${PLACE_NAME[P].en} place. So divide by $${P}$.`,
          ),
        },
      ];
      if (g > 1) {
        steps.push(
          { latex: `\\frac{\\hl{${k}:${g}}}{\\hl{${P}:${g}}}`, note: L(`Vereenvoudig: deel boven en onder door $${g}$.`, `Simplify: divide top and bottom by $${g}$.`) },
          { latex: `\\frac{\\ask{${k / g}}}{${P / g}}`, note: L(`Boven: $${k}:${g}$.`, `Top: $${k}:${g}$.`) },
        );
      }
      // Typical slip: the wrong place (tenths read as hundredths or the other way round).
      const wrongPlace = new Fraction(k, P === 10 ? 100 : 10);
      return {
        prompt: L(`Schrijf $${latex}$ als breuk. Vereenvoudig zo ver mogelijk.`, `Write $${latex}$ as a fraction. Simplify as far as possible.`),
        latex,
        visual:
          P === 10
            ? { kind: "number-line", min: 0, max: 1, denominator: 10, marks: [{ value: k / 10, label: latex }] }
            : custom("u0.hundred-grid", { percent: k, mode: "decimal" }, L(`Honderd vakjes. Er zijn er $${k}$ gekleurd.`, `A hundred squares. $${k}$ of them are coloured.`)),
        answer: { kind: "expr", latex: frac(value), form: "fraction" },
        calculator: "off",
        hints: {
          nudge: L(
            `Het laatste cijfer van $${latex}$ staat op de plek van de ${PLACE_NAME[P].nl}. Dus $${latex}$ is $${k}$ ${PLACE_NAME[P].nl}.`,
            `The last digit of $${latex}$ is in the ${PLACE_NAME[P].en} place. So $${latex}$ is $${k}$ ${PLACE_NAME[P].en}.`,
          ),
          rule: {
            text: L(
              "Kommagetal naar breuk: tienden delen door $10$, honderdsten door $100$. Vereenvoudig daarna.",
              "Decimal to fraction: tenths over $10$, hundredths over $100$. Then simplify.",
            ),
            ruleId: "u0.decimal-fraction",
          },
          solution: { steps },
        },
        mistakes: [
          {
            id: "wrong-place",
            latex: frac(wrongPlace),
            explain: L(
              `Let op de plek. Er ${P === 10 ? "staat één cijfer" : "staan twee cijfers"} achter de komma, dus delen door $${P}$.`,
              `Watch the place. There ${P === 10 ? "is one digit" : "are two digits"} after the point, so divide by $${P}$.`,
            ),
          },
        ],
      };
    }

    // Fraction → decimal, via a denominator 10, 100 or 1000.
    let d: number, n: number;
    if (readOff) {
      d = rng.pick([10, 100]);
      do n = rng.int(1, d - 1);
      while (n % 10 === 0);
    } else {
      d = rng.pick([2, 4, 5, 8, 20, 25, 40, 50]);
      do n = rng.int(1, 2 * d - 1);
      while (gcd(n, d) !== 1);
    }
    const P = [10, 100, 1000].find((p) => p % d === 0)!;
    const m = P / d;
    const value = new Fraction(n, d);
    const latex = `\\frac{${n}}{${d}}`;
    const answer = dec(value);
    const steps: Step[] = [{ latex, note: L("Dit is de breuk.", "This is the fraction.") }];
    if (m > 1) {
      steps.push(
        {
          latex: `\\frac{\\hl{${n}\\cdot ${m}}}{\\hl{${d}\\cdot ${m}}}`,
          note: L(`Maak de noemer $${P}$: boven en onder keer $${m}$.`, `Make the denominator $${P}$: top and bottom times $${m}$.`),
        },
        { latex: `\\frac{\\ask{${n * m}}}{${P}}`, note: L(`Boven: $${n}\\cdot ${m}$.`, `Top: $${n}\\cdot ${m}$.`) },
      );
    }
    steps.push({
      latex: `\\ask{${answer}}`,
      note: L(
        `${n * m} ${PLACE_NAME[P as 10 | 100 | 1000].nl}: ${Math.log10(P)} ${P === 10 ? "cijfer" : "cijfers"} achter de komma.`,
        `${n * m} ${PLACE_NAME[P as 10 | 100 | 1000].en}: ${Math.log10(P)} ${P === 10 ? "digit" : "digits"} after the point.`,
      ),
    });
    // Typical slips: writing the digits with a point (3/8 → 3.8), or the wrong place (37/100 → 3.7).
    const digits = readOff ? new Fraction(n, d === 10 ? 100 : 10).valueOf() : Number(`${n}.${d}`);
    return {
      prompt: L(`Schrijf $${latex}$ als kommagetal.`, `Write $${latex}$ as a decimal.`),
      latex,
      answer: { kind: "expr", latex: answer, form: "decimal", decimals: places(answer) },
      calculator: "off",
      hints: {
        nudge: readOff
          ? L(
              `De noemer is $${d}$. Dus $${n}$ ${PLACE_NAME[d as 10 | 100].nl}. Hoeveel cijfers komen er achter de komma?`,
              `The denominator is $${d}$. So $${n}$ ${PLACE_NAME[d as 10 | 100].en}. How many digits go after the point?`,
            )
          : L(
              `Met welk getal maak je van de noemer $${d}$ een $10$, $100$ of $1000$?`,
              `What number turns the denominator $${d}$ into $10$, $100$ or $1000$?`,
            ),
        rule: {
          text: L(
            "Breuk naar kommagetal: maak de noemer $10$, $100$ of $1000$. Dan lees je het kommagetal zo af.",
            "Fraction to decimal: make the denominator $10$, $100$ or $1000$. Then you can read off the decimal.",
          ),
          ruleId: "u0.decimal-fraction",
        },
        solution: { steps },
      },
      mistakes:
        digits !== value.valueOf()
          ? [
              {
                id: readOff ? "wrong-place" : "digits-with-point",
                latex: dec(digits),
                explain: readOff
                  ? L(
                      `Let op de noemer $${d}$: ${d === 10 ? "één cijfer" : "twee cijfers"} achter de komma.`,
                      `Look at the denominator $${d}$: ${d === 10 ? "one digit" : "two digits"} after the point.`,
                    )
                  : L(
                      `Een breukstreep is geen komma. $${latex}$ betekent $${n}:${d}$.`,
                      `A fraction bar is not a decimal point. $${latex}$ means $${n}:${d}$.`,
                    ),
              },
            ]
          : [],
    };
  },
  verify(ex) {
    // Independent check: same value (CAS) and the right form for the question.
    if (ex.answer.kind !== "expr" || ex.latex === undefined) return false;
    const exact = evaluate(parse(ex.latex));
    const given = evaluate(parse(ex.answer.latex));
    if (exact === null || given === null || Math.abs(exact - given) > 1e-12) return false;
    return ex.answer.form === "decimal" || checkExpr(ex.answer, ex.answer.latex).correct;
  },
};

// ---------------------------------------------------------------------------
// Times and divided by 10, 100, 1000
// ---------------------------------------------------------------------------

export const timesTen: Generator = {
  id: "u0.times-ten",
  skillId: "u0.times-ten",
  title: L("Keer en gedeeld door 10, 100, 1000", "Times and divided by 10, 100, 1000"),
  generate(rng, difficulty) {
    // value = m · 10^e, with m a 2- or 3-digit number that does not end in 0.
    // All digits of the start and of the result stay between 10^-3 and 10^3.
    let m: number, e: number, f: number, times: boolean;
    const digitsOf = (x: number) => String(x).length;
    const fits = (exp: number) => exp >= -3 && exp + digitsOf(m) - 1 <= 3;
    for (;;) {
      m = rng.int(difficulty === 3 ? 2 : 11, difficulty === 3 ? 99 : 99);
      if (m % 10 === 0) continue;
      times = difficulty === 1 ? true : difficulty === 2 ? false : rng.chance();
      f = difficulty === 3 ? 3 : rng.int(1, 2);
      e = difficulty === 2 ? rng.int(-1, 1) : rng.int(-3, 0);
      if (difficulty === 1 && e < -2) continue;
      const after = times ? e + f : e - f;
      if (fits(e) && fits(after)) break;
    }
    const F = 10 ** f;
    const start = new Fraction(m).mul(new Fraction(10).pow(e));
    const result = times ? start.mul(F) : start.div(F);
    const sym = times ? "\\cdot" : ":";
    const latex = `${dec(start)}${sym} ${F}`;
    const steps: Step[] = [{ latex, note: L("Dit is de som.", "This is the sum.") }];
    if (f > 1) {
      steps.push({
        latex: `${dec(start)}${`${sym} \\hl{10}`.repeat(f)}`,
        note: L(`$${F}=${Array(f).fill("10").join("\\cdot ")}$.`, `$${F}=${Array(f).fill("10").join("\\cdot ")}$.`),
      });
    }
    let cur = start;
    for (let i = 0; i < f; i++) {
      cur = times ? cur.mul(10) : cur.div(10);
      steps.push({
        latex: `\\ask{${dec(cur)}}${`${sym} 10`.repeat(f - 1 - i)}`,
        note: times
          ? L("Keer $10$: elk cijfer schuift één plek naar links.", "Times $10$: every digit moves one place to the left.")
          : L("Gedeeld door $10$: elk cijfer schuift één plek naar rechts.", "Divided by $10$: every digit moves one place to the right."),
      });
    }

    const back = times ? start.div(F) : start.mul(F);
    const short = times ? start.mul(F / 10) : start.div(F / 10);
    const mistakes: Mistake[] = [
      {
        id: "wrong-direction",
        latex: dec(back),
        explain: times
          ? L("Je schoof de verkeerde kant op. Keer maakt het getal groter.", "You moved the wrong way. Times makes the number bigger.")
          : L("Je schoof de verkeerde kant op. Gedeeld door maakt het getal kleiner.", "You moved the wrong way. Divided by makes the number smaller."),
      },
    ];
    if (f > 1) {
      mistakes.push({
        id: "one-place-short",
        latex: dec(short),
        explain: L(
          `$${F}$ heeft ${f} nullen. Schuif dus ${f} plekken.`,
          `$${F}$ has ${f} zeros. So move ${f} places.`,
        ),
      });
    }

    return {
      prompt: L("Reken uit zonder rekenmachine.", "Work it out without a calculator."),
      latex,
      visual: custom(
        "u0.place-value",
        { value: dec(start), factor: F, op: times ? "*" : ":" },
        L(
          `Een plaatswaardekaart met het getal $${dec(start)}$. Elke knop schuift de cijfers één plek.`,
          `A place value chart with the number $${dec(start)}$. Each button moves the digits one place.`,
        ),
      ),
      answer: { kind: "expr", latex: dec(result), form: "any" },
      calculator: "off",
      hints: {
        nudge: times
          ? L(
              `Keer $${F}$: elk cijfer van $${dec(start)}$ schuift ${f} ${f === 1 ? "plek" : "plekken"} naar links. Wordt het getal groter of kleiner?`,
              `Times $${F}$: every digit of $${dec(start)}$ moves ${f} ${f === 1 ? "place" : "places"} to the left. Does the number get bigger or smaller?`,
            )
          : L(
              `Gedeeld door $${F}$: elk cijfer van $${dec(start)}$ schuift ${f} ${f === 1 ? "plek" : "plekken"} naar rechts. Wordt het getal groter of kleiner?`,
              `Divided by $${F}$: every digit of $${dec(start)}$ moves ${f} ${f === 1 ? "place" : "places"} to the right. Does the number get bigger or smaller?`,
            ),
        rule: {
          text: L(
            "Keer $10$, $100$, $1000$: de cijfers schuiven $1$, $2$, $3$ plekken naar links. Gedeeld door: naar rechts.",
            "Times $10$, $100$, $1000$: the digits move $1$, $2$, $3$ places to the left. Divided by: to the right.",
          ),
          ruleId: "u0.times-ten",
        },
        solution: { steps },
      },
      mistakes,
    };
  },
  verify(ex) {
    // Independent check: the CAS evaluates the printed sum.
    return ex.latex !== undefined && ex.answer.kind === "expr" && equivalent(ex.latex, ex.answer.latex);
  },
};

// ---------------------------------------------------------------------------
// Adding and multiplying decimals
// ---------------------------------------------------------------------------

/** "Digits without the point", as an integer: 2.75 → 275. */
const digitsInt = (s: string) => Number(s.replace(".", ""));

export const decimalArithmetic: Generator = {
  id: "u0.decimal-arithmetic",
  skillId: "u0.decimal-arithmetic",
  title: L("Rekenen met kommagetallen", "Calculating with decimals"),
  generate(rng, difficulty) {
    if (difficulty === 1) {
      // a + b, one decimal each; the tenths add up past a whole.
      let a: Fraction, b: Fraction;
      do {
        a = new Fraction(rng.int(11, 89), 10);
        b = new Fraction(rng.int(11, 59), 10);
      } while (a.mod(1).equals(0) || b.mod(1).equals(0) || a.mod(1).add(b.mod(1)).compare(1) <= 0);
      const sum = a.add(b);
      const aw = a.floor();
      const bw = b.floor();
      const at = a.sub(aw);
      const bt = b.sub(bw);
      const latex = `${dec(a)}+${dec(b)}`;
      const steps: Step[] = [
        { latex, note: L("Dit is de som.", "This is the sum.") },
        {
          latex: `\\hl{${dec(aw)}+${dec(bw)}}+\\hl{${dec(at)}+${dec(bt)}}`,
          note: L("Splits in hele getallen en tienden.", "Split into whole numbers and tenths."),
        },
        { latex: `\\ask{${dec(aw.add(bw))}}+${dec(at)}+${dec(bt)}`, note: L("Tel de hele getallen op.", "Add the whole numbers.") },
        { latex: `${dec(aw.add(bw))}+\\ask{${dec(at.add(bt))}}`, note: L("Tel de tienden op.", "Add the tenths.") },
        { latex: `\\ask{${dec(sum)}}`, note: L("Tel alles op.", "Add everything.") },
      ];
      // Typical slip: forgetting that 10 tenths make a whole.
      const wrong = aw.add(bw).add(at.add(bt).sub(1));
      const max = Math.ceil(sum.valueOf()) + 1;
      return {
        prompt: L("Reken uit in je hoofd.", "Work it out in your head."),
        latex,
        visual: { kind: "number-line", min: Math.max(0, Math.floor(a.valueOf()) - 1), max, start: a.valueOf(), jumps: [b.valueOf()], denominator: 10 },
        answer: { kind: "expr", latex: dec(sum), form: "any" },
        calculator: "off",
        hints: {
          nudge: L(
            `Eerst de hele getallen: $${dec(aw)}+${dec(bw)}$. Dan de tienden: $${dec(at)}+${dec(bt)}$. Let op: dat is meer dan $1$.`,
            `First the whole numbers: $${dec(aw)}+${dec(bw)}$. Then the tenths: $${dec(at)}+${dec(bt)}$. Careful: that is more than $1$.`,
          ),
          rule: {
            text: L(
              "Kommagetallen optellen: zet de komma's onder elkaar. Tien tienden is één hele.",
              "Adding decimals: line up the decimal points. Ten tenths make one whole.",
            ),
            ruleId: "u0.decimal-arithmetic",
          },
          solution: { steps },
        },
        mistakes: [
          {
            id: "lost-carry",
            latex: dec(wrong),
            explain: L(
              `$${dec(at)}+${dec(bt)}=${dec(at.add(bt))}$. Dat is meer dan één hele. Vergeet die hele niet.`,
              `$${dec(at)}+${dec(bt)}=${dec(at.add(bt))}$. That is more than one whole. Do not forget that whole.`,
            ),
          },
        ],
      };
    }

    if (difficulty === 2) {
      // Different numbers of decimals: 2.75 + 1.5 or 5.2 − 1.75.
      // a has two decimals, b has one (neither ends in 0).
      const notTen = (min: number, max: number) => {
        let v: number;
        do v = rng.int(min, max);
        while (v % 10 === 0);
        return v;
      };
      const a = new Fraction(notTen(101, 999), 100);
      const b = new Fraction(notTen(11, 99), 10);
      const swap = rng.chance();
      const minus = rng.chance();
      let [x, y] = swap ? [b, a] : [a, b];
      if (minus && x.compare(y) < 0) [x, y] = [y, x];
      const xs = dec(x);
      const ys = dec(y);
      const result = minus ? x.sub(y) : x.add(y);
      const pad = (s: string) => (places(s) === 1 ? `${s}0` : s);
      const latex = `${xs}${minus ? "-" : "+"}${ys}`;
      const padded = `${places(xs) === 1 ? `\\hl{${pad(xs)}}` : xs}${minus ? "-" : "+"}${places(ys) === 1 ? `\\hl{${pad(ys)}}` : ys}`;
      const steps: Step[] = [
        { latex, note: L("Dit is de som.", "This is the sum.") },
        { latex: padded, note: L("Maak evenveel cijfers achter de komma. Zet er een $0$ bij.", "Give both the same number of decimals. Add a $0$.") },
        { latex: `\\ask{${dec(result)}}`, note: L("Reken uit, met de komma's onder elkaar.", "Work it out, with the points lined up.") },
      ];
      // Typical slip: lining up the last digits instead of the points.
      const dx = places(xs);
      const dy = places(ys);
      const big = Math.max(dx, dy);
      const wrongInt = minus ? digitsInt(xs) - digitsInt(ys) : digitsInt(xs) + digitsInt(ys);
      const wrong = new Fraction(wrongInt, 10 ** big);
      return {
        prompt: L("Reken uit. Zet de komma's onder elkaar.", "Work it out. Line up the decimal points."),
        latex,
        answer: { kind: "expr", latex: dec(result), form: "any" },
        calculator: "off",
        hints: {
          nudge: L(
            `$${xs}$ en $${ys}$ hebben niet evenveel cijfers achter de komma. Zet een $0$ achter het kortste getal.`,
            `$${xs}$ and $${ys}$ do not have the same number of decimals. Put a $0$ after the shorter one.`,
          ),
          rule: {
            text: L(
              "Kommagetallen optellen of aftrekken: zet de komma's onder elkaar. Vul aan met nullen.",
              "Adding or subtracting decimals: line up the decimal points. Fill up with zeros.",
            ),
            ruleId: "u0.decimal-arithmetic",
          },
          solution: { steps },
        },
        mistakes: wrong.equals(result)
          ? []
          : [
              {
                id: "aligned-right",
                latex: dec(wrong),
                explain: L(
                  "Je zette de laatste cijfers onder elkaar. Zet de komma's onder elkaar.",
                  "You lined up the last digits. Line up the decimal points instead.",
                ),
              },
            ],
      };
    }

    // Level 3: multiplying two decimals. The product of the digits never
    // ends in 0 (like 5·4 = 20), so "count the decimals" gives the answer as written.
    let p: number, q: number, big: boolean, xa: Fraction, yb: Fraction;
    do {
      p = rng.int(2, 9);
      q = rng.int(2, 9);
      big = rng.chance(0.35);
      xa = big ? new Fraction(rng.pick([11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 23, 24, 25]), 10) : new Fraction(p, 10);
      yb = new Fraction(q, rng.chance(0.3) ? 100 : 10);
    } while (digitsInt(dec(xa)) * digitsInt(dec(yb)) % 10 === 0);
    const xs = dec(xa);
    const ys = dec(yb);
    const result = xa.mul(yb);
    const n1 = places(xs);
    const n2 = places(ys);
    const ix = digitsInt(xs);
    const iy = digitsInt(ys);
    const latex = `${xs}\\cdot ${ys}`;
    const steps: Step[] = [
      { latex, note: L("Dit is de som.", "This is the sum.") },
      {
        latex: `\\hl{\\frac{${ix}}{${10 ** n1}}}\\cdot\\hl{\\frac{${iy}}{${10 ** n2}}}`,
        note: L("Schrijf beide getallen als breuk.", "Write both numbers as a fraction."),
      },
      {
        latex: `\\frac{\\ask{${ix * iy}}}{${10 ** (n1 + n2)}}`,
        note: L("Boven keer boven, onder keer onder.", "Top times top, bottom times bottom."),
      },
      {
        latex: `\\ask{${dec(result)}}`,
        note: L(
          `Samen ${n1 + n2} cijfers achter de komma.`,
          `Together ${n1 + n2} digits after the point.`,
        ),
      },
    ];
    const wrong = new Fraction(ix * iy, 10 ** Math.max(n1, n2));
    return {
      prompt: L("Reken uit zonder rekenmachine.", "Work it out without a calculator."),
      latex,
      visual:
        !big && n2 === 1
          ? custom(
              "u0.hundred-grid",
              { percent: p * q, mode: "decimal", rect: { cols: p, rows: q } },
              L(
                `Een vierkant van $1$ bij $1$, verdeeld in honderd vakjes. Een rechthoek van $${xs}$ bij $${ys}$ is gekleurd.`,
                `A $1$ by $1$ square, split into a hundred squares. A $${xs}$ by $${ys}$ rectangle is coloured.`,
              ),
            )
          : undefined,
      answer: { kind: "expr", latex: dec(result), form: "any" },
      calculator: "off",
      hints: {
        nudge: L(
          `Reken eerst $${ix}\\cdot ${iy}$ zonder komma's. Tel dan de cijfers achter de komma: $${n1}+${n2}$.`,
          `First work out $${ix}\\cdot ${iy}$ without points. Then count the digits after the points: $${n1}+${n2}$.`,
        ),
        rule: {
          text: L(
            "Kommagetallen vermenigvuldigen: reken zonder komma. Het antwoord krijgt evenveel cijfers achter de komma als de twee getallen samen.",
            "Multiplying decimals: calculate without the points. The answer gets as many decimals as the two numbers together.",
          ),
          ruleId: "u0.decimal-arithmetic",
        },
        solution: { steps },
      },
      mistakes: wrong.equals(result)
        ? []
        : [
            {
              id: "decimals-count",
              latex: dec(wrong),
              explain: L(
                `Tel de cijfers achter de komma van allebei: $${n1}+${n2}=${n1 + n2}$. Het antwoord heeft er dus ${n1 + n2}.`,
                `Count the decimals of both numbers: $${n1}+${n2}=${n1 + n2}$. So the answer has ${n1 + n2}.`,
              ),
            },
          ],
    };
  },
  verify(ex) {
    // Independent check: the CAS evaluates the printed sum.
    return ex.latex !== undefined && ex.answer.kind === "expr" && equivalent(ex.latex, ex.answer.latex);
  },
};
