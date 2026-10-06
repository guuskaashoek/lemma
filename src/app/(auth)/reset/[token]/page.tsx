import { ResetForm } from "@/components/auth-forms";
import { Alert } from "@/components/ui";
import { getT } from "@/i18n/server";
import { findValidToken } from "@/lib/password-reset";

/** Password reset with a one-time link created by an admin. */
export default async function ResetPage({ params }: PageProps<"/reset/[token]">) {
  const { token } = await params;
  const { t } = await getT();
  if (!findValidToken(token)) return <Alert kind="error">{t("resetInvalid")}</Alert>;
  return <ResetForm token={token} />;
}
