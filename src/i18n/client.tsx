"use client";
/**
 * Client-side preferences and translations.
 *
 * The root layout passes the current preferences down; client components call
 * `useT()` for texts and `usePrefs()` for things like the read-aloud speed.
 */
import { createContext, useContext, useMemo, type ReactNode } from "react";
import { fill, type Loc, type Locale } from "./locale";
import { messages, type MessageKey } from "./messages";

export type ClientPrefs = {
  locale: Locale;
  ttsEnabled: boolean;
  ttsRate: number;
};

const PrefsContext = createContext<ClientPrefs>({ locale: "nl", ttsEnabled: true, ttsRate: 0.9 });

export function PrefsProvider({ value, children }: { value: ClientPrefs; children: ReactNode }) {
  return <PrefsContext value={value}>{children}</PrefsContext>;
}

export function usePrefs(): ClientPrefs {
  return useContext(PrefsContext);
}

/** Returns `t(key)` for UI texts and `l(loc)` for content texts. */
export function useT() {
  const { locale } = usePrefs();
  return useMemo(
    () => ({
      locale,
      t: (key: MessageKey, values?: Record<string, string | number>) => {
        const text = messages[key][locale];
        return values ? fill(text, values) : text;
      },
      l: (text: Loc) => text[locale],
    }),
    [locale],
  );
}
