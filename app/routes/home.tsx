import type { Route } from './+types/home';
import { Link } from 'react-router';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Lamassu IoT – PKI industrial para identidades IoT' },
    {
      name: 'description',
      content:
        'Centraliza claves, autoridades de certificación, emisión, validación y ciclo de vida de dispositivos en una sola plataforma preparada para operación industrial.',
    },
  ];
}

const integrations = [
  'AWS IoT Core',
  'Kubernetes',
  'HashiCorp Vault',
  'PKCS#11 HSM',
  'RabbitMQ',
  'SNS / SQS',
];

const navLinks = [
  { label: 'Docs', to: '/docs' },
  { label: 'GitHub', href: 'https://github.com/lamassuiot/lamassu-compose', external: true },
];

function LamassuLogo() {
  return (
    <span className="flex items-center gap-2 font-bold text-white text-lg tracking-wide">
      {/* Simple stylised "L" mark */}
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
        <rect width="28" height="28" rx="6" fill="white" fillOpacity="0.12" />
        <path d="M8 7h4v10h6v3H8V7Z" fill="white" />
      </svg>
      Lamassu IoT
    </span>
  );
}

/** Diamond / chip SVG centrepiece */
function ChipDiamond() {
  return (
    <div className="relative w-56 h-56 md:w-72 md:h-72 mx-auto">
      {/* Outer glow ring */}
      <div className="absolute inset-0 rounded-full bg-blue-500/10 blur-3xl" />

      {/* Diamond shape */}
      <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl" fill="none">
        {/* Dashed outer ring */}
        <circle cx="100" cy="100" r="92" stroke="rgba(99,179,237,0.25)" strokeWidth="1" strokeDasharray="4 4" />
        {/* Diamond border */}
        <path
          d="M100 12 L188 100 L100 188 L12 100 Z"
          fill="rgba(59,130,246,0.18)"
          stroke="rgba(99,179,237,0.5)"
          strokeWidth="1.5"
        />
        {/* Inner diamond */}
        <path
          d="M100 40 L160 100 L100 160 L40 100 Z"
          fill="rgba(37,99,235,0.35)"
          stroke="rgba(147,197,253,0.4)"
          strokeWidth="1"
        />
        {/* Circuit lines */}
        <line x1="100" y1="12" x2="100" y2="40" stroke="rgba(147,197,253,0.4)" strokeWidth="1" />
        <line x1="188" y1="100" x2="160" y2="100" stroke="rgba(147,197,253,0.4)" strokeWidth="1" />
        <line x1="100" y1="188" x2="100" y2="160" stroke="rgba(147,197,253,0.4)" strokeWidth="1" />
        <line x1="12" y1="100" x2="40" y2="100" stroke="rgba(147,197,253,0.4)" strokeWidth="1" />
        {/* Centre icon – shield-key */}
        <g transform="translate(78, 78)">
          <path d="M22 2L4 9v7c0 9.5 7.7 17.1 18 19 10.3-1.9 18-9.5 18-19V9L22 2z"
            fill="rgba(147,197,253,0.15)" stroke="rgba(147,197,253,0.6)" strokeWidth="1.5" />
          <circle cx="22" cy="18" r="4" fill="rgba(147,197,253,0.7)" />
          <path d="M22 22v5" stroke="rgba(147,197,253,0.7)" strokeWidth="1.5" strokeLinecap="round" />
        </g>
      </svg>

      {/* Floating labels */}
      {[
        { label: 'EST RFC 7030', pos: '-left-4 top-8' },
        { label: 'AWS KMS / HSM', pos: '-right-6 top-8' },
        { label: 'OCSP + CRL', pos: '-left-4 bottom-8' },
        { label: 'ZERO-TOUCH', pos: '-right-6 bottom-8' },
      ].map(({ label, pos }) => (
        <span
          key={label}
          className={`absolute ${pos} text-[10px] font-mono text-blue-200/70 border border-blue-400/20 rounded px-1.5 py-0.5 bg-blue-950/60 whitespace-nowrap pointer-events-none`}
        >
          {label}
        </span>
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col" style={{
      background: 'radial-gradient(ellipse at 60% 0%, #1e3a8a 0%, #1e1b4b 40%, #0f0c29 100%)',
    }}>

      {/* ── Nav ── */}
      <header className="w-full flex items-center justify-between px-6 md:px-12 py-5 border-b border-white/5">
        <LamassuLogo />
        <nav className="flex items-center gap-6">
          {navLinks.map((l) =>
            l.external ? (
              <a
                key={l.label}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-200/70 hover:text-white transition-colors"
              >
                {l.label}
              </a>
            ) : (
              <Link
                key={l.label}
                to={l.to!}
                className="text-sm text-blue-200/70 hover:text-white transition-colors"
              >
                {l.label}
              </Link>
            ),
          )}
        </nav>
      </header>

      {/* ── Hero ── */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-16 md:py-24 relative overflow-hidden">

        {/* Background diagonal decoration lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-10" aria-hidden>
          <line x1="0" y1="30%" x2="100%" y2="70%" stroke="white" strokeWidth="0.5" />
          <line x1="0" y1="50%" x2="100%" y2="90%" stroke="white" strokeWidth="0.5" />
          <line x1="20%" y1="0" x2="80%" y2="100%" stroke="white" strokeWidth="0.5" />
        </svg>

        {/* Eyebrow */}
        <p className="text-xs font-mono tracking-[0.25em] text-blue-300/60 uppercase mb-4">
          Lamassu IoT &nbsp;·&nbsp; IoT-First PKI Platform · Industrial Certificate Lifecycle Management
        </p>

        {/* Headline */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.08] max-w-4xl mb-6">
          PKI industrial para gestionar identidades IoT de extremo a extremo
        </h1>

        {/* Subheadline */}
        <p className="text-base md:text-lg text-blue-100/60 max-w-xl mb-10 leading-relaxed">
          Centraliza claves, autoridades de certificación, emisión, validación y ciclo de vida de
          dispositivos en una sola plataforma preparada para operación industrial.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap gap-4 justify-center mb-14">
          <Link
            to="/docs"
            className="px-6 py-3 rounded-full font-semibold text-sm bg-cyan-400 text-slate-900 hover:bg-cyan-300 transition-colors shadow-lg shadow-cyan-500/20"
          >
            Ver documentación
          </Link>
          <Link
            to="/docs/manual"
            className="px-6 py-3 rounded-full font-semibold text-sm border border-white/20 text-white hover:bg-white/10 transition-colors"
          >
            Manual de Usuario
          </Link>
        </div>

        {/* Integration badges */}
        <div className="flex flex-wrap gap-2 justify-center mb-16">
          {integrations.map((name) => (
            <span
              key={name}
              className="flex items-center gap-1.5 text-xs font-mono text-blue-200/70 border border-blue-400/20 rounded-full px-3 py-1 bg-blue-950/40"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 inline-block" />
              {name.toUpperCase()}
            </span>
          ))}
        </div>

        {/* Chip diagram */}
        <ChipDiamond />
      </main>

      {/* ── Footer ── */}
      <footer className="text-center py-6 text-xs text-blue-200/30 border-t border-white/5">
        © {new Date().getFullYear()} Lamassu IoT
      </footer>
    </div>
  );
}
