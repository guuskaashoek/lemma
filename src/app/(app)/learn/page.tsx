/**
 * The roadmap: every unit with its lessons, tests and progress.
 */
import Link from "next/link";
import { IconCheck, IconLock, IconPractice, IconRepeat } from "@/components/icons";
import { Eyebrow, ProgressBar } from "@/components/ui";
import { getT } from "@/i18n/server";
import { countDueSkills, getRoadmap } from "@/lib/progress";
import { requireOnboardedUser } from "@/lib/session";

export default async function LearnPage() {
  const user = await requireOnboardedUser();
  const { t, locale } = await getT();
  const roadmap = getRoadmap(user.id);
  const due = countDueSkills(user.id);
  // The unit to focus on: the first one that is open but not finished.
  const current = roadmap.find((r) => r.state === "available") ?? roadmap[0];

  return (
    <div className="grid gap-12 lg:grid-cols-[1fr_18rem]">
      <div>
        <h1 className="text-4xl font-semibold tracking-tight">{t("roadmapTitle")}</h1>
        <p className="mt-2 mb-10 text-lg text-muted">{t("roadmapIntro")}</p>

        <ol className="relative space-y-4 border-l border-border pl-8">
          {roadmap.map((r) => {
            const isCurrent = r === current;
            const open = r.state !== "locked" && r.state !== "planned";
            return (
              <li key={r.unit.id} id={r.unit.id} className="relative">
                <span
                  aria-hidden
                  className={`absolute top-6 -left-[2.55rem] flex h-5 w-5 items-center justify-center rounded-full border ${
                    r.state === "passed" || r.state === "skipped"
                      ? "border-fg bg-invert-bg text-invert-fg"
                      : isCurrent
                        ? "border-fg bg-bg"
                        : "border-border bg-bg"
                  }`}
                >
                  {(r.state === "passed" || r.state === "skipped") && <IconCheck width={12} height={12} />}
                </span>
                <section
                  className={`rounded-xl border p-6 ${isCurrent ? "border-border-strong bg-surface" : "border-border"} ${!open ? "opacity-60" : ""}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Eyebrow>{t("unit", { n: r.unit.index })}</Eyebrow>
                      <h2 className="text-2xl font-semibold tracking-tight">{r.unit.title[locale]}</h2>
                      <p className="mt-1 text-muted">{r.unit.summary[locale]}</p>
                    </div>
                    <span className="shrink-0 rounded-full border border-border px-3 py-1 text-xs text-muted">
                      {r.state === "planned"
                        ? t("unitPlanned")
                        : r.state === "locked"
                          ? t("unitLocked")
                          : r.state === "passed"
                            ? t("unitDone")
                            : r.state === "skipped"
                              ? t("unitSkipped")
                              : t("unitProgress", { done: r.lessonsDone, total: r.unit.lessons.length })}
                    </span>
                  </div>

                  {open && r.unit.lessons.length > 0 && (
                    <>
                      <div className="mt-4">
                        <ProgressBar value={r.lessonsDone / r.unit.lessons.length} label={r.unit.title[locale]} />
                      </div>
                      <ul className="mt-5 grid gap-2">
                        {r.unit.lessons.map((lesson, i) => {
                          const st = r.lessons[i].state;
                          const body = (
                            <>
                              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border">
                                {st === "done" ? <IconCheck width={16} height={16} /> : st === "locked" ? <IconLock width={16} height={16} /> : <IconPractice width={16} height={16} />}
                              </span>
                              <span className="flex-1">
                                <span className="block font-semibold">{lesson.title[locale]}</span>
                                <span className="block text-sm text-muted">{lesson.goal[locale]}</span>
                              </span>
                              <span className="text-sm text-muted">{t("minutes", { n: lesson.minutes })}</span>
                            </>
                          );
                          return (
                            <li key={lesson.id}>
                              {st === "locked" ? (
                                <div className="flex items-center gap-4 rounded-lg border border-border px-4 py-3 opacity-60">{body}</div>
                              ) : (
                                <Link
                                  href={`/lesson/${lesson.id}`}
                                  className={`flex items-center gap-4 rounded-lg border px-4 py-3 hover:border-fg ${st === "next" ? "border-border-strong" : "border-border"}`}
                                >
                                  {body}
                                </Link>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                      <div className="mt-5 flex flex-wrap gap-3">
                        {r.finalTestOpen ? (
                          <Link href={`/unit/${r.unit.id}/test?mode=final`} className="rounded-lg bg-invert-bg px-4 py-2 font-semibold text-invert-fg hover:opacity-90">
                            {t("finalTest")}
                          </Link>
                        ) : (
                          <span className="rounded-lg border border-border px-4 py-2 text-muted" title={t("finishLessonsFirst")}>
                            {t("finalTest")} · {t("finishLessonsFirst")}
                          </span>
                        )}
                        {r.state === "available" && r.unit.testOut && (
                          <Link href={`/unit/${r.unit.id}/test?mode=testout`} className="rounded-lg border border-border-strong px-4 py-2 font-semibold hover:border-fg">
                            {t("testOut")}
                          </Link>
                        )}
                      </div>
                      <p className="mt-3 text-sm text-muted">{r.finalTestOpen ? t("finalTestInfo") : ""}</p>
                    </>
                  )}
                </section>
              </li>
            );
          })}
        </ol>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-xl border border-border p-5">
          <div className="flex items-center gap-2 font-semibold">
            <IconRepeat /> {t("navReview")}
          </div>
          <p className="mt-2 text-muted">{due > 0 ? t("reviewDue", { n: due }) : t("reviewNothing")}</p>
          {due > 0 && (
            <Link href="/review" className="mt-3 inline-block rounded-lg bg-invert-bg px-4 py-2 font-semibold text-invert-fg">
              {t("start")}
            </Link>
          )}
        </div>
        <div className="rounded-xl border border-border p-5 text-sm text-muted">{t("testOutInfo")}</div>
      </aside>
    </div>
  );
}
