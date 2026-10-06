/**
 * The calculator must agree with a school calculator.
 */
import { describe, expect, it } from "vitest";
import { CalcError, evaluate, formatResult } from "@/calculator/engine";

const deg = (s: string, ans?: number) => evaluate(s, { angle: "deg", ans });
const rad = (s: string) => evaluate(s, { angle: "rad" });

describe("calculator", () => {
  it.each([
    ["3+4*2", 11],
    ["(3+4)*2", 14],
    ["12:4", 3],
    ["12÷4", 3],
    ["2,5*2", 5],
    ["2.5×2", 5],
    ["-2^2", -4],
    ["(-2)^2", 4],
    ["2^3^2", 512],
    ["2^-1", 0.5],
    ["2π", 2 * Math.PI],
    ["3(4+1)", 15],
    ["(1+1)(2+2)", 8],
    ["√9+1", 4],
    ["sqrt(16)", 4],
    ["cbrt(27)", 3],
    ["5!", 120],
    ["50%", 0.5],
    ["3²", 9],
    ["log(1000)", 3],
    ["ln(e)", 1],
    ["sin(30)", 0.5],
    ["cos(60)", 0.5],
    ["tan(45)", 1],
    ["asin(0.5)", 30],
    ["2sin(30)", 1],
    ["(2+3", 5],
  ])("%s = %d (degrees)", (input, expected) => {
    expect(deg(input)).toBeCloseTo(expected, 10);
  });

  it("uses radians when asked", () => {
    expect(rad("sin(pi/2)")).toBeCloseTo(1, 12);
    expect(rad("cos(pi)")).toBeCloseTo(-1, 12);
  });

  it("uses the previous answer", () => {
    expect(deg("ans*2", 21)).toBe(42);
  });

  it.each([
    ["1/0", "divide-by-zero"],
    ["sqrt(-1)", "domain"],
    ["log(0)", "domain"],
    ["tan(90)", "domain"],
    ["asin(2)", "domain"],
    ["3+", "syntax"],
    ["", "empty"],
    ["2)", "syntax"],
    ["3.5!", "domain"],
  ])("%s gives error %s", (input, code) => {
    try {
      deg(input);
      expect.unreachable();
    } catch (e) {
      expect(e).toBeInstanceOf(CalcError);
      expect((e as CalcError).code).toBe(code);
    }
  });

  it("formats results without noise", () => {
    expect(formatResult(0.1 + 0.2, "nl")).toBe("0,3");
    expect(formatResult(0.1 + 0.2, "en")).toBe("0.3");
    expect(formatResult(1 / 3, "nl")).toBe("0,3333333333");
    expect(formatResult(123456789012, "en")).toBe("1.23456789·10^11");
  });
});
