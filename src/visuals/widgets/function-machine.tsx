"use client";
/**
 * Function machine: a number goes in, the rule is applied, a number comes
 * out. This is the fixed metaphor for functions.
 */
import { useMemo, useState } from "react";
import { useT } from "@/i18n/client";
import { Formula, localizeDecimals } from "@/components/math";
import { compileFn } from "../models/plot";

export function FunctionMachineWidget({ latex, inputs }: { latex: string; inputs: number[] }) {
  const { t, locale } = useT();
  const f = useMemo(() => compileFn(latex), [latex]);
  const [input, setInput] = useState<number | null>(null);
  const [phase, setPhase] = useState<"idle" | "in" | "out">("idle");
  const [table, setTable] = useState<Array<[number, number]>>([]);
  const fmt = (v: number) => localizeDecimals(String(Math.round(v * 1000) / 1000), locale);

  const feed = (x: number) => {
    setInput(x);
    setPhase("in");
    setTimeout(() => {
      setPhase("out");
      setTable((rows) => (rows.some(([a]) => a === x) ? rows : [...rows, [x, f(x)] as [number, number]].sort((p, q) => p[0] - q[0])));
    }, 700);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-center gap-2">
        {inputs.map((x) => (
          <button key={x} onClick={() => feed(x)} className="rounded-full border border-border-strong px-4 py-1.5 hover:border-fg">
            <Formula latex={`x=${fmt(x)}`} />
          </button>
        ))}
      </div>
      <div className="flex items-center justify-center gap-4">
        <div className={`w-20 text-center text-2xl transition-all duration-500 ${phase === "in" ? "translate-x-16 opacity-0" : ""}`}>
          {input !== null && phase !== "out" && <Formula latex={fmt(input)} />}
        </div>
        <div className="rounded-2xl border-2 border-fg bg-surface-2 px-8 py-6 text-center">
          <p className="mb-1 text-xs tracking-widest text-muted uppercase">{t("machine")}</p>
          <Formula latex={`x\\ \\mapsto\\ ${latex}`} />
        </div>
        <div className={`w-20 text-center text-2xl transition-all duration-500 ${phase === "out" ? "opacity-100" : "-translate-x-8 opacity-0"}`}>
          {input !== null && phase === "out" && <span className="text-hl"><Formula latex={fmt(f(input))} /></span>}
        </div>
      </div>
      {table.length > 0 && (
        <table className="mx-auto border-collapse text-center">
          <tbody>
            <tr>
              <th className="border border-border px-3 py-1 font-normal text-muted">x</th>
              {table.map(([x]) => (
                <td key={x} className="border border-border px-3 py-1">
                  <Formula latex={fmt(x)} />
                </td>
              ))}
            </tr>
            <tr>
              <th className="border border-border px-3 py-1 font-normal text-muted">{t("output")}</th>
              {table.map(([x, y]) => (
                <td key={x} className="border border-border px-3 py-1">
                  <Formula latex={fmt(y)} />
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
}
