"use client";
/**
 * Parabola lab for y = ax² + bx + c.
 *
 * - `controls`: +/- buttons for a, b and/or c. The graph glides to its new
 *   shape, so you see what each number does.
 * - `show`: what is drawn on top: the axis of symmetry ("axis"), the vertex
 *   ("top"), the zeros ("zeros"), the discriminant panel ("d"), the two
 *   equal steps of the abc-formule ("abc"), and a fold button ("fold") that
 *   flips the left half onto the right half.
 */
import { useId, useState } from "react";
import { Btn, Tex, UI, numTex, numText, parTex, useGlide, useLoc } from "./kit";

type Key = "a" | "b" | "c";

const W = 600;
const H = 400;

/** A window that shows the vertex and the zeros, with the axis in the middle. */
function windowFor(a: number, b: number, c: number) {
  const xt = -b / (2 * a);
  const f = (x: number) => a * x * x + b * x + c;
  const D = b * b - 4 * a * c;
  const xs = [xt];
  if (D >= 0) xs.push((-b - Math.sqrt(D)) / (2 * a), (-b + Math.sqrt(D)) / (2 * a));
  const half = Math.max(4, ...xs.map((v) => Math.abs(v - xt) + 2));
  const x0 = Math.floor(xt - half);
  const x1 = Math.ceil(xt + half);
  const ys = [f(xt), 0, f(x0 + 1), f(x1 - 1)];
  const lo = Math.min(...ys);
  const hi = Math.max(...ys);
  const pad = Math.max(1, Math.ceil((hi - lo) * 0.15));
  return { x: [x0, x1] as const, y: [Math.floor(lo) - pad, Math.ceil(hi) + pad] as const };
}

/** A readable grid step: 1, 2, 5, 10, ... */
function gridStep(span: number): number {
  const raw = span / 10;
  const p = 10 ** Math.floor(Math.log10(raw));
  return [1, 2, 5, 10].map((m) => m * p).find((s) => s >= raw) ?? p * 10;
}

/** `x^{2}-3x+2` from rounded coefficients. */
function quadTex(a: number, b: number, c: number): string {
  const t = (k: number, v: string, first: boolean) => {
    if (k === 0) return "";
    const abs = Math.abs(k);
    const body = v && abs === 1 ? v : `${abs}${v}`;
    return k < 0 ? `-${body}` : first ? body : `+${body}`;
  };
  const s = t(a, "x^{2}", true) + t(b, "x", a === 0) + t(c, "", a === 0 && b === 0);
  return s === "" ? "0" : s;
}

