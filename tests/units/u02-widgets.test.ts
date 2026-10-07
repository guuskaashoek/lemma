/**
 * Unit 2: every visual of the unit renders without errors, in both
 * languages. This covers the custom widgets and the built-in widgets with
 * this unit's parameters (lesson screens and generated exercises).
 */
import { createElement, type ReactNode } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { makeExercise } from "@/content/generators";
import type { Difficulty } from "@/content/types";
import { bundle } from "@/content/units/u02";
import { PrefsProvider, type ClientPrefs } from "@/i18n/client";
import type { Locale } from "@/i18n/locale";
import { Visual } from "@/visuals/visual";
import type { VisualSpec } from "@/visuals/types";

const lessonVisuals: Array<[string, VisualSpec]> = bundle.unit.lessons.flatMap((l) =>
  l.screens.flatMap((s, i) => ((s.kind === "visual" || s.kind === "example") && s.visual ? [[`${l.id} screen ${i}`, s.visual] as [string, VisualSpec]] : [])),
);

const exerciseVisuals: Array<[string, VisualSpec]> = bundle.generators.flatMap((g) =>
  ([1, 2, 3] as Difficulty[]).flatMap((d) =>
    Array.from({ length: 6 }, (_, i) => {
      const ex = makeExercise(g.id, d, `render-${i}`);
      return ex.visual ? [[`${g.id} d${d} #${i}`, ex.visual] as [string, VisualSpec]] : [];
    }).flat(),
  ),
);

function render(spec: VisualSpec, locale: Locale): string {
  // Children go in as an argument; the cast only satisfies the props type.
  const props = { value: { locale, ttsEnabled: false, ttsRate: 1 } } as { value: ClientPrefs; children: ReactNode };
  return renderToString(createElement(PrefsProvider, props, createElement(Visual, { spec })));
}

describe("u2 visuals render", () => {
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

  it("uses every custom widget somewhere", () => {
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
