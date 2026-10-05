/** Slugs relative to the docs mount. Every destination is a canonical page. */
export const DOC_REDIRECTS: Readonly<Record<string, string>> = Object.freeze({
  platform: "platform/overview",
  "platform/pki": "platform/pki/overview",
  "platform/pki/quickstarts": "platform/pki/quickstarts/overview",
  "platform/pki/concepts": "platform/concepts/overview",
  "platform/pki/concepts/overview": "platform/concepts/overview",
  "platform/pki/concepts/architecture": "platform/concepts/architecture",
  "platform/pki/concepts/glossary": "platform/concepts/overview",
  "platform/concepts/glossary": "platform/concepts/overview",
  "platform/pki/quickstarts/register-device":
    "platform/iot-fleets/quickstarts/register-device",
  "platform/pki/device-enrollment": "platform/iot-fleets/enrollment/dms",
  "platform/pki/est-enrollment": "platform/iot-fleets/enrollment/overview",
  "platform/pki/device-management": "platform/iot-fleets/device-management",
  "platform/pki/integrations/aws-iot-core":
    "platform/iot-fleets/integrations/aws-iot-core",
  "platform/pki/integrations": "platform/iot-fleets/integrations/aws-iot-core",
  "platform/pki/access-control": "platform/administration/access-control",
  "platform/pki/audit-logs": "platform/administration/audit-logs",
  "platform/pki/alerts": "platform/administration/alerts",
  "platform/concepts": "platform/concepts/overview",
  "platform/iot-fleets": "platform/iot-fleets/overview",
  "platform/iot-fleets/quickstarts":
    "platform/iot-fleets/quickstarts/register-device",
  "platform/iot-fleets/enrollment": "platform/iot-fleets/enrollment/overview",
  "platform/iot-fleets/integrations":
    "platform/iot-fleets/integrations/aws-iot-core",
  "platform/administration": "platform/administration/access-control",
  deployment: "deployment/overview",
  "deployment/self-hosted": "deployment/self-hosted/overview",
  manual: "platform/overview",
  "manual/inicio": "platform/pki/quickstarts/overview",
  "manual/inicio/primera-ca":
    "platform/pki/quickstarts/create-certificate-authority",
  "manual/inicio/primer-certificado":
    "platform/pki/quickstarts/issue-certificate",
  "manual/inicio/primer-dispositivo":
    "platform/iot-fleets/quickstarts/register-device",
  "manual/conceptos": "platform/concepts/overview",
  "manual/conceptos/arquitectura": "platform/concepts/architecture",
  "manual/conceptos/ciclo-identidad":
    "platform/pki/concepts/certificate-lifecycle",
  "manual/servicios-core/kms": "platform/pki/key-management",
  "manual/servicios-core/cas": "platform/pki/certificate-authorities",
  "manual/servicios-core/certificates": "platform/pki/certificates",
  "manual/servicios-core/validation": "platform/pki/certificate-validation",
  "manual/servicios-core/validation-ocsp": "platform/pki/ocsp",
  "manual/servicios-core/validation-crl": "platform/pki/crl",
  "manual/servicios-core/ra": "platform/iot-fleets/enrollment/dms",
  "manual/servicios-core/est": "platform/iot-fleets/enrollment/overview",
  "manual/servicios-core/devices": "platform/iot-fleets/device-management",
  "manual/servicios-core/alerts": "platform/administration/alerts",
  "manual/integraciones/aws": "platform/iot-fleets/integrations/aws-iot-core",
  despliegue: "deployment/overview",
  "despliegue/onprem": "deployment/self-hosted/overview",
  "despliegue/onprem/fastlane": "deployment/self-hosted/fastlane",
  "despliegue/cloud": "deployment/aws-marketplace",
  "despliegue/saas": "deployment/saas",
});

/** Sections extracted from pages whose main URL remains valid. */
export const DOC_ANCHOR_REDIRECTS: Readonly<
  Record<string, Readonly<Record<string, string>>>
