"use client";
/**
 * Place value chart. The decimal point stays where it is; the digits move.
 * Times 10 moves every digit one place to the left, divided by 10 one
 * place to the right. Empty places between the digits and the point are
 * filled with a (grey) zero.
 */
import Fraction from "fraction.js";
import { useState } from "react";
import { dec } from "../helpers";
import { Btn, Tex, UI, useLoc, useSteps } from "./kit";

type Props = { value: string; factor?: number; op?: "*" | ":" };

const POWERS = [3, 2, 1, 0, -1, -2, -3];
const HEAD = {
  nl: ["D", "H", "T", "E", "t", "h", "d"],
  en: ["Th", "H", "T", "O", "t", "h", "th"],
};

/** The significant digits of a decimal string with their place (power of ten). */
function digitsOf(value: string): Array<{ digit: string; power: number }> {
  const [whole, frac = ""] = value.replace("-", "").split(".");
  const all = (whole + frac).split("");
  const out = all.map((digit, i) => ({ digit, power: whole.length - 1 - i }));
  // Drop leading and trailing zeros: those are drawn as placeholders.
  while (out.length > 1 && out[0].digit === "0") out.shift();
  while (out.length > 1 && out[out.length - 1].digit === "0") out.pop();
  return out;
}

export function PlaceValue({ props }: { props: Record<string, unknown> }) {
  const { value, factor = 10, op = "*" } = props as Props;
  const { l, locale } = useLoc();
  const [manual, setManual] = useState(0);
  const digits = digitsOf(value);
  const top = Math.max(...digits.map((d) => d.power));
  const low = Math.min(...digits.map((d) => d.power));
  const target = Math.round(Math.log10(factor)) * (op === "*" ? 1 : -1);
  // "Show me" moves one place at a time; its timers stop on reset and unmount.
  const auto = useSteps(Math.abs(target), 700);
  const shift = auto.step > 0 ? Math.sign(target) * auto.step : manual;
  const setShift = (next: number) => {
    auto.reset();
    setManual(next);
  };
  const canLeft = top + shift < 3;
  const canRight = low + shift > -3;
  const current = new Fraction(value).mul(new Fraction(10).pow(shift));

  const COL = 64;
  const X0 = 16;
  const colX = (p: number) => X0 + (3 - p) * COL;
  const W = X0 * 2 + 7 * COL;
  // Placeholder zeros: between the lowest digit and the ones place, or
  // between the point and the highest digit.
  const zeros: number[] = [];
  for (let p = 0; p < low + shift; p++) zeros.push(p);
  for (let p = 0; p > top + shift; p--) zeros.push(p);


  return (
    <div className="space-y-4">
      <svg viewBox={`0 0 ${W} 130`} className="mx-auto w-full max-w-xl select-none" role="img" aria-label={l({ nl: "Plaatswaardekaart", en: "Place value chart" })}>
        {POWERS.map((p, i) => (
          <g key={p}>
            <rect x={colX(p) + 2} y={30} width={COL - 4} height={70} rx={8} fill={p < 0 ? "var(--surface-2)" : "transparent"} stroke="var(--border-strong)" />
            <text x={colX(p) + COL / 2} y={20} textAnchor="middle" fontSize={15} fill="var(--muted)">
              {HEAD[locale][i]}
            </text>
          </g>
        ))}
        {/* The decimal point never moves. */}
        <circle cx={colX(0) + COL} cy={92} r={5} fill="var(--c-hl)" />
        {zeros.map((p) => (
          <text key={`z${p}`} x={colX(p) + COL / 2} y={78} textAnchor="middle" fontSize={34} fill="var(--muted)">
            0
          </text>
        ))}
        {digits.map((d, i) => (
          <text
            key={i}
            x={0}
            y={78}
            textAnchor="middle"
            fontSize={34}
            fill="var(--c-num)"
            className="motion-reduce:transition-none"
            style={{ transform: `translateX(${colX(d.power + shift) + COL / 2}px)`, transition: "transform 600ms ease-out" }}
          >
            {d.digit}
          </text>
        ))}
      </svg>
      <div className="text-center text-2xl" aria-live="polite">
        <Tex latex={shift === 0 ? dec(new Fraction(value)) : `${value}${shift > 0 ? "\\cdot" : ":"} ${10 ** Math.abs(shift)}=${dec(current)}`} />
      </div>
      <p className="text-center text-sm text-muted">
        {l({ nl: "De komma blijft staan. De cijfers schuiven.", en: "The decimal point stays. The digits move." })}
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <Btn onClick={() => setShift(shift + 1)} disabled={!canLeft || auto.playing}>
          {l({ nl: "× 10 (naar links)", en: "× 10 (to the left)" })}
        </Btn>
        <Btn onClick={() => setShift(shift - 1)} disabled={!canRight || auto.playing}>
          {l({ nl: ": 10 (naar rechts)", en: ": 10 (to the right)" })}
        </Btn>
        {target !== 0 && (
          <Btn onClick={auto.play} disabled={auto.playing}>
            {`▶ ${op === "*" ? "×" : ":"} ${factor}`}
          </Btn>
        )}
        <Btn quiet onClick={() => setShift(0)}>
          {l(UI.reset)}
        </Btn>
      </div>
    </div>
  );
}
