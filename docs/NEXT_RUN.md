# Next content run

What is built, what is left, and how to run the next batch of units.

## Status

| Unit | Topic | Status |
|---|---|---|
| 0 | Opfrissen | ✅ Built, reviewed and merged into `main` (10 lessons, 23 generators, 12 unit widgets) |
| 1 | Fundament | ⏸ Built and committed in worktree `-4` (9 lessons); review not done |
| 2 | Algebra | ⏸ Half built, uncommitted, in worktree `-5` (6 lessons, incl. the reference lesson `u2.balance`) |
| 3 | Lineaire functies | ⏸ Built and committed in worktree `-6` (9 lessons); review not done |
| 4 | Kwadratische functies | ⏸ Half built, uncommitted, in worktree `-7` (5 lessons) |
| 5 | Exponentiële functies en logaritmen | ⏸ Half built, uncommitted, in worktree `-8` (4 lessons, needs at least 5) |
| 6 | Goniometrie | ⏸ Half built, uncommitted, in worktree `-9` (8 lessons) |
| 7 | Differentiëren | ⏳ To do |
| 8 | Integreren | ⏳ To do |
| 9 | Vectoren en lineaire algebra | ⏳ To do |
| 10 | Kansrekening en statistiek | ⏳ To do |
| 11 | Logica, verzamelingen en bewijzen | ⏳ To do |
| 12 | WO-brug: wiskunde voor AI | ⏳ To do |

Units 1–6 were paused on 2026-10-07 because the machine was overloaded (about 50 Node processes). Their work is kept:
- in the worktrees `.claude/worktrees/wf_ae42accd-91f-4` … `-9` (units 1 … 6, in that order);
- in a backup copy of `src/`, `tests/` and `scratch/` per worktree (made in the session scratchpad).

Continue them **first**, before units 7–12 (see *Continuing paused units*).

## Before the next run: platform fixes

These came up while building units 0–6. Units 7–12 depend on several of them, so fix them first, in the main repo (not in a unit folder), with tests:

1. **Always-visible exercise visual.** Today `Exercise.visual` only shows with hint 1, and `Figure` only knows `right-triangle`. Graph, table and vector questions need a picture in the question itself. Add a field such as `Exercise.questionVisual` and render it under the prompt.
2. **Tables in LaTeX.** `colorize` (`src/math/markup.ts`) wraps the letters inside `\begin{array}` / `\end{array}`, which breaks KaTeX. Skip environment names (and `\begin{...}` arguments) in `colorize`, then add a test.
3. **Slow step checker.** `pointsOnEquation` in `src/math/steps.ts` scans `[-20, 20]` and is very slow for equations with no root in that range, e.g. `tan(A°)=5/8 → A°=tan⁻¹(5/8)`; those tests hit the 60 s timeout.
   - Cap the work per step.
   - Scan a range that fits the equation.
   - Stop early once enough points are found.
4. **Degree-aware inverse trig and rounding.** An `approx` step needs a single-letter `x = …` step before it, so `A^{\circ}=\tan^{-1}(…) \approx 32.0` cannot be checked. Support `\sin^{-1}`/`\arcsin` in degrees, and allow `approx` after any `lhs = expr` step.
5. **The triangle figure always draws the angle arc.** Hide it when `angleLabel` is missing, e.g. for Pythagoras.
6. **Import cycle for unit widgets.**
   - The problem: `src/components/math.tsx` imports `@/content/rules`, which reads `BUNDLES` while a unit bundle is still loading. Unit widgets therefore cannot use `Formula`/`localizeDecimals`, and unit 0 copied them into `u00/widgets/kit.tsx`.
   - The fix: move `Formula`, `renderLatex` and `localizeDecimals` into a module without the rules import, and keep `Inline`/`RichText` (which need rule names) where they are.
7. **Shared widget UI texts.** Unit widgets write button texts ("next step", "show me", "start over") as inline `Loc` objects. Make the shared `messages` keys usable from unit widgets, or document that inline `Loc` is the convention.
8. Add the shared-change requests reported by the units 1–6 run here once it finishes, and fix them before units 7–12. Calculus (unit 7–8), vectors (9) and probability (10) are likely to need:
   - plotting derivatives
   - area between `a` and `b`
   - vector arrows
   - probability trees

## Keep the machine calm

The second run overloaded an 8-core Mac. Six agents each ran full `vitest` suites, some for over 30 minutes, and some fanned out 7 parallel `tsx` scripts. Stopped workflows also left orphaned `vitest` workers running. Next time:

