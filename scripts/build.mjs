import { impactSection, activityTimeline } from "../src/lib/impact.mjs";
import { homesharingArticles, homesharingCards, homesharingPage } from "../src/lib/homesharing-articles.mjs";
import { impactReportPage } from "../src/lib/impact-report-page.mjs";
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { activities } from "../src/content/activities.mjs";
import { communityActivityPage } from "../src/lib/community-activity-page.mjs";
import { pageDates } from "../src/config/page-dates.mjs";
import { inquiryPage, inquiryCompletePage } from "../src/lib/inquiry-page.mjs";
import { digitalLearning } from "../src/content/field-records.mjs";
import { fieldRecordFeature, fieldRecordPage, consultationRecordPage } from "../src/lib/field-record-page.mjs";
import { consultationRecords } from "../src/content/consultation-records.mjs";
import { digitalEducationPage } from "../src/lib/digital-education-page.mjs";
import { contactBody } from "../src/content/contact.mjs";
import { privacyBody } from "../src/content/privacy.mjs";
import { transparencyBody } from "../src/content/transparency.mjs";
import { fundingPage } from "../src/lib/funding-page.mjs";
import { resourcePage } from "../src/lib/resource-page.mjs";
import { getResource, resources } from "../src/content/resources.mjs";
import { policies, programs, site } from "../src/config/site.mjs";
import { consultationPhotos } from "../src/content/consultation-photos.mjs";
import { photoVariants } from "../src/lib/photo-variants.mjs";
import { aboutBody, aboutTitle, aboutDescription } from "../src/content/about.mjs";
import { landingPage } from "../src/lib/landing-page.mjs";
import { resourceDirectory } from "../src/lib/resource-directory.mjs";
import { serviceScope } from "../src/lib/service-scope.mjs";
import { livingLabFeature, livingLabPage, livingLabPages } from "../src/lib/living-lab.mjs";
import { editorialGuides } from "../src/content/editorial-guides.mjs";
import { editorialGuideCards, editorialGuidePage } from "../src/lib/editorial-guide-page.mjs";
import { fieldStories } from "../src/content/field-stories.mjs";
import { fieldStoryCards, fieldStoryPage } from "../src/lib/field-story-page.mjs";
import { programPage } from "../src/lib/program-page.mjs";
import { absolute, escapeHtml, icon, layout, organizationSchema, pageHero } from "../src/lib/template.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "dist");
const generated = [];

await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });

const isoDate = (date) => `${date}T00:00:00+09:00`;
const updatedMeta = (route) => `<div class="page-meta"><span>마지막 수정일 ${pageDates[route].replaceAll("-", ".")}</span></div>`;
const cardLink = (href, label) => `<a class="text-link" href="${href}">${escapeHtml(label)}${icon("arrow")}</a>`;

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

function programCards(level = 3) {
  return programs
    .map((program) => `<article class="program-card"><span class="program-number">${program.status}</span><h${level}>${program.title}</h${level}><p>${program.description}</p>${cardLink(program.href, program.slug === "senior-home-consulting" ? "무료상담 내용 보기" : program.slug === "intergenerational-volunteer" ? "프로그램 알아보기" : "실태조사 내용 보기")}</article>`)
    .join("");
}

function resourceCards(items = resources, level = 3) {
  return items.map((resource) => `<article class="resource-card"><div class="resource-meta"><span>${resource.category}</span><time datetime="${resource.publishedAt}">${resource.publishedLabel}</time><span>${resource.readTime}</span></div><h${level}>${resource.title}</h${level}><p>${resource.description}</p><p class="resource-card-outcome"><strong>이용 후 남는 것</strong>${resource.outcome}</p>${cardLink(resource.href, "자료 읽기")}</article>`).join("");
}

function activityCards(items = activities) {
  return items.map((activity) => `<article class="activity-card"><div class="resource-meta"><span>${activity.category}</span><time datetime="${activity.eventDate || activity.publishedAt}">${activity.eventDate ? "활동일 " : "게시일 "}${activity.eventLabel || activity.publishedLabel}</time></div><h3>${activity.title}</h3><p>${activity.description}</p>${cardLink(activity.href, "기록 확인하기")}</article>`).join("");
}

