"use client";
/** NL / EN switch for pages without a logged-in user. */
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { setLocaleAction } from "@/app/actions/settings";
import { useT } from "@/i18n/client";
import { LOCALES } from "@/i18n/locale";

export function LanguageSwitch() {
  const { locale } = useT();
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <div className="flex gap-1 text-sm" aria-busy={pending}>
      {LOCALES.map((l) => (
        <button
          key={l}
          onClick={() => start(async () => {
            await setLocaleAction(l);
            router.refresh();
          })}
          aria-pressed={locale === l}
          className={`rounded-md px-2 py-1 uppercase ${locale === l ? "bg-invert-bg text-invert-fg" : "text-muted hover:text-fg"}`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
