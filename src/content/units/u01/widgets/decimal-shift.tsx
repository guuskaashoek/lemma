"use client";
/**
 * Scientific notation: the digits stay where they are, the decimal point
 * slides. Every place to the left divides the front number by 10, so the
 * power of ten goes one up; every place to the right does the opposite.
 * The number itself never changes: 45 000 = 4.5 · 10^4.
 */
import { useState } from "react";
import { Btn, Tex, useLoc } from "./kit";
import { shiftWindow } from "./shift-model";

type Props = { digits: number; shift: number };

export function DecimalShift({ props }: { props: Record<string, unknown> }) {
  const { digits, shift } = props as Props;
  const { l, locale } = useLoc();
  const w = shiftWindow(digits, shift);
  const [k, setK] = useState(0); // the exponent pulled out: number = a · 10^k

  const CELL = 40;
  const W = Math.max(360, w.cells.length * CELL + 60);
  const x0 = (W - w.cells.length * CELL) / 2;
  // The point sits right after the cell with power k.
  const idx = w.cells.findIndex((c) => c.power === k);
  const pointX = x0 + (idx + 1) * CELL;
  const a = w.front(k);
  const good = w.isNormal(k);
  const sep = locale === "nl" ? "," : ".";

  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} 120`} className="mx-auto w-full max-w-2xl select-none" role="img" aria-label={l({ nl: "Getal met verschuifbare komma", en: "Number with a movable point" })}>
        {w.cells.map((c, i) => (
          <g key={c.power}>
            <rect x={x0 + i * CELL + 2} y={30} width={CELL - 4} height={52} rx={8} fill="none" stroke="var(--border)" />
            <text
              x={x0 + i * CELL + CELL / 2}
              y={68}
              textAnchor="middle"
              fontSize={30}
              fill="var(--c-num)"
              fillOpacity={w.shown(c.power, k) ? 1 : 0.25}
            >
              {c.digit}
            </text>
          </g>
        ))}
        <text
          x={0}
          y={78}
          textAnchor="middle"
          fontSize={40}
          fontWeight={700}
          fill="var(--c-hl)"
          className="motion-reduce:transition-none"
          style={{ transform: `translateX(${pointX}px)`, transition: "transform 400ms ease-out" }}
        >
          {sep}
        </text>
        {k !== 0 && (
          <text x={W / 2} y={20} textAnchor="middle" fontSize={14} fill="var(--c-hl)">
            {l(
              k > 0
                ? { nl: `${k} ${k === 1 ? "plaats" : "plaatsen"} naar links`, en: `${k} ${k === 1 ? "place" : "places"} to the left` }
                : { nl: `${-k} ${k === -1 ? "plaats" : "plaatsen"} naar rechts`, en: `${-k} ${k === -1 ? "place" : "places"} to the right` },
            )}
          </text>
        )}
      </svg>
      <div className="min-h-16 space-y-1 text-center" aria-live="polite">
        <p className="text-xl">
          <Tex latex={`${w.plain}=${a}\\cdot 10^{${k}}`} />
        </p>
        <p>
          {good
            ? l({ nl: "Precies één cijfer (geen 0) vóór de komma: wetenschappelijke notatie!", en: "Exactly one digit (not 0) before the point: scientific notation!" })
            : l({ nl: "Schuif de komma tot er precies één cijfer (geen 0) vóór staat.", en: "Move the point until exactly one digit (not 0) is in front of it." })}
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <Btn onClick={() => setK((v) => Math.min(w.maxK, v + 1))} disabled={k >= w.maxK}>
          {l({ nl: "← komma naar links", en: "← point to the left" })}
        </Btn>
        <Btn onClick={() => setK((v) => Math.max(w.minK, v - 1))} disabled={k <= w.minK}>
          {l({ nl: "komma naar rechts →", en: "point to the right →" })}
        </Btn>
        <Btn quiet onClick={() => setK(0)}>
          {l({ nl: "↺ Opnieuw", en: "↺ Start over" })}
        </Btn>
      </div>
    </div>
  );
}
