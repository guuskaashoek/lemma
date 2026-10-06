/**
 * Spaced-repetition review: two exercises per due skill, most overdue first.
 * Difficulty grows with how well the skill is remembered (FSRS stability).
 */
import crypto from "node:crypto";
import Link from "next/link";
import { SessionPlayer, type SessionItem } from "@/components/session-player";
import { getSkill } from "@/content/curriculum";
import type { Difficulty } from "@/content/types";
import { getT } from "@/i18n/server";
import { getDueSkills } from "@/lib/progress";
import { createRng } from "@/math/random";
import { requireOnboardedUser } from "@/lib/session";

export default async function ReviewPage() {
  const user = await requireOnboardedUser();
  const { t } = await getT();
  const due = getDueSkills(user.id, 5);

  if (due.length === 0) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <h1 className="text-3xl font-semibold">{t("reviewTitle")}</h1>
        <p className="mt-4 text-lg text-muted">{t("reviewNothing")}</p>
        <Link href="/learn" className="mt-8 inline-block rounded-lg bg-invert-bg px-5 py-3 font-semibold text-invert-fg">
          {t("backToRoadmap")}
        </Link>
      </div>
    );
  }

  const seed = crypto.randomUUID();
  const rng = createRng(seed);
  const items: SessionItem[] = [];
  for (const card of due) {
    const skill = getSkill(card.skillId);
    if (!skill) continue;
    const difficulty: Difficulty = card.stability < 3 ? 1 : card.stability < 15 ? 2 : 3;
    for (let i = 0; i < 2; i++) items.push({ generatorId: rng.pick(skill.generatorIds), difficulty });
  }

  return (
    <SessionPlayer
      mode="review"
      contextId="review"
      title={{ nl: "Herhalen", en: "Review" }}
      items={rng.shuffle(items)}
      seed={seed}
      calculator="allowed"
    />
  );
}
