"use client";
/**
 * Preferences form, used in two places:
 * - onboarding: a short wizard, one question per screen,
 * - the settings page: everything on one page.
 *
 * Display changes (theme, font, size) are previewed live on <html>.
 */
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition, type ReactNode } from "react";
import { saveSettingsAction } from "@/app/actions/settings";
import { fill, type Locale } from "@/i18n/locale";
import { messages, type MessageKey } from "@/i18n/messages";
import { richTextToSpeech } from "@/math/speech";
import { pickVoice, speak, ttsSupported } from "@/lib/tts";
import type { SettingsInput } from "@/lib/validation";
import { Alert, Button, Eyebrow } from "./ui";

type Option<V extends string> = { value: V; label: MessageKey };

const LEVELS: Option<SettingsInput["startLevel"]>[] = [
  { value: "vmbo-kader", label: "levelVmboKader" },
  { value: "vmbo-gt", label: "levelVmboGt" },
  { value: "mbo", label: "levelMbo" },
  { value: "havo", label: "levelHavo" },
  { value: "vwo", label: "levelVwo" },
];
const GOALS: Option<SettingsInput["goal"]>[] = [
  { value: "refresh", label: "goalRefresh" },
  { value: "havo-b", label: "goalHavo" },
  { value: "vwo-b", label: "goalVwoB" },
  { value: "wo-ai", label: "goalWoAi" },
];

function Choice<V extends string | number>({
  value,
  options,
  onChange,
  label,
}: {
  value: V;
  options: Array<{ value: V; text: ReactNode }>;
  onChange: (v: V) => void;
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="grid gap-2">
      {options.map((o) => (
        <button
          type="button"
          key={String(o.value)}
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={`rounded-lg border px-4 py-3 text-left ${value === o.value ? "border-fg bg-surface-2 font-semibold" : "border-border hover:border-border-strong"}`}
        >
          {o.text}
        </button>
      ))}
    </div>
  );
}

