import { navigation, site } from "../config/site.mjs";
import { stylesheetUrl, scriptUrl } from "./static-assets.mjs";

const escapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const absolute = (path) => new URL(path, `${site.url}/`).href;

export function icon(name, className = "") {
  const paths = {
    home: '<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v10h13V10M9.5 20v-6h5v6"/>',
    people: '<circle cx="8" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M2.5 20c.4-4 2.3-6 5.5-6s5.1 2 5.5 6M14 15c3.5-.8 6.5 1 7 5"/>',
    research: '<path d="M5 3h10l4 4v14H5Z"/><path d="M15 3v5h4M8 16l2-2 2 1 4-5M8 19h8"/>',
    book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H12v17H6.5A2.5 2.5 0 0 0 4 22Z"/><path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H12v17h5.5A2.5 2.5 0 0 1 20 22Z"/>',
    arrow: '<path d="M5 12h14M14 7l5 5-5 5"/>',
    check: '<path d="m5 12.5 4 4L19 7.5"/>',
    phone: '<path d="M8.5 3H5.8A2.8 2.8 0 0 0 3 5.8C3 14.2 9.8 21 18.2 21a2.8 2.8 0 0 0 2.8-2.8v-2.7l-4.2-1.4-1.1 2.3a13.3 13.3 0 0 1-8.1-8.1l2.3-1.1Z"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    shield: '<path d="M12 3 20 6v5.5c0 4.7-3.1 8-8 9.5-4.9-1.5-8-4.8-8-9.5V6Z"/><path d="m8.5 12 2.2 2.2 4.8-5"/>',
    print: '<path d="M7 9V3h10v6M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2"/><path d="M7 14h10v7H7Z"/>',
  };
  return `<svg class="icon ${className}" aria-hidden="true" viewBox="0 0 24 24">${paths[name] || paths.arrow}</svg>`;
}

export function pageHead({ title, documentTitle, description, path, type = "website", robots = "index,follow", publishedAt, updatedAt, jsonLd = [] }) {
  const canonical = absolute(path);
  const fullTitle = documentTitle || (title === site.name ? `${site.name} | 어르신 빈방 활용 무료상담과 세대교류` : `${title} | ${site.name}`);
  const schemas = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
  return `
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="${escapeHtml(description)}">
    <meta name="robots" content="${robots}">
    <meta name="referrer" content="strict-origin-when-cross-origin">
    <meta name="theme-color" content="#8f2929">
    <title>${escapeHtml(fullTitle)}</title>
    <link rel="canonical" href="${canonical}">
    <link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
    <link rel="manifest" href="/site.webmanifest">
    <link rel="stylesheet" href="${stylesheetUrl}">
    <meta property="og:locale" content="ko_KR">
    <meta property="og:type" content="${type}">
    <meta property="og:site_name" content="${site.name}">
    <meta property="og:title" content="${escapeHtml(fullTitle)}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:url" content="${canonical}">
    <meta property="og:image" content="${site.url}/assets/og-default.png">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="한지붕 - 남는 공간을 살피고 세대가 함께 살아갈 기준을 만듭니다">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(fullTitle)}">
    <meta name="twitter:description" content="${escapeHtml(description)}">
    <meta name="twitter:image" content="${site.url}/assets/og-default.png">
    ${publishedAt ? `<meta property="article:published_time" content="${publishedAt}">` : ""}
    ${updatedAt ? `<meta property="article:modified_time" content="${updatedAt}">` : ""}
    ${schemas.map((schema) => `<script type="application/ld+json">${JSON.stringify(schema).replaceAll("<", "\\u003c")}</script>`).join("\n")}
    <script src="${scriptUrl}" defer></script>`;
}

export function header(currentPath = "/") {
  const links = navigation
    .map(([label, href]) => `<a href="${href}"${currentPath.startsWith(href) && href !== "/" ? ' aria-current="page"' : ""}>${label}</a>`)
    .join("");
  return `
    <a class="skip-link" href="#main-content">본문으로 바로가기</a>
    <header class="site-header" data-header>
      <div class="container header-inner">
        <a class="brand" href="/" aria-label="한지붕 HANJIBUNG 홈페이지">
          <span><strong>${site.name}</strong> <small>${site.englishName}</small></span>
        </a>
        <a class="header-quick-action" href="/consultation/">상담 문의</a>
        <button class="menu-button" type="button" aria-expanded="false" aria-controls="primary-navigation" data-menu-button>
          <span class="menu-open-icon">${icon("menu")}</span><span class="menu-close-icon">${icon("close")}</span><span class="menu-label" aria-hidden="true" data-menu-label>메뉴</span><span class="visually-hidden">전체 메뉴 열기</span>
        </button>
        <nav class="primary-navigation" id="primary-navigation" aria-label="주요 메뉴" data-navigation>
          <div class="nav-links">${links}</div>
          <a class="button button-small" href="/consultation/">무료상담 문의</a>
          <div class="mobile-contact-links"><a href="/partnership/">기관협력 문의</a><a href="/contact/">전화·이메일 안내</a></div>
        </nav>
      </div>
    </header>`;
}

