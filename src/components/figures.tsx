"use client";
/**
 * Diagrams shown with exercises. Drawn as plain SVG, in black and white,
 * with labels rendered by KaTeX so they match the formulas.
 */
import type { Figure } from "@/content/types";
import { useT } from "@/i18n/client";
import { renderLatex } from "./math";

/** A right triangle with the marked angle at the bottom left. */
function RightTriangle({ fig }: { fig: Extract<Figure, { kind: "right-triangle" }> }) {
  const { locale } = useT();
  // Drawn with a fixed, readable shape; the picture is not to scale.
  const W = 300;
  const H = 180;
  const A = { x: 30, y: H + 20 }; // marked angle
  const C = { x: 30 + W, y: H + 20 }; // right angle
  const B = { x: 30 + W, y: 20 };

  const label = (latex: string | undefined, x: number, y: number) =>
    latex ? (
      <foreignObject x={x - 60} y={y - 18} width={120} height={36}>
        <div
          className="flex h-full items-center justify-center text-lg"
          dangerouslySetInnerHTML={{ __html: renderLatex(latex, locale) }}
        />
      </foreignObject>
    ) : null;

  return (
    <svg viewBox={`0 0 ${W + 90} ${H + 60}`} className="mx-auto w-full max-w-md" role="img" aria-label="triangle">
      <polygon points={`${A.x},${A.y} ${C.x},${C.y} ${B.x},${B.y}`} fill="none" stroke="currentColor" strokeWidth={2} />
      {/* Right-angle marker at C. */}
      <polyline points={`${C.x - 16},${C.y} ${C.x - 16},${C.y - 16} ${C.x},${C.y - 16}`} fill="none" stroke="currentColor" strokeWidth={1.5} />
      {/* Angle arc at A. */}
      <path d={`M ${A.x + 44} ${A.y} A 44 44 0 0 0 ${A.x + 44 * Math.cos(0.54)} ${A.y - 44 * Math.sin(0.54)}`} fill="none" stroke="currentColor" strokeWidth={1.5} />
      {label(fig.angleLabel, A.x + 82, A.y - 16)}
      {label(fig.labels.adjacent, (A.x + C.x) / 2, A.y + 22)}
      {label(fig.labels.opposite, C.x + 34, (C.y + B.y) / 2)}
      {label(fig.labels.hypotenuse, (A.x + B.x) / 2 - 20, (A.y + B.y) / 2 - 18)}
    </svg>
  );
}

export function FigureView({ figure }: { figure: Figure }) {
  switch (figure.kind) {
    case "right-triangle":
      return <RightTriangle fig={figure} />;
  }
}
