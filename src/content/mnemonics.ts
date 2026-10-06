/**
 * Mnemonics (ezelsbruggetjes) as used in Dutch schools.
 *
 * Each one has a fixed place in the app and comes back in hints, always with
 * the same wording.
 */
import type { Loc, MnemonicId } from "./types";

export type Mnemonic = {
  id: MnemonicId;
  /** The mnemonic itself, e.g. "SOS CAS TOA". */
  phrase: Loc;
  /** What each part stands for, one line per part. */
  /** `latex` is localised because it contains words (overstaand / opposite). */
  parts: Array<{ key: string; meaning: Loc; latex?: Loc }>;
  ruleId: string;
};

export const MNEMONICS: Record<MnemonicId, Mnemonic> = {
  hmwvdoa: {
    id: "hmwvdoa",
    phrase: {
      nl: "Hoe Moeten Wij Van De Onvoldoendes Afkomen?",
      en: "Brackets, Powers, Multiply/Divide, Add/Subtract",
    },
    parts: [
      { key: "H", meaning: { nl: "Haakjes", en: "Brackets" } },
      { key: "M W", meaning: { nl: "Machtsverheffen en Worteltrekken", en: "Powers and roots" } },
      {
        key: "V D",
        meaning: { nl: "Vermenigvuldigen en Delen, van links naar rechts", en: "Multiply and divide, left to right" },
      },
      {
        key: "O A",
        meaning: { nl: "Optellen en Aftrekken, van links naar rechts", en: "Add and subtract, left to right" },
      },
    ],
    ruleId: "order-of-operations",
  },
  soscastoa: {
    id: "soscastoa",
    phrase: { nl: "SOS CAS TOA", en: "SOH CAH TOA" },
    parts: [
      {
        key: "SOS",
        meaning: { nl: "Sinus = Overstaande zijde / Schuine zijde", en: "Sine = Opposite / Hypotenuse" },
        latex: {
          nl: "\\sin(\\alpha)=\\frac{\\text{overstaand}}{\\text{schuin}}",
          en: "\\sin(\\alpha)=\\frac{\\text{opposite}}{\\text{hypotenuse}}",
        },
      },
      {
        key: "CAS",
        meaning: { nl: "Cosinus = Aanliggende zijde / Schuine zijde", en: "Cosine = Adjacent / Hypotenuse" },
        latex: {
          nl: "\\cos(\\alpha)=\\frac{\\text{aanliggend}}{\\text{schuin}}",
          en: "\\cos(\\alpha)=\\frac{\\text{adjacent}}{\\text{hypotenuse}}",
        },
      },
      {
        key: "TOA",
        meaning: { nl: "Tangens = Overstaande zijde / Aanliggende zijde", en: "Tangent = Opposite / Adjacent" },
        latex: {
          nl: "\\tan(\\alpha)=\\frac{\\text{overstaand}}{\\text{aanliggend}}",
          en: "\\tan(\\alpha)=\\frac{\\text{opposite}}{\\text{adjacent}}",
        },
      },
    ],
    ruleId: "sos-cas-toa",
  },
};
