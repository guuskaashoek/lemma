/**
 * Every generator, every difficulty, 200 random exercises each.
 *
 * For each exercise we check that:
 * - the answer is correct, verified independently of the generator,
 * - the official answer passes our own answer checker,
 * - no typical-mistake answer is accepted as correct,
 * - the hint-3 worked solution is valid step by step (CAS) and ends at the answer,
 * - all formulas render and all texts exist in Dutch and English,
 * - no NaN, Infinity or division by zero shows up,
 * - numbers stay "nice" where the generator promises that.
 */
import { describe, expect, it } from "vitest";
import { GENERATORS, makeExercise } from "@/content/generators";
import { checkAnswer } from "@/math/check";
import type { Difficulty } from "@/content/types";
import {
  finalStepMatches,
  locProblems,
  perfectSubmission,
  guidedProblems,
  renderOrThrow,
  visualProblems,
  workedSolutionProblems,
} from "../helpers/content";

const SAMPLES = 200;
const DIFFICULTIES: Difficulty[] = [1, 2, 3];

describe.each(GENERATORS.map((g) => [g.id, g] as const))("generator %s", (id, generator) => {
  it.each(DIFFICULTIES)(`difficulty %i: ${SAMPLES} exercises are correct and clean`, (difficulty) => {
    const problems: string[] = [];
    const distinct = new Set<string>();

    for (let i = 0; i < SAMPLES; i++) {
      const seed = `test-${i}`;
      const where = `${id} d${difficulty} seed ${seed}`;
      let ex;
      try {
        ex = makeExercise(id, difficulty, seed);
      } catch (e) {
        problems.push(`${where}: generate threw ${(e as Error).message}`);
        continue;
      }
      distinct.add(JSON.stringify([ex.latex, ex.answer]));

      const text = JSON.stringify(ex);
      if (/NaN|Infinity|undefined/.test(text)) problems.push(`${where}: NaN/Infinity/undefined in exercise`);

      if (!generator.verify(ex)) problems.push(`${where}: independent verification failed (${ex.latex})`);

      const r = checkAnswer(ex.answer, perfectSubmission(ex.answer), ex.mistakes);
      if (!r.correct) problems.push(`${where}: official answer rejected by checker: ${JSON.stringify(r)}`);

      for (const m of ex.mistakes ?? []) {
        const mr = checkAnswer(
          ex.answer,
          ex.answer.kind === "solutions" ? { kind: "solutions", latex: [m.latex] } : { kind: "expr", latex: m.latex },
        );
        if (mr.correct) problems.push(`${where}: mistake "${m.id}" (${m.latex}) is accepted as correct`);
        problems.push(...locProblems(m.explain, `${where} mistake ${m.id}`));
      }

      problems.push(...workedSolutionProblems(ex.hints.solution, `${where} solution`));
      problems.push(...guidedProblems(ex.hints.solution, `${where} solution`));
      if (ex.visual) problems.push(...visualProblems(ex.visual, `${where} visual`, ex.latex));
      if (!finalStepMatches(ex.hints.solution, ex.answer)) problems.push(`${where}: last step is not the answer`);

      problems.push(...locProblems(ex.prompt, `${where} prompt`));
      problems.push(...locProblems(ex.hints.nudge, `${where} hint 1`));
      problems.push(...locProblems(ex.hints.rule.text, `${where} hint 2`));
      if (ex.latex) {
        try {
          renderOrThrow(ex.latex);
        } catch (e) {
          problems.push(`${where}: KaTeX ${(e as Error).message}`);
        }
      }

      if (generator.isNice && !generator.isNice(ex)) problems.push(`${where}: numbers not nice (${ex.latex})`);

      // Stop early so a broken generator gives a readable report.
      if (problems.length > 20) break;
    }

    expect(problems).toEqual([]);
    // Enough variety to practise "endlessly".
    expect(distinct.size).toBeGreaterThan(SAMPLES * 0.25);
  });

  it("is deterministic for a given seed", () => {
    expect(makeExercise(id, 2, "same")).toEqual(makeExercise(id, 2, "same"));
  });
});
