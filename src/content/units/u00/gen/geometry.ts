/**
 * Lesson 8 generators: perimeter and area (rectangle, triangle, circle) and
 * volume (box, cylinder).
 */
import Fraction from "fraction.js";
import { evaluate, parse } from "@/math/cas";
import { roundHalfAwayFromZero, type Mistake } from "@/math/check";
import type { Generator, Loc, Step } from "@/content/types";
import { L, custom, dec, propsOf } from "../helpers";

const r1 = (v: number) => String(roundHalfAwayFromZero(v, 1));

// ---------------------------------------------------------------------------
// Perimeter and area
// ---------------------------------------------------------------------------

type ShapeProps =
  | { shape: "rect"; w: number; h: number; unit: string; ask: "area" | "perimeter" }
  | { shape: "triangle"; b: number; h: number; top: number; unit: string; ask: "area" }
  | { shape: "circle"; r: number; unit: string; ask: "area" | "perimeter"; givenDiameter: boolean };

export const perimeterArea: Generator = {
  id: "u0.perimeter-area",
  skillId: "u0.perimeter-area",
  title: L("Omtrek en oppervlakte", "Perimeter and area"),
  generate(rng, difficulty) {
    let props: ShapeProps;
    let prompt: Loc;
    let steps: Step[];
    let nudge: Loc;
    let ruleText: Loc;
    let answer: string;
    let decimals: number | undefined;
    const mistakes: Mistake[] = [];

    if (difficulty === 1) {
      const w = rng.int(3, 15);
      const h = rng.int(2, Math.min(12, w - 1));
      const ask = rng.pick(["area", "perimeter"] as const);
      props = { shape: "rect", w, h, unit: "cm", ask };
      const area = w * h;
      const per = 2 * (w + h);
      prompt = L(
        `Een rechthoek is $${w}$ cm lang en $${h}$ cm breed. Bereken de ${ask === "area" ? "oppervlakte" : "omtrek"}.`,
        `A rectangle is $${w}$ cm long and $${h}$ cm wide. Work out the ${ask === "area" ? "area" : "perimeter"}.`,
      );
      if (ask === "area") {
        steps = [
          { latex: `${w}\\cdot ${h}`, note: L("Oppervlakte: lengte keer breedte.", "Area: length times width.") },
          { latex: `\\ask{${area}}`, note: L("Zoveel vakjes van $1$ cm².", "That many squares of $1$ cm².") },
        ];
        answer = String(area);
        nudge = L(`Hoeveel vakjes van $1$ bij $1$ cm passen erin? Er zijn $${h}$ rijen van $${w}$.`, `How many $1$ by $1$ cm squares fit inside? There are $${h}$ rows of $${w}$.`);
        mistakes.push({ id: "perimeter-instead", latex: String(per), explain: L("Dat is de omtrek: de rand. De oppervlakte is wat erin past: lengte keer breedte.", "That is the perimeter: the edge. The area is what fits inside: length times width.") });
      } else {
        steps = [
          { latex: `${w}+${h}+${w}+${h}`, note: L("Omtrek: loop één keer rond. Vier zijden.", "Perimeter: walk around once. Four sides.") },
          { latex: `\\ask{${per}}`, note: L("Tel op.", "Add.") },
        ];
        answer = String(per);
        nudge = L(`Loop één keer om de rechthoek heen. Je komt langs $${w}$, $${h}$, $${w}$ en $${h}$.`, `Walk around the rectangle once. You pass $${w}$, $${h}$, $${w}$ and $${h}$.`);
        mistakes.push(
          { id: "area-instead", latex: String(area), explain: L("Dat is de oppervlakte. De omtrek is de lengte van de rand.", "That is the area. The perimeter is the length of the edge.") },
          { id: "two-sides", latex: String(w + h), explain: L("Je telde maar twee zijden. Een rechthoek heeft er vier.", "You only counted two sides. A rectangle has four.") },
        );
      }
      ruleText = L("Rechthoek: omtrek is alle zijden opgeteld. Oppervlakte is lengte keer breedte.", "Rectangle: the perimeter is all sides added. The area is length times width.");
    } else if (difficulty === 2) {
      const b = rng.int(3, 14);
      const h = rng.int(2, 12);
      const top = rng.int(0, b);
      props = { shape: "triangle", b, h, top, unit: "cm", ask: "area" };
      const area = new Fraction(b * h, 2);
      prompt = L(
        `Een driehoek heeft een basis van $${b}$ cm en een hoogte van $${h}$ cm. Bereken de oppervlakte.`,
        `A triangle has a base of $${b}$ cm and a height of $${h}$ cm. Work out the area.`,
      );
      steps = [
        { latex: `\\frac{1}{2}\\cdot ${b}\\cdot ${h}`, note: L("Een driehoek is de helft van een rechthoek.", "A triangle is half of a rectangle.") },
        { latex: `\\frac{1}{2}\\cdot\\ask{${b * h}}`, note: L("De rechthoek eromheen: basis keer hoogte.", "The rectangle around it: base times height.") },
        { latex: `\\ask{${dec(area)}}`, note: L("De helft daarvan.", "Half of that.") },
      ];
      answer = dec(area);
      nudge = L(
        `Teken een rechthoek van $${b}$ bij $${h}$ om de driehoek. Welk deel van die rechthoek is de driehoek?`,
        `Draw a $${b}$ by $${h}$ rectangle around the triangle. What part of that rectangle is the triangle?`,
      );
      mistakes.push({ id: "forgot-half", latex: String(b * h), explain: L("Dat is de hele rechthoek. De driehoek is precies de helft.", "That is the whole rectangle. The triangle is exactly half.") });
      ruleText = L("Driehoek: oppervlakte is $\\frac{1}{2}\\cdot$ basis $\\cdot$ hoogte.", "Triangle: area is $\\frac{1}{2}\\cdot$ base $\\cdot$ height.");
    } else {
      const r = rng.int(2, 20);
      const d = 2 * r;
      const ask = rng.pick(["area", "perimeter"] as const);
      const givenDiameter = rng.chance();
      props = { shape: "circle", r, unit: "cm", ask, givenDiameter };
      prompt = L(
        `Een cirkel heeft een ${givenDiameter ? `diameter van $${d}$` : `straal van $${r}$`} cm. Bereken de ${ask === "area" ? "oppervlakte" : "omtrek"}. Rond af op $1$ decimaal.`,
        `A circle has a ${givenDiameter ? `diameter of $${d}$` : `radius of $${r}$`} cm. Work out the ${ask === "area" ? "area" : "perimeter"}. Round to $1$ decimal.`,
      );
      decimals = 1;
      if (ask === "perimeter") {
        answer = `\\pi\\cdot ${d}`;
        steps = givenDiameter
          ? [
              { latex: `\\pi\\cdot ${d}`, note: L("Omtrek is $\\pi$ keer de diameter.", "Perimeter is $\\pi$ times the diameter.") },
              { latex: `\\pi\\cdot ${d}\\approx \\ask{${r1(Math.PI * d)}}`, note: L("Reken uit en rond af.", "Work it out and round."), approx: { decimals: 1 } },
            ]
          : [
              { latex: `\\pi\\cdot 2\\cdot ${r}`, note: L("Omtrek is $\\pi$ keer de diameter. De diameter is $2$ keer de straal.", "Perimeter is $\\pi$ times the diameter. The diameter is $2$ times the radius.") },
              { latex: `\\pi\\cdot\\ask{${d}}`, note: L("De diameter.", "The diameter.") },
              { latex: `\\pi\\cdot ${d}\\approx \\ask{${r1(Math.PI * d)}}`, note: L("Reken uit en rond af.", "Work it out and round."), approx: { decimals: 1 } },
            ];
        mistakes.push(
          { id: "used-radius", latex: r1(Math.PI * r), explain: L("Je gebruikte de straal. De omtrek is $\\pi$ keer de diameter: twee keer de straal.", "You used the radius. The perimeter is $\\pi$ times the diameter: twice the radius.") },
          { id: "area-instead", latex: r1(Math.PI * r * r), explain: L("Dat is de oppervlakte. Voor de omtrek doe je $\\pi\\cdot d$.", "That is the area. For the perimeter you do $\\pi\\cdot d$.") },
        );
        nudge = givenDiameter
          ? L(`De rand is iets meer dan $3$ keer de diameter $${d}$. Hoeveel precies?`, `The edge is a bit more than $3$ times the diameter $${d}$. How much exactly?`)
          : L(`De rand is iets meer dan $3$ keer de diameter. De straal is $${r}$, dus de diameter is?`, `The edge is a bit more than $3$ times the diameter. The radius is $${r}$, so the diameter is?`);
      } else {
        answer = `\\pi\\cdot ${r}^{2}`;
        steps = givenDiameter
          ? [
              { latex: `\\pi\\cdot\\left(\\frac{${d}}{2}\\right)^{2}`, note: L("Oppervlakte is $\\pi\\cdot r^2$. De straal is de helft van de diameter.", "Area is $\\pi\\cdot r^2$. The radius is half the diameter.") },
              { latex: `\\pi\\cdot\\ask{${r}}^{2}`, note: L("De straal.", "The radius.") },
              { latex: `\\pi\\cdot\\ask{${r * r}}`, note: L(`$${r}^{2}=${r}\\cdot ${r}$.`, `$${r}^{2}=${r}\\cdot ${r}$.`) },
              { latex: `\\pi\\cdot ${r * r}\\approx \\ask{${r1(Math.PI * r * r)}}`, note: L("Reken uit en rond af.", "Work it out and round."), approx: { decimals: 1 } },
            ]
          : [
              { latex: `\\pi\\cdot ${r}^{2}`, note: L("Oppervlakte is $\\pi\\cdot r^2$.", "Area is $\\pi\\cdot r^2$.") },
              { latex: `\\pi\\cdot\\ask{${r * r}}`, note: L(`$${r}^{2}=${r}\\cdot ${r}$.`, `$${r}^{2}=${r}\\cdot ${r}$.`) },
              { latex: `\\pi\\cdot ${r * r}\\approx \\ask{${r1(Math.PI * r * r)}}`, note: L("Reken uit en rond af.", "Work it out and round."), approx: { decimals: 1 } },
            ];
        mistakes.push(
          { id: "used-diameter", latex: r1(Math.PI * d * d), explain: L("Je gebruikte de diameter. In $\\pi\\cdot r^2$ staat de straal: de helft van de diameter.", "You used the diameter. $\\pi\\cdot r^2$ uses the radius: half the diameter.") },
          { id: "times-two", latex: r1(Math.PI * r * 2), explain: L("$r^2$ is $r\\cdot r$, niet $r\\cdot 2$. Dat laatste is de omtrek.", "$r^2$ is $r\\cdot r$, not $r\\cdot 2$. That last one is the perimeter.") },
        );
        nudge = givenDiameter
          ? L(`Eerst de straal: de helft van $${d}$. Neem die in het kwadraat en doe keer $\\pi$.`, `First the radius: half of $${d}$. Square it and multiply by $\\pi$.`)
          : L(`Neem de straal $${r}$ in het kwadraat. Doe dat keer $\\pi$.`, `Square the radius $${r}$. Multiply that by $\\pi$.`);
      }
      ruleText = L("Cirkel: omtrek is $\\pi\\cdot d$. Oppervlakte is $\\pi\\cdot r^2$. De diameter $d$ is $2$ keer de straal $r$.", "Circle: perimeter is $\\pi\\cdot d$. Area is $\\pi\\cdot r^2$. The diameter $d$ is $2$ times the radius $r$.");
    }

    const unit = props.ask === "area" ? "cm²" : "cm";
    return {
      prompt,
      // For the circle, show big what is given: the radius or the diameter.
      latex: props.shape === "circle" ? (props.givenDiameter ? `d=${2 * props.r}` : `r=${props.r}`) : undefined,
      visual: custom(
        "u0.shape-grid",
        props,
        props.shape === "rect"
          ? L(`Een rechthoek van $${props.w}$ bij $${props.h}$ cm op ruitjes.`, `A $${props.w}$ by $${props.h}$ cm rectangle on a grid.`)
          : props.shape === "triangle"
            ? L(`Een driehoek met basis $${props.b}$ en hoogte $${props.h}$, in een rechthoek.`, `A triangle with base $${props.b}$ and height $${props.h}$, inside a rectangle.`)
            : L(`Een cirkel met straal $${props.r}$ cm.`, `A circle with radius $${props.r}$ cm.`),
      ),
      answer: decimals ? { kind: "expr", latex: answer, form: "decimal", decimals, unit } : { kind: "expr", latex: answer, form: "any", unit },
      calculator: difficulty === 3 ? "allowed" : "off",
      hints: {
        nudge,
        rule: { text: ruleText, ruleId: props.ask === "perimeter" ? "u0.perimeter" : "u0.area" },
        solution: { steps },
      },
      mistakes: mistakes.filter((m) => {
        const v = evaluate(parse(m.latex));
        const a = evaluate(parse(answer));
        return v !== null && a !== null && (decimals ? r1(v) !== r1(a) : Math.abs(v - a) > 1e-9);
      }),
    };
  },
  verify(ex) {
    // Independent checks: count unit squares or edges, the shoelace formula
    // for the triangle, and other circle formulas (2πr, πd²/4).
    const p = propsOf(ex, "u0.shape-grid") as ShapeProps | null;
    if (!p || ex.answer.kind !== "expr") return false;
    const ans = evaluate(parse(ex.answer.latex));
    if (ans === null) return false;
    let expected: number;
    if (p.shape === "rect") {
      if (p.ask === "area") {
        expected = 0;
        for (let row = 0; row < p.h; row++) for (let col = 0; col < p.w; col++) expected += 1;
      } else expected = [p.w, p.h, p.w, p.h].reduce((a, b) => a + b, 0);
    } else if (p.shape === "triangle") {
      const pts = [
        [0, 0],
        [p.b, 0],
        [p.top, p.h],
      ];
      let twice = 0;
      for (let i = 0; i < 3; i++) twice += pts[i][0] * pts[(i + 1) % 3][1] - pts[(i + 1) % 3][0] * pts[i][1];
      expected = Math.abs(twice) / 2;
    } else {
      const d = 2 * p.r;
      expected = p.ask === "perimeter" ? 2 * Math.PI * p.r : (Math.PI * d * d) / 4;
    }
    return Math.abs(ans - expected) < 1e-9 * Math.max(1, expected);
  },
};

