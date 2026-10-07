/**
 * Lesson 4 generator: powers (machten). What a power is, negative bases,
 * brackets, and powers inside the order of operations.
 */
import type { Generator, Loc, Step } from "@/content/types";
import type { Mistake } from "@/math/check";
import type { VisualSpec } from "@/visuals/types";
import { br, cleanMistakes, custom, L, valueOf } from "../helpers";

/** `2\cdot 2\cdot 2` for base 2 and exponent 3 (negative bases in brackets). */
export function repeated(base: number, n: number): string {
  return Array.from({ length: n }, () => br(base)).join("\\cdot ");
}

/** The growing-dots widget for a positive base, when the picture stays readable. */
export function powerSteps(base: number, n: number, min = 0, max = Math.max(n, 3)): VisualSpec {
  return custom(
    "u1.power-steps",
    { base, n, min, max },
    L(
      `De macht $${base}^{${n}}$ als stippen. Elke stap omhoog is keer $${base}$.`,
      `The power $${base}^{${n}}$ as dots. Every step up is times $${base}$.`,
    ),
  );
}

const powerRule = {
  text: L(
    "Een macht is herhaald vermenigvuldigen: $a^{n}$ is $n$ keer $a$ in een keersom. Niet $a\\cdot n$!",
    "A power is repeated multiplication: $a^{n}$ is $n$ times $a$ in a product. Not $a\\cdot n$!",
  ),
  ruleId: "u1.power",
};

type Built = {
  latex: string;
  prompt: Loc;
  answer: number;
  steps: Step[];
  nudge: Loc;
  rule: { text: Loc; ruleId: string; mnemonic?: "hmwvdoa" };
  mistakes: Array<Mistake | null>;
  visual?: VisualSpec;
};

const work = L("Bereken.", "Work it out.");

/** a^n = ?, worked out factor by factor. */
function valueOfPower(base: number, n: number): Built {
  const latex = `${br(base)}^{${n}}`;
  const value = base ** n;
  const steps: Step[] = [
    { latex, note: L(`Grondtal $${base}$, exponent $${n}$.`, `Base $${base}$, exponent $${n}$.`) },
    { latex: `\\hl{${repeated(base, n)}}`, note: L(`Schrijf $${n}$ keer $${br(base)}$ als keersom.`, `Write $${br(base)}$ $${n}$ times as a product.`) },
  ];
  // Running product: a·a = …, then · a again.
  let acc = base;
  for (let i = 2; i <= n; i++) {
    acc *= base;
    const rest = repeated(base, n - i);
    steps.push({
      latex: rest ? `\\ask{${acc}}\\cdot ${rest}` : `\\ask{${acc}}`,
      note: i === 2 ? L("Reken de eerste twee uit.", "Work out the first two.") : L(`Keer $${br(base)}$.`, `Times $${br(base)}$.`),
    });
  }
  return {
    latex,
    prompt: work,
    answer: value,
    steps,
    nudge:
      base < 0
        ? L(
            `$${latex}$ is $${repeated(base, n)}$. Tel de mintekens: ${n}. Is dat even of oneven?`,
            `$${latex}$ is $${repeated(base, n)}$. Count the minus signs: ${n}. Is that even or odd?`,
          )
        : L(`$${latex}$ betekent $${repeated(base, n)}$. Reken stap voor stap.`, `$${latex}$ means $${repeated(base, n)}$. Work it out step by step.`),
    rule: base < 0
      ? {
          text: L(
            "Tekenregel: een even aantal mintekens geeft plus, een oneven aantal geeft min.",
            "Sign rule: an even number of minus signs gives plus, an odd number gives minus.",
          ),
          ruleId: "u1.sign-rule",
        }
      : powerRule,
    mistakes: [
      {
        id: "times-exponent",
        latex: String(base * n),
        explain: L(
          `$${latex}$ is niet $${br(base)}\\cdot ${n}$. Het is $${n}$ keer $${br(base)}$ in een keersom: $${repeated(base, n)}$.`,
          `$${latex}$ is not $${br(base)}\\cdot ${n}$. It is $${br(base)}$ $${n}$ times in a product: $${repeated(base, n)}$.`,
        ),
      },
      base < 0
        ? {
            id: "sign",
            latex: String(-value),
            explain: L(
              `Het getal klopt, het teken niet. Er staan $${n}$ mintekens: ${n % 2 === 0 ? "even, dus plus" : "oneven, dus min"}.`,
              `The number is right, the sign is not. There are $${n}$ minus signs: ${n % 2 === 0 ? "even, so plus" : "odd, so minus"}.`,
            ),
            relatedSkill: "u1.multiply-divide",
          }
        : null,
    ],
    visual: base > 0 && value <= 243 ? powerSteps(base, n) : undefined,
  };
}

