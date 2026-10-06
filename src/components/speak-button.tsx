"use client";
/**
 * Read-aloud button. Formulas inside the text are read as spoken maths.
 * Hidden when the user turned read-aloud off in the settings.
 */
import { useEffect, useState, useSyncExternalStore } from "react";
import { usePrefs, useT } from "@/i18n/client";
import { richTextToSpeech } from "@/math/speech";
import { speak, stopSpeaking, ttsSupported } from "@/lib/tts";
import { IconSpeaker, IconStop } from "./icons";

/** Dispatch this event (e.g. from the "S" shortcut) to read the main text aloud. */
export const SPEAK_EVENT = "lemma:speak";

const noopSubscribe = () => () => {};

export function SpeakButton({ text, primary = false }: { text: string | (() => string); primary?: boolean }) {
  const { ttsEnabled, ttsRate } = usePrefs();
  const { t, locale } = useT();
  const [speaking, setSpeaking] = useState(false);
  // False on the server, real value in the browser (no hydration mismatch).
  const supported = useSyncExternalStore(noopSubscribe, ttsSupported, () => false);

  useEffect(() => () => stopSpeaking(), []);

  const toggle = () => {
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
      return;
    }
    const raw = typeof text === "function" ? text() : text;
    setSpeaking(true);
    speak(richTextToSpeech(raw, locale), locale, ttsRate, () => setSpeaking(false));
  };

  // The primary button on a screen listens to the global "S" shortcut.
  useEffect(() => {
    if (!primary) return;
    const onSpeak = () => toggle();
    window.addEventListener(SPEAK_EVENT, onSpeak);
    return () => window.removeEventListener(SPEAK_EVENT, onSpeak);
  });

  if (!ttsEnabled || !supported) return null;
  return (
    <button
      type="button"
      onClick={toggle}
      className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-sm text-muted hover:border-border-strong hover:text-fg"
      aria-label={speaking ? t("stopReading") : t("readAloud")}
      title={`${speaking ? t("stopReading") : t("readAloud")}${primary ? " (S)" : ""}`}
    >
      {speaking ? <IconStop width={16} height={16} /> : <IconSpeaker width={16} height={16} />}
      <span>{speaking ? t("stopReading") : t("readAloud")}</span>
    </button>
  );
}