// ---------------------------------------------------------------------------
// Volume
// ---------------------------------------------------------------------------

export const volume: Generator = {
  id: "u0.volume",
  skillId: "u0.volume",
  title: L("Inhoud", "Volume"),
  generate(rng, difficulty) {
    const cylinder = difficulty === 3 && rng.chance();
    if (cylinder) {
      const r = rng.int(2, 10);
      const h = rng.int(5, 25);
      const exact = `\\pi\\cdot ${r}^{2}\\cdot ${h}`;
      const v = Math.PI * r * r * h;
      return {
        prompt: L(
          `Een blik is een cilinder. De straal is $${r}$ cm en de hoogte is $${h}$ cm. Bereken de inhoud in cm³. Rond af op $1$ decimaal.`,
          `A can is a cylinder. The radius is $${r}$ cm and the height is $${h}$ cm. Work out the volume in cm³. Round to $1$ decimal.`,
        ),
        latex: `r=${r},\\quad h=${h}`,
        answer: { kind: "expr", latex: exact, form: "decimal", decimals: 1, unit: "cm³" },
        calculator: "allowed",
        hints: {
          nudge: L(
            `De bodem is een cirkel met straal $${r}$. Reken eerst de oppervlakte van de bodem uit. Hoeveel lagen van $1$ cm passen erop?`,
            `The bottom is a circle with radius $${r}$. First work out the area of the bottom. How many $1$ cm layers fit on it?`,
          ),
          rule: {
            text: L("Inhoud van een cilinder: oppervlakte van de bodem keer de hoogte: $\\pi\\cdot r^2\\cdot h$.", "Volume of a cylinder: area of the bottom times the height: $\\pi\\cdot r^2\\cdot h$."),
            ruleId: "u0.volume",
          },
          solution: {
            steps: [
              { latex: exact, note: L("Bodem keer hoogte.", "Bottom times height.") },
              { latex: `\\pi\\cdot\\ask{${r * r}}\\cdot ${h}`, note: L(`$${r}^{2}=${r * r}$.`, `$${r}^{2}=${r * r}$.`) },
              { latex: `\\pi\\cdot ${r * r}\\cdot ${h}\\approx \\ask{${r1(v)}}`, note: L("Reken uit en rond af.", "Work it out and round."), approx: { decimals: 1 } },
            ],
          },
        },
        mistakes: [
          { id: "used-diameter", latex: r1(Math.PI * 4 * r * r * h), explain: L("Je gebruikte de diameter. In de formule staat de straal.", "You used the diameter. The formula uses the radius.") },
          { id: "times-two", latex: r1(Math.PI * 2 * r * h), explain: L("$r^2$ is $r\\cdot r$, niet $r\\cdot 2$.", "$r^2$ is $r\\cdot r$, not $r\\cdot 2$.") },
        ].filter((m) => m.latex !== r1(v)),
      };
    }

    // A box. Level 1: cm³. Level 2: dm → litres. Level 3: cm → litres.
    let l: number, w: number, h: number, unit: string;
    if (difficulty === 1) {
      l = rng.int(2, 10);
      w = rng.int(2, 8);
      h = rng.int(2, 8);
      unit = "cm";
    } else if (difficulty === 2) {
      l = rng.int(2, 8);
      w = rng.int(2, 6);
      h = rng.int(2, 8);
      unit = "dm";
    } else {
      l = rng.int(3, 10);
      w = rng.int(2, 6);
      h = rng.int(2, 6);
      unit = "dm";
    }
    const vol = l * w * h;
    const inCm = difficulty === 3;
    const C = (v: number) => (inCm ? v * 10 : v);
    const liters = unit === "dm";
    // Level 3 works in dm, as in the lesson: then dm³ are litres straight away.
    const steps: Step[] = inCm
      ? [
          {
            latex: `${l}\\cdot ${w}\\cdot ${h}`,
            note: L(
              `Reken eerst om naar dm: $${C(l)}$ cm $=${l}$ dm, $${C(w)}$ cm $=${w}$ dm, $${C(h)}$ cm $=${h}$ dm.`,
              `First convert to dm: $${C(l)}$ cm $=${l}$ dm, $${C(w)}$ cm $=${w}$ dm, $${C(h)}$ cm $=${h}$ dm.`,
            ),
          },
          { latex: `\\ask{${l * w}}\\cdot ${h}`, note: L("De bodem: lengte keer breedte.", "The bottom: length times width.") },
          { latex: `\\ask{${vol}}`, note: L("Keer de hoogte. Dat zijn dm³, en $1$ dm³ is $1$ liter.", "Times the height. Those are dm³, and $1$ dm³ is $1$ litre.") },
        ]
      : [
          { latex: `${l}\\cdot ${w}\\cdot ${h}`, note: L("Lengte keer breedte keer hoogte.", "Length times width times height.") },
          { latex: `\\ask{${l * w}}\\cdot ${h}`, note: L("Eén laag: lengte keer breedte.", "One layer: length times width.") },
          { latex: `\\ask{${vol}}`, note: liters ? L("Zoveel dm³. En $1$ dm³ is $1$ liter.", "That many dm³. And $1$ dm³ is $1$ litre.") : L("Keer het aantal lagen.", "Times the number of layers.") },
        ];
    const mistakes: Mistake[] = [
      { id: "added", latex: String(C(l) + C(w) + C(h)), explain: L("Je telde op. Bij inhoud vermenigvuldig je: lengte keer breedte keer hoogte.", "You added. For volume you multiply: length times width times height.") },
    ];
    if (inCm) mistakes.push({ id: "cm3", latex: String(vol * 1000), explain: L("Dat zijn cm³. Een liter is $1000$ cm³: deel nog door $1000$.", "Those are cm³. A litre is $1000$ cm³: divide by $1000$ too.") });

    const what = inCm
      ? L(`Een aquarium is $${C(l)}$ cm lang, $${C(w)}$ cm breed en $${C(h)}$ cm hoog. Hoeveel liter water past erin?`, `A fish tank is $${C(l)}$ cm long, $${C(w)}$ cm wide and $${C(h)}$ cm high. How many litres of water fit in it?`)
      : liters
        ? L(`Een doos is $${l}$ dm lang, $${w}$ dm breed en $${h}$ dm hoog. Hoeveel liter past erin?`, `A box is $${l}$ dm long, $${w}$ dm wide and $${h}$ dm high. How many litres fit in it?`)
        : L(`Een balk is $${l}$ cm lang, $${w}$ cm breed en $${h}$ cm hoog. Bereken de inhoud in cm³.`, `A box is $${l}$ cm long, $${w}$ cm wide and $${h}$ cm high. Work out the volume in cm³.`);
    return {
      prompt: what,
      visual: custom(
        "u0.cube-stack",
        { l, w, h, unit },
        L(`Een balk van $${l}$ bij $${w}$ bij $${h}$ ${unit}, opgebouwd uit blokjes.`, `A box of $${l}$ by $${w}$ by $${h}$ ${unit}, built from cubes.`),
      ),
      answer: { kind: "expr", latex: String(vol), form: "any", unit: liters ? "L" : "cm³" },
      calculator: difficulty === 3 ? "allowed" : "off",
      hints: {
        nudge: inCm
          ? L(`Reken in dm, dan krijg je meteen liters: $${C(l)}$ cm $=${l}$ dm. Hoeveel blokjes van $1$ dm³ passen erin?`, `Work in dm, then you get litres straight away: $${C(l)}$ cm $=${l}$ dm. How many $1$ dm³ cubes fit in it?`)
          : L(`Hoeveel blokjes passen in één laag? Dat is $${l}\\cdot ${w}$. Hoeveel lagen zijn er?`, `How many cubes fit in one layer? That is $${l}\\cdot ${w}$. How many layers are there?`),
        rule: {
          text: L("Inhoud van een balk: lengte keer breedte keer hoogte. $1$ dm³ is $1$ liter.", "Volume of a box: length times width times height. $1$ dm³ is $1$ litre."),
          ruleId: "u0.volume",
        },
        solution: { steps },
      },
      mistakes: mistakes.filter((m) => Number(m.latex) !== vol),
    };
  },
  verify(ex) {
    if (ex.answer.kind !== "expr") return false;
    const ans = evaluate(parse(ex.answer.latex));
    if (ans === null) return false;
    const p = propsOf(ex, "u0.cube-stack") as { l: number; w: number; h: number } | null;
    if (p) {
      // Independent check: count the cubes layer by layer.
      let count = 0;
      for (let k = 0; k < p.h; k++) for (let i = 0; i < p.l; i++) for (let j = 0; j < p.w; j++) count += 1;
      return count === ans;
    }
    // Cylinder: bottom area from the diameter, π·d²/4, times the height.
    const m = ex.latex?.match(/^r=(\d+),\\quad h=(\d+)$/);
    if (!m) return false;
    const d = 2 * Number(m[1]);
    return Math.abs(ans - ((Math.PI * d * d) / 4) * Number(m[2])) < 1e-9 * ans;
  },
};
