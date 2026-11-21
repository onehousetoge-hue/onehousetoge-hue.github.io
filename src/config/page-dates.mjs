// Explicit editorial dates. Never derive lastmod from build time.
// Update only the routes whose content changed; technical rebuilds do not reset dates.
export const pageDates = Object.freeze({
  "/": "2026-11-22",
  "/about/": "2026-11-21",
  "/how-it-works/": "2026-11-22",
  "/consultation/": "2026-11-21",
  "/rooms/register/": "2026-11-22",
  "/reservation/": "2026-11-21",
  "/reservation/privacy/": "2026-11-21",
});
