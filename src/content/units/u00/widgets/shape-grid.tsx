"use client";
/**
 * Shapes on a grid, for perimeter (omtrek) and area (oppervlakte).
 *
 * - rect: "walk around" draws the edge and counts the steps; "fill" lays
 *   unit squares row by row.
 * - triangle: the triangle sits inside a rectangle of base × height; the
 *   other half is shaded, so the triangle is half of the rectangle.
 * - circle: radius and diameter, then the edge is rolled out: it is a bit
 *   more than 3 diameters long (π · d).
 */
import { useState } from "react";
import { Btn, numText, Tex, UI, useLoc, useSteps } from "./kit";

type Props =
  | { shape: "rect"; w: number; h: number; unit: string }
  | { shape: "triangle"; b: number; h: number; top?: number; unit: string }
  | { shape: "circle"; r: number; unit: string };

export function ShapeGrid({ props }: { props: Record<string, unknown> }) {
  const p = props as Props;
  if (p.shape === "circle") return <CircleView r={p.r} unit={p.unit} />;
  if (p.shape === "triangle") return <TriangleView b={p.b} h={p.h} top={p.top ?? 0} unit={p.unit} />;
  return <RectView w={p.w} h={p.h} unit={p.unit} />;
}

/** Grid lines for a w × h area at scale s. */
function Grid({ w, h, s, x0, y0 }: { w: number; h: number; s: number; x0: number; y0: number }) {
  return (
    <g stroke="var(--border)" strokeWidth={1}>
      {Array.from({ length: w + 1 }, (_, i) => (
        <line key={`v${i}`} x1={x0 + i * s} y1={y0} x2={x0 + i * s} y2={y0 + h * s} />
      ))}
      {Array.from({ length: h + 1 }, (_, i) => (
        <line key={`h${i}`} x1={x0} y1={y0 + i * s} x2={x0 + w * s} y2={y0 + i * s} />
      ))}
    </g>
  );
}

function RectView({ w, h, unit }: { w: number; h: number; unit: string }) {
  const { l, locale } = useLoc();
  const [mode, setMode] = useState<"none" | "perimeter" | "area">("none");
  const rows = useSteps(h, Math.max(150, 1200 / h));
  const s = Math.min(34, 380 / Math.max(w, h));
  const x0 = 40;
  const y0 = 30;
  const W = x0 * 2 + w * s;
  const H = y0 + h * s + 50;
  const per = 2 * (w + h);
  const len = per * s;

  return (
    <div className="space-y-4">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-md select-none" role="img" aria-label={l({ nl: "Rechthoek op ruitjes", en: "Rectangle on a grid" })}>
        <Grid w={w} h={h} s={s} x0={x0} y0={y0} />
        {mode === "area" &&
          Array.from({ length: rows.step }, (_, r) =>
            Array.from({ length: w }, (_, c) => (
              <rect key={`${r}-${c}`} x={x0 + c * s + 2} y={y0 + r * s + 2} width={s - 4} height={s - 4} rx={3} fill="var(--c-num)" fillOpacity={0.55} />
            )),
          )}
        <rect x={x0} y={y0} width={w * s} height={h * s} fill="none" stroke="var(--fg)" strokeWidth={2.5} />
        {mode === "perimeter" && (
          <rect
            x={x0}
            y={y0}
            width={w * s}
            height={h * s}
            fill="none"
            stroke="var(--c-hl)"
            strokeWidth={6}
            strokeDasharray={len}
            className="motion-reduce:[animation:none]"
            style={{ strokeDashoffset: 0, animation: "u0-draw 2.4s ease-in-out" }}
          />
        )}
        <text x={x0 + (w * s) / 2} y={y0 + h * s + 26} textAnchor="middle" fontSize={16} fill="var(--c-num)">
          {w} {unit}
        </text>
        <text x={x0 - 10} y={y0 + (h * s) / 2} textAnchor="end" fontSize={16} fill="var(--c-num)">
          {h}
        </text>
        <style>{`@keyframes u0-draw { from { stroke-dashoffset: ${len}; } to { stroke-dashoffset: 0; } }`}</style>
      </svg>
      <div className="min-h-8 text-center text-xl" aria-live="polite">
        {mode === "perimeter" && <Tex latex={`${w}+${h}+${w}+${h}=${per}\\text{ ${unit}}`} />}
        {mode === "area" && (
          <Tex latex={rows.done ? `${h}\\cdot ${w}=${w * h}\\text{ ${unit}}^{2}` : `${rows.step}\\cdot ${w}=${rows.step * w}`} />
        )}
      </div>
      <p className="text-center text-sm text-muted">
        {mode === "perimeter"
          ? l({ nl: "Omtrek: de lengte van de rand. Je loopt één keer rond.", en: "Perimeter: the length of the edge. You walk around once." })
          : mode === "area"
            ? l({ nl: `Oppervlakte: hoeveel vakjes van 1 bij 1 ${unit} erin passen.`, en: `Area: how many 1 by 1 ${unit} squares fit inside.` })
            : l({ nl: `Een rechthoek van ${numText(w, locale)} bij ${numText(h, locale)} ${unit}.`, en: `A rectangle of ${numText(w, locale)} by ${numText(h, locale)} ${unit}.` })}
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <Btn
          onClick={() => {
            rows.reset();
            setMode("none");
            setTimeout(() => setMode("perimeter"), 30);
          }}
        >
          {l({ nl: "Loop de rand (omtrek)", en: "Walk the edge (perimeter)" })}
        </Btn>
        <Btn
          onClick={() => {
            setMode("area");
            rows.play();
          }}
        >
          {l({ nl: "Vul met vakjes (oppervlakte)", en: "Fill with squares (area)" })}
        </Btn>
        <Btn
          quiet
          onClick={() => {
            rows.reset();
            setMode("none");
          }}
        >
          {l(UI.reset)}
        </Btn>
      </div>
    </div>
  );
}

