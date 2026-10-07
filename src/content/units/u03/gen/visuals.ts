/**
 * Visual specs for the unit 3 widgets, built from exact parameters.
 * Fractions travel as strings ("2/3") so the widgets stay exact.
 */
import Fraction from "fraction.js";
import type { VisualSpec } from "@/visuals/types";
import { custom, fracStr, L, lin, pt, type Num } from "../helpers";

export const W = {
  lineLab: "u3.line-lab",
  tablePlot: "u3.table-plot",
  slopeWalk: "u3.slope-walk",
  meet: "u3.meet",
  shapeSystem: "u3.shape-system",
  pointWalk: "u3.point-walk",
} as const;

/** Points to walk to from the origin: first sideways, then up or down. */
export function pointWalkVisual(points: Array<[number, number]>): VisualSpec {
  return custom(
    W.pointWalk,
    { points },
    L(
      `Een assenstelsel met de punten ${points.map(([x, y]) => `$${pt(x, y)}$`).join(", ")}. Je loopt eerst opzij en dan omhoog of omlaag.`,
      `A coordinate plane with the points ${points.map(([x, y]) => `$${pt(x, y)}$`).join(", ")}. You walk sideways first, then up or down.`,
    ),
  );
}

/** The line lab with one line. */
export function lineLabVisual(
  a: Num,
  b: Num,
  opts: { edit?: "a" | "b" | "both" | "none"; start?: { a: Num; b: Num }; point?: [Num, Num]; stairs?: boolean } = {},
): VisualSpec {
  const start = opts.start ?? { a, b };
  const props: Record<string, unknown> = {
    a: fracStr(start.a),
    b: fracStr(start.b),
    edit: opts.edit ?? "none",
    stairs: opts.stairs ?? false,
  };
  if (opts.point) props.target = { point: [new Fraction(opts.point[0]).valueOf(), new Fraction(opts.point[1]).valueOf()] };
  else if (opts.start) props.target = { a: fracStr(a), b: fracStr(b) };
  const what = opts.point
    ? L(`De lijn moet door het punt $${pt(opts.point[0], opts.point[1])}$. Met knoppen schuif je de lijn.`, `The line must pass through the point $${pt(opts.point[0], opts.point[1])}$. Buttons move the line.`)
    : L(`De lijn $y=${lin(a, b)}$ met een trap: $1$ naar rechts, dan omhoog of omlaag.`, `The line $y=${lin(a, b)}$ with a staircase: $1$ to the right, then up or down.`);
  return custom(W.lineLab, props, what);
}

/** Table → points → line for `y = ax + b`. */
export function tablePlotVisual(a: Num, b: Num, xs: number[]): VisualSpec {
  return custom(
    W.tablePlot,
    { a: fracStr(a), b: fracStr(b), xs },
    L(
      `Een tabel bij $y=${lin(a, b)}$. Elke kolom wordt een punt. De punten liggen op een rechte lijn.`,
      `A table for $y=${lin(a, b)}$. Every column becomes a point. The points lie on a straight line.`,
    ),
  );
}

/** Slope triangle from A to B. */
export function slopeWalkVisual(A: [Num, Num], B: [Num, Num], opts: { movable?: boolean; intercept?: boolean; reveal?: boolean } = {}): VisualSpec {
  return custom(
    W.slopeWalk,
    {
      A: [fracStr(A[0]), fracStr(A[1])],
      B: [fracStr(B[0]), fracStr(B[1])],
      movable: opts.movable ?? false,
      intercept: opts.intercept ?? false,
      reveal: opts.reveal ?? true,
    },
    L(
      `Een hellingsdriehoek van $A${pt(A[0], A[1])}$ naar $B${pt(B[0], B[1])}$: eerst opzij, dan omhoog of omlaag.`,
      `A slope triangle from $A${pt(A[0], A[1])}$ to $B${pt(B[0], B[1])}$: first sideways, then up or down.`,
    ),
  );
}

/** Two lines (or one line and the x-axis) with a walker. */
export function meetVisual(lines: Array<{ a: Num; b: Num }>, start: number, step: Num = 1): VisualSpec {
  const what =
    lines.length === 1
      ? L(`De lijn $y=${lin(lines[0].a, lines[0].b)}$ en de $x$-as. Loop langs de $x$-as tot $y=0$.`, `The line $y=${lin(lines[0].a, lines[0].b)}$ and the $x$-axis. Walk along the $x$-axis until $y=0$.`)
      : L(
          `De lijnen $y=${lin(lines[0].a, lines[0].b)}$ en $y=${lin(lines[1].a, lines[1].b)}$. Loop langs de $x$-as tot ze even hoog zijn.`,
          `The lines $y=${lin(lines[0].a, lines[0].b)}$ and $y=${lin(lines[1].a, lines[1].b)}$. Walk along the $x$-axis until they are equally high.`,
        );
  return custom(
    W.meet,
    { lines: lines.map((ln) => ({ a: fracStr(ln.a), b: fracStr(ln.b) })), start, step: new Fraction(step).valueOf() },
    what,
  );
}

export type ShapeRowSpec = { x: number; y: number; c: number };

/** A system as rows of circles (x) and squares (y). */
export function shapeSystemVisual(r1: ShapeRowSpec, r2: ShapeRowSpec, mult?: [number, number]): VisualSpec {
  return custom(
    W.shapeSystem,
    mult && (mult[0] !== 1 || mult[1] !== 1) ? { r1, r2, mult } : { r1, r2 },
    L(
      "Twee rijen met rondjes en vierkantjes. Een rondje is $x$, een vierkantje is $y$. Tel de rijen op of trek ze af, zodat de vierkantjes wegvallen.",
      "Two rows of circles and squares. A circle is $x$, a square is $y$. Add or subtract the rows so the squares disappear.",
    ),
  );
}
