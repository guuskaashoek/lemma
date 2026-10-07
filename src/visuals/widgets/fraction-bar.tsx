"use client";
/**
 * Fraction bars. Each bar is one whole, cut into equal parts; the shaded
 * parts are the fraction. "Split every part" doubles the number of parts
 * without changing the shaded area: 1/2 = 2/4 = 4/8 becomes visible.
 */
import { useState } from "react";
import { useT } from "@/i18n/client";
import { Formula } from "@/components/math";

export function FractionBarWidget({ bars, allowSplit = true }: { bars: Array<{ num: number; den: number }>; allowSplit?: boolean }) {
  const { t } = useT();
  const [factor, setFactor] = useState<number[]>(bars.map(() => 1));
  const W = 600;
  const H = 46;

  return (
    <div className="space-y-5">
      {bars.map((bar, i) => {
        const k = factor[i];
        const den = bar.den * k;
        const num = bar.num * k;
        const wholes = Math.max(1, Math.ceil(num / den));
        return (
          <div key={i} className="flex items-center gap-4">
            <div className="flex-1 space-y-1">
              {Array.from({ length: wholes }, (_, w) => (
                <svg key={w} viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`${num}/${den}`}>
                  {Array.from({ length: den }, (_, p) => {
                    const filled = w * den + p < num;
                    return (
                      <rect
                        key={p}
                        x={(p * W) / den + 1}
                        y={1}
                        width={W / den - 2}
                        height={H - 2}
                        rx={4}
                        fill={filled ? "var(--c-num)" : "transparent"}
                        fillOpacity={filled ? 0.85 : 0}
                        stroke="var(--border-strong)"
                        strokeWidth={1.5}
                        style={{ transition: "all 400ms" }}
                      />
                    );
                  })}
                </svg>
              ))}
            </div>
            <div className="w-20 text-center text-2xl">
              <Formula latex={`\\frac{${num}}{${den}}`} />
            </div>
            {allowSplit && (
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => setFactor((f) => f.map((v, j) => (j === i && v < 6 ? v + 1 : v)))}
                  className="rounded-md border border-border-strong px-2 py-1 text-sm hover:border-fg"
                >
                  {t("splitParts")}
                </button>
                <button
                  onClick={() => setFactor((f) => f.map((v, j) => (j === i ? 1 : v)))}
                  className="rounded-md px-2 py-1 text-sm text-muted hover:text-fg"
                >
                  ↺
                </button>
              </div>
            )}
          </div>
        );
      })}
      {allowSplit && <p className="text-center text-sm text-muted">{t("splitNote")}</p>}
    </div>
  );
}
