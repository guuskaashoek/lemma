"use client";
/**
 * The toolbox: calculator, colour legend and shortcut list, available on every
 * page, plus the global keyboard shortcuts.
 *
 * Shortcuts (same in both languages):
 *   K calculator · L legend · H hint · S read aloud · ? shortcut list
 * Inside an input field hold Ctrl (Ctrl+K, Ctrl+H, ...), so typing letters
 * like "h" in an answer still works.
 *
 * Lessons tell the toolbox whether the calculator is allowed via
 * `useCalculatorPolicy()`.
 */
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { CALC_BUTTONS, type CalcButton } from "@/calculator/buttons";
import { CalcError, evaluate, formatResult, type AngleMode } from "@/calculator/engine";
import { useT } from "@/i18n/client";
import type { MessageKey } from "@/i18n/messages";
import {
  IconCalculator,
  IconCross,
  IconExample,
  IconExplain,
  IconHint,
  IconKeyboard,
  IconLegend,
  IconLock,
  IconPractice,
  IconRule,
} from "./icons";
import { Formula } from "./math";
import { SPEAK_EVENT } from "./speak-button";

/** Fired by the "H" shortcut; the active exercise opens its next hint. */
export const HINT_EVENT = "lemma:hint";

type Panel = "calculator" | "legend" | "shortcuts" | null;
type Policy = { allowed: boolean; reason?: string };

const ToolboxContext = createContext<{
  panel: Panel;
  toggle: (p: Exclude<Panel, null>) => void;
  setPolicy: (p: Policy) => void;
  policy: Policy;
}>({ panel: null, toggle: () => {}, setPolicy: () => {}, policy: { allowed: true } });

export const useToolbox = () => useContext(ToolboxContext);

/** Lets a page switch the calculator off (and on again when it unmounts). */
export function useCalculatorPolicy(allowed: boolean, reason?: string) {
  const { setPolicy } = useToolbox();
  useEffect(() => {
    setPolicy({ allowed, reason });
    return () => setPolicy({ allowed: true });
  }, [allowed, reason, setPolicy]);
}

function isEditable(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  return el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT", "MATH-FIELD"].includes(el.tagName);
}

export function ToolboxProvider({ children }: { children: ReactNode }) {
  const [panel, setPanel] = useState<Panel>(null);
  const [policy, setPolicyState] = useState<Policy>({ allowed: true });
  const toggle = useCallback((p: Exclude<Panel, null>) => setPanel((cur) => (cur === p ? null : p)), []);
  const setPolicy = useCallback((p: Policy) => setPolicyState(p), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.altKey) return;
      const inField = isEditable(e.target) || isEditable(document.activeElement);
      // In a field the shortcut needs Ctrl; outside a field a plain key works.
      if (inField !== e.ctrlKey) {
        if (e.key === "Escape" && panel) setPanel(null);
        return;
      }
      const key = e.key.toLowerCase();
      const map: Record<string, () => void> = {
        k: () => toggle("calculator"),
        l: () => toggle("legend"),
        "?": () => toggle("shortcuts"),
        h: () => window.dispatchEvent(new Event(HINT_EVENT)),
        s: () => window.dispatchEvent(new Event(SPEAK_EVENT)),
      };
      if (map[key]) {
        e.preventDefault();
        map[key]();
      } else if (e.key === "Escape") {
        setPanel(null);
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [panel, toggle]);

  return (
    <ToolboxContext value={{ panel, toggle, setPolicy, policy }}>
      {children}
      <ToolboxButtons />
      <CalculatorPanel open={panel === "calculator"} onClose={() => setPanel(null)} />
      {panel === "legend" && <LegendPanel onClose={() => setPanel(null)} />}
      {panel === "shortcuts" && <ShortcutsPanel onClose={() => setPanel(null)} />}
    </ToolboxContext>
  );
}

/** Fixed buttons in the bottom-right corner. */
function ToolboxButtons() {
  const { t } = useT();
  const { toggle, policy, panel } = useToolbox();
  const btn =
    "flex h-11 items-center gap-2 rounded-full border border-border bg-surface px-4 text-sm text-muted shadow-sm hover:border-border-strong hover:text-fg";
  return (
    <div className="fixed right-4 bottom-4 z-30 flex gap-2 print:hidden">
      <button className={btn} onClick={() => toggle("shortcuts")} aria-label={t("shortcuts")} title={`${t("shortcuts")} (?)`}>
        <IconKeyboard />
      </button>
      <button className={btn} onClick={() => toggle("legend")} aria-pressed={panel === "legend"} title={`${t("legend")} (L)`}>
        <IconLegend />
        <span>{t("legend")}</span>
      </button>
      <button
        className={btn}
        onClick={() => toggle("calculator")}
        aria-pressed={panel === "calculator"}
        title={`${t("calculator")} (K)`}
      >
        {policy.allowed ? <IconCalculator /> : <IconLock />}
        <span>{t("calculator")}</span>
      </button>
    </div>
  );
}

