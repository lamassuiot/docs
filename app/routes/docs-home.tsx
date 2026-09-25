import { HomeLayout } from "fumadocs-ui/layouts/home";
import { ArrowRight } from "lucide-react";
import { Link, useLocation } from "react-router";
import { asset } from "@/lib/asset";
import { docsPath } from "@/lib/base-path";
import { baseOptions, gitConfig } from "@/lib/layout.shared";
import { type Locale, localeFromPath } from "@/lib/locales";
import type { Route } from "./+types/docs-home";

export function meta({ location }: Route.MetaArgs) {
  const locale = localeFromPath(location.pathname);
  const t = locale === "es" ? ES_COPY : EN_COPY;
  return [
    { title: t.metaTitle },
    { name: "description", content: t.metaDescription },
  ];
}

export const links: Route.LinksFunction = () => [
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap",
  },
];

type Copy = {
  metaTitle: string;
  metaDescription: string;
  heroTitle: string;
  heroDescription: string;
  startHere: string;
  apiReference: string;
  scriptComment1: string;
  scriptComment2: string;
  scriptReady: string;
  scriptUp: string;
  exploreLabel: string;
  exploreTitle: string;
  viewDocs: string;
  capabilitiesTitle: string;
  capabilitiesDescription: string;
  ctaTitle: string;
  ctaDescription: string;
  ctaGithub: string;
  sections: { title: string; description: string }[];
  capabilities: { title: string; description: string }[];
  navLinks: string[];
};

const EN_COPY: Copy = {
  metaTitle: "Documentation · Lamassu IoT",
  metaDescription: "Official documentation for the Lamassu IoT platform.",
  heroTitle: "Lamassu IoT platform documentation",
  heroDescription:
    "Manage your devices’ PKI and digital identities: certificate authorities, keys, EST enrollment and validation, all from one platform.",
  startHere: "Start here",
  apiReference: "API reference",
  scriptComment1: "# 1. Find your primary interface IP",
  scriptComment2: "# 2. Deploy Lamassu with that IP",
  scriptReady: "# → cluster ready",
  scriptUp: "Lamassu available at https://lamassu.mypki",
  exploreLabel: "START HERE",
  exploreTitle: "Explore the documentation",
  viewDocs: "View documentation",
  capabilitiesTitle: "Core capabilities",
  capabilitiesDescription:
    "Everything needed to build and operate your fleet’s digital identity.",
  ctaTitle: "See something that could improve?",
  ctaDescription:
    "The documentation is open source: propose changes or report an issue directly on GitHub.",
  ctaGithub: "View on GitHub",
  sections: [
    {
      title: "Lamassu IoT platform",
      description:
        "Getting started, concepts and guides for managing keys, CAs, certificates and devices.",
    },
    {
      title: "Deployment and operation",
      description:
        "Choose between Kubernetes, AWS Marketplace or SaaS and prepare your environment.",
    },
  ],
  capabilities: [
    {
      title: "Trust hierarchy",
      description:
        "Root and intermediate authorities, self-managed or imported.",
    },
    {
      title: "Key management",
      description:
        "Software, PKCS#11 HSM or cloud KMS, without coupling to one.",
    },
    {
      title: "Issuance and validation",
      description: "Issue from console or CSR; validate with OCSP and CRL.",
    },
    {
      title: "Device enrollment",
      description: "Automatic EST for fleets, without touching each device.",
    },
  ],
  navLinks: ["Platform", "Deployment", "API reference"],
};

