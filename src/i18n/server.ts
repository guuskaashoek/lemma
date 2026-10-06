/**
 * Translation helper for Server Components and server actions.
 */
import "server-only";
import { getPrefs } from "@/lib/prefs";
import { fill, type Locale } from "./locale";
import { messages, type MessageKey } from "./messages";

export type T = (key: MessageKey, values?: Record<string, string | number>) => string;

/** Builds a `t()` function for a locale. */
export function makeT(locale: Locale): T {
  return (key, values) => {
    const text = messages[key][locale];
    return values ? fill(text, values) : text;
  };
}

/** `t()` and the locale for the current request. */
export async function getT(): Promise<{ t: T; locale: Locale }> {
  const { locale } = await getPrefs();
  return { t: makeT(locale), locale };
}
