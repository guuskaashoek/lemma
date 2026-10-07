/**
 * Lesson 9: rearranging formulas by running the machine backwards.
 */
import type { Lesson } from "@/content/types";
import { custom, L } from "../helpers";
import { undoSteps } from "../gen/rearrange";
import { BY_HAND } from "./variables";

const machine = (props: Record<string, unknown>, what: string) =>
  custom("u2.undo-machine", props, L(`Een machine voor $${what}$, vooruit en achteruit.`, `A machine for $${what}$, forwards and backwards.`));

const TIMES2_PLUS3 = [
  { op: "*", n: "2" },
  { op: "+", n: "3" },
] as const;

const MOUNTAIN = [
  { op: "*", n: "6" },
  { op: "from", n: "15" },
] as const;

export const rearrangeLesson: Lesson = {
  id: "u2.rearrange",
  title: L("Formules omwerken", "Rearranging formulas"),
  goal: L("Je schrijft $y=2x+3$ om naar $x=\\ldots$ door terug te rekenen.", "You rewrite $y=2x+3$ as $x=\\ldots$ by working backwards."),
  minutes: 10,
  calculator: "off",
  calculatorOffReason: BY_HAND,
  info: {
    what: L(
      "Een formule omwerken: je zorgt dat een andere letter alleen aan één kant staat.",
      "Rearranging a formula: you make a different letter stand alone on one side.",
    ),
    why: L(
      "Soms weet je de uitkomst en zoek je wat erin ging. Bijvoorbeeld: hoeveel kilometer kun je rijden voor €20?",
      "Sometimes you know the result and look for what went in. For example: how many kilometres can you ride for €20?",
    ),
    later: L(
      "Natuurkunde, economie en programmeren zitten vol formules. In AI reken je soms ook terug: van uitkomst naar oorzaak.",
      "Physics, economics and programming are full of formulas. In AI you sometimes work backwards too: from result to cause.",
    ),
  },
  screens: [
    {
      kind: "explain",
      title: L("Ik denk aan een getal", "I am thinking of a number"),
      body: L(
        "Ik denk aan een getal. Ik doe keer $2$ en dan plus $3$. Er komt $11$ uit.\nWelk getal was het?\nReken terug: $11-3=8$. Dan $8:2=4$.",
        "I am thinking of a number. I multiply by $2$ and then add $3$. I get $11$.\nWhich number was it?\nWork backwards: $11-3=8$. Then $8:2=4$.",
      ),
      metaphor: "machine",
    },
    {
      kind: "visual",
      title: L("De machine achteruit", "The machine backwards"),
      body: L(
        "$y=2x+3$ is een machine: eerst keer $2$, dan plus $3$.\nAchteruit doe je het omgekeerde, in omgekeerde volgorde.\nEerst min $3$, dan gedeeld door $2$.",
        "$y=2x+3$ is a machine: first times $2$, then add $3$.\nBackwards you do the opposite, in reverse order.\nFirst subtract $3$, then divide by $2$.",
      ),
      visual: machine({ ops: TIMES2_PLUS3, input: "x", output: "y", start: 4, target: 11 }, "y=2x+3"),
      task: L("Klik op ▶ Vooruit: $4$ gaat erin. Klik daarna op ◀ Achteruit vanaf $11$. Kom je weer bij $4$?", "Click ▶ Forwards: $4$ goes in. Then click ◀ Backwards from $11$. Do you get back to $4$?"),
      metaphor: "machine",
    },
    {
      kind: "explain",
      title: L("Omgekeerde stappen", "Opposite steps"),
      body: L(
        "Plus maak je ongedaan met min.\nKeer maak je ongedaan met delen. Delen maak je ongedaan met keer.\nBegin altijd bij de laatste stap.",
        "You undo plus with minus.\nYou undo times with dividing. You undo dividing with times.\nAlways start with the last step.",
      ),
    },
    {
      kind: "visual",
      title: L("Nu met letters", "Now with letters"),
      body: L(
        "Stuur je de letter $y$ achteruit door de machine?\nDan komt er een formule voor $x$ uit.",
        "Send the letter $y$ backwards through the machine?\nThen a formula for $x$ comes out.",
      ),
      visual: machine({ ops: TIMES2_PLUS3, input: "x", output: "y" }, "y=2x+3"),
      task: L("Klik op ◀ Achteruit. Welke formule voor $x$ komt eruit?", "Click ◀ Backwards. Which formula for $x$ comes out?"),
      metaphor: "machine",
    },
    {
      kind: "explain",
      title: L("Terugrekenen met de balans", "Working backwards with the balance"),
      body: L(
        "Elke terugstap doe je links én rechts, net als bij de balans.\nZo blijft de formule kloppen.\nZie [[rule:u2.rearrange]].",
        "You do every backward step on the left and on the right, just like the balance.\nThat keeps the formula true.\nSee [[rule:u2.rearrange]].",
      ),
      ruleId: "u2.rearrange",
      metaphor: "balance",
    },
    {
      kind: "example",
      title: L("Voorbeeld: $y=2x+3$", "Example: $y=2x+3$"),
      problem: L("Schrijf $y=2x+3$ als $x=\\ldots$.", "Write $y=2x+3$ as $x=\\ldots$."),
      visual: machine({ ops: TIMES2_PLUS3, input: "x", output: "y" }, "y=2x+3"),
      solution: { steps: undoSteps({ out: "y", inp: "x", ops: [...TIMES2_PLUS3] }).steps },
    },
    {
      kind: "example",
      title: L("Voorbeeld: de taxi", "Example: the taxi"),
      problem: L(
        "Een taxirit kost $K=4+2a$ euro voor $a$ kilometer. Schrijf als $a=\\ldots$.",
        "A taxi ride costs $K=4+2a$ euros for $a$ kilometres. Write it as $a=\\ldots$.",
      ),
      solution: {
        steps: undoSteps({
          out: "K",
          inp: "a",
          ops: [
            { op: "*", n: "2" },
            { op: "+", n: "4" },
          ],
          display: "4+2a",
        }).steps,
      },
    },
    {
      kind: "explain",
      title: L("Een getal min de letter", "A number minus the letter"),
      body: L(
        "Soms staat er $15-6h$: $15$ min iets.\nDat maak je ongedaan met hetzelfde: $15$ min de andere kant.\nKijk: $15-x=9$ geeft $x=15-9=6$.",
        "Sometimes it says $15-6h$: $15$ minus something.\nYou undo that with the same thing: $15$ minus the other side.\nLook: $15-x=9$ gives $x=15-9=6$.",
      ),
    },
    {
      kind: "example",
      title: L("Voorbeeld: op de berg", "Example: on the mountain"),
      problem: L(
        "Op een berg is het op $h$ km hoogte ongeveer $T=15-6h$ graden. Schrijf als $h=\\ldots$.",
        "On a mountain, at a height of $h$ km it is about $T=15-6h$ degrees. Write it as $h=\\ldots$.",
      ),
      visual: machine({ ops: MOUNTAIN, input: "h", output: "T" }, "T=15-6h"),
      solution: { steps: undoSteps({ out: "T", inp: "h", ops: [...MOUNTAIN] }).steps },
    },
    {
      kind: "example",
      title: L("Voorbeeld: alleen letters", "Example: letters only"),
      problem: L(
        "De omtrek van een rechthoek is $O=2(l+b)$. Schrijf als $b=\\ldots$.",
        "The perimeter of a rectangle is $O=2(l+b)$. Write it as $b=\\ldots$.",
      ),
      visual: machine(
        {
          ops: [
            { op: "+", n: "l" },
            { op: "*", n: "2" },
          ],
          input: "b",
          output: "O",
        },
        "O=2(l+b)",
      ),
      solution: {
        steps: undoSteps({
          out: "O",
          inp: "b",
          ops: [
            { op: "+", n: "l" },
            { op: "*", n: "2" },
          ],
          display: "2(l+b)",
        }).steps,
      },
    },
  ],
  practice: [
    { generatorId: "u2.rearrange", difficulty: 1, count: 3 },
    { generatorId: "u2.rearrange", difficulty: 2, count: 3 },
    { generatorId: "u2.rearrange", difficulty: 3, count: 2 },
  ],
};
