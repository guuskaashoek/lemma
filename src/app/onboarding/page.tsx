/**
 * Onboarding: starting level, goal and reading preferences.
 * Shown once after registering; everything can be changed later.
 */
import { redirect } from "next/navigation";
import { Logo } from "@/components/logo";
import { SettingsForm } from "@/components/settings-form";
import { getPrefs } from "@/lib/prefs";
import { getSettings, requireUser } from "@/lib/session";

export default async function OnboardingPage() {
  const user = await requireUser();
  const settings = await getSettings(user.id);
  if (settings?.onboardedAt) redirect("/learn");
  const prefs = await getPrefs();
  return (
    <main className="mx-auto max-w-lg px-6 py-16">
      <Logo size={24} className="mb-10" />
      <SettingsForm
        mode="onboarding"
        initial={{
          locale: settings?.locale ?? prefs.locale,
          startLevel: (settings?.startLevel as never) ?? "vmbo-kader",
          goal: (settings?.goal as never) ?? "wo-ai",
          font: settings?.font ?? "atkinson",
          textSize: settings?.textSize ?? "l",
          theme: settings?.theme ?? "dark",
          ttsEnabled: settings?.ttsEnabled ?? true,
          ttsRate: settings?.ttsRate ?? 0.9,
          dailyGoalXp: settings?.dailyGoalXp ?? 20,
        }}
      />
    </main>
  );
}
