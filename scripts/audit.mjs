import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const target = path.resolve(root, process.argv[2] || "dist");
const failures = [];
const htmlFiles = [];

async function collect(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) await collect(file);
    else if (entry.name.endsWith(".html")) htmlFiles.push(file);
  }
}

await collect(target);
const titles = new Map();
const banned = ["하루 한 말씀", "무료 사주풀이", "50+ 인연마당", "성경", "묵상", "운세", "소개팅", "데이팅", "오픈채팅", "준비 중", "추후 안내", "임시", "샘플", "lorem ipsum", "TODO", "TBD", "example.com", "test@"];
let goodstackCount = 0;

function resolveInternal(href) {
  if (href === "/") return path.join(target, "index.html");
  const clean = href.split(/[?#]/)[0];
  if (!clean || clean.startsWith("#") || /^(mailto:|tel:|https?:)/.test(clean)) return null;
  if (clean.endsWith(".html")) return path.join(target, clean.replace(/^\//, ""));
  return path.join(target, clean.replace(/^\//, ""), "index.html");
}

for (const file of htmlFiles) {
  const html = await readFile(file, "utf8");
  const relative = path.relative(target, file);
  const h1Count = (html.match(/<h1(?:\s|>)/g) || []).length;
  if (h1Count !== 1) failures.push(`${relative}: h1이 ${h1Count}개입니다.`);
  const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
  if (!title) failures.push(`${relative}: title이 없습니다.`);
  else if (titles.has(title) && relative !== "404.html") failures.push(`${relative}: title이 ${titles.get(title)}와 중복됩니다.`);
  else titles.set(title, relative);
  if (!/<meta name="description" content="[^"]+">/.test(html)) failures.push(`${relative}: meta description이 없습니다.`);
  if (!/<link rel="canonical" href="https:\/\/hanjibung\.kr[^">]*">/.test(html)) failures.push(`${relative}: canonical이 없습니다.`);
  if (!/<meta property="og:title"/.test(html) || !/<meta name="twitter:card"/.test(html)) failures.push(`${relative}: 공유 메타데이터가 없습니다.`);
  if (!/<html lang="ko">/.test(html)) failures.push(`${relative}: lang=ko가 없습니다.`);
  if (html.includes("http://")) failures.push(`${relative}: 안전하지 않은 http:// 링크가 있습니다.`);
  for (const term of banned) if (html.toLowerCase().includes(term.toLowerCase())) failures.push(`${relative}: 금지 문자열 '${term}'이 있습니다.`);
  goodstackCount += (html.match(/Goodstack/g) || []).length;
  for (const match of html.matchAll(/<a[^>]+href="([^"]+)"/g)) {
    const destination = resolveInternal(match[1]);
    if (!destination) continue;
    try { if (!(await stat(destination)).isFile()) failures.push(`${relative}: 깨진 링크 ${match[1]}`); } catch { failures.push(`${relative}: 깨진 링크 ${match[1]}`); }
  }
  for (const match of html.matchAll(/<img\b([^>]*)>/g)) if (!/\balt="[^"]*"/.test(match[1])) failures.push(`${relative}: alt 없는 이미지가 있습니다.`);
  if (/<form\b/.test(html)) failures.push(`${relative}: 실제 백엔드가 없는 form이 있습니다.`);
  if (/name="robots" content="index,follow"/.test(html) && !/<script type="application\/ld\+json">/.test(html)) failures.push(`${relative}: 구조화데이터가 없습니다.`);
}

if (goodstackCount !== 1) failures.push(`Goodstack 표시는 공개 HTML 전체에 1회여야 하나 ${goodstackCount}회입니다.`);
const sitemap = await readFile(path.join(target, "sitemap.xml"), "utf8");
for (const legacy of ["daily-word", "fortune", "/meeting/", "meeting.html", "thanks", "404"]) if (sitemap.includes(legacy)) failures.push(`sitemap.xml에 제외 경로 '${legacy}'가 있습니다.`);
const robots = await readFile(path.join(target, "robots.txt"), "utf8");
if (!robots.includes("Sitemap: https://hanjibung.kr/sitemap.xml")) failures.push("robots.txt에 사이트맵이 없습니다.");
for (const resource of ["family-checklist", "shared-living-rules", "consultation-preparation", "private-common-space", "conflict-prevention", "korean-housing-culture"]) {
  const html = await readFile(path.join(target, "resources", resource, "index.html"), "utf8");
  const article = html.match(/<article class="prose">([\s\S]*?)<section class="related-section">/)?.[1] || "";
  const text = article.replace(/<[^>]+>/g, "").replace(/\s+/g, "").trim();
  if (text.length < 1200) failures.push(`resources/${resource}: 본문이 ${text.length}자로 1,200자 미만입니다.`);
}

if (failures.length) {
  console.error(`Audit failed (${failures.length})\n${failures.join("\n")}`);
  process.exit(1);
}
console.log(`Audited ${htmlFiles.length} HTML files: metadata, h1, links, banned content, privacy surface, sitemap and resources passed.`);
