export const meta = {
  name: 'build-units',
  description: 'Build the given Lemma units in parallel worktrees, each followed by a strict maths/pedagogy review',
  whenToUse: 'Pass the unit numbers to build as args, e.g. [7, 8, 9]. See docs/NEXT_RUN.md first.',
  phases: [
    { title: 'Build', detail: 'one agent per unit, in its own git worktree' },
    { title: 'Review', detail: 'strict maths and didactics review per unit, fixes committed on the unit branch' },
  ],
}

// Usage (from Claude Code): Workflow({ scriptPath: "docs/workflows/build-units.js", args: [7, 8, 9, 10, 11, 12] })
// Read docs/NEXT_RUN.md first: platform fixes and the merge procedure are listed there.
const REPO = '/Users/guuskaashoek/guuslab/Wiskunde'

const UNITS = [
  { n: 0, title: 'Opfrissen (vmbo kader level refresher)', topics: 'hoofdrekenen en rekenvolgorde; breuken; decimalen; procenten; verhoudingen; eenheden omrekenen; formules invullen; grafieken en tabellen lezen; omtrek, oppervlakte en inhoud; Pythagoras; sin/cos/tan in een rechthoekige driehoek met SOS CAS TOA', existing: 'u00 already has a lesson "u0.order-of-operations" and generators: orderOfOperations (registered), addFractions in generators.ts and sohCahToaSide in trig.ts (both written and tested before, but NOT yet registered in the bundle). Rule cards u0.order-of-operations, u0.add-fractions, u0.sos-cas-toa exist in rules.ts. Rework and extend all of this into the full unit; keep ids that already exist. There are 11 topics: combine related ones so the unit has at most 10 lessons.' },
  { n: 1, title: 'Fundament', topics: 'negatieve getallen; machten; wortels; wetenschappelijke notatie; rekenregels voor machten', existing: 'u01 only has a planned stub index.ts.' },
  { n: 2, title: 'Algebra', topics: 'variabelen; haakjes wegwerken (with the area-model widget); vergelijkingen oplossen; ongelijkheden (use the relation answer kind; flipping the sign when multiplying/dividing by a negative number); formules omwerken (relation answers / equations with two variables)', existing: 'u02 already contains the REFERENCE lesson "u2.balance" (equations with the balance) and generator u2.linear-equation. Keep that lesson and generator (you may add generators/difficulties, e.g. negative numbers in a later lesson), build the other lessons around it in a logical order.' },
  { n: 3, title: 'Lineaire functies', topics: 'grafieken van lineaire functies; richtingscoëfficiënt (slope triangle in the plane widget); snijpunten met de assen en van twee lijnen; stelsels vergelijkingen (multi answer x= and y=)', existing: 'u03 only has a planned stub.' },
  { n: 4, title: 'Kwadratische functies', topics: 'buiten haakjes halen en ontbinden in factoren (area-model); product-som methode; abc-formule; parabolen (top, symmetrie, plane widget); discriminant (aantal oplossingen)', existing: 'u04 has a planned stub index.ts plus generators.ts with a tested commonFactor generator (id u4.common-factor, not registered yet) and rules.ts with rule card u4.common-factor (not registered yet). Use and register them.' },
  { n: 5, title: 'Machten, exponentiele functies en logaritmen', topics: 'machten met negatieve en gebroken exponenten; exponentiële groei en verval (groeifactor, plane widget); logaritmen (betekenis van log, grondtal); rekenregels voor log; exponentiële vergelijkingen oplossen met log', existing: 'u05 only has a planned stub.' },
  { n: 6, title: 'Goniometrie', topics: 'eenheidscirkel (unit-circle widget); radialen; sinusregel en cosinusregel; grafieken van sinus en cosinus (periode, amplitude, plane widget); goniometrische vergelijkingen', existing: 'u06 only has a planned stub.' },
  { n: 7, title: 'Differentieren', topics: 'het idee van een limiet; de afgeleide als helling op één punt (slope metaphor, plane tracer with showSlope); somregel en machtsregel; productregel; quotiëntregel; kettingregel; extremen (toppen) en raaklijnen', existing: 'u07 only has a planned stub. Verify derivatives independently with a numerical difference quotient or CAS differentiation of the original function.' },
  { n: 8, title: 'Integreren', topics: 'primitieven (primitiveren); oppervlakte onder een grafiek (plane widget with area, Riemann idea); bepaalde integraal; substitutie; partieel integreren', existing: 'u08 only has a planned stub. Verify antiderivatives independently by differentiating (numerically or with the CAS) and definite integrals numerically.' },
  { n: 9, title: 'Vectoren en lineaire algebra', topics: 'vectoren (pijlen, optellen, schalen; build a custom vector widget in your folder); inproduct en hoek; matrices; matrixvermenigvuldiging; stelsels als matrices; determinant; eigenwaarden (basis, 2x2)', existing: 'u09 only has a planned stub. Use the multi answer kind for vector and matrix entries.' },
  { n: 10, title: 'Kansrekening en statistiek', topics: 'kansregels (som- en productregel, kansboom; build a custom tree widget in your folder if useful); voorwaardelijke kans; Bayes; kansverdelingen; verwachtingswaarde en variantie; normale verdeling', existing: 'u10 only has a planned stub.' },
  { n: 11, title: 'Logica, verzamelingen en bewijzen', topics: 'verzamelingen (doorsnede, vereniging); propositielogica (waarheidstabellen); kwantoren; bewijs uit het ongerijmde; volledige inductie', existing: 'u11 only has a planned stub. Use choice answers where an expression answer does not fit; truth tables can be checked by code.' },
  { n: 12, title: 'WO-brug: wiskunde voor AI', topics: 'functies van meerdere variabelen; partiële afgeleiden; gradiënt; optimalisatie; gradient descent en hoe dit samenkomt in machine learning (a custom widget showing gradient descent steps on a curve or contour is welcome)', existing: 'u12 only has a planned stub. Verify partial derivatives and gradients numerically.' },
]

