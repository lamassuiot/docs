import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { Link } from 'react-router';
import { baseOptions } from '@/lib/layout.shared';
import type { Route } from './+types/home';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Documentación · Lamassu IoT' },
    { name: 'description', content: 'Documentación oficial de la plataforma Lamassu IoT.' },
  ];
}

const sections = [
  {
    icon: '/images/lamassu.svg',
    title: 'Manual de Usuario',
    description: 'Servicios core (KMS, CA, RA, VA), gestión de dispositivos e integraciones con terceros.',
    href: '/docs/manual',
  },
  {
    icon: '/images/kubernetes.svg',
    title: 'Despliegue',
    description: 'Instalación y configuración en Kubernetes, AWS EC2 y AWS Marketplace.',
    href: '/docs/despliegue',
  },
];

export default function DocsHome() {
  return (
    <HomeLayout {...baseOptions()}>
      <div className="mx-auto max-w-2xl px-6 py-14">
        <h1 className="text-xl font-semibold text-fd-foreground">Documentación</h1>
        <p className="mt-1 text-sm text-fd-muted-foreground">
          Selecciona la sección que necesitas.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {sections.map((section) => (
            <Link
              key={section.href}
              to={section.href}
              className="group flex gap-4 rounded-lg border border-fd-border bg-fd-card p-5 transition-colors hover:bg-fd-accent"
            >
              <img
                src={section.icon}
                alt=""
                width={24}
                height={24}
                className="mt-0.5 size-6 shrink-0 object-contain"
              />
              <div className="min-w-0">
                <div className="text-sm font-medium text-fd-foreground">{section.title}</div>
                <div className="mt-1 text-xs leading-relaxed text-fd-muted-foreground">
                  {section.description}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </HomeLayout>
  );
}
