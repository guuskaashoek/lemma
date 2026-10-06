"use client";
/**
 * One exercise: question, answer input, layered hints and feedback.
 *
 * - Enter checks the answer; after a correct answer Enter continues.
 * - Hints come in three layers (nudge → rule → full solution). Using them is
 *   fine and costs nothing, but it is recorded.
 * - A wrong answer gets an explanation aimed at the most common mistake when
 *   we can recognise it, and a link back to older material when relevant.
 * - In tests there are no hints and one attempt per question.
 */
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { recordAttemptAction, recordFinalHintsAction } from "@/app/actions/progress";
import { getLessonEntry, getSkill } from "@/content/curriculum";
import { METAPHORS } from "@/content/metaphors";
import { MNEMONICS } from "@/content/mnemonics";
import { getRule } from "@/content/rules";
import type { Exercise } from "@/content/types";
import { useT } from "@/i18n/client";
import type { MessageKey } from "@/i18n/messages";
import { checkAnswer, roundHalfAwayFromZero, type CheckResult, type Submission } from "@/math/check";
import { evaluate, parse } from "@/math/cas";
import { FigureView } from "./figures";
import { IconCheck, IconCross, IconHint, IconPractice, IconRule } from "./icons";
import { Formula, Inline, RichText } from "./math";
import { MathInput } from "./math-input";
import { SpeakButton } from "./speak-button";
import { StepList, stepsToText } from "./steps";
import { HINT_EVENT, useCalculatorPolicy } from "./toolbox";
import { Button } from "./ui";

export type ExerciseResult = { correctFirstTry: boolean; hintsUsed: number; skillId: string };
export type SessionMode = "lesson" | "review" | "final" | "testout";

type Status = "answering" | "correct" | "revealed";

