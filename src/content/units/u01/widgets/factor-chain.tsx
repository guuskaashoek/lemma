"use client";
/**
 * The rules for powers as rows of tiles. Every tile is one factor.
 * - product:  a^3 · a^4 → the two rows slide together: 3 + 4 = 7 tiles.
 * - quotient: a^5 / a^2 → pairs above and below cancel: 5 − 2 = 3 left.
 * - power:    (a^2)^3   → the row is copied 3 times: 2 · 3 = 6 tiles.
 *   The row may hold a number too: (2a^3)^2 → 2·2 and six a's.
 */
import { Rich, StepButtons, Tex, useLoc, useSteps } from "./kit";

type Props =
  | { mode: "product"; left: string[]; right: string[] }
  | { mode: "quotient"; top: string[]; bottom: string[] }
  | { mode: "power"; group: string[]; times: number };

type Tile = { id: string; label: string; x: number; y: number; gone?: boolean; hl?: boolean };

const S = 38; // tile pitch
const isLetter = (t: string) => /^[a-z]$/.test(t);
const show = (t: string) => t.replace("-", "−");

/** Exponent of a row of equal letters, as LaTeX: a·a·a → a^{3}. */
function powerOf(row: string[]): string {
  const nums = row.filter((t) => !isLetter(t));
  const letters = row.filter(isLetter);
  const num = nums.length ? nums.map((n) => (n.startsWith("-") ? `(${n})` : n)).join("\\cdot ") : "";
  const counts = new Map<string, number>();
  for (const l of letters) counts.set(l, (counts.get(l) ?? 0) + 1);
  const lets = [...counts].map(([l, c]) => (c === 1 ? l : `${l}^{${c}}`)).join("");
  return [num, lets].filter(Boolean).join("\\cdot ") || "1";
}

function layout(p: Props, step: number): { tiles: Tile[]; caption: { nl: string; en: string }; latex: string; max: number; w: number; h: number } {
  if (p.mode === "product") {
    const { left, right } = p;
    const gap = step === 0 ? S : 0;
    const tiles: Tile[] = [
      ...left.map((t, i) => ({ id: `l${i}`, label: t, x: i * S, y: 40 })),
      ...right.map((t, i) => ({ id: `r${i}`, label: t, x: (left.length + i) * S + gap, y: 40, hl: step > 0 })),
    ];
    const base = left[0];
    const n = left.length + right.length;
    return {
      tiles,
      max: 1,
      w: n * S + S,
      h: 110,
      latex: step === 0 ? `${base}^{${left.length}}\\cdot ${base}^{${right.length}}` : `${base}^{${left.length}+${right.length}}=${base}^{${n}}`,
      caption:
        step === 0
          ? { nl: `Twee rijtjes: $${left.length}$ keer $${base}$ en $${right.length}$ keer $${base}$.`, en: `Two rows: $${base}$ $${left.length}$ times and $${base}$ $${right.length}$ times.` }
          : { nl: `Aan elkaar geplakt: $${n}$ keer $${base}$. Tel de exponenten op.`, en: `Glued together: $${base}$ $${n}$ times. Add the exponents.` },
    };
  }
  if (p.mode === "quotient") {
    const { top, bottom } = p;
    const m = Math.min(top.length, bottom.length);
    const final = step > m;
    const cancelled = Math.min(step, m);
    const keepTop = top.length - m;
    const keepBottom = bottom.length - m;
    const tiles: Tile[] = [
      ...top.map((t, i) => {
        const gone = i < cancelled;
        return { id: `t${i}`, label: t, x: final ? (i - m) * S : i * S, y: 10, gone: final ? gone : false, hl: !final && gone };
      }),
      ...bottom.map((t, i) => {
        const gone = i < cancelled;
        return { id: `b${i}`, label: t, x: final ? (i - m) * S : i * S, y: 90, gone: final ? gone : false, hl: !final && gone };
      }),
    ];
    const base = top[0];
    const res = top.length - bottom.length;
    return {
      tiles,
      max: m + 1,
      w: Math.max(top.length, bottom.length) * S + S,
      h: 150,
      latex: final
        ? res > 0
          ? `\\frac{${base}^{${top.length}}}{${base}^{${bottom.length}}}=${base}^{${res}}`
          : res === 0
            ? `\\frac{${base}^{${top.length}}}{${base}^{${bottom.length}}}=1`
            : `\\frac{${base}^{${top.length}}}{${base}^{${bottom.length}}}=\\frac{1}{${base}^{${-res}}}=${base}^{${res}}`
        : `\\frac{${base}^{${top.length}}}{${base}^{${bottom.length}}}`,
      caption: final
        ? keepTop > 0
          ? { nl: `Boven blijven er $${keepTop}$ over: $${top.length}-${bottom.length}=${res}$.`, en: `$${keepTop}$ are left on top: $${top.length}-${bottom.length}=${res}$.` }
          : keepBottom > 0
            ? { nl: `Onder blijven er $${keepBottom}$ over. De exponent wordt negatief: $${res}$.`, en: `$${keepBottom}$ are left below. The exponent becomes negative: $${res}$.` }
            : { nl: "Alles valt weg. Er blijft $1$ over.", en: "Everything cancels. $1$ is left." }
        : step === 0
          ? { nl: `$${top.length}$ keer $${base}$ boven, $${bottom.length}$ keer onder.`, en: `$${base}$ $${top.length}$ times on top, $${bottom.length}$ times below.` }
          : { nl: `Een $${base}$ boven en een $${base}$ onder: samen $1$. Streep weg.`, en: `One $${base}$ on top and one $${base}$ below: together $1$. Cross them out.` },
    };
  }
  const { group, times } = p;
  const L = group.length;
  const GAP = 14;
  let tiles: Tile[];
  if (step <= 1) {
    const copies = step === 0 ? 1 : times;
    tiles = [];
    for (let c = 0; c < times; c++)
      group.forEach((t, i) => tiles.push({ id: `${c}-${i}`, label: t, x: (c < copies ? c : 0) * (L * S + GAP) + i * S, y: 40, gone: c >= copies, hl: c > 0 && step === 1 }));
  } else {
    // Sort: all numbers first, then the letters.
    const all = Array.from({ length: times }, (_, c) => group.map((t, i) => ({ id: `${c}-${i}`, label: t }))).flat();
    const sorted = [...all.filter((t) => !isLetter(t.label)), ...all.filter((t) => isLetter(t.label))];
    tiles = sorted.map((t, k) => ({ ...t, x: k * S + (isLetter(t.label) && sorted.some((u) => !isLetter(u.label)) ? GAP : 0), y: 40 }));
  }
  const inner = powerOf(group);
  const all = Array.from({ length: times }, () => group).flat();
  return {
    tiles,
    max: 2,
    w: times * (L * S + GAP) + S,
    h: 110,
    latex: step === 0 ? `(${inner})^{${times}}` : step === 1 ? Array(times).fill(`(${inner})`).join("\\cdot ") : powerOf(all),
    caption:
      step === 0
        ? { nl: `Het rijtje $${inner}$, tot de macht $${times}$.`, en: `The row $${inner}$, to the power $${times}$.` }
        : step === 1
          ? { nl: `Dat is $${times}$ keer het rijtje.`, en: `That is the row $${times}$ times.` }
          : { nl: "Zet gelijke tegels bij elkaar. Tel ze.", en: "Put equal tiles together. Count them." },
  };
}

