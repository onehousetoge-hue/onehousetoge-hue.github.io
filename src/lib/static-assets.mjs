import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

function assetUrl(file) {
  const bytes = readFileSync(new URL(`../assets/${file}`, import.meta.url));
  return `/assets/${file}?v=${createHash("sha256").update(bytes).digest("hex").slice(0, 12)}`;
}

// Build-time content versions: browsers fetch changed assets after deployment.
export const stylesheetUrl = assetUrl("site.css");
export const scriptUrl = assetUrl("site.js");
