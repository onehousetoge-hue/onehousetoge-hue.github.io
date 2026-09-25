// Explicit editorial dates. Never derive lastmod from build time.
// Update only the routes whose content changed; technical rebuilds do not reset dates.
export const pageDates = Object.freeze({
  "/": "2026-09-25", "/about/": "2026-09-25", "/programs/": "2026-09-24",
  "/programs/senior-home-consulting/": "2026-09-25",
  "/programs/intergenerational-volunteer/": "2026-09-25",
  "/programs/housing-research/": "2026-09-24",
  "/resources/": "2026-09-25", "/activities/": "2026-09-25",
  "/activities/field-records/": "2026-09-24", "/transparency/": "2026-09-25",
  "/participate/": "2026-09-24", "/contact/": "2026-09-24",
  "/privacy/": "2026-09-25", "/terms/": "2026-09-24",
  "/consultation/": "2026-09-25", "/partnership/": "2026-09-25",
});
