import { digitalLearning as record } from "../content/field-records.mjs";
import { absolute, escapeHtml, icon, layout, pageHero } from "./template.mjs";

const photo = (item, eager = false) => `<img src="/assets/activities/${item.file}" width="${item.width}" height="${item.height}" alt="${escapeHtml(item.alt)}" loading="${eager ? "eager" : "lazy"}" decoding="async">`;
const figure = (item) => `<figure>${photo(item)}<figcaption>${item.caption}</figcaption></figure>`;

export function fieldRecordFeature() {
  return `<section class="section field-feature-section"><div class="container field-feature"><figure class="field-feature-photo">${photo(record.photos[0])}<figcaption>노원구 시니어 디지털 교육 · 한지붕 제공</figcaption></figure><div class="field-feature-copy"><p class="eyebrow">사진으로 만나는 활동과 사람들</p><h2>시니어가 있는 현장에서,<br>지역사회와 함께합니다.</h2><p>같은 화면을 보며 배우는 시간부터<br>주민과 마주 앉아 이야기를 나누는 자리까지.<br>한지붕 활동과 구성원들이 함께한 현장 경험을 전합니다.</p><ul class="field-tags"><li>디지털 교육</li><li>지역사회 교류</li><li>주거모델 논의</li></ul><a class="button" href="${record.href}">현장 사진과 이야기 보기${icon("arrow")}</a></div></div></section>`;
}

export function fieldRecordPage() {
  const body = `${pageHero({
    eyebrow: "활동과 사람들 · 현장 사진 기록",
    title: "시니어가 있는 현장에서,<br>지역사회와 함께합니다.",
    description: record.description,
    meta: `<div class="page-meta"><span>사진 제공 한지붕 운영진</span><span>게시일 <time datetime="${record.publishedAt}">2026년 9월 23일</time></span></div>`,
  })}
  <section class="section field-story"><div class="container">
    <div class="field-context"><h2>함께한 사람들의 현장 기록</h2><p>한지붕의 교육 활동과, 같은 구성원이 별도 프로젝트에 참여하며 쌓은 현장 경험을 함께 소개합니다. 사진 속 안내물은 당시의 활동 맥락을 보여줍니다.</p></div>
    <nav class="field-toc" aria-label="현장 사진 목차"><a href="#digital-education">01 디지털 교육</a><a href="#community-exchange">02 지역사회 교류</a><a href="#housing-dialogue">03 주거모델 논의</a></nav>
    <section class="field-chapter" id="digital-education" aria-labelledby="digital-title"><div class="field-chapter-heading"><div><p class="eyebrow">01 · 한지붕 활동</p><h2 id="digital-title">같은 화면을 보며,<br>함께 배우는 디지털 생활</h2></div><p>노원구 시니어 디지털 교육 현장입니다. 어르신이 직접 휴대전화를 사용하고, 청년이 옆에서 화면을 짚으며 사용 방법을 함께 살펴봅니다.</p></div><div class="field-photo-pair field-photo-pair-education">${figure(record.photos[0])}${figure(record.photos[1])}</div><p class="field-chapter-link"><a class="text-link" href="/programs/intergenerational-volunteer/">세대교류 봉사 프로그램 알아보기${icon("arrow")}</a></p></section>
    <section class="field-chapter" id="community-exchange" aria-labelledby="community-title"><div class="field-chapter-heading"><div><p class="eyebrow">02 · 구성원의 관련 현장 경험</p><h2 id="community-title">지역행사에서 나눈<br>주거와 생활 이야기</h2></div><p>공릉1동 지역행사에서 주민을 만난 사진입니다. 같은 구성원들이 안내 부스에서 자료를 펼치고 주민과 대화하는 모습을 담았습니다.</p></div><div class="field-photo-pair">${figure(record.photos[2])}${figure(record.photos[3])}</div><p class="field-caption-note">사진에 보이는 기관 로고는 당시 현장 안내물입니다. 로고의 노출이 해당 기관과 한지붕의 공식 협약·후원 관계를 뜻하지는 않습니다.</p></section>
    <section class="field-chapter" id="housing-dialogue" aria-labelledby="housing-title"><div class="field-chapter-heading"><div><p class="eyebrow">03 · 구성원의 관련 현장 경험</p><h2 id="housing-title">지역의 삶을 듣고,<br>주거모델을 이야기합니다.</h2></div><p>운영진이 제공한 지역형 주거모델 기획 자료에 담긴 주민 만남입니다. 지역 주민과 테이블에 둘러앉은 현장의 모습을 전합니다.</p></div><div class="field-photo-single">${figure(record.photos[4])}</div></section>
    <aside class="field-record-note" aria-labelledby="photo-record-info"><h2 id="photo-record-info">사진 기록 안내</h2><p>운영자가 제공하고 공개 동의를 확인한 사진입니다. 게시일은 이 기록을 홈페이지에 정리한 날짜로, 실제 활동일을 뜻하지 않습니다. 별도 집계가 없는 참여 인원이나 교육 효과는 기재하지 않았습니다.</p></aside>
    <div class="contact-strip"><div><h2>함께할 활동이 궁금하신가요?</h2><p>개인 봉사와 기관 프로그램은 참여 방법부터 문의해 주세요.</p></div><div class="contact-actions"><a class="button" href="/contact/">참여·협력 문의</a><a class="button button-secondary" href="/activities/">활동과 기록 전체 보기</a></div></div>
  </div></section>`;
  return layout({ title: record.title, description: record.description, path: record.href, body,
    breadcrumbs: [{ label: "활동과 기록", href: "/activities/" }, { label: "함께한 현장", href: record.href }],
    jsonLd: { "@context": "https://schema.org", "@type": "CollectionPage", name: record.title, description: record.description, url: absolute(record.href), datePublished: record.publishedAt, image: record.photos.map((item) => absolute(`/assets/activities/${item.file}`)) },
  });
}
