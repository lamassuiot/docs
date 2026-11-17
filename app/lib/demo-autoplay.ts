import { useSyncExternalStore } from "react";

const KEY = "lamassu-docs:demo-autoplay";
const listeners = new Set<() => void>();

function read(): boolean {
  try {
    return window.localStorage.getItem(KEY) !== "off";
  } catch {
    return true;
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

/** Whether interactive demos restart automatically when they finish. On by default. */
export function useDemoAutoplay(): [boolean, (value: boolean) => void] {
  const value = useSyncExternalStore(subscribe, read, () => true);
  const set = (next: boolean) => {
    try {
      window.localStorage.setItem(KEY, next ? "on" : "off");
    } catch {
      // Preference just won't persist.
    }
    for (const listener of listeners) listener();
  };
  return [value, set];
}