const ES_COPY: Copy = {
  metaTitle: "Documentación · Lamassu IoT",
  metaDescription: "Documentación oficial de la plataforma Lamassu IoT.",
  heroTitle: "Documentación de la plataforma Lamassu IoT",
  heroDescription:
    "Gestiona la PKI y las identidades digitales de tus dispositivos: autoridades de certificación, claves, enrolamiento EST y validación, todo desde una única plataforma.",
  startHere: "Empieza aquí",
  apiReference: "Referencia de API",
  scriptComment1: "# 1. Encuentra la IP de tu interfaz principal",
  scriptComment2: "# 2. Despliega Lamassu con esa IP",
  scriptReady: "# → clúster listo",
  scriptUp: "Lamassu disponible en https://lamassu.mypki",
  exploreLabel: "EMPIEZA POR AQUI",
  exploreTitle: "Explora la documentación",
  viewDocs: "Ver documentación",
  capabilitiesTitle: "Capacidades principales",
  capabilitiesDescription:
    "Todo lo necesario para construir y operar la identidad digital de tu flota de dispositivos.",
  ctaTitle: "¿Ves algo que se puede mejorar?",
  ctaDescription:
    "La documentación es de código abierto: propone cambios o reporta un problema directamente en GitHub.",
  ctaGithub: "Ver en GitHub",
  sections: [
    {
      title: "Plataforma Lamassu IoT",
      description:
        "Primeros pasos, conceptos y guías para gestionar claves, CAs, certificados y dispositivos.",
    },
    {
      title: "Despliegue y operación",
      description:
        "Elige entre Kubernetes, AWS Marketplace o SaaS y prepara tu entorno.",
    },
  ],
  capabilities: [
    {
      title: "Jerarquía de confianza",
      description: "Autoridades raíz e intermedias, propias o importadas.",
    },
    {
      title: "Gestión de claves",
      description: "Software, HSM PKCS#11 o KMS cloud, sin acoplarte a uno.",
    },
    {
      title: "Emisión y validación",
      description: "Emite desde consola o CSR; valida con OCSP y CRL.",
    },
    {
      title: "Enrolamiento de dispositivos",
      description: "EST automático para flotas, sin tocar cada dispositivo.",
    },
  ],
  navLinks: ["Plataforma", "Despliegue", "Referencia de API"],
};

const sections = [
  { icon: asset("images/lamassu.svg") },
  { icon: asset("images/kubernetes-white.svg") },
];

const sectionHrefs: Record<Locale, string[]> = {
  en: [docsPath("platform/pki/overview"), docsPath("deployment/overview")],
  es: [
    docsPath("es/platform/pki/overview"),
    docsPath("es/deployment/overview"),
  ],
};

const navHrefs: Record<Locale, string[]> = {
  en: [docsPath("platform/pki/overview"), docsPath("deployment/overview")],
  es: [
    docsPath("es/platform/pki/overview"),
    docsPath("es/deployment/overview"),
  ],
};

function navLinksFor(locale: Locale) {
  return [
    {
      text: locale === "es" ? ES_COPY.navLinks[0] : EN_COPY.navLinks[0],
      url: navHrefs[locale][0],
      active: "nested-url" as const,
    },
    {
      text: locale === "es" ? ES_COPY.navLinks[1] : EN_COPY.navLinks[1],
      url: navHrefs[locale][1],
      active: "nested-url" as const,
    },
    {
      text: locale === "es" ? ES_COPY.navLinks[2] : EN_COPY.navLinks[2],
      url: "/api-reference/ca",
    },
  ];
}

const ScalarIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 39 39"
    width="18"
    height="18"
    aria-hidden
    className="size-[18px] shrink-0"
  >
    <title>Scalar</title>
    <path
      d="M22.65.05c.4 0 .8.3.8.8v8.8l6-6.2c.3-.4.9-.4 1.1 0l4.6 4.6c.3.3.4.8 0 1v.1l-6 6.2h8.5c.5 0 .8.3.8.8v6.6c0 .5-.3.8-.8.8h-8.6l6.1 6.2c.3.3.4.8 0 1.1l-4.6 4.7c-.2.3-.8.4-1 0l-6-6.2v8.8c0 .5-.4.8-.9.8h-6.4c-.5 0-.8-.3-.8-.8v-4.6c0-1.4.6-2.8 1.5-3.9l8.4-8.5c.9-1 .9-2.5 0-3.4l-8.3-8.5c-1-1-1.6-2.4-1.6-3.8V.85c0-.5.3-.8.8-.8h6.4zm-13.4 3.4h.2l14 14.4c1 1 1 2.5 0 3.4l-14 14.4c-.2.4-.8.4-1 0l-4.8-4.6c-.3-.3-.4-.7 0-1l6-6.4h-8.3c-.5 0-.8-.3-.8-.8v-6.6c0-.5.3-.8.8-.8h8.6l-6.2-6.2a1 1 0 010-1.1l4.5-4.7c.3-.3.8-.3 1 0z"
      fill="currentColor"
    />
  </svg>
);

