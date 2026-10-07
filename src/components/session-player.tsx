"use client";
/**
 * Plays a lesson, a test or a review session.
 *
 * A lesson is: explanation screens (one idea each) → worked examples (step by
 * step) → practice from easy to hard → summary with XP. Tests and reviews
 * skip the screens. Enter always does the obvious next thing.
 */
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { completeLessonAction, completeReviewAction, completeTestAction } from "@/app/actions/progress";
import { makeExercise } from "@/content/generators";
import { METAPHORS } from "@/content/metaphors";
import { MNEMONICS } from "@/content/mnemonics";
import { getRule } from "@/content/rules";
import type { Difficulty, InfoPanel, Screen } from "@/content/types";
import { useT } from "@/i18n/client";
import type { Loc } from "@/i18n/locale";
import { outcomeFor, worstOutcome, type SkillOutcome } from "@/lib/progress-logic";
import { ExerciseCard, type ExerciseResult, type SessionMode } from "./exercise-card";
import { IconCross, IconExample, IconExplain, IconInfo, IconLock, IconRule } from "./icons";
import { Formula, Inline, RichText } from "./math";
import { SpeakButton } from "./speak-button";
import { StepList, stepsToText } from "./steps";
import { useCalculatorPolicy } from "./toolbox";
import { Visual, describeVisual } from "@/visuals/visual";
import { Button, ProgressBar } from "./ui";

export type SessionItem = { generatorId: string; difficulty: Difficulty };

export type SessionProps = {
  mode: SessionMode;
  /** Lesson id, unit id or "review". */
  contextId: string;
  title: Loc;
  screens?: Screen[];
  items: SessionItem[];
  seed: string;
  calculator: "allowed" | "off";
  calculatorOffReason?: Loc;
  info?: InfoPanel;
};

type Summary = { correct: number; total: number; hints: number; xp: number; passed?: boolean };

