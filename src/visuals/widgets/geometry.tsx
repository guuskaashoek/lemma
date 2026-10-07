"use client";
/**
 * Geometry widgets: a right triangle with live SOS CAS TOA ratios,
 * squares on the sides for Pythagoras, and the unit circle.
 */
import { useState } from "react";
import { useT } from "@/i18n/client";
import { Formula, localizeDecimals } from "@/components/math";

const rad = (deg: number) => (deg * Math.PI) / 180;

/** Number formatting: `tex` for inside formulas, `text` for SVG labels. */
function useFmt() {
  const { locale } = useT();
  const tex = (v: number, d = 2) => localizeDecimals(v.toFixed(d), locale);
  const text = (v: number, d = 2) => tex(v, d).replace("{,}", ",");
  return { tex, text };
}

// ---------------------------------------------------------------------------
// Right triangle with SOS CAS TOA
// ---------------------------------------------------------------------------

export function RightTriangleWidget({
  angle: initial,
  show,
  interactive = true,
}: {
  angle: number;
  show: Array<"sin" | "cos" | "tan">;
  interactive?: boolean;
}) {
  const { t, locale } = useT();
  const { tex: fmt, text: fmtText } = useFmt();
  const [angle, setAngle] = useState(initial);
  // The hypotenuse has a fixed length of 10, so the ratios are easy to see.
  const hyp = 10;
  const opp = hyp * Math.sin(rad(angle));
  const adj = hyp * Math.cos(rad(angle));
  const S = 34; // pixels per unit
  const A = { x: 40, y: 400 };
  const C = { x: A.x + adj * S, y: A.y };
  const B = { x: C.x, y: A.y - opp * S };
  const words =
    locale === "nl"
      ? { opp: "overstaand", adj: "aanliggend", hyp: "schuin" }
      : { opp: "opposite", adj: "adjacent", hyp: "hypotenuse" };
  const rows = {
    sin: `\\sin(${angle}^{\\circ})=\\frac{\\text{${words.opp}}}{\\text{${words.hyp}}}=\\frac{${fmt(opp, 1)}}{10}\\approx ${fmt(opp / hyp)}`,
    cos: `\\cos(${angle}^{\\circ})=\\frac{\\text{${words.adj}}}{\\text{${words.hyp}}}=\\frac{${fmt(adj, 1)}}{10}\\approx ${fmt(adj / hyp)}`,
    tan: `\\tan(${angle}^{\\circ})=\\frac{\\text{${words.opp}}}{\\text{${words.adj}}}=\\frac{${fmt(opp, 1)}}{${fmt(adj, 1)}}\\approx ${fmt(opp / adj)}`,
  };

  return (
    <div className="space-y-3">
      <svg viewBox="0 0 440 430" className="mx-auto w-full max-w-md" role="img" aria-label={t("triangleAria")}>
        <polygon points={`${A.x},${A.y} ${C.x},${C.y} ${B.x},${B.y}`} fill="var(--surface-2)" stroke="var(--fg)" strokeWidth={2.5} style={{ transition: "all 200ms" }} />
        <polyline points={`${C.x - 16},${C.y} ${C.x - 16},${C.y - 16} ${C.x},${C.y - 16}`} fill="none" stroke="var(--fg)" />
        <path d={`M ${A.x + 46} ${A.y} A 46 46 0 0 0 ${A.x + 46 * Math.cos(rad(angle))} ${A.y - 46 * Math.sin(rad(angle))}`} fill="none" stroke="var(--c-hl)" strokeWidth={2.5} />
        <text x={A.x + 54} y={A.y - 10} fontSize={15} fill="var(--c-hl)">
          {angle}°
        </text>
        {/* Side labels: opposite (number colour), adjacent and hypotenuse. */}
        <text x={C.x + 8} y={(B.y + C.y) / 2} fontSize={14} fill="var(--fg)">
          {words.opp} {fmtText(opp, 1)}
        </text>
        <text x={(A.x + C.x) / 2} y={A.y + 22} textAnchor="middle" fontSize={14} fill="var(--fg)">
          {words.adj} {fmtText(adj, 1)}
        </text>
        <text x={(A.x + B.x) / 2 - 14} y={(A.y + B.y) / 2 - 10} textAnchor="end" fontSize={14} fill="var(--fg)">
          {words.hyp} 10
        </text>
      </svg>
      {interactive && (
        <label className="mx-auto flex max-w-md items-center gap-3">
          <span className="text-sm text-muted">{t("angle")}</span>
          <input type="range" min={5} max={85} value={angle} onChange={(e) => setAngle(Number(e.target.value))} className="flex-1" />
          <span className="w-12 text-right">{angle}°</span>
        </label>
      )}
      <div className="space-y-1 text-center text-lg">
        {show.map((k) => (
          <div key={k}>
            <Formula latex={rows[k]} />
          </div>
        ))}
      </div>
      {interactive && <p className="text-center text-sm text-muted">{t("triangleNote")}</p>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pythagoras: squares on the sides
// ---------------------------------------------------------------------------

export function PythagorasWidget({ a, b }: { a: number; b: number }) {
  const { t } = useT();
  const { tex: fmt } = useFmt();
  const [step, setStep] = useState(0);
  const c2 = a * a + b * b;
  const c = Math.sqrt(c2);
  const S = Math.min(28, 260 / (a + b + c));
  // Right angle at C; legs along the axes.
  const C = { x: 40 + b * S, y: 40 + (a + b) * S };
  const A = { x: C.x + a * S, y: C.y }; // leg a horizontal
  const B = { x: C.x, y: C.y - b * S }; // leg b vertical
  const sqA = `${C.x},${C.y} ${A.x},${A.y} ${A.x},${A.y + a * S} ${C.x},${C.y + a * S}`;
  const sqB = `${C.x},${C.y} ${B.x},${B.y} ${B.x - b * S},${B.y} ${C.x - b * S},${C.y}`;
  const dx = B.x - A.x;
  const dy = B.y - A.y;
  const sqC = `${A.x},${A.y} ${B.x},${B.y} ${B.x - dy},${B.y + dx} ${A.x - dy},${A.y + dx}`;
  const W = A.x + a * S + 40 + Math.abs(dy);
  const H = C.y + a * S + 40;
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-md" role="img" aria-label={t("pythagorasAria")}>
        <polygon points={sqA} fill="var(--c-num)" fillOpacity={step >= 1 ? 0.3 : 0.08} stroke="var(--fg)" />
        <polygon points={sqB} fill="var(--c-num)" fillOpacity={step >= 1 ? 0.3 : 0.08} stroke="var(--fg)" />
        <polygon points={sqC} fill="var(--c-hl)" fillOpacity={step >= 2 ? 0.3 : 0.06} stroke="var(--fg)" />
        <polygon points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`} fill="var(--bg)" stroke="var(--fg)" strokeWidth={2.5} />
        <text x={C.x + (a * S) / 2} y={C.y + (a * S) / 2 + 5} textAnchor="middle" fontSize={15} fill="var(--fg)">
          {a}² = {a * a}
        </text>
        <text x={C.x - (b * S) / 2} y={C.y - (b * S) / 2 + 5} textAnchor="middle" fontSize={15} fill="var(--fg)">
          {b}² = {b * b}
        </text>
        {step >= 2 && (
          <text x={(A.x + B.x) / 2 - dy / 2} y={(A.y + B.y) / 2 + dx / 2 + 5} textAnchor="middle" fontSize={15} fill="var(--fg)">
            {c2}
          </text>
        )}
      </svg>
      <div className="text-center text-xl">
        {step === 0 && <Formula latex={`a=${a},\\ b=${b},\\ c=?`} />}
        {step === 1 && <Formula latex={`a^2+b^2=${a * a}+${b * b}=${c2}`} />}
        {step >= 2 && <Formula latex={`c^2=${c2}\\ \\Rightarrow\\ c=\\sqrt{${c2}}${Number.isInteger(c) ? `=${c}` : `\\approx ${fmt(c)}`}`} />}
      </div>
      <div className="flex justify-center gap-2">
        <button onClick={() => setStep((s) => Math.min(2, s + 1))} disabled={step >= 2} className="rounded-lg border border-border-strong px-3 py-2 text-sm hover:border-fg disabled:opacity-40">
          {t("nextStep")}
        </button>
        <button onClick={() => setStep(0)} className="rounded-lg px-3 py-2 text-sm text-muted hover:text-fg">
          ↺ {t("startOver")}
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Unit circle
// ---------------------------------------------------------------------------

export function UnitCircleWidget({ angle: initial, unit, interactive = true }: { angle: number; unit: "deg" | "rad"; interactive?: boolean }) {
  const { t } = useT();
  const { tex: fmt } = useFmt();
  const [angle, setAngle] = useState(initial); // always stored in degrees
  const R = 150;
  const O = { x: 200, y: 190 };
  const P = { x: O.x + R * Math.cos(rad(angle)), y: O.y - R * Math.sin(rad(angle)) };
  const label = unit === "deg" ? `${angle}^{\\circ}` : `${fmt(rad(angle))}\\text{ rad}`;
  const large = angle % 360 > 180 ? 1 : 0;
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 400 380" className="mx-auto w-full max-w-sm" role="img" aria-label={t("unitCircleAria")}>
        <line x1={20} y1={O.y} x2={380} y2={O.y} stroke="var(--border-strong)" />
        <line x1={O.x} y1={20} x2={O.x} y2={360} stroke="var(--border-strong)" />
        <circle cx={O.x} cy={O.y} r={R} fill="none" stroke="var(--fg)" strokeWidth={2} />
        <path d={`M ${O.x + 40} ${O.y} A 40 40 0 ${large} 0 ${O.x + 40 * Math.cos(rad(angle))} ${O.y - 40 * Math.sin(rad(angle))}`} fill="none" stroke="var(--c-hl)" strokeWidth={2.5} />
        <line x1={O.x} y1={O.y} x2={P.x} y2={P.y} stroke="var(--fg)" strokeWidth={2} />
        {/* cos along the x-axis, sin vertical */}
        <line x1={O.x} y1={O.y} x2={P.x} y2={O.y} stroke="var(--c-num)" strokeWidth={4} />
        <line x1={P.x} y1={O.y} x2={P.x} y2={P.y} stroke="var(--c-var)" strokeWidth={4} />
        <circle cx={P.x} cy={P.y} r={8} fill="var(--c-hl)" />
      </svg>
      {interactive && (
        <label className="mx-auto flex max-w-sm items-center gap-3">
          <span className="text-sm text-muted">{t("angle")}</span>
          <input type="range" min={0} max={360} value={angle} onChange={(e) => setAngle(Number(e.target.value))} className="flex-1" />
        </label>
      )}
      <div className="space-y-1 text-center text-lg">
        <div>
          <Formula latex={`\\text{${t("angle")}}=${label}`} />
        </div>
        <div>
          <Formula latex={`\\cos=${fmt(Math.cos(rad(angle)))},\\quad \\sin=${fmt(Math.sin(rad(angle)))}`} />
        </div>
      </div>
      <p className="text-center text-sm text-muted">{t("unitCircleNote")}</p>
    </div>
  );
}