const PREV = (n) => UNITS.filter((u) => u.n < n).map((u) => `Unit ${u.n} (${u.title}): ${u.topics}`).join('\n')

const BUILD_SCHEMA = {
  type: 'object',
  properties: {
    branch: { type: 'string', description: 'git branch name of your worktree (git rev-parse --abbrev-ref HEAD)' },
    worktreePath: { type: 'string', description: 'absolute path of your worktree (pwd)' },
    commit: { type: 'string', description: 'final commit hash on the branch' },
    lessons: { type: 'array', items: { type: 'string' }, description: 'lesson ids with Dutch titles' },
    generators: { type: 'array', items: { type: 'string' } },
    checksPassed: { type: 'boolean', description: 'typecheck, lint and the full vitest suite all pass' },
    sharedChangeRequests: { type: 'array', items: { type: 'string' }, description: 'changes you needed in shared files but did not make' },
    notes: { type: 'string' },
  },
  required: ['branch', 'worktreePath', 'commit', 'lessons', 'generators', 'checksPassed', 'sharedChangeRequests', 'notes'],
}

const REVIEW_SCHEMA = {
  type: 'object',
  properties: {
    branch: { type: 'string' },
    commit: { type: 'string' },
    changes: { type: 'array', items: { type: 'string' }, description: 'every concrete fix you made (maths errors, unclear text, missing steps, ...), one short line each' },
    remainingConcerns: { type: 'array', items: { type: 'string' } },
    checksPassed: { type: 'boolean' },
  },
  required: ['branch', 'commit', 'changes', 'remainingConcerns', 'checksPassed'],
}

function buildPrompt(u) {
  const id = String(u.n).padStart(2, '0')
  return `You are building Unit ${u.n} ("${u.title}") of Lemma, a Dutch/English Duolingo-style maths learning app (Next.js 16, TypeScript). You work in your own git worktree of the repository (your current working directory); other units are built in parallel in other worktrees, so stay strictly inside your own folder.

BEFORE ANYTHING: make sure your branch contains the latest local main: run `git merge --no-edit main` in your worktree (your worktree may have been created from an older commit). If node_modules is missing, symlink it: ln -s ${REPO}/node_modules node_modules. Run `npx next typegen` once before the first typecheck.

FIRST read, completely: docs/CONTENT_GUIDE.md (the rules you must follow). Then study the reference implementation src/content/units/u02/ (lessons.ts, generators.ts, rules.ts, index.ts), plus src/content/units/u00/, src/content/types.ts, src/visuals/types.ts (and the widgets in src/visuals/widgets/ to see what they draw), src/math/check.ts (answer kinds and forms), src/math/steps.ts, tests/content/*.test.ts and tests/helpers/content.ts.

YOUR UNIT: folder src/content/units/u${id}/, id prefix "u${u.n}.".
Topics (Dutch school terms): ${u.topics}.
Current state: ${u.existing}
Earlier units the learner has done (do not re-teach them at length; when an exercise relies on them, use mistakes[].relatedSkill / rule-card links so the app can point back):
${PREV(u.n) || '(none: this is the first unit)'}

WHAT TO BUILD (all inside src/content/units/u${id}/, split into several files, e.g. one file per lesson and per generator group):
- 5 to 10 lessons, each 5-10 minutes, in a logical order with no gaps for a learner with dyslexia who left vmbo kader years ago. Every lesson: info panel (what / why / later, mention AI where honest), short explain screens (one idea each, short sentences), at least one interactive visual screen with a task BEFORE the rule whenever the topic can be pictured, worked examples (steps with \\hl and \\ask, a visual where helpful), a rule-card link, practice blocks easy to hard with at least 8 exercises, the correct calculator policy (off with a reason when the topic is done by hand).
- Generators for every exercise type: random parameters, answers computed by code (fraction.js / CAS), an INDEPENDENT verify(), isNice where numbers should be tidy, hint 1 using the exercise's own numbers, hint 2 with rule card (+ mnemonic/metaphor), hint 3 worked steps with exactly the blanks a learner should fill (\\ask), computed typical mistakes with short targeted explanations, a visual spec built from the parameters when a widget fits.
- Skills (one per practised thing), rule cards (short fixed names, a checked example, lessonId), finalTest (~10 mixed questions) and testOut (~10 hardest questions), status "available".
- Optional custom widgets (React, "use client") in your folder, registered in bundle.widgets with keys prefixed "u${u.n}.", following the design rules (black/white, only var(--c-var)/var(--c-num)/var(--c-hl) for meaning, keyboard usable, short animations).
- Extra tests for your own pure helpers may go in tests/units/u${id}*.test.ts. The shared content tests already cover all generators, lessons, rules and visuals.

NEVER edit shared files (src/content/types.ts, curriculum.ts, rules.ts, metaphors.ts, mnemonics.ts, src/visuals/**, src/components/**, src/math/**, src/i18n/**, src/lib/**, src/app/**, tests/helpers/**, tests/content/**, other units). If you need something shared, work around it and list it in sharedChangeRequests. Never weaken or skip a test.

CHECKS (run often while working, and all must pass at the end):
  npm run typecheck && npm run lint && npx vitest run
(npm install has already been run in the main repo; if node_modules is missing in your worktree, run "npm install --ignore-scripts" once, or symlink: ln -s ${REPO}/node_modules node_modules.)
Useful while iterating: npx vitest run tests/content -t "u${u.n}\\." . You can print sample exercises with a small throwaway tsx script (delete it afterwards) to read them like a learner.

SELF-REVIEW before finishing: read every Dutch and English text once more as a strict maths teacher and as a dyslexic learner; fix maths errors, vague wording, long sentences, generic hints, missing steps.

FINISH: git add -A && git commit -m "Unit ${u.n}: <short summary>" with this exact last line in the message: "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>". Do not push, do not merge, do not switch branches. Return the structured result (branch from git rev-parse --abbrev-ref HEAD, worktreePath from pwd, commit hash).`
}

