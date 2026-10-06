/**
 * The mini examples in the calculator's button explanations must be right.
 */
import { describe, expect, it } from "vitest";
import { CALC_BUTTONS } from "@/calculator/buttons";
import { evaluate } from "@/calculator/engine";
import { roundHalfAwayFromZero } from "@/math/check";

const examples = CALC_BUTTONS.flat()
  .filter((b) => b.example && /[=≈]/.test(b.example))
  .map((b) => [b.label, b.example!] as const);

describe("calculator button examples", () => {
  it.each(examples)("%s: %s", (_label, example) => {
    const [lhs, rhs] = example.split(/\s*[=≈]\s*/);
    const expected = Number(rhs.replace(",", ".").replace("−", "-"));
    const value = evaluate(lhs, { angle: "deg" });
    if (example.includes("≈")) {
      const decimals = (rhs.split(/[,.]/)[1] ?? "").length;
      expect(roundHalfAwayFromZero(value, decimals)).toBe(expected);
    } else {
      expect(value).toBeCloseTo(expected, 10);
    }
  });

  it("every button has an explanation in both languages", () => {
    for (const b of CALC_BUTTONS.flat()) {
      expect(b.what.nl && b.what.en && b.when.nl && b.when.en, b.label).toBeTruthy();
    }
  });
});
