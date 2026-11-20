import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { escapeHtml } from "../src/lib/template.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "dist");
const routes = ["/", "/reservation/", "/reservation/privacy/"];
const routeFile = (route) => route === "/" ? path.join(root, "index.html") : path.join(root, route.replace(/^\//, ""), "index.html");

test("homepage links to the dedicated diagnosis page without the retired organization menu", async () => {
  const room = await readFile(routeFile("/"), "utf8");
  assert.match(room, /class="room-check-page"/);
  assert.doesNotMatch(room, /<iframe|<dialog|data-open-inquiry/);
  assert.match(room, /예상 월세 무료 진단 받기/);
  assert.match(room, /id="goals"/);
  assert.match(room, /data-income-calculator/);
  assert.match(room, /class="income-reservation" href="\/reservation\/"/);
  assert.doesNotMatch(room, /floating-diagnosis/);
  assert.match(room, /<title>우리 집 남는 방 예상 월세 진단 \| 한지붕<\/title>/);
  assert.doesNotMatch(room, /방 진단 화면이 보이지 않거나|한지붕의 기존 홈페이지 보기/);
  assert.doesNotMatch(room, /<header class="site-header"/);
  assert.doesNotMatch(room, /<footer class="site-footer"/);
  assert.doesNotMatch(room, /한지붕 알아보기|class="nav-toggle"|id="site-menu"|href="\/resources\//);
  assert.match(room, /href="\/reservation\/privacy\/"/);
});

test("rent FAQ answers and their structured data match in the final section before the footer", async () => {
  const html = await readFile(routeFile("/"), "utf8");
  const section = html.match(/<section class="rent-faq"[^>]+>([\s\S]*?)<\/section>\s*<\/div>\s*<footer class="host-footer"/);
  assert.ok(section, "FAQ is server-rendered immediately before the footer");
  const schemas = [...html.matchAll(/<script type="application\/ld\+json">([^<]+)<\/script>/g)].map(match => JSON.parse(match[1]));
  const faqs = schemas.filter(schema => schema["@type"] === "FAQPage");
  assert.equal(faqs.length, 1);
  const faq = faqs[0];
  assert.equal(faq["@id"], "https://hanjibung.kr/#rent-faq");
  assert.ok(section[1].includes(`<h2 id="rent-faq-title">${escapeHtml(faq.name)}</h2>`));
  const articles = [...section[1].matchAll(/<article class="rent-faq-item" id="([^"]+)">([\s\S]*?)<\/article>/g)];
  assert.ok(articles.length > 0);
  assert.equal(articles.length, faq.mainEntity.length);
  for (const [index, [, id, content]] of articles.entries()) {
    const question = faq.mainEntity[index];
    assert.equal(question["@id"], `https://hanjibung.kr/#${id}`);
    assert.equal(question["@type"], "Question");
    assert.equal(question.acceptedAnswer["@type"], "Answer");
    assert.ok(content.includes(`<h3>${escapeHtml(question.name)}</h3>`));
    assert.ok(content.includes(`<p>${escapeHtml(question.acceptedAnswer.text)}</p>`));
  }
});

test("dedicated diagnosis page preserves the existing required information and explicit consent", async () => {
  const html = await readFile(routeFile("/reservation/"), "utf8");
  assert.match(html, /class="reservation-app"/);
  assert.match(html, /<link rel="canonical" href="https:\/\/hanjibung\.kr\/reservation\/">/);
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert.equal((html.match(/<form\b/g) || []).length, 2);
  assert.doesNotMatch(html, /<iframe|data-open-inquiry/);
  const diagnosisForm = html.match(/<form class="inquiry-form"[\s\S]*?<\/form>/)[0];
  const inputs = [...diagnosisForm.matchAll(/<input\b[^>]*>/g)].map((match) => match[0]);
  const fields = inputs.filter((input) => /\bname="/.test(input));
  assert.deepEqual([...new Set(fields.map((input) => input.match(/\bname="([^"]+)"/)[1]))].sort(), ["aircon", "area", "areaType", "consent", "homeType", "location", "phone", "rooms", "tenure"]);
  for (const field of fields) {
    if (/name="homeType"/.test(field)) assert.doesNotMatch(field, /\brequired(?:\s|>)/);
    else assert.match(field, /\brequired(?:\s|>)/);
  }
  const consent = fields.find((input) => /name="consent"/.test(input));
  assert.match(consent, /type="checkbox"/);
  assert.doesNotMatch(consent, /\bchecked(?:\s|>)/);
  assert.doesNotMatch(diagnosisForm, /type="file"|id="photos"|room-photos-title|사진 첨부/);
  assert.match(diagnosisForm, /<span aria-hidden="true">02<\/span><h3 id="room-contact-title">월세 결과 받을 연락처<\/h3>/);
  for (const text of ["집 위치와 방 정보를 남겨주세요.", "90일", 'href="/reservation/privacy/"']) assert.ok(html.includes(text), text);
  const submit = diagnosisForm.match(/<button\b[^>]*type="submit"[^>]*>/)?.[0];
  assert.match(submit, /\bdisabled(?:\s|>)/);
  assert.doesNotMatch(html, /class="rent-diagnosis-dock"/);
});

test("the build and sitemap expose only the active pages and the error document", async () => {
  const manifest = JSON.parse(await readFile(path.join(root, "build-manifest.json"), "utf8"));
  assert.deepEqual(manifest.pages.map(page => page.route).sort(), [...routes, "/admin/", "/404/", "/404.html"].sort());
  const sitemap = await readFile(path.join(root, "sitemap.xml"), "utf8");
  assert.deepEqual([...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => new URL(m[1]).pathname).sort(), [...routes].sort());
  for (const section of ["about", "activities", "consultation", "contact", "guide", "overview", "participate", "partnership", "privacy", "programs", "research", "resources", "stories", "terms", "transparency"]) {
    await assert.rejects(stat(path.join(root, section)), { code: "ENOENT" });
  }
  for (const route of [...routes, "/404/"]) {
    assert.doesNotMatch(await readFile(routeFile(route), "utf8"), /한지붕 알아보기|data-menu-button|class="nav-toggle"/);
  }
  for (const directory of ["activities", "field-guides", "guides"]) {
    await assert.rejects(stat(path.join(root, "assets", directory)), { code: "ENOENT" });
  }
  assert.ok((await stat(path.join(root, "assets/inquiry.js"))).isFile(), "Quick callback still imports this module");
});

test("existing diagnosis bookmarks redirect to the new form without losing other query parameters", async () => {
  const { runInNewContext } = await import("node:vm");
  const script = await readFile(path.join(root, "assets/room-check.js"), "utf8");
  let destination;
  runInNewContext(script, {
    document: { querySelector: () => ({}) }, URL,
    window: { location: { href: "https://hanjibung.kr/?diagnosis=1&utm_source=bookmark#goals", replace: (url) => { destination = url; } } },
  });
  assert.equal(destination, "https://hanjibung.kr/reservation/?utm_source=bookmark#goals");
});

test("privacy distinguishes room diagnosis from quick callbacks and past inquiries", async () => {
  const policy = await readFile(routeFile("/reservation/privacy/"), "utf8");
  for (const text of ["동네 수준", "상세주소는 받지 않음", "방 정보", "방 사진", "전화번호", "Google Apps Script", "Google Sheets", "Google Drive", "Vercel", "최대 90일", "최대 1년", "180일", "분석 이벤트에 실어 보내지 않습니다"]) assert.ok(policy.includes(text), text);
  assert.match(policy, /빠른 상담 신청에서도 사진을 요구하지 않습니다/);
});

test("unused thank-you routes are absent from build and all public journeys", async () => {
  for (const route of ["/thanks/consultation/", "/thanks/partnership/"]) {
    await assert.rejects(stat(routeFile(route)), { code: "ENOENT" });
  }
  for (const route of routes) assert.doesNotMatch(await readFile(routeFile(route), "utf8"), /href="\/thanks\//);
  assert.doesNotMatch(await readFile(path.join(root, "robots.txt"), "utf8"), /Disallow: \/thanks/);
});

test("retention policy reflects the owner's one-year decision", async () => {
  const html = await readFile(routeFile("/reservation/privacy/"), "utf8");
  assert.match(html, /상담 종료일로부터 최대 1년간/);
  assert.doesNotMatch(html, /답변 완료일부터 1년/);
  assert.doesNotMatch(html, /운영기준 확인이 필요합니다/);
});

test("custom 404 is noindex", async () => {
  const html = await readFile(path.join(root, "404.html"), "utf8");
  assert.match(html, /name="robots" content="noindex,nofollow"/);
  assert.match(html, /한지붕 홈으로 가기/);
});

test("public pages use the requested Hanjibung copyright credit", async () => {
  const manifest = JSON.parse(await readFile(path.join(root, "build-manifest.json"), "utf8"));
  const removedBrand = /\uD648\uD22C\uAC8C\uB354|home\s*together/i;
  for (const page of manifest.pages) {
    const file = page.route === "/404.html" ? path.join(root, "404.html") : routeFile(page.route);
    const html = await readFile(file, "utf8");
    assert.doesNotMatch(page.route === "/admin/" ? html.replace(/href="[^"]*"/g, "") : html, removedBrand, page.route);
    assert.match(html, /© 2026 hanjibung\. All rights reserved\./, page.route);
  }
});

test("privacy states owner-confirmed Workspace custody and manual deletion responsibility", async () => {
  const html = await readFile(routeFile("/reservation/privacy/"), "utf8");
  for (const term of ["Google Apps Script", "Google Sheets", "Google Drive", "대표자와 지정된 운영담당자로 제한", "대표자 또는 지정 개인정보 관리담당자", "정기적으로 보관기간을 확인", "해당 정보만 분리"]) assert.ok(html.includes(term), term);
  assert.doesNotMatch(html, /자동 삭제|국내에만|대한민국에만/);
});

test("the parent and room diagnostic share GA without exposing inquiry details", async () => {
  const html = await readFile(routeFile("/reservation/privacy/"), "utf8");
  assert.match(html, /안내 페이지와 방 진단은 같은 Google Analytics 측정 설정/);
  assert.match(html, /첫 화면에서는 한지붕 페이지의 방문을 한 번만 기록/);
  assert.match(html, /분석 쿠키의 최대 보관기간은 180일/);
  assert.match(html, /방 정보·전화번호, 이전에 제출한 사진.*분석 이벤트에 실어 보내지 않습니다/);
  assert.match(html, /버튼 클릭만으로 실제 통화나 문의 수신 여부를 확인하지 않습니다/);
  const manifest = JSON.parse(await readFile(path.join(root, "build-manifest.json"), "utf8"));
  for (const page of manifest.pages) {
    const file = page.route === "/404.html" ? path.join(root, "404.html") : routeFile(page.route);
    const content = await readFile(file, "utf8");
    if (page.route === "/admin/") {
      assert.match(content, /name="robots" content="noindex,nofollow"/);
      assert.match(content, /https:\/\/accounts\.google\.com\/AccountChooser\?continue=/);
      assert.doesNotMatch(content, /<script|data-analytics-id|spreadsheets\/d\//);
      continue;
    }
    assert.match(content, /data-analytics-id="G-58PJ9VG8GC"/);
    assert.doesNotMatch(content, /googleadservices\.com/);
    const scripts = [...content.matchAll(/<script[^>]+src="([^"]+)"/g)].map((match) => match[1]);
    const expected = ["/assets/site.js", "/assets/analytics.js"];
    if (page.route === "/") expected.push("/assets/room-check.js", "/assets/diagnosis-prefill.js", "/assets/income-calculator.js");
    if (page.route === "/reservation/") expected.push("/assets/diagnosis-prefill.js", "/assets/reservation.js", "/assets/callback.js");
    assert.deepEqual(scripts.map((src) => new URL(src, "https://hanjibung.kr").pathname), expected);
  }
});

test("site chrome preserves the brand while the diagnostic home uses a text wordmark", async () => {
  const manifest = JSON.parse(await readFile(path.join(root, "build-manifest.json"), "utf8"));
  for (const page of manifest.pages) {
    const file = page.route === "/404.html" ? path.join(root, "404.html") : routeFile(page.route);
    const html = await readFile(file, "utf8");
    const imageCount = (html.match(/<img[^>]+src="\/assets\/hanjibung-logo-256\.png"/g) || []).length;
    if (page.route === "/") {
      assert.equal(imageCount, 0, page.route);
      assert.match(html, /class="brand-wordmark">한지붕<\/span>/);
      assert.match(html, /class="host-footer"/);
      assert.match(html, /class="income-reservation" href="\/reservation\/"/);
    } else if (page.route === "/reservation/") {
      assert.equal(imageCount, 0, page.route);
      assert.match(html, /class="reservation-app"/);
    } else if (page.route === "/admin/") {
      assert.match(html, /<h1>한지붕 관리자<\/h1>/);
    } else {
      assert.equal(imageCount, 2, page.route);
    }
    assert.ok(html.includes('href="/assets/hanjibung-icon-64.png"'), page.route);
  }
  const logo = await readFile(path.join(root, "assets", "hanjibung-logo-256.png"));
  assert.equal(logo[25], 6); // PNG RGBA, with an actual alpha channel.
});

test("CSS and JavaScript versions match the built bytes", async () => {
  const { createHash } = await import("node:crypto");
  for (const [route, names] of [["/", ["site.css", "site.js", "room-check.css", "room-check.js"]], ["/reservation/", ["site.css", "site.js", "reservation.css", "reservation.js"]]]) {
    const html = await readFile(routeFile(route), "utf8");
    for (const name of names) {
      const bytes = await readFile(path.join(root, "assets", name));
      const version = createHash("sha256").update(bytes).digest("hex").slice(0, 12);
      assert.ok(html.includes(`/assets/${name}?v=${version}`), `${route}: ${name}`);
    }
  }
});
