import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pageDates } from "../src/config/page-dates.mjs";
import { site } from "../src/config/site.mjs";
import { privacyBody } from "../src/content/privacy.mjs";
import { adminEntry } from "../src/lib/admin-entry.mjs";
import { reservationPage } from "../src/lib/reservation-page.mjs";
import { roomCheckPage } from "../src/lib/room-check-page.mjs";
import { rentFaqSchema } from "../src/lib/rent-faq.mjs";
import { absolute, layout, organizationSchema } from "../src/lib/template.mjs";
import {
  roomCheckStylesheetUrl, roomCheckScriptUrl, incomeCalculatorStylesheetUrl, incomeCalculatorScriptUrl,
  diagnosisPrefillScriptUrl, reservationStylesheetUrl, reservationScriptUrl,
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
  description: "한지붕 우리 집 남는 방 예상 월세 진단에서 방 정보와 지역 정보를 보내고 예상 월세와 준비사항을 안내받으세요.",
  path: "/",
  body: roomCheckPage(),
  bodyClass: "room-check-page",
  showHeader: false,
  showFooter: false,
  jsonLd: [
    { "@context": "https://schema.org", "@type": "WebSite", name: site.name, alternateName: site.englishName, url: absolute("/") },
    organizationSchema,
    rentFaqSchema,
  ],
}).replace("</head>", `<link rel="stylesheet" href="${roomCheckStylesheetUrl}"><link rel="stylesheet" href="${incomeCalculatorStylesheetUrl}"><script src="${roomCheckScriptUrl}" defer></script><script src="${diagnosisPrefillScriptUrl}" defer></script><script src="${incomeCalculatorScriptUrl}" defer></script></head>`));
await emit("/reservation/", layout({ title: "예상 월세 무료 진단 신청", description: "우리 집 남는 방의 예상 월세와 준비사항을 무료로 안내받으세요. 집 위치와 방 정보를 남기면 한지붕 매니저가 확인 후 연락드립니다.", path: "/reservation/", body: reservationPage(), bodyClass: "reservation-page", showHeader: false, showFooter: false, jsonLd: organizationSchema }).replace("</head>", `<link rel="stylesheet" href="${reservationStylesheetUrl}"><script src="${diagnosisPrefillScriptUrl}" defer></script><script src="${reservationScriptUrl}" defer></script></head>`));
await emit("/reservation/privacy/", layout({
  title: "개인정보 처리방침",
  description: "한지붕 방 진단과 빠른 상담 신청에 적용되는 개인정보 처리방침입니다.",
  path: "/reservation/privacy/",
  body: privacyBody,
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
  "site.css", "site.js", "analytics.js", "room-check.css", "room-check.js",
  "reservation.css", "reservation.js", "diagnosis-prefill.js", "income-calculator.css",
  "income-calculator.js", "callback.js", "inquiry.js", "figma", "fonts", "og-default.png",
  "hanjibung-logo.png", "hanjibung-logo-256.png", "hanjibung-icon-64.png", "hanjibung-icon-192.png",
];
for (const asset of assets) {
  await cp(path.join(root, "src", "assets", asset), path.join(out, "assets", asset), { recursive: true });
}

await writeFile(path.join(out, "build-manifest.json"), JSON.stringify({ generatedAt: new Date().toISOString(), pages: generated.map(({ route, indexable, updatedAt }) => ({ route, indexable, updatedAt })) }, null, 2), "utf8");
console.log(`Built ${generated.length} HTML files and ${sitemapEntries.length} indexable routes.`);
