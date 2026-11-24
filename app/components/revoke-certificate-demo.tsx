import { OpenShowcaseDemo } from "@/components/openshowcase-demo";

export function RevokeCertificateDemo({ locale }: { locale: "en" | "es" }) {
  return <OpenShowcaseDemo name="revoke-certificate" locale={locale} />;
}
