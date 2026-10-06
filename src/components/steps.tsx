"use client";
/**
 * Worked solution, revealed one step at a time. Each step shows the formula
 * (the changed part highlighted) and a short explanation.
 */
import type { Step } from "@/content/types";
import { useT } from "@/i18n/client";
import { Formula, Inline } from "./math";

export function StepList({ steps, shown }: { steps: Step[]; shown: number }) {
  const { l, t } = useT();
  return (
    <ol className="space-y-3">
      {steps.slice(0, shown).map((s, i) => (
        <li key={i} className="animate-in grid grid-cols-[2rem_1fr] items-baseline gap-3 rounded-lg border border-border bg-surface px-4 py-3">
          <span className="text-sm text-muted" aria-label={t("stepOf", { n: i + 1, total: steps.length })}>
            {i + 1}
          </span>
          <div>
            <Formula latex={s.latex} display />
            <p className="text-muted">
              <Inline text={l(s.note)} />
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}

/** Spoken version of a list of steps (for read-aloud). */
export function stepsToText(steps: Step[], locale: "nl" | "en"): string {
  return steps.map((s) => `$${s.latex}$. ${s.note[locale]}`).join(" ");
}