> = {
  "en/platform/pki/troubleshooting": {
    "reproduce-a-single-operation":
      "deployment/troubleshooting#reproduce-a-single-operation",
    "separate-client-gateway-and-service":
      "deployment/troubleshooting#separate-client-gateway-and-service",
    "review-kubernetes-status":
      "deployment/troubleshooting#review-kubernetes-status",
    "query-the-affected-service":
      "deployment/troubleshooting#query-the-affected-service",
    "validate-the-result-from-outside":
      "deployment/troubleshooting#validate-the-result-from-outside",
    "diagnostic-sequence": "deployment/troubleshooting#diagnostic-sequence",
    "minimal-evidence-collection":
      "deployment/troubleshooting#minimal-evidence-collection",
    "i-cannot-sign-in": "deployment/troubleshooting#i-cannot-sign-in",
    "everything-returns-403-or-5xx":
      "deployment/troubleshooting#everything-returns-403-or-5xx",
    "a-pod-is-not-ready": "deployment/troubleshooting#a-pod-is-not-ready",
    "est-enrollment-fails":
      "platform/iot-fleets/enrollment/troubleshooting#est-enrollment-fails",
    "events-are-not-arriving":
      "deployment/troubleshooting#events-are-not-arriving",
    observability: "deployment/troubleshooting#observability",
  },
  "es/platform/pki/troubleshooting": {
    "reproduce-una-sola-operación":
      "deployment/troubleshooting#reproduce-una-sola-operación",
    "separa-cliente-gateway-y-servicio":
      "deployment/troubleshooting#separa-cliente-gateway-y-servicio",
    "revisa-el-estado-de-kubernetes":
      "deployment/troubleshooting#revisa-el-estado-de-kubernetes",
    "consulta-el-servicio-afectado":
      "deployment/troubleshooting#consulta-el-servicio-afectado",
    "valida-el-resultado-desde-fuera":
      "deployment/troubleshooting#valida-el-resultado-desde-fuera",
    "secuencia-de-diagnóstico":
      "deployment/troubleshooting#secuencia-de-diagnóstico",
    "recogida-mínima-de-evidencias":
      "deployment/troubleshooting#recogida-mínima-de-evidencias",
    "no-puedo-iniciar-sesión":
      "deployment/troubleshooting#no-puedo-iniciar-sesión",
    "todo-devuelve-403-o-5xx":
      "deployment/troubleshooting#todo-devuelve-403-o-5xx",
    "un-pod-no-está-ready": "deployment/troubleshooting#un-pod-no-está-ready",
    "el-enrolamiento-est-falla":
      "platform/iot-fleets/enrollment/troubleshooting#el-enrolamiento-est-falla",
    "los-eventos-no-llegan": "deployment/troubleshooting#los-eventos-no-llegan",
    observabilidad: "deployment/troubleshooting#observabilidad",
  },
  "en/platform/pki/overview": {
    "architecture-at-a-glance": "platform/overview#architecture-at-a-glance",
    "automate-device-identities":
      "platform/overview#automate-device-identities",
    "react-to-events": "platform/overview#react-to-events",
    "choose-your-path": "platform/overview#choose-your-path",
    "operational-reference": "platform/overview#operational-reference",
  },
  "es/platform/pki/overview": {
    "arquitectura-de-un-vistazo":
      "platform/overview#arquitectura-de-un-vistazo",
    "automatiza-identidades-de-dispositivos":
      "platform/overview#automatiza-identidades-de-dispositivos",
    "reacciona-a-los-eventos": "platform/overview#reacciona-a-los-eventos",
    "elige-tu-recorrido": "platform/overview#elige-tu-recorrido",
    "referencia-operativa": "platform/overview#referencia-operativa",
  },
  "en/platform/iot-fleets/enrollment/overview": {
    "est-enrollment-over-secure-transport":
      "platform/iot-fleets/enrollment/overview#the-journey",
    "dms-configuration": "platform/iot-fleets/enrollment/dms#configure-a-dms",
    prerequisites: "platform/iot-fleets/enrollment/dms#before-you-begin",
    "enrollment-configuration":
      "platform/iot-fleets/enrollment/dms#enrollment-configuration",
    "enrollment-device-registration":
      "platform/iot-fleets/enrollment/dms#enrollment-device-registration",
    "enrollment-settings":
      "platform/iot-fleets/enrollment/dms#enrollment-settings",
    "issuance-profile": "platform/iot-fleets/enrollment/dms#issuance-profile",
    "re-enrollment-configuration":
      "platform/iot-fleets/enrollment/dms#re-enrollment-configuration",
    "serverkeygen-configuration":
      "platform/iot-fleets/enrollment/dms#serverkeygen",
    "verify-the-configuration":
      "platform/iot-fleets/enrollment/dms#verify-the-endpoints",
    "device-integration":
      "platform/iot-fleets/enrollment/est-client#request-the-identity",
    "before-you-begin":
      "platform/iot-fleets/enrollment/est-client#before-you-begin",
    "flow-overview": "platform/iot-fleets/enrollment/overview#the-journey",
    "client-authentication-model":
      "platform/iot-fleets/enrollment/bootstrap-identity#modes-per-operation",
    "endpoint-reference":
      "platform/iot-fleets/enrollment/est-reference#endpoint-reference",
    cacerts: "platform/iot-fleets/enrollment/est-reference#cacerts",
    simpleenroll: "platform/iot-fleets/enrollment/est-reference#simpleenroll",
    simplereenroll:
      "platform/iot-fleets/enrollment/est-reference#simplereenroll",
    serverkeygen: "platform/iot-fleets/enrollment/est-reference#serverkeygen",
    "full-flows":
      "platform/iot-fleets/quickstarts/enroll-device#enroll-the-device",
    "end-to-end-example-enroll":
      "platform/iot-fleets/quickstarts/enroll-device#enroll-the-device",
    "end-to-end-example-reenroll":
      "platform/iot-fleets/enrollment/renewal-and-recovery#request-the-successor-certificate",
    "next-steps-after-enrollment":
      "platform/iot-fleets/quickstarts/enroll-device#result-and-continuity",
    "diagnostics-and-compatibility":
      "platform/iot-fleets/enrollment/troubleshooting#diagnostics-and-compatibility",
    "error-codes-and-diagnostics":
      "platform/iot-fleets/enrollment/troubleshooting#error-codes-and-diagnostics",
    "compatibility-notes":
      "platform/iot-fleets/enrollment/est-reference#compatibility-notes",
    "est-enrollment-fails":
      "platform/iot-fleets/enrollment/troubleshooting#est-enrollment-fails",
  },
  "es/platform/iot-fleets/enrollment/overview": {
    "est-enrollment-over-secure-transport":
      "platform/iot-fleets/enrollment/overview#el-recorrido",
    "configuración-del-dms":
      "platform/iot-fleets/enrollment/dms#configura-un-dms",
    "requisitos-previos": "platform/iot-fleets/enrollment/dms#antes-de-empezar",
    "configuración-de-enrollment":
      "platform/iot-fleets/enrollment/dms#configuración-de-enrollment",
    "enrollment-device-registration":
      "platform/iot-fleets/enrollment/dms#enrollment-device-registration",
    "enrollment-settings":
      "platform/iot-fleets/enrollment/dms#enrollment-settings",
    "perfil-de-emisión": "platform/iot-fleets/enrollment/dms#perfil-de-emisión",
    "configuración-de-re-enrollment":
      "platform/iot-fleets/enrollment/dms#configuración-de-re-enrollment",
    "configuración-de-serverkeygen":
      "platform/iot-fleets/enrollment/dms#serverkeygen",
    "verificar-la-configuración":
      "platform/iot-fleets/enrollment/dms#verifica-los-endpoints",
    "integración-de-dispositivos":
      "platform/iot-fleets/enrollment/est-client#solicita-la-identidad",
    "antes-de-empezar":
      "platform/iot-fleets/enrollment/est-client#antes-de-empezar",
    "resumen-del-flujo": "platform/iot-fleets/enrollment/overview#el-recorrido",
    "modelo-de-autenticación-del-cliente":
      "platform/iot-fleets/enrollment/bootstrap-identity#modos-por-operación",
    "referencia-de-endpoints":
      "platform/iot-fleets/enrollment/est-reference#referencia-de-endpoints",
    cacerts: "platform/iot-fleets/enrollment/est-reference#cacerts",
    simpleenroll: "platform/iot-fleets/enrollment/est-reference#simpleenroll",
    simplereenroll:
      "platform/iot-fleets/enrollment/est-reference#simplereenroll",
    serverkeygen: "platform/iot-fleets/enrollment/est-reference#serverkeygen",
    "flujos-completos":
      "platform/iot-fleets/quickstarts/enroll-device#enrola-el-dispositivo",
    "ejemplo-end-to-end-enroll":
      "platform/iot-fleets/quickstarts/enroll-device#enrola-el-dispositivo",
    "ejemplo-end-to-end-reenroll":
      "platform/iot-fleets/enrollment/renewal-and-recovery#solicita-el-certificado-sucesor",
    "próximos-pasos-tras-el-enrolamiento":
      "platform/iot-fleets/quickstarts/enroll-device#resultado-y-continuidad",
    "diagnóstico-y-compatibilidad":
      "platform/iot-fleets/enrollment/troubleshooting#diagnóstico-y-compatibilidad",
    "códigos-de-error-y-diagnóstico":
      "platform/iot-fleets/enrollment/troubleshooting#códigos-de-error-y-diagnóstico",
    "notas-de-compatibilidad":
      "platform/iot-fleets/enrollment/est-reference#notas-de-compatibilidad",
    "el-enrolamiento-est-falla":
      "platform/iot-fleets/enrollment/troubleshooting#el-enrolamiento-est-falla",
  },
};

