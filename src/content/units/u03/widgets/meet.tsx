"use client";
/**
 * Where do two lines meet? A walker moves along the x-axis. On every line
 * it marks the point above it and shows its y. Where the y-values are equal,
 * the lines cross: that is the intersection.
 *
 * With a single line the second "line" is the x-axis (y = 0), so the same
 * picture shows the intersection with the x-axis.
 */
import { useState } from "react";
import { Btn, Say, Tex, UI, useLoc, useRepeat } from "./kit";
import { AnimLine, Dot, makeFrame, PlaneFrame, ptLabel } from "./frame";
import { linTex, meet, numLabel, numTex, planeWindow, toNum, type Range } from "./model";

type LineProp = { a: number | string; b: number | string };
type Props = { lines: LineProp[]; start?: number; step?: number; x?: Range; y?: Range };

export function Meet({ props }: { props: Record<string, unknown> }) {
  const p = props as Props;
  const { l, locale } = useLoc();
  const lines = (p.lines ?? []).map((ln) => ({ a: toNum(ln.a), b: toNum(ln.b) }));
  const axis = lines.length === 1;
  const all = axis ? [...lines, { a: 0, b: 0 }] : lines;
  const target = meet(all[0].a, all[0].b, all[1].a, all[1].b);
  const step = p.step ?? 1;
  const startX = p.start ?? 0;
  const [x, setX] = useState(startX);
  const walk = useRepeat();

  const pts: Array<[number, number]> = [[startX, 0], ...lines.map((ln) => [0, ln.b] as [number, number])];
  if (target) pts.push(target);
  const win = planeWindow(pts, 10);
  const f = makeFrame(p.x ?? win.x, p.y ?? win.y);

  const ys = all.map((ln) => ln.a * x + ln.b);
  const hit = Math.abs(ys[0] - ys[1]) < 1e-9;
  const clampX = (v: number) => Math.max(f.x[0], Math.min(f.x[1], Math.round(v * 1e6) / 1e6));

  const go = (d: number) => {
    walk.stop();
    setX((v) => clampX(v + d * step));
  };
  const find = () => {
    if (!target) return;
    const steps = Math.round(Math.abs(target[0] - x) / step);
    const dir = target[0] > x ? 1 : -1;
    walk.start(
      steps,
      () => {
        setX((v) => clampX(v + dir * step));
        return true;
      },
      Math.max(90, Math.min(450, 3000 / Math.max(1, steps))),
    );
  };
  const reset = () => {
    walk.stop();
    setX(startX);
  };

  const names = axis ? ["y", "x\\text{-as}"] : ["y_1", "y_2"];

  return (
    <div className="space-y-3">
      <PlaneFrame f={f} label={l({ nl: "Twee lijnen en een wandelaar langs de x-as", en: "Two lines and a walker along the x-axis" })}>
        {lines.map((ln, i) => (
          <AnimLine key={i} f={f} a={ln.a} b={ln.b} dashed={i === 1} />
        ))}
        {axis && <line x1={0} y1={f.sy(0)} x2={f.W} y2={f.sy(0)} stroke="var(--c-hl)" strokeWidth={hit ? 4 : 0} />}
        <line
          x1={0}
          y1={0}
          x2={0}
          y2={f.H}
          stroke="var(--c-num)"
          strokeDasharray="5 5"
          strokeWidth={2}
          className="transition-transform duration-300 ease-out motion-reduce:transition-none"
          style={{ transform: `translateX(${f.sx(x)}px)` }}
        />
        {all.map((ln, i) => (axis && i === 1 ? null : <Dot key={i} f={f} x={x} y={ys[i]} hl={hit} r={hit ? 8 : 6} />))}
        {hit && <Dot f={f} x={x} y={ys[0]} hl r={8} label={ptLabel(x, ys[0], locale)} />}
      </PlaneFrame>

      <div className="mx-auto w-fit">
        <table className="border-collapse text-center text-lg">
          <tbody>
            <tr>
              <th className="border border-border-strong bg-surface-2 px-3 py-1">
                <Tex latex="x" />
              </th>
              <td className="min-w-16 border border-border-strong px-3 py-1">
                <Tex latex={numTex(x)} />
              </td>
            </tr>
            {lines.map((ln, i) => (
              <tr key={i}>
                <th className="border border-border-strong bg-surface-2 px-3 py-1">
                  <Tex latex={`${names[i]}=${linTex(ln.a, ln.b)}`} />
                </th>
                <td className="min-w-16 border border-border-strong px-3 py-1">
                  <Tex latex={hit ? `\\hl{${numTex(ys[i])}}` : numTex(ys[i])} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Say hl={hit}>
        {hit
          ? axis
            ? l({ nl: `Hier is y precies 0: het snijpunt met de x-as is ${ptLabel(x, 0, locale)}.`, en: `Here y is exactly 0: the intersection with the x-axis is ${ptLabel(x, 0, locale)}.` })
            : l({ nl: `Hier is y even groot op beide lijnen: het snijpunt is ${ptLabel(x, ys[0], locale)}.`, en: `Here y is the same on both lines: the intersection is ${ptLabel(x, ys[0], locale)}.` })
          : axis
            ? l({ nl: `Hier is y = ${numLabel(ys[0], locale)}. Zoek waar y = 0 is.`, en: `Here y = ${numLabel(ys[0], locale)}. Find where y = 0.` })
            : !target
              ? l({
                  nl: `Verschil tussen de lijnen: ${numLabel(Math.abs(ys[0] - ys[1]), locale)}. Het blijft overal even groot: de lijnen snijden elkaar nooit.`,
                  en: `Gap between the lines: ${numLabel(Math.abs(ys[0] - ys[1]), locale)}. It stays the same everywhere: the lines never cross.`,
                })
              : l({ nl: `Verschil tussen de lijnen: ${numLabel(Math.abs(ys[0] - ys[1]), locale)}. Zoek waar het 0 is.`, en: `Gap between the lines: ${numLabel(Math.abs(ys[0] - ys[1]), locale)}. Find where it is 0.` })}
      </Say>

      <div className="flex flex-wrap justify-center gap-2">
        <Btn onClick={() => go(-1)} label={l({ nl: "Naar links", en: "To the left" })}>
          ← <Tex latex={`${numTex(step)}`} />
        </Btn>
        <Btn onClick={() => go(1)} label={l({ nl: "Naar rechts", en: "To the right" })}>
          <Tex latex={`${numTex(step)}`} /> →
        </Btn>
        <Btn onClick={find} disabled={walk.running || hit || !target}>
          {l(UI.play)}
        </Btn>
        <Btn quiet onClick={reset}>
          {l(UI.reset)}
        </Btn>
      </div>
    </div>
  );
}
