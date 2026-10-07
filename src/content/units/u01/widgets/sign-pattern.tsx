"use client";
/**
 * Why minus times minus is plus: a times table that keeps its pattern.
 *
 * Rows k·b for k = K, K−1, ..., −K, shown one by one. Every row down the
 * answer changes by the same amount. Continue the pattern past zero and the
 * signs flip by themselves. Each answer is also a bar: filled to the right
 * for positive, outlined to the left for negative.
 */
import { useState } from "react";
import { Btn, StepButtons, useLoc, useSteps } from "./kit";

type Props = { b: number; k?: number };

const minus = (n: number) => (n < 0 ? `−${-n}` : String(n));
const brText = (n: number) => (n < 0 ? `(−${-n})` : String(n));

export function SignPattern({ props }: { props: Record<string, unknown> }) {
  const { b, k } = props as Props;
  const { l } = useLoc();
  const K = Math.max(3, Math.abs(k ?? 0));
  const ks = Array.from({ length: 2 * K + 1 }, (_, i) => K - i);
  const s = useSteps(ks.length, 1000);
  const [guess, setGuess] = useState<number | null>(null);

  const maxAbs = Math.max(...ks.map((x) => Math.abs(x * b)), 1);
  const W = 600;
  const X0 = 400; // zero of the bars
  const unit = 180 / maxAbs;
  const ROW = 30;
  const H = ks.length * ROW + 20;
  // The first row with a negative k: here the learner predicts the answer.
  const firstNeg = ks.indexOf(-1);
  const asking = s.step === firstNeg && !s.playing;
  const step = -b; // change per row going down

  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-2xl select-none" role="img" aria-label={l({ nl: "Patroon van een tafel", en: "Pattern of a times table" })}>
        <line x1={X0} y1={6} x2={X0} y2={H - 6} stroke="var(--border-strong)" />
        {ks.map((kk, i) => {
          const shown = i < s.step;
          const p = kk * b;
          const y = 14 + i * ROW;
          const hl = kk === k;
          return (
            <g key={kk} style={{ opacity: shown ? 1 : 0.12, transition: "opacity 300ms" }}>
              <text x={20} y={y + 14} fontSize={16} fill={hl ? "var(--c-hl)" : "var(--fg)"} fontWeight={hl ? 700 : 400}>
                {`${minus(kk)} · ${brText(b)} = ${shown ? minus(p) : "?"}`}
              </text>
              {shown && p !== 0 && (
                <rect
                  x={p > 0 ? X0 : X0 + p * unit}
                  y={y}
                  width={Math.abs(p) * unit}
                  height={18}
                  rx={4}
                  fill={p > 0 ? "var(--c-num)" : "none"}
                  fillOpacity={0.6}
                  stroke="var(--c-num)"
                  strokeDasharray={p < 0 ? "5 3" : undefined}
                  className="motion-reduce:[animation:none]"
                  style={{ transformOrigin: `${X0}px ${y}px`, animation: "u1-grow 400ms ease-out" }}
                />
              )}
              {shown && i > 0 && (
                <text x={W - 8} y={y + 4} fontSize={13} textAnchor="end" fill="var(--c-hl)">
                  {step > 0 ? `+${step}` : minus(step)}
                </text>
              )}
            </g>
          );
        })}
        <style>{`@keyframes u1-grow { from { transform: scaleX(0); } to { transform: none; } }`}</style>
      </svg>
      <div className="min-h-12 text-center" aria-live="polite">
        {asking ? (
          <div className="space-y-2">
            <p>
              {l({
                nl: `Elke rij omlaag: ${step > 0 ? "+" : ""}${minus(step)}. Wat is ${minus(-1)} · ${brText(b)}?`,
                en: `Every row down: ${step > 0 ? "+" : ""}${minus(step)}. What is ${minus(-1)} · ${brText(b)}?`,
              })}
            </p>
            <div className="flex justify-center gap-2">
              {[-b, b].sort((x, y) => x - y).map((v) => (
                <Btn
                  key={v}
                  onClick={() => {
                    setGuess(v);
                    s.next();
                  }}
                >
                  {minus(v)}
                </Btn>
              ))}
            </div>
          </div>
        ) : (
          guess !== null &&
          s.step > firstNeg && (
            <p>
              {guess === -b
                ? l({ nl: "Ja! Het patroon gaat gewoon door.", en: "Yes! The pattern simply goes on." })
                : l({ nl: `Kijk naar het patroon: het wordt ${minus(-b)}.`, en: `Look at the pattern: it becomes ${minus(-b)}.` })}
            </p>
          )
        )}
      </div>
      <StepButtons s={{ ...s, reset: () => (setGuess(null), s.reset()) }} nextLabel={{ nl: "Volgende rij", en: "Next row" }} />
    </div>
  );
}
