/**
 * Settings: the onboarding choices, display preferences and account
 * management (change password, delete account).
 */
import { AccountActions } from "@/components/account-actions";
import { SettingsForm } from "@/components/settings-form";
import { getT } from "@/i18n/server";
import { getSettings, requireOnboardedUser } from "@/lib/session";

export default async function SettingsPage() {
  const user = await requireOnboardedUser();
  const s = (await getSettings(user.id))!;
  const { t } = await getT();
  return (
    <div className="mx-auto max-w-2xl space-y-14">
      <div>
        <h1 className="mb-8 text-4xl font-semibold tracking-tight">{t("settingsTitle")}</h1>
        <SettingsForm
          mode="settings"
          initial={{
            locale: s.locale,
            startLevel: s.startLevel as never,
            goal: s.goal as never,
            font: s.font,
            textSize: s.textSize,
            theme: s.theme,
            ttsEnabled: s.ttsEnabled,
            ttsRate: s.ttsRate,
            dailyGoalXp: s.dailyGoalXp,
          }}
        />
      </div>
      <AccountActions name={user.name} email={user.email} />
    </div>
  );
}
