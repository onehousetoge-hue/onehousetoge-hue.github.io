import { digitalLearning as record } from "../content/field-records.mjs";
import { consultationPhotos } from "../content/consultation-photos.mjs";
import { absolute, icon, layout, pageHero } from "./template.mjs";
import { photoFigure, photoImage } from "./photo.mjs";

export function fieldRecordFeature() {
  return '<section class="section field-feature-section"><div class="container"><div class="section-header"><div><p class="eyebrow">사진으로 만나는 현장</p><h2>이야기를 듣고,<br>함께 살펴보는 현장</h2></div><p>어르신과 대화를 나누는 상담 현장과 디지털 활용을 안내해 온 경험을 사진으로 소개합니다.</p></div><div class="story-preview-grid"><article class="story-preview"><div class="story-preview-image">' + photoImage(consultationPhotos[1]) + '</div><div class="story-preview-copy"><p class="eyebrow">어르신 상담 현장</p><h3>어르신과 나눈 상담 이야기</h3><p>길을 함께 걸으며 나눈 대화와 상담 부스에서 마주한 순간을 전합니다.</p><a class="text-link" href="' + record.href + '">상담 현장 사진 보기' + icon("arrow") + '</a></div></article><article class="story-preview"><div class="story-preview-image">' + photoImage(record.photos[0]) + '</div><div class="story-preview-copy"><p class="eyebrow">디지털·세대교류</p><h3>일상에 가까운 디지털 활용 안내</h3><p>직접 해보고, 다시 해보는 시간. 구성원들이 참여해 온 교육 경험을 소개합니다.</p><a class="text-link" href="/activities/senior-digital-education/">디지털 교육 경험 보기' + icon("arrow") + '</a></div></article></div><p class="section-action"><a class="text-link" href="/activities/">활동과 기록 모두 보기' + icon("arrow") + '</a></p></div></section>';
}

