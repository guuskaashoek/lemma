/**
 * Rule cards of unit 0. Each card's example is checked by the tests.
 */
import type { RuleCard } from "@/content/types";
import { L } from "./helpers";

export const rules: RuleCard[] = [
  // Lesson 1 -----------------------------------------------------------------
  {
    id: "u0.split-multiply",
    name: L("Splitsen", "Splitting"),
    statement: L(
      "Knip een getal in tientallen en eenheden. Reken elk stuk uit. Tel de stukken op.",
      "Cut a number into tens and ones. Work out each part. Add the parts.",
    ),
    latex: "a\\cdot(b+c)=a\\cdot b+a\\cdot c",
    lessonId: "u0.order-of-operations",
    example: {
      problem: L("Bereken $6\\cdot 23$.", "Work out $6\\cdot 23$."),
      steps: [
        { latex: "6\\cdot 23", note: L("Dit is de som.", "This is the sum.") },
        { latex: "6\\cdot(\\hl{20+3})", note: L("Splits $23$ in $20+3$.", "Split $23$ into $20+3$.") },
        { latex: "\\hl{120}+\\hl{18}", note: L("$6\\cdot 20=120$ en $6\\cdot 3=18$.", "$6\\cdot 20=120$ and $6\\cdot 3=18$.") },
        { latex: "\\hl{138}", note: L("Tel op.", "Add.") },
      ],
    },
  },
  {
    id: "u0.order-of-operations",
    name: L("Rekenvolgorde", "Order of operations"),
    statement: L(
      "Eerst haakjes. Dan machten en wortels. Dan keer en gedeeld door. Tot slot plus en min. Bij gelijke stappen: van links naar rechts.",
      "First brackets. Then powers and roots. Then multiply and divide. Finally add and subtract. Equal steps: from left to right.",
    ),
    mnemonic: "hmwvdoa",
    lessonId: "u0.order-of-operations",
    example: {
      problem: L("Bereken $2+3\\cdot 4$.", "Work out $2+3\\cdot 4$."),
      steps: [
        { latex: "2+3\\cdot 4", note: L("Keer gaat vóór plus.", "Multiply comes before add.") },
        { latex: "2+\\hl{12}", note: L("Eerst $3\\cdot 4=12$.", "First $3\\cdot 4=12$.") },
        { latex: "\\hl{14}", note: L("Dan de plus.", "Then the addition.") },
      ],
    },
  },

  // Lesson 2 -----------------------------------------------------------------
  {
    id: "u0.simplify-fraction",
    name: L("Vereenvoudigen", "Simplifying"),
    statement: L(
      "Deel teller en noemer door hetzelfde getal. De breuk blijft even groot. Ga door tot het niet meer kan.",
      "Divide numerator and denominator by the same number. The fraction stays the same size. Keep going until you cannot.",
    ),
    latex: "\\frac{a\\cdot k}{b\\cdot k}=\\frac{a}{b}",
    lessonId: "u0.fractions",
    example: {
      problem: L("Vereenvoudig $\\frac{12}{18}$.", "Simplify $\\frac{12}{18}$."),
      steps: [
        { latex: "\\frac{12}{18}", note: L("$12$ en $18$ zitten in de tafel van $6$.", "$12$ and $18$ are in the times table of $6$.") },
        { latex: "\\frac{\\hl{12:6}}{\\hl{18:6}}", note: L("Deel boven en onder door $6$.", "Divide top and bottom by $6$.") },
        { latex: "\\frac{\\hl{2}}{\\hl{3}}", note: L("Klaar: $2$ en $3$ hebben geen deler samen.", "Done: $2$ and $3$ share no divisor.") },
      ],
    },
  },
  {
    id: "u0.fraction-of",
    name: L("Breuk van een getal", "Fraction of a number"),
    statement: L(
      "Van betekent keer. Deel door de noemer en doe keer de teller.",
      "Of means times. Divide by the denominator and multiply by the numerator.",
    ),
    latex: "\\frac{a}{b}\\cdot n=\\frac{n}{b}\\cdot a",
    lessonId: "u0.fractions",
    example: {
      problem: L("Hoeveel is $\\frac{3}{4}$ van $20$?", "What is $\\frac{3}{4}$ of $20$?"),
      steps: [
        { latex: "\\frac{3}{4}\\cdot 20", note: L("Van betekent keer.", "Of means times.") },
        { latex: "\\hl{\\frac{20}{4}}\\cdot 3", note: L("Deel door de noemer $4$.", "Divide by the denominator $4$.") },
        { latex: "\\hl{5}\\cdot 3", note: L("Eén groepje is $5$.", "One group is $5$.") },
        { latex: "\\hl{15}", note: L("Neem $3$ groepjes.", "Take $3$ groups.") },
      ],
    },
  },
  {
    id: "u0.add-fractions",
    name: L("Breuken optellen", "Adding fractions"),
    statement: L(
      "Maak eerst de noemers gelijk: boven en onder keer hetzelfde getal. Tel dan alleen de tellers op. De noemer blijft hetzelfde.",
      "First make the denominators equal: top and bottom times the same number. Then add only the numerators. The denominator stays the same.",
    ),
    latex: "\\frac{a}{n}+\\frac{b}{n}=\\frac{a+b}{n}",
    lessonId: "u0.fractions",
    example: {
      problem: L("Bereken $\\frac{1}{2}+\\frac{1}{3}$.", "Work out $\\frac{1}{2}+\\frac{1}{3}$."),
      steps: [
        { latex: "\\frac{1}{2}+\\frac{1}{3}", note: L("Noemers $2$ en $3$ zijn niet gelijk.", "Denominators $2$ and $3$ are not equal.") },
        {
          latex: "\\hl{\\frac{3}{6}}+\\hl{\\frac{2}{6}}",
          note: L("Maak van beide noemers $6$: $\\frac{1}{2}$ boven en onder keer $3$, $\\frac{1}{3}$ boven en onder keer $2$.", "Make both denominators $6$: $\\frac{1}{2}$ top and bottom times $3$, $\\frac{1}{3}$ top and bottom times $2$."),
        },
        { latex: "\\frac{\\hl{5}}{6}", note: L("Tel de tellers op.", "Add the numerators.") },
      ],
    },
  },

  // Lesson 3 -----------------------------------------------------------------
  {
    id: "u0.times-ten",
    name: L("Cijfers schuiven", "Moving the digits"),
    statement: L(
      "Keer $10$, $100$, $1000$: de cijfers schuiven $1$, $2$, $3$ plekken naar links. Gedeeld door: naar rechts.",
      "Times $10$, $100$, $1000$: the digits move $1$, $2$, $3$ places to the left. Divided by: to the right.",
    ),
    lessonId: "u0.decimals",
    example: {
      problem: L("Bereken $3.75\\cdot 100$.", "Work out $3.75\\cdot 100$."),
      steps: [
        { latex: "3.75\\cdot 100", note: L("$100$ heeft twee nullen.", "$100$ has two zeros.") },
        { latex: "\\hl{37.5}\\cdot 10", note: L("Eén plek naar links.", "One place to the left.") },
        { latex: "\\hl{375}", note: L("Nog één plek.", "One more place.") },
      ],
    },
  },
  {
    id: "u0.decimal-fraction",
    name: L("Kommagetal en breuk", "Decimal and fraction"),
    statement: L(
      "Eén cijfer achter de komma: tienden. Twee cijfers: honderdsten. Breuk naar kommagetal: maak de noemer $10$, $100$ of $1000$.",
      "One digit after the point: tenths. Two digits: hundredths. Fraction to decimal: make the denominator $10$, $100$ or $1000$.",
    ),
    latex: "0.35=\\frac{35}{100}",
    lessonId: "u0.decimals",
    example: {
      problem: L("Schrijf $\\frac{3}{4}$ als kommagetal.", "Write $\\frac{3}{4}$ as a decimal."),
      steps: [
        { latex: "\\frac{3}{4}", note: L("Maak de noemer $100$.", "Make the denominator $100$.") },
        { latex: "\\frac{\\hl{3\\cdot 25}}{\\hl{4\\cdot 25}}", note: L("Boven en onder keer $25$.", "Top and bottom times $25$.") },
        { latex: "\\frac{\\hl{75}}{100}", note: L("$75$ honderdsten.", "$75$ hundredths.") },
        { latex: "\\hl{0.75}", note: L("Als kommagetal.", "As a decimal.") },
      ],
    },
  },
  {
    id: "u0.decimal-arithmetic",
    name: L("Rekenen met kommagetallen", "Calculating with decimals"),
    statement: L(
      "Optellen en aftrekken: komma's onder elkaar. Keer: reken zonder komma en tel daarna de cijfers achter de komma van beide getallen.",
      "Adding and subtracting: line up the points. Multiplying: calculate without points, then count the decimals of both numbers.",
    ),
    lessonId: "u0.decimals",
    example: {
      problem: L("Bereken $0.3\\cdot 0.4$.", "Work out $0.3\\cdot 0.4$."),
      steps: [
        { latex: "0.3\\cdot 0.4", note: L("Reken eerst $3\\cdot 4$.", "First work out $3\\cdot 4$.") },
        { latex: "\\frac{\\hl{12}}{100}", note: L("$3\\cdot 4=12$. Samen twee cijfers achter de komma.", "$3\\cdot 4=12$. Two decimals in total.") },
        { latex: "\\hl{0.12}", note: L("Dus $0.12$.", "So $0.12$.") },
      ],
    },
  },

  // Lesson 4 -----------------------------------------------------------------
  {
    id: "u0.ratio-table",
    name: L("Verhoudingstabel", "Ratio table"),
    statement: L(
      "Wat je boven doet, doe je onder ook. Alleen keer en gedeeld door. Lastig getal? Ga eerst naar $1$.",
      "Whatever you do on top, you also do below. Only multiply and divide. Awkward number? First go to $1$.",
    ),
    lessonId: "u0.ratios",
    example: {
      problem: L("$3$ pakken kosten $4.50$ euro. Wat kosten $7$ pakken?", "$3$ cartons cost $4.50$ euros. What do $7$ cartons cost?"),
      steps: [
        { latex: "4.5:3\\cdot 7", note: L("Eerst naar $1$ pak, dan naar $7$.", "First to $1$ carton, then to $7$.") },
        { latex: "\\hl{1.5}\\cdot 7", note: L("$1$ pak kost $1.50$ euro.", "$1$ carton costs $1.50$ euros.") },
        { latex: "\\hl{10.5}", note: L("$7$ pakken kosten $10.50$ euro.", "$7$ cartons cost $10.50$ euros.") },
      ],
    },
  },
  {
    id: "u0.ratio-share",
    name: L("Verdelen", "Sharing"),
    statement: L(
      "Tel de delen van de verhouding op. Deel het totaal door die som: dat is één groepje. Doe keer het aantal groepjes.",
      "Add the parts of the ratio. Divide the total by that sum: that is one group. Multiply by the number of groups.",
    ),
    latex: "\\frac{T}{p+q}\\cdot p",
    lessonId: "u0.ratios",
    example: {
      problem: L("Verdeel $40$ in de verhouding $2:3$. Hoeveel is het eerste deel?", "Share $40$ in the ratio $2:3$. How much is the first share?"),
      steps: [
        { latex: "\\frac{40}{2+3}\\cdot 2", note: L("$2+3=5$ groepjes.", "$2+3=5$ groups.") },
        { latex: "\\hl{8}\\cdot 2", note: L("Eén groepje is $8$.", "One group is $8$.") },
        { latex: "\\hl{16}", note: L("Twee groepjes.", "Two groups.") },
      ],
    },
  },

  // Lesson 5 -----------------------------------------------------------------
  {
    id: "u0.percent",
    name: L("Procent", "Per cent"),
    statement: L(
      "Procent betekent per honderd. $p\\%$ van iets is $\\frac{p}{100}$ keer dat. Hoeveel procent: deel gedeeld door geheel, keer $100$.",
      "Per cent means per hundred. $p\\%$ of something is $\\frac{p}{100}$ times it. What percentage: part divided by whole, times $100$.",
    ),
    latex: "p\\%=\\frac{p}{100}",
    lessonId: "u0.percentages",
    example: {
      problem: L("Hoeveel is $35\\%$ van $60$?", "What is $35\\%$ of $60$?"),
      steps: [
        { latex: "35\\%\\cdot 60", note: L("Van betekent keer.", "Of means times.") },
        { latex: "\\hl{0.35}\\cdot 60", note: L("$35\\%$ is $0.35$.", "$35\\%$ is $0.35$.") },
        { latex: "\\hl{21}", note: L("Reken uit.", "Work it out.") },
      ],
    },
  },
  {
    id: "u0.growth-factor",
    name: L("Groeifactor", "Growth factor"),
    statement: L(
      "Er gaat $p\\%$ af: doe keer $\\frac{100-p}{100}$. Er komt $p\\%$ bij: doe keer $\\frac{100+p}{100}$. Terug naar het begin: deel door de groeifactor.",
      "$p\\%$ off: multiply by $\\frac{100-p}{100}$. $p\\%$ added: multiply by $\\frac{100+p}{100}$. Back to the start: divide by the growth factor.",
    ),
    latex: "N=g\\cdot B",
    lessonId: "u0.percentages",
    example: {
      problem: L("Een jas van $80$ euro krijgt $25\\%$ korting. Wat is de nieuwe prijs?", "A coat of $80$ euros gets $25\\%$ off. What is the new price?"),
      steps: [
        { latex: "80\\cdot\\frac{100-25}{100}", note: L("Je houdt $75\\%$ over.", "You keep $75\\%$.") },
        { latex: "80\\cdot\\hl{0.75}", note: L("De groeifactor is $0.75$.", "The growth factor is $0.75$.") },
        { latex: "\\hl{60}", note: L("De nieuwe prijs is $60$ euro.", "The new price is $60$ euros.") },
      ],
    },
  },

  // Lesson 6 -----------------------------------------------------------------
  {
    id: "u0.unit-stairs",
    name: L("Metriek trapje", "Metric staircase"),
    statement: L(
      "km, hm, dam, m, dm, cm, mm. Een trede omlaag: keer $10$. Een trede omhoog: gedeeld door $10$. Gewicht en inhoud werken net zo.",
      "km, hm, dam, m, dm, cm, mm. One stair down: times $10$. One stair up: divided by $10$. Mass and volume work the same way.",
    ),
    lessonId: "u0.units",
    example: {
      problem: L("Reken $2.5$ km om naar m.", "Convert $2.5$ km to m."),
      steps: [
        { latex: "2.5\\cdot 10\\cdot 10\\cdot 10", note: L("Van km naar m: drie treden omlaag.", "From km to m: three stairs down.") },
        { latex: "\\hl{2500}", note: L("$2.5$ km $=2500$ m.", "$2.5$ km $=2500$ m.") },
      ],
    },
  },
  {
    id: "u0.area-units",
    name: L("Trapje voor m² en m³", "Staircase for m² and m³"),
    statement: L(
      "Oppervlakte: elke trede keer $100$. Inhoud in m³, dm³, cm³: elke trede keer $1000$. $1$ dm³ $=1$ L.",
      "Area: every stair times $100$. Volume in m³, dm³, cm³: every stair times $1000$. $1$ dm³ $=1$ L.",
    ),
    lessonId: "u0.units",
    example: {
      problem: L("Reken $3$ dm² om naar cm².", "Convert $3$ dm² to cm²."),
      steps: [
        { latex: "3\\cdot 100", note: L("Eén trede omlaag: keer $100$.", "One stair down: times $100$.") },
        { latex: "\\hl{300}", note: L("$3$ dm² $=300$ cm².", "$3$ dm² $=300$ cm².") },
      ],
    },
  },

  // Lesson 7 -----------------------------------------------------------------
  {
    id: "u0.substitute",
    name: L("Formule invullen", "Filling in a formula"),
    statement: L(
      "Vervang elke letter door zijn getal. Een getal vlak voor een letter betekent keer: $2a=2\\cdot a$. Reken uit met de rekenvolgorde.",
      "Replace every letter by its number. A number right before a letter means times: $2a=2\\cdot a$. Work it out with the order of operations.",
    ),
    lessonId: "u0.formulas",
    example: {
      problem: L("Bereken $F$ met $F=1.8C+32$ als $C=25$.", "Work out $F$ with $F=1.8C+32$ when $C=25$."),
      steps: [
        { latex: "F=1.8\\cdot\\hl{25}+32", note: L("Vul in. $1.8C$ betekent $1.8\\cdot C$.", "Fill in. $1.8C$ means $1.8\\cdot C$.") },
        { latex: "F=\\hl{45}+32", note: L("Eerst keer.", "First multiply.") },
        { latex: "F=\\hl{77}", note: L("Dan plus.", "Then add.") },
      ],
      solutions: [{ F: 77 }],
    },
  },
  {
    id: "u0.read-table",
    name: L("Startgetal en stap", "Start and step"),
    statement: L(
      "Komt er steeds hetzelfde bij? Dan is $y=\\text{start}+\\text{stap}\\cdot x$. Het startgetal hoort bij $x=0$. De grafiek is een rechte lijn.",
      "Is the same added every time? Then $y=\\text{start}+\\text{step}\\cdot x$. The starting number goes with $x=0$. The graph is a straight line.",
    ),
    lessonId: "u0.formulas",
    example: {
      problem: L("Start $4$, stap $2$. Welke $y$ hoort bij $x=20$?", "Start $4$, step $2$. Which $y$ goes with $x=20$?"),
      steps: [
        { latex: "y=4+2\\cdot 20", note: L("Start plus $20$ stappen.", "Start plus $20$ steps.") },
        { latex: "y=\\hl{44}", note: L("Reken uit.", "Work it out.") },
      ],
      solutions: [{ y: 44 }],
    },
  },

  // Lesson 8 -----------------------------------------------------------------
  {
    id: "u0.perimeter",
    name: L("Omtrek", "Perimeter"),
    statement: L(
      "De omtrek is de lengte van de rand. Rechthoek: tel alle zijden op. Cirkel: $\\pi\\cdot d$, met $d$ de diameter.",
      "The perimeter is the length of the edge. Rectangle: add all sides. Circle: $\\pi\\cdot d$, with $d$ the diameter.",
    ),
    latex: "O_{\\text{cirkel}}=\\pi\\cdot d",
    lessonId: "u0.perimeter-area-volume",
    example: {
      problem: L("Een rechthoek is $7$ bij $4$ cm. Wat is de omtrek?", "A rectangle is $7$ by $4$ cm. What is the perimeter?"),
      steps: [
        { latex: "7+4+7+4", note: L("Loop één keer rond.", "Walk around once.") },
        { latex: "\\hl{22}", note: L("De omtrek is $22$ cm.", "The perimeter is $22$ cm.") },
      ],
    },
  },
  {
    id: "u0.area",
    name: L("Oppervlakte", "Area"),
    statement: L(
      "Rechthoek: lengte keer breedte. Driehoek: $\\frac{1}{2}\\cdot$ basis $\\cdot$ hoogte. Cirkel: $\\pi\\cdot r^2$.",
      "Rectangle: length times width. Triangle: $\\frac{1}{2}\\cdot$ base $\\cdot$ height. Circle: $\\pi\\cdot r^2$.",
    ),
    latex: "A_{\\text{cirkel}}=\\pi\\cdot r^{2}",
    lessonId: "u0.perimeter-area-volume",
    example: {
      problem: L("Een driehoek heeft basis $6$ cm en hoogte $4$ cm. Wat is de oppervlakte?", "A triangle has base $6$ cm and height $4$ cm. What is the area?"),
      steps: [
        { latex: "\\frac{1}{2}\\cdot 6\\cdot 4", note: L("De helft van de rechthoek eromheen.", "Half of the rectangle around it.") },
        { latex: "\\frac{1}{2}\\cdot\\hl{24}", note: L("Basis keer hoogte.", "Base times height.") },
        { latex: "\\hl{12}", note: L("De oppervlakte is $12$ cm².", "The area is $12$ cm².") },
      ],
    },
  },
  {
    id: "u0.volume",
    name: L("Inhoud", "Volume"),
    statement: L(
      "Balk: lengte keer breedte keer hoogte. Cilinder: $\\pi\\cdot r^2\\cdot h$. $1$ dm³ is $1$ liter.",
      "Box: length times width times height. Cylinder: $\\pi\\cdot r^2\\cdot h$. $1$ dm³ is $1$ litre.",
    ),
    latex: "V_{\\text{balk}}=l\\cdot b\\cdot h",
    lessonId: "u0.perimeter-area-volume",
    example: {
      problem: L("Een doos is $4$ bij $3$ bij $5$ dm. Hoeveel liter past erin?", "A box is $4$ by $3$ by $5$ dm. How many litres fit in it?"),
      steps: [
        { latex: "4\\cdot 3\\cdot 5", note: L("Lengte keer breedte keer hoogte.", "Length times width times height.") },
        { latex: "\\hl{60}", note: L("$60$ dm³ is $60$ liter.", "$60$ dm³ is $60$ litres.") },
      ],
    },
  },

  // Lesson 9 -----------------------------------------------------------------
  {
    id: "u0.pythagoras",
    name: L("Pythagoras", "Pythagoras"),
    statement: L(
      "In een rechthoekige driehoek: $a^2+b^2=c^2$, met $c$ de schuine zijde. Schuine zijde: tel de kwadraten op. Korte zijde: trek af. Neem daarna de wortel.",
      "In a right triangle: $a^2+b^2=c^2$, with $c$ the hypotenuse. Hypotenuse: add the squares. Short side: subtract. Then take the square root.",
    ),
    latex: "a^{2}+b^{2}=c^{2}",
    lessonId: "u0.pythagoras",
    example: {
      problem: L("De rechthoekszijden zijn $3$ en $4$. Hoe lang is de schuine zijde?", "The legs are $3$ and $4$. How long is the hypotenuse?"),
      steps: [
        { latex: "\\sqrt{3^{2}+4^{2}}", note: L("Kwadrateer en tel op.", "Square and add.") },
        { latex: "\\sqrt{\\hl{25}}", note: L("$9+16=25$.", "$9+16=25$.") },
        { latex: "\\hl{5}", note: L("Neem de wortel.", "Take the square root.") },
      ],
    },
  },

  // Lesson 10 ----------------------------------------------------------------
  {
    id: "u0.sos-cas-toa",
    name: L("SOS CAS TOA", "SOH CAH TOA"),
    statement: L(
      "In een rechthoekige driehoek: sinus = overstaand / schuin, cosinus = aanliggend / schuin, tangens = overstaand / aanliggend.",
      "In a right triangle: sine = opposite / hypotenuse, cosine = adjacent / hypotenuse, tangent = opposite / adjacent.",
    ),
    mnemonic: "soscastoa",
    lessonId: "u0.sos-cas-toa",
    example: {
      problem: L(
        "De schuine zijde is $10$, de hoek is $30^{\\circ}$. Hoe lang is de overstaande zijde $x$?",
        "The hypotenuse is $10$ and the angle is $30^{\\circ}$. How long is the opposite side $x$?",
      ),
      steps: [
        { latex: "\\sin(30^{\\circ})=\\frac{x}{10}", note: L("SOS: overstaand en schuin.", "SOH: opposite and hypotenuse.") },
        { latex: "x=\\hl{10\\cdot\\sin(30^{\\circ})}", note: L("Keer $10$, links en rechts.", "Times $10$, on both sides.") },
        { latex: "x=\\hl{5}", note: L("$\\sin(30^{\\circ})=0.5$, dus $x=5$.", "$\\sin(30^{\\circ})=0.5$, so $x=5$.") },
      ],
      solutions: [{ x: 5 }],
    },
  },
  {
    id: "u0.inverse-trig",
    name: L("Hoek terugrekenen", "Finding the angle"),
    statement: L(
      "Ken je twee zijden? Kies SOS, CAS of TOA. Reken de hoek terug met $\\sin^{-1}$, $\\cos^{-1}$ of $\\tan^{-1}$. Rekenmachine op graden (DEG).",
      "Know two sides? Choose SOH, CAH or TOA. Work back to the angle with $\\sin^{-1}$, $\\cos^{-1}$ or $\\tan^{-1}$. Calculator in degrees (DEG).",
    ),
    mnemonic: "soscastoa",
    lessonId: "u0.sos-cas-toa",
    example: {
      problem: L("Overstaand is $5$ en aanliggend is $5$. Hoe groot is hoek $A$?", "Opposite is $5$ and adjacent is $5$. How big is angle $A$?"),
      steps: [
        { latex: "\\tan(A^{\\circ})=\\frac{5}{5}", note: L("TOA: overstaand en aanliggend.", "TOA: opposite and adjacent.") },
        { latex: "\\tan(A^{\\circ})=\\hl{1}", note: L("Vereenvoudig.", "Simplify.") },
        { latex: "A^{\\circ}=\\hl{\\tan^{-1}(1)}", note: L("Terugrekenen: $\\tan^{-1}(1)=45^{\\circ}$.", "Work back: $\\tan^{-1}(1)=45^{\\circ}$.") },
      ],
      solutions: [{ A: 45 }],
    },
  },
];
