/**
 * Lesson 2: y = ax + b. The start value b (where the line meets the y-axis)
 * and the slope a (the step for every 1 to the right).
 */
import type { Lesson } from "@/content/types";
import { L } from "../helpers";
import { lineLabVisual, tablePlotVisual } from "../gen/visuals";

export const startStepLesson: Lesson = {
  id: "u3.start-step",
  title: L("Startgetal en richtingscoëfficiënt", "Start value and slope"),
  goal: L(
    "Je ziet in $y=ax+b$ meteen waar de lijn begint en hoe steil hij is.",
    "You see straight away in $y=ax+b$ where the line starts and how steep it is.",
  ),
  minutes: 9,
  calculator: "off",
  calculatorOffReason: L("De rekenmachine staat uit. Hier lees je af en denk je na.", "The calculator is off. Here you read and think."),
  info: {
    what: L(
      "In $y=ax+b$ vertellen twee getallen alles over de lijn: $b$ is waar hij begint, $a$ is hoe steil hij is.",
      "In $y=ax+b$ two numbers tell you everything about the line: $b$ is where it starts, $a$ is how steep it is.",
    ),
    why: L(
      "Zo zie je in één blik hoe een lijn loopt, zonder te rekenen. Bijvoorbeeld: €$5$ vast plus €$2$ per keer.",
      "That way you see at a glance how a line goes, without calculating. For example: €$5$ fixed plus €$2$ each time.",
    ),
    later: L(
      "In AI heten $a$ en $b$ het gewicht en de bias. Een model leren is: die getallen goed kiezen.",
      "In AI, $a$ and $b$ are called the weight and the bias. Training a model means choosing those numbers well.",
    ),
  },
  screens: [
    {
      kind: "explain",
      title: L("Twee getallen", "Two numbers"),
      body: L(
        "Elke lineaire formule kun je schrijven als $y=ax+b$.\n$b$ is het **startgetal**.\n$a$ is de **richtingscoëfficiënt**: de stap.\nEerst kijken we naar $b$.",
        "Every linear formula can be written as $y=ax+b$.\n$b$ is the **start value**.\n$a$ is the **slope**: the step.\nFirst we look at $b$.",
      ),
      latex: "y=ax+b",
    },
    {
      kind: "visual",
      title: L("Het startgetal b", "The start value b"),
      body: L(
        "Dit is $y=x+b$. De stip zit op de $y$-as.\nVerander $b$ met de knoppen.",
        "This is $y=x+b$. The dot is on the $y$-axis.\nChange $b$ with the buttons.",
      ),
      visual: lineLabVisual(1, 0, { edit: "b" }),
      task: L("Maak $b$ eerst $3$, dan $-2$. Waar begint de lijn?", "Make $b$ first $3$, then $-2$. Where does the line start?"),
    },
    {
      kind: "explain",
      title: L("b: waar de lijn de y-as raakt", "b: where the line meets the y-axis"),
      body: L(
        "Op de $y$-as is $x=0$.\nVul $x=0$ in: $y=a\\cdot 0+b=b$.\nDus de lijn snijdt de $y$-as in $(0,\\ b)$.",
        "On the $y$-axis $x=0$.\nPut in $x=0$: $y=a\\cdot 0+b=b$.\nSo the line crosses the $y$-axis at $(0,\\ b)$.",
      ),
    },
    {
      kind: "visual",
      title: L("De stap a", "The step a"),
      body: L(
        "Nu verander je $a$. De lijn draait.\nDe trap laat zien wat $a$ is: $1$ naar rechts, dan $a$ omhoog.",
        "Now you change $a$. The line turns.\nThe staircase shows what $a$ is: $1$ to the right, then $a$ up.",
      ),
      visual: lineLabVisual(1, 1, { edit: "a", stairs: true }),
      task: L("Maak $a$ eerst $2$, dan $-1$. Klik op ‘Zet een stap’. Wat doet de trap?", "Make $a$ first $2$, then $-1$. Click ‘Take a step’. What does the staircase do?"),
    },
    {
      kind: "explain",
      title: L("Omhoog, omlaag of vlak", "Up, down or flat"),
      body: L(
        "Is $a$ positief? Dan gaat de lijn omhoog: **stijgend**.\nIs $a$ negatief? Dan gaat hij omlaag: **dalend**.\nIs $a=0$? Dan is de lijn vlak.\nHoe groter het getal, hoe steiler.",
        "Is $a$ positive? Then the line goes up: **increasing**.\nIs $a$ negative? Then it goes down: **decreasing**.\nIs $a=0$? Then the line is flat.\nThe bigger the number, the steeper.",
      ),
    },
    {
      kind: "visual",
      title: L("Maak de lijn na", "Copy the line"),
      body: L("De stippellijn is $y=-2x+4$.\nMaak jouw lijn precies hetzelfde.", "The dashed line is $y=-2x+4$.\nMake your line exactly the same."),
      visual: lineLabVisual(-2, 4, { edit: "both", start: { a: 1, b: 0 }, stairs: true }),
      task: L("Zet eerst $b$ goed, dan $a$.", "Set $b$ first, then $a$."),
    },
    {
      kind: "example",
      title: L("Voorbeeld: aflezen", "Example: reading off"),
      problem: L("Wat zijn $a$ en $b$ bij $y=5-3x$?", "What are $a$ and $b$ for $y=5-3x$?"),
      solution: {
        steps: [
          { latex: "y=5-3x", note: L("Hier staat het startgetal vooraan.", "Here the start value comes first.") },
          {
            latex: "y=\\hl{-3}x+\\hl{5}",
            note: L("Zet de $x$-term vooraan. Het minteken hoort bij $3x$. Dus $a=-3$ en $b=5$.", "Put the $x$ term first. The minus sign belongs to $3x$. So $a=-3$ and $b=5$."),
          },
        ],
      },
    },
    {
      kind: "example",
      title: L("Voorbeeld: formule bij een tabel", "Example: formula for a table"),
      problem: L(
        "Geef de formule bij de punten $(0,\\ 2),\\ (1,\\ 5),\\ (2,\\ 8),\\ (3,\\ 11)$.",
        "Give the formula for the points $(0,\\ 2),\\ (1,\\ 5),\\ (2,\\ 8),\\ (3,\\ 11)$.",
      ),
      visual: tablePlotVisual(3, 2, [0, 1, 2, 3]),
      solution: {
        steps: [
          { latex: "y=(5-2)x+2", note: L("$a$: per stap komt er $5-2$ bij. $b$: bij $x=0$ is $y=2$.", "$a$: every step adds $5-2$. $b$: at $x=0$, $y=2$.") },
          { latex: "y=\\ask{3x+2}", note: L("Reken uit en schrijf als $y=ax+b$.", "Work it out and write it as $y=ax+b$.") },
        ],
      },
    },
    {
      kind: "explain",
      title: L("Onthoud", "Remember"),
      body: L(
        "$a$: de stap per $1$ naar rechts. Het getal vóór $x$.\n$b$: het startgetal. De $y$ bij $x=0$.\nZie [[rule:u3.slope-intercept]].",
        "$a$: the step for every $1$ to the right. The number in front of $x$.\n$b$: the start value. The $y$ at $x=0$.\nSee [[rule:u3.slope-intercept]].",
      ),
      ruleId: "u3.slope-intercept",
    },
  ],
  practice: [
    { generatorId: "u3.read-ab", difficulty: 1, count: 3 },
    { generatorId: "u3.formula-from-ab", difficulty: 1, count: 2 },
    { generatorId: "u3.read-ab", difficulty: 2, count: 2 },
    { generatorId: "u3.formula-from-ab", difficulty: 2, count: 2 },
    { generatorId: "u3.read-ab", difficulty: 3, count: 1 },
    { generatorId: "u3.formula-from-ab", difficulty: 3, count: 1 },
  ],
};
