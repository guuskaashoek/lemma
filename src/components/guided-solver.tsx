"use client";
/**
 * "Solve together": hint 3 as a guided walk through the worked solution.
 *
 * Every step that contains a blank (`\ask{...}`) shows an empty box; the
 * learner fills it in and the CAS checks it (any equivalent answer counts).
 * After two misses the box is filled in for them, with no penalty. Steps
 * without a blank are simply shown, one at a time.
 */
import { useState } from "react";
import type { WorkedSolution } from "@/content/types";
import { useT } from "@/i18n/client";
import { checkExpr } from "@/math/check";
import { replaceMacro } from "@/math/normalize";
import { Formula, Inline } from "./math";
import { MathInput } from "./math-input";
import { Button } from "./ui";

/** The content of the blank in a step, if any. */
function askOf(latex: string): string | null {
  let found: string | null = null;
  replaceMacro(latex, "\\ask", (inner) => {
    found ??= inner;
    return inner;
  });
  return found;
}

/** The step with its blank shown as an empty box. */
const withBox = (latex: string) => replaceMacro(latex, "\\ask", () => "\\boxed{\\;?\\;}");

export function GuidedSolver({ solution, onFinished }: { solution: WorkedSolution; onFinished?: () => void }) {
  const { t, l } = useT();
  const steps = solution.steps;
  // Index of the step being worked on; steps before it are done.
  const [current, setCurrent] = useState(1);
  const [value, setValue] = useState("");
  const [misses, setMisses] = useState(0);
  const [feedback, setFeedback] = useState<"wrong" | "shown" | null>(null);

  const finished = current >= steps.length;
  const step = steps[current];
  const ask = step ? askOf(step.latex) : null;

  const advance = () => {
    setCurrent((c) => c + 1);
    setValue("");
    setMisses(0);
    setFeedback(null);
    if (current + 1 >= steps.length) onFinished?.();
  };

  const check = () => {
    if (!ask) return advance();
    if (checkExpr({ latex: ask }, value).correct) return advance();
    if (misses + 1 >= 2) setFeedback("shown");
    else setFeedback("wrong");
    setMisses((m) => m + 1);
  };

  return (
    <div className="space-y-3">
      <ol className="space-y-2">
        {steps.slice(0, Math.min(current, steps.length)).map((s, i) => (
          <li key={i} className="animate-in grid grid-cols-[2rem_1fr] items-baseline gap-3 rounded-lg border border-border bg-surface px-4 py-2">
            <span className="text-sm text-muted">{i + 1}</span>
            <div>
              <Formula latex={s.latex} display />
              <p className="text-muted">
                <Inline text={l(s.note)} />
              </p>
            </div>
          </li>
        ))}
      </ol>

      {!finished && step && (
        <div className="animate-in rounded-xl border border-border-strong p-4">
          <p className="mb-1 text-sm text-muted">{t("stepOf", { n: current + 1, total: steps.length })}</p>
          <p className="mb-2 text-lg">
            <Inline text={l(step.note)} />
          </p>
          {ask ? (
            <>
              <Formula latex={feedback === "shown" ? step.latex : withBox(step.latex)} display />
              {feedback !== "shown" && (
                <>
                  <p className="mb-2 text-sm text-muted">{t("fillTheBox")}</p>
                  <MathInput value={value} onChange={setValue} onEnter={check} autoFocus label={t("fillTheBox")} withVariable={/[a-z]/i.test(ask)} />
                </>
              )}
              {feedback === "wrong" && <p className="mt-2 text-bad">{t("guidedWrong")}</p>}
              {feedback === "shown" && <p className="mt-2 text-muted">{t("guidedShown")}</p>}
              <div className="mt-3 flex gap-2">
                {feedback === "shown" ? (
                  <Button onClick={advance}>{t("next")}</Button>
                ) : (
                  <Button onClick={check}>{t("check")}</Button>
                )}
              </div>
            </>
          ) : (
            <>
              <Formula latex={step.latex} display />
              <Button className="mt-3" onClick={advance}>
                {t("next")}
              </Button>
            </>
          )}
        </div>
      )}

      {finished && <p className="rounded-lg border border-good bg-good-bg px-4 py-2 text-good">{t("guidedDone")}</p>}
    </div>
  );
}
