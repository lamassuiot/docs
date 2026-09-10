import { useEffect, useState } from 'react';

const STORAGE_KEY = 'lamassu-docs-diff-mode';

function readStored(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

/** Shared on/off state for the PR-preview diff toggle, persisted across page navigation. */
export function useDiffMode() {
  const [enabled, setEnabled] = useState(readStored);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, enabled ? '1' : '0');
    } catch {}
  }, [enabled]);

  return [enabled, setEnabled] as const;
}
