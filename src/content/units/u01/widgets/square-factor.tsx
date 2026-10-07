"use client";
/**
 * Simplifying a root: √50 = √(25·2) = 5√2.
 * The learner tries square numbers (4, 9, 16, ...). If one fits, `n` is
 * drawn as that many squares of k by k: 50 = 2 squares of 5 by 5. Each
 * square has side k, so k comes out of the root.
 */
import { useState } from "react";
import { Btn, Tex, useLoc } from "./kit";

type Props = { n: number };

export function SquareFactor({ props }: { props: Record<string, unknown> }) {
  const { n } = props as Props;
  const { l } = useLoc();
  const squares = Array.from({ length: 11 }, (_, i) => (i + 2) ** 2).filter((s) => s <= n);
  const [k, setK] = useState<number | null>(null);
  const best = (() => {
    for (let j = Math.floor(Math.sqrt(n)); j > 1; j--) if (n % (j * j) === 0) return j;
    return 1;
  })();

  const fits = k !== null && n % (k * k) === 0;
  const q = fits ? n / (k * k) : 0;
  const W = 600;
  const H = 210;
  // Draw q squares of k by k when it stays readable.
  const draw = fits && q <= 12 && k <= 12;
  const size = draw ? Math.min(150, (W - 20) / q - 10, H - 40) : 0;
  const cell = draw ? size / k : 0;

  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-2xl select-none" role="img" aria-label={l({ nl: "Kwadraten in een getal", en: "Square numbers in a number" })}>
        {!draw && (
          <text x={W / 2} y={H / 2} textAnchor="middle" fontSize={40} fill="var(--c-num)">
            {k !== null && !fits ? `${n} : ${k * k} = ?` : n}
          </text>
        )}
        {draw &&
          Array.from({ length: q }, (_, c) => {
            const x0 = (W - q * (size + 10) + 10) / 2 + c * (size + 10);
            const y0 = 20;
            return (
              <g key={`${k}-${c}`} className="motion-reduce:[animation:none]" style={{ animation: `u1-fade 400ms ease-out ${c * 120}ms both` }}>
                {Array.from({ length: k * k }, (_, i) => (
                  <rect
                    key={i}
                    x={x0 + (i % k) * cell}
                    y={y0 + Math.floor(i / k) * cell}
                    width={cell - 1}
                    height={cell - 1}
                    fill="var(--c-num)"
                    fillOpacity={0.5}
                  />
                ))}
                <rect x={x0} y={y0} width={size - 1} height={size - 1} fill="none" stroke="var(--c-hl)" strokeWidth={2} />
                <text x={x0 + size / 2} y={y0 + size + 18} textAnchor="middle" fontSize={15} fill="var(--c-hl)">
                  {k}
                </text>
              </g>
            );
          })}
        <style>{`@keyframes u1-fade { from { opacity: 0; } to { opacity: 1; } }`}</style>
      </svg>
      <div className="min-h-16 space-y-1 text-center" aria-live="polite">
        {k === null && <p>{l({ nl: `Welk kwadraat past in ${n}? Kies er een.`, en: `Which square number fits into ${n}? Pick one.` })}</p>}
        {k !== null && !fits && (
          <p>{l({ nl: `${k * k} past niet: ${n} : ${k * k} is geen geheel getal.`, en: `${k * k} does not fit: ${n} : ${k * k} is not a whole number.` })}</p>
        )}
        {fits && (
          <>
            <p className="text-xl">
              <Tex latex={`\\sqrt{${n}}=\\sqrt{${k * k}\\cdot ${q}}=${k}\\sqrt{${q}}`} />
            </p>
            <p>
              {k === best
                ? l({ nl: `${q === 1 ? "Een heel vierkant!" : `${q} vierkanten van ${k} bij ${k}.`} Dit is het grootste kwadraat.`, en: `${q === 1 ? "One whole square!" : `${q} squares of ${k} by ${k}.`} This is the biggest square number.` })
                : l({ nl: `Dat past. Maar er past een groter kwadraat in ${n}.`, en: `That fits. But a bigger square number fits into ${n}.` })}
            </p>
          </>
        )}
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {squares.map((s) => {
          const j = Math.round(Math.sqrt(s));
          return (
            <Btn key={s} onClick={() => setK(j)} pressed={k === j}>
              {s}
            </Btn>
          );
        })}
      </div>
    </div>
  );
}
