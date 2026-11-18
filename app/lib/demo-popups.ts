import { createDemoPreference } from "@/lib/demo-preference";

/**
 * Whether interactive demos show their step popups (hotspot and tooltip).
 * On by default. Off, the demo plays through as a plain recording.
 */
export const useDemoPopups = createDemoPreference(
  "lamassu-docs:demo-popups",
  true,
);
