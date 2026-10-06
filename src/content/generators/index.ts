/**
 * Registry of all exercise generators, and the helper that turns a generator
 * plus a seed into a concrete exercise.
 */
import { createRng } from "@/math/random";
import type { Difficulty, Exercise, Generator } from "../types";
import { addFractions, orderOfOperations } from "./arithmetic";
import { commonFactor, linearEquation } from "./algebra";
import { sohCahToaSide } from "./trig";

export const GENERATORS: Generator[] = [
  orderOfOperations,
  addFractions,
  linearEquation,
  commonFactor,
  sohCahToaSide,
];

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
