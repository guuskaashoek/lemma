"use client";
/**
 * Coordinate plane: graphs drawn from their LaTeX formula, points, a
 * draggable tracer (arrow keys work too) that shows coordinates and slope,
 * a slope triangle and a shaded area under a graph.
 *
 * It is also the "graph tool" for later units: give it any formula in x.
 */
import { useMemo, useRef, useState } from "react";
import { useT } from "@/i18n/client";
import { Formula, localizeDecimals } from "@/components/math";
import { compileFn, samplePath, slopeAt } from "../models/plot";

type Props = {
  x: [number, number];
  y: [number, number];
  graphs?: Array<{ latex: string; label?: string }>;
  points?: Array<{ x: number; y: number; label?: string }>;
  tracer?: { graph: number; start: number; showSlope?: boolean };
  slope?: { graph: number; from: number; to: number };
  area?: { graph: number; from: number; to: number };
};

const W = 640;
const H = 420;

/** A "nice" grid step for a range: 1, 2, 5, 10, ... */
function gridStep(span: number): number {
  const raw = span / 10;
  const p = 10 ** Math.floor(Math.log10(raw));
  return [1, 2, 5, 10].map((m) => m * p).find((s) => s >= raw) ?? p * 10;
}

export function PlaneWidget({ x, y, graphs = [], points = [], tracer, slope, area }: Props) {
  const { t, locale } = useT();
  const svgRef = useRef<SVGSVGElement>(null);
  const fns = useMemo(() => graphs.map((g) => compileFn(g.latex)), [graphs]);
  const [tx, setTx] = useState(tracer?.start ?? 0);
  const [dragging, setDragging] = useState(false);

  const sx = (v: number) => ((v - x[0]) / (x[1] - x[0])) * W;
  const sy = (v: number) => H - ((v - y[0]) / (y[1] - y[0])) * H;
  const fmt = (v: number) => localizeDecimals(String(Math.round(v * 100) / 100), locale).replace("{,}", ",");

  const stepX = gridStep(x[1] - x[0]);
  const stepY = gridStep(y[1] - y[0]);
  const gridXs: number[] = [];
  for (let v = Math.ceil(x[0] / stepX) * stepX; v <= x[1]; v += stepX) gridXs.push(Math.round(v * 1e6) / 1e6);
  const gridYs: number[] = [];
  for (let v = Math.ceil(y[0] / stepY) * stepY; v <= y[1]; v += stepY) gridYs.push(Math.round(v * 1e6) / 1e6);

  const toData = (clientX: number) => {
    const rect = svgRef.current!.getBoundingClientRect();
    const px = ((clientX - rect.left) / rect.width) * W;
    return x[0] + (px / W) * (x[1] - x[0]);
  };

  const tracerFn = tracer ? fns[tracer.graph] : undefined;
  const ty = tracerFn ? tracerFn(tx) : Number.NaN;
  const tSlope = tracerFn ? slopeAt(tracerFn, tx) : Number.NaN;

  const areaPath = (() => {
    if (!area) return null;
    const f = fns[area.graph];
    const pts: string[] = [`M ${sx(area.from)} ${sy(0)}`];
    for (let i = 0; i <= 120; i++) {
      const xv = area.from + ((area.to - area.from) * i) / 120;
      const yv = f(xv);
      if (Number.isFinite(yv)) pts.push(`L ${sx(xv)} ${sy(yv)}`);
    }
    pts.push(`L ${sx(area.to)} ${sy(0)} Z`);
    return pts.join(" ");
  })();

  return (
    <div className="space-y-3">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full touch-none rounded-lg border border-border bg-surface select-none"
        role="img"
        aria-label={t("planeAria")}
        onPointerMove={(e) => dragging && tracer && setTx(Math.max(x[0], Math.min(x[1], toData(e.clientX))))}
        onPointerUp={() => setDragging(false)}
        onPointerLeave={() => setDragging(false)}
      >
        {gridXs.map((v) => (
          <line key={`gx${v}`} x1={sx(v)} y1={0} x2={sx(v)} y2={H} stroke="var(--border)" />
        ))}
        {gridYs.map((v) => (
          <line key={`gy${v}`} x1={0} y1={sy(v)} x2={W} y2={sy(v)} stroke="var(--border)" />
        ))}
        {/* axes */}
        {y[0] <= 0 && y[1] >= 0 && <line x1={0} y1={sy(0)} x2={W} y2={sy(0)} stroke="var(--fg)" strokeWidth={1.5} />}
        {x[0] <= 0 && x[1] >= 0 && <line x1={sx(0)} y1={0} x2={sx(0)} y2={H} stroke="var(--fg)" strokeWidth={1.5} />}
        {gridXs.filter((v) => v !== 0).map((v) => (
          <text key={`lx${v}`} x={sx(v)} y={Math.min(H - 4, Math.max(14, sy(0) + 16))} textAnchor="middle" fontSize={12} fill="var(--muted)">
            {fmt(v)}
          </text>
        ))}
        {gridYs.filter((v) => v !== 0).map((v) => (
          <text key={`ly${v}`} x={Math.min(W - 18, Math.max(4, sx(0) + 6))} y={sy(v) + 4} fontSize={12} fill="var(--muted)">
            {fmt(v)}
          </text>
        ))}

        {areaPath && <path d={areaPath} fill="var(--c-hl)" fillOpacity={0.22} stroke="none" />}

        {fns.map((f, gi) =>
          samplePath(f, x[0], x[1], y[0], y[1]).map((seg, si) => (
            <polyline
              key={`g${gi}-${si}`}
              points={seg.map(([a, b]) => `${sx(a)},${sy(b)}`).join(" ")}
              fill="none"
              stroke={gi === 0 ? "var(--fg)" : "var(--muted)"}
              strokeWidth={2.5}
              strokeDasharray={gi === 0 ? undefined : "6 5"}
            />
          )),
        )}

        {slope &&
          (() => {
            const f = fns[slope.graph];
            const [x1, x2] = [slope.from, slope.to];
            const [y1, y2] = [f(x1), f(x2)];
            return (
              <g>
                <line x1={sx(x1)} y1={sy(y1)} x2={sx(x2)} y2={sy(y1)} stroke="var(--c-num)" strokeWidth={2.5} />
                <line x1={sx(x2)} y1={sy(y1)} x2={sx(x2)} y2={sy(y2)} stroke="var(--c-hl)" strokeWidth={2.5} />
                <text x={(sx(x1) + sx(x2)) / 2} y={sy(y1) + 18} textAnchor="middle" fontSize={14} fill="var(--c-num)">
                  Δx = {fmt(x2 - x1)}
                </text>
                <text x={sx(x2) + 8} y={(sy(y1) + sy(y2)) / 2} fontSize={14} fill="var(--c-hl)">
                  Δy = {fmt(y2 - y1)}
                </text>
              </g>
            );
          })()}

        {points.map((p, i) => (
          <g key={`p${i}`}>
            <circle cx={sx(p.x)} cy={sy(p.y)} r={5.5} fill="var(--fg)" />
            {p.label && (
              <text x={sx(p.x) + 9} y={sy(p.y) - 9} fontSize={14} fill="var(--fg)">
                {p.label}
              </text>
            )}
          </g>
        ))}

        {tracer && Number.isFinite(ty) && (
          <g>
            {tracer.showSlope && Number.isFinite(tSlope) && (
              <line
                x1={sx(tx - (x[1] - x[0]) / 6)}
                y1={sy(ty - tSlope * ((x[1] - x[0]) / 6))}
                x2={sx(tx + (x[1] - x[0]) / 6)}
                y2={sy(ty + tSlope * ((x[1] - x[0]) / 6))}
                stroke="var(--c-hl)"
                strokeWidth={2.5}
              />
            )}
            <line x1={sx(tx)} y1={sy(ty)} x2={sx(tx)} y2={sy(0)} stroke="var(--muted)" strokeDasharray="4 4" />
            <circle
              cx={sx(tx)}
              cy={sy(ty)}
              r={10}
              fill="var(--c-hl)"
              className="cursor-grab"
              tabIndex={0}
              role="slider"
              aria-label={t("tracerAria")}
              aria-valuenow={tx}
              onPointerDown={(e) => {
                (e.target as Element).setPointerCapture?.(e.pointerId);
                setDragging(true);
              }}
              onKeyDown={(e) => {
                const step = (x[1] - x[0]) / 40;
                if (e.key === "ArrowRight") setTx((v) => Math.min(x[1], v + step));
                if (e.key === "ArrowLeft") setTx((v) => Math.max(x[0], v - step));
              }}
            />
          </g>
        )}
      </svg>

      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-lg">
        {graphs.map((g, i) => (
          <span key={i} className={i === 0 ? "" : "text-muted"}>
            <Formula latex={g.label ? `${g.label}=${g.latex}` : `y=${g.latex}`} />
          </span>
        ))}
      </div>
      {tracer && Number.isFinite(ty) && (
        <p className="text-center" aria-live="polite">
          <Formula latex={`x=${fmt(tx).replace(",", "{,}")},\\quad y=${fmt(ty).replace(",", "{,}")}`} />
          {tracer.showSlope && Number.isFinite(tSlope) && (
            <>
              {" · "}
              {t("slopeHere")} <strong className="text-hl">{fmt(tSlope)}</strong>
            </>
          )}
        </p>
      )}
      {tracer && <p className="text-center text-sm text-muted">{t("tracerHelp")}</p>}
    </div>
  );
}
