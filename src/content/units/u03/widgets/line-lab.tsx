"use client";
/**
 * Line lab: the line y = ax + b with buttons for a and b. The line turns
 * when a changes and slides up or down when b changes. The staircase shows
 * what a means: every step 1 to the right, a up (or down).
 *
 * Optional target: a point the line must pass through, or a dashed line to
 * copy. The widget says "Raak!" when the learner hits it.
 */
import { useState } from "react";
import { Btn, Say, Tex, UI, useLoc, useSteps } from "./kit";
import { AnimLine, Dot, makeFrame, PlaneFrame, ptLabel } from "./frame";
import { linTex, numLabel, planeWindow, stairs, toNum, type Range } from "./model";

type Props = {
  a: number | string;
  b: number | string;
  edit?: "a" | "b" | "both" | "none";
  aStep?: number;
  target?: { point?: [number, number]; a?: number | string; b?: number | string };
  stairs?: boolean;
  x?: Range;
  y?: Range;
};

const STEPS = 3;

export function LineLab({ props }: { props: Record<string, unknown> }) {
  const p = props as Props;
  const { l, locale } = useLoc();
  const edit = p.edit ?? "both";
  const aStep = p.aStep ?? 1;
  const [a, setA] = useState(toNum(p.a));
  const [b, setB] = useState(toNum(p.b));
  const st = useSteps(STEPS, 800);

  const tPoint = p.target?.point;
  const tLine = p.target?.a !== undefined && p.target?.b !== undefined ? { a: toNum(p.target.a), b: toNum(p.target.b) } : null;
  const needed: Array<[number, number]> = [[0, toNum(p.b)]];
  // With a point to hit and a fixed slope, the start value that hits it must fit too.
  if (tPoint) needed.push(tPoint, [0, tPoint[1] - toNum(p.a) * tPoint[0]]);
  if (tLine) needed.push([0, tLine.b]);
  const win = planeWindow(needed, 10);
  const f = makeFrame(p.x ?? win.x, p.y ?? win.y);

  const hit = tPoint
    ? Math.abs(a * tPoint[0] + b - tPoint[1]) < 1e-9
    : tLine
      ? Math.abs(a - tLine.a) < 1e-9 && Math.abs(b - tLine.b) < 1e-9
      : false;

  const change = (da: number, db: number) => {
    st.reset();
    setA((v) => Math.max(-8, Math.min(8, Math.round((v + da) * 1e6) / 1e6)));
    setB((v) => Math.max(f.y[0] + 1, Math.min(f.y[1] - 1, v + db)));
  };
  const reset = () => {
    st.reset();
    setA(toNum(p.a));
    setB(toNum(p.b));
  };

  const steps = stairs(a, b, 0, STEPS);
  const aText = numLabel(a, locale);
  const stepWord = a < 0 ? l({ nl: "omlaag", en: "down" }) : l({ nl: "omhoog", en: "up" });

  return (
    <div className="space-y-3">
      <PlaneFrame f={f} label={l({ nl: `De lijn y = ${linTex(a, b)}`, en: `The line y = ${linTex(a, b)}` })}>
        {tLine && <AnimLine f={f} a={tLine.a} b={tLine.b} dashed muted width={2.5} />}
        <AnimLine f={f} a={a} b={b} />
        {p.stairs &&
          steps.map((s, i) => (
            <g key={i} style={{ opacity: st.step > i ? 1 : 0 }} className="transition-opacity duration-300 motion-reduce:transition-none">
              <line x1={f.sx(s.from[0])} y1={f.sy(s.from[1])} x2={f.sx(s.corner[0])} y2={f.sy(s.corner[1])} stroke="var(--c-num)" strokeWidth={4} />
              <line x1={f.sx(s.corner[0])} y1={f.sy(s.corner[1])} x2={f.sx(s.to[0])} y2={f.sy(s.to[1])} stroke="var(--c-hl)" strokeWidth={4} />
              <text x={(f.sx(s.from[0]) + f.sx(s.corner[0])) / 2} y={f.sy(s.corner[1]) + (a < 0 ? -8 : 18)} textAnchor="middle" fontSize={14} fill="var(--c-num)">
                1
              </text>
              <text x={f.sx(s.corner[0]) + 6} y={(f.sy(s.corner[1]) + f.sy(s.to[1])) / 2 + 5} fontSize={14} fill="var(--c-hl)">
                {aText}
              </text>
            </g>
          ))}
        {tPoint && (
          <circle cx={f.sx(tPoint[0])} cy={f.sy(tPoint[1])} r={9} fill="none" stroke="var(--c-hl)" strokeWidth={3} />
        )}
        <Dot f={f} x={0} y={b} hl label={ptLabel(0, b, locale)} />
      </PlaneFrame>

      <p className="text-center text-2xl">
        <Tex latex={`y=${linTex(a, b)}`} />
      </p>

      {tPoint && (
        <Say hl={hit}>
          {hit
            ? l({ nl: `Raak! De lijn gaat door ${ptLabel(tPoint[0], tPoint[1], locale)}.`, en: `Hit! The line goes through ${ptLabel(tPoint[0], tPoint[1], locale)}.` })
            : l({ nl: `Schuif de lijn door het rondje ${ptLabel(tPoint[0], tPoint[1], locale)}.`, en: `Move the line through the circle ${ptLabel(tPoint[0], tPoint[1], locale)}.` })}
        </Say>
      )}
      {tLine && (
        <Say hl={hit}>
          {hit
            ? l({ nl: "Raak! Jouw lijn ligt precies op de stippellijn.", en: "Hit! Your line lies exactly on the dashed line." })
            : l({ nl: "Maak jouw lijn gelijk aan de stippellijn.", en: "Make your line match the dashed line." })}
        </Say>
      )}
      {p.stairs && st.step > 0 && (
        <Say>
          {a === 0
            ? l({ nl: "Elke stap: 1 naar rechts, en niet omhoog of omlaag. De lijn is vlak.", en: "Every step: 1 to the right, and not up or down. The line is flat." })
            : l({
                nl: `Elke stap: 1 naar rechts, dan ${numLabel(Math.abs(a), locale)} ${stepWord}.`,
                en: `Every step: 1 to the right, then ${numLabel(Math.abs(a), locale)} ${stepWord}.`,
              })}
        </Say>
      )}

      <div className="flex flex-wrap items-center justify-center gap-2">
        {(edit === "a" || edit === "both") && (
          <span className="flex items-center gap-1">
            <Btn onClick={() => change(-aStep, 0)} label={l({ nl: "a kleiner", en: "a smaller" })}>
              <Tex latex={`a-${aStep}`} />
            </Btn>
            <Btn onClick={() => change(aStep, 0)} label={l({ nl: "a groter", en: "a bigger" })}>
              <Tex latex={`a+${aStep}`} />
            </Btn>
          </span>
        )}
        {(edit === "b" || edit === "both") && (
          <span className="flex items-center gap-1">
            <Btn onClick={() => change(0, -1)} label={l({ nl: "b kleiner: lijn omlaag", en: "b smaller: line down" })}>
              <Tex latex="b-1" />
            </Btn>
            <Btn onClick={() => change(0, 1)} label={l({ nl: "b groter: lijn omhoog", en: "b bigger: line up" })}>
              <Tex latex="b+1" />
            </Btn>
          </span>
        )}
        {p.stairs && (
          <>
            <Btn onClick={st.next} disabled={st.done || st.playing}>
              {l({ nl: "Zet een stap", en: "Take a step" })}
            </Btn>
            <Btn onClick={st.play} disabled={st.playing}>
              {l(UI.play)}
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
