import { OpenShowcaseDemo } from "@/components/openshowcase-demo";

export function HybridModelDemo({ locale }: { locale: "en" | "es" }) {
  return <OpenShowcaseDemo name="trust-models-hybrid" locale={locale} />;
}
