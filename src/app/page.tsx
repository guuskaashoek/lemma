/**
 * Landing page for visitors. Signed-in users go straight to their roadmap.
 */
import Link from "next/link";
import { redirect } from "next/navigation";
import { LanguageSwitch } from "@/components/language-switch";
import { getT } from "@/i18n/server";
import { getCurrentUser } from "@/lib/session";

export default async function Home() {
  if (await getCurrentUser()) redirect("/learn");
  const { t } = await getT();
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6 py-16">
      <div className="mb-16 flex items-center justify-between">
        <span className="text-xl font-semibold tracking-tight">Lemma</span>
        <LanguageSwitch />
      </div>
      <h1 className="text-5xl leading-tight font-semibold tracking-tight">{t("tagline")}</h1>
      <ul className="mt-10 space-y-3 text-lg text-muted">
        {(["landingPoint1", "landingPoint2", "landingPoint3", "landingPoint4"] as const).map((k) => (
          <li key={k} className="flex gap-3">
            <span aria-hidden>—</span>
            {t(k)}
          </li>
        ))}
      </ul>
      <div className="mt-12 flex gap-3">
        <Link href="/register" className="rounded-lg bg-invert-bg px-5 py-3 font-semibold text-invert-fg hover:opacity-90">
          {t("register")}
        </Link>
        <Link href="/login" className="rounded-lg border border-border-strong px-5 py-3 font-semibold hover:border-fg">
          {t("login")}
        </Link>
      </div>
    </main>
  );
}
