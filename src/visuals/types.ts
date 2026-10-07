/**
 * Visual, interactive explanations ("widgets").
 *
 * A visual is described by plain data (`VisualSpec`). Generators build the
 * spec from their own random parameters, so a picture always matches its
 * exercise; numbers are never typed into a visual by hand.
 *
 * Design rules for every widget:
 * - Only the fixed colours: variable colour for x, number colour for numbers,
 *   accent colour for what changes. Positive/negative is shown by shape
 *   (filled vs. outlined, + / − marks), never by a new colour.
 * - Every interaction also works with the keyboard (buttons).
 * - Animations are short and respect `prefers-reduced-motion`.
 * - Every widget has a text description (`describeVisual`) for read-aloud.
 */
import type { Loc } from "@/i18n/locale";

export type VisualSpec =
  /** Balance for `ax + b = cx + d`. Learners take blocks away on both sides. */
  | { kind: "balance"; a: number; b: number; c?: number; d?: number }
  /** Number line with optional animated jumps, e.g. -3 + 5. */
  | {
      kind: "number-line";
      min: number;
      max: number;
      /** Where the walk starts. */
      start?: number;
      /** Jumps to animate one by one, e.g. [5, -2]. */
      jumps?: number[];
      /** Draw ticks for fractions with this denominator. */
      denominator?: number;
      marks?: Array<{ value: number; label?: string }>;
    }
  /** Fraction bars. Learners can split every part to see equal fractions. */
  | { kind: "fraction-bar"; bars: Array<{ num: number; den: number }>; allowSplit?: boolean }
  /**
   * Rectangle area model: (row terms) × (column terms). Used for expanding
   * brackets, multiplying numbers by parts and factorising.
   * Terms are LaTeX like "x", "3", "2x".
   */
  | { kind: "area-model"; rows: string[]; cols: string[]; reveal?: "step" | "all" }
  /** Coordinate plane with graphs, points, tangent lines and shaded areas. */
  | {
      kind: "plane";
      x: [number, number];
      y: [number, number];
      graphs?: Array<{ latex: string; label?: string }>;
      points?: Array<{ x: number; y: number; label?: string }>;
      /** Draggable point on graph 0 showing its coordinates (and slope). */
      tracer?: { graph: number; start: number; showSlope?: boolean };
      /** Slope triangle between two x-values on a graph. */
      slope?: { graph: number; from: number; to: number };
      /** Shaded area under a graph between two x-values. */
      area?: { graph: number; from: number; to: number };
    }
  /** Right triangle with an adjustable angle and live SOS CAS TOA ratios. */
  | { kind: "right-triangle"; angle: number; show: Array<"sin" | "cos" | "tan">; interactive?: boolean }
  /** Squares on the sides of a right triangle (Pythagoras). */
  | { kind: "pythagoras"; a: number; b: number }
  /** Unit circle with an angle you can turn; shows cos and sin. */
  | { kind: "unit-circle"; angle: number; unit: "deg" | "rad"; interactive?: boolean }
  /** Function machine: number in, rule, number out. */
  | { kind: "function-machine"; latex: string; inputs: number[] }
  /** A widget that belongs to one unit (registered in that unit's bundle). */
  | { kind: "custom"; widget: string; props: Record<string, unknown>; describe: Loc };

export type VisualKind = VisualSpec["kind"];
