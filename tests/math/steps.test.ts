/**
 * Tests for step-by-step validation of worked solutions.
 */
import { describe, expect, it } from "vitest";
import { validateSteps } from "@/math/steps";

describe("validateSteps", () => {
  it("accepts a correct calculation", () => {
    expect(validateSteps(["3+4\\cdot2", "3+\\hl{8}", "11"])).toEqual({ ok: true });
  });

  it("rejects a wrong calculation step", () => {
    const r = validateSteps(["3+4\\cdot2", "7\\cdot2", "14"]);
    expect(r).toMatchObject({ ok: false, index: 1 });
  });

  it("accepts a correctly solved equation", () => {
    const r = validateSteps(["2x+3=7", "2x=4", "x=2"], { solutions: [{ x: 2 }] });
    expect(r).toEqual({ ok: true });
  });

  it("rejects an equation step that changes the solution", () => {
    const r = validateSteps(["2x+3=7", "2x=10", "x=5"], { solutions: [{ x: 2 }] });
    expect(r).toMatchObject({ ok: false, index: 1 });
  });

  it("handles two solutions with 'or'", () => {
    const r = validateSteps(["x^2+x-6=0", "(x-2)(x+3)=0", "x-2=0 \\lor x+3=0", "x=2 \\lor x=-3"], {
      solutions: [{ x: 2 }, { x: -3 }],
    });
    expect(r).toEqual({ ok: true });
  });

  it("rejects a step that loses a solution", () => {
    const r = validateSteps(["x^2=9", "x=3"], { solutions: [{ x: 3 }, { x: -3 }] });
    expect(r).toMatchObject({ ok: false });
  });

  it("validates inequality steps, including flipping the sign", () => {
    expect(validateSteps(["-2x<6", "x>-3"])).toEqual({ ok: true });
    expect(validateSteps(["-2x<6", "x<-3"])).toMatchObject({ ok: false });
  });

  it("checks rearranging formulas with two variables", () => {
    expect(validateSteps(["y=2x+1", "y-1=2x", "x=\\frac{y-1}{2}"])).toEqual({ ok: true });
    expect(validateSteps(["y=2x+1", "y=2x-1"])).toMatchObject({ ok: false });
    expect(validateSteps(["y=2x+1", "x=\\frac{y+1}{2}"])).toMatchObject({ ok: false });
  });

  it("finds a wrong equation step even without known solutions", () => {
    expect(validateSteps(["3x-6=9", "3x=3"])).toMatchObject({ ok: false });
  });
});

describe("step checker speed", () => {
  it("stays fast for equations without roots in the scan range", () => {
    const t0 = performance.now();
    validateSteps(["\\tan(A^{\\circ})=\\frac{5}{8}", "A^{\\circ}=\\tan^{-1}\\left(\\frac{5}{8}\\right)"]);
    validateSteps(["e^{x}=1000", "x=\\ln(1000)"]);
    expect(performance.now() - t0).toBeLessThan(5000);
  });
});
