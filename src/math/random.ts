/**
 * Small seeded random number generator.
 *
 * Exercise generators must be reproducible: the same seed always gives the
 * same exercise. That makes failing tests easy to replay and lets a lesson be
 * resumed with the exact same questions.
 */

export type Rng = {
  /** Float in [0, 1). */
  next(): number;
  /** Integer in [min, max], both inclusive. */
  int(min: number, max: number): number;
  /** Integer in [min, max] that is not zero. */
  nonZeroInt(min: number, max: number): number;
  /** Random element of a non-empty array. */
  pick<T>(items: readonly T[]): T;
  /** New shuffled copy of an array. */
  shuffle<T>(items: readonly T[]): T[];
  /** `true` with probability `p`. */
  chance(p?: number): boolean;
  /** Random sign, -1 or 1. */
  sign(): 1 | -1;
};

/** Hashes any string to a 32-bit seed (FNV-1a). */
export function hashSeed(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Creates a generator from a numeric or string seed (mulberry32). */
export function createRng(seed: number | string): Rng {
  let state = typeof seed === "string" ? hashSeed(seed) : seed >>> 0;

  const next = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const int = (min: number, max: number) => {
    if (!Number.isInteger(min) || !Number.isInteger(max) || max < min) {
      throw new Error(`rng.int: invalid range [${min}, ${max}]`);
    }
    return min + Math.floor(next() * (max - min + 1));
  };

  return {
    next,
    int,
    nonZeroInt(min, max) {
      if (min === 0 && max === 0) throw new Error("rng.nonZeroInt: empty range");
      for (;;) {
        const n = int(min, max);
        if (n !== 0) return n;
      }
    },
    pick(items) {
      if (items.length === 0) throw new Error("rng.pick: empty array");
      return items[int(0, items.length - 1)];
    },
    shuffle(items) {
      const copy = [...items];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = int(0, i);
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    },
    chance(p = 0.5) {
      return next() < p;
    },
    sign() {
      return next() < 0.5 ? -1 : 1;
    },
  };
}
