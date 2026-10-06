/**
 * Lesson page. Locked lessons cannot be opened by typing the URL.
 */
import crypto from "node:crypto";
import { notFound, redirect } from "next/navigation";
import { SessionPlayer } from "@/components/session-player";
import { getLessonEntry } from "@/content/curriculum";
import { getRoadmap } from "@/lib/progress";
import { requireOnboardedUser } from "@/lib/session";

export default async function LessonPage({ params }: PageProps<"/lesson/[id]">) {
  const { id } = await params;
  const user = await requireOnboardedUser();
  const entry = getLessonEntry(id);
  if (!entry) notFound();

  const unitState = getRoadmap(user.id).find((r) => r.unit.id === entry.unit.id);
  const lessonState = unitState?.lessons.find((l) => l.id === id)?.state;
  if (!lessonState || lessonState === "locked") redirect("/learn");

  const { lesson } = entry;
  return (
    <SessionPlayer
      mode="lesson"
      contextId={lesson.id}
      title={lesson.title}
      screens={lesson.screens}
      items={lesson.practice.flatMap((b) => Array.from({ length: b.count }, () => ({ generatorId: b.generatorId, difficulty: b.difficulty })))}
      seed={crypto.randomUUID()}
      calculator={lesson.calculator}
      calculatorOffReason={lesson.calculatorOffReason}
      info={lesson.info}
    />
  );
}
