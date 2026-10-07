"use client";
/**
 * "Tap the next operation": the sum is shown with every operation as a
 * button. Tap the one that comes first; it shrinks into its answer. Tap a
 * wrong one and the widget says which rule comes first.
 */
import { useMemo, useState, type ReactNode } from "react";
import { nextOperation, toLatex, type ArithNode } from "@/content/shared/arith-tree";
import { frac } from "@/math/latex";
import type { Loc } from "@/i18n/locale";
import { Btn, Tex, UI, useLoc } from "./kit";
import { applyOperation, judgeTap, parseSum, type TapVerdict } from "./order-model";

const OP_TEXT: Record<string, string> = { "+": "+", "-": "−", "*": "·", ":": ":" };

const VERDICT: Record<TapVerdict, Loc> = {
  ok: { nl: "Goed zo!", en: "Well done!" },
  brackets: { nl: "Nog niet. Eerst wat tussen de haakjes staat.", en: "Not yet. First what is inside the brackets." },
  power: { nl: "Nog niet. Eerst de macht.", en: "Not yet. First the power." },
  muldiv: { nl: "Nog niet. Keer en delen gaan vóór plus en min.", en: "Not yet. Multiply and divide come before add and subtract." },
  "left-to-right": { nl: "Nog niet. Bij gelijke stappen: van links naar rechts.", en: "Not yet. Equal steps: from left to right." },
};

export function OrderTap({ props }: { props: Record<string, unknown> }) {
  const start = useMemo(() => parseSum(String(props.expr ?? "")), [props.expr]);
  const { l } = useLoc();
  const [tree, setTree] = useState<ArithNode | null>(start);
  const [fresh, setFresh] = useState<ArithNode | null>(null);
  const [wrong, setWrong] = useState<ArithNode | null>(null);
  const [message, setMessage] = useState<Loc | null>(null);
  const [history, setHistory] = useState<string[]>([]);

  if (!start || !tree) return <Tex latex={String(props.expr ?? "")} />;
  const done = tree.k === "num";

  const tap = (target: ArithNode) => {
    const verdict = judgeTap(tree, target);
    setMessage(VERDICT[verdict]);
    if (verdict !== "ok") {
      setWrong(target);
      setFresh(null);
      return;
    }
    const next = applyOperation(tree, target);
    setHistory((h) => [...h, toLatex(tree)]);
    setTree(next.tree);
    setFresh(next.result);
    setWrong(null);
  };

  const reset = () => {
    setTree(start);
    setFresh(null);
    setWrong(null);
    setMessage(null);
    setHistory([]);
  };

  const hint = () => {
    const first = nextOperation(tree);
    if (first) tap(first);
  };

  const opButton = (node: ArithNode, label: ReactNode, key: string) => (
    <button
      key={key}
      type="button"
      onClick={() => tap(node)}
      aria-label={l({ nl: "Doe deze bewerking", en: "Do this operation" })}
      className={`mx-1 inline-flex min-w-10 items-center justify-center rounded-lg border-2 px-2 py-0.5 transition-transform duration-300 motion-reduce:transition-none ${
        wrong === node ? "animate-pulse border-[var(--c-hl)]" : "border-border-strong hover:-translate-y-0.5 hover:border-fg"
      }`}
    >
      {label}
    </button>
  );

  const render = (n: ArithNode, first: boolean, key: string): ReactNode => {
    switch (n.k) {
      case "num": {
        const s = frac(n.v).replace("-", "−");
        const text = !first && n.v.compare(0) < 0 ? `(${s})` : s;
        return (
          <span
            key={key}
            className="inline-block transition-all duration-500 motion-reduce:transition-none"
            style={{ color: n === fresh ? "var(--c-hl)" : "var(--c-num)", transform: n === fresh ? "scale(1.15)" : "none" }}
          >
            {text}
          </span>
        );
      }
      case "paren":
        return (
          <span key={key}>
            ({render(n.e, true, key + "p")})
          </span>
        );
      case "pow":
        return (
          <span key={key}>
            {render(n.base, first, key + "b")}
            {opButton(n, <sup>{n.exp}</sup>, key + "e")}
          </span>
        );
      case "bin":
        return (
          <span key={key}>
            {render(n.l, first, key + "l")}
            {opButton(n, OP_TEXT[n.op], key + "o")}
            {render(n.r, false, key + "r")}
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1 text-center text-muted">
        {history.map((h, i) => (
          <div key={i}>
            <Tex latex={h} />
          </div>
        ))}
      </div>
      <div className="flex min-h-16 flex-wrap items-center justify-center text-3xl" aria-live="polite">
        {render(tree, true, "t")}
      </div>
      <p className="min-h-7 text-center" aria-live="polite">
        {done ? (
          <strong>{l({ nl: "Klaar! Dit is het antwoord.", en: "Done! This is the answer." })}</strong>
        ) : message ? (
          l(message)
        ) : (
          <span className="text-muted">{l({ nl: "Tik op de bewerking die als eerste moet.", en: "Tap the operation that comes first." })}</span>
        )}
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <Btn onClick={hint} disabled={done}>
          {l({ nl: "Doe één stap voor", en: "Show one step" })}
        </Btn>
        <Btn quiet onClick={reset}>
          {l(UI.reset)}
        </Btn>
      </div>
    </div>
  );
}
