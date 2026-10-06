"use server";
/**
 * Server actions for onboarding, settings and the account itself
 * (change password, delete account).
 */
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db, schema } from "@/db";
import { getT } from "@/i18n/server";
import { auth } from "@/lib/auth";
import { getPrefs, setPrefsCookie } from "@/lib/prefs";
import { allowAuthAttempt } from "@/lib/rate-limit";
import { requireUser } from "@/lib/session";
import { changePasswordSchema, settingsSchema, type SettingsInput } from "@/lib/validation";
import { isLocale, type Locale } from "@/i18n/locale";
import type { FormState } from "./auth";

/** Saves all settings. Used by onboarding (with `finish`) and the settings page. */
export async function saveSettingsAction(input: SettingsInput, finish = false): Promise<{ ok: boolean }> {
  const user = await requireUser();
  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) return { ok: false };
  const values = { ...parsed.data, ...(finish ? { onboardedAt: new Date() } : {}) };
  db.insert(schema.userSettings)
    .values({ userId: user.id, ...values })
    .onConflictDoUpdate({ target: schema.userSettings.userId, set: values })
    .run();
  await setPrefsCookie({
    locale: parsed.data.locale,
    theme: parsed.data.theme,
    font: parsed.data.font,
    size: parsed.data.textSize,
    tts: parsed.data.ttsEnabled,
    ttsRate: parsed.data.ttsRate,
  });
  if (finish) redirect("/learn");
  return { ok: true };
}

/** Changes only the language (also works before logging in). */
export async function setLocaleAction(locale: Locale): Promise<void> {
  if (!isLocale(locale)) return;
  const prefs = await getPrefs();
  await setPrefsCookie({ ...prefs, locale });
}

export async function changePasswordAction(_prev: FormState, form: FormData): Promise<FormState> {
  await requireUser();
  const { t } = await getT();
  const parsed = changePasswordSchema.safeParse({
    currentPassword: form.get("currentPassword"),
    newPassword: form.get("newPassword"),
  });
  if (!parsed.success) return { error: t("errPasswordShort") };
  try {
    await auth.api.changePassword({
      body: { ...parsed.data, revokeOtherSessions: true },
      headers: await headers(),
    });
  } catch {
    return { error: t("errInvalidLogin") };
  }
  return { ok: t("passwordChanged") };
}

/**
 * Deletes the account and, through ON DELETE CASCADE, every piece of data
 * that belongs to it. The password is asked again as confirmation.
 */
export async function deleteAccountAction(_prev: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser();
  const { t } = await getT();
  const password = String(form.get("password") ?? "");
  if (!(await allowAuthAttempt("login", user.email))) return { error: t("errTooMany") };

  const ctx = await auth.$context;
  const account = await ctx.internalAdapter.findCredentialAccount(user.id);
  const valid = !!account?.password && (await ctx.password.verify({ password, hash: account.password }));
  if (!valid) return { error: t("errInvalidLogin") };

  db.delete(schema.user).where(eq(schema.user.id, user.id)).run();
  const prefs = await getPrefs();
  await setPrefsCookie(prefs);
  redirect("/");
}
