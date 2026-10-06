/**
 * Static content checks: lessons, worked examples, rule cards and all the
 * links between them.
 */
import { describe, expect, it } from "vitest";
import { SKILLS, UNITS } from "@/content/curriculum";
import { GENERATORS } from "@/content/generators";
import { METAPHORS } from "@/content/metaphors";
import { MNEMONICS } from "@/content/mnemonics";
import { RULES, getRule } from "@/content/rules";
import type { Loc } from "@/i18n/locale";
import { locProblems, renderOrThrow, workedSolutionProblems } from "../helpers/content";

const lessons = UNITS.flatMap((u) => u.lessons);
const generatorIds = new Set(GENERATORS.map((g) => g.id));
const lessonIds = new Set(lessons.map((l) => l.id));

/** All `[[rule:id]]` links in a text. */
const ruleLinks = (loc: Loc) => [...`${loc.nl} ${loc.en}`.matchAll(/\[\[rule:([\w-]+)\]\]/g)].map((m) => m[1]);

describe("curriculum structure", () => {
  it("has units 0 to 12 in order with unique ids", () => {
    expect(UNITS.map((u) => u.index)).toEqual([...Array(13).keys()]);
    expect(new Set(UNITS.map((u) => u.id)).size).toBe(UNITS.length);
  });

  it("has unique lesson ids", () => {
    expect(lessonIds.size).toBe(lessons.length);
  });

  it("available units have lessons and both tests", () => {
    for (const u of UNITS.filter((u) => u.status === "available")) {
      expect(u.lessons.length, u.id).toBeGreaterThan(0);
      expect(u.finalTest, u.id).toBeDefined();
      expect(u.testOut, u.id).toBeDefined();
    }
  });

  it("references only existing generators, rules, metaphors and mnemonics", () => {
    const problems: string[] = [];
    for (const u of UNITS) {
      for (const b of [...(u.finalTest?.blocks ?? []), ...(u.testOut?.blocks ?? [])]) {
        if (!generatorIds.has(b.generatorId)) problems.push(`${u.id}: unknown generator ${b.generatorId}`);
      }
      for (const l of u.lessons) {
        for (const b of l.practice) {
          if (!generatorIds.has(b.generatorId)) problems.push(`${l.id}: unknown generator ${b.generatorId}`);
        }
        for (const s of l.screens) {
          if (s.kind === "explain") {
            if (s.ruleId && !getRule(s.ruleId)) problems.push(`${l.id}: unknown rule ${s.ruleId}`);
            if (s.metaphor && !METAPHORS[s.metaphor]) problems.push(`${l.id}: unknown metaphor ${s.metaphor}`);
            if (s.mnemonic && !MNEMONICS[s.mnemonic]) problems.push(`${l.id}: unknown mnemonic ${s.mnemonic}`);
            for (const r of ruleLinks(s.body)) if (!getRule(r)) problems.push(`${l.id}: broken link rule:${r}`);
          }
        }
      }
    }
    for (const s of SKILLS) {
      if (!lessonIds.has(s.lessonId)) problems.push(`skill ${s.id}: unknown lesson ${s.lessonId}`);
      for (const r of s.ruleIds) if (!getRule(r)) problems.push(`skill ${s.id}: unknown rule ${r}`);
      for (const g of s.generatorIds) if (!generatorIds.has(g)) problems.push(`skill ${s.id}: unknown generator ${g}`);
    }
    for (const g of GENERATORS) {
      if (!SKILLS.some((s) => s.id === g.skillId)) problems.push(`generator ${g.id}: unknown skill ${g.skillId}`);
    }
    for (const m of Object.values(MNEMONICS)) if (!getRule(m.ruleId)) problems.push(`mnemonic ${m.id}: unknown rule`);
    for (const r of RULES) if (r.lessonId && !lessonIds.has(r.lessonId)) problems.push(`rule ${r.id}: unknown lesson`);
    expect(problems).toEqual([]);
  });
});

describe("lesson content", () => {
  it.each(lessons.map((l) => [l.id, l] as const))("%s: texts, formulas and worked examples are valid", (id, lesson) => {
    const problems: string[] = [];
    problems.push(...locProblems(lesson.title, `${id} title`), ...locProblems(lesson.goal, `${id} goal`));
    for (const k of ["what", "why", "later"] as const) problems.push(...locProblems(lesson.info[k], `${id} info.${k}`));
    if (lesson.calculator === "off" && !lesson.calculatorOffReason) problems.push(`${id}: calculator off without a reason`);

    lesson.screens.forEach((s, i) => {
      const where = `${id} screen ${i}`;
      problems.push(...locProblems(s.title, `${where} title`));
      if (s.kind === "explain") {
        problems.push(...locProblems(s.body, `${where} body`));
        if (s.latex) renderOrThrow(s.latex);
        // Dyslexia-friendly: short screens.
        for (const lang of ["nl", "en"] as const) {
          const words = s.body[lang].split(/\s+/).length;
          if (words > 80) problems.push(`${where}: ${words} words in ${lang}, keep screens short`);
        }
      } else {
        problems.push(...locProblems(s.problem, `${where} problem`));
        problems.push(...workedSolutionProblems(s.solution, where));
      }
    });

    // Practice goes from easy to hard.
    const diffs = lesson.practice.map((b) => b.difficulty);
    const perGenerator = new Map<string, number>();
    lesson.practice.forEach((b) => {
      const prev = perGenerator.get(b.generatorId) ?? 0;
      if (b.difficulty < prev) problems.push(`${id}: ${b.generatorId} gets easier again`);
      perGenerator.set(b.generatorId, b.difficulty);
    });
    expect(diffs.length).toBeGreaterThan(0);
    expect(problems).toEqual([]);
  });
});

describe("rule cards, metaphors and mnemonics", () => {
  it.each(RULES.map((r) => [r.id, r] as const))("rule %s is valid", (id, rule) => {
    const problems = [
      ...locProblems(rule.name, `${id} name`),
      ...locProblems(rule.statement, `${id} statement`),
      ...locProblems(rule.example.problem, `${id} example`),
      ...workedSolutionProblems(rule.example, `${id} example`),
    ];
    if (rule.latex) renderOrThrow(rule.latex);
    expect(problems).toEqual([]);
  });

  it("metaphors and mnemonics have both languages", () => {
    const problems: string[] = [];
    for (const m of Object.values(METAPHORS)) {
      problems.push(...locProblems(m.name, m.id), ...locProblems(m.short, m.id), ...locProblems(m.long, m.id));
    }
    for (const m of Object.values(MNEMONICS)) {
      problems.push(...locProblems(m.phrase, m.id));
      for (const p of m.parts) {
        problems.push(...locProblems(p.meaning, `${m.id} ${p.key}`));
        if (p.latex) problems.push(...locProblems({ nl: `$${p.latex.nl}$`, en: `$${p.latex.en}$` }, `${m.id} ${p.key}`));
      }
    }
    expect(problems).toEqual([]);
  });

  it("rule ids are unique", () => {
    expect(new Set(RULES.map((r) => r.id)).size).toBe(RULES.length);
  });
});
