"use client";
/**
 * Small building blocks for the unit 1 widgets.
 *
 * Widgets must not import `@/components/math`: that module reads the rule
 * cards, which are built from all unit bundles, and this unit's bundle is
 * still loading when its widgets are imported. So formulas are rendered here
 * with KaTeX and the shared colour coding directly.
 */
import katex from "katex";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useT } from "@/i18n/client";
import type { Loc, Locale } from "@/i18n/locale";
import { colorize, KATEX_OPTIONS } from "@/math/markup";

/** `2.5` → `2{,}5` in Dutch (same rule as the app's formula component). */
export function localize(latex: string, locale: Locale): string {
  return locale === "nl" ? latex.replace(/(\d)\.(\d)/g, "$1{,}$2") : latex;
}

/** A number as plain text for SVG labels: real minus sign, `2,5` in Dutch. */
export function numText(value: number, locale: Locale, decimals = 4): string {
  const v = Math.round(value * 10 ** decimals) / 10 ** decimals;
  const s = String(Math.abs(v));
  return (v < 0 ? "−" : "") + (locale === "nl" ? s.replace(".", ",") : s);
}

/** An inline formula with the app's colour coding. */
export function Tex({ latex, className = "" }: { latex: string; className?: string }) {
  const { locale } = useT();
  const html = useMemo(
    () => katex.renderToString(colorize(localize(latex, locale)), { ...KATEX_OPTIONS, macros: { ...KATEX_OPTIONS.macros } }),
    [latex, locale],
  );
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

/** Text with inline `$...$` formulas. */
export function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\$[^$]+\$)/).map((part, i) =>
        part.startsWith("$") && part.length > 1 ? <Tex key={i} latex={part.slice(1, -1)} /> : <span key={i}>{part}</span>,
      )}
    </>
  );
}

/** Text in the current language. */
export function useLoc() {
  const { locale } = useT();
  return { locale, l: (text: Loc) => text[locale] };
}

/** The standard widget button. */
export function Btn({
  onClick,
  disabled,
  children,
  quiet = false,
  label,
  pressed,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
  quiet?: boolean;
  label?: string;
  pressed?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={pressed}
      className={
        quiet
          ? "rounded-lg px-3 py-2 text-sm text-muted hover:text-fg"
          : `rounded-lg border px-3 py-2 text-sm hover:border-fg disabled:opacity-40 ${pressed ? "border-fg bg-surface-2" : "border-border-strong"}`
      }
    >
      {children}
    </button>
  );
}

/** Shared texts for the widget buttons. */
export const UI = {
  next: { nl: "Volgende stap", en: "Next step" },
  play: { nl: "▶ Laat zien", en: "▶ Show me" },
  reset: { nl: "↺ Opnieuw", en: "↺ Start over" },
} satisfies Record<string, Loc>;

/**
 * A step counter from 0 to `max` with an optional autoplay. Every change
 * starts from a click, so there is no state change inside effects.
 */
export function useSteps(max: number, delay = 900) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  const stop = () => {
    if (timer.current) clearTimeout(timer.current);
    setPlaying(false);
  };
  const next = () => setStep((s) => Math.min(max, s + 1));
  const reset = () => {
    stop();
    setStep(0);
  };
  const play = () => {
    stop();
    setStep(0);
    setPlaying(true);
    const run = (i: number) => {
      if (i > max) {
        setPlaying(false);
        return;
      }
      timer.current = setTimeout(() => {
        setStep(i);
        run(i + 1);
      }, i === 1 ? 300 : delay);
    };
    run(1);
  };
  return { step, setStep, next, reset, play, playing, done: step >= max };
}

/** Next / play / reset buttons for a stepped widget. */
export function StepButtons({
  s,
  nextLabel = UI.next,
}: {
  s: ReturnType<typeof useSteps>;
  nextLabel?: Loc;
}) {
  const { l } = useLoc();
  return (
    <div className="flex flex-wrap justify-center gap-2">
      <Btn onClick={s.next} disabled={s.done || s.playing}>
        {l(nextLabel)}
      </Btn>
      <Btn onClick={s.play} disabled={s.playing}>
        {l(UI.play)}
      </Btn>
      <Btn quiet onClick={s.reset}>
        {l(UI.reset)}
      </Btn>
    </div>
  );
}

/** CSS transition that is switched off for people who prefer less motion. */
export const MOTION = "transition-all duration-500 ease-out motion-reduce:transition-none";
