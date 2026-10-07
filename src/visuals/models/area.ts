/**
 * Area model: (a + b)(c + d) as a rectangle cut into parts. Each part's area
 * is the product of its row and column term. The sum of all parts is the
 * expanded expression; tests check that with the CAS.
 */
import { ce, parse } from "@/math/cas";

export type AreaCell = { row: number; col: number; latex: string };

/** Simplified LaTeX of row × column, e.g. ("x", "3") → "3x". */
export function cellProduct(row: string, col: string): string {
  return ce().box(["Multiply", parse(row).json as never, parse(col).json as never]).simplify().latex;
}

export function areaCells(rows: string[], cols: string[]): AreaCell[] {
  return rows.flatMap((r, i) => cols.map((c, j) => ({ row: i, col: j, latex: cellProduct(r, c) })));
}

/** Sum of all cells, combined: the expanded product. */
export function areaTotal(rows: string[], cols: string[]): string {
  const terms = areaCells(rows, cols).map((c) => parse(c.latex).json as never);
  return ce().box(["Add", ...terms]).simplify().latex;
}

/** The product written as brackets, e.g. "(x+2)(x+3)". */
export function areaProduct(rows: string[], cols: string[]): string {
  const group = (ts: string[]) => (ts.length === 1 ? ts[0] : `(${ts.join("+").replace(/\+-/g, "-")})`);
  return `${group(rows)}${group(cols)}`;
}
