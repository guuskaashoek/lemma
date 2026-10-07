"use client";
/**
 * Formula → table → points → line. Every click fills in one more column of
 * the table and drops that point into the plane. Then the line is drawn
 * through the points, and the table shows that y grows by the same amount
 * at every step.
 */
import { Btn, Say, Tex, UI, useLoc, useSteps } from "./kit";
import { Dot, makeFrame, PlaneFrame } from "./frame";
import { linTex, numLabel, numTex, planeWindow, toNum } from "./model";

type Props = { a: number | string; b: number | string; xs: number[] };

export function TablePlot({ props }: { props: Record<string, unknown> }) {
  const p = props as Props;
  const { l, locale } = useLoc();
  const a = toNum(p.a);
  const b = toNum(p.b);
  const xs = (p.xs ?? [0, 1, 2, 3]).map((v) => toNum(v));
  const ys = xs.map((x) => a * x + b);
  const n = xs.length;
  const st = useSteps(n + 2, 900);
  const win = planeWindow(xs.map((x, i) => [x, ys[i]] as [number, number]), 8);
  const f = makeFrame(win.x, win.y);

  const x0 = f.x[0];
  const x1 = f.x[1];
  const len = Math.hypot(f.sx(x1) - f.sx(x0), f.sy(a * x1 + b) - f.sy(a * x0 + b));
  const lineShown = st.step >= n + 1;
  const diffShown = st.step >= n + 2;
  const dx = n > 1 ? xs[1] - xs[0] : 1;
  const sameStep = xs.every((x, i) => i === 0 || Math.abs(x - xs[i - 1] - dx) < 1e-9);

  return (
    <div className="space-y-3">
      <div className="mx-auto w-fit overflow-x-auto">
        <table className="border-collapse text-center text-lg">
          <tbody>
            <tr>
              <th className="border border-border-strong bg-surface-2 px-3 py-1">
                <Tex latex="x" />
              </th>
              {xs.map((x, i) => (
                <td key={i} className="min-w-12 border border-border-strong px-3 py-1">
                  <Tex latex={numTex(x)} />
                </td>
              ))}
            </tr>
            <tr>
              <th className="border border-border-strong bg-surface-2 px-3 py-1">
                <Tex latex="y" />
              </th>
              {ys.map((y, i) => (
                <td key={i} className={`min-w-12 border border-border-strong px-3 py-1 ${st.step === i + 1 ? "bg-surface-2" : ""}`}>
                  {st.step > i ? <Tex latex={st.step === i + 1 ? `\\hl{${numTex(y)}}` : numTex(y)} /> : <span className="text-muted">?</span>}
                </td>
              ))}
            </tr>
            {diffShown && sameStep && (
              <tr>
                <td />
                <td />
                {xs.slice(1).map((_, i) => (
                  <td key={i} className="px-1 pt-1 text-sm">
                    <Tex latex={`\\hl{${a * dx >= 0 ? "+" : ""}${numTex(a * dx)}}`} />
                  </td>
                ))}
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <PlaneFrame f={f} label={l({ nl: `Punten van y = ${linTex(a, b)}`, en: `Points of y = ${linTex(a, b)}` })}>
        <line
          x1={f.sx(x0)}
          y1={f.sy(a * x0 + b)}
          x2={f.sx(x1)}
          y2={f.sy(a * x1 + b)}
          stroke="var(--fg)"
          strokeWidth={3}
          strokeDasharray={len}
          strokeDashoffset={lineShown ? 0 : len}
          style={{ transition: "stroke-dashoffset 900ms ease-out" }}
          className="motion-reduce:transition-none"
        />
        {xs.map((x, i) =>
          st.step > i ? <Dot key={i} f={f} x={x} y={ys[i]} hl={st.step === i + 1} label={`(${numLabel(x, locale)}, ${numLabel(ys[i], locale)})`} /> : null,
        )}
      </PlaneFrame>

      <Say hl={diffShown}>
        {st.step === 0 && l({ nl: "Vul de tabel in. Elk getal wordt een punt.", en: "Fill in the table. Every number becomes a point." })}
        {st.step > 0 && st.step <= n && (
          <Tex latex={`y=${numTex(a)}\\cdot ${xs[st.step - 1] < 0 ? `(${numTex(xs[st.step - 1])})` : numTex(xs[st.step - 1])}${b < 0 ? "" : "+"}${numTex(b)}=\\hl{${numTex(ys[st.step - 1])}}`} />
        )}
        {st.step === n + 1 && l({ nl: "Alle punten liggen op één rechte lijn.", en: "All points lie on one straight line." })}
        {diffShown &&
          (sameStep
            ? l({
                nl: `Elke stap komt er ${numLabel(a * dx, locale)} bij. Steeds hetzelfde: daarom is het een rechte lijn.`,
                en: `Every step adds ${numLabel(a * dx, locale)}. Always the same: that is why it is a straight line.`,
              })
            : l({ nl: "Een rechte lijn.", en: "A straight line." }))}
      </Say>

      <div className="flex flex-wrap justify-center gap-2">
        <Btn onClick={st.next} disabled={st.done || st.playing}>
          {st.step < n ? l({ nl: "Volgend punt", en: "Next point" }) : l(UI.next)}
        </Btn>
        <Btn onClick={st.play} disabled={st.playing}>
          {l(UI.play)}
        </Btn>
        <Btn quiet onClick={st.reset}>
          {l(UI.reset)}
        </Btn>
      </div>
    </div>
  );
}