export default function DocsHome() {
  const { pathname } = useLocation();
  const locale: Locale = localeFromPath(pathname);
  const t = locale === "es" ? ES_COPY : EN_COPY;

  return (
    <HomeLayout {...baseOptions()} links={navLinksFor(locale)}>
      <style>{HOME_CSS}</style>
      <div className="lm-home">
        <div className="lm-page">
          {/* Hero */}
          <section className="lm-hero">
            <div className="lm-hero-copy">
              <h1>{t.heroTitle}</h1>
              <p className="lm-lead">{t.heroDescription}</p>
              <div className="lm-actions">
                <Link
                  to={sectionHrefs[locale][0]}
                  className="lm-btn lm-btn-primary"
                >
                  {t.startHere}
                </Link>
                <Link to="/api-reference/ca" className="lm-btn">
                  {t.apiReference}
                </Link>
              </div>
            </div>

            <div className="lm-console">
              <div className="lm-console-head">
                <span className="lm-console-dot" />
                <span className="lm-console-dot" />
                <span className="lm-console-dot" />
                <span className="lm-console-caption">
                  lamassu · lamassu-fast-lane.sh
                </span>
              </div>
              <div className="lm-console-body">
                <div className="lm-c-comment">{t.scriptComment1}</div>
                <div>
                  <span className="lm-c-prompt">$</span>{" "}
                  <span className="lm-c-cmd">ip a</span>
                </div>
                <div className="lm-c-out">
                  2: eth0: ... inet 192.168.1.101/24 ...
                </div>
                <div className="lm-c-comment lm-c-gap">{t.scriptComment2}</div>
                <div className="lm-c-wrap">
                  <span className="lm-c-prompt">$</span>{" "}
                  <span className="lm-c-cmd">curl</span> -fsSL{" "}
                  <span className="lm-c-str">
                    "https://raw.githubusercontent.com/lamassuiot/lamassu-helm/refs/heads/main/scripts/lamassu-fast-lane.sh"
                  </span>{" "}
                  | <span className="lm-c-cmd">bash</span> -s -- \
                </div>
                <div className="lm-c-indent">
                  <span className="lm-c-flag">-n</span> \
                </div>
                <div className="lm-c-indent">
                  <span className="lm-c-flag">--domain</span> lamassu.mypki \
                </div>
                <div className="lm-c-indent">
                  <span className="lm-c-flag">--sample-data</span> \
                </div>
                <div className="lm-c-indent">
                  <span className="lm-c-flag">-ip</span> 192.168.1.101
                </div>
                <div className="lm-c-comment lm-c-gap">{t.scriptReady}</div>
                <div className="lm-c-ok">
                  ✓ {t.scriptUp}
                  <span className="lm-c-cursor" />
                </div>
              </div>
            </div>
          </section>

          {/* Explore */}
          <section className="lm-section">
            <p className="lm-kicker">{t.exploreLabel}</p>
            <h2>{t.exploreTitle}</h2>
            <div className="lm-waves">
              {sections.map((section, index) => (
                <Link
                  key={sectionHrefs[locale][index]}
                  to={sectionHrefs[locale][index]}
                  className={`lm-wave lm-wave--${WAVE_TONES[index]}`}
                >
                  <img
                    src={section.icon}
                    alt=""
                    aria-hidden
                    className="lm-wave-mark"
                  />
                  <span className="lm-wave-index">0{index + 1}</span>
                  <span className="lm-wave-label">{t.navLinks[index]}</span>
                  <h3>{t.sections[index].title}</h3>
                  <p>{t.sections[index].description}</p>
                  <span className="lm-wave-cta">
                    {t.viewDocs}
                    <ArrowRight className="size-3.5" />
                  </span>
                </Link>
              ))}
              <Link to="/api-reference/ca" className="lm-wave lm-wave--api">
                <span className="lm-wave-mark lm-wave-mark--svg" aria-hidden>
                  <ScalarIcon />
                </span>
                <span className="lm-wave-index">0{sections.length + 1}</span>
                <span className="lm-wave-label">{t.navLinks[2]}</span>
                <h3>{t.apiReference}</h3>
                <p>
                  {locale === "es"
                    ? "Explora de forma interactiva los endpoints REST de Lamassu IoT."
                    : "Explore the REST endpoints of Lamassu IoT interactively."}
                </p>
                <span className="lm-wave-cta">
                  {t.viewDocs}
                  <ArrowRight className="size-3.5" />
                </span>
              </Link>
            </div>
          </section>

          {/* CTA */}
          <section className="lm-section">
            <div className="flex flex-col items-start gap-6 rounded-2xl bg-fd-primary px-8 py-10 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-xl font-bold text-fd-primary-foreground">
                  {t.ctaTitle}
                </h3>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-fd-primary-foreground/80">
                  {t.ctaDescription}
                </p>
              </div>
              <a
                href={`https://github.com/${gitConfig.user}/${gitConfig.repo}`}
                className="inline-flex h-10 shrink-0 items-center rounded-lg bg-fd-primary-foreground px-5 text-sm font-semibold text-fd-primary transition-opacity hover:opacity-90"
              >
                {t.ctaGithub}
              </a>
            </div>
          </section>

          <footer className="lm-footer">
            © {new Date().getFullYear()} Lamassu IoT.
          </footer>
        </div>
      </div>
    </HomeLayout>
  );
}
const WAVE_TONES = ["reg", "pqc"];

