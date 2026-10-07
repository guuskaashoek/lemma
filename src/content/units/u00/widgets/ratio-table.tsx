"use client";
/**
 * Ratio table (verhoudingstabel). Columns appear one by one; an arrow over
 * the top row and the same arrow under the bottom row show that both rows
 * always get the same operation. Just like the balance: what you do on top,
 * you do below.
 */
import Fraction from "fraction.js";
import type { Loc } from "@/i18n/locale";
import { Btn, numText, UI, useLoc, useSteps } from "./kit";

type Props = { top: Loc; bottom: Loc; a: number; b: number; c: number; via?: number; money?: boolean };

/** "× 3" or ": 4" for the step from x to y (whole factors only). */
function opLabel(x: number, y: number): string {
  if (y >= x) return `× ${numText(new Fraction(y).div(x).valueOf(), "en")}`;
  return `: ${numText(new Fraction(x).div(y).valueOf(), "en")}`;
}

export function RatioTable({ props }: { props: Record<string, unknown> }) {
  const { top, bottom, a, b, c, via, money } = props as Props;
  const { l, locale } = useLoc();
  const tops = via === undefined ? [a, c] : [a, via, c];
  const bottoms = tops.map((t) => new Fraction(b).mul(t).div(a).valueOf());
  const { step, next, reset, play, playing, done } = useSteps(tops.length - 1, 1200);
  const fmt = (v: number, isMoney: boolean) => (isMoney ? v.toFixed(2).replace(".", locale === "nl" ? "," : ".") : numText(v, locale));

  const LABEL_W = 150;
  const COL = 120;
  const W = LABEL_W + tops.length * COL + 20;
  const rowY = [70, 150];
  const colX = (i: number) => LABEL_W + i * COL + COL / 2;

  const arrow = (i: number, row: 0 | 1) => {
    const x1 = colX(i - 1) + 18;
    const x2 = colX(i) - 18;
    const y = row === 0 ? rowY[0] - 30 : rowY[1] + 22;
    const bend = row === 0 ? -24 : 24;
    const shown = step >= i;
    return (
      <g key={`a${i}${row}`} style={{ opacity: shown ? 1 : 0, transition: "opacity 400ms" }}>
        <path d={`M ${x1} ${y} Q ${(x1 + x2) / 2} ${y + bend} ${x2} ${y}`} fill="none" stroke="var(--c-hl)" strokeWidth={2.5} />
        <path d={`M ${x2} ${y} l -9 ${row === 0 ? -3 : 3} l 3 ${row === 0 ? 8 : -8} z`} fill="var(--c-hl)" />
        <text x={(x1 + x2) / 2} y={y + bend + (row === 0 ? -6 : 18)} textAnchor="middle" fontSize={16} fill="var(--c-hl)">
          {opLabel(tops[i - 1], tops[i])}
        </text>
      </g>
    );
  };

  return (
    <div className="space-y-4">
      <svg viewBox={`0 0 ${W} 210`} className="mx-auto w-full max-w-2xl select-none" role="img" aria-label={l({ nl: "Verhoudingstabel", en: "Ratio table" })}>
        {[0, 1].map((r) => (
          <g key={r}>
            <rect x={10} y={rowY[r] - 26} width={W - 20} height={44} rx={6} fill={r === 0 ? "var(--surface-2)" : "transparent"} stroke="var(--border-strong)" />
            <text x={20} y={rowY[r] + 2} fontSize={15} fill="var(--fg)">
              {l(r === 0 ? top : bottom)}
            </text>
          </g>
        ))}
        {tops.map((t, i) => (
          <g key={i} style={{ opacity: i === 0 || step >= i ? 1 : 0.35, transition: "opacity 400ms" }}>
            <line x1={colX(i) - COL / 2} y1={rowY[0] - 26} x2={colX(i) - COL / 2} y2={rowY[1] + 18} stroke="var(--border-strong)" />
            <text x={colX(i)} y={rowY[0] + 4} textAnchor="middle" fontSize={20} fill="var(--c-num)">
              {numText(t, locale)}
            </text>
            <text x={colX(i)} y={rowY[1] + 4} textAnchor="middle" fontSize={20} fill={i > 0 && step >= i && i === tops.length - 1 ? "var(--c-hl)" : "var(--c-num)"}>
              {i === 0 || step >= i ? fmt(bottoms[i], !!money) : "?"}
            </text>
          </g>
        ))}
        {tops.slice(1).map((_, k) => [arrow(k + 1, 0), arrow(k + 1, 1)])}
      </svg>
      <p className="text-center text-sm text-muted" aria-live="polite">
        {l({ nl: "Wat je boven doet, doe je onder ook.", en: "Whatever you do on top, you also do below." })}
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <Btn onClick={next} disabled={done || playing}>
          {l(UI.next)}
        </Btn>
        <Btn onClick={play} disabled={playing}>
          {l(UI.play)}
        </Btn>
        <Btn quiet onClick={reset}>
          {l(UI.reset)}
        </Btn>
      </div>
    </div>
  );
}
