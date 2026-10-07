/**
 * Lesson 6: converting metric units with the staircase, including area
 * and volume units.
 */
import type { Lesson } from "@/content/types";
import { L, custom } from "../helpers";

export const unitsLesson: Lesson = {
  id: "u0.units",
  title: L("Eenheden omrekenen", "Converting units"),
  goal: L(
    "Je rekent lengte, gewicht, inhoud en oppervlakte om met het metriek trapje.",
    "You convert length, mass, volume and area with the metric staircase.",
  ),
  minutes: 8,
  calculator: "off",
  calculatorOffReason: L(
    "De rekenmachine staat uit. Je schuift alleen cijfers: dat kan in je hoofd.",
    "The calculator is off. You only move digits: you can do that in your head.",
  ),
  info: {
    what: L(
      "Dezelfde lengte kun je in km, m of cm schrijven. Omrekenen is van de ene eenheid naar de andere gaan.",
      "The same length can be written in km, m or cm. Converting is going from one unit to another.",
    ),
    why: L(
      "In formules moeten de eenheden kloppen. Anders is je antwoord $100$ of $1000$ keer te groot.",
      "In formulas the units must match. Otherwise your answer is $100$ or $1000$ times too big.",
    ),
    later: L(
      "Bij oppervlakte en inhoud, natuurkunde en snelheid. Ook in AI zet je gegevens eerst om naar dezelfde schaal.",
      "In area and volume, physics and speed. In AI too, you first bring data to the same scale.",
    ),
  },
  screens: [
    {
      kind: "visual",
      title: L("Het metriek trapje", "The metric staircase"),
      body: L(
        "Elke trede is een eenheid. Naar rechts worden ze kleiner.\nGa je één trede omlaag? Dan wordt het getal $10$ keer zo groot.\n$1$ m is $10$ dm. $1$ dm is $10$ cm.",
        "Every stair is a unit. To the right they get smaller.\nGo one stair down? Then the number gets $10$ times bigger.\n$1$ m is $10$ dm. $1$ dm is $10$ cm.",
      ),
      visual: custom(
        "u0.unit-stairs",
        { kind: "length", from: "m", to: "cm", value: 3 },
        L("Het metriek trapje van km tot mm. Het getal $3$ staat op de trede m.", "The metric staircase from km to mm. The number $3$ is on the m stair."),
      ),
      task: L("Ga twee treden omlaag naar cm. Hoeveel cm is $3$ m?", "Go two stairs down to cm. How many cm is $3$ m?"),
    },
    {
      kind: "explain",
      title: L("Kleinere eenheid, groter getal", "Smaller unit, bigger number"),
      body: L(
        "Een cm is klein. Daarom heb je er veel van nodig.\nOmlaag op het trapje: keer $10$ per trede.\nOmhoog: gedeeld door $10$ per trede.\nGewicht (kg, g, mg) en inhoud (L, dL, cL, mL) werken net zo.\nZie [[rule:u0.unit-stairs]].",
        "A cm is small. So you need a lot of them.\nDown the staircase: times $10$ per stair.\nUp: divided by $10$ per stair.\nMass (kg, g, mg) and volume (L, dL, cL, mL) work the same way.\nSee [[rule:u0.unit-stairs]].",
      ),
      ruleId: "u0.unit-stairs",
    },
    {
      kind: "example",
      title: L("Voorbeeld: $450$ g naar kg", "Example: $450$ g to kg"),
      problem: L("Reken $450$ g om naar kg.", "Convert $450$ g to kg."),
      visual: custom(
        "u0.unit-stairs",
        { kind: "mass", from: "g", to: "kg", value: 450 },
        L("Het trapje voor gewicht. Het getal $450$ staat op de trede g.", "The staircase for mass. The number $450$ is on the g stair."),
      ),
      solution: {
        steps: [
          { latex: "450:10:10:10", note: L("Van g naar kg: drie treden omhoog.", "From g to kg: three stairs up.") },
          { latex: "\\ask{45}:10:10", note: L("Nu in dag.", "Now in dag.") },
          { latex: "\\ask{4.5}:10", note: L("Nu in hg.", "Now in hg.") },
          { latex: "\\ask{0.45}", note: L("Nu in kg: $0.45$ kg.", "Now in kg: $0.45$ kg.") },
        ],
      },
    },
    {
      kind: "visual",
      title: L("Oppervlakte: keer 100", "Area: times 100"),
      body: L(
        "Een vierkant van $1$ dm bij $1$ dm is $10$ cm bij $10$ cm.\nDaar passen $10\\cdot 10=100$ vakjes van $1$ cm² in.\nDus $1$ dm² $=100$ cm².",
        "A square of $1$ dm by $1$ dm is $10$ cm by $10$ cm.\n$10\\cdot 10=100$ squares of $1$ cm² fit inside.\nSo $1$ dm² $=100$ cm².",
      ),
      visual: custom("u0.shape-grid", { shape: "rect", w: 10, h: 10, unit: "cm" }, L("Een vierkant van $10$ bij $10$ cm op ruitjes.", "A $10$ by $10$ cm square on a grid.")),
      task: L("Klik op vullen. Hoeveel vakjes van $1$ cm² zijn het?", "Click fill. How many $1$ cm² squares are there?"),
    },
    {
      kind: "explain",
      title: L("Oppervlakte en inhoud", "Area and volume"),
      body: L(
        "Oppervlakte (m², dm², cm²): elke trede keer $100$.\nInhoud in kubieke eenheden (m³, dm³, cm³): elke trede keer $1000$.\nHandig: $1$ dm³ $=1$ liter, en $1$ cm³ $=1$ mL.\nZie [[rule:u0.area-units]].",
        "Area (m², dm², cm²): every stair times $100$.\nVolume in cubic units (m³, dm³, cm³): every stair times $1000$.\nHandy: $1$ dm³ $=1$ litre, and $1$ cm³ $=1$ mL.\nSee [[rule:u0.area-units]].",
      ),
      ruleId: "u0.area-units",
    },
    {
      kind: "example",
      title: L("Voorbeeld: $2.5$ m² naar cm²", "Example: $2.5$ m² to cm²"),
      problem: L("Reken $2.5$ m² om naar cm².", "Convert $2.5$ m² to cm²."),
      visual: custom(
        "u0.unit-stairs",
        { kind: "area", from: "m²", to: "cm²", value: 2.5 },
        L("Het trapje voor oppervlakte. Het getal $2.5$ staat op de trede m².", "The staircase for area. The number $2.5$ is on the m² stair."),
      ),
      solution: {
        steps: [
          { latex: "2.5\\cdot 100\\cdot 100", note: L("Van m² naar cm²: twee treden omlaag, elk keer $100$.", "From m² to cm²: two stairs down, each times $100$.") },
          { latex: "\\ask{250}\\cdot 100", note: L("Nu in dm².", "Now in dm².") },
          { latex: "\\ask{25000}", note: L("Nu in cm².", "Now in cm².") },
        ],
      },
    },
  ],
  practice: [
    { generatorId: "u0.unit-convert", difficulty: 1, count: 3 },
    { generatorId: "u0.unit-convert", difficulty: 2, count: 3 },
    { generatorId: "u0.unit-convert", difficulty: 3, count: 2 },
  ],
};
