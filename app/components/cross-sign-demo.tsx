import { OpenShowcaseDemo } from "@/components/openshowcase-demo";

export function CrossSignDemo({ locale }: { locale: "en" | "es" }) {
  return <OpenShowcaseDemo name="trust-models-cross-sign" locale={locale} />;
}
