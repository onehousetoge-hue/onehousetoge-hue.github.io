import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const files = [
  "src/config/inquiries.mjs", "src/config/page-dates.mjs", "src/assets/inquiry.js",
  "integrations/inquiries/Code.gs", "scripts/crawl.mjs", "src/config/site.mjs",
  "src/lib/static-assets.mjs", "src/lib/room-check-page.mjs", "src/lib/reservation-page.mjs",
  "src/lib/about-page.mjs", "src/assets/service-pages.css", "src/lib/rent-faq.mjs", "src/assets/headline-experiment.js",
  "src/assets/room-check.js", "src/assets/reservation.js", "src/lib/income-calculator.mjs",
  "src/assets/income-calculator.js", "src/assets/income-calculator.css", "src/assets/diagnosis-prefill.js",
  "src/content/privacy.mjs", "src/lib/template.mjs", "src/assets/site.js",
  "src/assets/analytics.js", "src/assets/callback.js", "src/lib/callback-form.mjs",
  "scripts/build.mjs", "scripts/publish.mjs", "scripts/check.mjs",
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
