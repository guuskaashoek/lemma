/**
 * Calculator buttons with their explanations.
 *
 * Every button explains what it does, when you use it, and gives a tiny
 * example, in both languages. `insert` is what the button types into the
 * display.
 */
import type { Loc } from "@/i18n/locale";

export type CalcButton = {
  label: string;
  insert?: string;
  action?: "equals" | "clear" | "backspace";
  what: Loc;
  when: Loc;
  example?: string;
  kind?: "digit" | "op" | "fn" | "action";
};

const digit = (d: string): CalcButton => ({
  label: d,
  insert: d,
  kind: "digit",
  what: { nl: `Het cijfer ${d}.`, en: `The digit ${d}.` },
  when: { nl: "Om getallen te typen.", en: "To type numbers." },
});

export const CALC_BUTTONS: CalcButton[][] = [
  [
    {
      label: "sin",
      insert: "sin(",
      kind: "fn",
      what: { nl: "Sinus van een hoek.", en: "Sine of an angle." },
      when: {
        nl: "SOS: overstaande zijde gedeeld door schuine zijde. Let op graden of radialen.",
        en: "SOH: opposite divided by hypotenuse. Check degrees or radians.",
      },
      example: "sin(30) = 0,5",
    },
    {
      label: "cos",
      insert: "cos(",
      kind: "fn",
      what: { nl: "Cosinus van een hoek.", en: "Cosine of an angle." },
      when: { nl: "CAS: aanliggende zijde gedeeld door schuine zijde.", en: "CAH: adjacent divided by hypotenuse." },
      example: "cos(60) = 0,5",
    },
    {
      label: "tan",
      insert: "tan(",
      kind: "fn",
      what: { nl: "Tangens van een hoek.", en: "Tangent of an angle." },
      when: { nl: "TOA: overstaande zijde gedeeld door aanliggende zijde.", en: "TOA: opposite divided by adjacent." },
      example: "tan(45) = 1",
    },
    {
      label: "(",
      insert: "(",
      kind: "op",
      what: { nl: "Haakje openen.", en: "Open bracket." },
      when: { nl: "Als iets eerst moet. Haakjes gaan altijd voor.", en: "When something must go first. Brackets always come first." },
      example: "(2+3)×4 = 20",
    },
    {
      label: ")",
      insert: ")",
      kind: "op",
      what: { nl: "Haakje sluiten.", en: "Close bracket." },
      when: { nl: "Sluit elk haakje dat je opende.", en: "Close every bracket you opened." },
    },
    {
      label: "⌫",
      action: "backspace",
      kind: "action",
      what: { nl: "Wis het laatste teken.", en: "Delete the last character." },
      when: { nl: "Bij een tikfout.", en: "After a typo." },
    },
  ],
  [
    {
      label: "sin⁻¹",
      insert: "asin(",
      kind: "fn",
      what: { nl: "Inverse sinus: van verhouding terug naar hoek.", en: "Inverse sine: from ratio back to angle." },
      when: { nl: "Als je de zijden weet en de hoek zoekt.", en: "When you know the sides and want the angle." },
      example: "sin⁻¹(0,5) = 30",
    },
    {
      label: "cos⁻¹",
      insert: "acos(",
      kind: "fn",
      what: { nl: "Inverse cosinus: van verhouding terug naar hoek.", en: "Inverse cosine: from ratio back to angle." },
      when: { nl: "Hoek zoeken met aanliggend en schuin.", en: "Finding an angle from adjacent and hypotenuse." },
      example: "cos⁻¹(0,5) = 60",
    },
    {
      label: "tan⁻¹",
      insert: "atan(",
      kind: "fn",
      what: { nl: "Inverse tangens: van verhouding terug naar hoek.", en: "Inverse tangent: from ratio back to angle." },
      when: { nl: "Hoek zoeken met overstaand en aanliggend.", en: "Finding an angle from opposite and adjacent." },
      example: "tan⁻¹(1) = 45",
    },
    {
      label: "x²",
      insert: "²",
      kind: "op",
      what: { nl: "Kwadraat: een getal keer zichzelf.", en: "Square: a number times itself." },
      when: { nl: "Bijvoorbeeld bij Pythagoras.", en: "For example with Pythagoras." },
      example: "5² = 25",
    },
    {
      label: "xʸ",
      insert: "^",
      kind: "op",
      what: { nl: "Macht: grondtal tot de macht exponent.", en: "Power: base to the power of the exponent." },
      when: { nl: "Bij machten en groei.", en: "For powers and growth." },
      example: "2^5 = 32",
    },
    {
      label: "AC",
      action: "clear",
      kind: "action",
      what: { nl: "Alles wissen.", en: "Clear everything." },
      when: { nl: "Om opnieuw te beginnen.", en: "To start over." },
    },
  ],
  [
    {
      label: "√",
      insert: "√(",
      kind: "fn",
      what: { nl: "Wortel: welk getal keer zichzelf geeft dit?", en: "Square root: which number times itself gives this?" },
      when: { nl: "Bijvoorbeeld de laatste stap van Pythagoras.", en: "For example the last step of Pythagoras." },
      example: "√(16) = 4",
    },
    digit("7"),
    digit("8"),
    digit("9"),
    {
      label: "÷",
      insert: "÷",
      kind: "op",
      what: { nl: "Delen (op school ook  :  ).", en: "Divide." },
      when: { nl: "Gaat vóór plus en min.", en: "Comes before add and subtract." },
      example: "12÷4 = 3",
    },
    {
      label: "log",
      insert: "log(",
      kind: "fn",
      what: { nl: "Logaritme met grondtal 10.", en: "Logarithm with base 10." },
      when: { nl: "Hoeveel keer moet je 10 met zichzelf vermenigvuldigen?", en: "How many times do you multiply 10 by itself?" },
      example: "log(1000) = 3",
    },
  ],
  [
    {
      label: "∛",
      insert: "cbrt(",
      kind: "fn",
      what: { nl: "Derdemachtswortel.", en: "Cube root." },
      when: { nl: "Welk getal tot de derde geeft dit? Bijvoorbeeld bij inhoud.", en: "Which number cubed gives this? For example with volume." },
      example: "∛(27) = 3",
    },
    digit("4"),
    digit("5"),
    digit("6"),
    {
      label: "×",
      insert: "×",
      kind: "op",
      what: { nl: "Vermenigvuldigen.", en: "Multiply." },
      when: { nl: "Gaat vóór plus en min.", en: "Comes before add and subtract." },
      example: "3×4 = 12",
    },
    {
      label: "ln",
      insert: "ln(",
      kind: "fn",
      what: { nl: "Natuurlijke logaritme (grondtal e).", en: "Natural logarithm (base e)." },
      when: { nl: "Later bij e-machten en groei.", en: "Later with powers of e and growth." },
      example: "ln(e) = 1",
    },
  ],
  [
    {
      label: "π",
      insert: "π",
      kind: "fn",
      what: { nl: "Het getal pi, ongeveer 3,14159.", en: "The number pi, about 3.14159." },
      when: { nl: "Bij cirkels: omtrek en oppervlakte.", en: "With circles: circumference and area." },
      example: "π×2² ≈ 12,57",
    },
    digit("1"),
    digit("2"),
    digit("3"),
    {
      label: "−",
      insert: "-",
      kind: "op",
      what: { nl: "Aftrekken, of een negatief getal.", en: "Subtract, or a negative number." },
      when: { nl: "Let op: −2² is −4, maar (−2)² is 4.", en: "Note: −2² is −4, but (−2)² is 4." },
      example: "7−10 = −3",
    },
    {
      label: "e",
      insert: "e",
      kind: "fn",
      what: { nl: "Het getal e, ongeveer 2,71828.", en: "The number e, about 2.71828." },
      when: { nl: "Later bij exponentiële groei.", en: "Later with exponential growth." },
    },
  ],
  [
    {
      label: "Ans",
      insert: "ans",
      kind: "fn",
      what: { nl: "Het vorige antwoord.", en: "The previous answer." },
      when: { nl: "Om verder te rekenen zonder over te typen.", en: "To keep calculating without retyping." },
      example: "Ans×2",
    },
    digit("0"),
    {
      label: ",",
      insert: ",",
      kind: "digit",
      what: { nl: "Decimaalteken (komma).", en: "Decimal separator." },
      when: { nl: "Voor kommagetallen. Een punt mag ook.", en: "For decimals. A point also works." },
      example: "2,5×2 = 5",
    },
    {
      label: "%",
      insert: "%",
      kind: "op",
      what: { nl: "Procent: gedeeld door 100.", en: "Percent: divided by 100." },
      when: { nl: "Bij procenten.", en: "With percentages." },
      example: "20%×50 = 10",
    },
    {
      label: "+",
      insert: "+",
      kind: "op",
      what: { nl: "Optellen.", en: "Add." },
      when: { nl: "Komt als laatste in de rekenvolgorde.", en: "Comes last in the order of operations." },
      example: "2+3 = 5",
    },
    {
      label: "=",
      action: "equals",
      kind: "action",
      what: { nl: "Uitrekenen. Enter werkt ook.", en: "Calculate. Enter works too." },
      when: { nl: "Als je som compleet is.", en: "When your sum is complete." },
    },
  ],
];
