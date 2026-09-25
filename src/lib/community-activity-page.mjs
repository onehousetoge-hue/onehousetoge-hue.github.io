import { absolute, escapeHtml, layout, pageHero } from "./template.mjs";
import { photoImage } from "./photo.mjs";
import { serviceScope } from "./service-scope.mjs";

export function communityActivityPage(activity) {
  const e = escapeHtml;
  const body = `${pageHero({ eyebrow: activity.category, title: e(activity.title), description: e(activity.description), meta: `<div class="page-meta"><span>활동일 <time datetime="${activity.eventDate}">${activity.eventLabel}</time></span><span>게시일 ${activity.publishedLabel}</span><span>작성 ${activity.author}</span></div>` })}
  <section class="section"><div class="container content-layout"><article class="prose">
    ${serviceScope()}
    <h2>현장에서 함께한 이야기</h2>
    ${activity.paragraphs.map((paragraph) => `<p>${e(paragraph)}</p>`).join("")}
    ${activity.image ? `<figure class="community-activity-photo">${photoImage({...activity, file: activity.image, alt: activity.caption})}<figcaption>${e(activity.caption)}${activity.photoContext ? `<p class="photo-context-caption">${e(activity.photoContext)}</p>` : ""}</figcaption></figure>` : ""}
    <h2>다음 이야기를 함께 나눠주세요</h2><p>빈방 활용과 공동생활 준비에 관해 궁금한 점을 알려주세요. 전화·이메일로 질문과 준비사항을 함께 정리합니다.</p>
    <div class="hero-actions"><a class="button" href="/consultation/">무료상담 문의하기</a><a class="button button-secondary" href="/partnership/">기관협력 문의하기</a></div>
  </article><aside class="side-nav"><h2>함께 보기</h2><a href="/activities/">현장 이야기 전체 보기</a><a href="/programs/senior-home-consulting/">상담 가능한 내용</a><a href="/resources/">공동생활 준비자료</a></aside></div></section>`;
  return layout({ title: activity.title, description: activity.description, path: activity.href, body, type: "article", publishedAt: `${activity.publishedAt}T00:00:00+09:00`, updatedAt: `${activity.updatedAt}T00:00:00+09:00`, breadcrumbs: [{ label: "현장 이야기", href: "/activities/" }, { label: activity.title, href: activity.href }], jsonLd: { "@context": "https://schema.org", "@type": "Article", headline: activity.title, datePublished: activity.publishedAt, dateModified: activity.updatedAt, temporalCoverage: activity.eventDate, author: { "@type": "Organization", name: "한지붕" }, ...(activity.image ? { image: absolute(`/assets/activities/${activity.image}`) } : {}), mainEntityOfPage: absolute(activity.href) } });
}
