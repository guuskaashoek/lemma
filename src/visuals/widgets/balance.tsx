"use client";
/**
 * Interactive balance for linear equations.
 *
 * - Click a block to take it off that pan. Do it on one side only and the
 *   balance tips; do the same on the other side and it levels again.
 * - Buttons do an operation on both sides at once (keyboard friendly).
 * - "Show me" plays the whole balance method step by step.
 * The equation under the picture always shows the current state.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { useT } from "@/i18n/client";
import {
  applyOneSide,
  applyOp,
  balanceLatex,
  initBalance,
  opText,
  solution,
  solveOps,
  tilt,
  type BalanceOp,
  type BalanceState,
  type Pan,
} from "../models/balance";
import { Formula, Inline } from "@/components/math";

const W = 720;
const PIVOT = { x: 360, y: 70 };
const HALF = 250;
const PAN_W = 210;

/** Slot positions for blocks inside a pan (relative to the pan's top-left). */
function layoutPan(p: Pan) {
  const xs = Array.from({ length: Math.max(0, Math.round(p.x)) }, (_, i) => ({
    key: `x${i}`,
    x: 30 + (i % 2) * 40,
    y: -40 - Math.floor(i / 2) * 40,
  }));
  const n = Math.abs(Math.round(p.ones));
  const tens = Math.floor(n / 10);
  const units = n % 10;
  const bars = Array.from({ length: tens }, (_, i) => ({ key: `t${i}`, x: 118 + i * 14, y: -62 }));
  const cubes = Array.from({ length: units }, (_, i) => ({
    key: `u${i}`,
    x: 112 + (i % 4) * 20,
    y: -20 - Math.floor(i / 4) * 20 - (tens > 0 ? 66 : 0),
  }));
  return { xs, bars, cubes, negative: p.ones < 0 };
}

