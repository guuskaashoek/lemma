/**
 * Reference: all rule cards, mnemonics and metaphors on one page.
 */
import { RulesView } from "@/components/rules-view";
import { getT } from "@/i18n/server";

export default async function RulesPage() {
  const { t } = await getT();
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-4xl font-semibold tracking-tight">{t("rulesTitle")}</h1>
      <p className="mt-2 mb-10 text-lg text-muted">{t("rulesIntro")}</p>
      <RulesView />
    </div>
  );
}
