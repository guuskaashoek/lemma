# Lemma content guide

This guide is for anyone who writes lessons for Lemma, human or AI. Read it completely before you write content. The reference lesson is **`src/content/units/u02/`** (`lessons.ts`, `generators.ts`, `rules.ts`, `index.ts`): copy its patterns.

## The learner

- 19 years old. Studied pre-vocational maths (vmbo kader) a few years ago and was good at it, but has forgotten a lot, including sin/cos/tan. Now in MBO 4 web design.
- Goal: from vmbo kader level to vwo wiskunde B, then the maths a university AI bachelor expects.
- **Has dyslexia.** Use short sentences, little text per screen and simple words. Everything is read aloud.
- Thinks in **shapes and pictures**. Learns best from simple explanations, fixed recognition points and practising straight away.
- **Never leave a gap.** Start a bit too easy rather than skipping a step. Assume nothing that has not been taught earlier in the roadmap.

## Hard rules

1. **Stay in your unit folder.** Only create or edit files in `src/content/units/uNN/`, plus tests in `tests/units/`.
   - Shared files are off limits: `src/content/types.ts`, `curriculum.ts`, `rules.ts`, `metaphors.ts`, `mnemonics.ts`, `src/visuals/**`, `src/components/**`, `src/math/**`, `src/i18n/**`, `tests/helpers/**` and `tests/content/**`.
   - If you truly need a shared change, do without it and report the need.
2. **Prefix every id with your unit.** This covers lessons, generators, skills, rules and custom widgets. Examples: `u3.slope`, `u3.slope-from-graph`.
3. **Write every text in Dutch and English.** Each text is `{ nl, en }`. Use the Dutch school terms: abc-formule, ontbinden in factoren, richtingscoëfficiënt, SOS CAS TOA, primitiveren, rekenregels, etc. Write English as natural English, not a literal translation.
4. **Every number must be right.** Never type a computed number by hand.
   - Generators compute every answer with code, using exact fractions (`fraction.js`) or the CAS.
   - Every generator gets a `verify()` that checks the answer **by a different route** than the one that produced it. Examples: substitute the answer back in, expand a factorisation, compute an angle back with an inverse function, or check a derivative with a difference quotient.
   - Never re-run the same code path in `verify()`.
5. **Write worked steps as formulas the CAS can check.**
   - Every step is one expression, equation or inequality in LaTeX. Consecutive steps must be equivalent.
   - Mark what changed with `\hl{...}`.
   - Mark the part the learner fills in during "samen oplossen" with **`\ask{...}`**: at most one per step, normally the result of the step.
   - A rounding step uses `\approx` with `approx: { decimals }`.
   - For equations, give `solutions` when you know them.
6. **Use the fixed recognition points everywhere.**
   - Metaphors, always the same: an equation is a **balance** (`balance`), a function is a **machine** (`machine`), a derivative is the **slope at one point** (`slope`).
   - School mnemonics, where they exist: `hmwvdoa`, `soscastoa`.
   - Every rule gets a **rule card** with a short fixed name. Link it with `[[rule:uN.id]]` and from hint 2.
   - Formula colours come automatically: variables, numbers, and `\hl` for what changes. Never add colours.
7. **Use the calculator policy.** Every lesson sets `calculator: "allowed" | "off"`. When it is off, give a `calculatorOffReason` in both languages, e.g. "Dit leer je met de hand." Per exercise you may override it.

## What a unit contains

`src/content/units/uNN/index.ts` exports a `UnitBundle`:

- **`unit`**:
  - `status: "available"`
  - **5 to 10 lessons**, each 5–10 minutes
  - `finalTest`: about 10 questions, mixing all skills, harder ones included
  - `testOut`: about 10 questions at the hardest level. It must be hard enough that 90% really means "you know this".
- **`generators`**: all generators used anywhere in the unit.
- **`skills`**: one per thing to practise. Each has the lesson that teaches it, its rule cards and its generators. Every generator's `skillId` must exist.
- **`rules`**: the rule cards. Each card's `example` is checked by the tests and its `lessonId` points to a real lesson.
- **`widgets`** (optional): unit-specific React widgets for `{ kind: "custom" }` visuals.

## What a lesson looks like

