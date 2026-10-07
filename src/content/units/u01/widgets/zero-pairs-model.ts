/**
 * Model behind the zero-pairs widget: plus and minus counters (fiches).
 *
 * A plus counter is worth +1, a minus counter −1. One of each together is a
 * zero pair: worth 0. With that, "a − (−b)" becomes something you can see:
 * take away b minus counters. If there are not enough, first add zero pairs
 * (that changes nothing), then take them away.
 *
 * Pure functions, tested in `tests/units/u01-widgets.test.ts`.
 */
import type { Loc } from "@/i18n/locale";

export type Chip = { id: number; sign: 1 | -1; mark?: "new" | "leave" | "pair" };
export type Frame = { chips: Chip[]; caption: Loc; latex: string };

const br = (n: number) => (n < 0 ? `(${n})` : String(n));
const value = (chips: Chip[]) => chips.reduce((s, c) => s + c.sign, 0);
const plain = (chips: Chip[]): Chip[] => chips.map(({ id, sign }) => ({ id, sign }));
const word = (sign: 1 | -1, n: number): Loc =>
  sign > 0
    ? { nl: `${n} ${n === 1 ? "plus-fiche" : "plus-fiches"}`, en: `${n} plus ${n === 1 ? "counter" : "counters"}` }
    : { nl: `${n} ${n === 1 ? "min-fiche" : "min-fiches"}`, en: `${n} minus ${n === 1 ? "counter" : "counters"}` };

/** All frames for `a op b`. The last frame shows the answer. */
export function zeroPairFrames(a: number, op: "+" | "-", b: number): Frame[] {
  let id = 0;
  const make = (sign: 1 | -1, n: number, mark?: Chip["mark"]): Chip[] =>
    Array.from({ length: n }, () => ({ id: id++, sign, mark }));
  const expr = `${a}${op}${br(b)}`;
  const frames: Frame[] = [];
  const sa: 1 | -1 = a < 0 ? -1 : 1;
  let chips = make(sa, Math.abs(a));
  frames.push({
    chips,
    caption: { nl: `Begin met $${a}$: ${word(sa, Math.abs(a)).nl}.`, en: `Start with $${a}$: ${word(sa, Math.abs(a)).en}.` },
    latex: String(a),
  });

  const sb: 1 | -1 = b < 0 ? -1 : 1;
  const nb = Math.abs(b);
  if (op === "+") {
    chips = [...plain(chips), ...make(sb, nb, "new")];
    frames.push({
      chips,
      caption: { nl: `Plus $${br(b)}$: leg er ${word(sb, nb).nl} bij.`, en: `Plus $${br(b)}$: add ${word(sb, nb).en}.` },
      latex: expr,
    });
  } else {
    const have = chips.filter((c) => c.sign === sb).length;
    if (have < nb) {
      const k = nb - have;
      chips = [...plain(chips), ...make(1, k, "new"), ...make(-1, k, "new")];
      frames.push({
        chips,
        caption: {
          nl: `Je moet ${word(sb, nb).nl} weghalen, maar er zijn er te weinig. Leg er ${k} ${k === 1 ? "nulpaar" : "nulparen"} bij. Die zijn samen $0$.`,
          en: `You must take away ${word(sb, nb).en}, but there are too few. Add ${k} zero ${k === 1 ? "pair" : "pairs"}. Together they are $0$.`,
        },
        latex: expr,
      });
    }
    // Take away the last nb counters of sign sb.
    const leaving = new Set(
      chips
        .filter((c) => c.sign === sb)
        .slice(-nb)
        .map((c) => c.id),
    );
    frames.push({
      chips: plain(chips).map((c) => (leaving.has(c.id) ? { ...c, mark: "leave" } : c)),
      caption: { nl: `Min $${br(b)}$: haal ${word(sb, nb).nl} weg.`, en: `Minus $${br(b)}$: take away ${word(sb, nb).en}.` },
      latex: expr,
    });
    chips = plain(chips).filter((c) => !leaving.has(c.id));
  }

  // Cancel zero pairs.
  const plus = chips.filter((c) => c.sign > 0);
  const minus = chips.filter((c) => c.sign < 0);
  const m = Math.min(plus.length, minus.length);
  if (m > 0) {
    const paired = new Set([...plus.slice(0, m), ...minus.slice(0, m)].map((c) => c.id));
    frames.push({
      chips: plain(chips).map((c) => (paired.has(c.id) ? { ...c, mark: "pair" } : c)),
      caption: {
        nl: `Een plus-fiche en een min-fiche samen zijn $0$. Er ${m === 1 ? "is 1 nulpaar" : `zijn ${m} nulparen`}: weg ermee.`,
        en: `A plus counter and a minus counter together are $0$. There ${m === 1 ? "is 1 zero pair" : `are ${m} zero pairs`}: remove them.`,
      },
      latex: expr,
    });
    chips = plain(chips).filter((c) => !paired.has(c.id));
  }
  const r = value(chips);
  frames.push({
    chips: plain(chips),
    caption: { nl: `Er blijft $${r}$ over.`, en: `What is left is $${r}$.` },
    latex: `${expr}=${r}`,
  });
  return frames;
}

/** Column of every chip: plus counters on the top row, minus counters below. */
export function chipColumns(chips: Chip[]): Map<number, number> {
  const cols = new Map<number, number>();
  let p = 0;
  let n = 0;
  for (const c of chips) cols.set(c.id, c.sign > 0 ? p++ : n++);
  return cols;
}

/** The value the counters stand for. */
export const chipValue = value;
