"use client";
/**
 * Equal groups: a pile of dots is shared into equal groups.
 *
 * Used for "3/4 of 20" (20 dots, 4 groups, 3 groups taken) and for sharing
 * in a ratio such as 2 : 3 (5 groups, the first 2 filled, the other 3
 * outlined). With many dots each group is drawn as one block with its count.
 *
 * Steps: 0 one pile, 1 shared into groups, 2 one group counted,
 * 3 the parts are coloured and added up.
 */
import type { Loc } from "@/i18n/locale";
import { Btn, numText, Tex, UI, useLoc, useSteps } from "./kit";

/** `given`: only one part is known (its index and amount); the total is then not shown. */
type Props = { total: number; parts: number[]; names?: Loc[]; given?: { index: number; amount: number } };

const DOTS_MAX = 60;

export function Groups({ props }: { props: Record<string, unknown> }) {
  const { total, parts, names, given } = props as Props;
  const { l, locale } = useLoc();
  const groups = parts.reduce((a, b) => a + b, 0);
  const per = total / groups;
  const { step, next, reset, play, playing, done } = useSteps(3, 1100);
  const dots = total <= DOTS_MAX && Number.isInteger(per);

  // Layout: groups side by side; inside a group, dots in rows of up to 5.
  const cols = Math.min(5, Math.max(1, Math.ceil(Math.sqrt(per))));
  const R = 7;
  const CELL = 20;
  const GW = dots ? cols * CELL + 16 : 70;
  const GH = dots ? Math.ceil(per / cols) * CELL + 16 : 70;
  const GAP = 12;
  const W = Math.max(groups * (GW + GAP), 300);
  const H = GH + 70;

  const groupOf = (g: number) => {
    let acc = 0;
    for (let i = 0; i < parts.length; i++) {
      acc += parts[i];
      if (g < acc) return i;
    }
    return parts.length - 1;
  };
  const groupX = (g: number) => (W - groups * (GW + GAP) + GAP) / 2 + g * (GW + GAP);
  // Style per part: part 0 filled, part 1 outlined, part 2 filled lighter.
  const fillFor = (part: number) => (part === 0 ? "var(--c-num)" : part === 2 ? "var(--c-var)" : "none");

  const dotPos = (i: number) => {
    if (step === 0) {
      // One big pile in the middle.
      const pileCols = Math.ceil(Math.sqrt(total * 2));
      const px = W / 2 - (pileCols * 12) / 2 + (i % pileCols) * 12;
      const py = 20 + Math.floor(i / pileCols) * 12;
      return { x: px, y: py };
    }
    const g = Math.floor(i / per);
    const j = i % per;
    return { x: groupX(g) + 8 + (j % cols) * CELL + CELL / 2, y: 18 + Math.floor(j / cols) * CELL + CELL / 2 };
  };

  const sums = parts.map((p) => p * per);

  return (
    <div className="space-y-4">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-2xl select-none" role="img" aria-label={l({ nl: "Groepjes", en: "Groups" })}>
        {Array.from({ length: groups }, (_, g) => {
          const part = groupOf(g);
          const coloured = step >= 3;
          return (
            <g key={g} style={{ opacity: step >= 1 ? 1 : 0, transition: "opacity 400ms" }}>
              <rect
                x={groupX(g)}
                y={10}
                width={GW}
                height={GH}
                rx={10}
                fill={coloured && part !== 1 ? fillFor(part) : "transparent"}
                fillOpacity={0.15}
                stroke={step === 2 && g === 0 ? "var(--c-hl)" : "var(--border-strong)"}
                strokeWidth={step === 2 && g === 0 ? 3 : 1.5}
                strokeDasharray={coloured && part === 1 ? "6 4" : undefined}
              />
              {!dots && (
                <text x={groupX(g) + GW / 2} y={10 + GH / 2 + 6} textAnchor="middle" fontSize={18} fill="var(--c-num)">
                  {step >= 2 ? numText(per, locale) : "?"}
                </text>
              )}
              {step >= 2 && dots && (
                <text x={groupX(g) + GW / 2} y={GH + 32} textAnchor="middle" fontSize={15} fill="var(--c-num)">
                  {numText(per, locale)}
                </text>
              )}
            </g>
          );
        })}
        {dots &&
          Array.from({ length: total }, (_, i) => {
            const p = dotPos(i);
            const part = groupOf(Math.floor(i / per));
            const coloured = step >= 3;
            return (
              <circle
                key={i}
                cx={0}
                cy={0}
                r={R}
                fill={coloured ? fillFor(part) : "var(--fg)"}
                fillOpacity={coloured && part === 1 ? 0 : 0.85}
                stroke={coloured ? (part === 2 ? "var(--c-var)" : "var(--c-num)") : "var(--fg)"}
                strokeWidth={1.5}
                className="motion-reduce:transition-none"
                style={{ transform: `translate(${p.x}px, ${p.y}px)`, transition: "transform 700ms ease-out, fill 300ms" }}
              />
            );
          })}
        {!dots && step === 0 && (
          <g>
            <rect x={20} y={10} width={W - 40} height={GH} rx={10} fill="var(--c-num)" fillOpacity={0.15} stroke="var(--border-strong)" />
            <text x={W / 2} y={10 + GH / 2 + 6} textAnchor="middle" fontSize={18} fill="var(--c-num)">
              {given ? "?" : numText(total, locale)}
            </text>
          </g>
        )}
      </svg>

      <div className="min-h-16 space-y-1 text-center text-lg" aria-live="polite">
        {step === 0 && !given && <p>{l({ nl: `Dit zijn er ${numText(total, locale)}.`, en: `These are ${numText(total, locale)}.` })}</p>}
        {step === 0 && given && (
          <p>
            {names?.[given.index] ? `${l(names[given.index])}: ` : ""}
            {l({
              nl: `${numText(given.amount, locale)} is ${parts[given.index]} ${parts[given.index] === 1 ? "groepje" : "groepjes"}.`,
              en: `${numText(given.amount, locale)} is ${parts[given.index]} ${parts[given.index] === 1 ? "group" : "groups"}.`,
            })}
          </p>
        )}
        {step === 1 && (
          <p>{l({ nl: `Verdeeld in ${groups} gelijke groepjes.`, en: `Shared into ${groups} equal groups.` })}</p>
        )}
        {step === 2 && !given && <Tex latex={`${numText(total, "en")}:${groups}=${numText(per, "en")}`} />}
        {step === 2 && given && <Tex latex={`${numText(given.amount, "en")}:${parts[given.index]}=${numText(per, "en")}`} />}
        {step >= 3 &&
          parts.map((p, i) => (
            <div key={i}>
              {names?.[i] && <span className="mr-2">{l(names[i])}:</span>}
              <Tex latex={`${p}\\cdot ${numText(per, "en")}=${numText(sums[i], "en")}`} />
            </div>
          ))}
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        <Btn onClick={next} disabled={done || playing}>
          {l(UI.next)}
        </Btn>
        <Btn onClick={play} disabled={playing}>
          {l(UI.play)}
        </Btn>
        <Btn quiet onClick={reset}>
          {l(UI.reset)}
        </Btn>
      </div>
    </div>
  );
}