- **Run at most 2 units at the same time.** Pass 2 unit numbers per run (`args: [7, 8]`), or lower the concurrency in the script.
- **Fix the slow step checker first** (platform fix 3). It is the most likely reason a test run hangs for half an hour.
- Tell agents to run the full suite only at the end, to use `-t "uN\."` while iterating, and to never start several test or `tsx` processes in parallel.
- After stopping a workflow, check for leftovers with `ps -Ao pid,command | grep guuslab/Wiskunde` and kill them.

## Continuing paused units

For each unit 1–6, run one agent (no new worktree) that `cd`s into its existing worktree, inspects what is there, completes the unit and commits. Then run one review agent on that branch. Do 2 units at a time. The continuation prompt used for this is in `docs/workflows/build-units.js` (`buildPrompt`). Prefix it with: *"An earlier agent started this task and was stopped halfway. Work in `<worktree path>`; keep what is good and complete the rest."*

## How to run units 7–12

The workflow script lives in the repo: [`docs/workflows/build-units.js`](workflows/build-units.js).

1. Make sure local `main` is clean and has everything: `git status` should be empty, and the platform fixes above should be committed.
2. From Claude Code, run it with the units you want:
   ```
   Workflow({ scriptPath: "docs/workflows/build-units.js", args: [7, 8, 9, 10, 11, 12] })
   ```
   It builds each unit in its own git worktree, then runs a strict review agent on that branch.
   - Without arguments it would build all six at once. Don't: run 2 at a time (see *Keep the machine calm*).
   - Expect a few hours per pair of units.
3. To build only some units, pass fewer numbers, e.g. `args: [7, 8]`.

### Things learned from the first run

- **Worktree base.** A worktree may be created from `origin/main` instead of local `main`. Unit 0's worktree was. The build prompt therefore makes each agent run `git merge --no-edit main` first.
- **`node_modules`.** Worktrees have no `node_modules`. Agents symlink the main repo's copy and run `npx next typegen` before the first typecheck.
- **Lint.** `eslint.config.mjs` ignores `.claude/**`, so worktrees do not break lint in the main repo.
- **Stopping halfway.** If a run is stopped, the uncommitted work stays in `.claude/worktrees/wf_<run>-<n>/`. Continue it with a script that tells the agent to `cd` into that worktree and finish (see the run for units 1–6). Back up the folders before stopping.

## After a run

For each finished unit branch:

1. Merge it into `main`, one unit at a time: `git merge --no-ff <branch>`. The folders do not overlap, so conflicts should be rare.
2. Run the full checks:
   ```bash
   npx next typegen && npm run typecheck && npm run lint && npm test && npm run build
   ```
3. Smoke-test in a browser: open every new lesson, use each visual, answer one exercise right and one wrong, use the three hints and "Samen oplossen", and take the final test.
4. Report the review agents' change lists (the spec requires reporting what each review round changed).
5. Clean up: `git worktree remove <path>` for each worktree, then `git branch -d <branch>`.
6. **Push only after checking with Guus.** A push to `main` triggers `.github/workflows/deploy.yml`, which builds the Docker image and deploys to GuusLab Jet.

## Unit briefs for 7–12

The full briefs are in `UNITS` in [`docs/workflows/build-units.js`](workflows/build-units.js). In short:

- **7 Differentiëren**
  - Topics: limiet; de afgeleide as the slope at one point (`slope` metaphor, plane tracer with `showSlope`); som- en machtsregel; productregel; quotiëntregel; kettingregel; extremen en raaklijnen.
  - Verification: check derivatives independently with a difference quotient.
- **8 Integreren**
  - Topics: primitiveren; oppervlakte onder een grafiek (plane `area`, Riemann idea); bepaalde integraal; substitutie; partieel integreren.
  - Verification: differentiate the antiderivative back, and check definite integrals numerically.
- **9 Vectoren en lineaire algebra**
  - Topics: vectoren (a custom arrow widget); inproduct en hoek; matrices; matrixvermenigvuldiging; stelsels als matrices; determinant; eigenwaarden (2×2).
  - Answers: use `multi` answers for entries.
- **10 Kansrekening en statistiek**
  - Topics: kansregels and the kansboom (a custom tree widget); voorwaardelijke kans; Bayes; kansverdelingen; verwachtingswaarde en variantie; normale verdeling.
- **11 Logica, verzamelingen en bewijzen**
  - Topics: verzamelingen; waarheidstabellen; kwantoren; bewijs uit het ongerijmde; volledige inductie.
  - Answers: use `choice` where an expression does not fit.
- **12 WO-brug**
  - Topics: functies van meerdere variabelen; partiële afgeleiden; gradiënt; optimalisatie; gradient descent in machine learning (a custom widget showing descent steps is welcome).
  - Verification: check gradients numerically.
