/**
 * Layout for all pages of a signed-in, onboarded user: top navigation with
 * streak and today's XP.
 */
import Link from "next/link";
import { logoutAction } from "@/app/actions/auth";
import { IconFlame } from "@/components/icons";
import { Logo } from "@/components/logo";
import { NavLinks } from "@/components/nav-links";
import { getT } from "@/i18n/server";
import { countDueSkills, getDailySummary } from "@/lib/progress";
import { getSettings, requireOnboardedUser } from "@/lib/session";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const user = await requireOnboardedUser();
  const settings = await getSettings(user.id);
  const { t } = await getT();
  const daily = getDailySummary(user.id, settings?.dailyGoalXp ?? 20);
  const due = countDueSkills(user.id);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-border bg-bg/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-6">
          <Link href="/learn" aria-label="Lemma">
            <Logo />
          </Link>
          <NavLinks
            links={[
              { href: "/learn", label: t("navLearn") },
              { href: "/review", label: t("navReview"), badge: due },
              { href: "/rules", label: t("navRules") },
              { href: "/stats", label: t("navStats") },
              { href: "/settings", label: t("navSettings") },
              ...(user.isAdmin ? [{ href: "/admin", label: t("navAdmin") }] : []),
            ]}
          />
          <div className="ml-auto flex items-center gap-5 text-sm">
            <span className="flex items-center gap-1.5" title={t(daily.streak === 1 ? "streakDay" : "streakDays", { n: daily.streak })}>
              <IconFlame width={18} height={18} />
              <span className="font-semibold">{daily.streak}</span>
            </span>
            <span className="text-muted" title={t("dailyGoal")}>
              {daily.xpToday} / {daily.dailyGoalXp} XP
            </span>
            <form action={logoutAction}>
              <button className="text-muted hover:text-fg">{t("logout")}</button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10 pb-28">{children}</main>
    </div>
  );
}
