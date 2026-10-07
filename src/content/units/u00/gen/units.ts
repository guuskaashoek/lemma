/**
 * Lesson 6 generator: converting metric units with the staircase.
 */
import Fraction from "fraction.js";
import { evaluate, parse } from "@/math/cas";
import type { Mistake } from "@/math/check";
import type { Generator, Step } from "@/content/types";
import { L, custom, dec, propsOf } from "../helpers";
import { SIZE, STAIRS, STEP, unitLatex, type UnitKind } from "../widgets/unit-model";

const KIND_NAME: Record<UnitKind, { nl: string; en: string }> = {
  length: { nl: "de lengte", en: "the length" },
  mass: { nl: "het gewicht", en: "the mass" },
  volume: { nl: "de inhoud", en: "the volume" },
  area: { nl: "de oppervlakte", en: "the area" },
  cubic: { nl: "de inhoud", en: "the volume" },
};

export const unitConvert: Generator = {
  id: "u0.unit-convert",
  skillId: "u0.units",
  title: L("Eenheden omrekenen", "Converting units"),
  generate(rng, difficulty) {
    let kind: UnitKind;
    if (difficulty === 1) kind = rng.pick(["length", "mass"] as const);
    else if (difficulty === 2) kind = rng.pick(["length", "mass", "volume"] as const);
    else kind = rng.pick(["area", "area", "cubic"] as const);
    const units = STAIRS[kind];
    const maxSteps = kind === "cubic" ? 1 : kind === "area" ? 2 : 3;
    // Only the common units on level 1: km, m, cm, mm, kg, g, mg.
    const common = (u: string) => ["km", "m", "dm", "cm", "mm", "kg", "g", "mg", "L", "dL", "cL", "mL", "m²", "dm²", "cm²", "m³", "dm³", "cm³"].includes(u);

    let i: number, j: number;
    do {
      i = rng.int(0, units.length - 1);
      j = rng.int(0, units.length - 1);
    } while (
      i === j ||
      Math.abs(i - j) > maxSteps ||
      (difficulty === 1 && j < i) ||
      (difficulty < 3 && !(common(units[i]) && common(units[j]))) ||
      ((kind === "area" || kind === "cubic") && !(common(units[i]) && common(units[j])))
    );
    const steps = Math.abs(j - i);
    const down = j > i;
    const F = new Fraction(STEP[kind]).pow(steps);

    // Value: whole on level 1; decimals or big numbers later. Results stay tidy.
    let value: Fraction;
    if (down) value = difficulty === 1 ? new Fraction(rng.int(2, 25)) : new Fraction(rng.int(11, 99), 10);
    else value = new Fraction(rng.int(11, 99), 10).mul(F); // result has one decimal at most
    const result = down ? value.mul(F) : value.div(F);

    const from = units[i];
    const to = units[j];
    const one = STEP[kind];
    const sym = down ? "\\cdot" : ":";
    const latex = `${dec(value)}${unitLatex(from)}=\\ ?${unitLatex(to)}`;

    const chain: Step[] = [
      {
        latex: `${dec(value)}${`${sym} ${one}`.repeat(steps)}`,
        note: down
          ? L(
              `Van ${from} naar ${to}: ${steps} ${steps === 1 ? "trede" : "treden"} omlaag. Elke trede keer $${one}$.`,
              `From ${from} to ${to}: ${steps} ${steps === 1 ? "stair" : "stairs"} down. Each stair times $${one}$.`,
            )
          : L(
              `Van ${from} naar ${to}: ${steps} ${steps === 1 ? "trede" : "treden"} omhoog. Elke trede gedeeld door $${one}$.`,
              `From ${from} to ${to}: ${steps} ${steps === 1 ? "stair" : "stairs"} up. Each stair divided by $${one}$.`,
            ),
      },
    ];
    let cur = value;
    for (let k = 0; k < steps; k++) {
      cur = down ? cur.mul(one) : cur.div(one);
      chain.push({
        latex: `\\ask{${dec(cur)}}${`${sym} ${one}`.repeat(steps - 1 - k)}`,
        note: L(`Trede ${k + 1}: nu in ${units[i + (down ? k + 1 : -(k + 1))]}.`, `Stair ${k + 1}: now in ${units[i + (down ? k + 1 : -(k + 1))]}.`),
      });
    }

    const mistakes: Mistake[] = [];
    const back = down ? value.div(F) : value.mul(F);
    mistakes.push({
      id: "wrong-direction",
      latex: dec(back),
      explain: down
        ? L(`${to} is een kleinere eenheid. Dan heb je er méér van nodig: keer, niet gedeeld door.`, `${to} is a smaller unit. You need more of them: multiply, do not divide.`)
        : L(`${to} is een grotere eenheid. Dan heb je er minder van nodig: gedeeld door, niet keer.`, `${to} is a bigger unit. You need fewer of them: divide, do not multiply.`),
    });
    if (kind === "area" || kind === "cubic") {
      const wrongStep = down ? value.mul(new Fraction(10).pow(steps)) : value.div(new Fraction(10).pow(steps));
      mistakes.push({
        id: "times-ten",
        latex: dec(wrongStep),
        explain:
          kind === "area"
            ? L("Bij oppervlakte is elke trede keer $100$, niet keer $10$. Een vierkant van $1$ dm bij $1$ dm is $10$ bij $10$ cm.", "For area every stair is times $100$, not times $10$. A square of $1$ dm by $1$ dm is $10$ by $10$ cm.")
            : L("Bij inhoud in kubieke eenheden is elke trede keer $1000$. Een kubus van $1$ dm is $10\\cdot 10\\cdot 10$ cm³.", "For volume in cubic units every stair is times $1000$. A cube of $1$ dm is $10\\cdot 10\\cdot 10$ cm³."),
      });
    }

    return {
      prompt: L(`Reken ${KIND_NAME[kind].nl} om naar ${to}.`, `Convert ${KIND_NAME[kind].en} to ${to}.`),
      latex,
      visual: custom(
        "u0.unit-stairs",
        { kind, from, to, value: value.valueOf() },
        L(
          `Het metriek trapje van ${units[0]} tot ${units[units.length - 1]}. Het getal $${dec(value)}$ staat op de trede ${from}.`,
          `The metric staircase from ${units[0]} to ${units[units.length - 1]}. The number $${dec(value)}$ is on the ${from} stair.`,
        ),
      ),
      answer: { kind: "expr", latex: dec(result), form: "any", unit: to },
      calculator: "off",
      hints: {
        nudge: L(
          `Zoek ${from} en ${to} op het trapje. Hoeveel treden is het? Ga je omhoog of omlaag?`,
          `Find ${from} and ${to} on the staircase. How many stairs is it? Are you going up or down?`,
        ),
        rule: {
          text:
            kind === "area"
              ? L("Oppervlakte: elke trede is keer of gedeeld door $100$.", "Area: every stair is times or divided by $100$.")
              : kind === "cubic"
                ? L("Inhoud in kubieke eenheden: elke trede is keer of gedeeld door $1000$. $1$ dm³ $=1$ L.", "Volume in cubic units: every stair is times or divided by $1000$. $1$ dm³ $=1$ L.")
                : L("Metriek trapje: trede omlaag is keer $10$, trede omhoog is gedeeld door $10$.", "Metric staircase: a stair down is times $10$, a stair up is divided by $10$."),
          ruleId: kind === "area" || kind === "cubic" ? "u0.area-units" : "u0.unit-stairs",
        },
        solution: { steps: chain },
      },
      mistakes,
    };
  },
  verify(ex) {
    // Independent check with the unit sizes: value · size(from) = answer · size(to).
    const p = propsOf(ex, "u0.unit-stairs") as { from: string; to: string; value: number } | null;
    if (!p || ex.answer.kind !== "expr") return false;
    const ans = evaluate(parse(ex.answer.latex));
    if (ans === null) return false;
    const lhs = new Fraction(p.value).mul(SIZE[p.from]).valueOf();
    const rhs = SIZE[p.to].valueOf() * ans;
    return Math.abs(lhs - rhs) <= 1e-9 * Math.max(1, Math.abs(lhs));
  },
  isNice(ex) {
    return ex.answer.kind === "expr" && !/\.\d{4,}/.test(ex.answer.latex) && !/\d{8,}/.test(ex.answer.latex);
  },
};
