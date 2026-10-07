"use client";
/**
 * Powers as a staircase. Step up: times the base. Step down: divided by
 * the base. Go down far enough and you pass base^0 = 1 and reach the
 * negative exponents: base^−n = 1/base^n.
 *
 * Left: the power as dots (a row, a square, squares of squares, ...) or,
 * below zero, one piece of a bar cut into base^n parts. Right: the stairs.
 */
import { useState } from "react";
import { Btn, Tex, useLoc } from "./kit";
import { powerDots, powerValue } from "./power-model";

type Props = { base: number; n: number; min?: number; max?: number };

const MAX_DOTS = 256;

function formula(base: number, n: number): string {
  const [num, den] = powerValue(base, n);
  if (n >= 2) {
    const factors = n <= 6 ? Array(n).fill(String(base)).join("\\cdot ") : `${base}\\cdot ${base}\\cdot\\ldots\\cdot ${base}`;
    return `${base}^{${n}}=${factors}=${num}`;
  }
  if (n >= 0) return `${base}^{${n}}=${num}`;
  return `${base}^{${n}}=\\frac{1}{${base}^{${-n}}}=\\frac{1}{${den}}`;
}

export function PowerSteps({ props }: { props: Record<string, unknown> }) {
  const { base, n: start, min = 0, max = Math.max(start, 3) } = props as Props;
  const { l } = useLoc();
  const [n, setN] = useState(start);

  const W = 600;
  const H = 260;
  const BOX = { x: 10, y: 10, w: 330, h: 240 };
  const [num, den] = powerValue(base, n);

  let picture;
  if (n >= 0 && num <= MAX_DOTS) {
    const lay = powerDots(base, n);
    const s = Math.min(BOX.w / (lay.w + 1), BOX.h / (lay.h + 1), 40);
    const ox = BOX.x + (BOX.w - lay.w * s) / 2 + s / 2;
    const oy = BOX.y + (BOX.h - lay.h * s) / 2 + s / 2;
    picture = lay.points.map(([x, y], i) => (
      <circle
        key={i}
        r={Math.max(2.5, s * 0.36)}
        cx={0}
        cy={0}
        fill="var(--c-num)"
        className="motion-reduce:transition-none motion-reduce:[animation:none]"
        style={{ transform: `translate(${ox + x * s}px, ${oy + y * s}px)`, transition: "transform 500ms ease-out", animation: "u1-fade 500ms ease-out" }}
      />
    ));
  } else if (n >= 0) {
    picture = (
      <text x={BOX.x + BOX.w / 2} y={BOX.y + BOX.h / 2} textAnchor="middle" fontSize={34} fill="var(--c-num)">
        {num}
      </text>
    );
  } else {
    // One piece of a bar cut into `den` equal parts.
    const bw = BOX.w - 20;
    const parts = Math.min(den, 64);
    picture = (
      <g>
        <rect x={BOX.x + 10} y={100} width={bw} height={50} fill="none" stroke="var(--fg)" />
        <rect
          x={BOX.x + 10}
          y={100}
          width={bw / den}
          height={50}
          fill="var(--c-hl)"
          fillOpacity={0.6}
          className="motion-reduce:transition-none"
          style={{ transition: "width 500ms ease-out" }}
        />
        {den <= 64 &&
          Array.from({ length: parts - 1 }, (_, i) => (
            <line key={i} x1={BOX.x + 10 + ((i + 1) * bw) / parts} y1={100} x2={BOX.x + 10 + ((i + 1) * bw) / parts} y2={150} stroke="var(--border-strong)" />
          ))}
        <text x={BOX.x + 10} y={85} fontSize={15} fill="var(--fg)">
          {l({ nl: `1 heel, in ${den} stukken`, en: `1 whole, in ${den} pieces` })}
        </text>
      </g>
    );
  }

  // The stairs: one row per exponent, highest at the top.
  const rows = Array.from({ length: max - min + 1 }, (_, i) => max - i);
  const rowH = Math.min(34, (H - 20) / rows.length);
  const stairs = rows.map((k, i) => {
    const [a, b] = powerValue(base, k);
    const y = 14 + i * rowH;
    const active = k === n;
    return (
      <g key={k}>
        <rect x={360} y={y} width={220} height={rowH - 4} rx={6} fill={active ? "var(--c-hl)" : "none"} fillOpacity={0.18} stroke={active ? "var(--c-hl)" : "var(--border)"} />
        <text x={372} y={y + rowH / 2 + 3} fontSize={15} fill="var(--fg)">
          {`${base}`}
          <tspan dy={-7} fontSize={11}>
            {k < 0 ? `−${-k}` : k}
          </tspan>
          <tspan dy={7}>{` = ${b === 1 ? a : `1/${b}`}`}</tspan>
        </text>
        {i > 0 && (
          <text x={572} y={y + 2} fontSize={11} textAnchor="end" fill="var(--muted)">
            {`÷${base}`}
          </text>
        )}
      </g>
    );
  });

  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-2xl select-none" role="img" aria-label={l({ nl: "Machtentrap", en: "Power stairs" })}>
        {picture}
        {stairs}
        <style>{`@keyframes u1-fade { from { opacity: 0; } to { opacity: 1; } }`}</style>
      </svg>
      <div className="min-h-10 text-center text-xl" aria-live="polite">
        <Tex latex={formula(base, n)} />
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <Btn onClick={() => setN((k) => Math.min(max, k + 1))} disabled={n >= max}>
          {l({ nl: `▲ keer ${base}`, en: `▲ times ${base}` })}
        </Btn>
        <Btn onClick={() => setN((k) => Math.max(min, k - 1))} disabled={n <= min}>
          {l({ nl: `▼ gedeeld door ${base}`, en: `▼ divided by ${base}` })}
        </Btn>
        <Btn quiet onClick={() => setN(start)}>
          {l({ nl: "↺ Opnieuw", en: "↺ Start over" })}
        </Btn>
      </div>
    </div>
  );
}
