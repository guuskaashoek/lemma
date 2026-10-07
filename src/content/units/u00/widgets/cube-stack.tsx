"use client";
/**
 * Volume of a box (balk), layer by layer. The bottom layer holds
 * length × width cubes of 1 by 1 by 1; every next layer adds the same
 * number. Volume = length × width × height.
 */
import { Btn, Tex, UI, useLoc, useSteps } from "./kit";

type Props = { l: number; w: number; h: number; unit: string };

export function CubeStack({ props }: { props: Record<string, unknown> }) {
  const { l, w, h, unit } = props as Props;
  const { l: tr } = useLoc();
  const { step, next, reset, play, playing, done } = useSteps(h, Math.max(300, 2400 / h));
  // Cabinet projection: depth goes up and to the right at half size.
  const s = Math.min(36, 300 / (l + w * 0.5 + 1), 220 / (h + w * 0.5 + 1));
  const ox = 30;
  const oy = 30 + (h + w * 0.5) * s;
  const pt = (x: number, y: number, z: number): [number, number] => [ox + x * s + y * s * 0.5, oy - z * s - y * s * 0.5];
  const P = (x: number, y: number, z: number) => pt(x, y, z).join(",");
  /** A thin grid line between two 3D points. */
  const seg = (key: string, a: [number, number], b: [number, number]) => (
    <line key={key} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="var(--fg)" strokeOpacity={0.5} />
  );
  const W = ox * 2 + (l + w * 0.5) * s;
  const H = oy + 40;
  const base = l * w;

  const layer = (k: number, top: boolean) => (
    <g key={k} className="motion-reduce:[animation:none]" style={{ animation: "u0-drop 400ms ease-out" }}>
      {/* front face */}
      <polygon points={`${P(0, 0, k)} ${P(l, 0, k)} ${P(l, 0, k + 1)} ${P(0, 0, k + 1)}`} fill="var(--c-num)" fillOpacity={0.35} stroke="var(--fg)" />
      {Array.from({ length: l - 1 }, (_, i) => seg(`f${i}`, pt(i + 1, 0, k), pt(i + 1, 0, k + 1)))}
      {/* right side face */}
      <polygon points={`${P(l, 0, k)} ${P(l, w, k)} ${P(l, w, k + 1)} ${P(l, 0, k + 1)}`} fill="var(--c-num)" fillOpacity={0.55} stroke="var(--fg)" />
      {Array.from({ length: w - 1 }, (_, j) => seg(`s${j}`, pt(l, j + 1, k), pt(l, j + 1, k + 1)))}
      {/* top face of the highest layer, with its grid of cubes */}
      {top && (
        <g>
          <polygon points={`${P(0, 0, k + 1)} ${P(l, 0, k + 1)} ${P(l, w, k + 1)} ${P(0, w, k + 1)}`} fill="var(--c-num)" fillOpacity={0.2} stroke="var(--fg)" />
          {Array.from({ length: l - 1 }, (_, i) => seg(`tx${i}`, pt(i + 1, 0, k + 1), pt(i + 1, w, k + 1)))}
          {Array.from({ length: w - 1 }, (_, j) => seg(`ty${j}`, pt(0, j + 1, k + 1), pt(l, j + 1, k + 1)))}
        </g>
      )}
    </g>
  );

  return (
    <div className="space-y-4">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-md select-none" role="img" aria-label={tr({ nl: "Balk van blokjes", en: "Box made of cubes" })}>
        {/* Outline of the full box. */}
        <polygon points={`${P(0, 0, 0)} ${P(l, 0, 0)} ${P(l, 0, h)} ${P(0, 0, h)}`} fill="none" stroke="var(--border-strong)" strokeDasharray="6 4" />
        <polygon points={`${P(l, 0, 0)} ${P(l, w, 0)} ${P(l, w, h)} ${P(l, 0, h)}`} fill="none" stroke="var(--border-strong)" strokeDasharray="6 4" />
        <polygon points={`${P(0, 0, h)} ${P(l, 0, h)} ${P(l, w, h)} ${P(0, w, h)}`} fill="none" stroke="var(--border-strong)" strokeDasharray="6 4" />
        {Array.from({ length: step }, (_, k) => layer(k, k === step - 1))}
        <text x={ox + (l * s) / 2} y={oy + 24} textAnchor="middle" fontSize={15} fill="var(--c-num)">
          {l} {unit}
        </text>
        <style>{`@keyframes u0-drop { from { transform: translateY(-20px); opacity: 0; } to { transform: none; opacity: 1; } }`}</style>
      </svg>
      <div className="min-h-8 text-center text-xl" aria-live="polite">
        {step === 0 ? (
          <Tex latex={`${l}\\cdot ${w}\\cdot ${h}=\\ ?`} />
        ) : (
          <Tex latex={`${step}\\cdot ${base}=${step * base}${done ? `\\text{ ${unit}}^{3}` : ""}`} />
        )}
      </div>
      <p className="text-center text-sm text-muted">
        {tr({
          nl: `Eén laag: ${l} bij ${w} = ${base} blokjes. Er komen ${h} lagen.`,
          en: `One layer: ${l} by ${w} = ${base} cubes. There are ${h} layers.`,
        })}
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <Btn onClick={next} disabled={done || playing}>
          {tr({ nl: "Laag erbij", en: "Add a layer" })}
        </Btn>
        <Btn onClick={play} disabled={playing}>
          {tr(UI.play)}
        </Btn>
        <Btn quiet onClick={reset}>
          {tr(UI.reset)}
        </Btn>
      </div>
    </div>
  );
}