const homeBody = landingPage();

await emit("/", layout({ title: site.name, description: site.nonprofitDescription, path: "/", body: homeBody, jsonLd: [{ "@context": "https://schema.org", "@type": "WebSite", name: site.name, alternateName: site.englishName, url: absolute("/") }, organizationSchema] }));

await emit("/about/", layout({ title: "한지붕 소개", documentTitle: aboutTitle, description: aboutDescription, path: "/about/", body: aboutBody, updatedAt: pageDates["/about/"], breadcrumbs: [{ label: "한지붕 소개", href: "/about/" }], jsonLd: organizationSchema }));

const programsBody = `${pageHero({ eyebrow: "공익사업", title: "지금 받을 수 있는 도움과<br>진행 중인 주거상생 실태조사", description: "대표와 운영진의 무료상담, 기관 요청에 따른 교육·봉사를 제공합니다. 청년 주거와 고령층 유휴공간에 관한 실태조사를 진행하고 있습니다.", meta: updatedMeta("/programs/") })}<section class="section"><div class="container"><div class="program-grid">${programCards(2)}</div><div class="notice"><h2>한지붕이 하지 않는 일</h2><p>한지붕은 부동산 중개, 입주·계약 보장, 공사와 안전진단, 개별 법률·세무 자문을 제공하지 않습니다. 필요한 경우 관계기관 또는 자격 있는 전문가에게 확인할 수 있도록 구분해 안내합니다.</p></div></div></section>`;
await emit("/programs/", layout({ title: "공익사업", description: "어르신 유휴공간·빈방 활용 무료상담, 기관 협의형 교육·봉사와 진행 중인 주거상생 실태조사를 안내합니다.", path: "/programs/", body: programsBody, bodyClass: "directory-page", breadcrumbs: [{ label: "공익사업", href: "/programs/" }] }));

for (const program of programs) await emit(program.href, programPage(program));
for (const kind of ["consultation", "partnership"]) {
  await emit(`/${kind}/`, inquiryPage(kind));
  await emit(`/${kind}/complete/`, inquiryCompletePage(kind), { indexable: false });
}

const resourcesBody = resourceDirectory(updatedMeta("/resources/"));
await emit("/resources/", layout({ title: "주거상생 자료", description: "어르신 주택과 세대공존을 준비하는 가족·청년·기관을 위한 주거상생 공익자료입니다.", path: "/resources/", body: resourcesBody, bodyClass: "directory-page", breadcrumbs: [{ label: "주거상생 자료", href: "/resources/" }] }));

for (const resource of resources) await emit(resource.href, resourcePage(resource), { updatedAt: resource.updatedAt });
for (const article of homesharingArticles) await emit(article.href, homesharingPage(article), { updatedAt: article.updatedAt });
for (const tool of livingLabPages) await emit(tool.href, livingLabPage(tool), { updatedAt: tool.updatedAt });
for (const article of editorialGuides) await emit(article.href, editorialGuidePage(article), { updatedAt: article.updatedAt });

