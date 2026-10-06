/**
 * The shape of all learning content.
 *
 * Content is plain, typed TypeScript data that lives in the repository (not in
 * the database). That way every change is reviewed in git, and tests can walk
 * through all of it to check the mathematics.
 *
 * Text fields are `Loc` (Dutch + English). Text may contain:
 * - inline formulas between `$...$` (LaTeX, coloured automatically),
 * - `**bold**`,
 * - links to rule cards: `[[rule:order-of-operations]]`.
 */
import type { Loc } from "@/i18n/locale";
import type { AnswerSpec, Mistake } from "@/math/check";
import type { Rng } from "@/math/random";

export type { Loc };

/** Ids of the fixed metaphors (see `metaphors.ts`). */
export type MetaphorId = "balance" | "machine" | "slope";
/** Ids of the fixed mnemonics (see `mnemonics.ts`). */
export type MnemonicId = "hmwvdoa" | "soscastoa";

/** One step of a worked solution: a formula plus a short explanation. */
export type Step = {
  latex: string;
  note: Loc;
  /**
   * Marks a rounding step (`x \approx 4.6`). It is checked against the
   * previous step with a tolerance instead of exact equivalence.
   */
  approx?: { decimals: number };
};

/** A simple diagram shown with an exercise or example. */
export type Figure = {
  kind: "right-triangle";
  /** Size of the marked angle in degrees (drawn at the bottom-left corner). */
  angleDeg: number;
  /** Label of the marked angle, e.g. "\\alpha" or "35^\\circ". */
  angleLabel?: string;
  /** Side labels in LaTeX, relative to the marked angle. */
  labels: { opposite?: string; adjacent?: string; hypotenuse?: string };
};

/**
 * A worked solution. Tests check that every step follows from the previous
 * one with the CAS. For equations, `solutions` lists the known solutions so
 * the checker can verify no solution is lost or invented.
 */
export type WorkedSolution = {
  steps: Step[];
  solutions?: Array<Record<string, number>>;
};

/** One screen of a lesson. Each screen holds a single idea. */
export type Screen =
  | {
      kind: "explain";
      title: Loc;
      body: Loc;
      /** Optional big formula below the text. */
      latex?: string;
      metaphor?: MetaphorId;
      mnemonic?: MnemonicId;
      /** Rule card introduced or used on this screen. */
      ruleId?: string;
    }
  | {
      kind: "example";
      title: Loc;
      /** The problem being worked out. */
      problem: Loc;
      solution: WorkedSolution;
    };

/** A generated exercise, ready to show. */
export type Exercise = {
  generatorId: string;
  skillId: string;
  seed: string;
  difficulty: Difficulty;
  /** The question, as rich text. */
  prompt: Loc;
  /** Optional big formula shown under the question. */
  latex?: string;
  figure?: Figure;
  answer: AnswerSpec;
  hints: {
    /** Hint 1: a small nudge in the right direction. */
    nudge: Loc;
    /** Hint 2: which rule you need. */
    rule: { text: Loc; ruleId?: string; mnemonic?: MnemonicId; metaphor?: MetaphorId };
    /** Hint 3: the full worked solution. */
    solution: WorkedSolution;
  };
  /** Typical mistakes with targeted feedback. */
  mistakes?: Mistake[];
  /** Overrides the lesson's calculator setting for this exercise. */
  calculator?: CalculatorPolicy;
};

export type Difficulty = 1 | 2 | 3;

/** What a generator returns; the framework adds ids, seed and difficulty. */
export type GeneratedExercise = Omit<Exercise, "generatorId" | "skillId" | "seed" | "difficulty">;

/**
 * An exercise generator. It must compute the answer with code from its own
 * random parameters; the tests then verify that answer independently.
 */
export type Generator = {
  id: string;
  skillId: string;
  title: Loc;
  generate(rng: Rng, difficulty: Difficulty): GeneratedExercise;
  /**
   * Independent check used by the tests: is `exercise.answer` correct?
   * This must NOT re-use the generator's computation. Typical approaches:
   * substitute the solution back into the equation, expand a factorisation,
   * or recompute with the calculator engine.
   */
  verify(exercise: GeneratedExercise): boolean;
  /** Optional: are the numbers "nice" (whole, small, ...) for this exercise? */
  isNice?(exercise: GeneratedExercise): boolean;
};

export type CalculatorPolicy = "allowed" | "off";

/** "What is this, why do you need it, where will you see it again?" */
export type InfoPanel = {
  what: Loc;
  why: Loc;
  later: Loc;
};

/** A block of practice exercises from one generator at one difficulty. */
export type PracticeBlock = {
  generatorId: string;
  difficulty: Difficulty;
  count: number;
};

export type Lesson = {
  id: string;
  title: Loc;
  /** One sentence: what you can do after this lesson. */
  goal: Loc;
  minutes: number;
  calculator: CalculatorPolicy;
  /** Shown when the calculator is off, e.g. "you learn to do this by hand". */
  calculatorOffReason?: Loc;
  info: InfoPanel;
  screens: Screen[];
  /** Ordered from easy to hard. */
  practice: PracticeBlock[];
};

export type TestSpec = {
  blocks: PracticeBlock[];
  calculator: CalculatorPolicy;
};

export type Unit = {
  id: string;
  index: number;
  title: Loc;
  summary: Loc;
  /** `planned` units are visible on the roadmap but have no lessons yet. */
  status: "available" | "planned";
  lessons: Lesson[];
  finalTest?: TestSpec;
  testOut?: TestSpec;
};

/** A rule card: a named rule that is linked from lessons and hints. */
export type RuleCard = {
  id: string;
  /** Short, memorable name. */
  name: Loc;
  /** The rule itself, in one or two short sentences. */
  statement: Loc;
  /** Optional formula form of the rule. */
  latex?: string;
  example: WorkedSolution & { problem: Loc };
  mnemonic?: MnemonicId;
  /** Lesson where this rule is taught (for "go back" links). */
  lessonId?: string;
};

/** A skill is the unit of spaced repetition and of strong/weak statistics. */
export type Skill = {
  id: string;
  name: Loc;
  /** Lesson that teaches this skill. */
  lessonId: string;
  ruleIds: string[];
  /** Generators that can produce review exercises for this skill. */
  generatorIds: string[];
};
