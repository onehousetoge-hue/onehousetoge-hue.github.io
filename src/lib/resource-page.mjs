import { programs, site } from "../config/site.mjs";
import { getResource, officialSources } from "../content/resources.mjs";
import { absolute, escapeHtml, icon, layout, pageHero } from "./template.mjs";

export function resourcePage(resource) {
  const related = resource.related.map(getResource).filter(Boolean);
  const program = programs.find((item) => item.slug === resource.program);
  const sources = resource.sources.map((key) => officialSources[key]);
  const schema = { "@context": "https://schema.org", "@type": "Article", headline: resource.title, description: resource.description, datePublished: resource.publishedAt, dateModified: resource.updatedAt, author: { "@type": "Organization", name: site.name }, publisher: { "@type": "Organization", name: site.name, url: site.url }, mainEntityOfPage: absolute(resource.href) };
  const meta = `<div class="page-meta"><span>${resource.category}</span><span>${resource.readTime}</span><span>작성 ${resource.author}</span></div>`;
  const body = `${pageHero({ eyebrow: "읽고, 적고, 함께 이야기하는 자료", title: resource.title, description: resource.description, meta })}
    <section class="section"><div class="container content-layout"><article class="prose">
      <div class="article-toolbar"><div><time datetime="${resource.publishedAt}">최초 게시 ${resource.publishedLabel}</time><br><time datetime="${resource.updatedAt}">마지막 수정 ${resource.updatedLabel}</time></div><button class="print-button" type="button" data-print>${icon("print")}자료·작성내용 인쇄</button></div>
      <div class="resource-summary"><h2>이 자료로 할 수 있는 일</h2><p>${escapeHtml(resource.outcome)}</p></div>
      <nav id="resource-contents" class="resource-toc" aria-label="이 자료의 목차"><h2>목차</h2><ol>${resource.sections.map((section) => `<li><a href="#${section.id}">${escapeHtml(section.title.replace(/^\d+\.\s*/, ""))}</a></li>`).join("")}<li><a href="#sources">자료의 성격과 공식 안내</a></li></ol></nav>
      <p id="worksheet-privacy" class="worksheet-privacy">메모와 체크는 이 화면에서만 사용합니다. 한지붕 서버로 전송하거나 자동 저장하지 않습니다. 필요한 내용은 인쇄해 보관하고, 공용 기기를 떠나기 전에는 입력 내용을 지워 주세요. 개인정보는 적지 마세요.</p>
      ${resource.content}
      <section class="reader-actions" aria-label="자료 읽기 도구"><div class="reader-buttons"><button class="print-button" type="button" data-print>${icon("print")}자료·작성내용 인쇄</button><a class="text-link" href="#resource-contents">목차로 돌아가기</a></div><details data-clear-section hidden><summary>작성내용 지우기</summary><p>이 화면의 메모와 체크를 모두 지웁니다. 지운 내용은 되돌릴 수 없으니 필요한 내용은 먼저 인쇄해 주세요.</p><button class="print-button" type="button" data-clear-worksheet>메모와 체크 모두 지우기</button></details><p class="field-hint" role="status" data-clear-status></p></section>
      <section class="source-panel" aria-labelledby="sources"><h2 id="sources">자료의 성격과 공식 안내</h2><p>${resource.reviewNote}</p><p>질문지·대화 예문·도식은 생활 대화를 돕기 위해 자체 작성했습니다. 실제 활동 실적이나 조사 결과를 나타내지 않습니다. 개별 계약·법률·세무 판단을 대신하지 않습니다.</p>${sources.length ? `<ul>${sources.map((source) => `<li><a href="${escapeHtml(source.url)}" rel="external">${escapeHtml(source.title)}</a><p>${escapeHtml(source.description)}</p><span class="source-date">공식 안내 확인일 ${source.checkedAt}</span></li>`).join("")}</ul><p>기관별 이용 대상·운영시간·비용은 해당 공식 안내에서 확인해 주세요.</p>` : "<p>이 자료는 특정 제도나 지원 자격을 안내하지 않는 자체 생활 워크시트입니다.</p>"}</section>
      <section class="related-section"><h2>다음으로 함께 읽기</h2><div class="related-grid">${related.map((item) => `<a class="related-link" href="${item.href}"><span class="resource-meta">${item.category}</span>${item.title}</a>`).join("")}</div></section>
    </article><aside class="side-nav"><h2>관련 사업과 문의</h2><a href="${program.href}">${program.title}</a><a href="/resources/">자료 전체 보기</a><a href="/contact/">전화·이메일 문의</a><p>화면에서 메모를 작성해도 상담이 접수되지는 않습니다.</p></aside></div></section>`;
  return layout({ title: resource.title, description: resource.description, path: resource.href, body, type: "article", publishedAt: `${resource.publishedAt}T00:00:00+09:00`, updatedAt: `${resource.updatedAt}T00:00:00+09:00`, breadcrumbs: [{ label: "주거상생 자료", href: "/resources/" }, { label: resource.title, href: resource.href }], jsonLd: schema, bodyClass: "article-page" });
}
