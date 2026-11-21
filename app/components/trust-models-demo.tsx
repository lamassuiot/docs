import { OpenShowcaseDemo } from "@/components/openshowcase-demo";

export function TrustModelsDemo({ locale }: { locale: "en" | "es" }) {
  return <OpenShowcaseDemo name="trust-models-single-hierarchy" locale={locale} />;
}
