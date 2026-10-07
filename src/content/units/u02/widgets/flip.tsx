"use client";
/**
 * Why the sign flips. Two numbers sit on a number line with `<` between
 * them. Do the same thing to both: add, multiply by 2, or multiply by a
 * negative number. With a negative number they jump across zero and swap
 * places, so `<` has to become `>`.
 */
import { useState } from "react";
import type { Loc } from "@/i18n/locale";
import { Btn, numText, Tex, TextWithTex, useLoc } from "./kit";

type Props = { p: number; q: number };
type Op = { label: string; f: (v: number) => number; neg: boolean; text: Loc };

const MIN = -12;
const MAX = 12;
const W = 720;
const PAD = 30;
const Y = 100;

const OPS: Op[] = [
  { label: "+3", f: (v) => v + 3, neg: false, text: { nl: "Plus $3$: allebei schuiven naar rechts. Het teken blijft.", en: "Add $3$: both move right. The sign stays." } },
  { label: "−3", f: (v) => v - 3, neg: false, text: { nl: "Min $3$: allebei schuiven naar links. Het teken blijft.", en: "Subtract $3$: both move left. The sign stays." } },
  { label: "×2", f: (v) => v * 2, neg: false, text: { nl: "Keer $2$: alles wordt groter, de volgorde blijft. Het teken blijft.", en: "Times $2$: everything grows, the order stays. The sign stays." } },
  {
    label: "×(−1)",
    f: (v) => -v,
    neg: true,
    text: { nl: "Keer $-1$: ze springen over de $0$ en wisselen van plek. Het teken klapt om!", en: "Times $-1$: they jump over $0$ and swap places. The sign flips!" },
  },
  {
    label: "×(−2)",
    f: (v) => -2 * v,
    neg: true,
    text: { nl: "Keer $-2$: weer wisselen ze van plek. Het teken klapt om!", en: "Times $-2$: again they swap places. The sign flips!" },
  },
];

export function Flip({ props }: { props: Record<string, unknown> }) {
  const { p: p0, q: q0 } = props as Props;
  const { l, locale } = useLoc();
  const [p, setP] = useState(p0);
  const [q, setQ] = useState(q0);
  const [last, setLast] = useState<Op | null>(null);
  const [history, setHistory] = useState<string[]>([]);

  const sx = (v: number) => PAD + ((v - MIN) / (MAX - MIN)) * (W - 2 * PAD);
  const rel = (a: number, b: number) => `${a}${a < b ? "<" : a > b ? ">" : "="}${b}`;
  const flipped = last?.neg ?? false;

  const apply = (op: Op) => {
    setHistory((h) => [...h, rel(p, q)]);
    setP(op.f(p));
    setQ(op.f(q));
    setLast(op);
  };
  const reset = () => {
    setP(p0);
    setQ(q0);
    setLast(null);
    setHistory([]);
  };
  const fits = (op: Op) => [op.f(p), op.f(q)].every((v) => v >= MIN && v <= MAX);

  const ticks = Array.from({ length: MAX - MIN + 1 }, (_, i) => MIN + i);
  const point = (v: number, name: "A" | "B") => (
    <g style={{ transform: `translateX(${sx(v)}px)` }} className="transition-transform duration-700 ease-in-out motion-reduce:transition-none">
      <circle cy={Y} r={10} fill={name === "A" ? "var(--c-num)" : "transparent"} stroke="var(--c-num)" strokeWidth={3} />
      <text y={Y - 22} textAnchor="middle" fontSize={17} fontWeight={700} fill="var(--c-num)">
        {numText(v, locale)}
      </text>
    </g>
  );

  return (
    <div className="space-y-3">
      <div className="space-y-1 text-center text-muted">
        {history.slice(-2).map((h, i) => (
          <div key={i}>
            <Tex latex={h} />
          </div>
        ))}
      </div>
      <div className="text-center text-3xl" aria-live="polite">
        <Tex latex={flipped ? rel(p, q).replace(/[<>]/, (m) => `\\hl{${m}}`) : rel(p, q)} />
      </div>
      <svg viewBox={`0 0 ${W} 150`} className="w-full select-none" role="img" aria-label={l({ nl: "Twee getallen op een getallenlijn", en: "Two numbers on a number line" })}>
        <line x1={PAD - 10} y1={Y} x2={W - PAD + 10} y2={Y} stroke="var(--fg)" strokeWidth={2} />
        {ticks.map((v) => (
          <g key={v}>
            <line x1={sx(v)} y1={Y - 6} x2={sx(v)} y2={Y + 6} stroke="var(--fg)" strokeWidth={v === 0 ? 3 : 1} />
            {v % 2 === 0 && (
              <text x={sx(v)} y={Y + 28} textAnchor="middle" fontSize={13} fill="var(--muted)">
                {numText(v, locale)}
              </text>
            )}
          </g>
        ))}
        {point(p, "A")}
        {point(q, "B")}
      </svg>
      <p className="min-h-7 text-center" aria-live="polite">
        {last ? (
          <TextWithTex text={l(last.text)} />
        ) : (
          <span className="text-muted">{l({ nl: "Doe iets met allebei de getallen. Kijk naar het teken.", en: "Do something to both numbers. Watch the sign." })}</span>
        )}
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {OPS.map((op) => (
          <Btn key={op.label} onClick={() => apply(op)} disabled={!fits(op)}>
            {op.label}
          </Btn>
        ))}
        <Btn quiet onClick={reset}>
          {l({ nl: "↺ Opnieuw", en: "↺ Start over" })}
        </Btn>
      </div>
    </div>
  );
}
