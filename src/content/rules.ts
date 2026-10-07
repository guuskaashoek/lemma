/**
 * Rule cards (regelkaarten).
 *
 * Every rule gets a short, fixed name and a card. Lessons and hints link to
 * these cards with `[[rule:id]]`, and together they form the reference
 * section of the app. Each card's example is checked by the tests.
 */
import type { RuleCard } from "./types";
import { BUNDLES } from "./units";

export const RULES: RuleCard[] = BUNDLES.flatMap((b) => b.rules);

const byId = new Map(RULES.map((r) => [r.id, r]));

export function getRule(id: string): RuleCard | undefined {
  return byId.get(id);
}
