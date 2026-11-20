// Explicit editorial dates. Never derive lastmod from build time.
// Update only the routes whose content changed; technical rebuilds do not reset dates.
export const pageDates = Object.freeze({
  "/": "2026-11-21",
  "/reservation/": "2026-11-21",
  "/reservation/privacy/": "2026-11-21",
});