Follow `u02/lessons.ts`:

1. **Explain screens.** One idea per screen. At most about 60 words, usually much less, in short lines (`\n` makes a new paragraph).
2. **A visual screen** (`kind: "visual"`) **before** the rule, whenever the topic can be seen. Add a `task` that tells the learner what to try ("Haal links en rechts 3 blokjes weg.").
3. **Worked examples** (`kind: "example"`) with steps, and a `visual` when it helps.
4. **The rule**, with a link to its rule card.
5. **Practice blocks**, from easy to hard (difficulty 1 → 2 → 3), **at least 8 exercises**.
6. **The info panel**:
   - `what`: what is this?
   - `why`: why do you need it?
   - `later`: where will you see it again? Mention AI / machine learning when it is honest to do so.

### Visual widgets you can use

See `src/visuals/types.ts`. Build the spec from your generator's parameters; never type numbers into it by hand.

| kind | Good for |
|---|---|
| `balance` | linear equations `ax+b=cx+d` (whole numbers, x-blocks 0..8) |
| `number-line` | negative numbers, adding/subtracting, fractions on a line |
| `fraction-bar` | fractions, equal fractions, adding fractions |
| `area-model` | multiplying by parts, expanding brackets, factorising |
| `plane` | graphs, slope (`slope`), tangent and derivative (`tracer` with `showSlope`), area under a graph (`area`) |
| `right-triangle` | SOS CAS TOA |
| `pythagoras` | Pythagoras |
| `unit-circle` | radians, sin/cos as coordinates |
| `function-machine` | the idea of a function, filling in formulas |
| `custom` | anything else: write your own widget in your unit folder and register it in `widgets` |

Custom widgets must follow the same rules:
- black and white, using only `var(--c-var)`, `var(--c-num)` and `var(--c-hl)` for meaning
- usable with the keyboard
- short animations
- a `describe` text for read-aloud

## Generators

Each generator is a `Generator` (see `types.ts`). For every exercise it gives:

- **`prompt`**: the short question, plus `latex` for the big formula and optionally a `figure` or `visual`.
- **`answer`** (see `src/math/check.ts`). Pick the form the question asks for:
  - `expr` with a `form`: `any` | `integer` | `fraction` | `decimal` (with `decimals`) | `factored` (with `minFactors`) | `expanded`. "Bereken" usually means `any`. "Vereenvoudig" means `fraction`. "Ontbind" means `factored`.
  - `solutions` for the solutions of an equation, in any order. An empty list means "geen oplossing".
  - `relation` for an inequality or an equation as the answer (`x<3`, `y=2x+1`). Add the boundary in `points`.
  - `multi` for several boxes: a system (`x=`, `y=`), coordinates, vector or matrix entries.
  - `choice` for multiple choice. Use it for concepts, logic and proofs.
- **`hints`**:
  - `nudge` must use **this exercise's numbers** ("Links staat $+3$. Hoe krijg je die weg?"). Never a generic sentence.
  - `rule`: the rule text plus `ruleId`, and `mnemonic` / `metaphor` where they fit.
  - `solution`: the worked steps with `\ask{...}` blanks.
- **`mistakes`**: compute the most common wrong answers from the parameters (a sign error, adding the denominators, radians instead of degrees, ...) and explain each in one or two short sentences. Use `relatedSkill` when the mistake belongs to an earlier unit's skill.
- **`verify`**: the independent check, described above.
- **`isNice`**: when the numbers are meant to be tidy (whole, small, no 3-digit denominators).

Difficulty 1 must be truly easy. Difficulty 3 may combine steps.

## Checks before you are done

Run these in the repository (or your worktree):

```bash
npm run typecheck
npm run lint
npx vitest run           # all tests, including 200 exercises per generator per difficulty
```

The content tests check:
- every generator, 200 times per difficulty: independent verification, the official answer accepted, mistakes not accepted, every step valid with the CAS, `\ask` blanks valid, the visual matching the exercise, both languages present, no NaN
- every lesson, example, rule card and visual

Fix every failure; never weaken a test.

### Review round

After building, re-read **every** explanation, example, hint and mistake text as a strict maths teacher would. Look for mistakes, unclear wording, missing steps and long sentences. Report what you changed.
