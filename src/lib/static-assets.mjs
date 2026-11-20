import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

function assetUrl(file) {
  const bytes = readFileSync(new URL(`../assets/${file}`, import.meta.url));
  return `/assets/${file}?v=${createHash("sha256").update(bytes).digest("hex").slice(0, 12)}`;
}

// Build-time content versions: browsers fetch changed assets after deployment.
// Run the short assignment code as the heading is parsed so it applies before paint.
export const headlineExperiment = `<script>${readFileSync(new URL("../assets/headline-experiment.js", import.meta.url), "utf8").trim()}</script>`;
export const stylesheetUrl = assetUrl("site.css");
export const scriptUrl = assetUrl("site.js");
export const analyticsScriptUrl = assetUrl("analytics.js");
export const callbackScriptUrl = assetUrl("callback.js");
export const roomCheckStylesheetUrl = assetUrl("room-check.css");
export const roomCheckScriptUrl = assetUrl("room-check.js");
export const incomeCalculatorStylesheetUrl = assetUrl("income-calculator.css");
export const incomeCalculatorScriptUrl = assetUrl("income-calculator.js");
export const diagnosisPrefillScriptUrl = assetUrl("diagnosis-prefill.js");

export const reservationStylesheetUrl = assetUrl("reservation.css");
export const reservationScriptUrl = assetUrl("reservation.js");

export const serviceStylesheetUrl = assetUrl("service-pages.css");
export const registrationScriptUrl = assetUrl("room-registration.js");
export const registrationStylesheetUrl = assetUrl("room-registration.css");
