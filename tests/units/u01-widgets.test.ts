/**
 * Unit 1: every visual of the unit renders without errors in both
 * languages, and the pure widget models behave.
 */
import { createElement, type ReactNode } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { makeExercise } from "@/content/generators";
import type { Difficulty } from "@/content/types";
import { bundle } from "@/content/units/u01";
import { powerDots, powerValue } from "@/content/units/u01/widgets/power-model";
import { shiftWindow } from "@/content/units/u01/widgets/shift-model";
import { chipValue, zeroPairFrames } from "@/content/units/u01/widgets/zero-pairs-model";
import { PrefsProvider, type ClientPrefs } from "@/i18n/client";
import type { Locale } from "@/i18n/locale";
import { Visual } from "@/visuals/visual";
import type { VisualSpec } from "@/visuals/types";

const lessonVisuals: Array<[string, VisualSpec]> = bundle.unit.lessons.flatMap((l) =>
  l.screens.flatMap((s, i) => ((s.kind === "visual" || s.kind === "example") && s.visual ? [[`${l.id} screen ${i}`, s.visual] as [string, VisualSpec]] : [])),
);

const exerciseVisuals: Array<[string, VisualSpec]> = bundle.generators.flatMap((g) =>
  ([1, 2, 3] as Difficulty[]).flatMap((d) =>
    Array.from({ length: 8 }, (_, i) => {
      const ex = makeExercise(g.id, d, `render-${i}`);
      return ex.visual ? [[`${g.id} d${d} #${i}`, ex.visual] as [string, VisualSpec]] : [];
    }).flat(),
  ),
);

function render(spec: VisualSpec, locale: Locale): string {
  const props = { value: { locale, ttsEnabled: false, ttsRate: 1 } } as { value: ClientPrefs; children: ReactNode };
  return renderToString(createElement(PrefsProvider, props, createElement(Visual, { spec })));
}

describe("u1 visuals render", () => {
  let errors: string[];
  beforeEach(() => {
    errors = [];
    vi.spyOn(console, "error").mockImplementation((...args: unknown[]) => {
      errors.push(args.map(String).join(" "));
    });
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("every custom widget is used somewhere", () => {
    const used = new Set([...lessonVisuals, ...exerciseVisuals].flatMap(([, v]) => (v.kind === "custom" ? [v.widget] : [])));
    expect([...used].sort()).toEqual(Object.keys(bundle.widgets ?? {}).sort());
  });

  it.each([...lessonVisuals, ...exerciseVisuals])("%s", (_, spec) => {
    for (const locale of ["nl", "en"] as Locale[]) {
      const html = render(spec, locale);
      expect(html.length).toBeGreaterThan(50);
      expect(html).not.toMatch(/NaN|undefined|Infinity/);
    }
    expect(errors).toEqual([]);
  });
});

describe("zero pairs model", () => {
  const cases: Array<[number, "+" | "-", number]> = [
    [3, "+", -5],
    [-2, "-", -5],
    [4, "-", 7],
    [-6, "+", 2],
    [0, "-", -3],
    [5, "-", -1],
  ];
  it.each(cases)("%i %s (%i) ends at the right value", (a, op, b) => {
    const frames = zeroPairFrames(a, op, b);
    const last = frames[frames.length - 1];
    expect(chipValue(last.chips)).toBe(op === "+" ? a + b : a - b);
    // Adding zero pairs never changes the value of a frame before taking away.
    expect(chipValue(frames[0].chips)).toBe(a);
    // Every chip id is unique within a frame.
    for (const f of frames) expect(new Set(f.chips.map((c) => c.id)).size).toBe(f.chips.length);
  });
});

describe("power dots model", () => {
  it.each([
    [2, 0],
    [2, 5],
    [3, 4],
    [5, 3],
    [10, 2],
  ])("%i^%i has the right number of distinct dots", (base, n) => {
    const { points } = powerDots(base, n);
    expect(points.length).toBe(base ** n);
    expect(new Set(points.map((p) => p.join(","))).size).toBe(points.length);
  });

  it("keeps the old dots in place when the exponent grows", () => {
    const a = powerDots(3, 2).points;
    const b = powerDots(3, 3).points;
    expect(b.slice(0, a.length)).toEqual(a);
  });

  it("gives fractions for negative exponents", () => {
    expect(powerValue(2, -3)).toEqual([1, 8]);
    expect(powerValue(5, 0)).toEqual([1, 1]);
  });
});

describe("decimal shift model", () => {
  it("45 000 becomes 4.5 · 10^4", () => {
    const w = shiftWindow(45, 3);
    expect(w.cells.map((c) => c.digit).join("")).toBe("45000");
    expect(w.front(4)).toBe("4.5");
    expect(w.isNormal(4)).toBe(true);
    expect(w.isNormal(3)).toBe(false);
  });

  it("0.00032 becomes 3.2 · 10^-4", () => {
    const w = shiftWindow(32, -5);
    expect(w.cells.map((c) => c.digit).join("")).toBe("000032");
    expect(w.front(-4)).toBe("3.2");
    expect(w.isNormal(-4)).toBe(true);
    expect(w.minK).toBe(-5);
    expect(w.maxK).toBe(0);
  });
});
