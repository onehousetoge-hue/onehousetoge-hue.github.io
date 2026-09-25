import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const files = [
  "src/config/inquiries.mjs", "src/config/page-dates.mjs", "src/assets/inquiry.js", "src/lib/inquiry-page.mjs", "integrations/inquiries/Code.gs", "scripts/crawl.mjs",
  "src/config/site.mjs",
  "src/lib/living-lab.mjs", "src/assets/living-lab.mjs",
  "src/content/editorial-guides.mjs", "src/lib/editorial-guide-page.mjs",
  "src/content/resources.mjs",
  "src/content/activities.mjs",
  "src/content/funding.mjs",
  "src/content/consultation-records.mjs",
  "src/content/research.mjs",
  "src/content/transparency.mjs",
  "src/lib/funding-page.mjs",
  "src/content/field-records.mjs",
  "src/content/consultation-photos.mjs",
  "src/content/about.mjs",
  "src/lib/photo.mjs",
  "src/lib/photo-variants.mjs",
  "src/lib/static-assets.mjs",
  "src/lib/evidence-flow.mjs",
  "src/lib/research-page.mjs",
  "src/lib/landing-page.mjs",
  "src/lib/program-page.mjs",
  "src/lib/field-record-page.mjs",
  "src/lib/digital-education-page.mjs",
  "src/content/contact.mjs",
  "src/content/inquiry-templates.mjs",
  "src/content/privacy.mjs",
  "src/lib/resource-page.mjs",
  "src/data/program-details.mjs",
  "src/lib/template.mjs",
  "src/assets/site.js",
  "scripts/build.mjs",
  "scripts/publish.mjs",
  "scripts/check.mjs",
  "scripts/optimize-photos.mjs",
];

const failures = [];
for (const relative of files) {
  const content = await readFile(path.join(root, relative), "utf8");
  if (/\t/.test(content)) failures.push(`${relative}: 탭 문자가 있습니다.`);
  if (/\r(?!\n)/.test(content)) failures.push(`${relative}: 잘못된 줄바꿈이 있습니다.`);
  if (/\b(TODO|TBD)\b/i.test(content)) failures.push(`${relative}: 완료되지 않은 표시가 있습니다.`);
  if (/example\.com|test@/i.test(content)) failures.push(`${relative}: 예시 주소가 남아 있습니다.`);
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log(`Linted ${files.length} source files.`);