export function SessionPlayer(props: SessionProps) {
  const { t, l } = useT();
  const screens = props.screens ?? [];
  const exercises = useMemo(
    () => props.items.map((it, i) => makeExercise(it.generatorId, it.difficulty, `${props.seed}:${i}`)),
    [props.items, props.seed],
  );

  const [index, setIndex] = useState(0); // over screens + exercises
  const [results, setResults] = useState<ExerciseResult[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [saving, setSaving] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const startedAt = useRef(0);
  useEffect(() => {
    startedAt.current = Date.now();
  }, []);
  const primary = useRef<() => void>(() => {});
  const registerPrimary = useCallback((fn: () => void) => {
    primary.current = fn;
  }, []);

  const total = screens.length + exercises.length;
  const onScreen = index < screens.length;

  // Lesson screens follow the lesson's calculator policy; exercises set their own.
  useCalculatorPolicy(!onScreen || props.calculator === "allowed", props.calculatorOffReason && l(props.calculatorOffReason));

  // Global Enter key (inputs handle their own Enter).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Enter" || e.metaKey || e.ctrlKey || e.altKey) return;
      const el = e.target as HTMLElement;
      if (["BUTTON", "A", "INPUT", "TEXTAREA", "SELECT", "MATH-FIELD"].includes(el.tagName)) return;
      e.preventDefault();
      primary.current();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const finishSession = async (all: ExerciseResult[]) => {
    setSaving(true);
    const correct = all.filter((r) => r.correctFirstTry).length;
    const hints = all.filter((r) => r.hintsUsed > 0).length;
    const seconds = Math.round((Date.now() - startedAt.current) / 1000);
    // One spaced-repetition rating per skill: the worst outcome counts.
    const perSkill: Record<string, SkillOutcome[]> = {};
    for (const r of all) (perSkill[r.skillId] ??= []).push(outcomeFor(r.correctFirstTry, r.hintsUsed));
    const outcomes = Object.fromEntries(Object.entries(perSkill).map(([k, v]) => [k, worstOutcome(v)]));

    try {
      if (props.mode === "lesson") {
        const { xp } = await completeLessonAction({ lessonId: props.contextId, correctFirstTry: correct, total: all.length, seconds }, outcomes);
        setSummary({ correct, total: all.length, hints, xp });
      } else if (props.mode === "review") {
        const { xp } = await completeReviewAction({ correct, total: all.length, seconds }, outcomes);
        setSummary({ correct, total: all.length, hints, xp });
      } else {
        const r = await completeTestAction({ unitId: props.contextId, mode: props.mode, correct, total: all.length, seconds }, outcomes);
        setSummary({ correct, total: all.length, hints, xp: r.xp, passed: r.passed });
      }
    } catch {
      setSummary({ correct, total: all.length, hints, xp: 0 });
    } finally {
      setSaving(false);
    }
  };

  const onExerciseDone = (r: ExerciseResult) => {
    const all = [...results, r];
    setResults(all);
    if (index + 1 >= total) void finishSession(all);
    else setIndex(index + 1);
  };

  if (summary || saving) return <SummaryView summary={summary} mode={props.mode} saving={saving} />;

  const exerciseIndex = index - screens.length;
  return (
    <div className="mx-auto max-w-3xl">
      {/* Top bar: leave, progress, info */}
      <div className="mb-10 flex items-center gap-4">
        <Link href="/learn" aria-label={t("exitLesson")} className="text-muted hover:text-fg">
          <IconCross />
        </Link>
        <ProgressBar value={index / total} label={l(props.title)} />
        {props.info && (
          <button onClick={() => setShowInfo((v) => !v)} className="flex shrink-0 items-center gap-1.5 text-sm whitespace-nowrap text-muted hover:text-fg" aria-expanded={showInfo}>
            <IconInfo width={18} height={18} /> {t("infoPanel")}
          </button>
        )}
      </div>

      {showInfo && props.info && <InfoView info={props.info} onClose={() => setShowInfo(false)} />}

      {onScreen ? (
        <ScreenView
          key={index}
          screen={screens[index]}
          registerPrimary={registerPrimary}
          onNext={() => setIndex(index + 1)}
          calculatorOff={props.calculator === "off" ? props.calculatorOffReason : undefined}
          first={index === 0}
        />
      ) : (
        <div key={index} className="animate-in">
          {props.mode !== "lesson" && (
            <p className="mb-4 text-sm text-muted">{t("question", { n: exerciseIndex + 1, total: exercises.length })}</p>
          )}
          <ExerciseCard
            exercise={exercises[exerciseIndex]}
            mode={props.mode}
            contextId={props.contextId}
            contextLessonId={props.mode === "lesson" ? props.contextId : undefined}
            calculatorDefault={props.calculator}
            calculatorOffReason={props.calculatorOffReason && l(props.calculatorOffReason)}
            registerPrimary={registerPrimary}
            onFinished={onExerciseDone}
          />
        </div>
      )}
    </div>
  );
}

/** One explanation or example screen. */
function ScreenView({
  screen,
  registerPrimary,
  onNext,
  calculatorOff,
  first,
}: {
  screen: Screen;
  registerPrimary: (fn: () => void) => void;
  onNext: () => void;
  calculatorOff?: Loc;
  first: boolean;
}) {
  const { t, l, locale } = useT();
  const [shown, setShown] = useState(1);
  const steps = screen.kind === "example" ? screen.solution.steps : [];
  const allShown = screen.kind !== "example" || shown >= steps.length;

  useEffect(() => {
    registerPrimary(() => (allShown ? onNext() : setShown((n) => n + 1)));
  }, [registerPrimary, allShown, onNext]);

  const speakText =
    screen.kind === "explain"
      ? `${l(screen.title)}. ${l(screen.body)}${screen.latex ? ` $${screen.latex}$` : ""}`
      : screen.kind === "visual"
        ? `${l(screen.title)}. ${l(screen.body)} ${describeVisual(screen.visual, locale)} ${screen.task ? l(screen.task) : ""}`
        : `${l(screen.title)}. ${l(screen.problem)} ${stepsToText(steps.slice(0, shown), locale)}`;

  return (
    <div className="animate-in space-y-6">
      {first && calculatorOff && (
        <p className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm text-muted">
          <IconLock width={16} height={16} /> {l(calculatorOff)}
        </p>
      )}
      <div className="flex items-center justify-between gap-4">
        <span className="flex items-center gap-2 text-sm text-muted">
          {screen.kind === "example" ? <IconExample width={18} height={18} /> : <IconExplain width={18} height={18} />}
          {screen.kind === "example" ? t("example") : t("explain")}
        </span>
        <SpeakButton primary text={speakText} />
      </div>
      <h1 className="text-3xl font-semibold tracking-tight">{l(screen.title)}</h1>

      {screen.kind === "explain" ? (
        <>
          <RichText text={l(screen.body)} className="text-xl" />
          {screen.latex && (
            <div className="rounded-xl border border-border bg-surface px-6 py-5 text-center">
              <Formula latex={screen.latex} display />
            </div>
          )}
          {screen.mnemonic && <MnemonicCard id={screen.mnemonic} />}
          {screen.metaphor && (
            <div className="rounded-xl border border-border-strong p-5">
              <p className="mb-2 text-sm text-muted">{t("metaphor")}</p>
              <p className="mb-2 text-lg font-semibold">{l(METAPHORS[screen.metaphor].name)}</p>
              <RichText text={l(METAPHORS[screen.metaphor].long)} />
            </div>
          )}
          {screen.ruleId && getRule(screen.ruleId) && (
            <Link href={`/rules#${screen.ruleId}`} target="_blank" className="inline-flex items-center gap-2 underline underline-offset-4">
              <IconRule width={18} height={18} /> {t("rule")}: {l(getRule(screen.ruleId)!.name)}
            </Link>
          )}
        </>
      ) : screen.kind === "visual" ? (
        <>
          <RichText text={l(screen.body)} className="text-xl" />
          <div className="rounded-xl border border-border bg-surface p-5">
            <Visual spec={screen.visual} />
          </div>
          {screen.task && (
            <p className="flex items-start gap-2 rounded-lg border border-border-strong px-4 py-3">
              <strong className="shrink-0">{t("tryIt")}:</strong>
              <span>
                <Inline text={l(screen.task)} />
              </span>
            </p>
          )}
          {screen.metaphor && (
            <p className="text-muted">
              <strong>{l(METAPHORS[screen.metaphor].name)}:</strong> <Inline text={l(METAPHORS[screen.metaphor].short)} />
            </p>
          )}
        </>
      ) : (
        <>
          <div className="text-xl">
            <RichText text={l(screen.problem)} />
          </div>
          {screen.visual ? (
            <div className="grid gap-5 lg:grid-cols-2">
              <div className="rounded-xl border border-border bg-surface p-4">
                <Visual spec={screen.visual} />
              </div>
              <StepList steps={steps} shown={shown} />
            </div>
          ) : (
            <StepList steps={steps} shown={shown} />
          )}
        </>
      )}

      <div className="flex gap-3">
        {allShown ? (
          <Button onClick={onNext}>
            {t("next")} <kbd className="ml-1 text-xs opacity-60">Enter</kbd>
          </Button>
        ) : (
          <>
            <Button onClick={() => setShown((n) => n + 1)}>
              {t("nextStep")} <kbd className="ml-1 text-xs opacity-60">Enter</kbd>
            </Button>
            <Button variant="ghost" onClick={() => setShown(steps.length)}>
              {t("showAllSteps")}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

export function MnemonicCard({ id }: { id: keyof typeof MNEMONICS }) {
  const { t, l } = useT();
  const m = MNEMONICS[id];
  return (
    <div className="rounded-xl border border-border-strong p-5">
      <p className="mb-2 text-sm text-muted">{t("mnemonic")}</p>
      <p className="mb-3 text-xl font-semibold">{l(m.phrase)}</p>
      <ul className="space-y-1.5">
        {m.parts.map((p) => (
          <li key={p.key} className="grid grid-cols-[4rem_1fr] gap-3">
            <strong className="font-mono">{p.key}</strong>
            <span>
              {l(p.meaning)}
              {p.latex && (
                <span className="mt-1 block">
                  <Formula latex={l(p.latex)} />
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function InfoView({ info, onClose }: { info: InfoPanel; onClose: () => void }) {
  const { t, l } = useT();
  const rows: Array<[string, Loc]> = [
    [t("infoWhat"), info.what],
    [t("infoWhy"), info.why],
    [t("infoLater"), info.later],
  ];
  return (
    <section className="animate-in mb-8 rounded-xl border border-border-strong bg-surface p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-semibold">
          <IconInfo /> {t("infoPanel")}
        </h2>
        <div className="flex items-center gap-2">
          <SpeakButton text={rows.map(([q, a]) => `${q} ${l(a)}`).join(" ")} />
          <button onClick={onClose} aria-label={t("close")} className="text-muted hover:text-fg">
            <IconCross />
          </button>
        </div>
      </div>
      <dl className="space-y-3">
        {rows.map(([q, a]) => (
          <div key={q}>
            <dt className="text-sm text-muted">{q}</dt>
            <dd>
              <Inline text={l(a)} />
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function SummaryView({ summary, mode, saving }: { summary: Summary | null; mode: SessionMode; saving: boolean }) {
  const { t } = useT();
  if (saving || !summary) return <p className="text-center text-muted">{t("loading")}</p>;
  const isTest = mode === "final" || mode === "testout";
  return (
    <div className="animate-in mx-auto max-w-lg space-y-6 py-10 text-center">
      <h1 className="text-4xl font-semibold tracking-tight">
        {mode === "lesson" ? t("lessonComplete") : mode === "review" ? t("reviewDone") : t("testComplete")}
      </h1>
      <p className="text-5xl font-semibold">{t("xpEarned", { n: summary.xp })}</p>
      <p className="text-lg">{t("scoreLine", { correct: summary.correct, total: summary.total })}</p>
      {!isTest && <p className="text-muted">{t("hintsUsedLine", { n: summary.hints })}</p>}
      {isTest && (
        <p className={`rounded-xl border px-4 py-3 ${summary.passed ? "border-good bg-good-bg text-good" : "border-border-strong"}`}>
          {summary.passed ? (mode === "final" ? t("passed") : t("testOutPassed")) : t("notPassed")}
        </p>
      )}
      <Link href="/learn" autoFocus className="inline-block rounded-lg bg-invert-bg px-5 py-3 font-semibold text-invert-fg">
        {t("backToRoadmap")}
      </Link>
    </div>
  );
}
