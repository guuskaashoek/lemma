"use client";
/**
 * Formula rendering with KaTeX, including Lemma's colour coding and the Dutch
 * decimal comma.
 */
import katex from "katex";
import Link from "next/link";
import { Fragment, useMemo, type ReactNode } from "react";
import { getRule } from "@/content/rules";
import { useT } from "@/i18n/client";
import type { Locale } from "@/i18n/locale";
import { colorize, KATEX_OPTIONS } from "@/math/markup";

/** `2.5` → `2{,}5` in Dutch. Content is always written with a decimal point. */
export function localizeDecimals(latex: string, locale: Locale): string {
  return locale === "nl" ? latex.replace(/(\d)\.(\d)/g, "$1{,}$2") : latex;
}

export function renderLatex(latex: string, locale: Locale, display = false): string {
  return katex.renderToString(colorize(localizeDecimals(latex, locale)), {
    ...KATEX_OPTIONS,
    macros: { ...KATEX_OPTIONS.macros },
    displayMode: display,
  });
}

/** A single formula. `display` renders it centred and larger. */
export function Formula({ latex, display = false, className = "" }: { latex: string; display?: boolean; className?: string }) {
  const { locale } = useT();
  const html = useMemo(() => renderLatex(latex, locale, display), [latex, locale, display]);
  return (
    <span
      className={`${display ? "block overflow-x-auto py-1 text-[1.35rem]" : ""} ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

/**
 * Rich text: paragraphs (one per line), inline formulas `$...$`,
 * `**bold**` and rule-card links `[[rule:id]]`.
 */
export function RichText({ text, className = "" }: { text: string; className?: string }) {
  const lines = text.split("\n").filter((l) => l.trim() !== "");
  return (
    <div className={`space-y-2 ${className}`}>
      {lines.map((line, i) => (
        <p key={i}>
          <Inline text={line} />
        </p>
      ))}
    </div>
  );
}

/** Inline rich text without paragraph wrapping. */
export function Inline({ text }: { text: string }) {
  const { l } = useT();
  const parts = text.split(/(\$[^$]+\$|\*\*[^*]+\*\*|\[\[rule:[\w-]+\]\])/g);
  return (
    <>
      {parts.map((part, i): ReactNode => {
        if (part.startsWith("$") && part.endsWith("$") && part.length > 1) {
          return <Formula key={i} latex={part.slice(1, -1)} />;
        }
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className="font-semibold">
              {part.slice(2, -2)}
            </strong>
          );
        }
        const rule = part.match(/^\[\[rule:([\w-]+)\]\]$/);
        if (rule) {
          const card = getRule(rule[1]);
          return (
            <Link key={i} href={`/rules#${rule[1]}`} className="underline underline-offset-4">
              {card ? l(card.name) : rule[1]}
            </Link>
          );
        }
        return <Fragment key={i}>{part}</Fragment>;
      })}
    </>
  );
}
