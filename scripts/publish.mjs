import { cp, mkdir, rm, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
await stat(path.join(dist, "index.html"));

const oldFiles = ["app.js", "config.js", "daily-word.html", "fortune-config.js", "fortune.css", "fortune.html", "fortune.js", "meeting-config.js", "meeting.css", "meeting.html", "meeting.js", "portal.css", "styles.css"];
const oldTrackedAssets = ["assets/hero-senior-woman.jpg", "assets/hero-senior-woman.webp", "assets/meeting-hero.jpg"];
const generatedRoutes = ["about", "programs", "resources", "activities", "transparency", "participate", "contact", "consultation", "partnership", "privacy", "terms", "thanks", "404"];

async function removeGenerated(relative, recursive = false) {
  const target = path.resolve(root, relative);
  if (target === root || !target.startsWith(`${root}${path.sep}`)) throw new Error(`Unsafe generated path: ${relative}`);
  await rm(target, { recursive, force: true });
}

for (const item of [...oldFiles, ...oldTrackedAssets, ...generatedRoutes]) await removeGenerated(item, true);
for (const item of ["index.html", "404.html", "robots.txt", "sitemap.xml", "site.webmanifest", "CNAME", ".nojekyll"]) await removeGenerated(item);
await mkdir(path.join(root, "assets"), { recursive: true });
for (const item of ["site.css", "site.js", "inquiry.js", "favicon.svg", "og-default.png"]) await removeGenerated(path.join("assets", item));

await cp(dist, root, { recursive: true, force: true });
await removeGenerated("build-manifest.json");
console.log("Copied the verified production build to the GitHub Pages root.");
