/**
 * The fixed metaphors of Lemma.
 *
 * Each topic always uses the same picture, every time it comes back, so the
 * learner builds one stable mental model:
 * - an equation is a balance,
 * - a function is a machine,
 * - a derivative is the slope at one point.
 */
import type { Loc, MetaphorId } from "./types";

export type Metaphor = {
  id: MetaphorId;
  name: Loc;
  /** One-line version, used in hints. */
  short: Loc;
  /** Longer version, used the first time the metaphor appears. */
  long: Loc;
};

export const METAPHORS: Record<MetaphorId, Metaphor> = {
  balance: {
    id: "balance",
    name: { nl: "De balans", en: "The balance" },
    short: {
      nl: "Een vergelijking is een balans: wat je links doet, doe je ook rechts.",
      en: "An equation is a balance: whatever you do on the left, you also do on the right.",
    },
    long: {
      nl: "Zie een vergelijking als een balans.\nLinks en rechts wegen even zwaar.\nHaal je links iets weg? Dan haal je rechts precies hetzelfde weg.\nZo blijft de balans recht.",
      en: "Think of an equation as a balance.\nThe left and right side weigh the same.\nTake something away on the left? Then take exactly the same away on the right.\nThat keeps the balance level.",
    },
  },
  machine: {
    id: "machine",
    name: { nl: "De machine", en: "The machine" },
    short: {
      nl: "Een functie is een machine: er gaat een getal in, er komt een getal uit.",
      en: "A function is a machine: a number goes in, a number comes out.",
    },
    long: {
      nl: "Zie een functie als een machine.\nJe stopt er een getal in, bijvoorbeeld $x = 3$.\nDe machine doet altijd hetzelfde met dat getal.\nEr komt één getal uit.",
      en: "Think of a function as a machine.\nYou put a number in, for example $x = 3$.\nThe machine always does the same thing with it.\nOne number comes out.",
    },
  },
  slope: {
    id: "slope",
    name: { nl: "De helling", en: "The slope" },
    short: {
      nl: "De afgeleide is de helling van de grafiek op één punt.",
      en: "The derivative is the slope of the graph at one point.",
    },
    long: {
      nl: "Stel je voor dat je over de grafiek fietst.\nOp elk punt voel je hoe steil het is.\nDie steilheid op één punt is de afgeleide.",
      en: "Imagine cycling along the graph.\nAt every point you feel how steep it is.\nThat steepness at one point is the derivative.",
    },
  },
};
