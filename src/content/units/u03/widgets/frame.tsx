"use client";
/**
 * A coordinate plane for the unit 3 widgets. In normal windows one unit is
 * the same length on both axes, so a line with slope 1 really goes up at 45
 * degrees and a staircase step looks like a real step. Very tall windows
 * (word problems with prices) get their own scale on the y-axis.
 *
 * Unlike the shared plane widget it never prints the formula of a line, so
 * it can be used in exercises where the formula is the answer.
 */
import { useId, type ReactNode } from "react";
import { gridStep, numLabel, type Range } from "./model";
import { useLoc } from "./kit";

export type Frame = {
  x: Range;
  y: Range;
  W: number;
  H: number;
  /** Pixels per unit on each axis. */
  ux: number;
  uy: number;
  sx: (v: number) => number;
  sy: (v: number) => number;
};

const SIZE = 480;

/** Screen size and coordinate maps for a window. */
export function makeFrame(x: Range, y: Range): Frame {
  const spanX = x[1] - x[0];
  const spanY = y[1] - y[0];
  const fit = (span: number) => Math.min(44, SIZE / span);
  let ux = fit(spanX);
  let uy = fit(spanY);
  // Same scale on both axes unless one axis is much longer.
  if (Math.max(spanX, spanY) <= 3 * Math.min(spanX, spanY)) ux = uy = Math.min(ux, uy);
  else uy = Math.min(uy, SIZE / spanY);
  const W = spanX * ux;
  const H = spanY * uy;
  return { x, y, W, H, ux, uy, sx: (v) => (v - x[0]) * ux, sy: (v) => H - (v - y[0]) * uy };
}

/** Grid, axes with numbers, and a clipped drawing area for the children. */
export function PlaneFrame({ f, label, children, overlay }: { f: Frame; label: string; children: ReactNode; overlay?: ReactNode }) {
  const { locale } = useLoc();
  const clip = `u3c${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const stepX = gridStep(f.x[1] - f.x[0]);
  const stepY = gridStep(f.y[1] - f.y[0]);
  const xs: number[] = [];
  for (let v = Math.ceil(f.x[0] / stepX) * stepX; v <= f.x[1]; v += stepX) xs.push(v);
  const ys: number[] = [];
  for (let v = Math.ceil(f.y[0] / stepY) * stepY; v <= f.y[1]; v += stepY) ys.push(v);
  // Fewer labels when the grid lines are close together.
  const labelEvery = (step: number, u: number) => (step * u >= 22 ? 1 : 2);
  const lx = labelEvery(stepX, f.ux);
  const ly = labelEvery(stepY, f.uy);
  const showX = (v: number) => v !== 0 && Math.round(v / stepX) % lx === 0 && v > f.x[0] && v < f.x[1];
  const showY = (v: number) => v !== 0 && Math.round(v / stepY) % ly === 0 && v > f.y[0] && v < f.y[1];
  const axisY = Math.min(f.H - 6, Math.max(16, f.sy(0) + 17));
  const axisX = Math.min(f.W - 26, Math.max(4, f.sx(0) + 6));
  const PAD = 4;

  return (
    <svg
      viewBox={`${-PAD} ${-PAD} ${f.W + 2 * PAD} ${f.H + 2 * PAD}`}
      className="mx-auto block max-h-[28rem] w-full max-w-xl touch-none select-none rounded-lg border border-border bg-surface"
      role="img"
      aria-label={label}
    >
      <defs>
        <clipPath id={clip}>
          <rect x={0} y={0} width={f.W} height={f.H} />
        </clipPath>
      </defs>
      {xs.map((v) => (
        <line key={`gx${v}`} x1={f.sx(v)} y1={0} x2={f.sx(v)} y2={f.H} stroke="var(--border)" />
      ))}
      {ys.map((v) => (
        <line key={`gy${v}`} x1={0} y1={f.sy(v)} x2={f.W} y2={f.sy(v)} stroke="var(--border)" />
      ))}
      {f.y[0] <= 0 && f.y[1] >= 0 && <line x1={0} y1={f.sy(0)} x2={f.W} y2={f.sy(0)} stroke="var(--fg)" strokeWidth={1.6} />}
      {f.x[0] <= 0 && f.x[1] >= 0 && <line x1={f.sx(0)} y1={0} x2={f.sx(0)} y2={f.H} stroke="var(--fg)" strokeWidth={1.6} />}
      {xs.filter(showX).map((v) => (
        <text key={`lx${v}`} x={f.sx(v)} y={axisY} textAnchor="middle" fontSize={12} fill="var(--muted)">
          {numLabel(v, locale)}
        </text>
      ))}
      {ys.filter(showY).map((v) => (
        <text key={`ly${v}`} x={axisX} y={f.sy(v) + 4} fontSize={12} fill="var(--muted)">
          {numLabel(v, locale)}
        </text>
      ))}
      <text x={f.W - 12} y={Math.min(f.H - 6, Math.max(14, f.sy(0) - 6))} fontSize={15} fontStyle="italic" fill="var(--c-var)">
        x
      </text>
      <text x={Math.min(f.W - 14, Math.max(4, f.sx(0) + 6))} y={14} fontSize={15} fontStyle="italic" fill="var(--c-var)">
        y
      </text>
      <g clipPath={`url(#${clip})`}>{children}</g>
      {overlay}
    </svg>
  );
}

/**
 * The line `y = ax + b`, drawn as one long line through (0, b) that is
 * turned and shifted with a CSS transform, so changing a or b animates.
 */
export function AnimLine({ f, a, b, dashed = false, muted = false, width = 3 }: { f: Frame; a: number; b: number; dashed?: boolean; muted?: boolean; width?: number }) {
  const deg = (-Math.atan((a * f.uy) / f.ux) * 180) / Math.PI;
  const len = 3 * (f.W + f.H);
  return (
    <g
      className="transition-transform duration-500 ease-out motion-reduce:transition-none"
      style={{ transform: `translate(${f.sx(0)}px, ${f.sy(b)}px) rotate(${deg}deg)` }}
    >
      <line
        x1={-len}
        y1={0}
        x2={len}
        y2={0}
        stroke={muted ? "var(--muted)" : "var(--fg)"}
        strokeWidth={width}
        strokeDasharray={dashed ? "8 6" : undefined}
        strokeLinecap="round"
      />
    </g>
  );
}

/** A point, optionally highlighted, with a label. */
export function Dot({ f, x, y, label, hl = false, r = 6 }: { f: Frame; x: number; y: number; label?: string; hl?: boolean; r?: number }) {
  const right = f.sx(x) < f.W - 70;
  return (
    <g>
      <circle
        cx={0}
        cy={0}
        r={r}
        fill={hl ? "var(--c-hl)" : "var(--fg)"}
        className="transition-transform duration-500 ease-out motion-reduce:transition-none"
        style={{ transform: `translate(${f.sx(x)}px, ${f.sy(y)}px)` }}
      />
      {label && (
        <text x={f.sx(x) + (right ? 10 : -10)} y={Math.max(14, f.sy(y) - 10)} textAnchor={right ? "start" : "end"} fontSize={14} fill={hl ? "var(--c-hl)" : "var(--fg)"}>
          {label}
        </text>
      )}
    </g>
  );
}

/** A point as text for a picture: `(2, −3)`. */
export function ptLabel(x: number, y: number, locale: "nl" | "en"): string {
  return `(${numLabel(x, locale)}, ${numLabel(y, locale)})`;
}