const activitiesBody = `${pageHero({ eyebrow: "활동과 기록", title: "동네에서 듣고,<br>다음 상담에 반영합니다.", description: "한지붕의 현장활동, 구성원의 관련 경험, 단체 운영기록을 구분해 소개합니다. 대표자의 외부 인터뷰는 별도 구역에서 확인할 수 있습니다.", meta: `${updatedMeta("/activities/")}<div class="hero-actions"><a class="button" href="#september-field-stories">9월 현장 기록</a><a class="button button-secondary" href="#activity-records">활동·운영 글목록</a><a class="button button-secondary" href="#external-activities">대표자 외부활동</a><a class="text-link" href="/activities/field-records/">기존 상담 현장사진</a></div>` })}<section class="section"><div class="container">${serviceScope()}</div></section>${fieldStoryCards()}${fieldRecordFeature()}<section class="section" id="activity-records"><div class="container"><div class="section-header"><div><p class="eyebrow">활동과 운영기록</p><h2>교육 경험과 운영기록으로 만나는<br>한지붕의 발걸음</h2></div><p>구성원의 교육 경험과 단체 운영기록을 구분하여 소개합니다. 게시일은 실제 교육일을 뜻하지 않습니다.</p></div><div class="record-list">${activities.map((activity) => `<article class="record-item"><time datetime="${activity.eventDate || activity.publishedAt}">${activity.eventDate ? "활동일 " : "게시일 "}${activity.eventLabel || activity.publishedLabel}</time><div><span class="resource-meta">${activity.category}</span><h3>${activity.title}</h3><p>${activity.description}</p></div>${cardLink(activity.href, "기록 확인")}</article>`).join("")}</div></div></section>`;
await emit("/activities/", layout({ title: "활동과 기록", description: "어르신 상담 현장과 디지털 교육 경험, 한지붕의 창립·등록 기록을 소개합니다.", path: "/activities/", body: activitiesBody + `<section class="section" id="external-activities"><div class="container"><p class="eyebrow">별도 분류 · 대표자 외부활동</p><h2>외부 사업의 자격으로 참여한 인터뷰</h2><p>한지붕 자체 사업의 성과·입주지원 사례와 구분해 소개합니다.</p>${fieldStories.filter(item=>item.media).map(item=>`<article class="record-item"><time datetime="${item.date}">방송 ${item.dateLabel}</time><div><h3><a href="${item.href}">${escapeHtml(item.title)}</a></h3><p>${escapeHtml(item.area)}</p><p>${escapeHtml(item.description)}</p></div></article>`).join("")}</div></section>` + activityTimeline(), bodyClass: "directory-page", breadcrumbs: [{ label: "활동과 기록", href: "/activities/" }] }));
await emit(digitalLearning.href, fieldRecordPage());
for (const item of fieldStories) await emit(item.href, fieldStoryPage(item), { updatedAt: item.updatedAt });
for (const record of consultationRecords) await emit(record.href, consultationRecordPage(record), { updatedAt: record.updatedAt });

