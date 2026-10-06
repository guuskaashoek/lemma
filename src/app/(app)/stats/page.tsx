/**
 * Personal statistics: time, XP, accuracy, hint use, strong and weak topics.
 */
import { getSkill } from "@/content/curriculum";
import { Card, Eyebrow } from "@/components/ui";
import { getT } from "@/i18n/server";
import { getDailySummary, getStats } from "@/lib/progress";
import { getSettings, requireOnboardedUser } from "@/lib/session";

export default async function StatsPage() {
  const user = await requireOnboardedUser();
  const { t, locale } = await getT();
  const s = getStats(user.id);
  const settings = await getSettings(user.id);
  const daily = getDailySummary(user.id, settings?.dailyGoalXp ?? 20);

  const pct = (n: number, d: number) => (d === 0 ? "–" : `${Math.round((n / d) * 100)}%`);
  const hours = Math.floor(s.seconds / 3600);
  const minutes = Math.round((s.seconds % 3600) / 60);

  // Skills with at least 3 answers, ranked by accuracy.
  const ranked = s.skills
    .filter((k) => k.answers >= 3 && getSkill(k.skillId))
    .map((k) => ({ ...k, rate: k.correct / k.answers, name: getSkill(k.skillId)!.name[locale] }))
    .sort((a, b) => b.rate - a.rate);
  const strong = ranked.filter((k) => k.rate >= 0.8).slice(0, 5);
  const weak = [...ranked].reverse().filter((k) => k.rate < 0.8).slice(0, 5);

  // Last 14 days of XP as a simple bar chart.
  const maxXp = Math.max(1, ...s.days.map((d) => d.xp));

  const tiles: Array<[string, string]> = [
    [t("statTime"), t("hoursMinutes", { h: hours, m: minutes })],
    [t("statXp"), String(s.xp)],
    [t("statStreak"), t(daily.streak === 1 ? "streakDay" : "streakDays", { n: daily.streak })],
    [t("statLessons"), String(s.lessonsDone)],
    [t("statAccuracy"), pct(s.correct, s.answers)],
    [t("statHints"), pct(s.withHints, s.answers)],
  ];

  return (
    <div className="space-y-10">
      <h1 className="text-4xl font-semibold tracking-tight">{t("statsTitle")}</h1>
      <div className="grid gap-3 sm:grid-cols-3">
        {tiles.map(([label, value]) => (
          <Card key={label}>
            <Eyebrow>{label}</Eyebrow>
            <p className="text-3xl font-semibold">{value}</p>
          </Card>
        ))}
      </div>
      <p className="text-muted">{t("statHintsNote")}</p>

      <section>
        <h2 className="mb-4 text-xl font-semibold">{t("statLast14")}</h2>
        <div className="flex h-40 items-end gap-2 border-b border-border" role="img" aria-label={t("statLast14")}>
          {s.days.map(({ day, xp }) => {
            return (
              <div key={day} className="flex h-full flex-1 flex-col items-center justify-end" title={`${day}: ${xp} XP`}>
                <div className="w-full rounded-t bg-fg" style={{ height: `${(xp / maxXp) * 100}%`, minHeight: xp ? 4 : 0 }} />
              </div>
            );
          })}
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        {([
          [t("statStrong"), strong],
          [t("statWeak"), weak],
        ] as const).map(([title, list]) => (
          <section key={title}>
            <h2 className="mb-3 text-xl font-semibold">{title}</h2>
            {list.length === 0 ? (
              <p className="text-muted">{t("statNoData")}</p>
            ) : (
              <ul className="space-y-2">
                {list.map((k) => (
                  <li key={k.skillId} className="flex justify-between rounded-lg border border-border px-4 py-2">
                    <span>{k.name}</span>
                    <span className="text-muted">
                      {pct(k.correct, k.answers)} · {t("statHints")} {pct(k.withHints, k.answers)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
