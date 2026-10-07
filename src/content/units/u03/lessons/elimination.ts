/**
 * Lesson 7: systems of equations by adding or subtracting (eliminatie),
 * first with shapes: a circle is x, a square is y.
 */
import Fraction from "fraction.js";
import type { Lesson } from "@/content/types";
import { L } from "../helpers";
import { eliminationSteps } from "../gen/solve";
import { shapeSystemVisual } from "../gen/visuals";

const F = (v: number) => new Fraction(v);
const row = (p: number, q: number, c: number) => ({ p: F(p), q: F(q), c: F(c) });

export const eliminationLesson: Lesson = {
  id: "u3.elimination",
  title: L("Stelsels: optellen of aftrekken", "Systems: adding or subtracting"),
  goal: L(
    "Je lost een stelsel van twee vergelijkingen op door ze op te tellen of af te trekken.",
    "You solve a system of two equations by adding or subtracting them.",
  ),
  minutes: 10,
  calculator: "off",
  calculatorOffReason: L("De rekenmachine staat uit. Hier leer je de methode.", "The calculator is off. Here you learn the method."),
  info: {
    what: L(
      "Een stelsel is twee vergelijkingen met twee letters. Je zoekt de $x$ en $y$ die allebei kloppen.",
      "A system is two equations with two letters. You look for the $x$ and $y$ that make both true.",
    ),
    why: L(
      "Twee onbekende prijzen en twee bonnetjes: zo reken je ze allebei uit.",
      "Two unknown prices and two receipts: this is how you work out both.",
    ),
    later: L(
      "Computers lossen stelsels op met duizenden letters tegelijk, met matrices. Dat gebeurt in elk AI-model.",
      "Computers solve systems with thousands of letters at once, using matrices. That happens inside every AI model.",
    ),
  },
  screens: [
    {
      kind: "explain",
      title: L("Twee vergelijkingen, twee letters", "Two equations, two letters"),
      body: L(
        "$2x+y=11$ en $x+y=7$.\nMet één vergelijking kom je er niet: er zijn twee onbekenden.\nSamen heten ze een **stelsel**.",
        "$2x+y=11$ and $x+y=7$.\nOne equation is not enough: there are two unknowns.\nTogether they are called a **system**.",
      ),
    },
    {
      kind: "visual",
      title: L("Vormen in plaats van letters", "Shapes instead of letters"),
      body: L(
        "Een rondje is $x$. Een vierkantje is $y$.\nRij I: twee rondjes en een vierkantje zijn samen $11$.\nRij II: een rondje en een vierkantje zijn samen $7$.",
        "A circle is $x$. A square is $y$.\nRow I: two circles and a square make $11$ together.\nRow II: a circle and a square make $7$ together.",
      ),
      visual: shapeSystemVisual({ x: 2, y: 1, c: 11 }, { x: 1, y: 1, c: 7 }),
      task: L("Kies I − II. Wat blijft er over?", "Choose I − II. What is left?"),
    },
    {
      kind: "explain",
      title: L("Wegstrepen", "Crossing out"),
      body: L(
        "Trek je rij II van rij I af? Dan valt het vierkantje weg.\nEr blijft over: één rondje is $11-7=4$.\nDus $x=4$.",
        "Subtract row II from row I? Then the square drops out.\nWhat is left: one circle is $11-7=4$.\nSo $x=4$.",
      ),
    },
    {
      kind: "explain",
      title: L("Terug invullen", "Put it back"),
      body: L(
        "Nu weet je $x=4$.\nZet dat in rij II: $4+y=7$. Dus $y=3$.\nControle in rij I: $2\\cdot 4+3=11$. Klopt!",
        "Now you know $x=4$.\nPut it into row II: $4+y=7$. So $y=3$.\nCheck in row I: $2\\cdot 4+3=11$. Correct!",
      ),
    },
    {
      kind: "example",
      title: L("Voorbeeld: aftrekken", "Example: subtracting"),
      problem: L("Los op: $2x+y=11$ en $x+y=7$.", "Solve: $2x+y=11$ and $x+y=7$."),
      visual: shapeSystemVisual({ x: 2, y: 1, c: 11 }, { x: 1, y: 1, c: 7 }),
      solution: { steps: eliminationSteps(row(2, 1, 11), row(1, 1, 7), 1, 1, "sub", F(4), F(3)), solutions: [{ x: 4, y: 3 }] },
    },
    {
      kind: "visual",
      title: L("Plus en min", "Plus and minus"),
      body: L(
        "Een open vierkantje met een streepje is $-y$.\nRij I heeft $+y$, rij II heeft $-y$.",
        "An open square with a dash is $-y$.\nRow I has $+y$, row II has $-y$.",
      ),
      visual: shapeSystemVisual({ x: 1, y: 1, c: 10 }, { x: 1, y: -1, c: 2 }),
      task: L("Probeer I − II en I + II. Bij welke valt $y$ weg?", "Try I − II and I + II. Which one makes $y$ drop out?"),
    },
    {
      kind: "example",
      title: L("Voorbeeld: optellen", "Example: adding"),
      problem: L("Los op: $x+y=10$ en $x-y=2$.", "Solve: $x+y=10$ and $x-y=2$."),
      solution: { steps: eliminationSteps(row(1, 1, 10), row(1, -1, 2), 1, 1, "add", F(6), F(4)), solutions: [{ x: 6, y: 4 }] },
    },
    {
      kind: "visual",
      title: L("Eerst vermenigvuldigen", "Multiply first"),
      body: L(
        "$x+y=5$ en $2x+3y=12$.\nIn II staan drie vierkantjes, in I maar één.\nMaak van rij I eerst drie keer zoveel.",
        "$x+y=5$ and $2x+3y=12$.\nII has three squares, I has only one.\nFirst make row I three times as big.",
      ),
      visual: shapeSystemVisual({ x: 1, y: 1, c: 5 }, { x: 2, y: 3, c: 12 }, [3, 1]),
      task: L("Klik op ‘Maak evenveel vierkantjes’. Trek dan af.", "Click ‘Make the squares equal’. Then subtract."),
    },
    {
      kind: "example",
      title: L("Voorbeeld: eerst keer 3", "Example: first times 3"),
      problem: L("Los op: $x+y=5$ en $2x+3y=12$.", "Solve: $x+y=5$ and $2x+3y=12$."),
      solution: { steps: eliminationSteps(row(1, 1, 5), row(2, 3, 12), 3, 1, "sub", F(3), F(2)), solutions: [{ x: 3, y: 2 }] },
    },
    {
      kind: "explain",
      title: L("Optellen of aftrekken?", "Add or subtract?"),
      body: L(
        "Hetzelfde teken bij $y$: aftrekken.\nVerschillend teken: optellen.\nNiet evenveel $y$: eerst een hele rij vermenigvuldigen.\nZie [[rule:u3.elimination]].",
        "Same sign in front of $y$: subtract.\nDifferent sign: add.\nNot the same number of $y$: first multiply a whole row.\nSee [[rule:u3.elimination]].",
      ),
      ruleId: "u3.elimination",
    },
  ],
  practice: [
    { generatorId: "u3.system-elimination", difficulty: 1, count: 3 },
    { generatorId: "u3.system-elimination", difficulty: 2, count: 3 },
    { generatorId: "u3.system-elimination", difficulty: 3, count: 2 },
  ],
};
