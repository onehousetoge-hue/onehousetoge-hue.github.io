import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

export function assetText(file) {
  return readFileSync(new URL(`../assets/${file}`, import.meta.url), "utf8").replaceAll("\r\n", "\n");
}
function assetUrl(file, bytes = assetText(file)) {
  return `/assets/${file}?v=${createHash("sha256").update(bytes).digest("hex").slice(0, 12)}`;
}

// Build-time content versions: browsers fetch changed assets after deployment.
// Run the short assignment code as the heading is parsed so it applies before paint.
export const headlineExperiment = `<script>${assetText("headline-experiment.js").trim()}</script>`;
export const stylesheetUrl = assetUrl("site.css");
export const scriptUrl = assetUrl("site.js");
export const analyticsScriptUrl = assetUrl("analytics.js");
export const callbackScriptUrl = assetUrl("callback.js");
export const roomCheckStylesheetUrl = assetUrl("room-check.css");
export const rentFaqSearchUrl = assetUrl("rent-faq-search.js");
export const legacyEntryScript = `<script data-legacy-entry>${assetText("room-check.js").trim()}</script>`;
export const incomeCalculatorStylesheetUrl = assetUrl("income-calculator.css");
export const incomeCalculatorScriptUrl = assetUrl("income-calculator.js");
export const diagnosisPrefillScriptUrl = assetUrl("diagnosis-prefill.js");

export const reservationStylesheetUrl = assetUrl("reservation.css");
export const reservationScriptUrl = assetUrl("reservation.js");

export const serviceStylesheetUrl = assetUrl("service-pages.css");
export const registrationSource = assetText("room-registration.js")
  .replace('"./room-description.js"', JSON.stringify(assetUrl("room-description.js").replace("/assets/", "./")));
export const registrationScriptUrl = assetUrl("room-registration.js", registrationSource);
export const registrationStylesheetUrl = assetUrl("room-registration.css");