function activityPage(activity) {
  if (activity.slug === "2026-impact") return impactReportPage(activity);
  if (activity.paragraphs) return communityActivityPage(activity);
  if (activity.slug === "nowon-grant-execution") return fundingPage(activity);
  if (activity.slug === "senior-digital-education") return digitalEducationPage(activity);
  const founding = activity.slug === "founding-meeting";
  const articleBody = founding
    ? `<p class="lead">2026년 7월 5일 한지붕 창립총회를 개최하고 비영리 목적과 운영의 기초를 마련했습니다. 이 글은 개인정보가 포함된 원본 회의자료를 공개하지 않고 확인 가능한 의결 내용만 정리한 운영기록입니다.</p><h2>총회에서 의결한 내용</h2><ul><li>비영리 목적의 한지붕 설립</li><li>단체명 ‘한지붕’ 의결</li><li>대표자 김현수 선임</li><li>회칙 승인</li><li>세대교류 봉사 프로그램, 주거상생 실태조사, 어르신 주택 개선 무료상담을 고유사업으로 의결</li></ul><h2>공개 범위</h2><p>회원의 전화번호, 생년월일, 주소, 서명과 날인 등 개인을 식별할 수 있는 정보는 공개하지 않습니다. 기관이 단체 등록문서 열람을 요청하는 경우에도 안전한 마스킹본을 준비할 수 있는지 확인한 뒤 대응합니다.</p><h2>창립 이후의 운영 원칙</h2><p>한지붕은 현재 수익사업 없이 비영리단체로서 목적사업을 중심으로 운영합니다. 확인되지 않은 활동성과, 참여인원과 협력기관을 게시하지 않으며 실제 활동자료가 갖춰진 뒤 기록을 추가합니다.</p>`
    : `<p class="lead">2026년 7월 9일 한지붕은 법인으로 보는 단체 승인을 받고 고유번호 ${site.registrationNumber}을 발급받았습니다. 고유번호 발급은 단체의 세무상 식별과 운영을 위한 절차이며, 개별 사업의 품질이나 안전을 보증하는 표시는 아닙니다.</p><h2>등록정보</h2><dl class="definition-list"><div><dt>단체명</dt><dd>${site.name}</dd></div><div><dt>고유번호</dt><dd>${site.registrationNumber}</dd></div><div><dt>대표자</dt><dd>${site.representative}</dd></div><div><dt>소재지</dt><dd>${site.address}</dd></div><div><dt>수익사업</dt><dd>현재 없음</dd></div></dl><h2>등록한 고유사업</h2><ol><li>세대교류 봉사 프로그램</li><li>주거상생 실태조사</li><li>어르신 주택 개선 무료상담</li></ol><h2>세법상 분류와 등록 형태</h2><p>한지붕은 국세기본법상 법인으로 보는 단체로 승인받은 비영리단체입니다. 법인세법 제2조는 법인으로 보는 단체를 비영리내국법인에 포함합니다. 이는 민법상 법인 설립허가·등기와는 구분됩니다.</p><p>근거: <a href="https://www.law.go.kr/LSW/lsLinkCommonInfo.do?lsJoLnkSeq=1030550337" target="_blank" rel="noopener noreferrer">법인세법 제2조</a> · <a href="https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7744&amp;mi=2370" target="_blank" rel="noopener noreferrer">국세청 법인세 개요</a> (확인일 2026년 9월 24일). 등록 사실은 정부기관이 개별 프로그램을 추천하거나 보증한다는 의미가 아닙니다.</p><h2>문서 열람 안내</h2><p>등록문서 원본에는 공개에 적합하지 않은 정보가 포함될 수 있어 웹사이트에서 내려받기를 제공하지 않습니다. 단체 등록문서 열람이 필요한 기관은 <a href="${site.emailHref}">${site.email}</a>으로 문의해 주세요.</p>`;
  const schema = { "@context": "https://schema.org", "@type": "Article", headline: activity.title, description: activity.description, datePublished: activity.publishedAt, dateModified: activity.updatedAt, author: { "@type": "Organization", name: site.name }, publisher: { "@type": "Organization", name: site.name }, mainEntityOfPage: absolute(activity.href) };
  const body = `${pageHero({ eyebrow: activity.category, title: activity.title, description: activity.description, meta: `<div class="page-meta"><time datetime="${activity.publishedAt}">${activity.publishedLabel}</time><span>작성자 ${activity.author}</span><span>마지막 수정 <time datetime="${activity.updatedAt}">${activity.updatedAt.replaceAll("-", ".")}</time></span></div>` })}<section class="section"><div class="container content-layout"><article class="prose">${articleBody}</article><aside class="side-nav"><h2>함께 보기</h2><a href="/activities/">활동과 기록</a><a href="/transparency/">운영·투명성</a><a href="/about/">한지붕 소개</a></aside></div></section>`;
  return layout({ title: activity.title, description: activity.description, path: activity.href, body, type: "article", publishedAt: isoDate(activity.publishedAt), updatedAt: isoDate(activity.updatedAt), breadcrumbs: [{ label: "활동과 기록", href: "/activities/" }, { label: activity.title, href: activity.href }], jsonLd: schema });
}
for (const activity of activities) await emit(activity.href, activityPage(activity), { updatedAt: activity.updatedAt });

await emit("/transparency/", layout({ title: "운영·투명성", description: "한지붕의 등록정보, 고유사업, 비영리성과 회계·운영 원칙을 공개합니다.", path: "/transparency/", body: transparencyBody, breadcrumbs: [{ label: "운영·투명성", href: "/transparency/" }], jsonLd: organizationSchema }));

