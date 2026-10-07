"use client";
/**
 * Renders any `VisualSpec`, and gives a short text description of it for
 * read-aloud and screen readers.
 */
import type { ComponentType } from "react";
import { BUNDLES } from "@/content/units";
import { useT } from "@/i18n/client";
import type { Locale } from "@/i18n/locale";
import { AreaModelWidget } from "./widgets/area-model";
import { BalanceWidget, describeBalance } from "./widgets/balance";
import { FractionBarWidget } from "./widgets/fraction-bar";
import { FunctionMachineWidget } from "./widgets/function-machine";
import { PythagorasWidget, RightTriangleWidget, UnitCircleWidget } from "./widgets/geometry";
import { NumberLineWidget } from "./widgets/number-line";
import { PlaneWidget } from "./widgets/plane";
import type { VisualSpec } from "./types";

/** Unit-specific widgets, collected from all bundles. */
const CUSTOM: Record<string, ComponentType<{ props: Record<string, unknown> }>> = Object.assign(
  {},
  ...BUNDLES.map((b) => b.widgets ?? {}),
);

export function Visual({ spec }: { spec: VisualSpec }) {
  switch (spec.kind) {
    case "balance":
      return <BalanceWidget a={spec.a} b={spec.b} c={spec.c} d={spec.d} />;
    case "number-line":
      return <NumberLineWidget {...spec} />;
    case "fraction-bar":
      return <FractionBarWidget bars={spec.bars} allowSplit={spec.allowSplit} />;
    case "area-model":
      return <AreaModelWidget rows={spec.rows} cols={spec.cols} reveal={spec.reveal} />;
    case "plane":
      return <PlaneWidget {...spec} />;
    case "right-triangle":
      return <RightTriangleWidget angle={spec.angle} show={spec.show} interactive={spec.interactive} />;
    case "pythagoras":
      return <PythagorasWidget a={spec.a} b={spec.b} />;
    case "unit-circle":
      return <UnitCircleWidget angle={spec.angle} unit={spec.unit} interactive={spec.interactive} />;
    case "function-machine":
      return <FunctionMachineWidget latex={spec.latex} inputs={spec.inputs} />;
    case "custom": {
      const Widget = CUSTOM[spec.widget];
      return Widget ? <Widget props={spec.props} /> : <MissingWidget name={spec.widget} />;
    }
  }
}

function MissingWidget({ name }: { name: string }) {
  const { t } = useT();
  return <p className="text-muted">{t("somethingWrong")} ({name})</p>;
}

/** A short spoken/text description of a visual (formulas between $...$). */
export function describeVisual(spec: VisualSpec, locale: Locale): string {
  const nl = locale === "nl";
  switch (spec.kind) {
    case "balance":
      return nl
        ? `Een balans. Links en rechts liggen blokjes. Samen vormen ze $${describeBalance(spec)}$.`
        : `A balance. There are blocks on both sides. Together they form $${describeBalance(spec)}$.`;
    case "number-line":
      return nl ? `Een getallenlijn van ${spec.min} tot ${spec.max}.` : `A number line from ${spec.min} to ${spec.max}.`;
    case "fraction-bar":
      return spec.bars.map((b) => `$\\frac{${b.num}}{${b.den}}$`).join(", ") + (nl ? " als breukenstroken." : " as fraction bars.");
    case "area-model":
      return nl ? "Een rechthoek die in vakken is verdeeld." : "A rectangle cut into parts.";
    case "plane":
      return (
        (nl ? "Een assenstelsel met de grafiek van " : "A coordinate plane with the graph of ") +
        (spec.graphs ?? []).map((g) => `$y=${g.latex}$`).join(nl ? " en " : " and ")
      );
    case "right-triangle":
      return nl ? `Een rechthoekige driehoek met een hoek van ${spec.angle} graden.` : `A right triangle with an angle of ${spec.angle} degrees.`;
    case "pythagoras":
      return nl
        ? `Een rechthoekige driehoek met rechthoekszijden ${spec.a} en ${spec.b}, en vierkanten op de zijden.`
        : `A right triangle with legs ${spec.a} and ${spec.b}, and squares on the sides.`;
    case "unit-circle":
      return nl ? "De eenheidscirkel met een draaibare hoek." : "The unit circle with an angle you can turn.";
    case "function-machine":
      return nl ? `Een functiemachine met de regel $${spec.latex}$.` : `A function machine with the rule $${spec.latex}$.`;
    case "custom":
      return spec.describe[locale];
  }
}
