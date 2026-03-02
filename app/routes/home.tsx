import { useEffect } from 'react';
import type { Route } from './+types/home';

const LANDING_PATH = '/index.html';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Lamassu IoT Docs' },
    {
      name: 'description',
      content: 'Lamassu IoT documentation home.',
    },
    {
      httpEquiv: 'refresh',
      content: `0; url=${LANDING_PATH}`,
    },
  ];
}

export default function Home() {
  useEffect(() => {
    window.location.replace(LANDING_PATH);
  }, []);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[800px] items-center justify-center p-8 text-center">
      <p>
        Redirecting to the docs landing page.{' '}
        <a href={LANDING_PATH} className="underline">
          Continue
        </a>
      </p>
    </main>
  );
}
