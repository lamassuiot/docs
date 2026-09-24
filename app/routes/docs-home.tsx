import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { ArrowRight, BadgeCheck, Cpu, KeyRound, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router';
import { asset } from '@/lib/asset';
import { docsPath } from '@/lib/base-path';
import { baseOptions, gitConfig } from '@/lib/layout.shared';
import type { Route } from './+types/docs-home';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Documentación · Lamassu IoT' },
    { name: 'description', content: 'Documentación oficial de la plataforma Lamassu IoT.' },
  ];
}

const sections = [
  {
    icon: asset('images/lamassu.svg'),
    title: 'Plataforma Lamassu IoT',
    description: 'Primeros pasos, conceptos y guías para gestionar claves, CAs, certificados y dispositivos.',
    href: docsPath('platform/pki/overview'),
  },
  {
    icon: asset('images/kubernetes.svg'),
    title: 'Despliegue y operación',
    description: 'Elige entre Kubernetes, AWS Marketplace o SaaS y prepara tu entorno.',
    href: docsPath('deployment/overview'),
  },
];

const capabilities = [
  {
    icon: ShieldCheck,
    title: 'Jerarquía de confianza',
    description: 'Autoridades raíz e intermedias, propias o importadas.',
  },
  {
    icon: KeyRound,
    title: 'Gestión de claves',
    description: 'Software, HSM PKCS#11 o KMS cloud, sin acoplarte a uno.',
  },
  {
    icon: BadgeCheck,
    title: 'Emisión y validación',
    description: 'Emite desde consola o CSR; valida con OCSP y CRL.',
  },
  {
    icon: Cpu,
    title: 'Enrolamiento de dispositivos',
    description: 'EST automático para flotas, sin tocar cada dispositivo.',
  },
];

const navLinks = [
  { text: 'Plataforma', url: docsPath('platform/pki/overview'), active: 'nested-url' as const },
  { text: 'Despliegue', url: docsPath('deployment/overview'), active: 'nested-url' as const },
  { text: 'Referencia de API', url: '/api-reference/ca' },
];

const ScalarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 39 39" width="18" height="18" className="size-[18px] shrink-0">
    <path d="M22.65.05c.4 0 .8.3.8.8v8.8l6-6.2c.3-.4.9-.4 1.1 0l4.6 4.6c.3.3.4.8 0 1v.1l-6 6.2h8.5c.5 0 .8.3.8.8v6.6c0 .5-.3.8-.8.8h-8.6l6.1 6.2c.3.3.4.8 0 1.1l-4.6 4.7c-.2.3-.8.4-1 0l-6-6.2v8.8c0 .5-.4.8-.9.8h-6.4c-.5 0-.8-.3-.8-.8v-4.6c0-1.4.6-2.8 1.5-3.9l8.4-8.5c.9-1 .9-2.5 0-3.4l-8.3-8.5c-1-1-1.6-2.4-1.6-3.8V.85c0-.5.3-.8.8-.8h6.4zm-13.4 3.4h.2l14 14.4c1 1 1 2.5 0 3.4l-14 14.4c-.2.4-.8.4-1 0l-4.8-4.6c-.3-.3-.4-.7 0-1l6-6.4h-8.3c-.5 0-.8-.3-.8-.8v-6.6c0-.5.3-.8.8-.8h8.6l-6.2-6.2a1 1 0 010-1.1l4.5-4.7c.3-.3.8-.3 1 0z" fill="currentColor"/>
  </svg>
);

