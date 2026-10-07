"use client";
/**
 * Area model: a rectangle with sides (row terms) and (column terms). Each
 * part is row × column. Revealing the parts one by one shows how expanding
 * brackets works; read backwards it shows factorising.
 */
import { useMemo, useState } from "react";
import { useT } from "@/i18n/client";
import { Formula } from "@/components/math";
import { areaCells, areaProduct, areaTotal } from "../models/area";

/** Drawn width of a side term: letters get more room than small numbers. */
const size = (term: string) => (/[a-z]/i.test(term) ? 170 : 70);

export function AreaModelWidget({ rows, cols, reveal = "step" }: { rows: string[]; cols: string[]; reveal?: "step" | "all" }) {
  const { t } = useT();
  const cells = useMemo(() => areaCells(rows, cols), [rows, cols]);
  const total = useMemo(() => areaTotal(rows, cols), [rows, cols]);
  const [shown, setShown] = useState(reveal === "all" ? cells.length : 0);

  const colW = cols.map(size);
  const rowH = rows.map(size);
  const W = colW.reduce((a, b) => a + b, 0);
  const H = rowH.reduce((a, b) => a + b, 0);
  const x0 = 70;
  const y0 = 50;
  const colX = colW.map((_, i) => x0 + colW.slice(0, i).reduce((a, b) => a + b, 0));
  const rowY = rowH.map((_, i) => y0 + rowH.slice(0, i).reduce((a, b) => a + b, 0));

  return (
    <div className="space-y-4">
      <div className="relative mx-auto" style={{ maxWidth: W + 100 }}>
        <svg viewBox={`0 0 ${W + 90} ${H + 70}`} className="w-full" role="img" aria-label={t("areaAria")}>
          {cells.map((c, i) => (
            <rect
              key={i}
              x={colX[c.col]}
              y={rowY[c.row]}
              width={colW[c.col]}
              height={rowH[c.row]}
              fill={i < shown ? (i === shown - 1 ? "var(--c-hl)" : "var(--surface-2)") : "transparent"}
              fillOpacity={i === shown - 1 ? 0.25 : 1}
              stroke="var(--fg)"
              strokeWidth={2}
              style={{ transition: "fill 300ms" }}
            />
          ))}
        </svg>
        {/* Labels as HTML so KaTeX can render them. */}
        {cols.map((c, j) => (
          <div key={`c${j}`} className="absolute text-xl" style={{ left: `${((colX[j] + colW[j] / 2) / (W + 90)) * 100}%`, top: 0, transform: "translateX(-50%)" }}>
            <Formula latex={c} />
          </div>
        ))}
        {rows.map((r, i) => (
          <div key={`r${i}`} className="absolute text-xl" style={{ left: 0, top: `${((rowY[i] + rowH[i] / 2) / (H + 70)) * 100}%`, transform: "translateY(-50%)" }}>
            <Formula latex={r} />
          </div>
        ))}
        {cells.slice(0, shown).map((c, i) => (
          <div
            key={`v${i}`}
            className="animate-in absolute text-xl"
            style={{
              left: `${((colX[c.col] + colW[c.col] / 2) / (W + 90)) * 100}%`,
              top: `${((rowY[c.row] + rowH[c.row] / 2) / (H + 70)) * 100}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            <Formula latex={c.latex} />
          </div>
        ))}
      </div>
      <div className="text-center text-xl">
        <Formula latex={`${areaProduct(rows, cols)}=${shown === cells.length ? total : "\\ldots"}`} display />
      </div>
      {reveal === "step" && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setShown((n) => Math.min(cells.length, n + 1))}
            disabled={shown >= cells.length}
            className="rounded-lg border border-border-strong px-3 py-2 text-sm hover:border-fg disabled:opacity-40"
          >
            {t("nextPart")}
          </button>
          <button onClick={() => setShown(0)} className="rounded-lg px-3 py-2 text-sm text-muted hover:text-fg">
            ↺ {t("startOver")}
          </button>
        </div>
      )}
    </div>
  );
}
