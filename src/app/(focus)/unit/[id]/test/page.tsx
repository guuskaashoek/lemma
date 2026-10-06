/**
 * Final test (>= 80% unlocks the next unit) or "test out" (>= 90% skips this
 * unit). Questions are shuffled per attempt.
 */
import crypto from "node:crypto";
import { notFound, redirect } from "next/navigation";
import { SessionPlayer } from "@/components/session-player";
import { getUnit } from "@/content/curriculum";
import { createRng } from "@/math/random";
import { getRoadmap } from "@/lib/progress";
import { requireOnboardedUser } from "@/lib/session";

export default async function UnitTestPage({ params, searchParams }: PageProps<"/unit/[id]/test">) {
  const { id } = await params;
  const mode = (await searchParams).mode === "testout" ? "testout" : "final";
  const user = await requireOnboardedUser();
  const unit = getUnit(id);
  const spec = mode === "final" ? unit?.finalTest : unit?.testOut;
  if (!unit || !spec) notFound();

  const state = getRoadmap(user.id).find((r) => r.unit.id === id);
  if (!state || state.state === "locked" || state.state === "planned") redirect("/learn");
  if (mode === "final" && !state.finalTestOpen) redirect("/learn");

  const seed = crypto.randomUUID();
  const items = createRng(seed).shuffle(
    spec.blocks.flatMap((b) => Array.from({ length: b.count }, () => ({ generatorId: b.generatorId, difficulty: b.difficulty }))),
  );
  return (
    <SessionPlayer
      mode={mode}
      contextId={unit.id}
      title={unit.title}
      items={items}
      seed={seed}
      calculator={spec.calculator}
    />
  );
}
