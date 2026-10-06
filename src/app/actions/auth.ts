"use server";
/**
 * Server actions for registering, logging in and out, and resetting a
 * password with an admin-issued link.
 */
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { isAPIError } from "better-auth/api";
import { db, schema } from "@/db";
import { getT } from "@/i18n/server";
import { auth } from "@/lib/auth";
import { resetPasswordWithToken } from "@/lib/password-reset";
import { getPrefs, setPrefsCookie } from "@/lib/prefs";
import { allowAuthAttempt } from "@/lib/rate-limit";
import { loginSchema, registerSchema, resetPasswordSchema } from "@/lib/validation";

export type FormState = { error?: string; ok?: string } | undefined;

export async function registerAction(_prev: FormState, form: FormData): Promise<FormState> {
  const { t } = await getT();
  const parsed = registerSchema.safeParse({
    name: form.get("name"),
    email: form.get("email"),
    password: form.get("password"),
  });
  if (!parsed.success) {
    const field = parsed.error.issues[0]?.path[0];
    if (field === "name") return { error: t("errNameRequired") };
    if (field === "email") return { error: t("errEmailInvalid") };
    if (field === "password") return { error: t("errPasswordShort") };
    return { error: t("errInvalidInput") };
  }
  if (!(await allowAuthAttempt("register", parsed.data.email))) return { error: t("errTooMany") };

  try {
    const res = await auth.api.signUpEmail({ body: parsed.data, headers: await headers() });
    // Start the settings row in the language the person registered in.
    const prefs = await getPrefs();
    db.insert(schema.userSettings)
      .values({ userId: res.user.id, locale: prefs.locale, theme: prefs.theme, font: prefs.font, textSize: prefs.size })
      .onConflictDoNothing()
      .run();
  } catch (e) {
    if (isAPIError(e) && String(e.body?.code ?? "").includes("ALREADY_EXISTS")) return { error: t("errEmailTaken") };
    console.error("register failed", e);
    return { error: t("somethingWrong") };
  }
  redirect("/onboarding");
}

export async function loginAction(_prev: FormState, form: FormData): Promise<FormState> {
  const { t } = await getT();
  const parsed = loginSchema.safeParse({ email: form.get("email"), password: form.get("password") });
  if (!parsed.success) return { error: t("errInvalidLogin") };
  if (!(await allowAuthAttempt("login", parsed.data.email))) return { error: t("errTooMany") };

  try {
    const res = await auth.api.signInEmail({ body: parsed.data, headers: await headers() });
    // Bring this browser's display preferences in line with the account.
    const settings = db.select().from(schema.userSettings).where(eq(schema.userSettings.userId, res.user.id)).get();
    if (settings) {
      await setPrefsCookie({
        locale: settings.locale,
        theme: settings.theme,
        font: settings.font,
        size: settings.textSize,
        tts: settings.ttsEnabled,
        ttsRate: settings.ttsRate,
      });
    }
  } catch (e) {
    if (isAPIError(e)) return { error: t("errInvalidLogin") };
    console.error("login failed", e);
    return { error: t("somethingWrong") };
  }
  redirect("/learn");
}

export async function logoutAction(): Promise<void> {
  await auth.api.signOut({ headers: await headers() });
  redirect("/login");
}

export async function resetPasswordAction(_prev: FormState, form: FormData): Promise<FormState> {
  const { t } = await getT();
  const parsed = resetPasswordSchema.safeParse({ token: form.get("token"), password: form.get("password") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.path[0] === "password" ? t("errPasswordShort") : t("resetInvalid") };
  }
  if (!(await allowAuthAttempt("reset"))) return { error: t("errTooMany") };
  const ok = await resetPasswordWithToken(parsed.data.token, parsed.data.password);
  return ok ? { ok: t("resetDone") } : { error: t("resetInvalid") };
}
