"use client";
/**
 * Hundred grid: 100 squares are one whole.
 *
 * - `percent` mode: one square is 1%, one row is 10%. With `whole`, the grid
 *   also shows what the coloured part is worth.
 * - `decimal` mode: one square is 0.01, one row is 0.1.
 * - `rect`: a rectangle of cols × rows tenths is coloured, so
 *   0.3 · 0.4 becomes 12 squares = 0.12.
 * The learner colours squares with buttons, or plays the animation.
 */
import { useState } from "react";
import { Btn, numText, Tex, UI, useLoc, useSteps } from "./kit";

type Props = {
  percent: number;
  whole?: number;
  mode?: "percent" | "decimal";
  rect?: { cols: number; rows: number };
};

export function HundredGrid({ props }: { props: Record<string, unknown> }) {
  const { percent, whole, mode = "percent", rect } = props as Props;
  const { l, locale } = useLoc();
  const [count, setCount] = useState(0);
  const target = rect ? rect.cols * rect.rows : percent;

  // The animation colours whole rows first, then single squares
  // (or, for a rectangle, one row of the rectangle at a time).
  const plan = rect
    ? Array.from({ length: rect.rows }, (_, i) => (i + 1) * rect.cols)
    : [
        ...Array.from({ length: Math.floor(target / 10) }, (_, i) => (i + 1) * 10),
        ...Array.from({ length: target % 10 }, (_, i) => Math.floor(target / 10) * 10 + i + 1),
      ];
  const auto = useSteps(plan.length, rect ? 700 : 400);
  const shown = auto.step > 0 ? plan[auto.step - 1] : count;
  const hit = shown === target;
  const change = (d: number) => {
    auto.reset();
    setCount(Math.max(0, Math.min(100, shown + d)));
  };

  /** Is square i (row-major) coloured when `n` squares are shown? */
  const isOn = (i: number, n: number) => {
    if (!rect) return i < n;
    const row = Math.floor(i / 10);
    const col = i % 10;
    return col < rect.cols && row * rect.cols + col < n;
  };

  const S = 30;
  const of = l({ nl: "van", en: "of" });
  const value = (n: number) => (mode === "decimal" ? numText(n / 100, "en") : `${n}\\%`);

  return (
    <div className="space-y-4">
      <svg viewBox={`0 0 ${10 * S + 4} ${10 * S + 4}`} className="mx-auto w-full max-w-xs select-none" role="img" aria-label={l({ nl: "Honderd vakjes", en: "A hundred squares" })}>
        {Array.from({ length: 100 }, (_, i) => {
          const on = isOn(i, shown);
          return (
            <rect
              key={i}
              x={2 + (i % 10) * S + 1}
              y={2 + Math.floor(i / 10) * S + 1}
              width={S - 2}
              height={S - 2}
              rx={4}
              fill={hit && on ? "var(--c-hl)" : "var(--c-num)"}
              fillOpacity={on ? 0.8 : 0}
              stroke="var(--border-strong)"
              style={{ transition: "fill-opacity 250ms, fill 250ms" }}
            />
          );
        })}
        {rect && (
          <rect
            x={2}
            y={2}
            width={rect.cols * S}
            height={rect.rows * S}
            fill="none"
            stroke="var(--fg)"
            strokeWidth={3}
            strokeDasharray="8 5"
          />
        )}
      </svg>

      <div className="space-y-1 text-center text-xl" aria-live="polite">
        {rect ? (
          <Tex
            latex={`${numText(rect.cols / 10, "en")}\\cdot ${numText(rect.rows / 10, "en")}=${hit ? numText(target / 100, "en") : "\\ldots"}`}
          />
        ) : (
          <Tex latex={`${shown}\\text{ ${of} }100=${value(shown)}`} />
        )}
        {whole !== undefined && !rect && (
          <div>
            <Tex
              latex={`${shown}\\%\\text{ ${of} }${numText(whole, "en", 4)}=${shown}\\cdot ${numText(whole / 100, "en", 4)}=${numText((shown * whole) / 100, "en", 4)}`}
            />
          </div>
        )}
      </div>
      <p className="text-center text-sm text-muted">
        {rect
          ? l({
              nl: `Het hele vierkant is 1. De rechthoek is ${numText(rect.cols / 10, locale)} breed en ${numText(rect.rows / 10, locale)} hoog.`,
              en: `The whole square is 1. The rectangle is ${numText(rect.cols / 10, locale)} wide and ${numText(rect.rows / 10, locale)} high.`,
            })
          : mode === "decimal"
            ? l({ nl: "Eén rij is 0,1. Eén vakje is 0,01.", en: "One row is 0.1. One square is 0.01." })
            : l({ nl: "Eén rij is 10%. Eén vakje is 1%.", en: "One row is 10%. One square is 1%." })}
        {whole !== undefined &&
          !rect &&
          ` ${l({ nl: `Eén vakje is hier ${numText(whole / 100, locale, 4)} waard.`, en: `Here one square is worth ${numText(whole / 100, locale, 4)}.` })}`}
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {!rect && (
          <>
            {[-10, -1, 1, 10].map((d) => (
              <Btn key={d} onClick={() => change(d)}>
                {`${d < 0 ? "−" : "+"}${mode === "decimal" ? numText(Math.abs(d) / 100, locale) : `${Math.abs(d)}%`}`}
              </Btn>
            ))}
          </>
        )}
        <Btn onClick={auto.play} disabled={auto.playing}>
          {l(UI.play)}
        </Btn>
        <Btn
          quiet
          onClick={() => {
            auto.reset();
            setCount(0);
          }}
        >
          {l(UI.reset)}
        </Btn>
      </div>
    </div>
  );
}