const HOME_CSS = `
.lm-home {
  --lm-bg: #f4f6fa;
  --lm-surface: #ffffff;
  --lm-surface-soft: #f6f8fd;
  --lm-border: #d8deeb;
  --lm-title: #0f1728;
  --lm-text: #36455f;
  --lm-muted: #5f6e8c;
  --lm-accent: #405fff;
  --lm-accent-hover: #334ffc;
  --lm-accent-text: #ffffff;
  --lm-dots: rgba(37, 55, 95, 0.34);
  background: var(--lm-bg);
  color: var(--lm-text);
  font-family: 'Manrope', sans-serif;
  flex: 1;
}
.dark .lm-home {
  --lm-bg: #09111f;
  --lm-surface: #10192c;
  --lm-surface-soft: #15233a;
  --lm-border: #243550;
  --lm-title: #edf3ff;
  --lm-text: #bcc9df;
  --lm-muted: #8fa1c3;
  --lm-accent: #7e9cff;
  --lm-accent-hover: #95adff;
  --lm-accent-text: #08101e;
  --lm-dots: rgba(143, 165, 228, 0.38);
}
.lm-home { position: relative; overflow-x: clip; }
.lm-home::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image: radial-gradient(circle, var(--lm-dots) 1px, transparent 1px);
  background-size: 16px 16px;
  opacity: 0.3;
  mask-image: linear-gradient(180deg, rgba(0,0,0,.72) 0%, rgba(0,0,0,.24) 48%, transparent 84%);
}
.lm-page {
  width: min(1360px, calc(100% - 48px));
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.lm-kicker {
  margin: 0;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  letter-spacing: 0.06em;
  color: var(--lm-muted);
}

.lm-hero {
  padding: 72px 0 56px;
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
  gap: 56px;
  align-items: center;
}
.lm-hero-copy { display: grid; gap: 16px; }
.lm-hero h1 {
  margin: 0;
  color: var(--lm-title);
  font-size: clamp(38px, 6vw, 72px);
  font-weight: 800;
  line-height: 1.02;
  letter-spacing: -0.03em;
}
.lm-lead {
  margin: 0;
  font-size: clamp(17px, 2.2vw, 21px);
  line-height: 1.5;
}
.lm-actions { margin-top: 8px; display: flex; flex-wrap: wrap; gap: 10px; }
.lm-btn {
  display: inline-flex;
  align-items: center;
  text-decoration: none;
  border: 1px solid var(--lm-border);
  background: var(--lm-surface);
  color: var(--lm-title);
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  transition: border-color .15s ease, background-color .15s ease;
}
.lm-btn:hover { border-color: var(--lm-muted); }
.lm-btn-primary {
  background: var(--lm-accent);
  border-color: transparent;
  color: var(--lm-accent-text);
}
.lm-btn-primary:hover { background: var(--lm-accent-hover); border-color: transparent; }

.lm-console {
  border: 1px solid var(--lm-border);
  border-radius: 12px;
  background: var(--lm-surface);
  overflow: hidden;
  box-shadow: 0 24px 60px -30px rgba(20, 40, 100, 0.35);
}
.lm-console-head {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--lm-border);
  background: var(--lm-surface-soft);
}
.lm-console-dot { width: 9px; height: 9px; border-radius: 50%; background: var(--lm-border); }
.lm-console-caption {
  margin-left: 8px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.08em;
  color: var(--lm-muted);
}
.lm-console-body {
  padding: 20px 20px 22px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12.5px;
  line-height: 1.85;
  color: var(--lm-title);
  overflow-x: auto;
}
.lm-c-comment { color: var(--lm-muted); }
.lm-c-gap { margin-top: 10px; }
.lm-c-prompt { color: var(--lm-accent); font-weight: 700; }
.lm-c-cmd { color: var(--lm-accent); }
.lm-c-str { color: #0e7490; word-break: break-all; }
.dark .lm-c-str { color: #6fd3ff; }
.lm-c-flag { color: #7c3aed; }
.dark .lm-c-flag { color: #b7a4ff; }
.lm-c-out { padding-left: 16px; color: var(--lm-muted); }
.lm-c-indent { padding-left: 24px; }
.lm-c-ok { display: flex; align-items: center; gap: 8px; color: #15803d; font-weight: 600; }
.dark .lm-c-ok { color: #4ade80; }
.lm-c-cursor {
  display: inline-block;
  width: 7px;
  height: 14px;
  background: currentColor;
  animation: lm-blink 1.1s steps(1) infinite;
}
@keyframes lm-blink { 50% { opacity: 0; } }

.lm-section { padding-top: 108px; }
.lm-hero + .lm-section { padding-top: 24px; }
.lm-section h2 {
  margin: 8px 0 0;
  color: var(--lm-title);
  font-size: clamp(28px, 5vw, 48px);
  font-weight: 800;
  line-height: 1.08;
  letter-spacing: -0.03em;
}
.lm-section-lead {
  margin: 12px 0 0;
  max-width: 640px;
  font-size: 17px;
  line-height: 1.56;
}

.lm-waves {
  margin-top: 32px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;
}
.lm-wave {
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 32px;
  border-radius: 20px;
  border: 1px solid transparent;
  text-decoration: none;
  transition: transform .2s ease, box-shadow .2s ease;
}
.lm-wave:hover { transform: translateY(-3px); }
.lm-wave--reg { background: linear-gradient(150deg, #0c1e3d, #123055 55%, #0e2748); border-color: #4ac2f538; }
.lm-wave--reg:hover { box-shadow: 0 22px 48px #145aa047; }
.lm-wave--pqc { background: linear-gradient(150deg, #150d33, #241570 55%, #1a1060); border-color: #7e9cff42; }
.lm-wave--pqc:hover { box-shadow: 0 22px 48px #5a3cdc4d; }
.lm-wave--api { background: linear-gradient(150deg, #0a2230, #0f3a47 55%, #0b2c38); border-color: #4af5a833; }
.lm-wave--api:hover { box-shadow: 0 22px 48px #13a07a40; }
.lm-wave-mark {
  position: absolute;
  top: 22px;
  right: 22px;
  width: 72px;
  height: 72px;
  object-fit: contain;
  opacity: 0.85;
  filter: brightness(0) invert(1);
}
.lm-wave-mark--svg { display: grid; place-items: center; color: #4af5a8; opacity: 0.35; filter: none; }
.lm-wave-mark--svg svg { width: 60px !important; height: 60px !important; }
.lm-wave-index {
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  font-weight: 600;
  color: #ffffff52;
  letter-spacing: 0.05em;
}
.lm-wave-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
.lm-wave--reg .lm-wave-label { color: #6fd3ff; }
.lm-wave--pqc .lm-wave-label { color: #b7a4ff; }
.lm-wave--api .lm-wave-label { color: #7ff0c0; }
.lm-wave h3 { margin: 0; color: #f3f7ff; font-size: 23px; font-weight: 700; letter-spacing: -0.01em; }
.lm-wave p { margin: 0; color: #c3d0e8; font-size: 15px; line-height: 1.6; }
.lm-wave-cta {
  margin-top: auto;
  padding-top: 10px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #f3f7ff;
  font-size: 14px;
  font-weight: 700;
}
.lm-wave-cta svg { transition: transform .2s ease; }
.lm-wave:hover .lm-wave-cta svg { transform: translateX(3px); }



.lm-footer {
  margin-top: 72px;
  padding: 24px 0 40px;
  border-top: 1px solid var(--lm-border);
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: var(--lm-muted);
}

@media (max-width: 1024px) {
  .lm-hero { grid-template-columns: 1fr; gap: 40px; }
  .lm-waves { grid-template-columns: 1fr; }
}
@media (max-width: 640px) {
  .lm-page { width: calc(100% - 32px); }
  .lm-hero { padding-top: 48px; }
  .lm-section { padding-top: 72px; }
  .lm-hero + .lm-section { padding-top: 16px; }
}
`;
