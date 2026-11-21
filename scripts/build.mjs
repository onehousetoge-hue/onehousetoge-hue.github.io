import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pageDates } from "../src/config/page-dates.mjs";
import { site } from "../src/config/site.mjs";
import { privacyBody } from "../src/content/privacy.mjs";
import { adminEntry } from "../src/lib/admin-entry.mjs";
import { reservationPage } from "../src/lib/reservation-page.mjs";
import { aboutPage } from "../src/lib/about-page.mjs";
import { intakePage } from "../src/lib/callback-form.mjs";
import { roomRegistrationPage } from "../src/lib/room-registration-page.mjs";
import { roomCheckPage } from "../src/lib/room-check-page.mjs";
import { rentFaqSchema } from "../src/lib/rent-faq.mjs";
import { absolute, layout, organizationSchema } from "../src/lib/template.mjs";
import {
  assetText, roomCheckStylesheetUrl, rentFaqSearchUrl, legacyEntryScript, incomeCalculatorStylesheetUrl, incomeCalculatorScriptUrl,
  diagnosisPrefillScriptUrl, reservationStylesheetUrl, reservationScriptUrl, aboutStylesheetUrl, serviceStylesheetUrl, registrationStylesheetUrl, registrationSource, headlineExperiment,
} from "../src/lib/static-assets.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "dist");
const generated = [];

await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });

