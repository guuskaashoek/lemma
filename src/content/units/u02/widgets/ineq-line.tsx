"use client";
/**
 * Number line for an inequality `ax+b < cx+d` (or >, ≤, ≥).
 *
 * The learner moves a test number with ◀ ▶. The widget fills it in and
 * says whether the inequality is true. Every tested number stays on the
 * line: a dot when it works, a cross when it does not. So the pattern
 * appears by itself. "Show all solutions" then draws the solution: a dot at
 * the boundary (closed when the boundary counts, open when not) and a ray.
 */
import { useMemo, useState } from "react";
import { Btn, numText, Tex, TextWithTex, useLoc } from "./kit";
import { filledLatex, tilesValue, type TileTerm } from "./models";

type Rel = "<" | ">" | "\\le" | "\\ge";
type Props = { a: number; b: number; c?: number; d?: number; op: Rel; min: number; max: number; test?: number; reveal?: boolean };

const W = 720;
const PAD = 40;
const Y = 120;

function holds(l: number, op: Rel, r: number) {
  const eq = Math.abs(l - r) < 1e-9;
  return op === "<" ? l < r && !eq : op === ">" ? l > r && !eq : op === "\\le" ? l < r || eq : l > r || eq;
}

const side = (coef: number, n: number): TileTerm[] => [...(coef !== 0 ? [[coef, "x"] as TileTerm] : []), ...(n !== 0 || coef === 0 ? [[n, "1"] as TileTerm] : [])];
const sideLatex = (terms: TileTerm[]) =>
  terms.map(([c, k], i) => (k === "1" ? (i === 0 || c < 0 ? `${c}` : `+${c}`) : (c === 1 ? "x" : c === -1 ? "-x" : `${c}x`))).join("");

