/**
 * Lessons 7 and 8: inequalities, and flipping the sign.
 */
import type { Lesson } from "@/content/types";
import { custom, L, type Rel } from "../helpers";
import { ineqSteps } from "../gen/inequalities";
import { BY_HAND } from "./variables";

const line = (a: number, b: number, d: number, op: Rel, min: number, max: number, test: number, what: string) =>
  custom("u2.ineq-line", { a, b, c: 0, d, op, min, max, test }, L(`Een getallenlijn voor $${what}$.`, `A number line for $${what}$.`));

export const inequalitiesLesson: Lesson = {
  id: "u2.inequalities",
  title: L("Ongelijkheden", "Inequalities"),
  goal: L("Je weet wat $x<4$ betekent en je lost $2x+1\\le 9$ op.", "You know what $x<4$ means and you solve $2x+1\\le 9$."),
  minutes: 9,
  calculator: "off",
  calculatorOffReason: BY_HAND,
  info: {
    what: L(
      "Een ongelijkheid zegt: links is kleiner (of groter) dan rechts. De oplossing is niet één getal, maar een stuk van de getallenlijn.",
      "An inequality says: the left is less (or greater) than the right. The solution is not one number, but a part of the number line.",
    ),
    why: L(
      "Veel vragen gaan over 'minstens' of 'hoogstens'. Hoeveel kun je kopen voor €20? Hoe lang mag een rit duren?",
      "Many questions are about 'at least' or 'at most'. How many can you buy for €20? How long may a ride take?",
    ),
    later: L(
      "Bij grafieken: wanneer ligt de ene lijn boven de andere? In AI zijn grenzen vaak ongelijkheden, zoals: de fout moet kleiner zijn dan $0{,}01$.",
      "In graphs: when is one line above the other? In AI, limits are often inequalities, like: the error must be less than $0.01$.",
    ),
  },
  screens: [
    {
      kind: "explain",
      title: L("Vier tekens", "Four signs"),
      body: L(
        "$<$ kleiner dan. $>$ groter dan.\n$\\le$ kleiner dan of gelijk aan. $\\ge$ groter dan of gelijk aan.\nDe punt van het teken wijst naar het kleinste getal: $2<5$.",
        "$<$ less than. $>$ greater than.\n$\\le$ less than or equal to. $\\ge$ greater than or equal to.\nThe point of the sign points to the smaller number: $2<5$.",
      ),
    },
    {
      kind: "visual",
      title: L("Welke getallen passen?", "Which numbers fit?"),
      body: L(
        "$x<3$ betekent: alle getallen kleiner dan $3$.\nDat zijn er heel veel: $2$, $0$, $-5$, en ook $2{,}5$.",
        "$x<3$ means: all numbers less than $3$.\nThere are lots of them: $2$, $0$, $-5$, and also $2.5$.",
      ),
      visual: line(1, 0, 3, "<", -4, 10, 6, "x<3"),
      task: L("Schuif het pijltje met ◀ en ▶. Bij welke getallen klopt $x<3$? Klopt het bij $3$ zelf?", "Move the pointer with ◀ and ▶. For which numbers is $x<3$ true? Is it true for $3$ itself?"),
    },
    {
      kind: "explain",
      title: L("Open of dicht bolletje", "Open or closed dot"),
      body: L(
        "Je tekent de oplossing op de getallenlijn.\nOpen bolletje: de grens doet niet mee. Bij $<$ en $>$.\nDicht bolletje: de grens doet wél mee. Bij $\\le$ en $\\ge$.",
        "You draw the solution on the number line.\nOpen dot: the boundary does not count. For $<$ and $>$.\nClosed dot: the boundary does count. For $\\le$ and $\\ge$.",
      ),
    },
    {
      kind: "visual",
      title: L("Testen", "Testing"),
      body: L(
        "Bij $2x+1\\le 9$ zie je de oplossing niet meteen.\nTest een paar getallen. Waar gaat het van klopt naar klopt niet?",
        "With $2x+1\\le 9$ you do not see the solution straight away.\nTest a few numbers. Where does it change from true to false?",
      ),
      visual: line(2, 1, 9, "\\le", -3, 11, 7, "2x+1\\le 9"),
      task: L("Test $x=2$, $x=4$ en $x=6$. Klik daarna op Toon alle oplossingen.", "Test $x=2$, $x=4$ and $x=6$. Then click Show all solutions."),
    },
    {
      kind: "explain",
      title: L("Oplossen als een vergelijking", "Solve like an equation"),
      body: L(
        "Los een ongelijkheid op zoals een vergelijking.\nWat je links doet, doe je ook rechts.\nHet teken schrijf je elke regel over. Zie [[rule:u2.inequality]].",
        "Solve an inequality like an equation.\nWhatever you do on the left, you also do on the right.\nCopy the sign on every line. See [[rule:u2.inequality]].",
      ),
      ruleId: "u2.inequality",
      metaphor: "balance",
    },
    {
      kind: "example",
      title: L("Voorbeeld: $2x+1\\le 9$", "Example: $2x+1\\le 9$"),
      problem: L("Los op: $2x+1\\le 9$.", "Solve: $2x+1\\le 9$."),
      visual: line(2, 1, 9, "\\le", -3, 11, 7, "2x+1\\le 9"),
      solution: { steps: [{ latex: "2x+1\\le 9", note: L("Dit is de ongelijkheid.", "This is the inequality.") }, ...ineqSteps(2, 1, 0, 9, "\\le").steps] },
    },
    {
      kind: "example",
      title: L("Voorbeeld: $x$ aan beide kanten", "Example: $x$ on both sides"),
      problem: L("Los op: $5x-4>3x+6$.", "Solve: $5x-4>3x+6$."),
      solution: { steps: [{ latex: "5x-4>3x+6", note: L("Dit is de ongelijkheid.", "This is the inequality.") }, ...ineqSteps(5, -4, 3, 6, ">").steps] },
    },
    {
      kind: "explain",
      title: L("Controleer met één getal", "Check with one number"),
      body: L(
        "Het antwoord $x>5$ is een hele groep getallen.\nTest één getal uit die groep, bijvoorbeeld $x=6$.\n$5\\cdot 6-4>3\\cdot 6+6$ wordt $26>24$. Klopt!",
        "The answer $x>5$ is a whole group of numbers.\nTest one number from that group, for example $x=6$.\n$5\\cdot 6-4>3\\cdot 6+6$ becomes $26>24$. Correct!",
      ),
    },
  ],
  practice: [
    { generatorId: "u2.inequality-meaning", difficulty: 1, count: 2 },
    { generatorId: "u2.inequality-solve", difficulty: 1, count: 2 },
    { generatorId: "u2.inequality-meaning", difficulty: 2, count: 1 },
    { generatorId: "u2.inequality-solve", difficulty: 2, count: 2 },
    { generatorId: "u2.inequality-solve", difficulty: 3, count: 1 },
  ],
};

