"use client";
/** All rule cards, each with its statement, formula, mnemonic and example. */
import Link from "next/link";
import { useState } from "react";
import { getLessonEntry } from "@/content/curriculum";
import { METAPHORS } from "@/content/metaphors";
import { RULES } from "@/content/rules";
import { useT } from "@/i18n/client";
import { IconRule } from "./icons";
import { Formula, RichText } from "./math";
import { MnemonicCard } from "./session-player";
import { SpeakButton } from "./speak-button";
import { StepList, stepsToText } from "./steps";

export function RulesView() {
  const { t, l, locale } = useT();
  const [open, setOpen] = useState<string | null>(null);
  return (
    <div className="space-y-4">
      {RULES.map((r) => {
        const lesson = r.lessonId ? getLessonEntry(r.lessonId) : undefined;
        const expanded = open === r.id;
        return (
          <article key={r.id} id={r.id} className="scroll-mt-24 rounded-xl border border-border p-6 target:border-fg">
            <div className="flex items-start justify-between gap-4">
              <h2 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
                <IconRule /> {l(r.name)}
              </h2>
              <SpeakButton text={`${l(r.name)}. ${l(r.statement)}`} />
            </div>
            <RichText text={l(r.statement)} className="mt-3 text-lg" />
            {r.latex && (
              <div className="mt-4 rounded-lg bg-surface px-4 py-3 text-center">
                <Formula latex={r.latex} display />
              </div>
            )}
            {r.mnemonic && (
              <div className="mt-4">
                <MnemonicCard id={r.mnemonic} />
              </div>
            )}
            <button className="mt-4 text-sm underline underline-offset-4" onClick={() => setOpen(expanded ? null : r.id)} aria-expanded={expanded}>
              {t("example")}
            </button>
            {expanded && (
              <div className="mt-3 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <RichText text={l(r.example.problem)} />
                  <SpeakButton text={`${l(r.example.problem)} ${stepsToText(r.example.steps, locale)}`} />
                </div>
                <StepList steps={r.example.steps} shown={r.example.steps.length} />
              </div>
            )}
            {lesson && (
              <p className="mt-4 text-sm text-muted">
                {t("learnedIn")}:{" "}
                <Link href={`/lesson/${lesson.lesson.id}`} className="underline underline-offset-4">
                  {l(lesson.lesson.title)}
                </Link>
              </p>
            )}
          </article>
        );
      })}
      <section className="pt-6">
        <h2 className="mb-3 text-2xl font-semibold">{t("metaphor")}</h2>
        <div className="grid gap-3 md:grid-cols-3">
          {Object.values(METAPHORS).map((m) => (
            <div key={m.id} className="rounded-xl border border-border p-4">
              <p className="font-semibold">{l(m.name)}</p>
              <p className="mt-1 text-muted">{l(m.short)}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
