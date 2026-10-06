"use client";
/** Change password and delete account. */
import { useActionState, useState } from "react";
import { changePasswordAction, deleteAccountAction } from "@/app/actions/settings";
import { useT } from "@/i18n/client";
import { PASSWORD_MIN } from "@/lib/validation";
import { Alert, Button, Field } from "./ui";

export function AccountActions({ name, email }: { name: string; email: string }) {
  const { t } = useT();
  const [pwState, pwAction, pwPending] = useActionState(changePasswordAction, undefined);
  const [delState, delAction, delPending] = useActionState(deleteAccountAction, undefined);
  const [confirming, setConfirming] = useState(false);

  return (
    <section className="space-y-10">
      <div>
        <h2 className="mb-2 text-2xl font-semibold">{t("account")}</h2>
        <p className="text-muted">
          {name} · {email}
        </p>
        <p className="mt-2 text-sm text-muted">{t("privacyNote")}</p>
      </div>

      <form action={pwAction} className="space-y-4">
        <h3 className="text-lg font-semibold">{t("changePassword")}</h3>
        {pwState?.error && <Alert kind="error">{pwState.error}</Alert>}
        {pwState?.ok && <Alert kind="ok">{pwState.ok}</Alert>}
        <Field label={t("currentPassword")} name="currentPassword" type="password" autoComplete="current-password" required />
        <Field
          label={t("newPassword")}
          name="newPassword"
          type="password"
          autoComplete="new-password"
          minLength={PASSWORD_MIN}
          required
          hint={t("passwordHint", { n: PASSWORD_MIN })}
        />
        <Button type="submit" variant="secondary" disabled={pwPending}>
          {t("changePassword")}
        </Button>
      </form>

      <div className="rounded-xl border border-bad p-5">
        <h3 className="text-lg font-semibold text-bad">{t("deleteAccount")}</h3>
        <p className="mt-1 mb-4">{t("deleteAccountText")}</p>
        {!confirming ? (
          <Button variant="danger" onClick={() => setConfirming(true)}>
            {t("deleteAccount")}
          </Button>
        ) : (
          <form action={delAction} className="space-y-4">
            {delState?.error && <Alert kind="error">{delState.error}</Alert>}
            <Field label={t("deleteAccountConfirm")} name="password" type="password" autoComplete="current-password" required />
            <div className="flex gap-3">
              <Button type="submit" variant="danger" disabled={delPending}>
                {t("deleteForever")}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setConfirming(false)}>
                {t("cancel")}
              </Button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
