/**
 * Pure models behind the unit 2 widgets. The widgets only draw these, and
 * the generators use the same functions, so a picture and its exercise can
 * never disagree. Tested in `tests/units/u02-helpers.test.ts`.
 */

// ---------------------------------------------------------------------------
// Algebra tiles: x-blocks and 1-blocks
// ---------------------------------------------------------------------------

/** One term of a linear expression: coefficient and kind (`3x` = [3, "x"]). */
export type TileTerm = [number, "x" | "1"];
export type Tile = { id: string; kind: "x" | "1"; neg: boolean; term: number };

/** Every term as separate tiles: `3x-2` gives three x-tiles and two minus-tiles. */
export function tilesOf(terms: TileTerm[]): Tile[] {
  return terms.flatMap(([coef, kind], t) =>
    Array.from({ length: Math.abs(coef) }, (_, i) => ({ id: `${t}-${i}`, kind, neg: coef < 0, term: t })),
  );
}

/** Like terms combined: `3x+2+4x-5` → { x: 7, ones: -3 }. */
export function combineTerms(terms: TileTerm[]): { x: number; ones: number } {
  let x = 0;
  let ones = 0;
  for (const [c, k] of terms) {
    if (k === "x") x += c;
    else ones += c;
  }
  return { x, ones };
}

/** Value of the expression for a given x. */
export const tilesValue = (terms: TileTerm[], x: number) => terms.reduce((s, [c, k]) => s + c * (k === "x" ? x : 1), 0);

const paren = (v: number) => (v < 0 ? `(${v})` : String(v));

/** The expression as LaTeX: `3x+2-x`. */
export const termsLatex = (terms: TileTerm[]) => monosLatex(terms.map(([c, k]) => [c, k === "x" ? 1 : 0] as Mono));

/** The expression with x filled in: `3\cdot 4+2`, `-(-3)+5`. */
export function filledLatex(terms: TileTerm[], x: number): string {
  return terms
    .map(([c, k], i) => {
      let s: string;
      if (k === "1") s = String(c);
      else if (c === 1) s = paren(x);
      else if (c === -1) s = `-${paren(x)}`;
      else s = `${c}\\cdot ${paren(x)}`;
      return i === 0 || s.startsWith("-") ? s : `+${s}`;
    })
    .join("");
}

/**
 * Ids of tiles that cancel: a plus-tile and a minus-tile of the same kind
 * together are zero ("nulparen").
 */
export function zeroPairIds(tiles: Tile[]): Set<string> {
  const out = new Set<string>();
  for (const kind of ["x", "1"] as const) {
    const pos = tiles.filter((t) => t.kind === kind && !t.neg);
    const neg = tiles.filter((t) => t.kind === kind && t.neg);
    const n = Math.min(pos.length, neg.length);
    for (let i = 0; i < n; i++) {
      out.add(pos[pos.length - 1 - i].id);
      out.add(neg[i].id);
    }
  }
  return out;
}

export const TILE = { w: 26, xh: 64, uh: 26, gap: 6, groupGap: 24 };

export type TilePos = { x: number; visible: boolean };

/**
 * Horizontal positions of all tiles in one phase:
 * - `written`: in the order of the expression, one group per term,
 * - `sorted`: x-tiles together, then the 1-tiles (plus before minus),
 * - `cancelled`: as sorted, but zero pairs are gone and the rest closes up.
 * Returns positions plus the groups (start, end, label index) for labels.
 */
export function tileLayout(
  tiles: Tile[],
  phase: "written" | "sorted" | "cancelled",
): { pos: Map<string, TilePos>; width: number; groups: Array<{ from: number; to: number; term: number }> } {
  const pos = new Map<string, TilePos>();
  const groups: Array<{ from: number; to: number; term: number }> = [];
  const gone = phase === "cancelled" ? zeroPairIds(tiles) : new Set<string>();
  let order: Tile[][];
  if (phase === "written") {
    const terms = [...new Set(tiles.map((t) => t.term))];
    order = terms.map((term) => tiles.filter((t) => t.term === term));
  } else {
    const pick = (kind: "x" | "1", neg: boolean) => tiles.filter((t) => t.kind === kind && t.neg === neg);
    order = [pick("x", false), pick("x", true), pick("1", false), pick("1", true)].filter((g) => g.length > 0);
  }
  let x = 0;
  for (const group of order) {
    const from = x;
    for (const t of group) {
      if (gone.has(t.id)) {
        pos.set(t.id, { x: Math.max(0, x - TILE.gap - TILE.w / 2), visible: false });
        continue;
      }
      pos.set(t.id, { x, visible: true });
      x += TILE.w + TILE.gap;
    }
    if (x > from) {
      groups.push({ from, to: x - TILE.gap, term: group[0].term });
      x += TILE.groupGap - TILE.gap;
    }
  }
  return { pos, width: Math.max(TILE.w, x - TILE.groupGap), groups };
}

// ---------------------------------------------------------------------------
// Expanding brackets: monomials c·x^p
// ---------------------------------------------------------------------------

/** A term `c·x^p`: [coefficient, power]. `3x` = [3, 1], `-5` = [-5, 0]. */
export type Mono = [number, number];

/** LaTeX of a monomial, with a leading sign when `first` is false. */
export function monoLatex([c, p]: Mono, first = true): string {
  const v = p === 0 ? "" : p === 1 ? "x" : `x^{${p}}`;
  let s: string;
  if (v === "") s = String(c);
  else if (c === 1) s = v;
  else if (c === -1) s = `-${v}`;
  else s = `${c}${v}`;
  return first || s.startsWith("-") ? s : `+${s}`;
}

