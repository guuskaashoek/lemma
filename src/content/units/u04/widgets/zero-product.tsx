"use client";
/**
 * "When is the product zero?" Slide x along a number line. Two bars show
 * the values of both factors and a third bar shows their product. The
 * product bar disappears exactly when one of the factor bars is zero.
 * Every x where that happens is marked on the number line.
 */
import { useState } from "react";
import { Btn, MOTION, Tex, UI, numTex, useLoc } from "./kit";

type Factor = [number, number]; // a·x + b

/** `(x-2)`, `(2x+1)` or `x`. */
function factorTex([a, b]: Factor): string {
  const ax = a === 1 ? "x" : a === -1 ? "-x" : `${a}x`;
  if (b === 0) return ax;
  return `(${ax}${b > 0 ? "+" : "-"}${Math.abs(b)})`;
}

const MIN = -10;
const MAX = 10;

export function ZeroProduct({ props }: { props: Record<string, unknown> }) {
  const factors = (props.factors as Factor[]) ?? [];
  const k = Number(props.k ?? 1);
  const step = Number(props.step ?? 1);
  const { l, locale } = useLoc();
  // Start a little right of the left end, at a place where the product is not zero.
  const productAt = (v: number) => k * factors.reduce((acc, [a, b]) => acc * (a * v + b), 1);
  const start = [MIN + 2, MIN + 1, MIN + 3].find((v) => Math.abs(productAt(v)) > 1e-9) ?? MIN;
  const [x, setX] = useState(start);
  const [found, setFound] = useState<number[]>([]);

  const values = factors.map(([a, b]) => a * x + b);
  const product = k * values.reduce((acc, v) => acc * v, 1);
  const zero = Math.abs(product) < 1e-9;

  const move = (to: number) => {
    const v = Math.round(Math.min(MAX, Math.max(MIN, to)) / step) * step;
    setX(v);
    if (Math.abs(productAt(v)) < 1e-9) setFound((f) => (f.some((g) => Math.abs(g - v) < 1e-9) ? f : [...f, v].sort((s, t) => s - t)));
  };

  // Bars: height grows with the value, but stays readable for big products.
  const barH = (v: number) => Math.sign(v) * Math.min(70, 8 * Math.sqrt(Math.abs(v)));
  const bars = [
    ...factors.map((f, i) => ({ label: factorTex(f), value: values[i], kind: "factor" as const })),
    { label: l({ nl: "product", en: "product" }), value: product, kind: "product" as const },
  ];
  const sx = (v: number) => 20 + ((v - MIN) / (MAX - MIN)) * 560;
  const shown = `${k === 1 ? "" : k === -1 ? "-" : k}${factors.map(factorTex).join("")}`;

  return (
    <div className="space-y-4">
      <div className="text-center text-2xl">
        <Tex latex={`${shown}=0`} />
      </div>

      <svg viewBox="0 0 600 190" className="mx-auto w-full max-w-lg select-none" role="img" aria-label={l({ nl: "Staven voor de factoren en het product", en: "Bars for the factors and the product" })}>
        <line x1={20} y1={90} x2={580} y2={90} stroke="var(--border-strong)" />
        {bars.map((bar, i) => {
          const cx = 100 + i * 200;
          const h = barH(bar.value);
          const isZero = Math.abs(bar.value) < 1e-9;
          return (
            <g key={i}>
              <rect
                x={cx - 30}
                y={h >= 0 ? 90 - h : 90}
                width={60}
                height={Math.max(Math.abs(h), 1)}
                fill={bar.kind === "product" ? "var(--c-hl)" : "var(--c-num)"}
                fillOpacity={bar.value >= 0 ? 0.45 : 0}
                stroke={isZero ? "var(--c-hl)" : "var(--fg)"}
                strokeWidth={isZero ? 3 : 1.3}
                strokeDasharray={bar.value < 0 ? "5 3" : undefined}
                className={MOTION}
              />
              <text x={cx} y={182} textAnchor="middle" fontSize={15} fill="var(--fg)">
                {numTex(bar.value).replace("-", "−").replace(".", locale === "nl" ? "," : ".")}
              </text>
              {isZero && (
                <text x={cx} y={80} textAnchor="middle" fontSize={16} fontWeight="bold" fill="var(--c-hl)">
                  0!
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <div className="grid grid-cols-3 text-center text-lg">
        {bars.map((bar, i) => (
          <span key={i}>{bar.kind === "product" ? bar.label : <Tex latex={bar.label} />}</span>
        ))}
      </div>

      {/* Number line with the slider position and the zeros found so far. */}
      <svg viewBox="0 0 600 56" className="mx-auto w-full max-w-lg select-none" aria-hidden>
        <line x1={20} y1={24} x2={580} y2={24} stroke="var(--fg)" />
        {Array.from({ length: MAX - MIN + 1 }, (_, i) => MIN + i).map((v) => (
          <g key={v}>
            <line x1={sx(v)} y1={19} x2={sx(v)} y2={29} stroke="var(--fg)" />
            {v % 2 === 0 && (
              <text x={sx(v)} y={48} textAnchor="middle" fontSize={13} fill="var(--muted)">
                {v < 0 ? `−${-v}` : v}
              </text>
            )}
          </g>
        ))}
        {found.map((v) => (
          <circle key={v} cx={sx(v)} cy={24} r={8} fill="none" stroke="var(--c-hl)" strokeWidth={3} />
        ))}
        <circle cx={sx(x)} cy={24} r={6} fill="var(--c-var)" className={MOTION} />
      </svg>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <Btn onClick={() => move(x - step)} disabled={x <= MIN} label={l({ nl: "x kleiner", en: "x smaller" })}>
          ←
        </Btn>
        <input
          type="range"
          min={MIN}
          max={MAX}
          step={step}
          value={x}
          onChange={(e) => move(Number(e.target.value))}
          aria-label={l({ nl: "Waarde van x", en: "Value of x" })}
          className="w-48 accent-[var(--c-var)]"
        />
        <Btn onClick={() => move(x + step)} disabled={x >= MAX} label={l({ nl: "x groter", en: "x bigger" })}>
          →
        </Btn>
      </div>
      <div className="min-h-14 text-center text-xl" aria-live="polite">
        <Tex latex={`x=${numTex(x)}`} />
        <p className="text-base text-muted">
          {zero
            ? l({ nl: "Het product is nul! Kijk welke factor nul is.", en: "The product is zero! See which factor is zero." })
            : found.length > 0
              ? l({ nl: `Gevonden: ${found.map((v) => numTex(v).replace(".", locale === "nl" ? "," : ".")).join(" en ")}. Zoek verder.`, en: `Found: ${found.map((v) => numTex(v)).join(" and ")}. Keep looking.` })
              : l({ nl: "Schuif x tot het product nul is.", en: "Slide x until the product is zero." })}
        </p>
      </div>
      <div className="flex justify-center">
        <Btn quiet onClick={() => { setX(start); setFound([]); }}>
          {l(UI.reset)}
        </Btn>
      </div>
    </div>
  );
}
