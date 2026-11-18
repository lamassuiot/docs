import { useSyncExternalStore } from "react";

/**
 * A boolean reader preference kept in localStorage and shared by every
 * component (and tab) that uses it. `fallback` applies until the reader
 * picks a value, and on the server.
 */
export function createDemoPreference(key: string, fallback: boolean) {
  const listeners = new Set<() => void>();
  const stored = fallback ? "off" : "on";

  function read(): boolean {
    try {
      const value = window.localStorage.getItem(key);
      return value === null ? fallback : value !== stored;
    } catch {
      return fallback;
    }
  }

  function subscribe(listener: () => void) {
    listeners.add(listener);
    window.addEventListener("storage", listener);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", listener);
    };
  }

  return function usePreference(): [boolean, (value: boolean) => void] {
    const value = useSyncExternalStore(subscribe, read, () => fallback);
    const set = (next: boolean) => {
      try {
        window.localStorage.setItem(key, next ? "on" : "off");
      } catch {
        // Preference just won't persist.
      }
      for (const listener of listeners) listener();
    };
    return [value, set];
  };
}
