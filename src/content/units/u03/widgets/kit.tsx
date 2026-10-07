"use client";
/**
 * Small building blocks for the unit 3 widgets.
 *
 * Widgets must not import `@/components/math`: that module reads the rule
 * cards, which are built from all unit bundles, and this unit's bundle is
 * still loading when its widgets are imported. So formulas are rendered here
 * with KaTeX and the shared colour coding directly.
 */
import katex from "katex";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useT } from "@/i18n/client";
import type { Loc } from "@/i18n/locale";
import { colorize, KATEX_OPTIONS } from "@/math/markup";

/** An inline formula with the app's colour coding (decimal comma in Dutch). */
export function Tex({ latex, className = "" }: { latex: string; className?: string }) {
  const { locale } = useT();
  const html = useMemo(() => {
    const local = locale === "nl" ? latex.replace(/(\d)\.(\d)/g, "$1{,}$2") : latex;
    return katex.renderToString(colorize(local), { ...KATEX_OPTIONS, macros: { ...KATEX_OPTIONS.macros } });
  }, [latex, locale]);
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
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
  pressed,
  label,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
  quiet?: boolean;
  pressed?: boolean;
  label?: string;
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
          : `min-w-11 rounded-lg border px-3 py-2 text-sm hover:border-fg disabled:opacity-40 ${pressed ? "border-fg bg-surface-2" : "border-border-strong"}`
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
      timer.current = setTimeout(
        () => {
          setStep(i);
          run(i + 1);
        },
        i === 1 ? 300 : delay,
      );
    };
    run(1);
  };
  return { step, setStep, next, reset, play, playing, done: step >= max };
}

/**
 * A timer that repeats a callback a number of times, started from a click
 * (for "walk to the answer" buttons). Cleared on unmount.
 */
export function useRepeat() {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [running, setRunning] = useState(false);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  const stop = () => {
    if (timer.current) clearTimeout(timer.current);
    setRunning(false);
  };
  /** Calls `tick` up to `times` times, `delay` ms apart; stops early when it returns false. */
  const start = (times: number, tick: () => boolean, delay = 450) => {
    stop();
    if (times <= 0) return;
    setRunning(true);
    const run = (left: number) => {
      timer.current = setTimeout(() => {
        const more = tick();
        if (left <= 1 || !more) setRunning(false);
        else run(left - 1);
      }, delay);
    };
    run(times);
  };
  return { start, stop, running };
}

/** CSS transition that is switched off for people who prefer less motion. */
export const MOTION = "transition-all duration-500 ease-out motion-reduce:transition-none";

/** A short line of feedback under a widget, read aloud by screen readers. */
export function Say({ children, hl = false }: { children: ReactNode; hl?: boolean }) {
  return (
    <p className={`min-h-7 text-center text-lg ${hl ? "text-hl" : ""}`} aria-live="polite">
      {children}
    </p>
  );
}