const participateBody = `${pageHero({ eyebrow: "참여하기", title: "어떤 참여를<br>생각하고 계신가요?", description: "공익자료를 먼저 살펴본 뒤 전화나 이메일로 필요한 참여방식을 문의해 주세요.", meta: updatedMeta("/participate/") })}<section class="section"><div class="container participation-grid"><article class="participation-card"><span class="program-number">개인·가족</span><h2>상담이 필요합니다</h2><p>유휴공간·빈방 활용 준비와 공간 정리·개선, 공동생활 기준이 궁금한 어르신과 가족에게 대표와 운영진이 직접 일반 정보를 안내합니다.</p><h3>확인하는 정보</h3><p>이름, 연락수단, 시·군·구 수준의 지역, 궁금한 내용만 확인합니다. 상세주소와 민감정보는 보내지 마세요.</p><h3>비용과 답변</h3><p>전화·이메일 기초상담은 무료입니다. 별도 예약비나 상담료가 없으며 현재 주택 방문상담은 제공하지 않습니다. 상담만으로 계약이나 유료서비스가 확정되지 않습니다.</p>${cardLink("/programs/senior-home-consulting/", "무료상담 내용 보기")}</article><article class="participation-card"><span class="program-number">개인 참여</span><h2>봉사 활동에 관심이 있습니다</h2><p>스마트폰·AI 활용 교육, 주거문화와 공동생활 안내, 유휴공간 정리·활용 관련 봉사와 세대교류에 관심 있는 분이 문의할 수 있습니다.</p><h3>먼저 알려주실 내용</h3><p>관심 분야와 참여 가능한 지역·일정을 전화나 이메일로 알려 주세요. 확정된 활동에 필요한 역할이 있을 때 참여 가능 여부를 안내합니다.</p><h3>비용과 참여 확정</h3><p>개인 봉사 참여에 가입비를 받지 않습니다. 문의만으로 역할 배정이나 참여가 확정되지는 않으며, 활동 내용과 일정을 확인한 뒤 참여를 결정합니다.</p>${cardLink("/programs/intergenerational-volunteer/", "프로그램 알아보기")}</article><article class="participation-card" id="partnership"><span class="program-number">기관 협력</span><h2>교육·봉사를 함께 기획하고 싶습니다</h2><p>복지관, 경로당, 주민센터, 대학, 학교와 비영리단체가 디지털·AI 교육과 세대교류·주거문화 안내를 제안할 수 있습니다. 실태조사는 진행 중이며 조사 협력을 문의할 수 있습니다.</p><h3>일정 확정 방식</h3><p>기관명, 담당자 연락수단, 대상, 목적, 희망 내용과 일정 범위를 알려 주세요. 상설 정기반이 아니라 기관과 내용·날짜·장소·역할을 사전에 합의하는 방식입니다.</p><h3>비용과 책임</h3><p>강사·공간·재료 등 필요한 비용 항목, 금액과 부담 주체를 진행 전에 이메일로 확인합니다. 정보관리와 결과 공개범위까지 합의한 뒤 진행하며, 합의하지 않은 비용을 청구하지 않습니다.</p>${cardLink("/partnership/", "기관 협력 문의하기")}</article></div><div class="container notice"><h2>개인정보 처리 원칙</h2><p>전화 또는 이메일로 필요한 최소정보만 알려 주세요. 주민등록번호, 신분증, 계좌번호, 상세주소, 건강정보와 가족의 개인정보는 보내지 마세요.</p></div></section>`;
await emit("/participate/", layout({ title: "참여하기", description: "어르신·가족 무료상담, 세대교류 봉사, 기관 프로그램과 조사 협력 방법을 안내합니다.", path: "/participate/", body: participateBody, breadcrumbs: [{ label: "참여하기", href: "/participate/" }] }));


await emit("/contact/", layout({ title: "문의", description: `한지붕 전화 ${site.phone}, 이메일 ${site.email}과 문의 시 필요한 최소정보를 안내합니다.`, path: "/contact/", body: contactBody, breadcrumbs: [{ label: "문의", href: "/contact/" }] }));

await emit("/privacy/", layout({ title: "개인정보 처리방침", description: "한지붕 웹사이트와 전화·이메일 문의 과정의 개인정보 처리항목, 목적과 이용자 권리를 안내합니다.", path: "/privacy/", body: privacyBody, breadcrumbs: [{ label: "개인정보 처리방침", href: "/privacy/" }] }));

