"use client";
/**
 * Algebra tiles for x² + bx + c: one big square x², b strips x and c small
 * blocks. The learner splits the strips over the right side and the bottom
 * of the square. The empty corner then needs p · q small blocks. When that
 * is exactly c, the tiles form a closed rectangle (x + p) by (x + q):
 * that is the product-sum method in shapes.
 *
 * Negative tiles are drawn with a dashed outline (shape, not colour).
 */
import { useState } from "react";
import { Btn, MOTION, Tex, UI, useLoc, usePlayer } from "./kit";

const X = 150; // drawn length of x
const U = 17; // drawn length of 1
const MAXN = 13; // most strips on one side
const OX = 36;
const OY = 30;

/** `x+3`, `x-2` or `x`. */
const side = (n: number) => (n === 0 ? "x" : n > 0 ? `x+${n}` : `x${n}`);

export function Tiles({ props }: { props: Record<string, unknown> }) {
  const b = Number(props.b ?? 0);
  const c = Number(props.c ?? 0);
  const { l } = useLoc();
  const lo = Math.max(-MAXN, b - MAXN);
  const hi = Math.min(MAXN, b + MAXN);
  const start = Math.min(hi, Math.max(lo, 0));
  const [p, setP] = useState(start);
  const q = b - p;
  const corner = p * q;
  const fits = corner === c;
  const { play, stop, playing } = usePlayer(650);

  // Pairs that work, nearest to the current split first.
  const answers: number[] = [];
  for (let v = lo; v <= hi; v++) if (v * (b - v) === c) answers.push(v);

  const show = () => {
    if (answers.length === 0) return;
    const target = answers.reduce((best, v) => (Math.abs(v - p) < Math.abs(best - p) ? v : best), answers[0]);
    let cur = p;
    play(() => {
      if (cur === target) return false;
      cur += cur < target ? 1 : -1;
      setP(cur);
      return cur !== target;
    });
  };

  const W = OX + X + MAXN * U + 24;
  const H = OY + X + MAXN * U + 16;
  const ap = Math.abs(p);
  const aq = Math.abs(q);

  /** One tile: filled when positive, dashed outline when negative. */
  const tile = (key: string, x: number, y: number, w: number, h: number, kind: "var" | "num", positive: boolean, label?: string) => (
    <g key={key} className={MOTION} style={{ transform: `translate(${x}px, ${y}px)` }}>
      <rect
        width={w - 2}
        height={h - 2}
        rx={2}
        fill={kind === "var" ? "var(--c-var)" : "var(--c-num)"}
        fillOpacity={positive ? 0.32 : 0}
        stroke={fits && kind === "num" ? "var(--c-hl)" : "var(--fg)"}
        strokeWidth={1.3}
        strokeDasharray={positive ? undefined : "4 3"}
      />
      {label && (
        <text x={(w - 2) / 2} y={(h - 2) / 2 + 5} textAnchor="middle" fontSize={13} fontStyle="italic" fill="var(--fg)">
          {label}
        </text>
      )}
    </g>
  );

  return (
    <div className="space-y-4">
      <div className="text-center text-2xl">
        <Tex latex={`x^{2}${b === 0 ? "" : b > 0 ? `+${b === 1 ? "" : b}x` : `${b === -1 ? "-" : b}x`}${c === 0 ? "" : c > 0 ? `+${c}` : c}`} />
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-md select-none" role="img" aria-label={l({ nl: "Algebra-tegels", en: "Algebra tiles" })}>
        {/* Outline of the rectangle (x + p) by (x + q). */}
        <rect x={OX - 3} y={OY - 3} width={X + ap * U + 4} height={X + aq * U + 4} fill="none" stroke={fits ? "var(--c-hl)" : "var(--border-strong)"} strokeWidth={fits ? 3 : 1.5} className={MOTION} />
        {tile("sq", OX, OY, X, X, "var", true, "x²")}
        {Array.from({ length: ap }, (_, i) => tile(`r${i}`, OX + X + i * U, OY, U, X, "var", p > 0, "x"))}
        {Array.from({ length: aq }, (_, j) => tile(`b${j}`, OX, OY + X + j * U, X, U, "var", q > 0))}
        {Array.from({ length: ap * aq }, (_, k) => tile(`c${k}`, OX + X + (k % ap) * U, OY + X + Math.floor(k / ap) * U, U, U, "num", corner > 0))}
        {/* Side labels. */}
        <text x={OX + X / 2} y={OY - 10} textAnchor="middle" fontSize={15} fontStyle="italic" fill="var(--c-var)">
          x
        </text>
        {p !== 0 && (
          <text x={OX + X + (ap * U) / 2} y={OY - 10} textAnchor="middle" fontSize={15} fill="var(--c-num)">
            {p > 0 ? `+${p}` : `−${ap}`}
          </text>
        )}
        <text x={OX - 12} y={OY + X / 2 + 5} textAnchor="middle" fontSize={15} fontStyle="italic" fill="var(--c-var)">
          x
        </text>
        {q !== 0 && (
          <text x={OX - 16} y={OY + X + (aq * U) / 2 + 5} textAnchor="middle" fontSize={15} fill="var(--c-num)">
            {q > 0 ? `+${q}` : `−${aq}`}
          </text>
        )}
      </svg>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <Btn onClick={() => { stop(); setP((v) => Math.max(lo, v - 1)); }} disabled={p <= lo || playing} label={l({ nl: "Strook naar onder", en: "Strip to the bottom" })}>
          ↙ {l({ nl: "strook naar onder", en: "strip down" })}
        </Btn>
        <Btn onClick={() => { stop(); setP((v) => Math.min(hi, v + 1)); }} disabled={p >= hi || playing} label={l({ nl: "Strook naar rechts", en: "Strip to the right" })}>
          {l({ nl: "strook naar rechts", en: "strip right" })} ↗
        </Btn>
      </div>

      <div className="min-h-20 space-y-1 text-center" aria-live="polite">
        <p>
          <Tex latex={`\\text{${l({ nl: "rechts", en: "right" })}: }${p}\\quad\\text{${l({ nl: "onder", en: "bottom" })}: }${q}\\quad\\text{${l({ nl: "samen", en: "together" })}: }${b}`} />
        </p>
        <p>
          <Tex latex={`\\text{${l({ nl: "hoek", en: "corner" })}: }${p}\\cdot ${q < 0 ? `(${q})` : q}=${corner}\\qquad\\text{${l({ nl: "nodig", en: "needed" })}: }${c}`} />
        </p>
        {fits ? (
          <p className="text-xl">
            <Tex latex={`\\hl{(${side(p)})(${side(q)})}`} /> {l({ nl: "Past precies!", en: "Fits exactly!" })}
          </p>
        ) : (
          <p className="text-sm text-muted">
            {corner < c
              ? l({ nl: "De hoek is te klein. Verschuif een strook.", en: "The corner is too small. Move a strip." })
              : l({ nl: "De hoek is te groot. Verschuif een strook.", en: "The corner is too big. Move a strip." })}
          </p>
        )}
      </div>
      <div className="flex justify-center gap-2">
        <Btn onClick={show} disabled={playing || fits || answers.length === 0}>
          {l(UI.play)}
        </Btn>
        <Btn quiet onClick={() => { stop(); setP(start); }}>
          {l(UI.reset)}
        </Btn>
      </div>
    </div>
  );
}