/** A bracket (sum of monomials) as LaTeX: `x+3`, `2x-5`. */
export const monosLatex = (ms: Mono[]) => ms.map((m, i) => monoLatex(m, i === 0)).join("") || "0";

/** Plain text of a monomial for SVG labels: `3x`, `−x²`, `+12`. */
export function monoText([c, p]: Mono, first = true): string {
  const v = p === 0 ? "" : p === 1 ? "x" : p === 2 ? "x²" : `x^${p}`;
  const abs = Math.abs(c);
  const body = v === "" ? String(abs) : abs === 1 ? v : `${abs}${v}`;
  if (c < 0) return `−${body}`;
  return first ? body : `+${body}`;
}

export const monoMul = (a: Mono, b: Mono): Mono => [a[0] * b[0], a[1] + b[1]];

/** All products "every term times every term", in papegaaienbek order. */
export function products(left: Mono[], right: Mono[]): Array<{ i: number; j: number; mono: Mono }> {
  return left.flatMap((a, i) => right.map((b, j) => ({ i, j, mono: monoMul(a, b) })));
}

/** Like terms combined, highest power first, zero terms dropped. */
export function collect(ms: Mono[]): Mono[] {
  const by = new Map<number, number>();
  for (const [c, p] of ms) by.set(p, (by.get(p) ?? 0) + c);
  return [...by.entries()]
    .filter(([, c]) => c !== 0)
    .sort((a, b) => b[0] - a[0])
    .map(([p, c]) => [c, p] as Mono);
}

// ---------------------------------------------------------------------------
// The machine, forwards and backwards (terugrekenen)
// ---------------------------------------------------------------------------

/**
 * One step of a machine. `n` is a number or a letter (as LaTeX).
 * `from` means "n minus the input" (`7-x`); it is its own inverse.
 */
export type MOp = { op: "+" | "-" | "*" | ":" | "from"; n: string };

/**
 * An expression being built and its kind: a single letter, an "atom" that
 * needs no brackets (a fraction), a product, or a sum.
 */
type Built = { latex: string; kind: "letter" | "atom" | "product" | "sum" };

const isNumber = (s: string) => /^-?\d+(\.\d+)?$/.test(s);

function applyLatex(e: Built, { op, n }: MOp): Built {
  const wrapped = e.kind === "sum" ? `(${e.latex})` : e.latex;
  switch (op) {
    case "+":
      return { latex: `${e.latex}+${n}`, kind: "sum" };
    case "-":
      return { latex: `${e.latex}-${n}`, kind: "sum" };
    case "from":
      return { latex: `${n}-${wrapped}`, kind: "sum" };
    case "*":
      // 2x and 2(x+3); otherwise a dot keeps it readable: l\cdot b, 2\cdot\frac{y}{3}.
      if (isNumber(n) && (e.kind === "letter" || e.kind === "sum")) return { latex: `${n}${wrapped}`, kind: "product" };
      return { latex: `${n}\\cdot ${wrapped}`, kind: "product" };
    case ":":
      return { latex: `\\frac{${e.latex}}{${n}}`, kind: "atom" };
  }
}

/** The inverse step: + ↔ −, × ↔ :, and `from` undoes itself. */
export function inverseOp(o: MOp): MOp {
  const inv = { "+": "-", "-": "+", "*": ":", ":": "*", from: "from" } as const;
  return { op: inv[o.op], n: o.n };
}

/** Forward partial formulas: x, 2x, 2x+3 for [·2, +3]. */
export function forwardChain(ops: MOp[], input: string): string[] {
  const out: string[] = [input];
  let e: Built = { latex: input, kind: "letter" };
  for (const o of ops) {
    e = applyLatex(e, o);
    out.push(e.latex);
  }
  return out;
}

/** Backward partial formulas: y, y−3, (y−3)/2 for [·2, +3]. */
export function backwardChain(ops: MOp[], output: string): string[] {
  const out: string[] = [output];
  let e: Built = { latex: output, kind: "letter" };
  for (const o of [...ops].reverse()) {
    e = applyLatex(e, inverseOp(o));
    out.push(e.latex);
  }
  return out;
}

/** One machine step on a number (null for letters or dividing by zero). */
export function applyNumber({ op, n }: MOp, v: number): number | null {
  if (!isNumber(n)) return null;
  const k = Number(n);
  switch (op) {
    case "+":
      return v + k;
    case "-":
      return v - k;
    case "from":
      return k - v;
    case "*":
      return v * k;
    case ":":
      return k === 0 ? null : v / k;
  }
}

/** Short label of a step for the machine boxes: `+3`, `−3`, `×2`, `:2`, `7−□`. */
export function opLabel({ op, n }: MOp): string {
  const t = n.replace(/\\cdot/g, "·");
  switch (op) {
    case "+":
      return `+${t}`;
    case "-":
      return `−${t}`;
    case "*":
      return `×${t}`;
    case ":":
      return `:${t}`;
    case "from":
      return `${t}−□`;
  }
}

/** The step as a Dutch/English instruction for notes. */
export function opWords({ op, n }: MOp): { nl: string; en: string } {
  switch (op) {
    case "+":
      return { nl: `plus $${n}$`, en: `add $${n}$` };
    case "-":
      return { nl: `min $${n}$`, en: `subtract $${n}$` };
    case "*":
      return { nl: `keer $${n}$`, en: `times $${n}$` };
    case ":":
      return { nl: `gedeeld door $${n}$`, en: `divided by $${n}$` };
    case "from":
      return { nl: `$${n}$ min het getal`, en: `$${n}$ minus the number` };
  }
}