export function Parabola({ props }: { props: Record<string, unknown> }) {
  const init = { a: Number(props.a ?? 1), b: Number(props.b ?? 0), c: Number(props.c ?? 0) };
  const show = new Set((props.show as string[]) ?? []);
  const controls = (props.controls as Key[]) ?? [];
  const { l, locale } = useLoc();
  const [view] = useState(() => windowFor(init.a, init.b, init.c));
  const [target, setTarget] = useState(init);
  const [glide, setGlide] = useGlide([init.a, init.b, init.c]);
  const [folded, setFolded] = useState(false);
  const clip = `u4-parabola-${useId().replace(/:/g, "")}`;
  const [a, b, c] = glide;
  const { a: ta, b: tb, c: tc } = target;

  const change = (key: Key, delta: number) => {
    const next = { ...target, [key]: target[key] + delta };
    if (next.a === 0) next.a = delta; // a may never become 0
    setTarget(next);
    setFolded(false);
    setGlide([next.a, next.b, next.c]);
  };
  const reset = () => {
    setTarget(init);
    setFolded(false);
    setGlide([init.a, init.b, init.c]);
  };

  const { x, y } = view;
  const sx = (v: number) => ((v - x[0]) / (x[1] - x[0])) * W;
  const sy = (v: number) => H - ((v - y[0]) / (y[1] - y[0])) * H;
  const f = (v: number) => a * v * v + b * v + c;

  // Exact values from the target numbers (the glide is only for drawing).
  const xt = -tb / (2 * ta);
  const yt = ta * xt * xt + tb * xt + tc;
  const D = tb * tb - 4 * ta * tc;
  const zeros = D > 0 ? [(-tb - Math.sqrt(D)) / (2 * ta), (-tb + Math.sqrt(D)) / (2 * ta)].sort((p, q) => p - q) : D === 0 ? [xt] : [];
  const gxt = -b / (2 * a); // axis while gliding

  /** SVG path of the graph between two x-values. */
  const path = (from: number, to: number) => {
    const pts: string[] = [];
    const n = 160;
    for (let i = 0; i <= n; i++) {
      const v = from + ((to - from) * i) / n;
      const w = Math.max(y[0] - (y[1] - y[0]), Math.min(y[1] + (y[1] - y[0]), f(v)));
      pts.push(`${i === 0 ? "M" : "L"} ${sx(v).toFixed(1)} ${sy(w).toFixed(1)}`);
    }
    return pts.join(" ");
  };

  const stepX = gridStep(x[1] - x[0]);
  const stepY = gridStep(y[1] - y[0]);
  const gx: number[] = [];
  for (let v = Math.ceil(x[0] / stepX) * stepX; v <= x[1]; v += stepX) gx.push(v);
  const gy: number[] = [];
  for (let v = Math.ceil(y[0] / stepY) * stepY; v <= y[1]; v += stepY) gy.push(v);
  const inX = (v: number) => v >= x[0] && v <= x[1];
  const inY = (v: number) => v >= y[0] && v <= y[1];
  const label = (v: number) => numText(v, locale);
  const countText =
    D > 0
      ? l({ nl: "twee snijpunten met de x-as: twee oplossingen", en: "two crossings with the x-axis: two solutions" })
      : D === 0
        ? l({ nl: "de top raakt de x-as: één oplossing", en: "the vertex touches the x-axis: one solution" })
        : l({ nl: "geen snijpunt met de x-as: geen oplossing", en: "no crossing with the x-axis: no solution" });

  return (
    <div className="space-y-3">
      <div className="text-center text-2xl">
        <Tex latex={`y=${quadTex(ta, tb, tc)}`} />
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full touch-none rounded-lg border border-border bg-surface select-none" role="img" aria-label={l({ nl: "Grafiek van een parabool", en: "Graph of a parabola" })}>
        <defs>
          <clipPath id={clip}>
            <rect x={0} y={0} width={W} height={H} />
          </clipPath>
        </defs>
        {gx.map((v) => (
          <line key={`gx${v}`} x1={sx(v)} y1={0} x2={sx(v)} y2={H} stroke="var(--border)" />
        ))}
        {gy.map((v) => (
          <line key={`gy${v}`} x1={0} y1={sy(v)} x2={W} y2={sy(v)} stroke="var(--border)" />
        ))}
        {inY(0) && <line x1={0} y1={sy(0)} x2={W} y2={sy(0)} stroke="var(--fg)" strokeWidth={1.5} />}
        {inX(0) && <line x1={sx(0)} y1={0} x2={sx(0)} y2={H} stroke="var(--fg)" strokeWidth={1.5} />}
        {gx.filter((v) => v !== 0).map((v) => (
          <text key={`lx${v}`} x={sx(v)} y={Math.min(H - 4, Math.max(14, sy(0) + 16))} textAnchor="middle" fontSize={12} fill="var(--muted)">
            {label(v)}
          </text>
        ))}
        {gy.filter((v) => v !== 0).map((v) => (
          <text key={`ly${v}`} x={Math.min(W - 22, Math.max(4, sx(0) + 6))} y={sy(v) + 4} fontSize={12} fill="var(--muted)">
            {label(v)}
          </text>
        ))}

        <g clipPath={`url(#${clip})`}>
          {show.has("axis") && inX(gxt) && (
            <line x1={sx(gxt)} y1={0} x2={sx(gxt)} y2={H} stroke="var(--c-hl)" strokeWidth={2} strokeDasharray="7 6" />
          )}
          <path d={path(x[0], x[1])} fill="none" stroke="var(--fg)" strokeWidth={3} />
          {show.has("fold") && inX(gxt) && (
            <g
              style={{
                transform: folded ? "scaleX(-1)" : "none",
                transformOrigin: `${sx(gxt)}px 0px`,
                transformBox: "view-box",
                transition: "transform 900ms ease-in-out",
              }}
              className="motion-reduce:[transition:none]"
            >
              <path d={path(x[0], gxt)} fill="none" stroke="var(--c-hl)" strokeWidth={4} strokeOpacity={0.9} />
            </g>
          )}
          {show.has("abc") && D > 0 && zeros.every(inX) && (
            <g>
              {zeros.map((z, i) => (
                <g key={i}>
                  <line x1={sx(xt)} y1={sy(0) - 14} x2={sx(z)} y2={sy(0) - 14} stroke="var(--c-num)" strokeWidth={3} />
                  <text x={(sx(xt) + sx(z)) / 2} y={sy(0) - 22} textAnchor="middle" fontSize={14} fill="var(--c-num)">
                    {label(Math.abs(z - xt))}
                  </text>
                </g>
              ))}
            </g>
          )}
          {show.has("zeros") &&
            zeros.filter(inX).map((z, i) => (
              <g key={`z${i}`}>
                <circle cx={sx(z)} cy={sy(0)} r={7} fill="var(--c-hl)" />
                <text x={sx(z)} y={sy(0) + 26} textAnchor="middle" fontSize={14} fill="var(--c-hl)">
                  {label(z)}
                </text>
              </g>
            ))}
          {show.has("top") && inX(xt) && inY(yt) && (
            <g>
              <circle cx={sx(xt)} cy={sy(yt)} r={7} fill="var(--fg)" />
              <text x={sx(xt) + 10} y={sy(yt) + (ta > 0 ? 22 : -12)} fontSize={14} fill="var(--fg)">
                {l({ nl: "top", en: "vertex" })} ({label(xt)}; {label(yt)})
              </text>
            </g>
          )}
        </g>
      </svg>

      {controls.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          {controls.map((key) => (
            <div key={key} className="flex items-center gap-1">
              <Btn onClick={() => change(key, -1)} label={`${key} −1`}>
                −
              </Btn>
              <span className="min-w-14 text-center text-lg">
                <Tex latex={`${key}=${target[key]}`} />
              </span>
              <Btn onClick={() => change(key, 1)} label={`${key} +1`}>
                +
              </Btn>
            </div>
          ))}
        </div>
      )}

      <div className="min-h-10 space-y-1 text-center" aria-live="polite">
        {show.has("axis") && (
          <p>
            {l({ nl: "Symmetrie-as:", en: "Axis of symmetry:" })} <Tex latex={`x=-\\frac{${tb}}{2\\cdot ${parTex(ta)}}=${numTex(xt)}`} />
          </p>
        )}
        {show.has("d") && (
          <p>
            <Tex latex={`D=${parTex(tb)}^{2}-4\\cdot ${parTex(ta)}\\cdot ${parTex(tc)}=${D}`} /> · {countText}
          </p>
        )}
        {show.has("abc") && D > 0 && (
          <p>
            <Tex latex={`x=\\frac{${-tb}\\pm\\sqrt{${D}}}{${2 * ta}}=${numTex(xt)}\\pm ${numTex(Math.abs(Math.sqrt(D) / (2 * ta)))}`} />
          </p>
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {show.has("fold") && (
          <Btn onClick={() => setFolded((v) => !v)} pressed={folded}>
            {folded ? l({ nl: "Vouw open", en: "Unfold" }) : l({ nl: "Vouw dubbel langs de as", en: "Fold along the axis" })}
          </Btn>
        )}
        {(controls.length > 0 || show.has("fold")) && (
          <Btn quiet onClick={reset}>
            {l(UI.reset)}
          </Btn>
        )}
      </div>
    </div>
  );
}