function TriangleView({ b, h, top, unit }: { b: number; h: number; top: number; unit: string }) {
  const { l } = useLoc();
  const { step, next, reset, play, playing, done } = useSteps(2, 1300);
  const s = Math.min(34, 380 / Math.max(b, h));
  const x0 = 40;
  const y0 = 30;
  const W = x0 * 2 + b * s;
  const H = y0 + h * s + 50;
  const A = { x: x0, y: y0 + h * s };
  const B = { x: x0 + b * s, y: y0 + h * s };
  const C = { x: x0 + top * s, y: y0 };

  return (
    <div className="space-y-4">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-md select-none" role="img" aria-label={l({ nl: "Driehoek op ruitjes", en: "Triangle on a grid" })}>
        <Grid w={b} h={h} s={s} x0={x0} y0={y0} />
        {/* The rectangle around the triangle. */}
        <rect x={x0} y={y0} width={b * s} height={h * s} fill="var(--c-var)" fillOpacity={step >= 2 ? 0.12 : 0} stroke="var(--fg)" strokeDasharray="7 5" strokeWidth={2} style={{ opacity: step >= 1 ? 1 : 0, transition: "opacity 500ms, fill-opacity 500ms" }} />
        <polygon points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`} fill="var(--c-num)" fillOpacity={0.5} stroke="var(--fg)" strokeWidth={2.5} />
        {/* Height line. */}
        <line x1={C.x} y1={C.y} x2={C.x} y2={A.y} stroke="var(--c-hl)" strokeWidth={2} strokeDasharray="4 4" />
        <text x={(A.x + B.x) / 2} y={A.y + 26} textAnchor="middle" fontSize={16} fill="var(--c-num)">
          {l({ nl: "basis", en: "base" })} {b} {unit}
        </text>
        <text x={C.x + 8} y={(C.y + A.y) / 2} fontSize={16} fill="var(--c-hl)">
          {l({ nl: "hoogte", en: "height" })} {h}
        </text>
      </svg>
      <div className="min-h-8 text-center text-xl" aria-live="polite">
        {step >= 1 && <Tex latex={`${l({ nl: "\\text{rechthoek}", en: "\\text{rectangle}" })}=${b}\\cdot ${h}=${b * h}`} />}
        {step >= 2 && (
          <div>
            <Tex latex={`${l({ nl: "\\text{driehoek}", en: "\\text{triangle}" })}=\\frac{1}{2}\\cdot ${b}\\cdot ${h}=${numText((b * h) / 2, "en")}`} />
          </div>
        )}
      </div>
      <p className="text-center text-sm text-muted">
        {step < 2
          ? l({ nl: "Zet een rechthoek om de driehoek.", en: "Put a rectangle around the triangle." })
          : l({ nl: "De driehoek is precies de helft van de rechthoek.", en: "The triangle is exactly half of the rectangle." })}
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

function CircleView({ r, unit }: { r: number; unit: string }) {
  const { l, locale } = useLoc();
  const { step, next, reset, play, playing, done } = useSteps(3, 1500);
  const R = 70;
  const O = { x: 110, y: 100 };
  const d = 2 * r;
  const lineY = 230;
  const lineX0 = 30;
  const unrolled = Math.PI * 2 * R;
  const W = Math.max(lineX0 + unrolled + 40, 300);

  return (
    <div className="space-y-4">
      <svg viewBox={`0 0 ${W} 270`} className="mx-auto w-full max-w-2xl select-none" role="img" aria-label={l({ nl: "Cirkel", en: "Circle" })}>
        <circle cx={O.x} cy={O.y} r={R} fill="var(--c-num)" fillOpacity={0.12} stroke="var(--fg)" strokeWidth={2.5} />
        <circle cx={O.x} cy={O.y} r={3} fill="var(--fg)" />
        {/* Radius, then diameter. */}
        <line x1={O.x} y1={O.y} x2={O.x + R} y2={O.y} stroke="var(--c-hl)" strokeWidth={3} />
        <text x={O.x + R / 2} y={O.y - 8} textAnchor="middle" fontSize={15} fill="var(--c-hl)">
          r = {numText(r, locale)}
        </text>
        <line x1={O.x - R} y1={O.y} x2={O.x} y2={O.y} stroke="var(--c-var)" strokeWidth={3} style={{ opacity: step >= 1 ? 1 : 0, transition: "opacity 500ms" }} />
        {step >= 1 && (
          <text x={O.x} y={O.y + 22} textAnchor="middle" fontSize={15} fill="var(--c-var)">
            d = {numText(d, locale)}
          </text>
        )}
        {/* r × r square: the area is about 3.14 of these. */}
        <rect x={O.x} y={O.y - R} width={R} height={R} fill="var(--c-hl)" fillOpacity={0.25} stroke="var(--c-hl)" style={{ opacity: step >= 3 ? 1 : 0, transition: "opacity 500ms" }} />
        {/* The edge rolled out on a line. */}
        <line
          x1={lineX0}
          y1={lineY}
          x2={lineX0 + unrolled}
          y2={lineY}
          stroke="var(--c-num)"
          strokeWidth={5}
          className="motion-reduce:transition-none"
          style={{ transform: `scaleX(${step >= 2 ? 1 : 0})`, transformOrigin: `${lineX0}px ${lineY}px`, transition: "transform 1200ms ease-out" }}
        />
        {step >= 2 &&
          [0, 1, 2, 3].map((i) => (
            <g key={i}>
              <line x1={lineX0 + i * 2 * R} y1={lineY - 10} x2={lineX0 + i * 2 * R} y2={lineY + 10} stroke="var(--c-var)" strokeWidth={2} />
              {i < 3 && (
                <text x={lineX0 + i * 2 * R + R} y={lineY - 12} textAnchor="middle" fontSize={13} fill="var(--c-var)">
                  d
                </text>
              )}
            </g>
          ))}
        <text x={W - 10} y={20} textAnchor="end" fontSize={12} fill="var(--muted)">
          {unit}
        </text>
      </svg>
      <div className="min-h-8 space-y-1 text-center text-xl" aria-live="polite">
        {step >= 2 && <Tex latex={`\\text{${l({ nl: "omtrek", en: "perimeter" })}}=\\pi\\cdot d=\\pi\\cdot ${d}\\approx ${numText(Math.PI * d, "en", 2)}`} />}
        {step >= 3 && (
          <div>
            <Tex latex={`\\text{${l({ nl: "oppervlakte", en: "area" })}}=\\pi\\cdot r^{2}=\\pi\\cdot ${r}^{2}\\approx ${numText(Math.PI * r * r, "en", 2)}`} />
          </div>
        )}
      </div>
      <p className="text-center text-sm text-muted">
        {step < 2
          ? l({ nl: "De diameter is twee keer de straal.", en: "The diameter is twice the radius." })
          : step < 3
            ? l({ nl: "De rand is iets meer dan 3 diameters lang: π ≈ 3,14 keer.", en: "The edge is a bit more than 3 diameters long: π ≈ 3.14 times." })
            : l({ nl: "Er passen ongeveer 3,14 van die vierkantjes r × r in de cirkel.", en: "About 3.14 of those r × r squares fit inside the circle." })}
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
