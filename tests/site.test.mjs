import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { escapeHtml } from "../src/lib/template.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "dist");
const routes = ["/", "/about/", "/how-it-works/", "/consultation/", "/reservation/", "/rooms/register/", "/reservation/privacy/"];
const routeFile = (route) => route === "/" ? path.join(root, "index.html") : path.join(root, route.replace(/^\//, ""), "index.html");

test("homepage links to the dedicated diagnosis page without the retired organization menu", async () => {
  const room = await readFile(routeFile("/"), "utf8");
  assert.match(room, /class="room-check-page"/);
  assert.ok(room.indexOf('class="diagnosis-top-banner"') > 0);
  assert.ok(room.indexOf('class="diagnosis-top-banner"') < room.indexOf('class="public-header"'));
  assert.match(room, /class="diagnosis-top-banner" href="\/rooms\/register\/"/);
  assert.doesNotMatch(room, /<iframe|<dialog|data-open-inquiry/);
  const hero = room.match(/<section class="host-hero"[\s\S]*?<\/section>/)[0];
  assert.match(hero, /href="\/reservation\/">우리 집 빈 방 얼마나 받을 수 있을까/);
  assert.doesNotMatch(hero, /href="#rent-faq"/);
  assert.match(room, /id="goals"/);
  assert.doesNotMatch(room, /host-about-summary|한지붕 소개 보기/);
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

test("the home FAQ shows the reference categories and the same answers in structured data", async () => {
  const html = await readFile(routeFile("/"), "utf8");
  const section = html.match(/<section class="rent-faq"[^>]+>([\s\S]*?)<\/section>\s*<\/div>\s*<footer class="host-footer"/);
  assert.ok(section, "FAQ is server-rendered immediately before the footer");
  const body = section[1];
  assert.match(body, /id="rent-faq-query"/);
  const schemas = [...html.matchAll(/<script type="application\/ld\+json">([^<]+)<\/script>/g)].map(match => JSON.parse(match[1]));
  const faqs = schemas.filter(schema => schema["@type"] === "FAQPage");
  assert.equal(faqs.length, 1);
  const [faq] = faqs;
  assert.equal(faq["@id"], "https://hanjibung.kr/#rent-faq");
  assert.equal(faq.name, body.match(/<h2 id="rent-faq-title"[^>]*>([^<]+)<\/h2>/)[1]);
  const filters = [...body.matchAll(/<button[^>]+id="faq-category-(\w+)"[^>]+aria-pressed="(true|false)"/g)];
  assert.deepEqual(filters.map(match => match[1]), ["all", "service", "living", "contract", "tax"]);
  assert.deepEqual(filters.filter(match => match[2] === "true").map(match => match[1]), ["all"]);
  const items = [...body.matchAll(/<details class="rent-faq-item" name="host-questions" id="([^"]+)" data-category="(\w+)"( open)?>([\s\S]*?)<\/details>/g)];
  assert.equal(items.length, 24);
  assert.equal(items.length, faq.mainEntity.length);
  assert.equal(new Set(items.map(match => match[1])).size, items.length);
  assert.equal(items.filter(match => match[3]).length, 1);
  assert.deepEqual(filters.slice(1).map(chip => items.filter(item => item[2] === chip[1]).length), [6, 6, 5, 7]);
  for (const [index, [, id, , , content]] of items.entries()) {
    const question = faq.mainEntity[index];
    assert.equal(question["@id"], "https://hanjibung.kr/#" + id);
    assert.equal(question["@type"], "Question");
    assert.equal(question.acceptedAnswer["@type"], "Answer");
    assert.equal(content.match(/class="host-faq-question-text">([^<]+)<\/span>/)[1], escapeHtml(question.name));
    const paragraphs = [...content.matchAll(/<p class="host-faq-answer-(?:summary|detail)">([^<]+)<\/p>/g)];
    assert.equal(paragraphs.map(match => match[1]).join("\n\n"), escapeHtml(question.acceptedAnswer.text));
  }
  const shortcuts = [...html.matchAll(/class="host-faq-category-link" href="#([^"]+)"/g)].map(match => match[1]);
  assert.deepEqual(shortcuts, ["faq-student-matching", "faq-rental-tax", "faq-manager-support"]);
  for (const id of shortcuts) assert.ok(items.some(match => match[1] === id));
});

test("the main host guide follows the reference sequence with HanJibung's own identity and enrollment routes", async () => {
  const html = await readFile(routeFile("/"), "utf8");
  const sections = [...html.matchAll(/<section class="([^"]+)"[^>]*>/g)].map(match => match[1]).filter(name => name !== "income-panel");
  assert.deepEqual(sections, ["host-hero", "host-intro-empathy", "host-intro-benefits", "host-intro-income", "host-process-section", "host-community-section", "host-community-news", "host-story-section", "host-intro-estimate-band", "host-faq-top-section", "rent-faq"]);
  assert.match(html, /href="https:\/\/www.youtube.com\/watch\?v=DdCxyz9kNs4"/);
  assert.match(html, /2026년 9월 기준 <em>55가구<\/em>/);
  assert.match(html, /노원구청 마을공동체 사업 선정/);
  assert.doesNotMatch(html, /신한|슈퍼SOL|홈투게더|핀타|Home Together|\/shinhan\/|_next\/|data-nimg/i);
  assert.match(html, /id="host-title-B">우리 집 빈 방 <strong>얼마 받을 수 있을까\?/);
  assert.match(html, /id="host-title-C">혼자 계신 부모님께 <strong>드릴 수 있는 선물/);
  for (const [variant, file] of [["A", "hero-household.webp"], ["B", "hero.webp"], ["C", "hero-companion.webp"]]) {
    const image = html.split(`<template id="host-visual-${variant}">`)[1].split("</template>")[0];
    assert.ok(image.includes(`src="/assets/host/${file}"`));
  }
  assert.match(html, /<noscript><img [^>]*src="\/assets\/host\/hero-household\.webp"/);
});

test("the about page features the MBC video without the two secondary links", async () => {
  const html = await readFile(routeFile("/about/"), "utf8");
  const cover = html.match(/<section class="about-cover"[\s\S]*?<\/section>/)[0];
  assert.match(cover, /<h1 id="about-title">MBC/);
  assert.doesNotMatch(cover, /MBC 기사 읽기|한지붕이 하는 일|class="about-actions"/);
  assert.match(cover, /href="https:\/\/www\.youtube\.com\/watch\?v=DdCxyz9kNs4"/);
  assert.match(cover, /datetime="2026-09-12"/);
  assert.doesNotMatch(cover, /<iframe|<video/);
});

test("dedicated diagnosis page preserves the existing required information and explicit consent", async () => {
  const html = await readFile(routeFile("/reservation/"), "utf8");
  assert.match(html, /class="reservation-app"/);
  assert.match(html, /<link rel="canonical" href="https:\/\/hanjibung\.kr\/reservation\/">/);
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert.equal((html.match(/<form\b/g) || []).length, 1);
  assert.doesNotMatch(html, /<iframe|data-open-inquiry/);
  const diagnosisForm = html.match(/<form class="inquiry-form"[\s\S]*?<\/form>/)[0];
  assert.doesNotMatch(diagnosisForm, /data-prefill-notice|미리 채웠어요/);
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
  assert.match(diagnosisForm, /<span aria-hidden="true">02<\/span><h3 id="room-contact-title">월세 진단 결과 받을 연락처<\/h3>/);
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
  for (const section of ["activities", "contact", "guide", "overview", "participate", "partnership", "privacy", "programs", "research", "resources", "stories", "terms", "transparency"]) {
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

test("public index-file links use the directory before attribution and preserve the campaign and fragment", async () => {
  const { runInNewContext } = await import("node:vm");
  for (const route of routes) {
    const html = await readFile(routeFile(route), "utf8");
    const script = html.match(/<script data-directory-entry>([\s\S]*?)<\/script>/)[1];
    assert.ok(html.indexOf(script) < html.indexOf("data-analytics-id"));
    const state = { visit: 1 };
    const writes = [];
    const history = { state, replaceState: (...args) => writes.push(args) };
    const location = new URL(route + "index.html?utm_source=naver#section", "https://hanjibung.kr");
    runInNewContext(script, { location, history });
    assert.deepEqual(writes, [[state, "", route + "?utm_source=naver#section"]]);
    location.pathname = route;
    runInNewContext(script, { location, history });
    assert.equal(writes.length, 1);
  }
  assert.doesNotMatch(await readFile(path.join(root, "404.html"), "utf8"), /data-directory-entry/);
});

test("existing diagnosis bookmarks redirect to the new form without losing other query parameters", async () => {
  const { runInNewContext } = await import("node:vm");
  const html = await readFile(routeFile("/"), "utf8");
  const script = html.match(/<script data-legacy-entry>([\s\S]*?)<\/script>/)[1];
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
    if (page.route === "/") expected.push("/assets/diagnosis-prefill.js", "/assets/income-calculator.js", "/assets/rent-faq-search.js");
    if (page.route === "/reservation/") expected.push("/assets/diagnosis-prefill.js", "/assets/reservation.js");
    if (page.route === "/consultation/") expected.push("/assets/callback.js");
    if (page.route === "/rooms/register/") expected.push("/assets/room-registration.js");
    assert.deepEqual(scripts.map((src) => new URL(src, "https://hanjibung.kr").pathname), expected);
  }
});

test("the entire blue house card opens the host guide and both guide actions reach the corresponding forms", async () => {
  const home = await readFile(routeFile("/"), "utf8");
  const card = home.match(/<a class="host-intro-container host-intro-empathy-card" href="\/how-it-works\/"[^>]*>([\s\S]*?)<\/a>/);
  assert.ok(card);
  for (const part of ["host-intro-first-bubble", "/assets/host/house.webp", "host-intro-second-bubble", "host-intro-empathy-caption"]) assert.ok(card[1].includes(part), part);
  assert.doesNotMatch(card[1], /<(?:a|button)\b/);

  const guide = await readFile(routeFile("/how-it-works/"), "utf8");
  const body = guide.match(/<div class="host-guide">([\s\S]*?)<footer /)[1];
  assert.match(body, /href="\/reservation\/">우리 집 빈 방 예상 월세 알아보기/);
  assert.match(body, /href="\/rooms\/register\/">방 등록하기/);
  assert.deepEqual([...body.matchAll(/<li><h3>([^<]+)<\/h3>/g)].map(match => match[1]), ["방 등록하기", "학생 소개서 받아보기", "집주인이 최종 결정하기"]);
  assert.match(guide, /rel="canonical" href="https:\/\/hanjibung\.kr\/how-it-works\/"/);
});

test("all public pages share the requested destinations in desktop and mobile menus", async () => {
  const menu = [
    ["/about/", "한지붕 소개"], ["/how-it-works/", "한지붕 활용 방법"], ["/consultation/", "상담 신청하기"],
    ["/reservation/", "우리 집 빈 방 월세 진단"], ["/rooms/register/", "방 등록하기"],
  ];
  for (const route of [...routes, "/404/"]) {
    const html = await readFile(routeFile(route), "utf8");
    const header = html.match(/<header class="public-header">([\s\S]*?)<\/header>/)[1];
    assert.match(header, /<a class="public-brand" href="\/" aria-label="한지붕 홈">한지붕<\/a>/);
    const navs = [...header.matchAll(/<nav[^>]*>(.*?)<\/nav>/g)];
    assert.equal(navs.length, 2);
    for (const [, nav] of navs) {
      const links = [...nav.matchAll(/<a href="([^"]+)"( aria-current="page")?>(.*?)<\/a>/g)];
      assert.deepEqual(links.map(([, href, , title]) => [href, title]), menu);
      assert.deepEqual(links.filter(([, , active]) => active).map(([, href]) => href), menu.some(([href]) => href === route) ? [route] : []);
    }
    assert.ok(html.includes('href="/assets/hanjibung-icon-64.png"'), route);
  }
  const logo = await readFile(path.join(root, "assets", "hanjibung-logo-256.png"));
  assert.equal(logo[25], 6); // PNG RGBA, with an actual alpha channel.
});

test("CSS and JavaScript versions match the built bytes", async () => {
  const { createHash } = await import("node:crypto");
  for (const [route, names] of [["/", ["site.css", "site.js", "room-check.css", "rent-faq-search.js"]], ["/how-it-works/", ["site.css", "site.js", "host-guide.css"]], ["/reservation/", ["site.css", "site.js", "reservation.css", "reservation.js"]], ["/rooms/register/", ["room-registration.js"]]]) {
    const html = await readFile(routeFile(route), "utf8");
    for (const name of names) {
      const bytes = await readFile(path.join(root, "assets", name));
      const version = createHash("sha256").update(bytes).digest("hex").slice(0, 12);
      assert.ok(html.includes(`/assets/${name}?v=${version}`), `${route}: ${name}`);
    }
  }
  const registration = await readFile(path.join(root, "assets", "room-registration.js"), "utf8");
  const parser = await readFile(path.join(root, "assets", "room-description.js"));
  assert.ok(registration.includes("room-description.js?v=" + createHash("sha256").update(parser).digest("hex").slice(0, 12)));
});

test("the common UI font ships with a full Korean fallback", async () => {
  const css = await readFile(path.join(root, "assets/site.css"), "utf8");
  const fonts = path.join(root, "assets/fonts");
  const small = await readFile(path.join(fonts, "HanjibungSiteText.woff2"));
  const full = await stat(path.join(fonts, "PretendardVariable.woff2"));
  assert.equal(small.toString("ascii", 0, 4), "wOF2");
  assert.ok(small.length < full.size / 5);
  assert.ok(css.includes('/assets/fonts/HanjibungSiteText.woff2'));
  assert.ok(css.includes('/assets/fonts/PretendardVariable.woff2'));
});
