"use client";
/**
 * Slope triangle (hellingsdriehoek) between two points A and B.
 *
 * Step by step: first walk sideways from A (number colour), then up or down
 * to B (accent colour), then divide. With `movable`, B slides along the line:
 * the triangle grows or shrinks, but the division always gives the same
 * number. That number is the slope (richtingscoëfficiënt).
 */
import { useState } from "react";
import Fraction from "fraction.js";
import { Btn, Say, Tex, UI, useLoc, useSteps } from "./kit";
import { AnimLine, Dot, makeFrame, PlaneFrame } from "./frame";
import { numLabel, numTex, planeWindow, toFrac, type Range } from "./model";

type Props = {
  A: [number | string, number | string];
  B: [number | string, number | string];
  line?: boolean;
  movable?: boolean;
  intercept?: boolean;
  /** false: the last step shows the division with a "?" instead of the answer. */
  reveal?: boolean;
  x?: Range;
  y?: Range;
};

export function SlopeWalk({ props }: { props: Record<string, unknown> }) {
  const p = props as Props;
  const { l, locale } = useLoc();
  const ax = toFrac(p.A[0]);
  const ay = toFrac(p.A[1]);
  const bx0 = toFrac(p.B[0]);
  const by0 = toFrac(p.B[1]);
  const slope = bx0.equals(ax) ? new Fraction(0) : by0.sub(ay).div(bx0.sub(ax));
  const icpt = ay.sub(slope.mul(ax));
  const [bx, setBx] = useState(bx0);
  const by = slope.mul(bx).add(icpt);
  const last = p.intercept ? 4 : 3;
  const st = useSteps(last, 1000);

  const pts: Array<[number, number]> = [
    [ax.valueOf(), ay.valueOf()],
    [bx0.valueOf(), by0.valueOf()],
  ];
  if (p.intercept) pts.push([0, icpt.valueOf()]);
  const win = planeWindow(pts, 8);
  const f = makeFrame(p.x ?? win.x, p.y ?? win.y);

  const dx = bx.sub(ax);
  const dy = by.sub(ay);
  const [Ax, Ay, Bx, By] = [ax.valueOf(), ay.valueOf(), bx.valueOf(), by.valueOf()];
  const n = (v: Fraction) => numLabel(v.valueOf(), locale);

  const move = (d: number) => {
    let next = bx.add(d);
    if (next.equals(ax)) next = next.add(d);
    if (next.valueOf() < f.x[0] + 0.5 || next.valueOf() > f.x[1] - 0.5) return;
    const ny = slope.mul(next).add(icpt).valueOf();
    if (ny < f.y[0] + 0.5 || ny > f.y[1] - 0.5) return;
    setBx(next);
    st.setStep(3);
  };
  const reset = () => {
    st.reset();
    setBx(bx0);
  };

  const side = dx.s < 0 ? l({ nl: "naar links", en: "to the left" }) : l({ nl: "naar rechts", en: "to the right" });
  const upDown = dy.s < 0 ? l({ nl: "omlaag", en: "down" }) : l({ nl: "omhoog", en: "up" });

  return (
    <div className="space-y-3">
      <PlaneFrame f={f} label={l({ nl: "Een hellingsdriehoek tussen A en B", en: "A slope triangle between A and B" })}>
        {p.line !== false && <AnimLine f={f} a={slope.valueOf()} b={icpt.valueOf()} muted width={2} />}
        <g style={{ opacity: st.step >= 1 ? 1 : 0 }} className="transition-opacity duration-300 motion-reduce:transition-none">
          <line x1={f.sx(Ax)} y1={f.sy(Ay)} x2={f.sx(Bx)} y2={f.sy(Ay)} stroke="var(--c-num)" strokeWidth={4} className="transition-all duration-500 motion-reduce:transition-none" />
          <text x={(f.sx(Ax) + f.sx(Bx)) / 2} y={f.sy(Ay) + (dy.s < 0 ? -10 : 20)} textAnchor="middle" fontSize={15} fill="var(--c-num)">
            {n(dx.abs())}
          </text>
        </g>
        <g style={{ opacity: st.step >= 2 ? 1 : 0 }} className="transition-opacity duration-300 motion-reduce:transition-none">
          <line x1={f.sx(Bx)} y1={f.sy(Ay)} x2={f.sx(Bx)} y2={f.sy(By)} stroke="var(--c-hl)" strokeWidth={4} className="transition-all duration-500 motion-reduce:transition-none" />
          <text x={f.sx(Bx) + (dx.s < 0 ? -8 : 8)} y={(f.sy(Ay) + f.sy(By)) / 2 + 5} textAnchor={dx.s < 0 ? "end" : "start"} fontSize={15} fill="var(--c-hl)">
            {n(dy.abs())}
          </text>
        </g>
        {p.intercept && p.reveal !== false && st.step >= 4 && <Dot f={f} x={0} y={icpt.valueOf()} hl label={`b = ${n(icpt)}`} />}
        <Dot f={f} x={Ax} y={Ay} label="A" />
        <Dot f={f} x={Bx} y={By} label="B" />
      </PlaneFrame>

      <Say hl={st.step >= 3}>
        {st.step === 0 && l({ nl: "Loop van A naar B: eerst opzij, dan omhoog of omlaag.", en: "Walk from A to B: first sideways, then up or down." })}
        {st.step === 1 && l({ nl: `Opzij: ${n(dx.abs())} ${side}.`, en: `Sideways: ${n(dx.abs())} ${side}.` })}
        {st.step === 2 && l({ nl: `Dan ${n(dy.abs())} ${upDown}.`, en: `Then ${n(dy.abs())} ${upDown}.` })}
        {st.step === 3 && (
          <Tex
            latex={`a=\\frac{\\hl{${numTex(dy.valueOf())}}}{${numTex(dx.valueOf())}}=${p.reveal === false ? "\\,?" : numTex(slope.valueOf())}`}
          />
        )}
        {st.step === 4 && p.reveal === false && l({ nl: "Loop over de lijn naar de y-as. Waar kom je uit?", en: "Walk along the line to the y-axis. Where do you end up?" })}
        {st.step === 4 && p.reveal !== false && l({ nl: `Waar de lijn de y-as snijdt: b = ${n(icpt)}.`, en: `Where the line crosses the y-axis: b = ${n(icpt)}.` })}
      </Say>
      {p.movable && st.step >= 3 && (
        <p className="text-center text-sm text-muted">
          {l({ nl: "Schuif B over de lijn. Wat gebeurt er met de deling?", en: "Slide B along the line. What happens to the division?" })}
        </p>
      )}

      <div className="flex flex-wrap justify-center gap-2">
        <Btn onClick={st.next} disabled={st.done || st.playing}>
          {l(UI.next)}
        </Btn>
        <Btn onClick={st.play} disabled={st.playing}>
          {l(UI.play)}
        </Btn>
        {p.movable && (
          <>
            <Btn onClick={() => move(-1)} label={l({ nl: "B naar links", en: "B to the left" })}>
              ← B
            </Btn>
            <Btn onClick={() => move(1)} label={l({ nl: "B naar rechts", en: "B to the right" })}>
              B →
            </Btn>
          </>
        )}
        <Btn quiet onClick={reset}>
          {l(UI.reset)}
        </Btn>
      </div>
    </div>
  );
}
