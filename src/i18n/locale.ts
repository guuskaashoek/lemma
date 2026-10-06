/**
 * Locale basics shared by UI text and lesson content.
 *
 * Every piece of user-facing text is a `Loc`: an object with a Dutch and an
 * English version. Because both keys are required by the type, the compiler
 * refuses content where a translation is missing.
 */

export const LOCALES = ["nl", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "nl";

/** A text in every supported language. */
export type Loc = Record<Locale, string>;

/** Picks the text for a locale. */
export function tr(text: Loc, locale: Locale): string {
  return text[locale];
}

/** Narrows an unknown value to a supported locale. */
export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

/** Replaces `{name}` placeholders in a string. */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, k: string) => (k in values ? String(values[k]) : `{${k}}`));
}
