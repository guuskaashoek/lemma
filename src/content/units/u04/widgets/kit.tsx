"use client";
/**
 * Small building blocks for the unit 4 widgets.
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

/** A number as plain text for SVG labels: `2.5` → `2,5` in Dutch. */
export function numText(value: number, locale: Locale, decimals = 2): string {
  const r = Math.round(value * 10 ** decimals) / 10 ** decimals;
  const s = String(Object.is(r, -0) ? 0 : r);
  return locale === "nl" ? s.replace(".", ",") : s;
}

/** A number as LaTeX, rounded: `2.5` → `2.5` (localised by `Tex`). */
export function numTex(value: number, decimals = 2): string {
  const r = Math.round(value * 10 ** decimals) / 10 ** decimals;
  return String(Object.is(r, -0) ? 0 : r);
}

/** A number after an operator: `3` or `(-3)`. */
export const parTex = (n: number) => (n < 0 ? `(${numTex(n)})` : numTex(n));

/** An inline formula with the app's colour coding. */
export function Tex({ latex, className = "" }: { latex: string; className?: string }) {
  const { locale } = useT();
  const html = useMemo(
    () => katex.renderToString(colorize(localize(latex, locale)), { ...KATEX_OPTIONS, macros: { ...KATEX_OPTIONS.macros } }),
    [latex, locale],
  );
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
          : `min-h-10 min-w-10 rounded-lg border px-3 py-2 text-sm hover:border-fg disabled:opacity-40 ${pressed ? "border-fg bg-surface-2" : "border-border-strong"}`
      }
    >
      {children}
    </button>
  );
}

/** Shared texts for the widget buttons. */
export const UI = {
  play: { nl: "▶ Laat zien", en: "▶ Show me" },
  reset: { nl: "↺ Opnieuw", en: "↺ Start over" },
} satisfies Record<string, Loc>;

/** CSS transition that is switched off for people who prefer less motion. */
export const MOTION = "transition-all duration-500 ease-out motion-reduce:transition-none";

/** Does the user prefer less motion? (Only read inside event handlers.) */
function reducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;
}

/**
 * A list of numbers that glides to new values in a short animation.
 * `set` is called from a click; the animation runs with requestAnimationFrame
 * and is skipped when the user prefers less motion.
 */
export function useGlide(initial: number[], ms = 350) {
  const [value, setValue] = useState(initial);
  const frame = useRef<number | null>(null);
  const current = useRef(initial);
  useEffect(
    () => () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    },
    [],
  );
  const set = (target: number[]) => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    const from = current.current;
    if (reducedMotion() || typeof requestAnimationFrame === "undefined") {
      current.current = target;
      setValue(target);
      return;
    }
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / ms);
      const e = 1 - (1 - t) ** 3;
      const v = target.map((x, i) => from[i] + (x - from[i]) * e);
      current.current = v;
      setValue(v);
      frame.current = t < 1 ? requestAnimationFrame(tick) : null;
    };
    frame.current = requestAnimationFrame(tick);
  };
  return [value, set] as const;
}

/**
 * Runs `step(i)` for i = 1, 2, ... with a pause in between, until it
 * returns false. Started from a click; stopped on unmount or `stop()`.
 */
export function usePlayer(delay = 700) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [playing, setPlaying] = useState(false);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  const stop = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    setPlaying(false);
  };
  const play = (step: (i: number) => boolean) => {
    stop();
    setPlaying(true);
    const run = (i: number) => {
      timer.current = setTimeout(() => {
        if (step(i)) run(i + 1);
        else setPlaying(false);
      }, i === 1 ? 250 : delay);
    };
    run(1);
  };
  return { play, stop, playing };
}
