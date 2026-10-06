"use client";
/**
 * Maths input field based on MathLive.
 *
 * - Typing `/` makes a fraction, `^` a power, `sqrt` a square root.
 * - The decimal separator follows the language (comma in Dutch).
 * - Enter submits (handled by the parent through `onEnter`).
 * MathLive is loaded lazily because it only works in the browser.
 */
import { useEffect, useRef, useState } from "react";
import { useT } from "@/i18n/client";

type MathfieldLike = HTMLElement & {
  value: string;
  mathVirtualKeyboardPolicy: string;
  smartFence: boolean;
  menuItems: unknown[];
  focus(): void;
};

let configured: Promise<void> | null = null;

/** Loads MathLive once and applies the global configuration. */
function loadMathLive(decimal: "," | "."): Promise<void> {
  configured ??= import("mathlive").then(({ MathfieldElement }) => {
    MathfieldElement.fontsDirectory = "/mathlive/fonts";
    MathfieldElement.soundsDirectory = null;
    MathfieldElement.plonkSound = null;
    MathfieldElement.keypressSound = null;
  });
  return configured.then(async () => {
    const { MathfieldElement } = await import("mathlive");
    MathfieldElement.decimalSeparator = decimal;
  });
}

export function MathInput({
  value,
  onChange,
  onEnter,
  autoFocus = false,
  label,
  disabled = false,
  state,
}: {
  value: string;
  onChange: (latex: string) => void;
  onEnter?: () => void;
  autoFocus?: boolean;
  label: string;
  disabled?: boolean;
  state?: "good" | "bad";
}) {
  const ref = useRef<MathfieldLike>(null);
  const { locale } = useT();
  const [ready, setReady] = useState(false);
  // Keep the latest callbacks without re-binding listeners.
  const handlers = useRef({ onChange, onEnter });
  // Last value the field itself reported. Used so we never overwrite what the
  // learner is typing with an older value from a pending React render.
  const lastEmitted = useRef(value);
  useEffect(() => {
    handlers.current = { onChange, onEnter };
  }, [onChange, onEnter]);

  useEffect(() => {
    let cancelled = false;
    loadMathLive(locale === "nl" ? "," : ".").then(() => !cancelled && setReady(true));
    return () => {
      cancelled = true;
    };
  }, [locale]);

  useEffect(() => {
    const mf = ref.current;
    if (!ready || !mf) return;
    mf.mathVirtualKeyboardPolicy = "manual";
    mf.smartFence = true;
    mf.menuItems = [];
    const onInput = () => {
      lastEmitted.current = mf.value;
      handlers.current.onChange(mf.value);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        e.stopPropagation();
        handlers.current.onEnter?.();
      }
    };
    mf.addEventListener("input", onInput);
    mf.addEventListener("keydown", onKey, true);
    if (autoFocus) setTimeout(() => mf.focus(), 30);
    return () => {
      mf.removeEventListener("input", onInput);
      mf.removeEventListener("keydown", onKey, true);
    };
  }, [ready, autoFocus]);

  // Apply value changes that come from outside (e.g. clearing the field),
  // but not the echo of our own input events.
  useEffect(() => {
    const mf = ref.current;
    if (!ready || !mf || value === lastEmitted.current) return;
    lastEmitted.current = value;
    mf.value = value;
  }, [value, ready]);

  return (
    <div
      className={`rounded-[11px] ${state === "good" ? "ring-2 ring-good" : state === "bad" ? "ring-2 ring-bad" : ""}`}
    >
      {ready ? (
        <math-field ref={ref as never} aria-label={label} {...(disabled ? { "read-only": "" } : {})} />
      ) : (
        <div className="h-[3.4rem] rounded-[10px] border border-border-strong bg-surface" aria-hidden />
      )}
    </div>
  );
}