export function SettingsForm({ initial, mode }: { initial: SettingsInput; mode: "onboarding" | "settings" }) {
  const [s, setS] = useState(initial);
  const [step, setStep] = useState(0);
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);
  const [noVoice, setNoVoice] = useState(false);
  const router = useRouter();
  // Texts follow the language being chosen, so the switch is visible at once.
  const t = (key: MessageKey, values?: Record<string, string | number>) => translate(key, s.locale, values);
  const set = <K extends keyof SettingsInput>(k: K, v: SettingsInput[K]) => {
    setS((cur) => ({ ...cur, [k]: v }));
    setSaved(false);
  };

  // Live preview of display settings.
  useEffect(() => {
    const html = document.documentElement;
    html.dataset.theme = s.theme;
    html.dataset.font = s.font;
    html.dataset.size = s.textSize;
    html.lang = s.locale;
  }, [s.theme, s.font, s.textSize, s.locale]);

  const testVoice = () => {
    if (!ttsSupported()) return setNoVoice(true);
    setNoVoice(!pickVoice(s.locale));
    const sample = s.locale === "nl" ? "Bereken $x^2+2x$ voor $x=3$." : "Work out $x^2+2x$ for $x=3$.";
    speak(richTextToSpeech(sample, s.locale), s.locale, s.ttsRate);
  };

  const save = (finish: boolean) =>
    start(async () => {
      await saveSettingsAction(s, finish);
      setSaved(true);
      router.refresh();
    });

  const sections: Array<{ title: MessageKey; body: ReactNode }> = [
    {
      title: "onbLanguage",
      body: (
        <Choice
          label={t("language")}
          value={s.locale}
          onChange={(v) => set("locale", v)}
          options={[
            { value: "nl", text: "Nederlands" },
            { value: "en", text: "English" },
          ]}
        />
      ),
    },
    {
      title: "onbLevel",
      body: (
        <>
          <Choice
            label={t("startLevel")}
            value={s.startLevel}
            onChange={(v) => set("startLevel", v)}
            options={LEVELS.map((o) => ({ value: o.value, text: t(o.label) }))}
          />
          <p className="mt-3 text-muted">{t("onbLevelNote")}</p>
        </>
      ),
    },
    {
      title: "onbGoal",
      body: (
        <Choice
          label={t("goal")}
          value={s.goal}
          onChange={(v) => set("goal", v)}
          options={GOALS.map((o) => ({ value: o.value, text: t(o.label) }))}
        />
      ),
    },
    {
      title: "onbReading",
      body: (
        <div className="space-y-6">
          <div>
            <Eyebrow>{t("font")}</Eyebrow>
            <Choice
              label={t("font")}
              value={s.font}
              onChange={(v) => set("font", v)}
              options={[
                { value: "atkinson", text: t("fontAtkinson") },
                { value: "default", text: t("fontDefault") },
              ]}
            />
          </div>
          <div>
            <Eyebrow>{t("textSize")}</Eyebrow>
            <div className="grid grid-cols-3 gap-2">
              {(["m", "l", "xl"] as const).map((v) => (
                <button
                  type="button"
                  key={v}
                  aria-pressed={s.textSize === v}
                  onClick={() => set("textSize", v)}
                  className={`rounded-lg border px-3 py-2 ${s.textSize === v ? "border-fg bg-surface-2 font-semibold" : "border-border"}`}
                >
                  {t(v === "m" ? "sizeM" : v === "l" ? "sizeL" : "sizeXl")}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Eyebrow>{t("theme")}</Eyebrow>
            <div className="grid grid-cols-2 gap-2">
              {(["dark", "light"] as const).map((v) => (
                <button
                  type="button"
                  key={v}
                  aria-pressed={s.theme === v}
                  onClick={() => set("theme", v)}
                  className={`rounded-lg border px-3 py-2 ${s.theme === v ? "border-fg bg-surface-2 font-semibold" : "border-border"}`}
                >
                  {t(v === "dark" ? "themeDark" : "themeLight")}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Eyebrow>{t("tts")}</Eyebrow>
            <label className="flex items-center gap-3">
              <input type="checkbox" checked={s.ttsEnabled} onChange={(e) => set("ttsEnabled", e.target.checked)} className="h-5 w-5" />
              {t("ttsOn")}
            </label>
            <label className="mt-3 block">
              <span className="text-sm text-muted">
                {t("ttsRate")}: {s.ttsRate.toFixed(1)}×
              </span>
              <input
                type="range"
                min={0.5}
                max={1.5}
                step={0.1}
                value={s.ttsRate}
                onChange={(e) => set("ttsRate", Number(e.target.value))}
                className="block w-full"
              />
            </label>
            <Button type="button" variant="secondary" className="mt-2" onClick={testVoice}>
              {t("ttsTest")}
            </Button>
            {noVoice && <p className="mt-2 text-sm text-muted">{t("ttsNoVoice")}</p>}
          </div>
        </div>
      ),
    },
  ];

  if (mode === "onboarding") {
    const section = sections[step];
    const last = step === sections.length - 1;
    return (
      <div className="animate-in" key={step}>
        <Eyebrow>{t("onbStep", { n: step + 1, total: sections.length })}</Eyebrow>
        <h1 className="mb-6 text-3xl font-semibold tracking-tight">{t(section.title)}</h1>
        {section.body}
        <div className="mt-8 flex justify-between">
          <Button type="button" variant="ghost" disabled={step === 0} onClick={() => setStep(step - 1)}>
            {t("back")}
          </Button>
          <Button type="button" disabled={pending} onClick={() => (last ? save(true) : setStep(step + 1))}>
            {last ? t("onbDone") : t("next")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {sections.map((sec) => (
        <section key={sec.title}>
          <h2 className="mb-3 text-xl font-semibold">{t(sec.title)}</h2>
          {sec.body}
        </section>
      ))}
      <section>
        <h2 className="mb-3 text-xl font-semibold">{t("dailyGoal")}</h2>
        <div className="grid grid-cols-4 gap-2">
          {[10, 20, 30, 50].map((v) => (
            <button
              type="button"
              key={v}
              aria-pressed={s.dailyGoalXp === v}
              onClick={() => set("dailyGoalXp", v)}
              className={`rounded-lg border px-3 py-2 ${s.dailyGoalXp === v ? "border-fg bg-surface-2 font-semibold" : "border-border"}`}
            >
              {v} XP
            </button>
          ))}
        </div>
      </section>
      <div className="flex items-center gap-4">
        <Button type="button" disabled={pending} onClick={() => save(false)}>
          {pending ? t("loading") : t("save")}
        </Button>
        {saved && <Alert kind="ok">{t("saved")}</Alert>}
      </div>
    </div>
  );
}

function translate(key: MessageKey, locale: Locale, values?: Record<string, string | number>) {
  const text = messages[key][locale];
  return values ? fill(text, values) : text;
}
