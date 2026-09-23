import { digitalLearning } from "../content/field-records.mjs";
import { site } from "../config/site.mjs";
import { absolute, escapeHtml, icon, layout, pageHero } from "./template.mjs";

export function digitalEducationPage(activity) {
  const photos = digitalLearning.photos.slice(0, 2);
  const body = `${pageHero({
    eyebrow: "한지붕 활동 · 세대교류",
    title: "같은 화면을 보며,<br>함께 배우는 디지털 생활",
    description: activity.description,
    meta: `<div class="page-meta"><span>활동일 <time datetime="${activity.eventDate}">${activity.eventLabel}</time></span><span>서울 노원구</span><span>게시일 <time datetime="${activity.publishedAt}">${activity.publishedLabel}</time></span></div>`,
  })}
  <section class="section field-story"><div class="container">
    <div class="field-context"><h2>휴대전화를 사이에 두고 만난 두 세대</h2><p>2026년 8월 12일 한지붕은 서울 노원구에서 시니어 디지털 교육을 진행했습니다. 어르신이 직접 휴대전화를 사용하고, 청년이 곁에서 같은 화면을 보며 사용 방법을 함께 살폈습니다.</p><p>디지털 기기를 매개로 서로 만나고 대화하는 세대교류 활동입니다. 익숙하지 않은 화면을 혼자 살피기보다, 옆에 앉은 사람과 함께 확인하는 시간을 담았습니다.</p></div>
    <div class="field-photo-pair field-photo-pair-education">${photos.map((photo) => `<figure><img src="/assets/activities/${photo.file}" width="${photo.width}" height="${photo.height}" alt="${escapeHtml(photo.alt)}" loading="lazy" decoding="async"><figcaption>${photo.caption}</figcaption></figure>`).join("")}</div>
    <div class="content-layout section"><article class="prose">
      <h2>현장에서 함께한 내용</h2><ol><li><strong>마주 앉아 화면 살펴보기</strong><br>테이블에 함께 앉아 어르신이 사용하는 휴대전화 화면을 확인했습니다.</li><li><strong>직접 눌러보며 사용하기</strong><br>어르신이 직접 화면을 조작하고, 옆에 앉은 청년이 화면을 짚으며 안내했습니다.</li><li><strong>곁에서 대화하며 확인하기</strong><br>같은 화면을 보며 사용 방법을 함께 살피는 방식으로 교육을 진행했습니다.</li></ol>
      <h2>활동 기록</h2><dl class="definition-list"><div><dt>활동일</dt><dd><time datetime="${activity.eventDate}">${activity.eventLabel}</time></dd></div><div><dt>장소</dt><dd>서울 노원구</dd></div><div><dt>함께한 사람들</dt><dd>시니어와 청년</dd></div><div><dt>활동 유형</dt><dd>휴대전화 활용을 돕는 디지털 교육·세대교류</dd></div><div><dt>기록·사진 제공</dt><dd>${activity.author}</dd></div></dl>
      <p>운영진이 확인한 활동일과 공개 동의를 받은 현장 사진을 바탕으로 정리했습니다. 참여 인원이나 교육 효과를 별도로 집계한 성과보고서는 아닙니다.</p>
      <h2>다음 활동을 함께 제안해 주세요</h2><p>시니어와 청년이 함께하는 교육·봉사 프로그램에 관심 있는 기관은 대상과 희망 주제를 전화·이메일로 알려 주세요. 활동의 내용·일정·역할과 비용이 필요한 항목을 사전에 협의합니다.</p>
    </article><aside class="side-nav"><h2>함께 보기</h2><a href="/programs/intergenerational-volunteer/">세대교류 봉사 프로그램</a><a href="/activities/field-records/">전체 현장 사진</a><a href="/contact/">전화·이메일 문의</a></aside></div>
    <div class="contact-strip"><div><h2>세대교류를 함께할 기관을 만납니다.</h2><p>대상과 희망 활동부터 이야기해 주세요.</p></div><div class="contact-actions"><a class="button" href="/contact/">참여·협력 문의${icon("arrow")}</a><a class="button button-secondary" href="/activities/">활동과 기록 전체 보기</a></div></div>
  </div></section>`;
  return layout({
    title: activity.title, description: activity.description, path: activity.href, body, type: "article",
    publishedAt: `${activity.publishedAt}T00:00:00+09:00`, updatedAt: `${activity.updatedAt}T00:00:00+09:00`,
    breadcrumbs: [{ label: "활동과 기록", href: "/activities/" }, { label: "노원구 디지털 교육", href: activity.href }],
    jsonLd: { "@context": "https://schema.org", "@type": "NewsArticle", headline: activity.title, description: activity.description, datePublished: activity.publishedAt, dateModified: activity.updatedAt, temporalCoverage: activity.eventDate, author: { "@type": "Organization", name: site.name }, publisher: { "@type": "Organization", name: site.name }, mainEntityOfPage: absolute(activity.href), image: photos.map((photo) => absolute(`/assets/activities/${photo.file}`)) },
  });
}