export const flipLesson: Lesson = {
  id: "u2.flip",
  title: L("Teken omklappen", "Flipping the sign"),
  goal: L("Je lost $-2x<6$ op en je weet waarom het teken omklapt.", "You solve $-2x<6$ and you know why the sign flips."),
  minutes: 8,
  calculator: "off",
  calculatorOffReason: BY_HAND,
  info: {
    what: L(
      "Deel of vermenigvuldig je een ongelijkheid met een negatief getal? Dan moet het teken omdraaien.",
      "Dividing or multiplying an inequality by a negative number? Then the sign must turn around.",
    ),
    why: L(
      "Anders krijg je precies de verkeerde getallen als oplossing.",
      "Otherwise you get exactly the wrong numbers as the solution.",
    ),
    later: L(
      "Bij grafieken en bij optimaliseren. Programma's die ongelijkheden oplossen, ook in AI, letten steeds op dit omklappen.",
      "In graphs and in optimisation. Programs that solve inequalities, in AI too, keep track of this flip all the time.",
    ),
  },
  screens: [
    {
      kind: "explain",
      title: L("Een raadsel", "A puzzle"),
      body: L(
        "$2<5$ klopt.\nDoe allebei keer $-1$. Dan krijg je $-2$ en $-5$.\nMaar $-2<-5$ klopt niet! Het moet $-2>-5$ zijn.",
        "$2<5$ is true.\nMultiply both by $-1$. Then you get $-2$ and $-5$.\nBut $-2<-5$ is false! It must be $-2>-5$.",
      ),
    },
    {
      kind: "visual",
      title: L("Waarom het omklapt", "Why it flips"),
      body: L(
        "Links op de getallenlijn staat het kleinste getal.\nKeer een negatief getal spiegelt alles om de $0$.\nDan staat het grootste getal ineens links.",
        "On the number line the smaller number is on the left.\nTimes a negative number mirrors everything around $0$.\nThen the larger number is suddenly on the left.",
      ),
      visual: custom("u2.flip", { p: 2, q: 5 }, L("De getallen $2$ en $5$ op een getallenlijn.", "The numbers $2$ and $5$ on a number line.")),
      task: L("Klik op $\\times 2$ en $+3$: blijft het teken? Klik daarna op $\\times(-1)$. Wat gebeurt er?", "Click $\\times 2$ and $+3$: does the sign stay? Then click $\\times(-1)$. What happens?"),
    },
    {
      kind: "explain",
      title: L("De regel", "The rule"),
      body: L(
        "Keer of gedeeld door een negatief getal? Dan klapt het teken om.\n$<$ wordt $>$. $\\le$ wordt $\\ge$.\nBij plus en min blijft het teken. Zie [[rule:u2.flip-sign]].",
        "Times or divided by a negative number? Then the sign flips.\n$<$ becomes $>$. $\\le$ becomes $\\ge$.\nWith plus and minus the sign stays. See [[rule:u2.flip-sign]].",
      ),
      ruleId: "u2.flip-sign",
    },
    {
      kind: "visual",
      title: L("Controleer het zelf", "Check it yourself"),
      body: L(
        "Volgens de regel geeft $-2x<6$ de oplossing $x>-3$.\nTest het met de getallenlijn.",
        "By the rule, $-2x<6$ gives the solution $x>-3$.\nTest it with the number line.",
      ),
      visual: line(-2, 0, 6, "<", -9, 5, -6, "-2x<6"),
      task: L("Test $x=-5$ en $x=0$. Welke klopt? Past dat bij $x>-3$?", "Test $x=-5$ and $x=0$. Which one is true? Does that match $x>-3$?"),
    },
    {
      kind: "example",
      title: L("Voorbeeld: $-2x<6$", "Example: $-2x<6$"),
      problem: L("Los op: $-2x<6$.", "Solve: $-2x<6$."),
      solution: { steps: [{ latex: "-2x<6", note: L("Dit is de ongelijkheid.", "This is the inequality.") }, ...ineqSteps(-2, 0, 0, 6, "<").steps] },
    },
    {
      kind: "example",
      title: L("Voorbeeld: $7-3x\\ge 1$", "Example: $7-3x\\ge 1$"),
      problem: L("Los op: $7-3x\\ge 1$.", "Solve: $7-3x\\ge 1$."),
      solution: {
        steps: [
          { latex: "7-3x\\ge 1", note: L("Dit is de ongelijkheid.", "This is the inequality.") },
          { latex: "-3x+7\\ge 1", note: L("Zet de $x$-term vooraan. Het minteken gaat mee.", "Put the $x$-term first. The minus sign moves with it.") },
          ...ineqSteps(-3, 7, 0, 1, "\\ge").steps,
        ],
      },
    },
    {
      kind: "explain",
      title: L("Of: houd $x$ positief", "Or: keep $x$ positive"),
      body: L(
        "Je kunt het omklappen ook ontwijken.\n$-2x<6$: tel links en rechts $2x$ op. Dan $0<6+2x$, dus $-6<2x$.\nDeel door $2$: $-3<x$. Dat is hetzelfde als $x>-3$.",
        "You can also avoid the flip.\n$-2x<6$: add $2x$ on both sides. Then $0<6+2x$, so $-6<2x$.\nDivide by $2$: $-3<x$. That is the same as $x>-3$.",
      ),
    },
    {
      kind: "example",
      title: L("Voorbeeld: $x$ aan beide kanten", "Example: $x$ on both sides"),
      problem: L("Los op: $2x+3>5x-9$.", "Solve: $2x+3>5x-9$."),
      solution: { steps: [{ latex: "2x+3>5x-9", note: L("Dit is de ongelijkheid.", "This is the inequality.") }, ...ineqSteps(2, 3, 5, -9, ">").steps] },
    },
  ],
  practice: [
    { generatorId: "u2.inequality-flip", difficulty: 1, count: 3 },
    { generatorId: "u2.inequality-flip", difficulty: 2, count: 3 },
    { generatorId: "u2.inequality-meaning", difficulty: 3, count: 1 },
    { generatorId: "u2.inequality-flip", difficulty: 3, count: 2 },
  ],
};