export function BalanceWidget({ a, b, c = 0, d = 0 }: { a: number; b: number; c?: number; d?: number }) {
  const { t, l } = useT();
  const start = useMemo(() => initBalance(a, b, c, d), [a, b, c, d]);
  const xValue = useMemo(() => solution(start)?.valueOf() ?? 0, [start]);
  const [state, setState] = useState<BalanceState>(start);
  const [message, setMessage] = useState<string>("");
  const [lastChanged, setLastChanged] = useState<"left" | "right" | "both" | null>(null);
  const [playing, setPlaying] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const tipped = tilt(state, xValue);
  const done = state.left.x === 1 && state.left.ones === 0 && state.right.x === 0 && tipped === 0;
  const angle = tipped * 7; // degrees

  const doBoth = (op: BalanceOp) => {
    setState((s) => applyOp(s, op));
    setLastChanged("both");
    setMessage(l(opText(op)));
  };

  // Clicking a block removes it from that pan only.
  const takeOne = (side: "left" | "right", kind: "x" | "one") => {
    if (playing) return;
    const pan = state[side];
    const op: BalanceOp =
      kind === "x" ? { kind: "subtract-x", amount: 1 } : pan.ones > 0 ? { kind: "subtract-ones", amount: 1 } : { kind: "add-ones", amount: 1 };
    const next = applyOneSide(state, side, op);
    setState(next);
    setLastChanged(side);
    setMessage(
      tilt(next, xValue) === 0
        ? t("balanceLevel")
        : side === "left"
          ? t("balanceTippedRight")
          : t("balanceTippedLeft"),
    );
  };

  const reset = () => {
    if (timer.current) clearTimeout(timer.current);
    setPlaying(false);
    setState(start);
    setLastChanged(null);
    setMessage("");
  };

  const play = () => {
    reset();
    setPlaying(true);
    const ops = solveOps(start);
    let s = start;
    const run = (i: number) => {
      if (i >= ops.length) {
        setPlaying(false);
        return;
      }
      timer.current = setTimeout(() => {
        s = applyOp(s, ops[i]);
        setState(s);
        setLastChanged("both");
        setMessage(l(opText(ops[i])));
        run(i + 1);
      }, i === 0 ? 400 : 1600);
    };
    run(0);
  };

  // Buttons for operations on both sides, only when they make sense.
  const ops: BalanceOp[] = [];
  if (state.left.ones > 0 || state.right.ones > 0) ops.push({ kind: "subtract-ones", amount: 1 });
  if (state.left.x > 0 && state.right.x > 0) ops.push({ kind: "subtract-x", amount: 1 });
  if (state.left.ones === 0 && state.right.x === 0 && state.left.x > 1 && Number.isInteger(state.right.ones / state.left.x)) {
    ops.push({ kind: "divide", by: state.left.x });
  }

  const panX = (side: -1 | 1) => PIVOT.x + side * HALF * Math.cos((angle * Math.PI) / 180);
  const panY = (side: -1 | 1) => PIVOT.y + side * HALF * Math.sin((angle * Math.PI) / 180);

  const renderPan = (side: "left" | "right") => {
    const dir = side === "left" ? -1 : 1;
    const cx = panX(dir);
    const cy = panY(dir) + 150;
    const layout = layoutPan(state[side]);
    const hot = lastChanged === side || lastChanged === "both";
    const block = (key: string, child: React.ReactNode, onClick: () => void, label: string) => (
      <g
        key={key}
        role="button"
        tabIndex={0}
        aria-label={label}
        className="cursor-pointer outline-none focus-visible:opacity-70"
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick();
          }
        }}
      >
        {child}
      </g>
    );
    return (
      <g style={{ transform: `translate(${cx - PAN_W / 2}px, ${cy}px)`, transition: "transform 600ms cubic-bezier(.3,.7,.2,1)" }}>
        {/* strings */}
        <line x1={PAN_W / 2} y1={-150 + 8} x2={10} y2={0} stroke="var(--border-strong)" />
        <line x1={PAN_W / 2} y1={-150 + 8} x2={PAN_W - 10} y2={0} stroke="var(--border-strong)" />
        {/* plate */}
        <rect x={0} y={0} width={PAN_W} height={8} rx={4} fill={hot ? "var(--c-hl)" : "var(--fg)"} style={{ transition: "fill 400ms" }} />
        {layout.xs.map((p) =>
          block(
            p.key,
            <g transform={`translate(${p.x},${p.y})`}>
              <rect width={34} height={34} rx={7} fill="var(--c-var)" fillOpacity={0.18} stroke="var(--c-var)" strokeWidth={2} />
              <text x={17} y={23} textAnchor="middle" fontSize={18} fontStyle="italic" fill="var(--c-var)" fontFamily="KaTeX_Math, serif">
                x
              </text>
            </g>,
            () => takeOne(side, "x"),
            t("balanceRemoveX"),
          ),
        )}
        {layout.bars.map((p) =>
          block(
            p.key,
            <g transform={`translate(${p.x},${p.y})`}>
              <rect width={12} height={60} rx={2} fill={layout.negative ? "none" : "var(--c-num)"} stroke="var(--c-num)" strokeWidth={1.5} />
              <text x={6} y={-4} textAnchor="middle" fontSize={10} fill="var(--c-num)">
                {layout.negative ? "−10" : "10"}
              </text>
            </g>,
            () => takeOne(side, "one"),
            t("balanceRemoveOne"),
          ),
        )}
        {layout.cubes.map((p) =>
          block(
            p.key,
            <g transform={`translate(${p.x},${p.y})`}>
              <rect width={16} height={16} rx={3} fill={layout.negative ? "none" : "var(--c-num)"} stroke="var(--c-num)" strokeWidth={1.5} />
              {layout.negative && (
                <text x={8} y={12.5} textAnchor="middle" fontSize={13} fill="var(--c-num)">
                  −
                </text>
              )}
            </g>,
            () => takeOne(side, "one"),
            t("balanceRemoveOne"),
          ),
        )}
      </g>
    );
  };

  return (
    <div className="space-y-4">
      <svg viewBox={`0 0 ${W} 330`} className="w-full select-none" role="img" aria-label={t("balanceAria")}>
        {/* stand */}
        <path d={`M ${PIVOT.x} ${PIVOT.y} L ${PIVOT.x - 60} 320 L ${PIVOT.x + 60} 320 Z`} fill="var(--surface-2)" stroke="var(--border-strong)" />
        {/* beam */}
        <g style={{ transform: `rotate(${angle}deg)`, transformOrigin: `${PIVOT.x}px ${PIVOT.y}px`, transition: "transform 600ms cubic-bezier(.3,.7,.2,1)" }}>
          <rect x={PIVOT.x - HALF - 6} y={PIVOT.y - 4} width={2 * HALF + 12} height={8} rx={4} fill="var(--fg)" />
        </g>
        <circle cx={PIVOT.x} cy={PIVOT.y} r={9} fill="var(--bg)" stroke="var(--fg)" strokeWidth={3} />
        {/* level indicator */}
        <text x={PIVOT.x} y={PIVOT.y - 22} textAnchor="middle" fontSize={14} fill={tipped === 0 ? "var(--c-good)" : "var(--c-bad)"}>
          {tipped === 0 ? "=" : "≠"}
        </text>
        {renderPan("left")}
        {renderPan("right")}
      </svg>

      <div className="text-center text-2xl" aria-live="polite">
        <Formula latex={tipped === 0 ? balanceLatex(state) : balanceLatex(state).replace("=", "\\neq")} display />
      </div>
      <p className="min-h-7 text-center" aria-live="polite">
        {done ? (
          <strong className="text-good">{t("balanceDone")}</strong>
        ) : message ? (
          <span className={tipped === 0 ? "" : "text-bad"}>
            <Inline text={message} />
          </span>
        ) : (
          <span className="text-muted">{t("balanceIntro")}</span>
        )}
      </p>

      <div className="flex flex-wrap justify-center gap-2">
        {ops.map((op) => (
          <button
            key={op.kind}
            disabled={playing || tipped !== 0}
            onClick={() => doBoth(op)}
            className="rounded-lg border border-border-strong px-3 py-2 text-sm hover:border-fg disabled:opacity-40"
          >
            <Inline text={l(opText(op))} />
          </button>
        ))}
        <button onClick={play} disabled={playing} className="rounded-lg border border-border-strong px-3 py-2 text-sm hover:border-fg disabled:opacity-40">
          ▶ {t("showMe")}
        </button>
        <button onClick={reset} className="rounded-lg px-3 py-2 text-sm text-muted hover:text-fg">
          ↺ {t("startOver")}
        </button>
      </div>
    </div>
  );
}

export function describeBalance(spec: { a: number; b: number; c?: number; d?: number }) {
  return balanceLatex(initBalance(spec.a, spec.b, spec.c ?? 0, spec.d ?? 0));
}