export default function DocsHome() {
  return (
    <HomeLayout {...baseOptions()} links={navLinks}>
      {/* Hero */}
      <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-fd-border bg-fd-muted px-3 py-1">
              <span className="size-1.5 rounded-full bg-fd-primary" />
              <span className="text-xs font-medium text-fd-muted-foreground">Documentación oficial · Lamassu IoT</span>
            </div>
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-fd-foreground sm:text-5xl">
              Documentación de la plataforma Lamassu IoT
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-fd-muted-foreground">
              Gestiona la PKI y las identidades digitales de tus dispositivos: autoridades de
              certificación, claves, enrolamiento EST y validación, todo desde una única plataforma.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to={docsPath('platform/pki/overview')}
                className="inline-flex h-11 items-center rounded-lg bg-fd-primary px-5 text-sm font-semibold text-fd-primary-foreground shadow-sm transition-colors hover:bg-fd-primary/90"
              >
                Empieza aquí
              </Link>
              <Link
                to="/api-reference/ca"
                className="inline-flex h-11 items-center rounded-lg border border-fd-border px-5 text-sm font-semibold text-fd-foreground transition-colors hover:bg-fd-accent"
              >
                Referencia de API
              </Link>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-fd-border bg-[#0b0b0f] shadow-lg">
            <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5">
              <span className="size-2.5 rounded-full bg-red-500" />
              <span className="size-2.5 rounded-full bg-yellow-500" />
              <span className="size-2.5 rounded-full bg-green-500" />
              <span className="ml-2 font-mono text-xs text-white/45">lamassu-fast-lane.sh</span>
            </div>
            <div className="space-y-1 p-5 font-mono text-[13px] leading-relaxed text-zinc-200">
              <div className="text-white/40"># Despliega Lamassu en tu clúster local</div>
              <div>
                <span className="text-blue-300">./scripts/lamassu-fast-lane.sh</span> \
              </div>
              <div className="pl-4">
                <span className="text-emerald-300">-n</span> \
              </div>
              <div className="pl-4">
                <span className="text-emerald-300">--local-chart-path</span> ./charts/lamassu \
              </div>
              <div className="pl-4">
                <span className="text-emerald-300">--domain</span> lab.lamassu.io \
              </div>
              <div className="pl-4">
                <span className="text-emerald-300">--sample-data</span> \
              </div>
              <div className="pl-4">
                <span className="text-emerald-300">-ip</span> 172.23.30.203
              </div>
              <div className="pt-2 text-white/40"># → clúster listo</div>
              <div className="text-cyan-300">✓ Lamassu disponible en https://lab.lamassu.io</div>
            </div>
          </div>
        </div>
      </div>

      {/* Explore */}
      <div className="mx-auto max-w-6xl px-6 pb-16">
        <div className="text-xs font-bold tracking-wide text-fd-primary">EMPIEZA POR AQUÍ</div>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-fd-foreground">Explora la documentación</h2>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map((section) => (
            <Link
              key={section.href}
              to={section.href}
              className="group flex flex-col gap-4 rounded-xl border border-fd-border bg-fd-card p-6 shadow-sm transition-colors hover:bg-fd-accent/50"
            >
              <span className="flex size-10 items-center justify-center rounded-lg bg-fd-primary/10 text-fd-primary">
                <img src={section.icon} alt="" width={18} height={18} className="size-[18px] object-contain" />
              </span>
              <div>
                <div className="text-[15px] font-semibold text-fd-foreground">{section.title}</div>
                <div className="mt-1.5 text-sm leading-relaxed text-fd-muted-foreground">{section.description}</div>
              </div>
              <div className="mt-auto flex items-center gap-1.5 text-sm font-semibold text-fd-primary">
                Ver documentación
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          ))}

          <Link
            to="/api-reference/ca"
            className="group flex flex-col gap-4 rounded-xl border border-fd-border bg-fd-card p-6 shadow-sm transition-colors hover:bg-fd-accent/50"
          >
            <span className="flex size-10 items-center justify-center rounded-lg bg-fd-primary/10 text-fd-primary">
              <ScalarIcon />
            </span>
            <div>
              <div className="text-[15px] font-semibold text-fd-foreground">Referencia de API</div>
              <div className="mt-1.5 text-sm leading-relaxed text-fd-muted-foreground">
                Explora de forma interactiva los endpoints REST de Lamassu IoT.
              </div>
            </div>
            <div className="mt-auto flex items-center gap-1.5 text-sm font-semibold text-fd-primary">
              Ver documentación
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </div>
          </Link>
        </div>
      </div>

      {/* Capabilities */}
      <div className="border-y border-fd-border bg-fd-muted/40 px-6 py-16">
        <div className="mx-auto max-w-6xl text-center">
          <h2 className="text-2xl font-bold tracking-tight text-fd-foreground">Capacidades principales</h2>
          <p className="mx-auto mt-2.5 max-w-xl text-sm leading-relaxed text-fd-muted-foreground">
            Todo lo necesario para construir y operar la identidad digital de tu flota de dispositivos.
          </p>
        </div>
        <div className="mx-auto mt-10 grid max-w-6xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {capabilities.map(({ icon: Icon, title, description }) => (
            <div key={title} className="text-center">
              <span className="mx-auto flex size-12 items-center justify-center rounded-full border border-fd-border bg-fd-background text-fd-primary">
                <Icon className="size-5" />
              </span>
              <div className="mt-3.5 text-sm font-semibold text-fd-foreground">{title}</div>
              <div className="mt-1 text-xs leading-relaxed text-fd-muted-foreground">{description}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="flex flex-col items-start gap-6 rounded-2xl bg-fd-primary px-8 py-10 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-xl font-bold text-fd-primary-foreground">¿Ves algo que se puede mejorar?</h3>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-fd-primary-foreground/80">
              La documentación es de código abierto: propone cambios o reporta un problema directamente en GitHub.
            </p>
          </div>
          <a
            href={`https://github.com/${gitConfig.user}/${gitConfig.repo}`}
            className="inline-flex h-10 shrink-0 items-center rounded-lg bg-fd-primary-foreground px-5 text-sm font-semibold text-fd-primary transition-opacity hover:opacity-90"
          >
            Ver en GitHub
          </a>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 pb-10 text-center text-xs text-fd-muted-foreground">
        © {new Date().getFullYear()} Lamassu IoT.
      </div>
    </HomeLayout>
  );
}