export function footer() {
  return `
    <footer class="site-footer">
      <div class="container footer-grid">
        <div class="footer-intro">
          <a class="brand footer-brand" href="/" aria-label="한지붕 HANJIBUNG 홈페이지"><span class="brand-mark" aria-hidden="true">${icon("home")}</span><span><strong>${site.name}</strong> <small>${site.englishName}</small></span></a>
          <p>${site.footerDescription}</p>
        </div>
        <div class="footer-contact"><h2>단체 정보</h2><dl><div><dt>고유번호</dt><dd>${site.registrationNumber}</dd></div><div><dt>대표자</dt><dd>${site.representative}</dd></div><div><dt>소재지</dt><dd>${site.address}</dd></div><div><dt>전화</dt><dd><a href="${site.phoneHref}">${site.phone}</a></dd></div><div><dt>이메일</dt><dd><a href="${site.emailHref}">${site.email}</a></dd></div></dl></div>
        <div class="footer-links"><h2>안내</h2><a href="/consultation/">무료상담 문의</a><a href="/partnership/">기관협력 문의</a><a href="/participate/">참여·기관협력</a><a href="/contact/">전화·이메일 문의</a><a href="/privacy/">개인정보 처리방침</a><a href="/terms/">이용안내</a><a href="/transparency/">운영·투명성</a></div>
      </div>
      <div class="container footer-bottom"><span>© 2026 ${site.name}. All rights reserved.</span><span>${site.legalType}</span><a class="back-to-top" href="#page-top">맨 위로 돌아가기</a></div>
    </footer>`;
}

export function breadcrumb(items = []) {
  if (!items.length) return "";
  return `<nav class="breadcrumb container" aria-label="현재 위치"><ol><li><a href="/">홈</a></li>${items
    .map((item, index) => `<li>${index === items.length - 1 ? `<span aria-current="page">${escapeHtml(item.label)}</span>` : `<a href="${item.href}">${escapeHtml(item.label)}</a>`}</li>`)
    .join("")}</ol></nav>`;
}

export function pageHero({ eyebrow, title, description, meta = "" }) {
  return `<section class="page-hero"><div class="container narrow"><p class="eyebrow">${escapeHtml(eyebrow)}</p><h1>${title}</h1><p class="page-lead">${escapeHtml(description)}</p>${meta}</div></section>`;
}

export function layout({ title, documentTitle, description, path, body, breadcrumbs = [], type, robots, publishedAt, updatedAt, jsonLd = [], bodyClass = "" }) {
  const breadcrumbSchema = breadcrumbs.length
    ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "홈", item: absolute("/") },
          ...breadcrumbs.map((item, index) => ({
            "@type": "ListItem",
            position: index + 2,
            name: item.label,
            item: absolute(item.href || path),
          })),
        ],
      }
    : null;
  const schemas = [...(Array.isArray(jsonLd) ? jsonLd : [jsonLd])].filter(Boolean);
  if (breadcrumbSchema) schemas.push(breadcrumbSchema);
  return `<!doctype html><html lang="ko"><head>${pageHead({ title, documentTitle, description, path, type, robots, publishedAt, updatedAt, jsonLd: schemas })}</head><body id="page-top" class="${bodyClass}">${header(path)}${breadcrumb(breadcrumbs)}<main id="main-content">${body}</main>${footer()}</body></html>`;
}

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "NGO",
  name: site.name,
  alternateName: site.englishName,
  url: absolute("/"),
  member: { "@type": "OrganizationRole", roleName: "대표자", member: { "@type": "Person", name: site.representative } },
  foundingDate: site.foundedAt,
  telephone: site.phone,
  email: site.email,
  description: site.nonprofitDescription,
  address: {
    "@type": "PostalAddress",
    streetAddress: "동일로195길 14-5, 401호",
    addressLocality: "노원구",
    addressRegion: "서울특별시",
    addressCountry: "KR",
  },
};

export { absolute, escapeHtml };