export function fieldRecordPage() {
  const body = pageHero({
    eyebrow: "활동과 기록 · 상담 현장",
    title: "어르신과 이야기를 나누는<br>상담 현장",
    description: record.description,
    meta: '<div class="page-meta"><span>사진 제공 한지붕 운영진</span><span>게시일 <time datetime="' + record.publishedAt + '">2026년 9월 23일</time></span></div>',
  }) + '<section class="section field-story"><div class="container">' +
    '<div class="field-context"><h2>함께 걸으며, 마주 앉으며</h2><p>한지붕이 소개하는 어르신 상담 현장 사진입니다. 길을 함께 걸으며 대화를 나누는 모습과 상담 부스에서 이야기를 듣는 장면을 담았습니다.</p></div>' +
    '<nav class="field-toc" aria-label="현장 사진 목차"><a href="#consultation-walk">01 함께 나눈 상담</a><a href="#consultation-booth">02 상담 부스</a><a href="#digital-education">03 디지털 활용</a><a href="#community-exchange">04 기존 현장 기록</a></nav>' +
    '<section class="field-chapter" id="consultation-walk"><div class="field-chapter-heading"><div><p class="eyebrow">01 · 어르신 상담</p><h2>함께 걸으며<br>나누는 이야기</h2></div><p>어르신과 함께 걸으며 대화를 나누는 모습입니다. 상담 현장의 한 장면을 사진으로 소개합니다.</p></div><div class="field-photo-pair">' + photoFigure(consultationPhotos[0]) + photoFigure(consultationPhotos[1]) + '</div></section>' +
    '<section class="field-chapter" id="consultation-booth"><div class="field-chapter-heading"><div><p class="eyebrow">02 · 상담 부스</p><h2>마주하며 듣는<br>어르신의 이야기</h2></div><p>상담 부스에서 어르신과 이야기를 나누는 모습입니다. 현재 이용할 수 있는 상담 내용과 방법은 무료상담 안내에서 확인하실 수 있습니다.</p></div><div class="field-photo-single">' + photoFigure(consultationPhotos[2]) + '</div><p class="field-caption-note">사진 속 배너 문구는 촬영 당시 현장 안내입니다. 한지붕의 현재 무료상담은 임대수익을 보장하거나 입주를 알선하는 서비스가 아닙니다.</p></section>' +
    '<section class="field-chapter" id="digital-education"><div class="field-chapter-heading"><div><p class="eyebrow">03 · 디지털 활용</p><h2>직접 확인하고,<br>다시 해보는 시간</h2></div><p>어르신이 스마트폰 화면을 직접 확인하는 모습과 구성원들이 함께한 디지털 교육 경험을 소개합니다. 개인 대화와 세부 정보는 공개용 사진에서 가렸습니다.</p></div><div class="field-photo-single">' + photoFigure(consultationPhotos[3]) + '</div><div class="field-photo-pair field-photo-pair-education">' + photoFigure(record.photos[0]) + photoFigure(record.photos[1]) + '</div><p class="field-chapter-link"><a class="text-link" href="/activities/senior-digital-education/">디지털 교육 경험 읽기' + icon("arrow") + '</a></p></section>' +
    '<section class="field-chapter" id="community-exchange"><div class="field-chapter-heading"><div><p class="eyebrow">04 · 구성원의 관련 현장 경험</p><h2>지역행사에서 나눈<br>주거와 생활 이야기</h2></div><p>공릉1동 지역행사에서 주민을 만난 기존 현장 기록입니다. 구성원들이 안내 부스에서 자료를 펼치고 주민과 대화하는 모습을 담았습니다.</p></div><div class="field-photo-pair">' + photoFigure(record.photos[2]) + photoFigure(record.photos[3]) + '</div><p class="field-caption-note">사진에 보이는 기관 로고는 당시 현장 안내물입니다. 로고의 노출이 해당 기관과 한지붕의 공식 협약·후원 관계를 뜻하지는 않습니다.</p></section>' +
    '<section class="field-chapter" id="housing-dialogue"><div class="field-chapter-heading"><div><p class="eyebrow">구성원의 관련 현장 경험</p><h2>지역의 삶을 듣고,<br>주거모델을 이야기합니다.</h2></div><p>운영진이 제공한 지역형 주거모델 기획 자료에 담긴 주민 만남입니다. 지역 주민과 테이블에 둘러앉은 현장의 모습을 전합니다.</p></div><div class="field-photo-single">' + photoFigure(record.photos[4]) + '</div></section>' +
    '<aside class="field-record-note"><h2>사진 기록 안내</h2><p>운영자가 제공하고 공개 동의를 확인한 사진입니다. 개별 사진의 활동일·장소가 확인되지 않은 경우 임의로 붙이지 않았습니다. 게시일은 실제 활동일을 뜻하지 않습니다. 서로 다른 사진을 동일한 행사나 상담으로 설명하지 않습니다.</p></aside>' +
    '<div class="contact-strip"><div><h2>빈방 활용과 공동생활이 궁금하신가요?</h2><p>현재 운영 중인 전화·이메일 무료상담의 범위와 이용방법을 확인해 보세요.</p></div><div class="contact-actions"><a class="button" href="/programs/senior-home-consulting/">무료상담 안내</a><a class="button button-secondary" href="/activities/">활동과 기록 전체 보기</a></div></div></div></section>';
  return layout({
    title: record.title, description: record.description, path: record.href, body,
    breadcrumbs: [{ label: "활동과 기록", href: "/activities/" }, { label: "어르신 상담 현장", href: record.href }],
    jsonLd: { "@context": "https://schema.org", "@type": "CollectionPage", name: record.title, description: record.description, url: absolute(record.href), datePublished: record.publishedAt, image: [...consultationPhotos, ...record.photos].map((item) => absolute("/assets/activities/" + item.file)) },
  });
}