/** a·a·…·a = a^? : how many factors? */
function exponentOfProduct(base: number, n: number): Built {
  const product = repeated(base, n);
  const latex = `${product}=${base}^{\\square}`;
  return {
    latex,
    prompt: L("Schrijf als één macht. Welk getal komt op de plek van het vakje?", "Write as one power. Which number goes in the box?"),
    answer: n,
    steps: [
      {
        latex: Array(n).fill("1").join("+"),
        note: L(`Tel de getallen $${base}$ in $${product}$: één voor elke $${base}$.`, `Count the numbers $${base}$ in $${product}$: one for each $${base}$.`),
      },
      { latex: `\\ask{${n}}`, note: L(`Dus $${product}=${base}^{${n}}$.`, `So $${product}=${base}^{${n}}$.`) },
    ],
    nudge: L(`Tel de getallen $${base}$ in de keersom. Hoeveel zijn het er?`, `Count the numbers $${base}$ in the product. How many are there?`),
    rule: powerRule,
    mistakes: [
      {
        id: "the-value",
        latex: String(base ** n),
        explain: L(
          `Je rekende de keersom uit. Gevraagd is de exponent: hoe vaak staat $${base}$ er?`,
          `You worked out the product. The question asks for the exponent: how often does $${base}$ appear?`,
        ),
      },
    ],
    visual: base ** n <= 243 ? powerSteps(base, n) : undefined,
  };
}

/** −a^n: the power belongs to a only. */
function minusPower(a: number, n: number): Built {
  const latex = `-${a}^{${n}}`;
  const value = -(a ** n);
  return {
    latex,
    prompt: work,
    answer: value,
    steps: [
      { latex, note: L(`Geen haakjes: de macht hoort alleen bij $${a}$.`, `No brackets: the power only belongs to $${a}$.`) },
      { latex: `-(\\hl{${repeated(a, n)}})`, note: L("Eerst de macht. De min blijft ervoor staan.", "First the power. The minus stays in front.") },
      { latex: `\\ask{${value}}`, note: L(`Reken uit en zet de min ervoor.`, `Work it out and put the minus in front.`) },
    ],
    nudge: L(
      `Staan er haakjes om $-${a}$? Nee. Dus de macht hoort alleen bij $${a}$. Reken eerst $${a}^{${n}}$ uit.`,
      `Are there brackets around $-${a}$? No. So the power only belongs to $${a}$. First work out $${a}^{${n}}$.`,
    ),
    rule: {
      text: L(
        "Haakjes bij een macht: $(-3)^{2}=9$, maar $-3^{2}=-9$. Zonder haakjes doet de min niet mee.",
        "Brackets with a power: $(-3)^{2}=9$, but $-3^{2}=-9$. Without brackets the minus does not take part.",
      ),
      ruleId: "u1.power-brackets",
    },
    mistakes: [
      {
        id: "brackets",
        latex: String((-a) ** n),
        explain: L(
          `Je rekende $(-${a})^{${n}}$. Maar er staan geen haakjes. Dus eerst $${a}^{${n}}=${a ** n}$, dan de min ervoor.`,
          `You worked out $(-${a})^{${n}}$. But there are no brackets. So first $${a}^{${n}}=${a ** n}$, then the minus in front.`,
        ),
      },
      { id: "times-exponent", latex: String(-a * n), explain: L(`$${a}^{${n}}$ is niet $${a}\\cdot ${n}$.`, `$${a}^{${n}}$ is not $${a}\\cdot ${n}$.`) },
    ],
  };
}