export function IneqLine({ props }: { props: Record<string, unknown> }) {
  const { a, b, c = 0, d = 0, op, min, max, test, reveal = false } = props as Props;
  const { l, locale } = useLoc();
  const lhs = useMemo(() => side(a, b), [a, b]);
  const rhs = useMemo(() => side(c, d), [c, d]);
  const k = (d - b) / (a - c);
  const right = holds(a * (k + 1) + b, op, c * (k + 1) + d);
  const closed = op === "\\le" || op === "\\ge";
  const [t, setT] = useState(test ?? Math.round((min + max) / 2));
  const [tested, setTested] = useState<Map<number, boolean>>(() => new Map());
  const [shown, setShown] = useState(reveal);

  const sx = (v: number) => PAD + ((v - min) / (max - min)) * (W - 2 * PAD);
  const lv = tilesValue(lhs, t);
  const rv = tilesValue(rhs, t);
  const ok = holds(lv, op, rv);

  const move = (to: number) => {
    const next = Math.max(min, Math.min(max, to));
    setTested((m) => new Map(m).set(t, ok));
    setT(next);
  };

  const relText = `${sideLatex(lhs)}${op === "<" || op === ">" ? op : `${op} `}${sideLatex(rhs)}`;
  // Show the filled-in side only when there is something to work out (not for a lone x).
  const plainX = (terms: TileTerm[]) => terms.length === 1 && terms[0][0] === 1 && terms[0][1] === "x";
  const fill = (terms: TileTerm[]) => (terms.some(([, kind]) => kind === "x") && !plainX(terms) ? `${filledLatex(terms, t)}=` : "");
  const opSym = op === "<" || op === ">" ? op : `${op} `;
  const ticks = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  const step = max - min > 16 ? 2 : 1;
  // The solution is read from the picture's side, so it is right after a flip too.
  const answerOp = right ? (closed ? "\\ge " : ">") : closed ? "\\le " : "<";
  const answer = `x${answerOp}${numText(k, "en").replace("−", "-")}`;

  return (
    <div className="space-y-3">
      <div className="text-center text-2xl">
        <Tex latex={relText} />
      </div>
      <svg viewBox={`0 0 ${W} 170`} className="w-full select-none" role="img" aria-label={l({ nl: "Getallenlijn", en: "Number line" })}>
        {/* solution ray */}
        {shown && (
          <g>
            <rect
              x={right ? sx(k) : PAD - 20}
              y={Y - 5}
              width={right ? W - PAD + 20 - sx(k) : sx(k) - PAD + 20}
              height={10}
              rx={5}
              fill="var(--c-hl)"
              fillOpacity={0.45}
              className="animate-in"
            />
          </g>
        )}
        <line x1={PAD - 20} y1={Y} x2={W - PAD + 20} y2={Y} stroke="var(--fg)" strokeWidth={2} />
        <path d={`M ${W - PAD + 20} ${Y} l -10 -6 v 12 z`} fill="var(--fg)" />
        {ticks.map((v) => (
          <g key={v}>
            <line x1={sx(v)} y1={Y - 8} x2={sx(v)} y2={Y + 8} stroke="var(--fg)" strokeWidth={v === 0 ? 2.5 : 1.2} />
            {(v - min) % step === 0 && (
              <text x={sx(v)} y={Y + 30} textAnchor="middle" fontSize={15} fill="var(--c-num)">
                {numText(v, locale)}
              </text>
            )}
          </g>
        ))}
        {shown && (
          <circle cx={sx(k)} cy={Y} r={9} fill={closed ? "var(--c-hl)" : "var(--bg)"} stroke="var(--c-hl)" strokeWidth={3} />
        )}
        {/* tested numbers: dot = true, cross = false */}
        {[...tested.entries()].map(([v, good]) =>
          good ? (
            <circle key={v} cx={sx(v)} cy={Y - 30} r={6} fill="var(--fg)" />
          ) : (
            <path key={v} d={`M ${sx(v) - 6} ${Y - 36} l 12 12 m 0 -12 l -12 12`} stroke="var(--fg)" strokeWidth={2} />
          ),
        )}
        {/* the test number */}
        <g style={{ transform: `translateX(${sx(t)}px)` }} className="transition-transform duration-300 motion-reduce:transition-none">
          <path d={`M 0 ${Y - 12} l -9 -16 h 18 z`} fill="var(--c-hl)" />
          <text y={Y - 50} textAnchor="middle" fontSize={16} fontWeight={700} fill="var(--c-hl)">
            {numText(t, locale)}
          </text>
        </g>
      </svg>

      <div className="space-y-1 text-center text-xl" aria-live="polite">
        <div>
          <Tex latex={`x=${t}:\\quad ${fill(lhs)}${lv}${opSym}${fill(rhs)}${rv}`} />
        </div>
        <p className="text-base">
          <strong>{ok ? l({ nl: "✓ klopt", en: "✓ true" }) : l({ nl: "✗ klopt niet", en: "✗ false" })}</strong>
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <Btn onClick={() => move(t - 1)} disabled={t <= min} label={l({ nl: "Een naar links", en: "One to the left" })}>
          ◀
        </Btn>
        <Btn onClick={() => move(t + 1)} disabled={t >= max} label={l({ nl: "Een naar rechts", en: "One to the right" })}>
          ▶
        </Btn>
        <Btn onClick={() => setShown(true)} disabled={shown}>
          {l({ nl: "Toon alle oplossingen", en: "Show all solutions" })}
        </Btn>
        <Btn
          quiet
          onClick={() => {
            setTested(new Map());
            setShown(reveal);
            setT(test ?? Math.round((min + max) / 2));
          }}
        >
          {l({ nl: "↺ Opnieuw", en: "↺ Start over" })}
        </Btn>
      </div>
      {shown && (
        <p className="text-center" aria-live="polite">
          <TextWithTex
            text={l({
              nl: `Alle oplossingen: $${answer}$. ${closed ? "Dicht bolletje: de grens doet mee." : "Open bolletje: de grens doet niet mee."}`,
              en: `All solutions: $${answer}$. ${closed ? "Closed dot: the boundary counts." : "Open dot: the boundary does not count."}`,
            })}
          />
        </p>
      )}
    </div>
  );
}
