"use client";
/**
 * A square root is the side of a square. The learner gets `area` cells and
 * chooses a side length; the cells are laid out in rows of that length.
 * Only when side · side = area do the cells form an exact square.
 * For a number that is not a square, the cells never fit: the root lies
 * between two whole numbers.
 */
import { useState } from "react";
import { Btn, Tex, useLoc } from "./kit";

type Props = { area: number; side?: number };

export function RootSquare({ props }: { props: Record<string, unknown> }) {
  const { area, side: start = 1 } = props as Props;
  const { l } = useLoc();
  const maxSide = Math.min(32, Math.ceil(Math.sqrt(area)) + 2);
  const [s, setS] = useState(Math.min(start, maxSide));
  const rows = Math.ceil(area / s);
  const sq = s * s;

  const W = 360;
  const H = 300;
  const grid = Math.max(rows, s);
  const cell = Math.min(28, (W - 40) / Math.max(s, 1), (H - 40) / grid);
  const ox = (W - s * cell) / 2;
  const oy = 20;
  const status = sq === area ? "exact" : sq < area ? "small" : "big";

  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-md select-none" role="img" aria-label={l({ nl: "Hokjes als vierkant", en: "Cells as a square" })}>
        {Array.from({ length: area }, (_, i) => {
          const x = ox + (i % s) * cell;
          const y = oy + Math.floor(i / s) * cell;
          const outside = Math.floor(i / s) >= s;
          return (
            <rect
              key={i}
              x={0}
              y={0}
              width={cell - 1.5}
              height={cell - 1.5}
              rx={Math.min(3, cell / 6)}
              fill={outside ? "var(--c-hl)" : "var(--c-num)"}
              fillOpacity={outside ? 0.7 : 0.55}
              className="motion-reduce:transition-none"
              style={{ transform: `translate(${x}px, ${y}px)`, transition: "transform 450ms ease-out" }}
            />
          );
        })}
        {/* The square of side s. */}
        <rect
          x={ox - 2}
          y={oy - 2}
          width={s * cell + 2.5}
          height={s * cell + 2.5}
          fill="none"
          stroke={status === "exact" ? "var(--c-hl)" : "var(--fg)"}
          strokeWidth={status === "exact" ? 4 : 2}
          strokeDasharray={status === "exact" ? undefined : "6 4"}
          className="motion-reduce:transition-none"
          style={{ transition: "all 450ms ease-out" }}
        />
      </svg>
      <div className="min-h-16 space-y-1 text-center" aria-live="polite">
        <p className="text-xl">
          <Tex latex={`${s}\\cdot ${s}=${sq}${status === "exact" ? "" : status === "small" ? `<${area}` : `>${area}`}`} />
        </p>
        <p>
          {status === "exact"
            ? l({ nl: `Precies! De hokjes vormen een vierkant. Dus √${area} = ${s}.`, en: `Exactly! The cells make a square. So √${area} = ${s}.` })
            : status === "small"
              ? l({ nl: "Te klein: er steken hokjes uit.", en: "Too small: some cells stick out." })
              : l({ nl: "Te groot: het vierkant is niet vol.", en: "Too big: the square is not full." })}
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <Btn onClick={() => setS((v) => Math.max(1, v - 1))} disabled={s <= 1} label={l({ nl: "Zijde kleiner", en: "Smaller side" })}>
          {l({ nl: "− zijde", en: "− side" })}
        </Btn>
        <Btn onClick={() => setS((v) => Math.min(maxSide, v + 1))} disabled={s >= maxSide} label={l({ nl: "Zijde groter", en: "Bigger side" })}>
          {l({ nl: "+ zijde", en: "+ side" })}
        </Btn>
      </div>
    </div>
  );
}
