/**
 * The colour coding must never break a formula: everything that KaTeX can
 * render without colours must also render with colours.
 */
import { describe, expect, it } from "vitest";
import katex from "katex";
import { colorize, KATEX_OPTIONS } from "@/math/markup";

const render = (latex: string) =>
  katex.renderToString(latex, { ...KATEX_OPTIONS, macros: { ...KATEX_OPTIONS.macros }, throwOnError: true });

const samples = [
  "x^2+2x+1",
  "x^23",
  "\\frac12+\\frac{3}{4}",
  "\\sqrt[3]{8}",
  "\\sqrt2",
  "2{,}5\\cdot 4",
  "\\hl{3x}+2",
  "\\hl{\\frac{1}{2}}x",
  "\\text{opp} = 12\\text{ cm}^2",
  "\\sin(30^\\circ)=\\frac{\\text{overstaand}}{\\text{schuin}}",
  "\\left(x+1\\right)^{2}",
  "a_1+a_{12}",
  "\\log_2(8)",
  "x_{\\hl{1}}",
  "\\operatorname{sin}(x)",
];

describe("colorize", () => {
  it.each(samples)("renders %s", (latex) => {
    expect(() => render(latex)).not.toThrow();
    expect(() => render(colorize(latex))).not.toThrow();
  });

  it("marks variables, numbers and highlights", () => {
    const out = colorize("\\hl{3}x");
    expect(out).toContain("\\htmlClass{m-hl}");
    expect(out).toContain("\\htmlClass{m-var}{x}");
    expect(out).toContain("\\htmlClass{m-num}{3}");
  });

  it("does not colour text", () => {
    expect(colorize("\\text{cm}")).toBe("\\text{cm}");
  });
});
