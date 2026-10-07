"use client";
/**
 * Percentage bar for price changes. The old amount is a bar of 100%.
 * A discount cuts a piece off; an increase adds a piece. The new bar is
 * (100 − p)% or (100 + p)% of the old one: that is the growth factor.
 * With `reverse`, the new amount is known and the old one is asked.
 */
import Fraction from "fraction.js";
import { Btn, numText, Tex, UI, useLoc, useSteps } from "./kit";

type Props = { from: number; percent: number; up: boolean; reverse?: boolean };

export function PercentBar({ props }: { props: Record<string, unknown> }) {
  const { from, percent, up, reverse = false } = props as Props;
  const { l, locale } = useLoc();
  const { step, next, reset, play, playing, done } = useSteps(3, 1200);
  const newPct = up ? 100 + percent : 100 - percent;
  const factor = new Fraction(newPct, 100);
  const to = new Fraction(from).mul(factor).valueOf();
  /** Amount for LaTeX (decimal point); the formula component localises it. */
  const tex = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(2));
  /** Amount as plain text for SVG labels. */
  const money = (v: number) => (locale === "nl" ? tex(v).replace(".", ",") : tex(v));

  const W = 640;
  const unit = (W - 140) / Math.max(100, newPct); // pixels per percent
  const X0 = 20;
  const bar = (y: number, pct: number, label: string, fill: string, show: boolean) => (
    <g style={{ opacity: show ? 1 : 0, transition: "opacity 400ms" }}>
      <rect
        x={X0}
        y={y}
        width={pct * unit}
        height={40}
        rx={6}
        fill={fill}
        fillOpacity={0.35}
        stroke="var(--fg)"
        className="motion-reduce:transition-none"
        style={{ transform: `scaleX(${show ? 1 : 0})`, transformOrigin: `${X0}px ${y}px`, transition: "transform 700ms ease-out" }}
      />
      <text x={X0 + pct * unit + 10} y={y + 26} fontSize={16} fill="var(--fg)">
        {label}
      </text>
    </g>
  );

  const oldLabel = reverse && step < 3 ? "?" : money(from);
  const newLabel = !reverse && step < 3 ? "?" : money(to);

  return (
    <div className="space-y-4">
      <svg viewBox={`0 0 ${W} 170`} className="mx-auto w-full max-w-2xl select-none" role="img" aria-label={l({ nl: "Procentenstrook", en: "Percentage bar" })}>
        {bar(20, 100, `100% = ${oldLabel}`, "var(--c-num)", true)}
        {/* The piece that is cut off or added. */}
        <rect
          x={X0 + (up ? 100 : 100 - percent) * unit}
          y={20}
          width={percent * unit}
          height={40}
          rx={6}
          fill="var(--c-hl)"
          fillOpacity={step >= 1 ? 0.45 : 0}
          stroke={step >= 1 ? "var(--c-hl)" : "none"}
          strokeDasharray="6 4"
          style={{ transition: "fill-opacity 400ms" }}
        />
        {step >= 1 && (
          <text x={X0 + (up ? 100 + percent / 2 : 100 - percent / 2) * unit} y={14} textAnchor="middle" fontSize={15} fill="var(--c-hl)">
            {up ? "+" : "−"}
            {numText(percent, locale)}%
          </text>
        )}
        {bar(100, newPct, `${numText(newPct, locale)}% = ${newLabel}`, "var(--c-hl)", step >= 2)}
      </svg>
      <div className="min-h-8 text-center text-xl" aria-live="polite">
        {step >= 2 && (
          <Tex
            latex={
              reverse
                ? `${tex(to)}:${numText(factor.valueOf(), "en")}=${step >= 3 ? tex(from) : "\\ldots"}`
                : `${numText(factor.valueOf(), "en")}\\cdot ${tex(from)}=${step >= 3 ? tex(to) : "\\ldots"}`
            }
          />
        )}
      </div>
      <p className="text-center text-sm text-muted">
        {l({
          nl: `${numText(newPct, locale)}% is ${numText(factor.valueOf(), locale)} keer het geheel.`,
          en: `${numText(newPct, locale)}% is ${numText(factor.valueOf(), locale)} times the whole.`,
        })}
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
