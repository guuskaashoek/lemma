# Lemma

**Maths, step by step.** A Duolingo-style maths learning app for laptops, in Dutch and English. It starts at Dutch pre-vocational level (vmbo kader) and builds up to pre-university maths (vwo wiskunde B) and the maths that a university AI bachelor expects.

A *lemma* is a small proven step that you use to prove something bigger. That is the idea of the app: short lessons that build on each other.

> Status: **phase 1**. The platform is done: accounts, onboarding, design system, calculator, lesson player, spaced repetition, statistics and admin. There is one demo lesson. Unit 0 follows in phase 2, then the other units one by one.

## Features

- **Accounts**: email + password (Better Auth). Passwords are hashed and sessions are secure. Login, registration and password reset are rate-limited. Users can delete their account and all of their data.
- **Minimal personal data**: name, email, password hash and learning progress. Nothing else.
- **Onboarding**: language, starting level, goal, dyslexia-friendly font, text size, theme and read-aloud. All of these can be changed later.
- **Roadmap**: units 0 to 12, each with lessons and a final test. A score of at least 80% on the final test unlocks the next unit. The optional "test out" lets you skip a unit with at least 90%.
- **Lesson player**:
  - one idea per screen
  - worked examples revealed step by step
  - practice from easy to hard
  - three hint layers: nudge, rule, full solution
  - targeted feedback on typical mistakes
  - an info panel per topic
  - full keyboard control
- **Answer checking with a CAS**: `1/2`, `0.5`, `0,5` and `2/4` are all equal. The checker can also demand a form when the question asks for one, such as factored, simplified fraction or rounded to *n* decimals.
- **Read-aloud**: uses the Web Speech API. Formulas are read as spoken maths, e.g. "x kwadraat plus 2 x".
- **Fixed recognition points**:
  - three formula colours (variable, number, what changes) plus a legend
  - fixed metaphors (balance, machine, slope)
  - school mnemonics (SOS CAS TOA, Hoe Moeten Wij Van De Onvoldoendes Afkomen)
  - fixed icons
  - rule cards
- **Scientific calculator**:
  - degrees/radians, history, and an explanation plus mini example for every button
  - switched off (and labelled as such) where you should work by hand
- **Spaced repetition**: FSRS (`ts-fsrs`), per skill, based on mistakes, hint use and time since the last practice.
- **Statistics**: time practised, XP, streak, strong and weak topics, hint use.
- **Admin**: user overview, usage statistics, one-time reset links, roles.
- **Design**: black and white, editorial, dark by default with a light option. Colour is only used where it has meaning. Animations respect `prefers-reduced-motion`.

## Tech stack

| | |
|---|---|
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS 4 |
| Database | SQLite via better-sqlite3 + Drizzle ORM (with migrations) |
| Auth | Better Auth (email/password, admin plugin, rate limiting) |
| Validation | Zod |
| Maths | KaTeX (rendering), MathLive (input), Compute Engine (CAS), fraction.js (exact arithmetic) |
| Spaced repetition | ts-fsrs |
| Tests | Vitest |

## Getting started

Requirements: **Node.js 20 or newer** (developed on Node 24).

```bash
git clone https://github.com/guuskaashoek/lemma.git
cd lemma
npm install            # also copies MathLive's fonts into /public
cp .env.example .env   # then edit .env (see below)
npm run dev            # http://localhost:3000
```

The database file is created and migrated automatically on first use.

**Become admin**: register in the app, then run `npm run make-admin -- you@example.com` on the server and log in again. Admin rights are never granted through registration, because email addresses are not verified.

### Environment variables

| Variable | Meaning |
|---|---|
| `BETTER_AUTH_SECRET` | Long random string for signing sessions. Generate one with `openssl rand -base64 32`. |
| `BETTER_AUTH_URL` | Public URL of the app, e.g. `http://localhost:3000` or `https://lemma.example.nl`. |
| `DATABASE_PATH` | Path to the SQLite file. Default: `./data/lemma.db`. |

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build / server |
| `npm test` | All tests (maths core, content, calculator, progress rules) |
| `npm run typecheck` / `npm run lint` | TypeScript and ESLint |
| `npm run db:generate` | Create a new migration after changing `src/db/schema.ts` |
| `npm run db:migrate` | Apply migrations by hand (the app also does this on start) |
| `npm run make-admin -- you@example.com` | Give an existing user the admin role |
| `npm run reset-link -- you@example.com` | Create a password-reset link from the command line |

## Self-hosting (e.g. on a Mac mini)

Lemma is a single Node.js process with one SQLite file. No other services are needed.

1. **Install and build**

   ```bash
   git clone https://github.com/guuskaashoek/lemma.git ~/lemma
   cd ~/lemma
   npm ci
   cp .env.example .env    # set BETTER_AUTH_SECRET and BETTER_AUTH_URL
   npm run build
   npm start               # listens on port 3000 (use `npm start -- -p 8080` for another port)
   ```

