"use client";
/**
 * Maths input field based on MathLive.
 *
 * - Typing `/` makes a fraction, `^` a power, `sqrt` a square root.
 * - The decimal separator follows the language (comma in Dutch).
 * - Enter submits (handled by the parent through `onEnter`).
 * - A symbol bar under the field inserts fractions, powers, roots, brackets.
 * MathLive is loaded lazily because it only works in the browser.
 */
import { useEffect, useRef, useState } from "react";
import { useT } from "@/i18n/client";
import { Formula } from "./math";

type MathfieldLike = HTMLElement & {
  value: string;
  mathVirtualKeyboardPolicy: string;
  smartFence: boolean;
  menuItems: unknown[];
  focus(): void;
  insert(latex: string, options?: { selectionMode?: "placeholder" | "after"; focus?: boolean }): boolean;
};

/**
 * Buttons of the symbol bar. `#@` is the thing just typed (so "3" then the
 * fraction button gives 3 over an empty box), `#?` is an empty box to fill.
 */
const SYMBOLS: Array<{ id: string; label: string; insert: string; needsVariable?: boolean }> = [
  { id: "x", label: "x", insert: "x", needsVariable: true },
  { id: "frac", label: "\\frac{a}{b}", insert: "\\frac{#@}{#?}" },
  { id: "pow", label: "a^{b}", insert: "#@^{#?}" },
  { id: "sqrt", label: "\\sqrt{a}", insert: "\\sqrt{#?}" },
  { id: "paren", label: "(\\,)", insert: "\\left(#?\\right)" },
  { id: "minus", label: "-", insert: "-" },
  { id: "pi", label: "\\pi", insert: "\\pi" },
];

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
  toolbar = true,
  withVariable = false,
}: {
  value: string;
  onChange: (latex: string) => void;
  onEnter?: () => void;
  autoFocus?: boolean;
  label: string;
  disabled?: boolean;
  state?: "good" | "bad";
  /** Show the symbol bar and typing tip under the field. */
  toolbar?: boolean;
  /** Show the "x" button (when the answer contains a variable). */
  withVariable?: boolean;
}) {
  const ref = useRef<MathfieldLike>(null);
  const { locale, t } = useT();
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

  const insert = (latex: string) => {
    const mf = ref.current;
    if (!mf || disabled) return;
    mf.insert(latex, { selectionMode: "placeholder", focus: true });
    lastEmitted.current = mf.value;
    handlers.current.onChange(mf.value);
  };

  return (
    <div className="space-y-2">
      <div className={`rounded-[11px] ${state === "good" ? "ring-2 ring-good" : state === "bad" ? "ring-2 ring-bad" : ""}`}>
        {ready ? (
          <math-field ref={ref as never} aria-label={label} {...(disabled ? { "read-only": "" } : {})} />
        ) : (
          <div className="h-[3.4rem] rounded-[10px] border border-border-strong bg-surface" aria-hidden />
        )}
      </div>
      {toolbar && !disabled && (
        <div className="flex flex-wrap items-center gap-1.5">
          {SYMBOLS.filter((b) => withVariable || !b.needsVariable).map((b) => (
            <button
              key={b.id}
              type="button"
              // Keep the focus (and cursor) inside the math field.
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => insert(b.insert)}
              className="flex h-10 min-w-11 items-center justify-center rounded-md border border-border bg-surface px-2 hover:border-fg"
              aria-label={t(`sym_${b.id}` as never)}
              title={t(`sym_${b.id}` as never)}
            >
              <Formula latex={b.label} />
            </button>
          ))}
          <span className="ml-2 text-sm text-muted">{t("typingTip")}</span>
        </div>
      )}
    </div>
  );
}
