/**
 * Read-aloud with the browser's Web Speech API (no external service).
 *
 * Text is prepared with `richTextToSpeech`, which turns formulas into spoken
 * maths ("x kwadraat plus twee x"). On macOS the best Dutch voices are
 * "Xander" and "Claire"; we prefer an enhanced/premium voice when present.
 */
import type { Locale } from "@/i18n/locale";

const LANG: Record<Locale, string> = { nl: "nl-NL", en: "en-GB" };

export function ttsSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/** Picks the best available voice for a locale, or null. */
export function pickVoice(locale: Locale): SpeechSynthesisVoice | null {
  if (!ttsSupported()) return null;
  const voices = window.speechSynthesis.getVoices();
  const prefix = locale === "nl" ? "nl" : "en";
  const matching = voices.filter((v) => v.lang.toLowerCase().startsWith(prefix));
  const exact = matching.filter((v) => v.lang === LANG[locale] || (locale === "nl" && v.lang === "nl-BE"));
  const pool = exact.length ? exact : matching;
  return (
    pool.find((v) => /premium|enhanced|verbeterd/i.test(v.name)) ??
    pool.find((v) => v.localService) ??
    pool[0] ??
    null
  );
}

/** Speaks a text. Calls `onEnd` when finished or stopped. */
export function speak(text: string, locale: Locale, rate: number, onEnd?: () => void): void {
  if (!ttsSupported()) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = LANG[locale];
  u.rate = rate;
  const voice = pickVoice(locale);
  if (voice) u.voice = voice;
  u.onend = () => onEnd?.();
  u.onerror = () => onEnd?.();
  window.speechSynthesis.speak(u);
}

export function stopSpeaking(): void {
  if (ttsSupported()) window.speechSynthesis.cancel();
}
