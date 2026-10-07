"use client";
/**
 * Number line with animated jumps: -3 + 5 is "start at -3, jump 5 to the
 * right". Jumps play one at a time; the learner steps through them.
 */
import { useState } from "react";
import { useT } from "@/i18n/client";
import { localizeDecimals } from "@/components/math";

export function NumberLineWidget({
  min,
  max,
  start,
  jumps = [],
  denominator,
  marks = [],
}: {
  min: number;
  max: number;
  start?: number;
  jumps?: number[];
  denominator?: number;
  marks?: Array<{ value: number; label?: string }>;
}) {
  const { t, locale } = useT();
  const [shown, setShown] = useState(0);
  const W = 720;
  const PAD = 40;
  const sx = (v: number) => PAD + ((v - min) / (max - min)) * (W - 2 * PAD);
  const Y = 110;

  const positions = [start ?? 0];
  for (const j of jumps) positions.push(positions[positions.length - 1] + j);
  const current = positions[Math.min(shown, jumps.length)];

  const ticks: number[] = [];
  for (let v = Math.ceil(min); v <= max; v++) ticks.push(v);
  const fine: number[] = [];
  if (denominator && denominator > 1) {
    for (let v = min; v <= max + 1e-9; v += 1 / denominator) fine.push(v);
  }
  const fmt = (v: number) => localizeDecimals(String(Math.round(v * 1000) / 1000), locale).replace("{,}", ",");

  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} 170`} className="w-full select-none" role="img" aria-label={t("numberLineAria")}>
        <line x1={PAD - 20} y1={Y} x2={W - PAD + 20} y2={Y} stroke="var(--fg)" strokeWidth={2} />
        <path d={`M ${W - PAD + 20} ${Y} l -10 -6 v 12 z`} fill="var(--fg)" />
        {fine.map((v, i) => (
          <line key={`f${i}`} x1={sx(v)} y1={Y - 5} x2={sx(v)} y2={Y + 5} stroke="var(--border-strong)" />
        ))}
        {ticks.map((v) => (
          <g key={v}>
            <line x1={sx(v)} y1={Y - 9} x2={sx(v)} y2={Y + 9} stroke="var(--fg)" strokeWidth={v === 0 ? 2.5 : 1.5} />
            <text x={sx(v)} y={Y + 30} textAnchor="middle" fontSize={15} fill="var(--c-num)">
              {v < 0 ? `−${-v}` : v}
            </text>
          </g>
        ))}
        {marks.map((m, i) => (
          <g key={`m${i}`}>
            <circle cx={sx(m.value)} cy={Y} r={6} fill="var(--fg)" />
            {m.label && (
              <text x={sx(m.value)} y={Y + 52} textAnchor="middle" fontSize={14} fill="var(--fg)">
                {m.label}
              </text>
            )}
          </g>
        ))}
        {/* Jumps shown so far, as arcs above the line. */}
        {jumps.slice(0, shown).map((j, i) => {
          const x1 = sx(positions[i]);
          const x2 = sx(positions[i + 1]);
          const h = Math.min(70, 18 + Math.abs(x2 - x1) / 3);
          return (
            <g key={`j${i}`} className="animate-in">
              <path
                d={`M ${x1} ${Y - 10} Q ${(x1 + x2) / 2} ${Y - 10 - h * 2} ${x2} ${Y - 10}`}
                fill="none"
                stroke={i === shown - 1 ? "var(--c-hl)" : "var(--muted)"}
                strokeWidth={2.5}
              />
              <text x={(x1 + x2) / 2} y={Y - 16 - h} textAnchor="middle" fontSize={15} fill={i === shown - 1 ? "var(--c-hl)" : "var(--muted)"}>
                {j > 0 ? `+${fmt(j)}` : `−${fmt(-j)}`}
              </text>
            </g>
          );
        })}
        {start !== undefined && (
          <circle
            cx={sx(current)}
            cy={Y}
            r={9}
            fill="var(--c-hl)"
            style={{ transition: "cx 500ms cubic-bezier(.3,.7,.2,1)" }}
          />
        )}
      </svg>
      {jumps.length > 0 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setShown((n) => Math.min(jumps.length, n + 1))}
            disabled={shown >= jumps.length}
            className="rounded-lg border border-border-strong px-3 py-2 text-sm hover:border-fg disabled:opacity-40"
          >
            {t("nextJump")}
          </button>
          <button onClick={() => setShown(0)} className="rounded-lg px-3 py-2 text-sm text-muted hover:text-fg">
            ↺ {t("startOver")}
          </button>
        </div>
      )}
      {start !== undefined && (
        <p className="text-center" aria-live="polite">
          {t("youAreAt")} <strong className="text-hl">{fmt(current)}</strong>
        </p>
      )}
    </div>
  );
}
