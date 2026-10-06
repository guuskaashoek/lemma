/**
 * Display preferences (language, theme, font, text size, read-aloud).
 *
 * The database is the source of truth, but a copy lives in a small cookie so
 * the root layout can apply them without a database query, and so the login
 * and register pages (no user yet) are also in the right language.
 */
import "server-only";
import { cookies, headers } from "next/headers";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/i18n/locale";

export type Prefs = {
  locale: Locale;
  theme: "dark" | "light";
  font: "default" | "atkinson";
  size: "m" | "l" | "xl";
  tts: boolean;
  ttsRate: number;
};

export const PREFS_COOKIE = "lemma_prefs";

const DEFAULT_PREFS: Prefs = { locale: DEFAULT_LOCALE, theme: "dark", font: "atkinson", size: "l", tts: true, ttsRate: 0.9 };

/** Reads the preferences cookie, falling back to the browser language. */
export async function getPrefs(): Promise<Prefs> {
  const raw = (await cookies()).get(PREFS_COOKIE)?.value;
  let parsed: Partial<Prefs> = {};
  if (raw) {
    try {
      parsed = JSON.parse(raw);
    } catch {
      // Ignore a broken cookie.
    }
  }
  let locale = parsed.locale;
  if (!isLocale(locale)) {
    const accept = (await headers()).get("accept-language") ?? "";
    locale = /^en\b/i.test(accept) ? "en" : DEFAULT_LOCALE;
  }
  return {
    locale,
    theme: parsed.theme === "light" ? "light" : "dark",
    font: parsed.font === "default" ? "default" : "atkinson",
    size: parsed.size === "m" || parsed.size === "xl" ? parsed.size : "l",
    tts: parsed.tts !== false,
    ttsRate: typeof parsed.ttsRate === "number" && parsed.ttsRate >= 0.5 && parsed.ttsRate <= 1.5 ? parsed.ttsRate : 0.9,
  };
}

/** Writes the preferences cookie (call from a server action). */
export async function setPrefsCookie(prefs: Prefs): Promise<void> {
  (await cookies()).set(PREFS_COOKIE, JSON.stringify(prefs), {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}

export { DEFAULT_PREFS };
