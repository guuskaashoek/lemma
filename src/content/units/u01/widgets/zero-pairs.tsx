"use client";
/**
 * Plus and minus counters (fiches). Filled = +1, outlined = −1.
 * A plus and a minus in the same column form a zero pair.
 *
 * Two modes:
 * - guided (`a`, `op`, `b`): steps through `a op b` frame by frame;
 * - free (`free: true`): the learner adds and removes counters and pairs.
 */
import { useState } from "react";
import { Btn, Rich, StepButtons, Tex, useLoc, useSteps } from "./kit";
import { chipColumns, chipValue, zeroPairFrames, type Chip } from "./zero-pairs-model";

type Props = { a: number; op?: "+" | "-"; b?: number; free?: boolean };

const R = 15;
const GAP = 36;

function Board({ chips }: { chips: Chip[] }) {
  const { l } = useLoc();
  const cols = chipColumns(chips);
  const n = Math.max(6, ...[...cols.values()].map((c) => c + 1));
  const W = Math.max(360, n * GAP + 40);
  const rowY = (sign: number) => (sign > 0 ? 50 : 120);
  return (
    <svg viewBox={`0 0 ${W} 170`} className="mx-auto w-full max-w-2xl select-none" role="img" aria-label={l({ nl: "Fiches", en: "Counters" })}>
      <rect x={6} y={14} width={W - 12} height={142} rx={14} fill="none" stroke="var(--border-strong)" />
      <text x={16} y={36} fontSize={13} fill="var(--muted)">+</text>
      <text x={16} y={106} fontSize={13} fill="var(--muted)">−</text>
      {chips.map((c) => {
        const x = 40 + (cols.get(c.id) ?? 0) * GAP;
        const y = rowY(c.sign) + (c.mark === "leave" ? -10 : 0);
        const ring = c.mark === "new" || c.mark === "leave" || c.mark === "pair" ? "var(--c-hl)" : "var(--c-num)";
        return (
          <g
            key={c.id}
            className="motion-reduce:transition-none"
            style={{
              transform: `translate(${x}px, ${y}px)`,
              transition: "transform 450ms ease-out, opacity 450ms",
              opacity: c.mark === "leave" ? 0.35 : 1,
            }}
          >
            <g className="motion-reduce:[animation:none]" style={c.mark === "new" ? { animation: "u1-pop 350ms ease-out" } : undefined}>
              <circle
                r={R}
                fill={c.sign > 0 ? "var(--c-num)" : "var(--bg)"}
                stroke={ring}
                strokeWidth={c.mark ? 3 : 2}
                strokeDasharray={c.mark === "leave" ? "4 3" : undefined}
              />
              <text y={6} textAnchor="middle" fontSize={20} fontWeight={700} fill={c.sign > 0 ? "var(--bg)" : "var(--c-num)"}>
                {c.sign > 0 ? "+" : "−"}
              </text>
            </g>
          </g>
        );
      })}
      {/* Zero pairs: a line between the two counters of a pair. */}
      {chips
        .filter((c) => c.mark === "pair" && c.sign > 0)
        .map((c) => {
          const x = 40 + (cols.get(c.id) ?? 0) * GAP;
          return <line key={`p${c.id}`} x1={x} y1={50 + R} x2={x} y2={120 - R} stroke="var(--c-hl)" strokeWidth={3} />;
        })}
      <style>{`@keyframes u1-pop { from { transform: scale(0.2); opacity: 0; } to { transform: none; opacity: 1; } }`}</style>
    </svg>
  );
}

function Guided({ a, op, b }: { a: number; op: "+" | "-"; b: number }) {
  const { l } = useLoc();
  const frames = zeroPairFrames(a, op, b);
  const s = useSteps(frames.length - 1, 1500);
  const f = frames[s.step];
  return (
    <div className="space-y-3">
      <Board chips={f.chips} />
      <div className="min-h-16 space-y-1 text-center" aria-live="polite">
        <div className="text-xl">
          <Tex latex={f.latex} />
        </div>
        <p>
          <Rich text={l(f.caption)} />
        </p>
      </div>
      <StepButtons s={s} />
    </div>
  );
}

function Free({ a }: { a: number }) {
  const { l } = useLoc();
  const start = (): Chip[] => Array.from({ length: Math.abs(a) }, (_, i) => ({ id: i, sign: a < 0 ? -1 : 1 }));
  const [chips, setChips] = useState<Chip[]>(start);
  const [nextId, setNextId] = useState(Math.abs(a));
  const plus = chips.filter((c) => c.sign > 0).length;
  const minus = chips.length - plus;
  const add = (signs: Array<1 | -1>) => {
    if (chips.length + signs.length > 24) return;
    setChips((cs) => [...cs.map(({ id, sign }) => ({ id, sign })), ...signs.map((sign, i) => ({ id: nextId + i, sign, mark: "new" as const }))]);
    setNextId((n) => n + signs.length);
  };
  const remove = (sign: 1 | -1) =>
    setChips((cs) => {
      const idx = cs.map((c) => c.sign).lastIndexOf(sign);
      return idx < 0 ? cs : cs.filter((_, i) => i !== idx).map(({ id, sign: s }) => ({ id, sign: s }));
    });
  const cancel = () =>
    setChips((cs) => {
      const m = Math.min(plus, minus);
      const p = cs.filter((c) => c.sign > 0).slice(0, m).map((c) => c.id);
      const n = cs.filter((c) => c.sign < 0).slice(0, m).map((c) => c.id);
      const gone = new Set([...p, ...n]);
      return cs.filter((c) => !gone.has(c.id)).map(({ id, sign }) => ({ id, sign }));
    });
  const v = chipValue(chips);
  return (
    <div className="space-y-3">
      <Board chips={chips} />
      <p className="text-center text-xl" aria-live="polite">
        <Tex latex={`${plus}-${minus}=${v}`} />
      </p>
      <p className="text-center text-sm text-muted">
        {l({ nl: `${plus} plus en ${minus} min. Samen: ${v < 0 ? "−" + -v : v}.`, en: `${plus} plus and ${minus} minus. Together: ${v < 0 ? "−" + -v : v}.` })}
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <Btn onClick={() => add([1])}>{l({ nl: "+ plus-fiche", en: "+ plus counter" })}</Btn>
        <Btn onClick={() => add([-1])}>{l({ nl: "+ min-fiche", en: "+ minus counter" })}</Btn>
        <Btn onClick={() => add([1, -1])}>{l({ nl: "+ nulpaar", en: "+ zero pair" })}</Btn>
        <Btn onClick={() => remove(1)} disabled={plus === 0}>
          {l({ nl: "− plus-fiche", en: "− plus counter" })}
        </Btn>
        <Btn onClick={() => remove(-1)} disabled={minus === 0}>
          {l({ nl: "− min-fiche", en: "− minus counter" })}
        </Btn>
        <Btn onClick={cancel} disabled={plus === 0 || minus === 0}>
          {l({ nl: "Nulparen weg", en: "Remove zero pairs" })}
        </Btn>
        <Btn
          quiet
          onClick={() => {
            setChips(start());
            setNextId(Math.abs(a));
          }}
        >
          {l({ nl: "↺ Opnieuw", en: "↺ Start over" })}
        </Btn>
      </div>
    </div>
  );
}

export function ZeroPairs({ props }: { props: Record<string, unknown> }) {
  const { a, op = "+", b = 0, free = false } = props as Props;
  return free ? <Free a={a} /> : <Guided a={a} op={op} b={b} />;
}
