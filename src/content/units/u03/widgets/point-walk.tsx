"use client";
/**
 * Reading a point (x, y): a marker walks from the origin, first sideways
 * (x, number colour), then up or down (y, accent colour). One button per
 * point.
 */
import { useState } from "react";
import { Btn, Say, UI, useLoc, useRepeat } from "./kit";
import { Dot, makeFrame, PlaneFrame, ptLabel } from "./frame";
import { numLabel, planeWindow, toNum } from "./model";

type Props = { points: Array<[number | string, number | string]> };

export function PointWalk({ props }: { props: Record<string, unknown> }) {
  const { l, locale } = useLoc();
  const pts = ((props as Props).points ?? []).map(([x, y]) => [toNum(x), toNum(y)] as [number, number]);
  const win = planeWindow(pts, 8);
  const f = makeFrame(win.x, win.y);
  const [target, setTarget] = useState<number | null>(null);
  const [phase, setPhase] = useState(0);
  const walk = useRepeat();

  const go = (i: number) => {
    setTarget(i);
    setPhase(0);
    walk.start(
      2,
      () => {
        setPhase((p) => p + 1);
        return true;
      },
      700,
    );
  };
  const reset = () => {
    walk.stop();
    setTarget(null);
    setPhase(0);
  };

  const t = target === null ? null : pts[target];
  const mx = t && phase >= 1 ? t[0] : 0;
  const my = t && phase >= 2 ? t[1] : 0;

  return (
    <div className="space-y-3">
      <PlaneFrame f={f} label={l({ nl: "Punten in een assenstelsel", en: "Points in a coordinate plane" })}>
        {t && (
          <g>
            <line x1={f.sx(0)} y1={f.sy(0)} x2={f.sx(mx)} y2={f.sy(0)} stroke="var(--c-num)" strokeWidth={4} className="transition-all duration-500 motion-reduce:transition-none" />
            <line x1={f.sx(mx)} y1={f.sy(0)} x2={f.sx(mx)} y2={f.sy(my)} stroke="var(--c-hl)" strokeWidth={4} className="transition-all duration-500 motion-reduce:transition-none" />
          </g>
        )}
        {pts.map(([x, y], i) => (
          <Dot key={i} f={f} x={x} y={y} label={ptLabel(x, y, locale)} hl={target === i && phase >= 2} />
        ))}
        {t && (
          <circle
            cx={0}
            cy={0}
            r={8}
            fill="none"
            stroke="var(--c-hl)"
            strokeWidth={3}
            className="transition-transform duration-500 ease-out motion-reduce:transition-none"
            style={{ transform: `translate(${f.sx(mx)}px, ${f.sy(my)}px)` }}
          />
        )}
      </PlaneFrame>
      <Say hl={phase >= 2}>
        {!t && l({ nl: "Kies een punt. Kijk hoe je er komt vanaf (0, 0).", en: "Choose a point. Watch how you get there from (0, 0)." })}
        {t &&
          phase >= 1 &&
          l({
            nl: `Eerst ${numLabel(Math.abs(t[0]), locale)} ${t[0] < 0 ? "naar links" : "naar rechts"}`,
            en: `First ${numLabel(Math.abs(t[0]), locale)} ${t[0] < 0 ? "to the left" : "to the right"}`,
          })}
        {t &&
          phase >= 2 &&
          l({
            nl: `, dan ${numLabel(Math.abs(t[1]), locale)} ${t[1] < 0 ? "omlaag" : "omhoog"}.`,
            en: `, then ${numLabel(Math.abs(t[1]), locale)} ${t[1] < 0 ? "down" : "up"}.`,
          })}
      </Say>
      <div className="flex flex-wrap justify-center gap-2">
        {pts.map(([x, y], i) => (
          <Btn key={i} onClick={() => go(i)} disabled={walk.running} pressed={target === i}>
            {ptLabel(x, y, locale)}
          </Btn>
        ))}
        <Btn quiet onClick={reset}>
          {l(UI.reset)}
        </Btn>
      </div>
    </div>
  );
}
