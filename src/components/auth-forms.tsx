"use client";
/**
 * Login, register and reset-password forms. Validation happens on the
 * server (Zod); the browser only adds basic `required` / `minLength` hints.
 */
import Link from "next/link";
import { useActionState } from "react";
import { loginAction, registerAction, resetPasswordAction } from "@/app/actions/auth";
import { useT } from "@/i18n/client";
import { PASSWORD_MIN } from "@/lib/validation";
import { Alert, Button, Field } from "./ui";

export function LoginForm() {
  const { t } = useT();
  const [state, action, pending] = useActionState(loginAction, undefined);
  return (
    <form action={action} className="space-y-5">
      <h1 className="text-3xl font-semibold tracking-tight">{t("login")}</h1>
      {state?.error && <Alert kind="error">{state.error}</Alert>}
      <Field label={t("email")} name="email" type="email" autoComplete="email" required />
      <Field label={t("password")} name="password" type="password" autoComplete="current-password" required />
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? t("loading") : t("login")}
      </Button>
      <p className="text-sm text-muted">
        {t("noAccount")}{" "}
        <Link href="/register" className="text-fg underline underline-offset-4">
          {t("register")}
        </Link>
      </p>
      <p className="text-sm text-muted">{t("forgotPassword")}</p>
    </form>
  );
}

export function RegisterForm() {
  const { t } = useT();
  const [state, action, pending] = useActionState(registerAction, undefined);
  return (
    <form action={action} className="space-y-5">
      <h1 className="text-3xl font-semibold tracking-tight">{t("register")}</h1>
      {state?.error && <Alert kind="error">{state.error}</Alert>}
      <Field label={t("name")} name="name" autoComplete="given-name" required maxLength={80} />
      <Field label={t("email")} name="email" type="email" autoComplete="email" required />
      <Field
        label={t("password")}
        name="password"
        type="password"
        autoComplete="new-password"
        required
        minLength={PASSWORD_MIN}
        hint={t("passwordHint", { n: PASSWORD_MIN })}
      />
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? t("loading") : t("register")}
      </Button>
      <p className="text-sm text-muted">{t("privacyNote")}</p>
      <p className="text-sm text-muted">
        {t("haveAccount")}{" "}
        <Link href="/login" className="text-fg underline underline-offset-4">
          {t("login")}
        </Link>
      </p>
    </form>
  );
}

export function ResetForm({ token }: { token: string }) {
  const { t } = useT();
  const [state, action, pending] = useActionState(resetPasswordAction, undefined);
  if (state?.ok) {
    return (
      <div className="space-y-5">
        <Alert kind="ok">{state.ok}</Alert>
        <Link href="/login" className="underline underline-offset-4">
          {t("login")}
        </Link>
      </div>
    );
  }
  return (
    <form action={action} className="space-y-5">
      <h1 className="text-3xl font-semibold tracking-tight">{t("resetTitle")}</h1>
      {state?.error && <Alert kind="error">{state.error}</Alert>}
      <input type="hidden" name="token" value={token} />
      <Field
        label={t("newPassword")}
        name="password"
        type="password"
        autoComplete="new-password"
        required
        minLength={PASSWORD_MIN}
        hint={t("passwordHint", { n: PASSWORD_MIN })}
      />
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? t("loading") : t("save")}
      </Button>
    </form>
  );
}
