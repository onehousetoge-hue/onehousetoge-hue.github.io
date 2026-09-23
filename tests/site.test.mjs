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

test("no online form can pretend to submit", async () => {
  const contact = await readFile(routeFile("/contact/"), "utf8");
  assert.doesNotMatch(contact, /<form\b/);
  assert.match(contact, /온라인 문의 저장기능을 운영하지 않습니다/);
});

test("thank-you routes are noindex and do not claim success", async () => {
  for (const route of ["/thanks/consultation/", "/thanks/partnership/"]) {
    const html = await readFile(routeFile(route), "utf8");
    assert.match(html, /name="robots" content="noindex,nofollow"/);
    assert.doesNotMatch(html, /정상적으로 접수되었습니다/);
  }
});

test("custom 404 is noindex", async () => {
  const html = await readFile(path.join(root, "404.html"), "utf8");
  assert.match(html, /name="robots" content="noindex,nofollow"/);
  assert.match(html, /주거상생 공익사업 중심으로 개편되었습니다/);
});