const termsBody = `${pageHero({ eyebrow: "사이트 및 프로그램 이용안내", title: "한지붕 정보의 범위와<br>이용 원칙을 안내합니다.", description: "공익자료와 상담을 이용하기 전에 서비스의 성격, 책임범위와 금지행위를 확인해 주세요.", meta: updatedMeta("/terms/") })}<section class="section"><div class="container content-layout"><article class="prose"><h2>1. 사이트의 목적</h2><p>한지붕 웹사이트는 어르신 유휴공간·빈방 활용 무료상담, 기관 협의형 교육·봉사와 자체 공익자료를 안내합니다. 주거상생 실태조사는 진행 중이며, 조사 결과와 공익 보고서는 검토를 거쳐 공개할 예정입니다.</p><h2>2. 공익자료의 범위</h2><p>사이트의 자료는 생활 전 확인할 일반 정보와 대화 도구입니다. 개별 주택에 대한 건축·전기·가스·소방 진단, 부동산 중개, 계약대행, 법률·세무 자문을 대신하지 않습니다.</p><h2>3. 무료상담</h2><p>기초상담은 무료이며 상담 신청만으로 공간 제공, 입주, 계약 또는 유료서비스 이용이 확정되지 않습니다. 이용자는 상담 후에도 진행하지 않거나 참여를 중단할 수 있습니다.</p><h2>4. 정확한 정보 제공</h2><p>문의자는 다른 사람의 개인정보를 권한 없이 제공하지 않아야 하며, 상담과 참여에 필요한 범위에서 사실에 맞는 정보를 알려야 합니다. 초기 문의에 주민등록번호, 신분증, 계좌번호와 상세주소를 보내지 마세요.</p><h2>5. 지식재산과 인용</h2><p>한지붕이 작성한 자료는 출처와 제목, 주소를 표시하여 비영리 교육 목적으로 인용할 수 있습니다. 문맥을 왜곡하거나 상업적 상품의 보증자료로 사용하는 것은 허용하지 않습니다.</p><h2>6. 외부기관 확인</h2><p>거주 형태, 계약, 전입신고, 세금과 법적 권리·의무는 개별 상황에 따라 달라질 수 있으므로 주민센터, 법률·세무 전문가 또는 관계기관에 별도로 확인해야 합니다.</p><h2>7. 이용 제한</h2><p>타인의 개인정보 침해, 허위정보 제출, 사기·폭력·차별·영업 목적 이용, 사이트의 정상적인 운영을 방해하는 행위는 제한될 수 있습니다.</p><h2>8. 문의</h2><p>이용안내와 프로그램 범위에 관한 문의는 전화 <a href="${site.phoneHref}">${site.phone}</a> 또는 이메일 <a href="${site.emailHref}">${site.email}</a>로 보내 주세요.</p></article><aside class="side-nav"><h2>관련 안내</h2><a href="/privacy/">개인정보 처리방침</a><a href="/programs/">공익사업</a><a href="/contact/">문의</a></aside></div></section>`;
await emit("/terms/", layout({ title: "사이트 및 프로그램 이용안내", description: "한지붕 공익자료와 무료상담의 성격, 책임범위, 개인정보와 이용 원칙을 안내합니다.", path: "/terms/", body: termsBody, breadcrumbs: [{ label: "이용안내", href: "/terms/" }] }));

const notFoundBody = `<section class="status-page"><div class="container narrow"><p class="eyebrow">요청한 페이지를 찾을 수 없습니다</p><h1>404</h1><p>한지붕 사이트는 주거상생 공익사업 중심으로 개편되었습니다. 주소를 다시 확인하거나 아래 메뉴에서 필요한 정보를 찾아 주세요.</p><div class="hero-actions"><a class="button" href="/">홈으로 가기</a><a class="button button-secondary" href="/resources/">주거상생 자료 보기</a><a class="button button-text" href="/contact/">문의</a></div></div></section>`;
const notFoundHtml = layout({ title: "페이지를 찾을 수 없습니다", description: "요청한 페이지를 찾을 수 없습니다.", path: "/404/", robots: "noindex,nofollow", body: notFoundBody });
await emit("/404/", notFoundHtml, { indexable: false });
await emit("/404.html", notFoundHtml, { indexable: false });

