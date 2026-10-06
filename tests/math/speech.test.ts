/**
 * Tests for spoken mathematics in Dutch and English.
 */
import { describe, expect, it } from "vitest";
import { latexToSpeech, richTextToSpeech } from "@/math/speech";

describe("latexToSpeech (nl)", () => {
  it.each([
    ["x^2+2x", "x kwadraat plus 2 x"],
    ["x^2-3x+2", "x kwadraat min 3 x plus 2"],
    ["\\frac{1}{2}", "een half"],
    ["\\frac{3}{4}", "3 vierde"],
    ["\\sqrt{16}", "de wortel van 16"],
    ["2{,}5", "2,5"],
    ["x(x+2)", "x keer haakje openen, x plus 2, haakje sluiten"],
    ["2x+3=7", "2 x plus 3 is gelijk aan 7"],
    ["\\sin(30)", "sinus 30"],
    ["x^5", "x tot de macht 5"],
    ["-3", "min 3"],
    ["12:4", "12 gedeeld door 4"],
    ["12\\div 4", "12 gedeeld door 4"],
    ["\\log_2(8)", "2-log van 8"],
  ])("%s → %s", (latex, words) => {
    expect(latexToSpeech(latex, "nl")).toBe(words);
  });
});

describe("latexToSpeech (en)", () => {
  it.each([
    ["x^2+2x", "x squared plus 2 x"],
    ["\\frac{1}{2}", "one half"],
    ["2{,}5", "2.5"],
    ["\\sqrt{16}", "the square root of 16"],
  ])("%s → %s", (latex, words) => {
    expect(latexToSpeech(latex, "en")).toBe(words);
  });
});

describe("richTextToSpeech", () => {
  it("reads text with inline formulas", () => {
    expect(richTextToSpeech("Bereken **eerst** $3\\cdot4$.", "nl")).toBe("Bereken eerst 3 keer 4.");
  });
});
