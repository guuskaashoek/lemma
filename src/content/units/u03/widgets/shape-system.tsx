"use client";
/**
 * A system of two equations as two rows of shapes: a circle is x, a square
 * is y. A filled shape counts +1, an outlined shape with a minus counts −1.
 *
 * The learner chooses: add the rows (I + II) or subtract them (I − II).
 * Only the right choice makes all squares disappear; then one kind of shape
 * is left and x follows. With `mult`, the rows first get multiplied so the
 * squares match. Finally x is put back into row II to find y.
 */
import { useState } from "react";
import Fraction from "fraction.js";
import type { Loc } from "@/i18n/locale";
import { Btn, Say, Tex, UI, useLoc } from "./kit";
import { combine, numTex, scaleRow, type Row } from "./model";

type Props = { r1: Row; r2: Row; mult?: [number, number] };

const R = 11;
const GAP = 6;
const ROW_H = 54;
const MAX_SHAPES = 8;

/** Shapes of one kind: up to 8 drawn one by one, more as one shape with "×n". */
function Shapes({ kind, count, x0, y, fade }: { kind: "circle" | "square"; count: number; x0: number; y: number; fade?: boolean }) {
  const n = Math.abs(count);
  const neg = count < 0;
  const many = n > MAX_SHAPES;
  const drawn = many ? 1 : n;
  const out = [];
  for (let i = 0; i < drawn; i++) {
    const cx = x0 + i * (2 * R + GAP) + R;
    const common = {
      fill: neg ? "none" : "var(--c-var)",
      fillOpacity: neg ? 0 : 0.85,
      stroke: "var(--c-var)",
      strokeWidth: 2.5,
    };
    out.push(
      <g key={i}>
        {kind === "circle" ? <circle cx={cx} cy={y} r={R} {...common} /> : <rect x={cx - R} y={y - R} width={2 * R} height={2 * R} rx={3} {...common} />}
        {neg && <line x1={cx - 5} y1={y} x2={cx + 5} y2={y} stroke="var(--c-var)" strokeWidth={2.5} />}
      </g>,
    );
  }
  return (
    <g style={{ opacity: fade ? 0.12 : 1 }} className="transition-opacity duration-700 motion-reduce:transition-none">
      {out}
      {many && (
        <text x={x0 + 2 * R + 6} y={y + 6} fontSize={17} fill="var(--c-num)">
          ×{n}
        </text>
      )}
    </g>
  );
}

const width = (count: number) => (count === 0 ? 0 : Math.abs(count) > MAX_SHAPES ? 2 * R + 46 : Math.abs(count) * (2 * R + GAP));

/** One row: circles, squares, "=", number. */
function ShapeRow({ row, y, label, fadeSquares, fadeCircles }: { row: Row; y: number; label: string; fadeSquares?: boolean; fadeCircles?: boolean }) {
  const x0 = 46;
  const wx = width(row.x);
  const xs = x0 + wx + (wx > 0 ? 16 : 0);
  const ws = width(row.y);
  const xe = xs + ws + 14;
  return (
    <g>
      <text x={8} y={y + 6} fontSize={16} fill="var(--muted)">
        {label}
      </text>
      <Shapes kind="circle" count={row.x} x0={x0} y={y} fade={fadeCircles} />
      <Shapes kind="square" count={row.y} x0={xs} y={y} fade={fadeSquares} />
      <text x={xe} y={y + 7} fontSize={20} fill="var(--fg)">
        =
      </text>
      <text x={xe + 22} y={y + 7} fontSize={20} fill="var(--c-num)">
        {Number.isInteger(row.c) ? String(row.c).replace("-", "−") : new Fraction(row.c).toFraction()}
      </text>
    </g>
  );
}

const rowTex = (r: Row) => {
  const t = (c: number, v: string) => (c === 0 ? "" : `${c === 1 ? "" : c === -1 ? "-" : numTex(c)}${v}`);
  const s = [t(r.x, "x"), t(r.y, "y")].filter(Boolean).reduce((acc, p) => (acc === "" ? p : p.startsWith("-") ? acc + p : `${acc}+${p}`), "");
  return `${s || "0"}=${numTex(r.c)}`;
};