function routeToFile(route) {
  if (route === "/") return path.join(out, "index.html");
  if (route === "/404.html") return path.join(out, "404.html");
  return path.join(out, route.replace(/^\//, ""), "index.html");
}

async function emit(route, html, { indexable = true, updatedAt = pageDates[route] } = {}) {
  if (indexable && !updatedAt) throw new Error(`Missing editorial lastmod: ${route}`);
  const file = routeToFile(route);
  await mkdir(path.dirname(file), { recursive: true });
  const normalized = `${html.replace(/[ \t]+$/gm, "").trimEnd()}\n`;
  await writeFile(file, normalized, "utf8");
  generated.push({ route, file, indexable, updatedAt });
}

await emit("/", layout({
  title: "우리 집 남는 방 예상 월세 진단",
  description: "지금 사는 집의 빈방을 대학생에게 빌려줄 때 받을 월세를 무료로 진단하세요. 한지붕의 방 준비·학생 소개 절차와 집주인이 자주 묻는 월세 정산, 공실, 계약, 세금 질문을 확인할 수 있습니다.",
  path: "/",
  body: roomCheckPage(),
  bodyClass: "room-check-page",
  showDiagnosisDock: false,
  showFooter: false,
  jsonLd: [
    { "@context": "https://schema.org", "@type": "WebSite", name: site.name, alternateName: site.englishName, url: absolute("/") },
    organizationSchema,
    rentFaqSchema,
  ],
}).replace("</head>", `${legacyEntryScript}<link rel="stylesheet" href="${roomCheckStylesheetUrl}"><link rel="stylesheet" href="${incomeCalculatorStylesheetUrl}"><script src="${diagnosisPrefillScriptUrl}" defer></script><script src="${incomeCalculatorScriptUrl}" defer></script><script src="${rentFaqSearchUrl}" defer></script></head>`));
await emit("/reservation/", layout({ title: "예상 월세 무료 진단 신청", description: "우리 집 남는 방의 예상 월세와 준비사항을 무료로 안내받으세요. 집 위치와 방 정보를 남기면 한지붕 매니저가 확인 후 연락드립니다.", path: "/reservation/", body: reservationPage(), bodyClass: "reservation-page", showDiagnosisDock: false, showFooter: false, jsonLd: organizationSchema }).replace("</head>", `${legacyEntryScript}<link rel="stylesheet" href="${reservationStylesheetUrl}"><script src="${diagnosisPrefillScriptUrl}" defer></script><script src="${reservationScriptUrl}" defer></script></head>`));
for (const [route, title, description, body, styles] of [
  ["/about/", "한지붕 소개", "MBC 뉴스데스크가 취재한 어르신과 대학생의 한집살이와 김현수 대표의 인터뷰를 보세요. 노원구 공릉동에서 시작한 한지붕이 방 준비부터 입주 후 생활까지 어떻게 돕는지 소개합니다.", headlineExperiment + aboutPage(), [aboutStylesheetUrl]],
  ["/consultation/", "상담 신청하기", "빈방 활용이나 대학생과의 공동생활에 대해 궁금한 점을 한지붕 매니저에게 남겨 주세요. 이름과 연락처, 질문을 보내면 매니저가 답변합니다.", intakePage(), [reservationStylesheetUrl, serviceStylesheetUrl]],
  ["/rooms/register/", "방 등록하기", "한지붕 도우미에게 동네, 방 개수, 입주 시기를 알려주세요. 방 조건과 사진을 확인하고 방문할 주소와 연락처를 남기면 매니저가 등록 내용을 확인합니다.", roomRegistrationPage(), [registrationStylesheetUrl]],
]) {
  const stylesheetLinks = styles.map((href) => `<link rel="stylesheet" href="${href}">`).join("");
  await emit(route, layout({ title, description, path: route, body, bodyClass: "reservation-page", showDiagnosisDock: false, showFooter: false, jsonLd: organizationSchema })
    .replace("</head>", `${stylesheetLinks}</head>`));
}

await emit("/reservation/privacy/", layout({
  title: "개인정보 처리방침",
  description: "한지붕 월세 진단, 상담 신청, 방 등록에서 받는 정보와 보관 기간, 삭제 요청 방법을 안내합니다.",
  path: "/reservation/privacy/",
  body: headlineExperiment + privacyBody,
  breadcrumbs: [{ label: "개인정보 처리방침", href: "/reservation/privacy/" }],
  jsonLd: organizationSchema,
}));

const notFoundHtml = layout({
  title: "페이지를 찾을 수 없습니다",
  description: "요청한 페이지를 찾을 수 없습니다.",
  path: "/404/",
  robots: "noindex,nofollow",
  body: '<section class="status-page"><div class="container narrow"><h1>페이지를 찾을 수 없습니다</h1><a class="button" href="/">한지붕 홈으로 가기</a></div></section>',
});
await emit("/404/", notFoundHtml, { indexable: false });
await emit("/404.html", notFoundHtml, { indexable: false });
await emit("/admin/", adminEntry("https://script.google.com/a/macros/hometogether.kr/s/AKfycbwqQ9qzLth5TXMLzUmOKMBU8knC-f-_bDnLiK75PQUSmY2FtANssbeWhzAnl5p5vJU1/exec"), { indexable: false });

const sitemapEntries = generated.filter((page) => page.indexable && page.route !== "/404.html");
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapEntries.map((page) => `  <url><loc>${absolute(page.route)}</loc><lastmod>${page.updatedAt}</lastmod></url>`).join("\n")}\n</urlset>\n`;
await writeFile(path.join(out, "sitemap.xml"), sitemap, "utf8");
await writeFile(path.join(out, "robots.txt"), `User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /admin/\nDisallow: /src/\nDisallow: /scripts/\nDisallow: /tests/\nDisallow: /README.md\nDisallow: /AD_GRANTS_READINESS.md\nDisallow: /CONTENT_SOURCES.md\nDisallow: /CONTENT_GAPS.md\nDisallow: /DEPLOYMENT.md\nDisallow: /POST_DEPLOY_CHECKLIST.md\nSitemap: ${site.url}/sitemap.xml\n`, "utf8");
await writeFile(path.join(out, "site.webmanifest"), JSON.stringify({ name: "비영리단체 한지붕", short_name: site.name, start_url: "/", display: "standalone", background_color: "#faf9f5", theme_color: "#8f2929", icons: [{ src: "/assets/hanjibung-icon-64.png", sizes: "64x64", type: "image/png" }, { src: "/assets/hanjibung-icon-192.png", sizes: "192x192", type: "image/png" }] }, null, 2), "utf8");
await writeFile(path.join(out, "CNAME"), "hanjibung.kr\n", "utf8");
await writeFile(path.join(out, ".nojekyll"), "", "utf8");
await mkdir(path.join(out, "assets"), { recursive: true });
const assets = [
  "site.css", "site.js", "analytics.js", "room-check.css", "room-check.js", "rent-faq-search.js",
  "reservation.css", "service-pages.css", "about.css", "reservation.js", "diagnosis-prefill.js", "income-calculator.css",
  "about-home-640.webp", "about-home-800.webp", "about-home-1200.webp",
  "income-calculator.js", "callback.js", "inquiry.js", "room-description.js", "room-registration.css", "consultation-walk.webp", "figma", "fonts", "og-default.png",
  "hanjibung-logo.png", "hanjibung-logo-256.png", "hanjibung-icon-64.png", "hanjibung-icon-192.png",
];
for (const asset of assets) {
  const destination = path.join(out, "assets", asset);
  if (/\.(css|js)$/.test(asset)) await writeFile(destination, assetText(asset), "utf8");
  else await cp(path.join(root, "src", "assets", asset), destination, { recursive: true });
}
await writeFile(path.join(out, "assets", "room-registration.js"), registrationSource, "utf8");

await writeFile(path.join(out, "build-manifest.json"), JSON.stringify({ generatedAt: new Date().toISOString(), pages: generated.map(({ route, indexable, updatedAt }) => ({ route, indexable, updatedAt })) }, null, 2), "utf8");
console.log(`Built ${generated.length} HTML files and ${sitemapEntries.length} indexable routes.`);
