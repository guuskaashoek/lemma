"use client";
/**
 * The metric staircase. A ball with the amount sits on its unit's stair.
 * One stair down: the unit gets smaller, so the number gets bigger (times
 * 10, or 100 for area, 1000 for volume). One stair up: divided by.
 */
import Fraction from "fraction.js";
import { useState } from "react";
import { Btn, numText, UI, useLoc } from "./kit";
import { ALIAS, STAIRS, STEP, type UnitKind } from "./unit-model";

type Props = { kind: UnitKind; from: string; to: string; value: number };

export function UnitStairs({ props }: { props: Record<string, unknown> }) {
  const { kind, from, to, value } = props as Props;
  const { l, locale } = useLoc();
  const units = STAIRS[kind];
  const start = units.indexOf(from);
  const goal = units.indexOf(to);
  const [pos, setPos] = useState(start);
  const step = STEP[kind];
  const current = new Fraction(value).mul(new Fraction(step).pow(pos - start));

  const SW = 84; // stair width
  const SH = 34; // stair height
  const W = units.length * SW + 40;
  const H = units.length * SH + 120;
  const stairX = (i: number) => 20 + i * SW;
  const stairY = (i: number) => 70 + i * SH;

  const walk = () => {
    setPos(start);
    const dir = Math.sign(goal - start);
    for (let k = 1; k <= Math.abs(goal - start); k++) setTimeout(() => setPos(start + dir * k), 800 * k);
  };

  return (
    <div className="space-y-4">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-2xl select-none" role="img" aria-label={l({ nl: "Het metriek trapje", en: "The metric staircase" })}>
        {units.map((u, i) => (
          <g key={u}>
            <path
              d={`M ${stairX(i)} ${stairY(i)} h ${SW} v ${H - 20 - stairY(i)} h ${-SW} z`}
              fill={i === goal ? "var(--surface-2)" : "transparent"}
              stroke="var(--border-strong)"
            />
            <text x={stairX(i) + SW / 2} y={stairY(i) + 24} textAnchor="middle" fontSize={17} fill={i === goal ? "var(--c-hl)" : "var(--fg)"}>
              {u}
            </text>
            {ALIAS[u] && kind === "cubic" && (
              <text x={stairX(i) + SW / 2} y={stairY(i) + 44} textAnchor="middle" fontSize={13} fill="var(--muted)">
                = {ALIAS[u]}
              </text>
            )}
            {i < units.length - 1 && (
              <text x={stairX(i) + SW - 4} y={stairY(i) + 12} textAnchor="middle" fontSize={11} fill="var(--muted)">
                ×{step}
              </text>
            )}
          </g>
        ))}
        {/* The amount travels over the stairs. */}
        <g className="motion-reduce:transition-none" style={{ transform: `translate(${stairX(pos) + SW / 2}px, ${stairY(pos) - 26}px)`, transition: "transform 700ms ease-in-out" }}>
          <rect x={-42} y={-18} width={84} height={30} rx={15} fill="var(--c-num)" fillOpacity={0.2} stroke="var(--c-num)" />
          <text y={3} textAnchor="middle" fontSize={15} fill="var(--c-num)">
            {numText(current.valueOf(), locale, 6)}
          </text>
        </g>
      </svg>
      <p className="text-center text-xl" aria-live="polite">
        {numText(value, locale, 6)} {from} = {pos === start ? "…" : numText(current.valueOf(), locale, 6)} {units[pos]}
      </p>
      <p className="text-center text-sm text-muted">
        {l({
          nl: `Trede omlaag: keer ${step}. Trede omhoog: gedeeld door ${step}.`,
          en: `One stair down: times ${step}. One stair up: divided by ${step}.`,
        })}
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <Btn onClick={() => setPos((p) => Math.max(0, p - 1))} disabled={pos === 0}>
          {l({ nl: `↑ Omhoog (: ${step})`, en: `↑ Up (: ${step})` })}
        </Btn>
        <Btn onClick={() => setPos((p) => Math.min(units.length - 1, p + 1))} disabled={pos === units.length - 1}>
          {l({ nl: `↓ Omlaag (× ${step})`, en: `↓ Down (× ${step})` })}
        </Btn>
        {goal !== start && (
          <Btn onClick={walk}>
            {l({ nl: `▶ Naar ${to}`, en: `▶ To ${to}` })}
          </Btn>
        )}
        <Btn quiet onClick={() => setPos(start)}>
          {l(UI.reset)}
        </Btn>
      </div>
    </div>
  );
}
