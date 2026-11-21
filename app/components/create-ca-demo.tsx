import { OpenShowcaseDemo } from "@/components/openshowcase-demo";

export function CreateCaDemo({ locale }: { locale: "en" | "es" }) {
  return <OpenShowcaseDemo name="create-ca" locale={locale} />;
}
