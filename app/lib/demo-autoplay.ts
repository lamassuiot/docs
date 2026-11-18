import { createDemoPreference } from "@/lib/demo-preference";

/** Whether interactive demos restart automatically when they finish. On by default. */
export const useDemoAutoplay = createDemoPreference(
  "lamassu-docs:demo-autoplay",
  true,
);
