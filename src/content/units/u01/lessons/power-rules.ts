/**
 * Lesson 7: the rules for powers (rekenregels voor machten), shown as rows
 * of tiles: glue (multiply), cancel (divide), copy (power of a power).
 */
import type { Lesson } from "@/content/types";
import { chain } from "../gen/power-rules";
import { L } from "../helpers";

const a = (n: number) => Array<string>(n).fill("a");

export const powerRulesLesson: Lesson = {
  id: "u1.power-rules",
  title: L("Rekenregels voor machten", "Rules for powers"),
  goal: L(
    "Je schrijft $a^{3}\\cdot a^{4}$, $\\frac{a^{5}}{a^{2}}$ en $(a^{2})^{3}$ als één macht, en je werkt $(2a^{3})^{2}$ uit.",
    "You write $a^{3}\\cdot a^{4}$, $\\frac{a^{5}}{a^{2}}$ and $(a^{2})^{3}$ as one power, and you work out $(2a^{3})^{2}$.",
  ),
  minutes: 10,
  calculator: "off",
  calculatorOffReason: L(
    "De rekenmachine staat uit. Met deze regels hoef je niets uit te rekenen.",
    "The calculator is off. With these rules you do not need to work anything out.",
  ),
  info: {
    what: L(
      "Regels om machten met hetzelfde grondtal samen te nemen, zonder ze uit te rekenen.",
      "Rules to combine powers with the same base, without working them out.",
    ),
    why: L(
      "Bij formules met letters kun je niets uitrekenen. Dan heb je deze regels nodig om te vereenvoudigen.",
      "In formulas with letters you cannot work anything out. Then you need these rules to simplify.",
    ),
    later: L(
      "Bij exponentiële groei, logaritmen en afgeleiden ($x^{n}$ wordt $nx^{n-1}$). In AI rekent elke formule met machten.",
      "In exponential growth, logarithms and derivatives ($x^{n}$ becomes $nx^{n-1}$). In AI every formula calculates with powers.",
    ),
  },
  screens: [
    {
      kind: "visual",
      title: L("Keer: rijtjes aan elkaar", "Multiply: rows glued together"),
      body: L(
        "$a^{3}$ is een rijtje van drie tegels $a$. $a^{4}$ is een rijtje van vier.\nKeer elkaar: plak de rijtjes aan elkaar.",
        "$a^{3}$ is a row of three $a$ tiles. $a^{4}$ is a row of four.\nMultiply them: glue the rows together.",
      ),
      visual: chain({ mode: "product", left: a(3), right: a(4) }, L("Rijtjes voor $a^{3}\\cdot a^{4}$.", "Rows for $a^{3}\\cdot a^{4}$.")),
      task: L("Klik op Volgende stap. Hoeveel tegels zijn het samen?", "Click Next step. How many tiles are there together?"),
    },
    {
      kind: "explain",
      title: L("Keer: exponenten optellen", "Multiply: add the exponents"),
      body: L(
        "$a^{3}\\cdot a^{4}=a^{3+4}=a^{7}$.\nDit mag alleen bij **hetzelfde grondtal**.\n$2^{3}\\cdot 5^{4}$ kun je zo niet samennemen. Zie [[rule:u1.product-rule]].",
        "$a^{3}\\cdot a^{4}=a^{3+4}=a^{7}$.\nThis only works with **the same base**.\n$2^{3}\\cdot 5^{4}$ cannot be combined like this. See [[rule:u1.product-rule]].",
      ),
      latex: "a^{p}\\cdot a^{q}=a^{p+q}",
      ruleId: "u1.product-rule",
    },
    {
      kind: "visual",
      title: L("Delen: wegstrepen", "Divide: cross out"),
      body: L(
        "$\\frac{a^{5}}{a^{2}}$: vijf tegels boven, twee onder.\nEen $a$ boven en een $a$ onder is samen $1$. Die streep je weg.",
        "$\\frac{a^{5}}{a^{2}}$: five tiles on top, two below.\nAn $a$ on top and an $a$ below make $1$ together. You cross them out.",
      ),
      visual: chain({ mode: "quotient", top: a(5), bottom: a(2) }, L("Tegels voor $\\frac{a^{5}}{a^{2}}$.", "Tiles for $\\frac{a^{5}}{a^{2}}$.")),
      task: L("Streep stap voor stap weg. Hoeveel blijven er boven over?", "Cross out step by step. How many are left on top?"),
    },
    {
      kind: "explain",
      title: L("Delen: exponenten aftrekken", "Divide: subtract the exponents"),
      body: L(
        "$\\frac{a^{5}}{a^{2}}=a^{5-2}=a^{3}$.\nOok hier: alleen bij hetzelfde grondtal. Zie [[rule:u1.quotient-rule]].",
        "$\\frac{a^{5}}{a^{2}}=a^{5-2}=a^{3}$.\nHere too: only with the same base. See [[rule:u1.quotient-rule]].",
      ),
      latex: "\\frac{a^{p}}{a^{q}}=a^{p-q}",
      ruleId: "u1.quotient-rule",
    },
    {
      kind: "visual",
      title: L("Macht van een macht: kopiëren", "Power of a power: copy"),
      body: L(
        "$(a^{2})^{3}$ betekent: drie keer het rijtje $a^{2}$.\nDus $a^{2}\\cdot a^{2}\\cdot a^{2}$.",
        "$(a^{2})^{3}$ means: the row $a^{2}$ three times.\nSo $a^{2}\\cdot a^{2}\\cdot a^{2}$.",
      ),
      visual: chain({ mode: "power", group: a(2), times: 3 }, L("Het rijtje $a^{2}$, drie keer.", "The row $a^{2}$, three times.")),
      task: L("Klik door. Hoeveel tegels $a$ zijn het?", "Click through. How many $a$ tiles are there?"),
    },
    {
      kind: "explain",
      title: L("Macht van een macht: keer", "Power of a power: multiply"),
      body: L(
        "$(a^{2})^{3}=a^{2\\cdot 3}=a^{6}$.\nKort samen: keer wordt plus, delen wordt min, macht wordt keer.\nElke regel gaat één stap omlaag. Zie [[rule:u1.power-of-power]].",
        "$(a^{2})^{3}=a^{2\\cdot 3}=a^{6}$.\nIn short: multiply becomes add, divide becomes subtract, power becomes multiply.\nEach rule goes one step down. See [[rule:u1.power-of-power]].",
      ),
      latex: "(a^{p})^{q}=a^{p\\cdot q}",
      ruleId: "u1.power-of-power",
    },
    {
      kind: "visual",
      title: L("Een getal in de haakjes", "A number inside the brackets"),
      body: L(
        "$(2a^{3})^{2}$: het rijtje is $2\\cdot a\\cdot a\\cdot a$. Dat neem je twee keer.\nOok de $2$ komt twee keer: $2\\cdot 2=4$.",
        "$(2a^{3})^{2}$: the row is $2\\cdot a\\cdot a\\cdot a$. You take it twice.\nThe $2$ also appears twice: $2\\cdot 2=4$.",
      ),
      visual: chain({ mode: "power", group: ["2", ...a(3)], times: 2 }, L("Het rijtje $2a^{3}$, twee keer.", "The row $2a^{3}$, twice.")),
      task: L("Klik door tot de tegels gesorteerd zijn. Wat staat er dan?", "Click through until the tiles are sorted. What does it say then?"),
    },
    {
      kind: "explain",
      title: L("Macht van een product", "Power of a product"),
      body: L(
        "Staat er een product tussen haakjes? Dan krijgt **elke** factor de macht.\n$(2a^{3})^{2}=2^{2}\\cdot(a^{3})^{2}=4a^{6}$.\nVergeet het getal niet! Zie [[rule:u1.product-power]].",
        "Is there a product in brackets? Then **every** factor gets the power.\n$(2a^{3})^{2}=2^{2}\\cdot(a^{3})^{2}=4a^{6}$.\nDo not forget the number! See [[rule:u1.product-power]].",
      ),
      latex: "(a\\cdot b)^{n}=a^{n}\\cdot b^{n}",
      ruleId: "u1.product-power",
    },
    {
      kind: "example",
      title: L("Voorbeeld: twee regels", "Example: two rules"),
      problem: L("Schrijf $\\frac{a^{2}\\cdot a^{5}}{a^{3}}$ als één macht.", "Write $\\frac{a^{2}\\cdot a^{5}}{a^{3}}$ as one power."),
      solution: {
        steps: [
          { latex: "\\frac{a^{2}\\cdot a^{5}}{a^{3}}", note: L("Eerst de teller.", "First the top.") },
          { latex: "\\frac{a^{\\ask{7}}}{a^{3}}", note: L("Keer: $2+5$.", "Multiply: $2+5$.") },
          { latex: "a^{\\ask{4}}", note: L("Delen: $7-3$.", "Divide: $7-3$.") },
        ],
      },
    },
  ],
  practice: [
    { generatorId: "u1.power-rule", difficulty: 1, count: 2 },
    { generatorId: "u1.power-rule", difficulty: 2, count: 3 },
    { generatorId: "u1.product-power", difficulty: 1, count: 1 },
    { generatorId: "u1.power-rule", difficulty: 3, count: 1 },
    { generatorId: "u1.product-power", difficulty: 2, count: 1 },
  ],
};
