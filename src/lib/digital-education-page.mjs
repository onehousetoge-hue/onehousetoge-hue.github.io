import { digitalLearning } from "../content/field-records.mjs";
import { site } from "../config/site.mjs";
import { absolute, escapeHtml, icon, layout, pageHero } from "./template.mjs";

export function digitalEducationPage(activity) {
  const photos = digitalLearning.photos.slice(0, 2);
  const body = `${pageHero({
    eyebrow: "한지붕 구성원의 교육 경험 · 세대교류",
    title: "같은 화면을 보며,<br>함께 배우는 디지털 생활",
    description: activity.description,
    meta: `<div class="page-meta"><span>서울 노원구</span><span>게시일 <time datetime="${activity.publishedAt}">${activity.publishedLabel}</time></span></div>`,
  })}
  <section class="section field-story"><div class="container">
    <div class="field-context"><h2>일상에서 다시 사용할 수 있도록</h2><p>한지붕 구성원들은 노원구 지역을 중심으로 시니어 대상 디지털·AI 활용 교육에 참여해 왔습니다. 교육 내용 기획과 현장 진행·보조를 맡아, 어르신이 스마트폰과 디지털 서비스를 보다 편하게 이용할 수 있도록 안내했습니다.</p><p>참가자의 사용 수준에 맞춰 직접 스마트폰을 조작하는 실습으로 진행했습니다. 반복해서 사용해 보고 개별 질문에 답하는 데 중점을 두었습니다.</p></div>
    <div class="field-photo-pair field-photo-pair-education">${photos.map((photo) => `<figure><img src="/assets/activities/${photo.file}" width="${photo.width}" height="${photo.height}" alt="${escapeHtml(photo.alt)}" loading="lazy" decoding="async"><figcaption>${photo.caption}</figcaption></figure>`).join("")}</div>
    <div class="content-layout section"><article class="prose">
      <h2>현장에서 함께한 내용</h2><ol><li><strong>스마트폰과 디지털 서비스의 기초</strong><br>일상생활에 필요한 기본적인 스마트폰 활용 방법과 디지털 서비스 이용법을 안내했습니다.</li><li><strong>수준에 맞춘 반복 실습</strong><br>참가자가 직접 화면을 조작하고 익숙하지 않은 과정을 반복해 보도록 도왔습니다.</li><li><strong>개별 질문에 함께 답하기</strong><br>각자가 사용 중에 겪은 어려움을 듣고 같은 화면을 확인하며 안내했습니다.</li></ol><h2>구성원들이 참여해 온 교육</h2><p>운영진이 확인한 참여 이력에는 노원구 시니어 디지털 교육, 공릉종합사회복지관 AI 교육, 공릉 지역 노인복지기관 대상 디지털 교육 활동이 있습니다. 교육별로 내용 기획과 현장 진행·보조 역할을 맡았습니다.</p>
      <h2>활동 기록</h2><dl class="definition-list"><div><dt>활동 지역</dt><dd>서울 노원구 중심</dd></div><div><dt>구성원의 역할</dt><dd>교육 내용 기획, 현장 진행·보조</dd></div><div><dt>함께한 사람들</dt><dd>시니어와 청년</dd></div><div><dt>활동 유형</dt><dd>휴대전화 활용을 돕는 디지털 교육·세대교류</dd></div><div><dt>기록·사진 제공</dt><dd>${activity.author}</dd></div></dl>
      <p>운영진이 확인한 교육 경험과 공개 동의를 받은 현장 사진을 바탕으로 정리했습니다. 개별 사진의 촬영일·기관은 특정하지 않았으며, 게시일은 실제 활동일을 뜻하지 않습니다. 참여 인원이나 교육 효과를 집계한 성과보고서는 아닙니다.</p>
      <h2>다음 활동을 함께 제안해 주세요</h2><p>시니어와 청년이 함께하는 교육·봉사 프로그램에 관심 있는 기관은 대상과 희망 주제를 전화·이메일로 알려 주세요. 디지털·AI 교육은 기관의 요청에 따라 협의할 수 있으며 상설 정규반은 아닙니다. 활동의 내용·일정·역할과 비용이 필요한 항목을 사전에 협의합니다.</p>
    </article><aside class="side-nav"><h2>함께 보기</h2><a href="/programs/intergenerational-volunteer/">세대교류 봉사 프로그램</a><a href="/activities/field-records/">전체 현장 사진</a><a href="/contact/">전화·이메일 문의</a></aside></div>
    <div class="contact-strip"><div><h2>세대교류를 함께할 기관을 만납니다.</h2><p>대상과 희망 활동부터 이야기해 주세요.</p></div><div class="contact-actions"><a class="button" href="/contact/">참여·협력 문의${icon("arrow")}</a><a class="button button-secondary" href="/activities/">활동과 기록 전체 보기</a></div></div>
  </div></section>`;
  return layout({
    title: activity.title, description: activity.description, path: activity.href, body, type: "article",
    publishedAt: `${activity.publishedAt}T00:00:00+09:00`, updatedAt: `${activity.updatedAt}T00:00:00+09:00`,
    breadcrumbs: [{ label: "활동과 기록", href: "/activities/" }, { label: "노원구 디지털 교육", href: activity.href }],
    jsonLd: { "@context": "https://schema.org", "@type": "NewsArticle", headline: activity.title, description: activity.description, datePublished: activity.publishedAt, dateModified: activity.updatedAt, ...(activity.eventDate ? { temporalCoverage: activity.eventDate } : {}), author: { "@type": "Organization", name: site.name }, publisher: { "@type": "Organization", name: site.name }, mainEntityOfPage: absolute(activity.href), image: photos.map((photo) => absolute(`/assets/activities/${photo.file}`)) },
  });
}
