"use client";
/**
 * The machine, forwards and backwards (terugrekenen).
 *
 * Top row: the input goes through the steps of the formula, e.g. ×2 then +3.
 * Bottom row: the same machine backwards. Every step is undone (−3, then :2)
 * in the reverse order. A number travels along as a ball; with letters the
 * formula is built step by step, so you see `x = \frac{y-3}{2}` appear.
 */
import { useEffect, useRef, useState } from "react";
import { Btn, FADE, numText, Tex, TextWithTex, useLoc } from "./kit";
import { applyNumber, backwardChain, forwardChain, inverseOp, opLabel, type MOp } from "./models";

type Props = { ops: MOp[]; input: string; output: string; start?: number; target?: number };

const W = 720;
const ROW1 = 60;
const ROW2 = 170;

export function UndoMachine({ props }: { props: Record<string, unknown> }) {
  const { ops, input, output, start, target } = props as Props;
  const { l, locale } = useLoc();
  const n = ops.length;
  const [dir, setDir] = useState<"fwd" | "back" | null>(null);
  const [k, setK] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const nodes = n + 2;
  const nx = (i: number) => 60 + (i * (W - 120)) / (nodes - 1);

  const numbers = (from: number | undefined, list: MOp[]) => {
    const out: Array<number | null> = [from ?? null];
    for (const o of list) {
      const prev = out[out.length - 1];
      out.push(prev === null ? null : applyNumber(o, prev));
    }
    return out;
  };
  const fwdVals = numbers(start, ops);
  const backOps = [...ops].reverse().map(inverseOp);
  const backVals = numbers(target, backOps);
  const fwdTex = forwardChain(ops, input);
  const backTex = backwardChain(ops, output);

  const run = (d: "fwd" | "back") => {
    if (timer.current) clearTimeout(timer.current);
    setDir(d);
    setK(0);
    const go = (i: number) => {
      if (i > n) return;
      timer.current = setTimeout(() => {
        setK(i);
        go(i + 1);
      }, 900);
    };
    go(1);
  };
  const reset = () => {
    if (timer.current) clearTimeout(timer.current);
    setDir(null);
    setK(0);
  };

  // Where the ball is: node index along the row.
  const ballNode = dir === "fwd" ? (k === n ? n + 1 : k) : dir === "back" ? (k === n ? 0 : n + 1 - k) : 0;
  const value = dir === "fwd" ? fwdVals[k] : dir === "back" ? backVals[k] : null;
  const activeOp = dir === "fwd" ? k : dir === "back" ? n + 1 - k : -1; // node index of the op just done

  const box = (i: number, y: number, label: string, kind: "end" | "op", active: boolean, dim: boolean) => (
    <g key={`${y}-${i}`} className={FADE} style={{ opacity: dim ? 0.25 : 1 }}>
      {kind === "end" ? (
        <circle cx={nx(i)} cy={y} r={24} fill="transparent" stroke="var(--c-var)" strokeWidth={2.5} />
      ) : (
        <rect x={nx(i) - 34} y={y - 22} width={68} height={44} rx={10} fill={active ? "var(--c-hl)" : "transparent"} fillOpacity={0.2} stroke={active ? "var(--c-hl)" : "var(--fg)"} strokeWidth={active ? 3 : 2} />
      )}
      <text x={nx(i)} y={y + 6} textAnchor="middle" fontSize={18} fontStyle={kind === "end" ? "italic" : undefined} fill={kind === "end" ? "var(--c-var)" : "var(--fg)"}>
        {label}
      </text>
    </g>
  );
  const arrow = (i: number, y: number, back: boolean, dim: boolean) => {
    const x1 = nx(i) + 30;
    const x2 = nx(i + 1) - 30;
    return (
      <path
        key={`a${y}-${i}`}
        d={back ? `M ${x2} ${y} L ${x1} ${y} m 8 -6 l -8 6 l 8 6` : `M ${x1} ${y} L ${x2} ${y} m -8 -6 l 8 6 l -8 6`}
        fill="none"
        stroke="var(--border-strong)"
        strokeWidth={2}
        className={FADE}
        style={{ opacity: dim ? 0.25 : 1 }}
      />
    );
  };

  const showBack = dir === "back";
  const ballY = dir === "back" ? ROW2 : ROW1;
  const formula =
    dir === "back" ? (k === n ? `${input}=${backTex[n]}` : backTex[k]) : dir === "fwd" && k < n ? fwdTex[k] : `${output}=${fwdTex[n]}`;

  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} 220`} className="w-full select-none" role="img" aria-label={l({ nl: "Machine vooruit en achteruit", en: "Machine forwards and backwards" })}>
        {Array.from({ length: nodes - 1 }, (_, i) => arrow(i, ROW1, false, showBack))}
        {box(0, ROW1, input, "end", false, showBack)}
        {ops.map((o, i) => box(i + 1, ROW1, opLabel(o), "op", dir === "fwd" && activeOp === i + 1 && k > 0, showBack))}
        {box(n + 1, ROW1, output, "end", false, showBack)}

        <g className={FADE} style={{ opacity: showBack ? 1 : 0.15 }}>
          {Array.from({ length: nodes - 1 }, (_, i) => arrow(i, ROW2, true, false))}
          {box(0, ROW2, input, "end", false, false)}
          {ops.map((o, i) => box(i + 1, ROW2, opLabel(inverseOp(o)), "op", showBack && activeOp === i + 1 && k > 0, false))}
          {box(n + 1, ROW2, output, "end", false, false)}
        </g>

        {dir && value !== null && (
          <g style={{ transform: `translate(${nx(ballNode)}px, ${ballY - 44}px)` }} className="transition-transform duration-700 ease-in-out motion-reduce:transition-none">
            <circle r={17} fill="var(--c-num)" fillOpacity={0.2} stroke="var(--c-num)" strokeWidth={2} />
            <text y={6} textAnchor="middle" fontSize={15} fontWeight={700} fill="var(--c-num)">
              {numText(value, locale)}
            </text>
          </g>
        )}
      </svg>

      <div className="text-center text-2xl" aria-live="polite">
        <Tex latex={formula} />
      </div>
      <p className="min-h-7 text-center" aria-live="polite">
        <TextWithTex
          text={
            dir === "back"
              ? l({
                  nl: "Achteruit: elke stap ongedaan maken, van achter naar voren.",
                  en: "Backwards: undo every step, from last to first.",
                })
              : l({ nl: "Vooruit: de stappen van de formule, van links naar rechts.", en: "Forwards: the steps of the formula, from left to right." })
          }
        />
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <Btn onClick={() => run("fwd")}>{l({ nl: "▶ Vooruit", en: "▶ Forwards" })}</Btn>
        <Btn onClick={() => run("back")}>{l({ nl: "◀ Achteruit", en: "◀ Backwards" })}</Btn>
        <Btn quiet onClick={reset}>
          {l({ nl: "↺ Opnieuw", en: "↺ Start over" })}
        </Btn>
      </div>
    </div>
  );
}
