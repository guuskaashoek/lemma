/**
 * Lesson 8: perimeter, area and volume.
 */
import type { Lesson } from "@/content/types";
import { L, custom } from "../helpers";

export const geometryLesson: Lesson = {
  id: "u0.perimeter-area-volume",
  title: L("Omtrek, oppervlakte en inhoud", "Perimeter, area and volume"),
  goal: L(
    "Je berekent de omtrek en oppervlakte van een rechthoek, driehoek en cirkel, en de inhoud van een balk en cilinder.",
    "You work out the perimeter and area of a rectangle, triangle and circle, and the volume of a box and a cylinder.",
  ),
  minutes: 10,
  calculator: "allowed",
  calculatorOffReason: L(
    "Bij deze opgave staat de rekenmachine uit. Die reken je met de hand.",
    "The calculator is off for this exercise. You do this one by hand.",
  ),
  info: {
    what: L(
      "Omtrek is de lengte van de rand. Oppervlakte is hoeveel vlak erin past. Inhoud is hoeveel ruimte erin past.",
      "Perimeter is the length of the edge. Area is how much flat space fits inside. Volume is how much space fits inside.",
    ),
    why: L(
      "Verf, vloeren, hekken, dozen en water: je rekent het uit met deze formules.",
      "Paint, floors, fences, boxes and water: you work them out with these formulas.",
    ),
    later: L(
      "Bij Pythagoras, goniometrie en integralen. In AI tel je ook zo ruimtes: hoeveel vakjes past er in een raster.",
      "In Pythagoras, trigonometry and integrals. In AI you also count space like this: how many cells fit in a grid.",
    ),
  },
  screens: [
    {
      kind: "visual",
      title: L("Rand of binnenkant?", "Edge or inside?"),
      body: L(
        "**Omtrek**: hoe ver loop je als je één keer rondloopt? Dat is in cm.\n**Oppervlakte**: hoeveel vakjes van $1$ bij $1$ cm passen erin? Dat is in cm².",
        "**Perimeter**: how far do you walk going around once? That is in cm.\n**Area**: how many $1$ by $1$ cm squares fit inside? That is in cm².",
      ),
      visual: custom("u0.shape-grid", { shape: "rect", w: 6, h: 4, unit: "cm" }, L("Een rechthoek van $6$ bij $4$ cm op ruitjes.", "A $6$ by $4$ cm rectangle on a grid.")),
      task: L("Klik eerst op de rand. Klik dan op vullen. Welke twee getallen krijg je?", "First click the edge. Then click fill. Which two numbers do you get?"),
    },
    {
      kind: "explain",
      title: L("De rechthoek", "The rectangle"),
      body: L(
        "Omtrek: tel alle vier de zijden op. $6+4+6+4=20$ cm.\nOppervlakte: lengte keer breedte. $6\\cdot 4=24$ cm².\nZie [[rule:u0.perimeter]] en [[rule:u0.area]].",
        "Perimeter: add all four sides. $6+4+6+4=20$ cm.\nArea: length times width. $6\\cdot 4=24$ cm².\nSee [[rule:u0.perimeter]] and [[rule:u0.area]].",
      ),
      ruleId: "u0.area",
    },
    {
      kind: "visual",
      title: L("Een driehoek is een halve rechthoek", "A triangle is half a rectangle"),
      body: L(
        "Zet een rechthoek om de driehoek. Basis $6$, hoogte $4$.\nDe driehoek is precies de helft.\nDus oppervlakte $=\\frac{1}{2}\\cdot 6\\cdot 4=12$ cm².",
        "Put a rectangle around the triangle. Base $6$, height $4$.\nThe triangle is exactly half.\nSo area $=\\frac{1}{2}\\cdot 6\\cdot 4=12$ cm².",
      ),
      visual: custom("u0.shape-grid", { shape: "triangle", b: 6, h: 4, top: 2, unit: "cm" }, L("Een driehoek met basis $6$ en hoogte $4$ in een rechthoek.", "A triangle with base $6$ and height $4$ inside a rectangle.")),
      task: L("Klik twee keer op volgende stap. Zie je de twee helften?", "Click next step twice. Do you see the two halves?"),
    },
    {
      kind: "visual",
      title: L("De cirkel en $\\pi$", "The circle and $\\pi$"),
      body: L(
        "De **straal** $r$ gaat van het midden naar de rand. De **diameter** $d$ is twee stralen.\nRol de rand uit: hij is iets meer dan $3$ diameters. Precies $\\pi\\approx 3.14$ keer.",
        "The **radius** $r$ goes from the centre to the edge. The **diameter** $d$ is two radii.\nRoll out the edge: it is a bit more than $3$ diameters. Exactly $\\pi\\approx 3.14$ times.",
      ),
      visual: custom("u0.shape-grid", { shape: "circle", r: 3, unit: "cm" }, L("Een cirkel met straal $3$ cm. De rand wordt uitgerold.", "A circle with radius $3$ cm. The edge is rolled out.")),
      task: L("Speel het af. Hoe vaak past de diameter in de rand?", "Play it. How many times does the diameter fit in the edge?"),
    },
    {
      kind: "example",
      title: L("Voorbeeld: oppervlakte van een cirkel", "Example: area of a circle"),
      problem: L("Een cirkel heeft straal $5$ cm. Bereken de oppervlakte. Rond af op $1$ decimaal.", "A circle has radius $5$ cm. Work out the area. Round to $1$ decimal."),
      solution: {
        steps: [
          { latex: "\\pi\\cdot 5^{2}", note: L("Oppervlakte is $\\pi\\cdot r^2$.", "Area is $\\pi\\cdot r^2$.") },
          { latex: "\\pi\\cdot\\ask{25}", note: L("$5^{2}=5\\cdot 5=25$. Niet $5\\cdot 2$!", "$5^{2}=5\\cdot 5=25$. Not $5\\cdot 2$!") },
          { latex: "\\pi\\cdot 25\\approx \\ask{78.5}", note: L("Met de rekenmachine: $78.5$ cm².", "With the calculator: $78.5$ cm²."), approx: { decimals: 1 } },
        ],
      },
    },
    {
      kind: "visual",
      title: L("Inhoud: blokjes stapelen", "Volume: stacking cubes"),
      body: L(
        "Een balk is $4$ lang, $3$ breed en $2$ hoog.\nDe bodemlaag heeft $4\\cdot 3=12$ blokjes.\nEr komen $2$ lagen. Samen $24$ blokjes.",
        "A box is $4$ long, $3$ wide and $2$ high.\nThe bottom layer has $4\\cdot 3=12$ cubes.\nThere are $2$ layers. Together $24$ cubes.",
      ),
      visual: custom("u0.cube-stack", { l: 4, w: 3, h: 2, unit: "cm" }, L("Een balk van $4$ bij $3$ bij $2$ blokjes.", "A box of $4$ by $3$ by $2$ cubes.")),
      task: L("Klik op laag erbij tot de balk vol is.", "Click add a layer until the box is full."),
    },
    {
      kind: "explain",
      title: L("Inhoud", "Volume"),
      body: L(
        "Balk: lengte keer breedte keer hoogte.\nCilinder: bodem keer hoogte, dus $\\pi\\cdot r^2\\cdot h$.\nEen blokje van $1$ dm³ is precies $1$ liter.\nZie [[rule:u0.volume]].",
        "Box: length times width times height.\nCylinder: bottom times height, so $\\pi\\cdot r^2\\cdot h$.\nA cube of $1$ dm³ is exactly $1$ litre.\nSee [[rule:u0.volume]].",
      ),
      ruleId: "u0.volume",
    },
    {
      kind: "example",
      title: L("Voorbeeld: aquarium", "Example: fish tank"),
      problem: L("Een aquarium is $50$ cm lang, $30$ cm breed en $40$ cm hoog. Hoeveel liter past erin?", "A fish tank is $50$ cm long, $30$ cm wide and $40$ cm high. How many litres fit in it?"),
      visual: custom("u0.cube-stack", { l: 5, w: 3, h: 4, unit: "dm" }, L("Een balk van $5$ bij $3$ bij $4$ dm.", "A box of $5$ by $3$ by $4$ dm.")),
      solution: {
        steps: [
          { latex: "5\\cdot 3\\cdot 4", note: L("Reken in dm: $50$ cm $=5$ dm, $30$ cm $=3$ dm, $40$ cm $=4$ dm.", "Work in dm: $50$ cm $=5$ dm, $30$ cm $=3$ dm, $40$ cm $=4$ dm.") },
          { latex: "\\ask{15}\\cdot 4", note: L("De bodem.", "The bottom.") },
          { latex: "\\ask{60}", note: L("$60$ dm³ is $60$ liter.", "$60$ dm³ is $60$ litres.") },
        ],
      },
    },
  ],
  practice: [
    { generatorId: "u0.perimeter-area", difficulty: 1, count: 2 },
    { generatorId: "u0.volume", difficulty: 1, count: 1 },
    { generatorId: "u0.perimeter-area", difficulty: 2, count: 2 },
    { generatorId: "u0.volume", difficulty: 2, count: 1 },
    { generatorId: "u0.perimeter-area", difficulty: 3, count: 2 },
    { generatorId: "u0.volume", difficulty: 3, count: 1 },
  ],
};
