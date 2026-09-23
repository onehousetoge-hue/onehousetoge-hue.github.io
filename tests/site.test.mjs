import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "dist");
const routes = ["/", "/about/", "/programs/", "/programs/senior-home-consulting/", "/programs/intergenerational-volunteer/", "/programs/housing-research/", "/resources/", "/resources/family-checklist/", "/resources/shared-living-rules/", "/resources/consultation-preparation/", "/resources/private-common-space/", "/resources/conflict-prevention/", "/resources/korean-housing-culture/", "/activities/", "/activities/founding-meeting/", "/activities/nonprofit-registration/", "/transparency/", "/participate/", "/contact/", "/privacy/", "/terms/"];
const routeFile = (route) => route === "/" ? path.join(root, "index.html") : path.join(root, route.replace(/^\//, ""), "index.html");

test("all required public routes exist", async () => {
  for (const route of routes) assert.equal((await stat(routeFile(route))).isFile(), true, route);
});

test("homepage states the mission and prioritizes resources", async () => {
  const html = await readFile(routeFile("/"), "utf8");
  assert.match(html, /어르신 주택 개선 무료상담, 세대교류 봉사 프로그램, 주거상생 실태조사/);
  assert.ok(html.indexOf("주거상생 자료 보기") < html.indexOf("어르신 주택 무료상담"));
});

test("mobile menu has accessible state and controls", async () => {
  const html = await readFile(routeFile("/"), "utf8");
  assert.match(html, /aria-expanded="false"/);
  assert.match(html, /aria-controls="primary-navigation"/);
  const js = await readFile(path.join(root, "assets", "site.js"), "utf8");
  assert.match(js, /event\.key === "Escape"/);
});

test("contact page uses real contact links, not implementation details or a fake form", async () => {
  const contact = await readFile(routeFile("/contact/"), "utf8");
  assert.doesNotMatch(contact, /<form\b/);
  assert.doesNotMatch(contact, /GitHub Pages|서버 측 유효성|백엔드|접수 완료/);
  assert.match(contact, /href="tel:\+821045879428"/);
  assert.match(contact, /href="mailto:onehousetoge@gmail.com"/);
  assert.match(contact, /직접 전송해 주세요/);
});

test("unused thank-you routes are absent from build and all public journeys", async () => {
  for (const route of ["/thanks/consultation/", "/thanks/partnership/"]) {
    await assert.rejects(stat(routeFile(route)), { code: "ENOENT" });
  }
  for (const route of routes) assert.doesNotMatch(await readFile(routeFile(route), "utf8"), /href="\/thanks\//);
  assert.doesNotMatch(await readFile(path.join(root, "robots.txt"), "utf8"), /Disallow: \/thanks/);
});

test("retention policy reflects the owner's one-year decision", async () => {
  for (const route of ["/contact/", "/privacy/"]) {
    const html = await readFile(routeFile(route), "utf8");
    assert.match(html, /답변 완료일부터 1년/);
    assert.doesNotMatch(html, /운영기준 확인이 필요합니다/);
  }
});

test("worksheets have labels, source notes and no transmission or persistence code", async () => {
  for (const route of routes.filter((item) => item.startsWith("/resources/") && item !== "/resources/")) {
    const html = await readFile(routeFile(route), "utf8");
    assert.match(html, /resource-summary/);
    assert.match(html, /외부 전문가 검수 자료가 아닙니다/);
    assert.match(html, /서버로 전송하거나 자동 저장하지 않습니다/);
    assert.match(html, /data-checklist/);
    assert.doesNotMatch(html, /<form\b/);
    for (const [, id] of html.matchAll(/<textarea id="([^"]+)"/g)) assert.ok(html.includes(`for="${id}"`));
  }
  const js = await readFile(path.join(root, "assets", "site.js"), "utf8");
  assert.doesNotMatch(js, /fetch\(|XMLHttpRequest|sendBeacon|localStorage|sessionStorage|gtag\(|dataLayer/);
  assert.match(js, /beforeprint/);
  assert.match(js, /output\.textContent/);
  const css = await readFile(path.join(root, "assets", "site.css"), "utf8");
  assert.match(css, /@media print[\s\S]*\.skip-link[^}]*display: none !important/);
});

test("examples cannot be mistaken for completed field activities", async () => {
  assert.match(await readFile(routeFile("/resources/private-common-space/"), "utf8"), /실제 주택과 무관/);
  assert.match(await readFile(routeFile("/resources/conflict-prevention/"), "utf8"), /실제 상담 사례·참여자 후기·성과가 아닙니다/);
});

test("custom 404 is noindex", async () => {
  const html = await readFile(path.join(root, "404.html"), "utf8");
  assert.match(html, /name="robots" content="noindex,nofollow"/);
  assert.match(html, /주거상생 공익사업 중심으로 개편되었습니다/);
});

test("five documented photos remain and the presentation photo is removed", async () => {
  const { digitalLearning: record } = await import("../src/content/field-records.mjs");
  assert.equal(record.eventDate, null);
  assert.equal(record.photos.length, 5);
  const html = await readFile(routeFile(record.href), "utf8");
  assert.match(html, /실제 활동일을 뜻하지 않습니다/);
  assert.match(html, /공개 동의/);
  assert.doesNotMatch(html, /housing-presentation|발표 사진|발표 화면|발표 장면|2025년/);
  await assert.rejects(stat(path.join(root, "assets", "activities", "housing-presentation.jpg")), { code: "ENOENT" });
  assert.match(html, /수익 보장이 아닙니다/);
  assert.match(html, /구성원의 관련 현장 경험/);
  assert.doesNotMatch(html, /2026년 8월 20일|600만원|500명|45가구|35가구|api\/mcp\/asset/);
  for (const photo of record.photos) {
    assert.ok((await stat(path.join(root, "assets", "activities", photo.file))).size < 600000);
    assert.ok(html.includes(`alt="${photo.alt}"`));
    assert.ok(html.includes(`width="${photo.width}" height="${photo.height}"`));
  }
  for (const route of ["/", "/activities/"]) assert.ok((await readFile(routeFile(route), "utf8")).includes(`href="${record.href}"`));
  assert.ok((await readFile(path.join(root, "sitemap.xml"), "utf8")).includes(record.href));
});

test("all public pages omit the removed brand name in copy and image descriptions", async () => {
  const manifest = JSON.parse(await readFile(path.join(root, "build-manifest.json"), "utf8"));
  const removedBrand = /\uD648\uD22C\uAC8C\uB354|home\s*together/i;
  for (const page of manifest.pages) {
    const file = page.route === "/404.html" ? path.join(root, "404.html") : routeFile(page.route);
    assert.doesNotMatch(await readFile(file, "utf8"), removedBrand, page.route);
  }
});