export function FactorChain({ props }: { props: Record<string, unknown> }) {
  const p = props as Props;
  const { l } = useLoc();
  const max = layout(p, 0).max;
  const s = useSteps(max, 1300);
  const { tiles, caption, latex, w, h } = layout(p, s.step);
  const W = Math.max(320, w + 20);
  const fracLine = p.mode === "quotient";

  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${h}`} className="mx-auto w-full max-w-2xl select-none" role="img" aria-label={l({ nl: "Tegels voor een macht", en: "Tiles for a power" })}>
        {fracLine && <line x1={10} y1={74} x2={W - 10} y2={74} stroke="var(--fg)" strokeWidth={2} />}
        {tiles.map((t) => (
          <g
            key={t.id}
            className="motion-reduce:transition-none"
            style={{
              transform: `translate(${20 + t.x}px, ${t.y}px)`,
              opacity: t.gone ? 0 : 1,
              transition: "transform 500ms ease-out, opacity 400ms",
            }}
          >
            <rect width={S - 6} height={44} rx={8} fill="var(--bg)" stroke={t.hl ? "var(--c-hl)" : "var(--border-strong)"} strokeWidth={t.hl ? 2.5 : 1.5} />
            <text
              x={(S - 6) / 2}
              y={29}
              textAnchor="middle"
              fontSize={20}
              fontStyle={isLetter(t.label) ? "italic" : undefined}
              fill={isLetter(t.label) ? "var(--c-var)" : "var(--c-num)"}
            >
              {show(t.label)}
            </text>
            {p.mode === "quotient" && t.hl && <line x1={2} y1={42} x2={S - 8} y2={2} stroke="var(--c-hl)" strokeWidth={3} />}
          </g>
        ))}
      </svg>
      <div className="min-h-16 space-y-1 text-center" aria-live="polite">
        <p className="text-xl">
          <Tex latex={latex} />
        </p>
        <p>
          <Rich text={l(caption)} />
        </p>
      </div>
      <StepButtons s={s} />
    </div>
  );
}
