import { OpenShowcaseDemo } from "@/components/openshowcase-demo";

export function EstEnrollmentDemo({ locale }: { locale: "en" | "es" }) {
  return <OpenShowcaseDemo name="est-enrollment" locale={locale} showGuide />;
}
