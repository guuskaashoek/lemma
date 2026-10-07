/**
 * Registry of all exercise generators (collected from the unit bundles), and
 * the helper that turns a generator plus a seed into a concrete exercise.
 */
import { createRng } from "@/math/random";
import type { Difficulty, Exercise, Generator } from "../types";
import { BUNDLES } from "../units";

export const GENERATORS: Generator[] = BUNDLES.flatMap((b) => b.generators);

const byId = new Map(GENERATORS.map((g) => [g.id, g]));

export function getGenerator(id: string): Generator {
  const g = byId.get(id);
  if (!g) throw new Error(`Unknown generator: ${id}`);
  return g;
}

/** Creates one exercise. The same (generator, difficulty, seed) always gives the same exercise. */
export function makeExercise(generatorId: string, difficulty: Difficulty, seed: string): Exercise {
  const g = getGenerator(generatorId);
  const rng = createRng(`${generatorId}|${difficulty}|${seed}`);
  return { ...g.generate(rng, difficulty), generatorId, skillId: g.skillId, seed, difficulty };
}
