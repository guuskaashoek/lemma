"use client";
/**
 * Algebra tiles. A tall block is one `x`, a small block is one `1`.
 * Minus-blocks are outlined and dashed (shape, not colour, shows the sign).
 *
 * Two modes:
 * - `combine`: the blocks slide into groups (x with x, number with number),
 *   a plus- and a minus-block cancel, and what is left is the short answer.
 * - `value`: choose what x is with the − and + buttons; every x-block shows
 *   that number and the total is worked out below.
 */
import { useMemo, useState } from "react";
import type { Loc } from "@/i18n/locale";
import { Btn, FADE, numText, SLIDE, StepButtons, Tex, TextWithTex, useLoc, useSteps } from "./kit";
import {
  combineTerms,
  filledLatex,
  monoText,
  termsLatex,
  TILE,
  tileLayout,
  tilesOf,
  tilesValue,
  zeroPairIds,
  type TileTerm,
} from "./models";

type Props = { terms: TileTerm[]; mode?: "combine" | "value"; x?: number };
type Phase = "written" | "sorted" | "cancelled" | "done";

const BASE = 104; // y of the tiles' bottom edge
const PHASE_TEXT: Record<string, Loc> = {
  written: { nl: "Elk groepje blokken is één term.", en: "Each group of blocks is one term." },
  sorted: { nl: "Sorteer: $x$ bij $x$, losse blokjes bij losse blokjes.", en: "Sort: $x$ with $x$, small blocks with small blocks." },
  cancelled: {
    nl: "Een plus-blok en een min-blok samen zijn $0$. Die vallen weg.",
    en: "A plus block and a minus block together make $0$. They disappear.",
  },
  done: { nl: "Tel wat er over is. Dat is het korte antwoord.", en: "Count what is left. That is the short answer." },
};

export function Tiles({ props }: { props: Record<string, unknown> }) {
  const { terms, mode = "combine", x: x0 = 2 } = props as Props;
  const { l, locale } = useLoc();
  const tiles = useMemo(() => tilesOf(terms), [terms]);
  const hasPairs = useMemo(() => zeroPairIds(tiles).size > 0, [tiles]);
  const phases = useMemo<Phase[]>(() => (hasPairs ? ["written", "sorted", "cancelled", "done"] : ["written", "sorted", "done"]), [hasPairs]);
  const steps = useSteps(phases.length - 1, 1300);
  const [xv, setXv] = useState(x0);

  const phase: Phase = mode === "value" ? "written" : phases[steps.step];
  const layout = tileLayout(tiles, phase === "done" ? (hasPairs ? "cancelled" : "sorted") : phase);
  const widths = (["written", "sorted", "cancelled"] as const).map((p) => tileLayout(tiles, p).width);
  const W = Math.max(...widths) + 40;
  const left = (W - layout.width) / 2;
  const sum = combineTerms(terms);
  const result = monoText([sum.x, 1], true);

  const tileShape = (kind: "x" | "1", neg: boolean) => {
    const h = kind === "x" ? TILE.xh : TILE.uh;
    const colour = kind === "x" ? "var(--c-var)" : "var(--c-num)";
    const label =
      kind === "x" ? (mode === "value" ? numText(neg ? -xv : xv, locale) : neg ? "−x" : "x") : neg ? "−" : "";
    return (
      <>
        <rect
          y={-h}
          width={TILE.w}
          height={h}
          rx={5}
          fill={neg ? "transparent" : colour}
          fillOpacity={0.2}
          stroke={colour}
          strokeWidth={2}
          strokeDasharray={neg ? "4 3" : undefined}
        />
        {label && (
          <text
            x={TILE.w / 2}
            y={-h / 2 + 5}
            textAnchor="middle"
            fontSize={kind === "x" && mode === "value" ? 13 : 15}
            fontStyle={kind === "x" && mode !== "value" ? "italic" : undefined}
            fill={kind === "x" && mode === "value" ? "var(--c-num)" : colour}
          >
            {label}
          </text>
        )}
      </>
    );
  };

  const formula =
    mode === "value"
      ? `${termsLatex(terms)}=${filledLatex(terms, xv)}=${tilesValue(terms, xv)}`
      : phase === "written"
        ? termsLatex(terms)
        : phase === "sorted"
          ? termsLatex([...terms.filter((t) => t[1] === "x"), ...terms.filter((t) => t[1] === "1")])
          : `${termsLatex(terms)}=${termsLatex([[sum.x, "x"], [sum.ones, "1"]].filter((t) => t[0] !== 0) as TileTerm[]) || "0"}`;

  return (
    <div className="space-y-4">
      <svg viewBox={`0 0 ${W} 130`} className="mx-auto w-full max-w-2xl select-none" role="img" aria-label={l({ nl: "Blokken", en: "Blocks" })}>
        {layout.groups.map((g, i) =>
          phase === "written" ? (
            <text key={`g${i}`} x={left + (g.from + g.to) / 2} y={18} textAnchor="middle" fontSize={15} fill="var(--fg)">
              {monoText([terms[g.term][0], terms[g.term][1] === "x" ? 1 : 0], g.term === 0)}
            </text>
          ) : null,
        )}
        {tiles.map((t) => {
          const p = layout.pos.get(t.id)!;
          return (
            <g key={t.id} className={SLIDE} style={{ transform: `translate(${left + p.x}px, ${BASE}px)` }}>
              <g className={FADE} style={{ opacity: p.visible ? 1 : 0 }}>
                {tileShape(t.kind, t.neg)}
              </g>
            </g>
          );
        })}
        {phase === "done" && (
          <text x={W / 2} y={126} textAnchor="middle" fontSize={15} fill="var(--c-hl)">
            {sum.x === 0 && sum.ones === 0 ? "0" : `${sum.x !== 0 ? result : ""}${sum.ones !== 0 ? monoText([sum.ones, 0], sum.x === 0) : ""}`}
          </text>
        )}
      </svg>

      <div className="text-center text-2xl" aria-live="polite">
        <Tex latex={formula} />
      </div>

      {mode === "value" ? (
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Btn onClick={() => setXv((v) => Math.max(-5, v - 1))} disabled={xv <= -5} label={l({ nl: "x kleiner", en: "x smaller" })}>
            −
          </Btn>
          <span className="min-w-20 text-center text-xl">
            <Tex latex={`x=${xv}`} />
          </span>
          <Btn onClick={() => setXv((v) => Math.min(10, v + 1))} disabled={xv >= 10} label={l({ nl: "x groter", en: "x larger" })}>
            +
          </Btn>
        </div>
      ) : (
        <>
          <p className="min-h-7 text-center" aria-live="polite">
            <TextWithTex text={l(PHASE_TEXT[phase])} />
          </p>
          <StepButtons s={steps} />
        </>
      )}
    </div>
  );
}