export function ShapeSystem({ props }: { props: Record<string, unknown> }) {
  const p = props as Props;
  const { l } = useLoc();
  const [m1, m2] = p.mult ?? [1, 1];
  const needMult = m1 !== 1 || m2 !== 1;
  const [multiplied, setMultiplied] = useState(false);
  const [result, setResult] = useState<{ row: Row; op: "add" | "sub" } | null>(null);
  const [stage, setStage] = useState(0); // 0 choose, 1 x found, 2 y found
  const [msg, setMsg] = useState<Loc | null>(null);

  const r1 = multiplied ? scaleRow(p.r1, m1) : p.r1;
  const r2 = multiplied ? scaleRow(p.r2, m2) : p.r2;
  const xVal = result ? new Fraction(result.row.c).div(result.row.x) : null;
  const yVal = xVal ? new Fraction(p.r2.c).sub(xVal.mul(p.r2.x)).div(p.r2.y) : null;

  const choose = (op: "add" | "sub") => {
    const c = combine(r1, r2, op);
    if (c.squaresGone) {
      setResult({ row: c.row, op });
      setMsg(null);
    } else {
      setMsg(
        needMult && !multiplied
          ? { nl: "De vierkantjes vallen niet weg. Maak eerst evenveel vierkantjes.", en: "The squares do not disappear. First make the number of squares equal." }
          : { nl: "De vierkantjes vallen niet weg. Probeer de andere.", en: "The squares do not disappear. Try the other one." },
      );
    }
  };
  const reset = () => {
    setMultiplied(false);
    setResult(null);
    setStage(0);
    setMsg(null);
  };

  const H = ROW_H * 3 + 20;
  const W = 46 + width(Math.max(Math.abs(r1.x), Math.abs(r2.x))) + 16 + width(Math.max(Math.abs(r1.y), Math.abs(r2.y))) + 100;

  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${Math.max(W, 320)} ${H}`} className="mx-auto block w-full max-w-xl select-none" role="img" aria-label={l({ nl: "Twee rijen met rondjes en vierkantjes", en: "Two rows of circles and squares" })}>
        <ShapeRow row={r1} y={ROW_H / 2 + 6} label="I" fadeSquares={!!result} />
        <ShapeRow row={r2} y={ROW_H * 1.5 + 6} label="II" fadeSquares={!!result} />
        {result && (
          <g className="animate-in">
            <line x1={8} y1={ROW_H * 2 + 8} x2={Math.max(W, 320) - 8} y2={ROW_H * 2 + 8} stroke="var(--border-strong)" />
            <ShapeRow row={{ ...result.row, y: 0 }} y={ROW_H * 2.5 + 10} label={result.op === "add" ? "I+II" : "I−II"} />
          </g>
        )}
      </svg>

      <div className="space-y-1 text-center text-lg" aria-live="polite">
        <p>
          <Tex latex={`\\text{I: }${rowTex(r1)}\\qquad\\text{II: }${rowTex(r2)}`} />
        </p>
        {result && <Tex latex={`${rowTex({ ...result.row, y: 0 })}`} />}
        {stage >= 1 && xVal && (
          <p>
            <Tex latex={`x=\\frac{${numTex(result!.row.c)}}{${numTex(result!.row.x)}}=\\hl{${numTex(xVal.valueOf())}}`} />
          </p>
        )}
        {stage >= 2 && xVal && yVal && (
          <p>
            <Tex
              latex={`\\text{II: }${numTex(p.r2.x)}\\cdot ${xVal.s < 0 ? `(${numTex(xVal.valueOf())})` : numTex(xVal.valueOf())}${p.r2.y < 0 ? "-" : "+"}${Math.abs(p.r2.y) === 1 ? "" : numTex(Math.abs(p.r2.y))}y=${numTex(p.r2.c)}\\quad\\text{${l({ nl: "dus", en: "so" })}}\\quad y=\\hl{${numTex(yVal.valueOf())}}`}
            />
          </p>
        )}
      </div>
      <Say hl={!!result && !msg}>
        {msg
          ? l(msg)
          : !result
            ? l({ nl: "Kies: tel de rijen op, of trek ze van elkaar af. De vierkantjes moeten wegvallen.", en: "Choose: add the rows, or subtract them. The squares must disappear." })
            : stage === 0
              ? l({ nl: "De vierkantjes zijn weg! Nu zijn er alleen rondjes over.", en: "The squares are gone! Only circles are left." })
              : stage === 1
                ? l({ nl: "Eén rondje is x. Zet x nu in rij II.", en: "One circle is x. Now put x into row II." })
                : l({ nl: "Klaar: je weet x en y.", en: "Done: you know x and y." })}
      </Say>

      <div className="flex flex-wrap justify-center gap-2">
        {needMult && !result && (
          <Btn onClick={() => setMultiplied(true)} disabled={multiplied}>
            {l({ nl: "Maak evenveel vierkantjes", en: "Make the squares equal" })}
            {" "}
            <Tex latex={`(${m1 !== 1 ? `\\text{I}\\cdot${m1}` : ""}${m1 !== 1 && m2 !== 1 ? ",\\ " : ""}${m2 !== 1 ? `\\text{II}\\cdot${m2}` : ""})`} />
          </Btn>
        )}
        {!result && (
          <>
            <Btn onClick={() => choose("add")}>
              <Tex latex="\text{I}+\text{II}" />
            </Btn>
            <Btn onClick={() => choose("sub")}>
              <Tex latex="\text{I}-\text{II}" />
            </Btn>
          </>
        )}
        {result && stage < 2 && (
          <Btn onClick={() => setStage((s) => s + 1)}>{stage === 0 ? l({ nl: "Bereken x", en: "Work out x" }) : l({ nl: "Bereken y", en: "Work out y" })}</Btn>
        )}
        <Btn quiet onClick={reset}>
          {l(UI.reset)}
        </Btn>
      </div>
    </div>
  );
}
