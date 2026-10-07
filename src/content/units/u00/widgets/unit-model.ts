/**
 * The metric staircase (het metriek trapje): units and their sizes.
 * Shared by the unit generator and the staircase widget.
 */
import Fraction from "fraction.js";

export type UnitKind = "length" | "mass" | "volume" | "area" | "cubic";

/** Units from big to small. One stair down is "times STEP". */
export const STAIRS: Record<UnitKind, string[]> = {
  length: ["km", "hm", "dam", "m", "dm", "cm", "mm"],
  mass: ["kg", "hg", "dag", "g", "dg", "cg", "mg"],
  volume: ["hL", "daL", "L", "dL", "cL", "mL"],
  area: ["km²", "hm²", "dam²", "m²", "dm²", "cm²", "mm²"],
  cubic: ["m³", "dm³", "cm³", "mm³"],
};

/** Factor for one stair. */
export const STEP: Record<UnitKind, number> = { length: 10, mass: 10, volume: 10, area: 100, cubic: 1000 };

/** Another name for the same unit, shown next to the stair. */
export const ALIAS: Partial<Record<string, string>> = { "dm³": "L", "cm³": "mL" };

/**
 * Size of a unit, in the base unit of its kind (m, g, L, m², m³). Written
 * out by hand from the definitions, so it is an independent check on the
 * stair counting.
 */
export const SIZE: Record<string, Fraction> = {
  km: new Fraction(1000),
  hm: new Fraction(100),
  dam: new Fraction(10),
  m: new Fraction(1),
  dm: new Fraction(1, 10),
  cm: new Fraction(1, 100),
  mm: new Fraction(1, 1000),
  kg: new Fraction(1000),
  hg: new Fraction(100),
  dag: new Fraction(10),
  g: new Fraction(1),
  dg: new Fraction(1, 10),
  cg: new Fraction(1, 100),
  mg: new Fraction(1, 1000),
  hL: new Fraction(100),
  daL: new Fraction(10),
  L: new Fraction(1),
  dL: new Fraction(1, 10),
  cL: new Fraction(1, 100),
  mL: new Fraction(1, 1000),
  "km²": new Fraction(1_000_000),
  "hm²": new Fraction(10_000),
  "dam²": new Fraction(100),
  "m²": new Fraction(1),
  "dm²": new Fraction(1, 100),
  "cm²": new Fraction(1, 10_000),
  "mm²": new Fraction(1, 1_000_000),
  "m³": new Fraction(1),
  "dm³": new Fraction(1, 1000),
  "cm³": new Fraction(1, 1_000_000),
  "mm³": new Fraction(1, 1_000_000_000),
};

/** LaTeX for a unit: `\text{ cm}^{2}`. */
export function unitLatex(u: string): string {
  const m = u.match(/^(.*?)([²³])?$/)!;
  const pow = m[2] === "²" ? "^{2}" : m[2] === "³" ? "^{3}" : "";
  return `\\text{ ${m[1]}}${pow}`;
}
