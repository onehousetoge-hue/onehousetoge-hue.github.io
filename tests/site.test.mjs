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
  assert.equal((await stat(routeFile("/activities/senior-digital-education/"))).isFile(), true);
});

test("homepage states the actual services and prioritizes free consulting", async () => {
  const html = await readFile(routeFile("/"), "utf8");
  assert.match(html, /어르신 유휴공간·빈방 활용 무료상담과 세대교류 교육·봉사/);
  assert.match(html, /주거상생 실태조사는 현재 진행 중/);
  const hero = html.match(/<section class="hero consultation-hero">([\s\S]*?)<\/section>/)?.[1];
  assert.ok(hero);
  assert.match(hero, /비어 있는 방의 가능성/);
  assert.ok(hero.indexOf('href="/programs/senior-home-consulting/"') < hero.indexOf('href="/resources/consultation-preparation/"'));
  assert.match(hero, /consultation-walk\.jpg/);
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
    assert.match(html, /상담 종료일로부터 최대 1년간/);
    assert.doesNotMatch(html, /답변 완료일부터 1년/);
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

test("four consented consultation photos are published without original metadata or invented event dates", async () => {
  const { consultationPhotos } = await import("../src/content/consultation-photos.mjs");
  assert.equal(consultationPhotos.length, 4);
  const html = await readFile(routeFile("/activities/field-records/"), "utf8");
  assert.equal((html.match(/<img /g) || []).length, 9);
  for (const photo of consultationPhotos) {
    const bytes = await readFile(path.join(root, "assets/activities", photo.file));
    assert.ok(bytes.length < 600000, photo.file);
    assert.equal(bytes.includes(Buffer.from("Exif\0\0")), false, photo.file);
    assert.ok(html.includes(`alt="${photo.alt}"`), photo.file);
    assert.ok(html.includes(`width="${photo.width}" height="${photo.height}"`), photo.file);
  }
  assert.doesNotMatch(html, /2026-09-05|2026-09-13|IMG_6467|\.HEIC|KakaoTalk_/);
  assert.match(html, /임대수익을 보장하거나 입주를 알선하는 서비스가 아닙니다/);
});

test("all public pages omit the removed brand name in copy and image descriptions", async () => {
  const manifest = JSON.parse(await readFile(path.join(root, "build-manifest.json"), "utf8"));
  const removedBrand = /\uD648\uD22C\uAC8C\uB354|home\s*together/i;
  for (const page of manifest.pages) {
    const file = page.route === "/404.html" ? path.join(root, "404.html") : routeFile(page.route);
    assert.doesNotMatch(await readFile(file, "utf8"), removedBrand, page.route);
  }
});

test("education experience retains publication dates but removes the withdrawn event date", async () => {
  const { activities } = await import("../src/content/activities.mjs");
  const education = activities.find((item) => item.slug === "senior-digital-education");
  assert.equal(education.eventDate, null);
  assert.equal(education.publishedAt, "2026-09-23");
  const html = await readFile(routeFile(education.href), "utf8");
  assert.doesNotMatch(html, /2026-08-12|8월 12일|datetime="null"/);
  assert.match(html, /게시일 <time datetime="2026-09-23">2026년 9월 23일/);
  assert.match(html, /서울 노원구/);
  assert.match(html, /공개 동의/);
  assert.equal((html.match(/<img /g) || []).length, 3);
  assert.doesNotMatch(html, /housing-presentation|community-booth|명 참여|만족도/);
  const schema = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
  assert.equal(schema.datePublished, "2026-09-23");
  assert.equal(schema.temporalCoverage, undefined);
  assert.match(html, /공릉종합사회복지관 AI 교육/);
  assert.match(html, /반복 실습/);
  assert.match(html, /개별 사진의 촬영일·기관은 특정하지 않았으며/);
  for (const route of ["/", "/activities/", "/activities/field-records/"]) {
    const page = await readFile(routeFile(route), "utf8");
    assert.ok(page.includes(`href="${education.href}"`));
    assert.doesNotMatch(page, /2026-08-12|8월 12일|datetime="null"/);
  }
  assert.ok((await readFile(path.join(root, "sitemap.xml"), "utf8")).includes(education.href));
});

test("research is in progress without claiming published results", async () => {
  const manifest = JSON.parse(await readFile(path.join(root, "build-manifest.json"), "utf8"));
  for (const page of manifest.pages) {
    const file = page.route === "/404.html" ? path.join(root, "404.html") : routeFile(page.route);
    const html = await readFile(file, "utf8");
    assert.doesNotMatch(html, /기획·준비 단계|실태조사는 기획 단계|기획 단계의 실태조사|앞으로 준비하는 조사|실태조사 및 공익자료 발간 준비|조사 준비 내용 보기|조사 참여 접수 전/, page.route);
  }
  for (const route of ["/", "/programs/", "/programs/housing-research/", "/participate/", "/terms/"]) {
    assert.match(await readFile(routeFile(route), "utf8"), /진행 중/, route);
  }
  const research = await readFile(routeFile("/programs/housing-research/"), "utf8");
  assert.match(research, /진행 현황과 결과 공개/);
  assert.match(research, /이 웹사이트에서는 조사 응답을 접수하지 않습니다/);
  assert.match(research, /현재 공개된 조사보고서는 없습니다/);
  assert.doesNotMatch(research, /<form\b|설문 응답하기|실태조사 완료|조사보고서 발간 완료/);
  assert.match(research, /등록 고유사업명: 주거상생 실태조사/);
  assert.doesNotMatch(research, /<h2>제공 내용<\/h2>|<span>비용: 무료<\/span>/);
  const consulting = await readFile(routeFile("/programs/senior-home-consulting/"), "utf8");
  assert.match(consulting, /한지붕 대표와 운영진이 직접 응대/);
  assert.match(consulting, /등록 고유사업명: 어르신 주택 개선 무료상담/);
  const education = await readFile(routeFile("/programs/intergenerational-volunteer/"), "utf8");
  for (const term of ["스마트폰·디지털 기초교육", "AI·디지털 서비스 활용 교육", "한국 주거문화", "유휴공간 정리·활용", "상설 정규반은 아닙니다"]) assert.ok(education.includes(term), term);
});

test("privacy states owner-confirmed Workspace custody and manual deletion responsibility", async () => {
  const html = await readFile(routeFile("/privacy/"), "utf8");
  for (const term of ["Google Workspace 기반 서비스", "대표자와 지정된 운영담당자로 제한", "대표자 또는 지정 개인정보 관리담당자", "정기적으로 보관기간을 확인", "해당 정보만 분리"]) assert.ok(html.includes(term), term);
  assert.doesNotMatch(html, /자동 삭제|국내에만|대한민국에만/);
});

test("operating guidance states available channels and prior agreement rules", async () => {
  for (const route of ["/programs/senior-home-consulting/", "/contact/", "/participate/"]) {
    const html = await readFile(routeFile(route), "utf8");
    assert.match(html, /전화·이메일 기초상담은 무료/);
    assert.match(html, /주택 방문상담/);
    assert.doesNotMatch(html, /방문상담의 제공 여부와 범위는 확정되어 있지|방문 가능 여부/);
  }
  for (const route of ["/programs/intergenerational-volunteer/", "/contact/", "/participate/"]) {
    const html = await readFile(routeFile(route), "utf8");
    assert.match(html, /합의하지 않은 비용/);
    assert.match(html, /부담 주체/);
    assert.doesNotMatch(html, /비용.{0,15}확정되어 있지|비용.{0,15}확정되지 않았|일정 미정|비용 미정/);
  }
});

test("tracking remains off until an actual account and meaningful conversion flow are verified", async () => {
  const html = await readFile(routeFile("/privacy/"), "utf8");
  assert.match(html, /광고 전환 추적 태그를 사용하지 않습니다/);
  assert.match(html, /버튼 클릭만으로 실제 통화나 문의 수신 여부를 확인하지 않으며/);
  const manifest = JSON.parse(await readFile(path.join(root, "build-manifest.json"), "utf8"));
  for (const page of manifest.pages) {
    const file = page.route === "/404.html" ? path.join(root, "404.html") : routeFile(page.route);
    const content = await readFile(file, "utf8");
    assert.doesNotMatch(content, /googletagmanager\.com|google-analytics\.com|googleadservices\.com|gtag\(|dataLayer/);
    const scripts = [...content.matchAll(/<script[^>]+src="([^"]+)"/g)].map((match) => match[1]);
    const expected = /^\/(consultation|partnership)\//.test(page.route) ? ["/assets/site.js", "/assets/inquiry.js"] : ["/assets/site.js"];
    assert.deepEqual(scripts.map((src) => new URL(src, "https://hanjibung.kr").pathname), expected);
  }
});

test("corrected grant plan separates allocations from completed spending", async () => {
  const { funding, fundingTotals } = await import("../src/content/funding.mjs");
  assert.equal(funding.received, 600000);
  assert.equal(funding.source, "마을공동체 사업 지원금");
  assert.equal(funding.disclosureType, "plan-and-actual");
  assert.equal(funding.grantProgram, "노원구청 마을공동체 사업");
  assert.equal(funding.activityName, "노인복지 및 지역 어르신 무료상담");
  assert.equal(funding.executionAsOf, "2026-09-20");
  assert.equal(funding.actualExpenses.length, 5);
  assert.equal(fundingTotals.spent, 191500);
  assert.equal(fundingTotals.unspent, 408500);
  assert.equal(fundingTotals.spent + fundingTotals.unspent, funding.received);
  assert.ok(funding.actualExpenses.every((item) => item.date <= funding.executionAsOf && Number.isSafeInteger(item.amount) && item.evidence));
  assert.equal(funding.plannedExpenses.length, 5);
  assert.ok(funding.plannedExpenses.every((item) => Number.isSafeInteger(item.amount) && item.amount > 0));
  assert.equal(fundingTotals.planned, 400000);
  assert.equal(fundingTotals.unallocated, 200000);
  assert.equal(fundingTotals.planned + fundingTotals.unallocated, funding.received);
  assert.deepEqual(fundingTotals.byMonth.map((item) => item.month), [7, 8, 9, 10, 11]);
  assert.deepEqual(fundingTotals.byMonth.map((item) => item.amount), [70000, 90000, 80000, 80000, 80000]);
  assert.equal(funding.receivedAt, null);
  assert.equal(funding.agencySettlementApproved, null);
  for (const route of ["/transparency/", funding.href]) {
    const html = await readFile(routeFile(route), "utf8");
    assert.match(html, /노원구청 마을공동체 사업/);
    assert.match(html, /600,000원/);
    assert.match(html, /집행 예정액 400,000원/);
    assert.match(html, /추후 사업비 200,000원/);
    assert.match(html, /실제 집행 후 남은 잔액이 아닙니다/);
    assert.match(html, /실제 집행액 191,500원/);
    assert.match(html, /미집행액 408,500원/);
    assert.match(html, /2026년 9월 20일/);
    assert.match(html, /단체 전체의 연간 결산이나 지원기관의 정산 승인 결과를 뜻하지 않습니다/);
    assert.doesNotMatch(html, /잔액 0원|이렇게 사용했습니다|지출 합계 600,000원|지출 세부내역 · 6건|외부 감사 완료|정산 승인 완료/);
  }
  const detail = await readFile(routeFile(funding.href), "utf8");
  for (const item of funding.plannedExpenses) {
    assert.ok(detail.includes(item.category));
    assert.ok(detail.includes(item.detail));
  }
  for (const item of funding.actualExpenses) {
    assert.ok(detail.includes(item.detail));
    assert.ok(detail.includes(item.evidence));
    assert.ok(detail.includes(`datetime="${item.date}"`));
  }
  assert.match(detail, /2026년 11월 30일 예정/);
  assert.doesNotMatch(detail, /2026\.07\.01|2026\.08\.31|7월 1일.*공개|8월 31일.*반영/);
  for (const route of ["/transparency/", "/activities/"]) assert.ok((await readFile(routeFile(route), "utf8")).includes(`href="${funding.href}"`));
  assert.ok((await readFile(path.join(root, "sitemap.xml"), "utf8")).includes(funding.href));
});

test("dated consultation records use confirmed photo order and keep all photos", async () => {
  const { consultationRecords } = await import("../src/content/consultation-records.mjs");
  const { consultationPhotos } = await import("../src/content/consultation-photos.mjs");
  const html = await readFile(routeFile("/activities/field-records/"), "utf8");
  assert.deepEqual(consultationRecords.map((item) => item.date), ["2026-07-18", "2026-08-22", "2026-09-12"]);
  assert.deepEqual(consultationRecords.map((item) => item.photoIndex), [0, 1, 2]);
  for (const item of consultationRecords) {
    const section = html.slice(html.indexOf(`id="${item.id}"`)).split('</section>')[0];
    for (const fact of [item.date, item.title, item.area, item.participants, consultationPhotos[item.photoIndex].file, "활동 이후 진행한 사항"]) assert.ok(section.includes(fact), fact);
  }
  assert.equal((html.match(/<img /g) || []).length, 9);
  assert.match(html, /중복 제거한 전체 실인원으로 합산하지 않습니다/);
  assert.match(html, /활동 상세 반영일 <time datetime="2026-09-24">/);
});

test("interim research discloses distinct counts, corrected start and future stages", async () => {
  const { research, researchTotal } = await import("../src/content/research.mjs");
  assert.equal(research.start, "2026-07-15");
  assert.equal(research.asOf, "2026-09-20");
  assert.deepEqual(research.participants.map((group) => group.count), [24, 8, 12, 4]);
  assert.equal(researchTotal, 48);
  const html = await readFile(routeFile("/programs/housing-research/"), "utf8");
  for (const text of ["2026년 7월 15일", "2026년 9월 20일", "48명", "동일인이 여러 차례", "지역 전체를 대표하는 통계조사가 아니라", "2026년 10월 · 예정", "2026년 11월 · 예정", "직접 인용", "현재 공개된 조사보고서는 없습니다"]) assert.ok(html.includes(text), text);
  assert.doesNotMatch(html, /2026-07-01|2026년 7월 1일|<form\b/);
});

test("consultation, research and funding pages link into one public evidence flow", async () => {
  for (const route of ["/activities/field-records/", "/programs/housing-research/", "/transparency/", "/activities/nowon-grant-execution/"]) {
    const html = await readFile(routeFile(route), "utf8");
    assert.match(html, /class="evidence-flow"/);
    for (const href of ["/activities/field-records/", "/programs/housing-research/#progress", "/transparency/#execution"]) assert.ok(html.includes(`href="${href}"`));
  }
});

test("nonprofit wording explains the tax status without claiming incorporation", async () => {
  for (const route of ["/", "/about/", "/transparency/", "/activities/nonprofit-registration/"]) {
    const html = await readFile(routeFile(route), "utf8");
    assert.match(html, /비영리법인/);
    assert.match(html, /국세기본법상 법인으로 보는 단체/);
    assert.doesNotMatch(html, /민법상 법인 설립허가·등기 완료|한지붕은 비영리단체입니다/);
  }
  const registration = await readFile(routeFile("/activities/nonprofit-registration/"), "utf8");
  assert.match(registration, /법인세법 제2조/);
  assert.match(registration, /민법상 법인 설립허가·등기와는 구분됩니다/);
});

test("photo context precedes income-themed photographs without removing them", async () => {
  const html = await readFile(routeFile("/activities/field-records/"), "utf8");
  assert.ok(html.indexOf('현재 상담은 생활의 준비사항을 안내합니다') < html.indexOf('src="/assets/activities/consultation-booth.jpg"'));
  assert.ok(html.indexOf('현장 기록과 현재 서비스 안내를 구분합니다') < html.indexOf('src="/assets/activities/community-booth.jpg"'));
  assert.equal((html.match(/<img /g) || []).length, 9);
});

test("brand accessible names include both visible Korean and English names", async () => {
  const html = await readFile(routeFile("/"), "utf8");
  const names = [...html.matchAll(/class="brand(?: footer-brand)?" href="\/" aria-label="([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(names, ["한지붕 HANJIBUNG 홈페이지", "한지붕 HANJIBUNG 홈페이지"]);
});

test("responsive WebP delivery preserves JPEG fallbacks and excludes source metadata", async () => {
  const { consultationPhotos } = await import("../src/content/consultation-photos.mjs");
  const { digitalLearning } = await import("../src/content/field-records.mjs");
  const { photoVariants } = await import("../src/lib/photo-variants.mjs");
  const html = await readFile(routeFile("/activities/field-records/"), "utf8");
  for (const photo of [...consultationPhotos, ...digitalLearning.photos]) {
    const original = await readFile(path.join(root, "assets/activities", photo.file));
    assert.ok(html.includes(`src="/assets/activities/${photo.file}"`));
    for (const variant of photoVariants(photo)) {
      const bytes = await readFile(path.join(root, "assets/activities", variant.file));
      assert.equal(bytes.toString("ascii", 0, 4), "RIFF");
      assert.equal(bytes.toString("ascii", 8, 12), "WEBP");
      assert.ok(bytes.length < original.length, variant.file);
      for (let offset = 12; offset + 8 <= bytes.length;) {
        const chunk = bytes.toString("ascii", offset, offset + 4);
        assert.ok(!["EXIF", "XMP "].includes(chunk), `${variant.file}: ${chunk}`);
        const size = bytes.readUInt32LE(offset + 4);
        offset += 8 + size + (size % 2);
      }
      assert.ok(html.includes(`${variant.file} ${variant.width}w`));
    }
  }
  assert.equal((html.match(/<picture>/g) || []).length, 9);
  const home = await readFile(routeFile("/"), "utf8");
  assert.match(home, /consultation-walk-960\.webp 960w/);
  assert.match(home, /consultation-walk-768\.webp 768w/);
  assert.match(home, /loading="eager" fetchpriority="high"/);
});

test("income-themed photo explanations stay attached to all relevant figures", async () => {
  const html = await readFile(routeFile("/activities/field-records/"), "utf8");
  for (const name of ["consultation-booth", "field-conversation", "community-booth"]) {
    const figure = [...html.matchAll(/<figure\b[^>]*>[\s\S]*?<\/figure>/g)].find((match) => match[0].includes(`${name}.jpg`))?.[0];
    assert.ok(figure, name);
    assert.match(figure, /class="photo-context-caption"/);
    assert.match(figure, /현재 서비스와 구분해 주세요/);
  }
  const consultation = await readFile(routeFile("/programs/senior-home-consulting/"), "utf8");
  assert.doesNotMatch(consultation, /consultation-booth|field-conversation|community-booth/);
});

test("copy controls disclose clipboard use without inventing receipt or tracking", async () => {
  const html = await readFile(routeFile("/contact/"), "utf8");
  assert.match(html, /data-copy-contact="phone"/);
  assert.match(html, /data-copy-contact="email"/);
  assert.equal((html.match(/role="status" aria-live="polite" aria-atomic="true"/g) || []).length, 5);
  const privacy = await readFile(routeFile("/privacy/"), "utf8");
  assert.match(privacy, /기기의 클립보드/);
  assert.match(privacy, /문의가 접수되지는 않습니다/);
  const script = await readFile(path.join(root, "assets/site.js"), "utf8");
  assert.match(script, /복사가 허용되지 않았습니다/);
  assert.doesNotMatch(script, /접수 완료|신청 완료|gtag\(|dataLayer|fetch\(/);
});

test("inquiry templates are static, optional and never turn mail opening into receipt", async () => {
  const { inquiryTemplates } = await import("../src/content/inquiry-templates.mjs");
  const html = await readFile(routeFile("/contact/"), "utf8");
  assert.equal(inquiryTemplates.length, 3);
  assert.equal((html.match(/data-copy-template/g) || []).length, 3);
  assert.doesNotMatch(html, /<(?:form|input|textarea|select)\b/);
  assert.match(html, /모든 항목을 채울 필요는 없습니다/);
  assert.match(html, /홈페이지에서 입력하거나 접수하는 폼은 아닙니다/);
  for (const item of inquiryTemplates) {
    assert.ok(html.includes(`id="inquiry-text-${item.id}"`));
    assert.ok(html.includes(`aria-describedby="inquiry-status-${item.id}" hidden`));
    const link = `mailto:onehousetoge@gmail.com?subject=${encodeURIComponent(item.subject)}`;
    assert.ok(html.includes(`href="${link}"`));
    assert.deepEqual([...new URL(link).searchParams.keys()], ["subject"]);
    assert.ok(html.includes(item.text));
  }
  const hero = html.match(/<section class="page-hero">[\s\S]*?<\/section>/)?.[0];
  assert.match(hero, /href="tel:\+821045879428"/);
  assert.match(hero, /href="#inquiry-templates"/);
});

test("long program pages expose working jumps and unambiguous excluded services", async () => {
  for (const slug of ["senior-home-consulting", "intergenerational-volunteer"]) {
    const html = await readFile(routeFile(`/programs/${slug}/`), "utf8");
    for (const id of ["program-contents", "program-how", "program-cost", "program-limits", "program-faq"]) {
      assert.ok(html.includes(`href="#${id}"`));
      assert.ok(html.includes(`id="${id}" tabindex="-1"`));
    }
    assert.match(html, />제공하지 않는 업무<\/h2><p>다음 업무는 한지붕의 현재 서비스에 포함되지 않습니다/);
    assert.match(html, /href="\/contact\/#inquiry-templates"/);
  }
});

test("copy handlers use only static text and recover from clipboard rejection", async () => {
  const { runInNewContext } = await import("node:vm");
  const script = await readFile(path.join(root, "assets/site.js"), "utf8");
  function harness(writeText) {
    const target = { textContent: "  빈 문의 문안\n궁금한 점:  " };
    const status = { textContent: "" };
    const button = {
      hidden: true, disabled: false, dataset: { copyTarget: "prompt" },
      getAttribute: () => "status", hasAttribute: (name) => name === "data-copy-template",
      attributes: {}, setAttribute(name, value) { this.attributes[name] = value; },
      addEventListener(type, callback) { if (type === "click") this.click = callback; },
    };
    const document = {
      querySelectorAll: (selector) => selector === "[data-copy-contact], [data-copy-template]" ? [button] : [],
      querySelector: () => null,
      getElementById: (id) => id === "prompt" ? target : status,
      addEventListener() {}, body: { classList: { add() {} } },
    };
    runInNewContext(script, {
      document, navigator: { clipboard: writeText ? { writeText } : undefined },
      window: { matchMedia: () => ({ addEventListener() {} }), addEventListener() {} },
    });
    return { button, status };
  }
  const copied = [];
  let finish;
  const success = harness((text) => { copied.push(text); return new Promise((resolve) => { finish = resolve; }); });
  assert.equal(success.button.hidden, false);
  const pending = success.button.click();
  assert.equal(success.button.disabled, false);
  assert.equal(success.button.attributes["aria-busy"], "true");
  await success.button.click();
  assert.equal(copied.length, 1, "Repeated activation while pending must not duplicate clipboard writes");
  finish();
  await pending;
  assert.deepEqual(copied, ["빈 문의 문안\n궁금한 점:"]);
  assert.equal(success.button.disabled, false);
  assert.equal(success.button.attributes["aria-busy"], "false");
  assert.match(success.status.textContent, /직접 전송/);
  const denied = harness(async () => { throw new Error("Permission denied for test"); });
  await denied.button.click();
  assert.match(denied.status.textContent, /직접 작성/);
  assert.equal(denied.button.disabled, false);
  assert.equal(denied.button.attributes["aria-busy"], "false");
  const unavailable = harness();
  assert.equal(unavailable.button.hidden, true);
  assert.equal(unavailable.button.click, undefined);
});

test("CSS and JavaScript versions match the built bytes", async () => {
  const { createHash } = await import("node:crypto");
  const html = await readFile(routeFile("/"), "utf8");
  for (const name of ["site.css", "site.js"]) {
    const bytes = await readFile(path.join(root, "assets", name));
    const version = createHash("sha256").update(bytes).digest("hex").slice(0, 12);
    assert.ok(html.includes(`/assets/${name}?v=${version}`));
  }
});
