/**
 * Model behind the decimal-shift widget. The number is digits · 10^shift.
 * Every digit has a fixed place value (its power of ten); only the decimal
 * point moves. With the point after the digit of power k, the number reads
 * a · 10^k.
 *
 * Pure functions, tested in `tests/units/u01-widgets.test.ts`.
 */
import { decimalString, grouped } from "../helpers";

export type ShiftCell = { power: number; digit: string };

export function shiftWindow(digits: number, shift: number) {
  const d = String(digits);
  const top = shift + d.length - 1;
  const hi = Math.max(0, top);
  const lo = Math.min(0, shift);
  const cells: ShiftCell[] = [];
  for (let p = hi; p >= lo; p--) {
    const i = top - p;
    cells.push({ power: p, digit: i >= 0 && i < d.length ? d[i] : "0" });
  }
  return {
    cells,
    minK: lo,
    maxK: hi,
    /** The number itself, with thin spaces in big numbers. */
    plain: grouped(decimalString(digits, shift)),
    /** The front number a when the point is after power k. */
    front: (k: number) => decimalString(digits, shift - k),
    /** Is a · 10^k proper scientific notation (1 ≤ a < 10)? */
    isNormal: (k: number) => k === top,
    /** Is this cell part of how a is written for this k? */
    shown: (power: number, k: number) => power <= Math.max(top, k) && power >= Math.min(shift, k),
  };
}
