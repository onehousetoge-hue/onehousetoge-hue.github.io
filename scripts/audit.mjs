import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { resources, officialSources } from "../src/content/resources.mjs";

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
const documents = new Map(await Promise.all(htmlFiles.map(async (file) => [file, await readFile(file, "utf8")])));
const titles = new Map();
const descriptions = new Map();
const manifest = JSON.parse(await readFile(path.join(target, "build-manifest.json"), "utf8"));
// A truthful program planning status is not an empty-page placeholder.
// Specific research-state regression tests guard against inflated service claims.
const banned = ["하루 한 말씀", "무료 사주풀이", "50+ 인연마당", "성경", "묵상", "운세", "소개팅", "데이팅", "오픈채팅", "추후 안내", "임시", "샘플", "lorem ipsum", "TODO", "TBD", "example.com", "test@"];
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
    const href = match[1];
    if (/^(mailto:|tel:|https?:)/.test(href)) continue;
    const destination = href.startsWith("#") ? file : resolveInternal(href);
    if (!destination) continue;
    try {
      if (!(await stat(destination)).isFile()) failures.push(`${relative}: 깨진 링크 ${href}`);
      const fragment = href.split("#")[1];
      if (fragment && !documents.get(destination)?.includes(`id="${decodeURIComponent(fragment)}"`)) failures.push(`${relative}: 없는 본문 위치 ${href}`);
    } catch { failures.push(`${relative}: 깨진 링크 ${href}`); }
  }
  const pageIds = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
  if (new Set(pageIds).size !== pageIds.length) failures.push(`${relative}: 중복 id가 있습니다.`);
  for (const match of html.matchAll(/<img\b([^>]*)>/g)) if (!/\balt="[^"]*"/.test(match[1])) failures.push(`${relative}: alt 없는 이미지가 있습니다.`);
  if (/<form\b/.test(html) && !/<form[^>]*data-inquiry="(?:consultation|partnership)"[^>]*data-endpoint="https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec"/.test(html)) failures.push(`${relative}: 검증된 접수 URL 없는 form이 있습니다.`);
  const route = relative === "index.html" ? "/" : "/" + relative.replaceAll(path.sep, "/").replace(/index\.html$/, "");
  const indexed = manifest.pages.find(page => page.route === route)?.indexable;
  if (indexed) {
    const expected = `https://hanjibung.kr${route}`;
    if (!html.includes(`<link rel="canonical" href="${expected}">`)) failures.push(`${relative}: canonical 불일치`);
    if (!html.includes(`<meta property="og:url" content="${expected}">`)) failures.push(`${relative}: og:url 불일치`);
    if (!html.includes('name="robots" content="index,follow"')) failures.push(`${relative}: 색인 제한`);
    const description = html.match(/<meta name="description" content="([^"]+)"/)?.[1];
    if (descriptions.has(description)) failures.push(`${relative}: description 중복 (${descriptions.get(description)})`);
    descriptions.set(description, relative);
  }
  for (const [, src] of html.matchAll(/(?:src|href)="(\/assets\/[^"?]+)(?:\?[^\"]*)?"/g)) {
    try { await stat(path.join(target, src)); } catch { failures.push(`${relative}: missing asset ${src}`); }
  }
  if (/name="robots" content="index,follow"/.test(html) && !/<script type="application\/ld\+json">/.test(html)) failures.push(`${relative}: 구조화데이터가 없습니다.`);
}

if (goodstackCount !== 1) failures.push(`Goodstack 표시는 공개 HTML 전체에 1회여야 하나 ${goodstackCount}회입니다.`);
const sitemap = await readFile(path.join(target, "sitemap.xml"), "utf8");
const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
const expectedLocations = manifest.pages.filter(page => page.indexable).map(page => `https://hanjibung.kr${page.route}`);
if (JSON.stringify([...locations].sort()) !== JSON.stringify(expectedLocations.sort())) failures.push("사이트맵과 색인 허용 경로가 다릅니다.");
if (new Set(locations).size !== locations.length) failures.push("사이트맵 URL 중복");
for (const legacy of ["daily-word", "fortune", "/meeting/", "meeting.html", "thanks", "404"]) if (sitemap.includes(legacy)) failures.push(`sitemap.xml에 제외 경로 '${legacy}'가 있습니다.`);
const robots = await readFile(path.join(target, "robots.txt"), "utf8");
if (!robots.includes("Sitemap: https://hanjibung.kr/sitemap.xml")) failures.push("robots.txt에 사이트맵이 없습니다.");
// Completeness is checked by useful structure, not an invented policy word count.
for (const resource of resources) {
  const html = await readFile(path.join(target, "resources", resource.slug, "index.html"), "utf8");
  if (!resource.outcome || !resource.reviewNote) failures.push(`${resource.slug}: 자료 목적 또는 작성 범위가 없습니다.`);
  if (!html.includes('aria-label="이 자료의 목차"') || !html.includes("data-print")) failures.push(`${resource.slug}: 목차 또는 인쇄 기능이 없습니다.`);
  if (!html.includes("data-worksheet") || !html.includes("data-checklist")) failures.push(`${resource.slug}: 작성 도구 또는 확인표가 없습니다.`);
  if (!html.includes("서버로 전송하거나 자동 저장하지 않습니다")) failures.push(`${resource.slug}: 입력정보 안내가 없습니다.`);
  for (const section of resource.sections) {
    if (!section.body || !html.includes(`id="${section.id}"`) || !html.includes(`href="#${section.id}"`)) failures.push(`${resource.slug}: ${section.id} 본문과 목차가 연결되지 않습니다.`);
  }
  for (const key of resource.sources) {
    const source = officialSources[key];
    if (!source?.checkedAt || !html.includes(source.url.replaceAll("&", "&amp;"))) failures.push(`${resource.slug}: ${key} 공식 출처 또는 확인일이 없습니다.`);
  }
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
  if (new Set(ids).size !== ids.length) failures.push(`${resource.slug}: 중복 id가 있습니다.`);
}

if (failures.length) {
  console.error(`Audit failed (${failures.length})\n${failures.join("\n")}`);
  process.exit(1);
}
console.log(`Audited ${htmlFiles.length} HTML files: metadata, h1, links, banned content, privacy surface, sitemap and resources passed.`);
