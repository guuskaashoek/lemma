/**
 * The roadmap: all units, in order, plus lookup helpers. The data itself
 * comes from the unit bundles in `units/`.
 *
 * Unit 0 is always the starting point. A unit unlocks once the final test of
 * the previous unit is passed (>= 80%) or the previous unit was skipped with
 * a "test out" score of >= 90%.
 */
import type { Lesson, Skill, Unit } from "./types";
import { BUNDLES } from "./units";

/** Score needed to pass a final test. */
export const FINAL_PASS = 0.8;
/** Score needed to skip a unit with the "test out" test. */
export const TEST_OUT_PASS = 0.9;

export const UNITS: Unit[] = BUNDLES.map((b) => b.unit);

/** Skills: the unit of spaced repetition and of strong/weak statistics. */
export const SKILLS: Skill[] = BUNDLES.flatMap((b) => b.skills);

const unitById = new Map(UNITS.map((u) => [u.id, u]));
const lessonIndex = new Map<string, { lesson: Lesson; unit: Unit; index: number }>();
for (const u of UNITS) u.lessons.forEach((l, index) => lessonIndex.set(l.id, { lesson: l, unit: u, index }));
const skillById = new Map(SKILLS.map((s) => [s.id, s]));

export const getUnit = (id: string) => unitById.get(id);
export const getLessonEntry = (id: string) => lessonIndex.get(id);
export const getSkill = (id: string) => skillById.get(id);
