"use client";
/**
 * "Stack the blocks in equal rows": every term is a pile of small blocks
 * (6x is six x-blocks). The learner picks a number of rows. When every pile
 * fits in that many rows exactly, the number of rows is a common factor:
 * 6x + 9 with 3 rows is 3 · 2x + 3 · 3 = 3(2x + 3).
 * When every term has an x, the x can come to the front as well.
 */
import { useState } from "react";
import { gcd } from "@/math/latex";
import { Btn, MOTION, Tex, UI, useLoc } from "./kit";

type Term = [number, string];

/** One power less of x: x^{2} → x, x → "" (a plain number). */
const lower = (v: string) => (v === "x^{2}" ? "x" : "");

/** LaTeX for coef · v, e.g. (2, "x") → 2x, (-1, "x") → -x, (3, "") → 3. */
function termTex(coef: number, v: string): string {
  if (v === "") return String(coef);
  if (coef === 1) return v;
  if (coef === -1) return `-${v}`;
  return `${coef}${v}`;
}

/** Sum of terms as LaTeX: 6x+9, 6x-9. */
function sumTex(terms: Term[]): string {
  return terms
    .map(([c, v], i) => {
      const t = termTex(c, v);
      return i === 0 || t.startsWith("-") ? t : `+${t}`;
    })
    .join("");
}

export function CommonHeight({ props }: { props: Record<string, unknown> }) {
  const terms = (props.terms as Term[]) ?? [];
  const { l } = useLoc();
  const max = Math.max(1, ...terms.map(([c]) => Math.abs(c)));
  const best = terms.reduce((g, [c]) => gcd(g, c), 0);
  const allX = terms.every(([, v]) => v !== "");
  const [rows, setRows] = useState(1);
  const [withX, setWithX] = useState(false);

  const fits = terms.map(([c]) => Math.abs(c) % rows === 0);
  const allFit = fits.every(Boolean);
  const outer = withX ? (rows === 1 ? "x" : `${rows}x`) : String(rows);
  const inner: Term[] = terms.map(([c, v]) => [c / rows, withX ? lower(v) : v]);

  // Drawing: each pile is a grid of `rows` rows, filled column by column.
  const cell = Math.max(14, Math.min(30, 260 / Math.max(6, Math.ceil(max / rows) * terms.length + 2)));
  const gap = cell * 1.4;
  const widths = terms.map(([c]) => Math.ceil(Math.abs(c) / rows) * cell + gap);
  const piles = terms.map(([c, v], ti) => {
    const n = Math.abs(c);
    const left = 10 + widths.slice(0, ti).reduce((s, w) => s + w, 0);
    return { c, v, n, cols: Math.ceil(n / rows), left, ti };
  });
  const W = Math.max(10 + widths.reduce((s, w) => s + w, 0), 200);
  const H = rows * cell + 40;

  return (
    <div className="space-y-4">
      <div className="text-center text-2xl">
        <Tex latex={sumTex(terms)} />
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-lg select-none" role="img" aria-label={l({ nl: "Blokjes in rijen", en: "Blocks in rows" })}>
        {piles.map((p) =>
          Array.from({ length: p.n }, (_, k) => {
            const col = Math.floor(k / rows);
            const row = k % rows;
            // Blocks in a column that is not full do not fit.
            const lastCol = col === p.cols - 1 && p.n % rows !== 0;
            const neg = p.c < 0;
            return (
              <g key={`${p.ti}-${k}`} className={MOTION} style={{ transform: `translate(${p.left + col * cell}px, ${10 + row * cell}px)` }}>
                <rect
                  width={cell - 3}
                  height={cell - 3}
                  rx={3}
                  fill={lastCol ? "none" : p.v ? "var(--c-var)" : "var(--c-num)"}
                  fillOpacity={neg ? 0 : 0.3}
                  stroke={lastCol ? "var(--c-hl)" : "var(--fg)"}
                  strokeWidth={lastCol ? 2.5 : 1.2}
                  strokeDasharray={neg || lastCol ? "4 3" : undefined}
                />
                {p.v && cell >= 18 && (
                  <text x={(cell - 3) / 2} y={(cell - 3) / 2 + 4} textAnchor="middle" fontSize={cell * 0.4} fill="var(--fg)">
                    {p.v === "x^{2}" ? "x²" : "x"}
                  </text>
                )}
              </g>
            );
          }),
        )}
        {piles.map((p) => (
          <text key={`l${p.ti}`} x={p.left} y={H - 8} fontSize={14} fill={fits[p.ti] ? "var(--fg)" : "var(--c-hl)"}>
            {fits[p.ti] ? `${p.cols} ${l({ nl: "per rij", en: "per row" })}` : l({ nl: "past niet", en: "does not fit" })}
          </text>
        ))}
      </svg>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <Btn onClick={() => setRows((r) => Math.max(1, r - 1))} disabled={rows <= 1} label={l({ nl: "Eén rij minder", en: "One row fewer" })}>
          −
        </Btn>
        <span className="min-w-28 text-center" aria-live="polite">
          {l({ nl: `${rows} ${rows === 1 ? "rij" : "rijen"}`, en: `${rows} ${rows === 1 ? "row" : "rows"}` })}
        </span>
        <Btn onClick={() => setRows((r) => Math.min(max, r + 1))} disabled={rows >= max} label={l({ nl: "Eén rij meer", en: "One row more" })}>
          +
        </Btn>
        {allX && (
          <Btn onClick={() => setWithX((w) => !w)} pressed={withX}>
            {l({ nl: "Ook x naar voren", en: "Also x to the front" })}
          </Btn>
        )}
        <Btn quiet onClick={() => { setRows(1); setWithX(false); }}>
          {l(UI.reset)}
        </Btn>
      </div>

      <div className="min-h-16 space-y-1 text-center text-xl" aria-live="polite">
        {allFit ? (
          <>
            <div>
              <Tex latex={`${sumTex(terms)}=${terms.map(([c, v], i) => `${i > 0 && c > 0 ? "+" : i > 0 ? "-" : c < 0 ? "-" : ""}\\hl{${outer}}\\cdot ${termTex(Math.abs(c) / rows, withX ? lower(v) : v)}`).join("")}=\\hl{${outer}}(${sumTex(inner)})`} />
            </div>
            <p className="text-base text-muted">
              {rows === Math.abs(best) && (!allX || withX)
                ? l({ nl: "Dit is het grootste wat eruit kan.", en: "This is the most you can take out." })
                : l({ nl: "Dit past. Kan het nog groter?", en: "This fits. Can it be bigger?" })}
            </p>
          </>
        ) : (
          <p className="text-base text-muted">
            {l({ nl: `Niet alles past in ${rows} rijen. Probeer een ander aantal.`, en: `Not everything fits in ${rows} rows. Try another number.` })}
          </p>
        )}
      </div>
    </div>
  );
}