2. **Keep it running with launchd.** Save the following as `~/Library/LaunchAgents/nl.lemma.app.plist`. Replace `YOU` with your macOS user name, and check the path to `npm` with `which npm`.

   ```xml
   <?xml version="1.0" encoding="UTF-8"?>
   <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
   <plist version="1.0">
   <dict>
     <key>Label</key><string>nl.lemma.app</string>
     <key>WorkingDirectory</key><string>/Users/YOU/lemma</string>
     <key>ProgramArguments</key>
     <array><string>/opt/homebrew/bin/npm</string><string>start</string></array>
     <key>EnvironmentVariables</key>
     <dict><key>PATH</key><string>/opt/homebrew/bin:/usr/bin:/bin</string></dict>
     <key>RunAtLoad</key><true/>
     <key>KeepAlive</key><true/>
     <key>StandardOutPath</key><string>/Users/YOU/lemma/data/lemma.log</string>
     <key>StandardErrorPath</key><string>/Users/YOU/lemma/data/lemma.log</string>
   </dict>
   </plist>
   ```

   ```bash
   launchctl load ~/Library/LaunchAgents/nl.lemma.app.plist
   ```

3. **HTTPS / outside access (optional).** Put a reverse proxy in front, such as Caddy (`caddy reverse-proxy --from lemma.example.nl --to localhost:3000`), or use a Cloudflare Tunnel or Tailscale. Set `BETTER_AUTH_URL` to the public URL. The proxy should pass `X-Forwarded-For`, so rate limiting sees the real client IP.

4. **Updating**

   ```bash
   cd ~/lemma && git pull && npm ci && npm run build
   launchctl kickstart -k gui/$(id -u)/nl.lemma.app
   ```

   Database migrations run automatically on start.

5. **Backups.** Everything is in `data/lemma.db`. Make a consistent copy while the app runs with:

   ```bash
   sqlite3 data/lemma.db ".backup 'backup/lemma-$(date +%F).db'"
   ```

### Password reset (no email)

Lemma sends no email. If someone forgets their password:

1. An admin opens **Admin → Users → Create reset link** and gives the link to the person. The link works once, for 24 hours. Only a hash of it is stored.
2. The person opens the link and chooses a new password. All of their sessions are signed out.

If the only admin is locked out, run `npm run reset-link -- admin@example.com` on the server.

## How the maths is kept correct

The content has to be 100% right. That is guaranteed in layers, all enforced by `npm test`:

1. **Generators, not fixed exercises.** Every exercise type is a generator with random parameters (seeded, so every failure can be reproduced). The answer is always computed by code, with exact fractions (`fraction.js`) instead of floating point.
2. **Independent verification.** Every generator has a `verify()` that checks the answer *by a different route* than the one that produced it, so re-running the same code path proves nothing. Examples:
   - substitute the solution back into the equation;
   - expand a factorisation and compare it with the CAS;
   - for trigonometry, compute the angle back with inverse functions on the calculator engine.
3. **200 exercises per generator per difficulty.** `tests/content/generators.test.ts` checks for each exercise that:
   - it verifies independently;
   - our own answer checker accepts the official answer;
   - no "typical mistake" answer is accepted as correct;
   - there is no NaN, Infinity or division by zero;
   - numbers stay nice where intended;
   - every formula renders;
   - every text exists in both Dutch and English.
4. **Every worked step is checked with the CAS** (`src/math/steps.ts`).
   - Expression steps must be equivalent to the previous step.
   - Equation and inequality steps must have the same truth value at the known solutions and at random points. A step that loses or invents a solution is caught that way.
   - Rounding steps (`≈`) are checked against the correct rounding.

   This covers lesson examples, rule-card examples and every hint-3 solution.
5. **Answer checking is mathematical.** `src/math/check.ts` combines CAS equivalence (symbolic, plus numeric evaluation at random points that skips points outside the domain) with explicit form checks per exercise.
6. **The tests are tested.** Deliberately breaking a generator, for example a wrong answer or a wrong step, makes the suite fail.
7. **Review round after every unit.** All explanations, examples and hints are re-read for errors and unclear wording, and the changes are reported.

## Project structure

```
src/
  app/                 routes (App Router)
    (auth)/            login, register, reset link
    (app)/             roadmap, rule cards, statistics, settings, admin
    (focus)/           lesson, unit test, review (distraction-free)
    actions/           server actions (all input validated with Zod)
  components/          lesson player, exercise card, calculator, ...
  content/             curriculum, lessons, generators, rule cards, metaphors, mnemonics
  calculator/          calculator engine + button explanations
  math/                CAS wrapper, answer checking, step validation, speech, colouring
  i18n/                Dutch/English texts
  lib/                 auth, session (data access layer), progress, rate limiting
  db/                  Drizzle schema and connection
drizzle/               SQL migrations
tests/                 Vitest tests
scripts/               admin and maintenance scripts
```

### Adding content

- **Lesson**: add it to a unit in `src/content/units/`. Every text is `{ nl, en }`. Inline formulas go between `$...$`. Mark the part that changes in a step with `\hl{...}`. Link a rule card with `[[rule:id]]`.
- **Generator**: implement `generate()` and an independent `verify()` in `src/content/generators/`, register it in `generators/index.ts`, and add a skill in `curriculum.ts`. The content tests pick it up automatically.
- **Rule card**: add it to `src/content/rules.ts`. Its example is validated by the tests.

