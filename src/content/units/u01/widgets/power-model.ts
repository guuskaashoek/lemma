/**
 * Model behind the power-steps widget: where to draw the dots of base^n.
 *
 * base^0 is one dot. base^n is `base` copies of the picture of base^(n−1),
 * placed side by side (odd n) or below each other (even n). So 3^1 is a row,
 * 3^2 a square, 3^3 three squares, and so on. Dot i of base^(n−1) keeps
 * index i in base^n, so the old dots stay where they are when n grows.
 *
 * Pure functions, tested in `tests/units/u01-widgets.test.ts`.
 */

export type DotLayout = { points: Array<[number, number]>; w: number; h: number };

/** Dots of base^n in grid units (spacing 1, extra gaps between groups). */
export function powerDots(base: number, n: number): DotLayout {
  if (n <= 0) return { points: [[0, 0]], w: 1, h: 1 };
  const child = powerDots(base, n - 1);
  const gap = n <= 2 ? 0 : n <= 4 ? 0.7 : 1.4;
  const horizontal = n % 2 === 1;
  const points: Array<[number, number]> = [];
  for (let c = 0; c < base; c++) {
    const dx = horizontal ? c * (child.w + gap) : 0;
    const dy = horizontal ? 0 : c * (child.h + gap);
    for (const [x, y] of child.points) points.push([x + dx, y + dy]);
  }
  return {
    points,
    w: horizontal ? base * child.w + (base - 1) * gap : child.w,
    h: horizontal ? child.h : base * child.h + (base - 1) * gap,
  };
}

/** Exact value of base^n as a fraction [numerator, denominator]. */
export function powerValue(base: number, n: number): [number, number] {
  return n >= 0 ? [base ** n, 1] : [1, base ** -n];
}