export function ExerciseCard({
  exercise,
  mode,
  contextId,
  contextLessonId,
  calculatorDefault,
  calculatorOffReason,
  registerPrimary,
  onFinished,
}: {
  exercise: Exercise;
  mode: SessionMode;
  contextId: string;
  /** Lesson currently being followed, to detect "old material". */
  contextLessonId?: string;
  calculatorDefault: "allowed" | "off";
  calculatorOffReason?: string;
  registerPrimary: (fn: () => void) => void;
  onFinished: (r: ExerciseResult) => void;
}) {
  const { t, l, locale } = useT();
  const isTest = mode === "final" || mode === "testout";
  const answer = exercise.answer;

  const [expr, setExprState] = useState("");
  const [sols, setSolsState] = useState<string[]>([""]);
  // Refs hold the latest input synchronously: Enter can arrive right after a
  // keystroke, before React has re-rendered with the new state.
  const exprRef = useRef("");
  const solsRef = useRef<string[]>([""]);
  const setExpr = (v: string) => {
    exprRef.current = v;
    setExprState(v);
  };
  const setSols = (update: (s: string[]) => string[]) => {
    solsRef.current = update(solsRef.current);
    setSolsState(solsRef.current);
  };
  const [choice, setChoice] = useState<number | null>(null);
  const [hints, setHints] = useState(0);
  const [tries, setTries] = useState(0);
  const [result, setResult] = useState<CheckResult | null>(null);
  const [status, setStatus] = useState<Status>("answering");
  const [firstTryCorrect, setFirstTryCorrect] = useState<boolean | null>(null);
  const started = useRef(0);
  useEffect(() => {
    started.current = Date.now();
  }, []);

  const calcPolicy = exercise.calculator ?? calculatorDefault;
  useCalculatorPolicy(calcPolicy === "allowed", calcPolicy === "off" ? calculatorOffReason : undefined);

  const submission = (noSolution = false): Submission =>
    answer.kind === "expr"
      ? { kind: "expr", latex: exprRef.current }
      : answer.kind === "solutions"
        ? { kind: "solutions", latex: solsRef.current, noSolution }
        : { kind: "choice", index: choice ?? -1 };

  const finish = useCallback(() => {
    if (hints > 0) void recordFinalHintsAction(contextId, exercise.generatorId, hints).catch(() => {});
    onFinished({ correctFirstTry: firstTryCorrect === true, hintsUsed: hints, skillId: exercise.skillId });
  }, [onFinished, firstTryCorrect, hints, exercise.skillId, exercise.generatorId, contextId]);

  const check = useCallback(
    (noSolution = false) => {
      const r = checkAnswer(answer, submission(noSolution), exercise.mistakes);
      setResult(r);
      // Empty or unreadable input does not count as an attempt.
      if (!r.correct && (r.reason === "empty" || r.reason === "invalid")) return;

      const firstTry = tries === 0;
      setTries((n) => n + 1);
      if (firstTry) setFirstTryCorrect(r.correct);
      void recordAttemptAction({
        mode,
        contextId,
        generatorId: exercise.generatorId,
        skillId: exercise.skillId,
        correct: r.correct,
        hintsUsed: hints,
        durationMs: Date.now() - started.current,
        mistakeId: !r.correct && r.reason === "mistake" ? (r.mistake?.id ?? null) : null,
        firstTry,
      }).catch(() => {});

      if (r.correct) setStatus("correct");
      else if (isTest) setStatus("revealed");
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [answer, choice, tries, hints, mode, contextId, exercise, isTest],
  );

  const reveal = () => {
    setHints(3);
    setStatus("revealed");
  };

  // Enter: check, or continue when done.
  useEffect(() => {
    registerPrimary(() => (status === "answering" ? check() : finish()));
  }, [registerPrimary, status, check, finish]);

  // "H" shortcut opens the next hint layer.
  useEffect(() => {
    if (isTest) return;
    const onHint = () => setHints((h) => Math.min(3, h + 1));
    window.addEventListener(HINT_EVENT, onHint);
    return () => window.removeEventListener(HINT_EVENT, onHint);
  }, [isTest]);

  const prompt = l(exercise.prompt);
  const done = status !== "answering";
  const inputState = result ? (result.correct ? "good" : result.reason === "empty" || result.reason === "invalid" ? undefined : "bad") : undefined;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-muted">
          <IconPractice width={18} height={18} />
          {t("practice")}
        </div>
        <SpeakButton primary text={() => (exercise.latex ? `${prompt} $${exercise.latex}$` : prompt)} />
      </div>

      <div className="text-xl">
        <RichText text={prompt} />
      </div>
      {exercise.latex && (
        <div className="rounded-xl border border-border bg-surface px-6 py-5 text-center text-2xl">
          <Formula latex={exercise.latex} display />
        </div>
      )}
      {exercise.figure && (
        <div className="rounded-xl border border-border bg-surface p-4">
          <FigureView figure={exercise.figure} />
        </div>
      )}

      {/* Answer input */}
      <div className="space-y-3">
        {answer.kind === "expr" && (
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <MathInput
                key={exercise.seed}
                value={expr}
                onChange={setExpr}
                onEnter={() => (status === "answering" ? check() : finish())}
                autoFocus
                label={t("yourAnswer")}
                disabled={done}
                state={inputState}
              />
            </div>
            {answer.unit && <span className="text-lg">{answer.unit}</span>}
          </div>
        )}

        {answer.kind === "solutions" && (
          <div className="space-y-2">
            {sols.map((v, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-24 shrink-0 text-muted">
                  <Formula latex={`${answer.variable}=`} />
                </span>
                <div className="flex-1">
                  <MathInput
                    value={v}
                    onChange={(val) => setSols((s) => s.map((x, j) => (j === i ? val : x)))}
                    onEnter={() => (status === "answering" ? check() : finish())}
                    autoFocus={i === 0}
                    label={`${t("solution")} ${i + 1}`}
                    disabled={done}
                    state={inputState}
                  />
                </div>
                {sols.length > 1 && !done && (
                  <Button type="button" variant="ghost" onClick={() => setSols((s) => s.filter((_, j) => j !== i))}>
                    {t("removeSolution")}
                  </Button>
                )}
              </div>
            ))}
            {!done && (
              <div className="flex gap-2">
                {sols.length < 4 && (
                  <Button type="button" variant="secondary" onClick={() => setSols((s) => [...s, ""])}>
                    + {t("addSolution")}
                  </Button>
                )}
                <Button type="button" variant="secondary" onClick={() => check(true)}>
                  {t("noSolution")}
                </Button>
              </div>
            )}
          </div>
        )}

        {answer.kind === "choice" && (
          <div role="radiogroup" aria-label={t("yourAnswer")} className="grid gap-2">
            {answer.options.map((o, i) => (
              <button
                key={i}
                role="radio"
                aria-checked={choice === i}
                disabled={done}
                onClick={() => setChoice(i)}
                className={`rounded-lg border px-4 py-3 text-left ${choice === i ? "border-fg bg-surface-2" : "border-border hover:border-border-strong"}`}
              >
                <span className="mr-3 text-muted">{String.fromCharCode(65 + i)}</span>
                {o.latex ? <Formula latex={o.latex} /> : o.text ? <Inline text={l(o.text)} /> : null}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Feedback */}
      {result && <Feedback result={result} exercise={exercise} status={status} contextLessonId={contextLessonId} />}

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3">
        {status === "answering" ? (
          <Button onClick={() => check()}>
            {t("check")} <kbd className="ml-1 text-xs opacity-60">Enter</kbd>
          </Button>
        ) : (
          <Button onClick={finish} autoFocus={answer.kind === "choice"}>
            {t("continue")} <kbd className="ml-1 text-xs opacity-60">Enter</kbd>
          </Button>
        )}
        {!isTest && status === "answering" && hints < 3 && (
          <Button variant="secondary" onClick={() => setHints((h) => h + 1)}>
            <IconHint width={18} height={18} /> {hints === 0 ? t("hint") : t("moreHelp")}
            <kbd className="ml-1 text-xs opacity-60">H</kbd>
          </Button>
        )}
        {!isTest && status === "answering" && tries >= 2 && (
          <Button variant="ghost" onClick={reveal}>
            {t("showSolution")}
          </Button>
        )}
        {!isTest && hints === 0 && status === "answering" && <span className="text-sm text-muted">{t("hintsAreFine")}</span>}
        {isTest && status === "answering" && <span className="text-sm text-muted">{t("testNoHints")}</span>}
      </div>

      {/* Hint layers */}
      {!isTest && hints > 0 && (
        <div className="space-y-3">
          <HintBox level={1} title={t("hint1")}>
            <RichText text={l(exercise.hints.nudge)} />
          </HintBox>
          {hints >= 2 && (
            <HintBox level={2} title={t("hint2")}>
              <RuleHint exercise={exercise} />
            </HintBox>
          )}
          {hints >= 3 && (
            <HintBox
              level={3}
              title={t("hint3")}
              speak={stepsToText(exercise.hints.solution.steps, locale)}
            >
              <StepList steps={exercise.hints.solution.steps} shown={exercise.hints.solution.steps.length} />
            </HintBox>
          )}
        </div>
      )}
    </div>
  );
}

function HintBox({ title, children, speak }: { level: number; title: string; children: React.ReactNode; speak?: string }) {
  return (
    <section className="animate-in rounded-xl border border-border p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 font-semibold">
          <IconHint width={18} height={18} /> {title}
        </h3>
        {speak && <SpeakButton text={speak} />}
      </div>
      {children}
    </section>
  );
}

/** Hint 2: the rule, with its card, mnemonic and metaphor. */
function RuleHint({ exercise }: { exercise: Exercise }) {
  const { l, t } = useT();
  const { rule } = exercise.hints;
  const card = rule.ruleId ? getRule(rule.ruleId) : undefined;
  const mnemonic = rule.mnemonic ? MNEMONICS[rule.mnemonic] : undefined;
  const metaphor = rule.metaphor ? METAPHORS[rule.metaphor] : undefined;
  return (
    <div className="space-y-3">
      <RichText text={l(rule.text)} />
      {mnemonic && (
        <p className="rounded-lg bg-surface-2 px-3 py-2">
          <span className="text-sm text-muted">{t("mnemonic")}: </span>
          <strong>{l(mnemonic.phrase)}</strong>
        </p>
      )}
      {metaphor && (
        <p className="rounded-lg bg-surface-2 px-3 py-2">
          <span className="text-sm text-muted">{l(metaphor.name)}: </span>
          {l(metaphor.short)}
        </p>
      )}
      {card && (
        <Link href={`/rules#${card.id}`} target="_blank" className="inline-flex items-center gap-2 underline underline-offset-4">
          <IconRule width={18} height={18} /> {t("rule")}: {l(card.name)}
        </Link>
      )}
    </div>
  );
}

/** How the correct answer is shown after revealing it. */
function answerLatex(exercise: Exercise): string {
  const a = exercise.answer;
  if (a.kind === "expr") {
    if (a.form === "decimal") {
      const v = evaluate(parse(a.latex));
      return v === null ? a.latex : String(roundHalfAwayFromZero(v, a.decimals ?? 2));
    }
    return a.latex;
  }
  if (a.kind === "solutions") {
    return a.values.length === 0 ? "\\emptyset" : a.values.map((v) => `${a.variable}=${v}`).join(" \\lor ");
  }
  return "";
}

function Feedback({
  result,
  exercise,
  status,
  contextLessonId,
}: {
  result: CheckResult;
  exercise: Exercise;
  status: Status;
  contextLessonId?: string;
}) {
  const { t, l } = useT();

  if (result.correct) {
    return (
      <div role="status" className="animate-in flex items-center gap-3 rounded-xl border border-good bg-good-bg px-4 py-3 text-good">
        <IconCheck />
        <span className="font-semibold">{t("correct")}</span>
      </div>
    );
  }

  let message: string;
  if (result.reason === "empty") message = t("emptyAnswer");
  else if (result.reason === "invalid") message = t("invalidAnswer");
  else if (result.reason === "mistake" && result.mistake) message = l(result.mistake.explain);
  else if (result.reason === "form") {
    const key: Record<string, MessageKey> = {
      fraction: "formFraction",
      integer: "formInteger",
      factored: "formFactored",
      expanded: "formExpanded",
    };
    message =
      result.form === "decimal"
        ? result.decimals === 1
          ? t("formDecimal1")
          : t("formDecimal", { n: result.decimals ?? 2 })
        : t(key[result.form ?? ""] ?? "notYet");
  } else if (result.note === "missing-solution") message = t("missingSolution");
  else if (result.note === "extra-solution") message = t("extraSolution");
  else message = t("notYet");

  const neutral = result.reason === "empty" || result.reason === "invalid";

  // Link back to older material when the mistake belongs to an earlier lesson.
  const skillId = (result.reason === "mistake" && result.mistake?.relatedSkill) || exercise.skillId;
  const skill = getSkill(skillId);
  const oldLesson = skill && skill.lessonId !== contextLessonId ? getLessonEntry(skill.lessonId) : undefined;
  const oldRule = skill?.ruleIds[0] ? getRule(skill.ruleIds[0]) : undefined;

  return (
    <div
      role="alert"
      className={`animate-in space-y-2 rounded-xl border px-4 py-3 ${neutral ? "border-border-strong" : "border-bad bg-bad-bg"}`}
    >
      <p className={`flex items-start gap-3 ${neutral ? "" : "text-bad"}`}>
        {!neutral && <IconCross className="mt-1 shrink-0" />}
        <span>
          <Inline text={message} />
        </span>
      </p>
      {!neutral && status === "answering" && <p className="text-sm text-muted">{t("tryAgain")}</p>}
      {status === "revealed" && (
        <p>
          {t("theAnswerWas")} <Formula latex={answerLatex(exercise)} />
        </p>
      )}
      {!neutral && oldLesson && (
        <p className="text-sm">
          {t("repeatOldTopic")}{" "}
          <Link href={`/lesson/${oldLesson.lesson.id}`} target="_blank" className="underline underline-offset-4">
            {t("openLesson")}: {l(oldLesson.lesson.title)}
          </Link>
          {oldRule && (
            <>
              {" · "}
              <Link href={`/rules#${oldRule.id}`} target="_blank" className="underline underline-offset-4">
                {t("rule")}: {l(oldRule.name)}
              </Link>
            </>
          )}
        </p>
      )}
    </div>
  );
}