const sitemapEntries = generated.filter((page) => page.indexable && page.route !== "/404.html");
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapEntries.map((page) => `  <url><loc>${absolute(page.route)}</loc><lastmod>${page.updatedAt}</lastmod></url>`).join("\n")}\n</urlset>\n`;
await writeFile(path.join(out, "sitemap.xml"), sitemap, "utf8");
await writeFile(path.join(out, "robots.txt"), `User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /admin/\nDisallow: /src/\nDisallow: /scripts/\nDisallow: /tests/\nDisallow: /README.md\nDisallow: /AD_GRANTS_READINESS.md\nDisallow: /CONTENT_SOURCES.md\nDisallow: /CONTENT_GAPS.md\nDisallow: /DEPLOYMENT.md\nDisallow: /POST_DEPLOY_CHECKLIST.md\nSitemap: ${site.url}/sitemap.xml\n`, "utf8");
await writeFile(path.join(out, "site.webmanifest"), JSON.stringify({ name: "비영리단체 한지붕", short_name: site.name, start_url: "/", display: "standalone", background_color: "#faf9f5", theme_color: "#8f2929", icons: [{ src: "/assets/favicon.svg", sizes: "any", type: "image/svg+xml" }] }, null, 2), "utf8");
await writeFile(path.join(out, "CNAME"), "hanjibung.kr\n", "utf8");
await writeFile(path.join(out, ".nojekyll"), "", "utf8");
await mkdir(path.join(out, "assets"), { recursive: true });
await cp(path.join(root, "src", "assets", "site.css"), path.join(out, "assets", "site.css"));
await cp(path.join(root, "src", "assets", "site.js"), path.join(out, "assets", "site.js"));
await cp(path.join(root, "src", "assets", "inquiry.js"), path.join(out, "assets", "inquiry.js"));
await cp(path.join(root, "src", "assets", "living-lab.mjs"), path.join(out, "assets", "living-lab.mjs"));
await cp(path.join(root, "src", "assets", "favicon.svg"), path.join(out, "assets", "favicon.svg"));
await mkdir(path.join(out, "assets", "activities"), { recursive: true });
await mkdir(path.join(out, "assets", "guides"), { recursive: true });
await mkdir(path.join(out, "assets", "field-guides"), { recursive: true });
for (const item of fieldStories.filter(item => item.illustration)) {
  for (const suffix of [".jpg", "-640.webp", "-1200.webp"]) await cp(path.join(root, "src", "assets", "field-guides", item.illustration.image + suffix), path.join(out, "assets", "field-guides", item.illustration.image + suffix));
}
for (const article of editorialGuides) {
  for (const suffix of [".jpg", "-640.webp", "-1200.webp"]) await cp(path.join(root, "src", "assets", "guides", article.image + suffix), path.join(out, "assets", "guides", article.image + suffix));
}
for (const activity of activities.filter((item) => item.image)) {
  await cp(path.join(root, "src", "assets", "activities", activity.image), path.join(out, "assets", "activities", activity.image));
  for (const variant of photoVariants({...activity, file: activity.image})) await cp(path.join(root, "src", "assets", "activities", variant.file), path.join(out, "assets", "activities", variant.file));
}
for (const photo of [...digitalLearning.photos, ...consultationPhotos]) {
  await cp(path.join(root, "src", "assets", "activities", photo.file), path.join(out, "assets", "activities", photo.file));
  if (photo.responsive) await cp(path.join(root, "src", "assets", "activities", photo.responsive.file), path.join(out, "assets", "activities", photo.responsive.file));
  for (const variant of photoVariants(photo)) await cp(path.join(root, "src", "assets", "activities", variant.file), path.join(out, "assets", "activities", variant.file));
}

const ogSource = path.join(root, "src", "assets", "og-default.png");
try {
  await cp(ogSource, path.join(out, "assets", "og-default.png"));
} catch {
  throw new Error("src/assets/og-default.png 파일이 필요합니다. npm run build 전에 OG 이미지를 생성해 주세요.");
}

await writeFile(path.join(out, "build-manifest.json"), JSON.stringify({ generatedAt: new Date().toISOString(), pages: generated.map(({ route, indexable, updatedAt }) => ({ route, indexable, updatedAt })) }, null, 2), "utf8");
console.log(`Built ${generated.length} HTML files and ${sitemapEntries.length} indexable routes.`);