export const powerValue: Generator = {
  id: "u1.power-value",
  skillId: "u1.powers",
  title: L("Machten uitrekenen", "Working out powers"),
  generate(rng, difficulty) {
    let b: Built;
    if (difficulty === 1) {
      if (rng.chance()) {
        b = exponentOfProduct(rng.int(2, 9), rng.int(2, 6));
      } else {
        const base = rng.pick([2, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        const maxN = base === 2 ? 6 : base === 10 ? 5 : base === 3 ? 4 : base <= 5 ? 3 : 2;
        b = valueOfPower(base, rng.int(2, maxN));
      }
    } else if (difficulty === 2) {
      const kind = rng.int(0, 3);
      if (kind === 0) {
        // Negative base in brackets.
        const a = rng.int(1, 9);
        b = valueOfPower(-a, rng.int(2, a === 1 ? 7 : a === 2 ? 5 : a <= 5 ? 3 : 2));
      } else if (kind === 1) {
        // Minus without brackets.
        const a = rng.int(2, 9);
        b = minusPower(a, rng.int(2, a <= 3 ? 4 : 2));
      } else if (kind === 2) {
        // Bigger squares and cubes.
        const a = rng.int(6, 20);
        b = valueOfPower(a, a <= 10 ? rng.int(2, 3) : 2);
      } else {
        // Higher powers of small numbers.
        const a = rng.int(2, 5);
        const n = a === 2 ? rng.int(7, 10) : a === 3 ? rng.int(5, 7) : rng.int(4, 5);
        b = valueOfPower(a, n);
      }
    } else {
      b = orderTemplate(rng.int(0, 3), rng.int(2, 5), rng.int(2, 3), rng.int(1, 12), rng.int(2, 4));
    }
    return {
      prompt: b.prompt,
      latex: b.latex,
      visual: b.visual,
      answer: { kind: "expr", latex: String(b.answer), form: "integer" },
      calculator: "off",
      hints: { nudge: b.nudge, rule: b.rule, solution: { steps: b.steps } },
      mistakes: cleanMistakes(String(b.answer), b.mistakes),
    };
  },
  verify(ex) {
    if (ex.answer.kind !== "expr" || !ex.latex) return false;
    const ans = Number(ex.answer.latex);
    // "product = base^□": put the answer in the box and compare both sides with the CAS.
    if (ex.latex.includes("\\square")) {
      const [lhs, rhs] = ex.latex.split("=");
      const l = valueOf(lhs);
      const r = valueOf(rhs.replace("\\square", String(ans)));
      return l !== null && r !== null && Math.abs(l - r) < 1e-9;
    }
    return valueOf(ex.latex) === ans;
  },
  isNice(ex) {
    return ex.answer.kind === "expr" && Number.isInteger(Number(ex.answer.latex)) && Math.abs(Number(ex.answer.latex)) <= 100000;
  },
};

/**
 * Powers inside a longer sum (difficulty 3). The power always goes first
 * (HMWVDOA), and each template has its own typical mistake.
 */
function orderTemplate(kind: number, a: number, n: number, c: number, k: number): Built {
  const hm = {
    text: L(
      "Rekenvolgorde: eerst haakjes, dan machten, dan keer en delen, dan plus en min.",
      "Order of operations: first brackets, then powers, then multiply and divide, then add and subtract.",
    ),
    ruleId: "u0.order-of-operations",
    mnemonic: "hmwvdoa" as const,
  };
  const pw = a ** n;
  if (kind === 0) {
    // k · a^n
    const latex = `${k}\\cdot ${a}^{${n}}`;
    const value = k * pw;
    return {
      latex,
      prompt: work,
      answer: value,
      steps: [
        { latex, note: L("Eerst de macht, dan keer.", "First the power, then multiply.") },
        { latex: `${k}\\cdot \\ask{${pw}}`, note: L(`$${a}^{${n}}=${repeated(a, n)}$.`, `$${a}^{${n}}=${repeated(a, n)}$.`) },
        { latex: `\\ask{${value}}`, note: L("Nu keer.", "Now multiply.") },
      ],
      nudge: L(
        `De macht hoort alleen bij $${a}$. Reken eerst $${a}^{${n}}$ uit, daarna keer $${k}$.`,
        `The power only belongs to $${a}$. First work out $${a}^{${n}}$, then times $${k}$.`,
      ),
      rule: hm,
      mistakes: [
        {
          id: "multiply-first",
          latex: String((k * a) ** n),
          explain: L(
            `Je deed eerst $${k}\\cdot ${a}$. Maar een macht gaat vóór keer. De macht hoort alleen bij $${a}$.`,
            `You did $${k}\\cdot ${a}$ first. But a power comes before multiplying. The power only belongs to $${a}$.`,
          ),
          relatedSkill: "u0.order-of-operations",
        },
      ],
    };
  }
  if (kind === 1) {
    // −a^2 + c: the minus is not squared.
    const latex = `-${a}^{2}+${c}`;
    const value = -(a * a) + c;
    return {
      latex,
      prompt: work,
      answer: value,
      steps: [
        { latex, note: L(`Geen haakjes om $-${a}$: de macht hoort alleen bij $${a}$.`, `No brackets around $-${a}$: the power only belongs to $${a}$.`) },
        { latex: `-\\ask{${a * a}}+${c}`, note: L(`Eerst de macht: $${a}^{2}=${a * a}$.`, `First the power: $${a}^{2}=${a * a}$.`) },
        { latex: `\\ask{${value}}`, note: L(`Start bij $-${a * a}$ en spring $${c}$ naar rechts.`, `Start at $-${a * a}$ and jump $${c}$ to the right.`) },
      ],
      nudge: L(
        `Staan er haakjes om $-${a}$? Nee. Reken dus eerst $${a}^{2}$ uit en zet de min ervoor.`,
        `Are there brackets around $-${a}$? No. So first work out $${a}^{2}$ and put the minus in front.`,
      ),
      rule: { text: L("Haakjes bij een macht: $-3^{2}=-9$, want zonder haakjes doet de min niet mee.", "Brackets with a power: $-3^{2}=-9$, because without brackets the minus does not take part."), ruleId: "u1.power-brackets" },
      mistakes: [
        {
          id: "brackets",
          latex: String(a * a + c),
          explain: L(
            `Je rekende $(-${a})^{2}$. Er staan geen haakjes, dus $-${a}^{2}=-${a * a}$.`,
            `You worked out $(-${a})^{2}$. There are no brackets, so $-${a}^{2}=-${a * a}$.`,
          ),
        },
      ],
    };
  }
  if (kind === 2) {
    // (−a)^n − k^2
    const latex = `(-${a})^{${n}}-${k}^{2}`;
    const p1 = (-a) ** n;
    const value = p1 - k * k;
    return {
      latex,
      prompt: work,
      answer: value,
      steps: [
        { latex, note: L("Twee machten. Die gaan eerst.", "Two powers. They go first.") },
        { latex: `\\ask{${p1}}-${k}^{2}`, note: L(`$(-${a})^{${n}}$: $${n}$ mintekens, ${n % 2 === 0 ? "even" : "oneven"}.`, `$(-${a})^{${n}}$: $${n}$ minus signs, ${n % 2 === 0 ? "even" : "odd"}.`) },
        { latex: `${p1}-\\ask{${k * k}}`, note: L(`$${k}^{2}=${k * k}$.`, `$${k}^{2}=${k * k}$.`) },
        { latex: `\\ask{${value}}`, note: L(`Spring $${k * k}$ naar links.`, `Jump $${k * k}$ to the left.`) },
      ],
      nudge: L(
        `Reken eerst de twee machten uit: $(-${a})^{${n}}$ en $${k}^{2}$. Let op het teken bij $(-${a})^{${n}}$.`,
        `First work out the two powers: $(-${a})^{${n}}$ and $${k}^{2}$. Watch the sign of $(-${a})^{${n}}$.`,
      ),
      rule: hm,
      mistakes: [
        {
          id: "sign",
          latex: String(-p1 - k * k),
          explain: L(
            `Kijk naar het teken van $(-${a})^{${n}}$: ${n} mintekens, dus ${n % 2 === 0 ? "positief" : "negatief"}.`,
            `Look at the sign of $(-${a})^{${n}}$: ${n} minus signs, so ${n % 2 === 0 ? "positive" : "negative"}.`,
          ),
          relatedSkill: "u1.multiply-divide",
        },
      ],
    };
  }
  // c − k·a^2
  const latex = `${c}-${k}\\cdot ${a}^{2}`;
  const value = c - k * a * a;
  return {
    latex,
    prompt: work,
    answer: value,
    steps: [
      { latex, note: L("Eerst de macht, dan keer, dan min.", "First the power, then multiply, then subtract.") },
      { latex: `${c}-${k}\\cdot \\ask{${a * a}}`, note: L(`$${a}^{2}=${a * a}$.`, `$${a}^{2}=${a * a}$.`) },
      { latex: `${c}-\\ask{${k * a * a}}`, note: L(`$${k}\\cdot ${a * a}=${k * a * a}$.`, `$${k}\\cdot ${a * a}=${k * a * a}$.`) },
      { latex: `\\ask{${value}}`, note: L(`Start bij $${c}$ en spring $${k * a * a}$ naar links.`, `Start at $${c}$ and jump $${k * a * a}$ to the left.`) },
    ],
    nudge: L(
      `Begin met de macht $${a}^{2}$. Dan $${k}\\cdot$ dat. Pas als laatste de min.`,
      `Start with the power $${a}^{2}$. Then $${k}\\cdot$ that. The minus comes last.`,
    ),
    rule: hm,
    mistakes: [
      {
        id: "left-to-right",
        latex: String((c - k) * a * a),
        explain: L(
          `Je rekende eerst $${c}-${k}$. Maar min komt als laatste: eerst de macht, dan keer.`,
          `You did $${c}-${k}$ first. But subtracting comes last: first the power, then multiply.`,
        ),
        relatedSkill: "u0.order-of-operations",
      },
    ],
  };
}
