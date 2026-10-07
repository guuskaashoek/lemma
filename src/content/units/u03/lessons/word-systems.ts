/**
 * Lesson 9: systems in real life. From a story to two equations, then solve.
 */
import Fraction from "fraction.js";
import type { Lesson } from "@/content/types";
import { L } from "../helpers";
import { eliminationSteps, intersectionSteps } from "../gen/solve";
import { meetVisual, shapeSystemVisual } from "../gen/visuals";

const F = (v: number) => new Fraction(v);

export const wordSystemsLesson: Lesson = {
  id: "u3.word-systems",
  title: L("Stelsels in het echt", "Systems in real life"),
  goal: L(
    "Je maakt van een verhaal met twee onbekenden een stelsel en lost het op.",
    "You turn a story with two unknowns into a system and solve it.",
  ),
  minutes: 10,
  calculator: "off",
  calculatorOffReason: L("De rekenmachine staat uit. De getallen zijn klein genoeg.", "The calculator is off. The numbers are small enough."),
  info: {
    what: L(
      "Een verhaal met twee onbekende getallen omzetten in twee vergelijkingen, en die oplossen.",
      "Turning a story with two unknown numbers into two equations, and solving them.",
    ),
    why: L(
      "Zo reken je prijzen terug van bonnetjes, of kies je het goedkoopste abonnement.",
      "This is how you work out prices from receipts, or choose the cheapest plan.",
    ),
    later: L(
      "Een AI-model opstellen begint ook zo: welke getallen zijn onbekend, en welke vergelijkingen heb je?",
      "Setting up an AI model starts the same way: which numbers are unknown, and which equations do you have?",
    ),
  },
  screens: [
    {
      kind: "explain",
      title: L("Stap 1: letters kiezen", "Step 1: choose letters"),
      body: L(
        "Wat weet je niet? Geef elk onbekend getal een letter.\nBijvoorbeeld: $x$ is de prijs van een broodje, $y$ van een koffie.",
        "What don't you know? Give each unknown number a letter.\nFor example: $x$ is the price of a sandwich, $y$ of a coffee.",
      ),
    },
    {
      kind: "explain",
      title: L("Stap 2: zinnen worden vergelijkingen", "Step 2: sentences become equations"),
      body: L(
        "$3$ broodjes en $1$ koffie kosten €$11$: dat wordt $3x+y=11$.\n$1$ broodje en $1$ koffie kosten €$5$: dat wordt $x+y=5$.",
        "$3$ sandwiches and $1$ coffee cost €$11$: that becomes $3x+y=11$.\n$1$ sandwich and $1$ coffee cost €$5$: that becomes $x+y=5$.",
      ),
    },
    {
      kind: "visual",
      title: L("De bonnetjes als vormen", "The receipts as shapes"),
      body: L("Een rondje is een broodje. Een vierkantje is een koffie.", "A circle is a sandwich. A square is a coffee."),
      visual: shapeSystemVisual({ x: 3, y: 1, c: 11 }, { x: 1, y: 1, c: 5 }),
      task: L("Trek de bonnetjes van elkaar af. Wat kost een broodje?", "Subtract the receipts. What does a sandwich cost?"),
    },
    {
      kind: "example",
      title: L("Voorbeeld: twee bonnetjes", "Example: two receipts"),
      problem: L(
        "$3$ broodjes en $1$ koffie kosten €$11$. $1$ broodje en $1$ koffie kosten €$5$. Wat kost een broodje ($x$) en een koffie ($y$)?",
        "$3$ sandwiches and $1$ coffee cost €$11$. $1$ sandwich and $1$ coffee cost €$5$. What does a sandwich ($x$) and a coffee ($y$) cost?",
      ),
      solution: {
        steps: eliminationSteps({ p: F(3), q: F(1), c: F(11) }, { p: F(1), q: F(1), c: F(5) }, 1, 1, "sub", F(3), F(2)),
        solutions: [{ x: 3, y: 2 }],
      },
    },
    {
      kind: "explain",
      title: L("Abonnementen", "Price plans"),
      body: L(
        "Sportschool A: €$50$ inschrijven en €$20$ per maand: $y=20x+50$.\nSportschool B: niets vooraf en €$30$ per maand: $y=30x$.\nWanneer zijn ze even duur? Zet gelijk!",
        "Gym A: €$50$ to sign up and €$20$ a month: $y=20x+50$.\nGym B: nothing up front and €$30$ a month: $y=30x$.\nWhen do they cost the same? Set them equal!",
      ),
    },
    {
      kind: "visual",
      title: L("Wie is goedkoper?", "Which is cheaper?"),
      body: L(
        "$x$ is het aantal maanden, $y$ de kosten.\nEerst is B goedkoper. Later is A goedkoper.",
        "$x$ is the number of months, $y$ the cost.\nAt first B is cheaper. Later A is cheaper.",
      ),
      visual: meetVisual(
        [
          { a: 20, b: 50 },
          { a: 30, b: 0 },
        ],
        0,
      ),
      task: L("Loop langs de maanden. Wanneer kosten ze evenveel?", "Walk along the months. When do they cost the same?"),
    },
    {
      kind: "example",
      title: L("Voorbeeld: even duur", "Example: the same price"),
      problem: L("Wanneer kosten $y=20x+50$ en $y=30x$ evenveel? En hoeveel is dat?", "When do $y=20x+50$ and $y=30x$ cost the same? And how much is that?"),
      solution: {
        steps: intersectionSteps(F(20), F(50), F(30), F(0), "20x+50", "30x", F(5), F(150)),
        solutions: [{ x: 5, y: 150 }],
      },
    },
    {
      kind: "explain",
      title: L("Stap 3: controleer", "Step 3: check"),
      body: L(
        "Klopt je antwoord met het verhaal?\nNa $5$ maanden: A kost $20\\cdot 5+50=150$, B kost $30\\cdot 5=150$. Klopt!\nZie [[rule:u3.word-system]].",
        "Does your answer fit the story?\nAfter $5$ months: A costs $20\\cdot 5+50=150$, B costs $30\\cdot 5=150$. Correct!\nSee [[rule:u3.word-system]].",
      ),
      ruleId: "u3.word-system",
    },
  ],
  practice: [
    { generatorId: "u3.word-system", difficulty: 1, count: 3 },
    { generatorId: "u3.word-system", difficulty: 2, count: 3 },
    { generatorId: "u3.word-system", difficulty: 3, count: 2 },
  ],
};