function PanelShell({ title, onClose, children, wide = false }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  const { t } = useT();
  return (
    <aside
      role="dialog"
      aria-label={title}
      className={`animate-in fixed right-4 bottom-20 z-40 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-xl border border-border-strong bg-bg p-5 shadow-2xl ${wide ? "w-[27rem]" : "w-[22rem]"}`}
    >
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        <button onClick={onClose} aria-label={t("close")} className="rounded-md p-1 text-muted hover:text-fg">
          <IconCross />
        </button>
      </div>
      {children}
    </aside>
  );
}

// ---------------------------------------------------------------------------
// Calculator
// ---------------------------------------------------------------------------

const ERROR_KEY: Record<CalcError["code"], MessageKey> = {
  syntax: "calcErrSyntax",
  "divide-by-zero": "calcErrDivZero",
  domain: "calcErrDomain",
  overflow: "calcErrOverflow",
  empty: "calcErrEmpty",
};

/**
 * The calculator lives in a fixed drawer on the right. Its size never
 * changes (no jumping while you hover or type), and it stays mounted while
 * hidden, so the sum, result and history survive closing it.
 */
function CalculatorPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t, l, locale } = useT();
  const { policy } = useToolbox();
  const [input, setInput] = useState("");
  const [angle, setAngle] = useState<AngleMode>("deg");
  const [result, setResult] = useState<{ text: string; error?: boolean } | null>(null);
  const [history, setHistory] = useState<Array<{ input: string; output: string; value: number }>>([]);
  // Button explanations are off by default, so nothing pops up while calculating.
  const [explainMode, setExplainMode] = useState(false);
  const [explained, setExplained] = useState<CalcButton | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const toggleExplain = (on: boolean) => {
    setExplainMode(on);
    setExplained(null);
  };

  const ans = history[0]?.value;
  const compute = () => {
    try {
      const value = evaluate(input, { angle, ans });
      const output = formatResult(value, locale);
      setResult({ text: output });
      setHistory((h) => [{ input, output, value }, ...h].slice(0, 30));
    } catch (e) {
      setResult({ text: e instanceof CalcError ? t(ERROR_KEY[e.code]) : t("calcErrSyntax"), error: true });
    }
  };

  const press = (b: CalcButton) => {
    if (explainMode) setExplained(b);
    if (b.action === "equals") compute();
    else if (b.action === "clear") {
      setInput("");
      setResult(null);
    } else if (b.action === "backspace") setInput((s) => s.slice(0, -1));
    else setInput((s) => s + (b.insert ?? ""));
    inputRef.current?.focus();
  };

  return (
    <aside
      role="dialog"
      aria-label={t("calculator")}
      hidden={!open}
      className="fixed top-4 right-4 bottom-20 z-40 flex w-[26rem] flex-col rounded-xl border border-border-strong bg-bg p-5 shadow-2xl"
    >
      <div className="mb-3 flex shrink-0 items-center justify-between">
        <h2 className="text-lg font-semibold">{t("calculator")}</h2>
        <button onClick={onClose} aria-label={t("close")} className="rounded-md p-1 text-muted hover:text-fg">
          <IconCross />
        </button>
      </div>

      {!policy.allowed ? (
        <div className="flex items-start gap-3 rounded-lg border border-border p-4">
          <IconLock className="mt-1 shrink-0" />
          <p>{policy.reason ?? t("calcOff")}</p>
        </div>
      ) : (
        <>
          <div className="mb-3 flex shrink-0 items-center gap-2" role="radiogroup" aria-label={t("calcDeg")}>
            {(["deg", "rad"] as const).map((m) => (
              <button
                key={m}
                role="radio"
                aria-checked={angle === m}
                onClick={() => setAngle(m)}
                className={`rounded-md border px-3 py-1 text-sm font-semibold ${angle === m ? "border-fg bg-invert-bg text-invert-fg" : "border-border text-muted"}`}
              >
                {m === "deg" ? `DEG · ${t("calcDeg")}` : `RAD · ${t("calcRad")}`}
              </button>
            ))}
          </div>

          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                compute();
              }
            }}
            className="w-full shrink-0 rounded-lg border border-border-strong bg-surface px-3 py-2 font-mono text-xl"
            aria-label={t("calculator")}
            spellCheck={false}
            autoComplete="off"
          />
          {/* Fixed height, so a result or error never pushes the buttons down. */}
          <div className="mt-1 flex h-10 shrink-0 items-center justify-end overflow-hidden font-mono text-2xl" aria-live="polite">
            {result && (
              <span className={`truncate ${result.error ? "text-sm text-bad" : ""}`}>{result.error ? result.text : `= ${result.text}`}</span>
            )}
          </div>

          <div className="grid shrink-0 grid-cols-6 gap-1.5">
            {CALC_BUTTONS.flat().map((b) => (
              <button
                key={b.label}
                onClick={() => press(b)}
                onMouseEnter={explainMode ? () => setExplained(b) : undefined}
                className={`h-11 rounded-md border text-base ${
                  b.action === "equals"
                    ? "border-fg bg-invert-bg font-semibold text-invert-fg"
                    : b.kind === "digit"
                      ? "border-border bg-surface-2"
                      : "border-border bg-surface"
                } hover:border-border-strong`}
                aria-label={l(b.what)}
              >
                {b.label}
              </button>
            ))}
          </div>

          <label className="mt-3 flex shrink-0 items-center gap-2 text-sm text-muted">
            <input type="checkbox" checked={explainMode} onChange={(e) => toggleExplain(e.target.checked)} />
            {t("calcExplain")}
          </label>
          {explainMode && (
            // Fixed height: hovering over buttons never changes the layout.
            <div className="mt-2 h-28 shrink-0 overflow-y-auto rounded-lg border border-border p-3 text-sm">
              {explained ? (
                <div className="space-y-1">
                  <p>
                    <strong className="font-mono">{explained.label}</strong> · {l(explained.what)}
                  </p>
                  <p className="text-muted">{l(explained.when)}</p>
                  {explained.example && <p className="font-mono">{explained.example}</p>}
                </div>
              ) : (
                <p className="text-muted">{t("calcExplainHint")}</p>
              )}
            </div>
          )}

          <div className="mt-3 min-h-0 flex-1 overflow-y-auto border-t border-border pt-3">
            <p className="mb-1 text-sm text-muted">{t("calcHistory")}</p>
            {history.length === 0 ? (
              <p className="text-sm text-muted">{t("calcHistoryEmpty")}</p>
            ) : (
              <ul className="space-y-1 font-mono text-sm">
                {history.map((h, i) => (
                  <li key={i}>
                    <button className="w-full truncate text-left hover:underline" onClick={() => setInput(h.input)}>
                      {h.input} = {h.output}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </aside>
  );
}

// ---------------------------------------------------------------------------
// Legend
// ---------------------------------------------------------------------------

function LegendPanel({ onClose }: { onClose: () => void }) {
  const { t } = useT();
  const row = (sample: ReactNode, label: string) => (
    <li className="flex items-center gap-3">
      <span className="w-14 text-center">{sample}</span>
      <span>{label}</span>
    </li>
  );
  return (
    <PanelShell title={t("legend")} onClose={onClose}>
      <ul className="space-y-2">
        {row(<Formula latex="x" />, t("legendVar"))}
        {row(<Formula latex="3" />, t("legendNum"))}
        {row(<Formula latex="\hl{12}" />, t("legendHl"))}
        {row(<span className="font-semibold text-good">✓</span>, t("legendGood"))}
        {row(<span className="font-semibold text-bad">✗</span>, t("legendBad"))}
      </ul>
      <h3 className="mt-5 mb-2 font-semibold">{t("legendIcons")}</h3>
      <ul className="space-y-2">
        {row(<IconExplain className="mx-auto" />, t("explain"))}
        {row(<IconExample className="mx-auto" />, t("example"))}
        {row(<IconPractice className="mx-auto" />, t("practice"))}
        {row(<IconHint className="mx-auto" />, t("hint"))}
        {row(<IconRule className="mx-auto" />, t("rule"))}
      </ul>
    </PanelShell>
  );
}

// ---------------------------------------------------------------------------
// Shortcut list
// ---------------------------------------------------------------------------

function ShortcutsPanel({ onClose }: { onClose: () => void }) {
  const { t } = useT();
  const items: Array<[string, MessageKey]> = [
    ["Enter", "scCheck"],
    ["H", "scHint"],
    ["K", "scCalc"],
    ["L", "scLegend"],
    ["S", "scSpeak"],
    ["?", "scHelp"],
  ];
  return (
    <PanelShell title={t("shortcuts")} onClose={onClose}>
      <ul className="space-y-2">
        {items.map(([key, label]) => (
          <li key={key} className="flex items-center gap-3">
            <kbd className="min-w-12 rounded border border-border-strong bg-surface px-2 py-0.5 text-center font-mono text-sm">{key}</kbd>
            <span>{t(label)}</span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-sm text-muted">{t("scInField")}</p>
    </PanelShell>
  );
}