function reviewPrompt(u, built) {
  const id = String(u.n).padStart(2, '0')
  return `You are a strict reviewer for Unit ${u.n} ("${u.title}") of Lemma, a Dutch/English maths learning app for a 19-year-old with dyslexia who left vmbo kader years ago and wants to reach vwo wiskunde B and university AI maths. The content must be 100% mathematically correct.

The unit was built on git branch "${built.branch}" in worktree "${built.worktreePath}". Work in that worktree (cd into it). If that path no longer exists, create a worktree for the branch yourself: git -C ${REPO} worktree add ${REPO}/.claude/review-u${id} ${built.branch} and work there.

Read docs/CONTENT_GUIDE.md first. Then review EVERYTHING in src/content/units/u${id}/:
1. Mathematics: work through every worked example and rule-card example by hand. Generate and read at least 5 exercises per generator per difficulty (throwaway tsx script, delete afterwards) and solve them yourself: are prompt, answer, form, hints, steps and mistake explanations all correct? Is each verify() truly independent of the generation code path? Are answer forms right (e.g. "vereenvoudig" -> fraction, "ontbind" -> factored)? Could any parameter combination give a degenerate or ugly exercise?
2. Didactics: no gaps between lessons; one idea per screen; short sentences; correct Dutch school terms (and natural English); hint 1 uses the exercise's numbers; visuals before rules where the topic can be pictured; the fixed metaphors (balance / machine / slope) and mnemonics used consistently; calculator policy and reasons sensible; final test and test-out cover the unit at the right level.
3. Robustness: ids prefixed "u${u.n}.", nothing outside the unit folder (and tests/units) changed (check: git -C <worktree> diff --stat main...HEAD).

FIX every problem you find directly in the unit folder (never weaken tests, never edit shared files). Then run: npm run typecheck && npm run lint && npx vitest run  (all must pass). Commit with message "Unit ${u.n}: review fixes" ending with the line "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>". Do not push or merge.

Return every concrete change as one short line each (these are reported to the user), plus remaining concerns.`
}

const wanted = Array.isArray(args) && args.length ? args : [7, 8, 9, 10, 11, 12]
const todo = UNITS.filter((u) => wanted.includes(u.n))
log(`Building units: ${todo.map((u) => u.n).join(', ')}`)

phase('Build')
const results = await pipeline(
  todo,
  (u) => agent(buildPrompt(u), { label: `build u${u.n}`, phase: 'Build', isolation: 'worktree', schema: BUILD_SCHEMA }),
  (built, u) => (built ? agent(reviewPrompt(u, built), { label: `review u${u.n}`, phase: 'Review', schema: REVIEW_SCHEMA }).then((review) => ({ unit: u.n, built, review })) : { unit: u.n, built: null, review: null }),
)

return { units: results.filter(Boolean) }
