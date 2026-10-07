"use client";
/**
 * Expanding brackets with arrows ("papegaaienbek"). Every arrow goes from a
 * term outside (or in the first bracket) to a term in the other bracket.
 * Each step draws one arrow and writes its product below. The last step
 * adds up like terms.
 */
import { useMemo } from "react";
import type { Loc } from "@/i18n/locale";
import { StepButtons, Tex, TextWithTex, useLoc, useSteps } from "./kit";
import { collect, monosLatex, monoLatex, monoText, products, type Mono } from "./models";

type Props = { left: Mono[]; right: Mono[] };

const CHAR = 13;
const ROW = 140;

export function Arrows({ props }: { props: Record<string, unknown> }) {
  const { left, right } = props as Props;
  const { l } = useLoc();
  const prods = useMemo(() => products(left, right), [left, right]);
  const total = useMemo(() => collect(prods.map((p) => p.mono)), [prods]);
  const needsCollect = total.length < prods.filter((p) => p.mono[0] !== 0).length;
  const steps = useSteps(prods.length + (needsCollect ? 1 : 0), 1200);
  const shown = Math.min(steps.step, prods.length);

  // Tokens of the top row: the brackets and terms, laid out left to right.
  type Tok = { text: string; kind: "term" | "bracket"; side?: "L" | "R"; index?: number; w: number };
  const toks: Tok[] = [];
  const single = left.length === 1;
  const termTok = (m: Mono, first: boolean, side: "L" | "R", index: number): Tok => {
    const text = monoText(m, first);
    return { text, kind: "term", side, index, w: text.length * CHAR + 10 };
  };
  const br = (text: string): Tok => ({ text, kind: "bracket", w: 14 });
  if (single) toks.push(termTok(left[0], true, "L", 0));
  else {
    toks.push(br("("));
    left.forEach((m, i) => toks.push(termTok(m, i === 0, "L", i)));
    toks.push(br(")"));
  }
  toks.push(br("("));
  right.forEach((m, j) => toks.push(termTok(m, j === 0, "R", j)));
  toks.push(br(")"));

  const width = toks.reduce((s, t) => s + t.w, 0);
  const W = Math.max(420, width + 120);
  let x = (W - width) / 2;
  const centre = new Map<string, number>();
  const placed = toks.map((t) => {
    const cx = x + t.w / 2;
    if (t.kind === "term") centre.set(`${t.side}${t.index}`, cx);
    x += t.w;
    return { ...t, cx };
  });

  const arc = (i: number, j: number) => {
    const x1 = centre.get(`L${i}`)!;
    const x2 = centre.get(`R${j}`)!;
    const below = !single && i === 1;
    const h = 34 + Math.abs(x2 - x1) * 0.28;
    const y = below ? ROW + 10 : ROW - 26;
    const cy = below ? y + h : y - h;
    return `M ${x1} ${y} Q ${(x1 + x2) / 2} ${cy} ${x2} ${y}`;
  };

  const H = single ? 190 : 250;
  const productText = prods
    .slice(0, shown)
    .map((p, k) => monoText(p.mono, k === 0))
    .join(" ");

  const start = `${single ? monoLatex(left[0]) : `(${monosLatex(left)})`}(${monosLatex(right)})`;
  const partial = prods
    .slice(0, shown)
    .map((p, k) => monoLatex(p.mono, k === 0))
    .join("");
  const formula =
    steps.step > prods.length ? `${start}=${monosLatex(total)}` : shown === 0 ? `${start}=\\ldots` : `${start}=${partial}${shown < prods.length ? "+\\ldots" : ""}`;

  const current = shown > 0 && steps.step <= prods.length ? prods[shown - 1] : null;
  const message: Loc =
    steps.step === 0
      ? { nl: "Elke term links gaat keer elke term rechts. Volg de pijlen.", en: "Every term on the left times every term on the right. Follow the arrows." }
      : current
        ? {
            nl: `Pijl ${shown}: $${monoLatex(left[current.i])}\\cdot ${parenMono(right[current.j])}=${monoLatex(current.mono)}$`,
            en: `Arrow ${shown}: $${monoLatex(left[current.i])}\\cdot ${parenMono(right[current.j])}=${monoLatex(current.mono)}$`,
          }
        : { nl: "Tel de gelijke termen op.", en: "Add up the like terms." };

  return (
    <div className="space-y-4">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-2xl select-none" role="img" aria-label={l({ nl: "Pijlen voor haakjes wegwerken", en: "Arrows for expanding brackets" })}>
        {prods.map((p, k) => (
          <path
            key={k}
            d={arc(p.i, p.j)}
            pathLength={1}
            fill="none"
            stroke={k === shown - 1 && steps.step <= prods.length ? "var(--c-hl)" : "var(--border-strong)"}
            strokeWidth={k === shown - 1 ? 3 : 2}
            strokeDasharray="1"
            strokeDashoffset={k < shown ? 0 : 1}
            style={{ transition: "stroke-dashoffset 600ms ease-out, stroke 300ms" }}
            className="motion-reduce:transition-none"
            markerEnd={k < shown ? "url(#u2-arrow-head)" : undefined}
          />
        ))}
        <defs>
          <marker id="u2-arrow-head" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--border-strong)" />
          </marker>
        </defs>
        {placed.map((t, k) => {
          const active = current && t.kind === "term" && ((t.side === "L" && t.index === current.i) || (t.side === "R" && t.index === current.j));
          return (
            <text
              key={k}
              x={t.cx}
              y={ROW + 8}
              textAnchor="middle"
              fontSize={24}
              fontWeight={active ? 700 : 400}
              fill={t.kind === "bracket" ? "var(--fg)" : active ? "var(--c-hl)" : /x/.test(t.text) ? "var(--c-var)" : "var(--c-num)"}
              style={{ transition: "fill 300ms" }}
            >
              {t.text}
            </text>
          );
        })}
        <text x={W / 2} y={H - 12} textAnchor="middle" fontSize={20} fill="var(--fg)">
          {productText}
        </text>
      </svg>

      <div className="text-center text-xl" aria-live="polite">
        <Tex latex={formula} />
      </div>
      <p className="min-h-7 text-center" aria-live="polite">
        <TextWithTex text={l(message)} />
      </p>
      <StepButtons s={steps} />
    </div>
  );
}

/** A term in brackets when it is negative: `(-4)`. */
function parenMono(m: Mono): string {
  const s = monoLatex(m);
  return s.startsWith("-") ? `(${s})` : s;
}
