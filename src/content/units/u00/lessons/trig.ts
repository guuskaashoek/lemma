/**
 * Lesson 10: sine, cosine and tangent in a right triangle (SOS CAS TOA).
 */
import type { Lesson } from "@/content/types";
import { L } from "../helpers";

export const trigLesson: Lesson = {
  id: "u0.sos-cas-toa",
  title: L("SOS CAS TOA", "SOH CAH TOA"),
  goal: L(
    "Je kiest sinus, cosinus of tangens en berekent daarmee een zijde of een hoek.",
    "You choose sine, cosine or tangent and use it to work out a side or an angle.",
  ),
  minutes: 10,
  calculator: "allowed",
  calculatorOffReason: L(
    "Bij deze opgave staat de rekenmachine uit. Die reken je met de hand.",
    "The calculator is off for this exercise. You do this one by hand.",
  ),
  info: {
    what: L(
      "In een rechthoekige driehoek hoort bij elke hoek een vaste verhouding tussen de zijden: sinus, cosinus en tangens.",
      "In a right triangle each angle comes with fixed ratios between the sides: sine, cosine and tangent.",
    ),
    why: L(
      "Met één hoek en één zijde reken je de andere zijden uit. Zo meet je hoogtes en hellingen die je niet kunt meten.",
      "With one angle and one side you work out the other sides. That is how you measure heights and slopes you cannot reach.",
    ),
    later: L(
      "Bij de eenheidscirkel, golven en goniometrische functies. In AI zitten sinus en cosinus in de manier waarop taalmodellen de volgorde van woorden onthouden.",
      "In the unit circle, waves and trigonometric functions. In AI, sine and cosine are part of how language models keep track of word order.",
    ),
  },
  screens: [
    {
      kind: "visual",
      title: L("Zijden vanuit de hoek", "Sides seen from the angle"),
      body: L(
        "Kijk vanuit de hoek die je kent (niet de rechte hoek).\n**Overstaand**: de zijde tegenover die hoek.\n**Aanliggend**: de zijde die tegen de hoek aan ligt.\n**Schuin**: de langste zijde, tegenover de rechte hoek.",
        "Look from the angle you know (not the right angle).\n**Opposite**: the side across from that angle.\n**Adjacent**: the side that touches the angle.\n**Hypotenuse**: the longest side, across from the right angle.",
      ),
      visual: { kind: "right-triangle", angle: 35, show: [], interactive: true },
      task: L(
        "Zoek de hoek met de boog. Welke zijde ligt er tegenover? Welke zijde raakt hem?",
        "Find the angle with the arc. Which side is across from it? Which side touches it?",
      ),
    },
    {
      kind: "visual",
      title: L("Draai aan de hoek", "Turn the angle"),
      body: L(
        "De schuine zijde is hier altijd $10$.\nMaak de hoek groter: de overstaande zijde groeit, de aanliggende krimpt.\nBij dezelfde hoek hoort altijd dezelfde verhouding.",
        "The hypotenuse is always $10$ here.\nMake the angle bigger: the opposite side grows, the adjacent side shrinks.\nThe same angle always gives the same ratio.",
      ),
      visual: { kind: "right-triangle", angle: 30, show: ["sin", "cos", "tan"], interactive: true },
      task: L("Zet de hoek op $30^{\\circ}$. Hoe lang is de overstaande zijde? Probeer daarna $60^{\\circ}$.", "Set the angle to $30^{\\circ}$. How long is the opposite side? Then try $60^{\\circ}$."),
    },
    {
      kind: "explain",
      title: L("SOS CAS TOA", "SOH CAH TOA"),
      body: L(
        "Onthoud de drie woorden hieronder.\nDe eerste letter is de verhouding. Dan boven, dan onder.\nSOS: **S**inus = **O**verstaand / **S**chuin.\nZie [[rule:u0.sos-cas-toa]].",
        "Remember the three words below.\nThe first letter is the ratio. Then top, then bottom.\nSOH: **S**ine = **O**pposite / **H**ypotenuse.\nSee [[rule:u0.sos-cas-toa]].",
      ),
      mnemonic: "soscastoa",
      ruleId: "u0.sos-cas-toa",
    },
    {
      kind: "example",
      title: L("Voorbeeld: een zijde", "Example: a side"),
      problem: L(
        "De hoek is $35^{\\circ}$ en de schuine zijde is $12$. Hoe lang is de overstaande zijde $x$?",
        "The angle is $35^{\\circ}$ and the hypotenuse is $12$. How long is the opposite side $x$?",
      ),
      visual: { kind: "right-triangle", angle: 35, show: ["sin"], interactive: false },
      solution: {
        steps: [
          { latex: "\\sin(35^{\\circ})=\\frac{x}{12}", note: L("Overstaand en schuin: SOS.", "Opposite and hypotenuse: SOH.") },
          { latex: "x=\\hl{12\\cdot\\sin(35^{\\circ})}", note: L("Keer $12$, links en rechts.", "Times $12$, on both sides.") },
          { latex: "x\\approx \\ask{6.9}", note: L("Met de rekenmachine op graden.", "With the calculator in degrees."), approx: { decimals: 1 } },
        ],
        solutions: [{ x: 12 * Math.sin((35 * Math.PI) / 180) }],
      },
    },
    {
      kind: "example",
      title: L("Voorbeeld: $x$ onder de streep", "Example: $x$ at the bottom"),
      problem: L(
        "De hoek is $40^{\\circ}$ en de aanliggende zijde is $8$. Hoe lang is de schuine zijde $x$?",
        "The angle is $40^{\\circ}$ and the adjacent side is $8$. How long is the hypotenuse $x$?",
      ),
      visual: { kind: "right-triangle", angle: 40, show: ["cos"], interactive: false },
      solution: {
        steps: [
          { latex: "\\cos(40^{\\circ})=\\frac{8}{x}", note: L("Aanliggend en schuin: CAS. Nu staat $x$ onder de streep.", "Adjacent and hypotenuse: CAH. Now $x$ is at the bottom.") },
          {
            latex: "x=\\hl{\\frac{8}{\\cos(40^{\\circ})}}",
            note: L(
              "Links en rechts keer $x$. Deel dan links en rechts door $\\cos(40^{\\circ})$. Kort: $x$ en $\\cos(40^{\\circ})$ ruilen van plek.",
              "Both sides times $x$. Then divide both sides by $\\cos(40^{\\circ})$. In short: $x$ and $\\cos(40^{\\circ})$ swap places.",
            ),
          },
          { latex: "x\\approx \\ask{10.4}", note: L("Met de rekenmachine op graden.", "With the calculator in degrees."), approx: { decimals: 1 } },
        ],
        solutions: [{ x: 8 / Math.cos((40 * Math.PI) / 180) }],
      },
    },
    {
      kind: "explain",
      title: L("Rekenmachine op graden", "Calculator in degrees"),
      body: L(
        "Hoeken meet je hier in graden. Zet de rekenmachine op **DEG**.\nStaat hij op RAD? Dan klopt je antwoord niet.\nTest: $\\sin(30^{\\circ})$ moet $0.5$ geven.",
        "Here angles are in degrees. Set the calculator to **DEG**.\nIs it on RAD? Then your answer is wrong.\nTest: $\\sin(30^{\\circ})$ must give $0.5$.",
      ),
    },
    {
      kind: "explain",
      title: L("Een hoek terugrekenen", "Working back to an angle"),
      body: L(
        "Ken je twee zijden en zoek je de hoek? Werk dan andersom.\nKies eerst SOS, CAS of TOA.\nGebruik dan $\\sin^{-1}$, $\\cos^{-1}$ of $\\tan^{-1}$ (shift sin, shift cos, shift tan).\nZie [[rule:u0.inverse-trig]].",
        "Know two sides and looking for the angle? Then work backwards.\nFirst choose SOH, CAH or TOA.\nThen use $\\sin^{-1}$, $\\cos^{-1}$ or $\\tan^{-1}$ (shift sin, shift cos, shift tan).\nSee [[rule:u0.inverse-trig]].",
      ),
      ruleId: "u0.inverse-trig",
    },
    {
      kind: "example",
      title: L("Voorbeeld: een hoek", "Example: an angle"),
      problem: L("Overstaand is $5$ en aanliggend is $8$. Hoe groot is hoek $A$?", "Opposite is $5$ and adjacent is $8$. How big is angle $A$?"),
      visual: { kind: "right-triangle", angle: 32, show: ["tan"], interactive: true },
      solution: {
        steps: [
          { latex: "\\tan(A^{\\circ})=\\frac{5}{8}", note: L("Overstaand en aanliggend: TOA.", "Opposite and adjacent: TOA.") },
          { latex: "A^{\\circ}=\\tan^{-1}\\left(\\ask{\\frac{5}{8}}\\right)", note: L("Terugrekenen. De rekenmachine geeft $A\\approx 32.0$.", "Work back. The calculator gives $A\\approx 32.0$.") },
        ],
        solutions: [{ A: (Math.atan(5 / 8) * 180) / Math.PI }],
      },
    },
  ],
  practice: [
    { generatorId: "u0.sohcahtoa-choose", difficulty: 1, count: 1 },
    { generatorId: "u0.sohcahtoa-choose", difficulty: 2, count: 1 },
    { generatorId: "u0.sohcahtoa-side", difficulty: 1, count: 2 },
    { generatorId: "u0.sohcahtoa-side", difficulty: 2, count: 1 },
    { generatorId: "u0.sohcahtoa-angle", difficulty: 1, count: 1 },
    { generatorId: "u0.sohcahtoa-angle", difficulty: 2, count: 1 },
    { generatorId: "u0.sohcahtoa-side", difficulty: 3, count: 1 },
    { generatorId: "u0.sohcahtoa-angle", difficulty: 3, count: 1 },
  ],
};