export function canonicalDocPath(path: string): string {
  return Object.hasOwn(DOC_REDIRECTS, path) ? DOC_REDIRECTS[path] : path;
}

export function localizedDocUrl(
  basePath: string,
  locale: string,
  path: string,
): string {
  return `${basePath.replace(/\/+$/, "")}/${locale === "es" ? "es/" : ""}${path}`;
}

export function anchorRedirects(
  basePath: string,
  locale: string,
  path: string,
): Record<string, string> {
  const key = `${locale}/${canonicalDocPath(path)}`;
  const anchors = Object.hasOwn(DOC_ANCHOR_REDIRECTS, key)
    ? DOC_ANCHOR_REDIRECTS[key]
    : {};
  return Object.fromEntries(
    Object.entries(anchors).map(([anchor, target]) => [
      anchor,
      localizedDocUrl(basePath, locale, target),
    ]),
  );
}

/** Works for both SPA navigation and retained pages with extracted sections. */
export function resolveDocRedirect(
  location: Pick<URL, "pathname" | "search" | "hash">,
  basePath: string,
): string | undefined {
  const base = basePath.replace(/\/+$/, "");
  if (!location.pathname.startsWith(`${base}/`)) return undefined;
  const slugs = location.pathname
    .slice(base.length + 1)
    .split("/")
    .filter(Boolean);
  const locale = slugs[0] === "es" ? "es" : "en";
  if (slugs[0] === "es" || slugs[0] === "en") slugs.shift();
  const path = slugs.join("/");
  let anchor = location.hash.slice(1);
  try {
    anchor = decodeURIComponent(anchor);
  } catch {
    /* Preserve malformed fragments. */
  }
  const anchors = anchorRedirects(base, locale, path);
  if (Object.hasOwn(anchors, anchor)) {
    const [targetPath, targetHash] = anchors[anchor].split("#");
    return `${targetPath}${location.search}#${targetHash}`;
  }
  if (!Object.hasOwn(DOC_REDIRECTS, path)) return undefined;
  return `${localizedDocUrl(base, locale, DOC_REDIRECTS[path])}${location.search}${location.hash}`;
}
