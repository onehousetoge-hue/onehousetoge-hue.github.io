import { cp, mkdir, rm, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
await stat(path.join(dist, "index.html"));

const oldFiles = ["app.js", "config.js", "daily-word.html", "fortune-config.js", "fortune.css", "fortune.html", "fortune.js", "meeting-config.js", "meeting.css", "meeting.html", "meeting.js", "portal.css", "styles.css"];
const oldTrackedAssets = ["assets/hero-senior-woman.jpg", "assets/hero-senior-woman.webp", "assets/meeting-hero.jpg"];
const generatedRoutes = ["about", "programs", "resources", "activities", "transparency", "participate", "contact", "privacy", "terms", "thanks", "404"];

for (const item of [...oldFiles, ...oldTrackedAssets, ...generatedRoutes, "google-apps-script-meeting"]) await rm(path.join(root, item), { recursive: true, force: true });
for (const item of ["index.html", "404.html", "robots.txt", "sitemap.xml", "site.webmanifest", "CNAME", ".nojekyll"]) await rm(path.join(root, item), { force: true });
await mkdir(path.join(root, "assets"), { recursive: true });
for (const item of ["site.css", "site.js", "favicon.svg", "og-default.png"]) await rm(path.join(root, "assets", item), { force: true });

await cp(dist, root, { recursive: true, force: true });
await rm(path.join(root, "build-manifest.json"), { force: true });
console.log("Copied the verified production build to the GitHub Pages root.");
