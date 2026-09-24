import { digitalLearning as record } from "../content/field-records.mjs";
import { consultationPhotos } from "../content/consultation-photos.mjs";
import { absolute, icon, layout, pageHero } from "./template.mjs";
import { photoFigure, photoImage } from "./photo.mjs";
import { consultationRecords, validateConsultationRecord } from "../content/consultation-records.mjs";
import { evidenceFlow } from "./evidence-flow.mjs";

export function fieldRecordFeature() {
  return '<section class="section field-feature-section"><div class="container"><div class="section-header"><div><p class="eyebrow">사진으로 만나는 현장</p><h2>이야기를 듣고,<br>함께 살펴보는 현장</h2></div><p>어르신과 대화를 나누는 상담 현장과 디지털 활용을 안내해 온 경험을 사진으로 소개합니다.</p></div><div class="story-preview-grid"><article class="story-preview"><div class="story-preview-image">' + photoImage(consultationPhotos[1]) + '</div><div class="story-preview-copy"><p class="eyebrow">어르신 상담 현장</p><h3>어르신과 나눈 상담 이야기</h3><p>길을 함께 걸으며 나눈 대화와 상담 부스에서 마주한 순간을 전합니다.</p><a class="text-link" href="' + record.href + '">상담 현장 사진 보기' + icon("arrow") + '</a></div></article><article class="story-preview"><div class="story-preview-image">' + photoImage(record.photos[0]) + '</div><div class="story-preview-copy"><p class="eyebrow">디지털·세대교류</p><h3>일상에 가까운 디지털 활용 안내</h3><p>직접 해보고, 다시 해보는 시간. 구성원들이 참여해 온 교육 경험을 소개합니다.</p><a class="text-link" href="/activities/senior-digital-education/">디지털 교육 경험 보기' + icon("arrow") + '</a></div></article></div><p class="section-action"><a class="text-link" href="/activities/">활동과 기록 모두 보기' + icon("arrow") + '</a></p></div></section>';
}

function consultationRecordContent(activity) {
  const photo = { ...consultationPhotos[activity.photoIndex], caption: activity.caption };
  const renderList = (items) => `<ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul>`;
  const photoContext = activity.photoIndex === 2 ? `<aside class="photo-context"><h3>현재 상담은 생활의 준비사항을 안내합니다</h3><p>사진 속 배너 문구는 촬영 당시 현장 안내입니다. 한지붕의 현재 무료상담은 임대수익을 보장하거나 입주를 알선하는 서비스가 아닙니다.</p><a href="/programs/senior-home-consulting/">현재 상담 범위 확인하기</a></aside>` : "";
  return `<section class="field-chapter consultation-record" id="${activity.id}" aria-labelledby="${activity.id}-title">${activity.photoIndex === 0 ? '<span id="consultation-walk"></span>' : activity.photoIndex === 2 ? '<span id="consultation-booth"></span>' : ""}<p class="eyebrow"><time datetime="${activity.date}">${activity.dateLabel}</time> · 상담 현장 기록</p><h2 id="${activity.id}-title">${activity.title}</h2><dl class="record-facts"><div><dt>활동지역</dt><dd>${activity.area}</dd></div><div><dt>참여대상</dt><dd>${activity.participants}</dd></div></dl><div class="consultation-record-body"><div class="prose"><h3>활동내용</h3><p>${activity.overview}</p><h3>현장에서 나온 질문</h3>${renderList(activity.questions)}<h3>한지붕이 제공한 안내</h3>${activity.guidance.map((p) => `<p>${p}</p>`).join("")}<h3>활동 이후 진행한 사항</h3>${renderList(activity.followup)}${activity.checklist ? `<h4>보완한 공동생활 사전질문지 항목</h4>${renderList(activity.checklist)}<p>웹사이트에서 신원서류나 가족 연락처를 수집하지 않습니다. 비상연락 방법은 당사자의 동의를 받아 필요한 범위에서 정하도록 안내합니다.</p>` : ""}</div><div class="consultation-record-photo">${photoContext}${photoFigure(photo)}</div></div></section>`;
}

function consultationRecordCard(activity) {
  const photo = { ...consultationPhotos[activity.photoIndex], caption: activity.caption };
  const context = activity.photoIndex === 2 ? '<aside class="photo-context"><h3>현재 상담은 생활의 준비사항을 안내합니다</h3><p>사진 속 배너는 촬영 당시 안내입니다. 현재 상담은 임대수익을 보장하거나 입주를 알선하는 서비스가 아닙니다.</p></aside>' : '';
  return `<section class="field-chapter consultation-record" id="${activity.id}">${activity.photoIndex === 0 ? '<span id="consultation-walk"></span>' : activity.photoIndex === 2 ? '<span id="consultation-booth"></span>' : ''}<p class="eyebrow"><time datetime="${activity.date}">${activity.dateLabel}</time> · 상담 현장 기록</p><h2>${activity.title}</h2><dl class="record-facts"><div><dt>활동지역</dt><dd>${activity.area}</dd></div><div><dt>참여대상</dt><dd>${activity.participants}</dd></div></dl><div class="consultation-record-body"><div class="prose"><p>${activity.overview}</p><h3>활동 이후 진행한 사항</h3><p>${activity.followup[0]}</p><a class="button button-secondary" href="${activity.href}">질문·안내·후속 활동 자세히 보기</a></div><div class="consultation-record-photo">${context}${photoFigure(photo)}</div></div></section>`;
}

export function consultationRecordPage(activity) {
  validateConsultationRecord(activity);
  const image = consultationPhotos[activity.photoIndex];
  if (!image) throw new Error("Activity photo does not exist");
  const body = pageHero({ eyebrow: "활동과 기록 · 무료상담", title: activity.title, description: activity.overview,
    meta: `<div class="page-meta"><span>활동일 ${activity.dateLabel}</span><span>게시일 <time datetime="${activity.publishedAt}">${activity.publishedAt.replaceAll('-', '.')}</time></span><span>마지막 수정일 <time datetime="${activity.updatedAt}">${activity.updatedAt.replaceAll('-', '.')}</time></span><span>작성 ${activity.author}</span></div>` }) +
    `<section class="section"><div class="container">${consultationRecordContent(activity)}<div class="notice"><h2>기록의 공개 범위</h2><p>운영진이 제공한 회차별 기록과 공개 동의를 확인한 사진입니다. 참여자의 이름·상세주소·개별 상담내용은 공개하지 않습니다. 참여인원은 해당 회차의 인원이며 다른 회차와 합산한 실인원이 아닙니다.</p></div><section class="related-section"><h2>상담 후 함께 볼 자료</h2><div class="related-grid"><a href="/resources/consultation-preparation/" class="related-link">무료상담 준비 질문지</a><a href="/resources/family-checklist/" class="related-link">가족과 확인할 사항</a><a href="/resources/shared-living-rules/" class="related-link">생활규칙 작성표</a></div></section><div class="hero-actions"><a class="button" href="/consultation/">무료상담 문의하기</a><a class="button button-secondary" href="/programs/senior-home-consulting/">상담 범위 확인하기</a><a class="text-link" href="/activities/field-records/">상담 현장 기록 모두 보기</a></div>${evidenceFlow()}</div></section>`;
  return layout({title: activity.title, description: activity.overview, path: activity.href, body, type: "article", publishedAt: activity.publishedAt, updatedAt: activity.updatedAt,
    breadcrumbs: [{label:"활동과 기록",href:"/activities/"},{label:"상담 현장",href:"/activities/field-records/"},{label:activity.title,href:activity.href}],
    jsonLd: {"@context":"https://schema.org","@type":"Article",headline:activity.title,description:activity.overview,datePublished:activity.publishedAt,dateModified:activity.updatedAt,author:{"@type":"Organization",name:activity.author},publisher:{"@type":"Organization",name:"한지붕",url:absolute('/')},mainEntityOfPage:absolute(activity.href),image:absolute('/assets/activities/'+image.file)} });
}

export function fieldRecordPage() {
  const body = pageHero({
    eyebrow: "활동과 기록 · 상담 현장",
    title: "어르신의 이야기를<br>현장에서 듣습니다.",
    description: record.description,
    meta: '<div class="page-meta"><span>사진 제공 한지붕 운영진</span><span>게시일 <time datetime="' + record.publishedAt + '">2026년 9월 23일</time></span><span>활동 상세 반영일 <time datetime="2026-09-24">2026년 9월 24일</time></span></div>',
  }) + '<section class="section field-story"><div class="container">' +
    '<div class="field-context"><h2>현장의 질문을 상담자료로 이어갑니다</h2><p>한지붕은 노원구 지역 어르신과 가족을 대상으로 주거공간 활용, 공동생활 준비, 생활규칙과 복지정보에 관한 무료상담을 진행합니다. 반복되는 질문과 어려움을 기록해 상담자료와 지역 주거복지 프로그램에 반영합니다.</p><p>아래는 운영진이 제공한 회차별 활동 기록입니다. 일반 문의는 전화·이메일로, 기관·경로당 상담 요청은 사전 협의로 안내합니다.</p></div>' +
    '<nav class="field-toc" aria-label="상담 활동과 현장 사진 목차">' + consultationRecords.map((activity) => '<a href="#' + activity.id + '">' + activity.dateLabel + ' 상담</a>').join("") + '<a href="#digital-education">디지털 활용</a><a href="#community-exchange">기존 현장 기록</a></nav>' +
    consultationRecords.map(consultationRecordCard).join("") +
    '<section class="field-context prose"><h2>현장에서 확인한 내용을 다음 활동에 반영합니다</h2><ul><li>어르신용 무료상담 자료 보완</li><li>공동생활 사전질문지 제작</li><li>가족동의 확인항목과 생활규칙 합의서 보완</li><li>지역 주거실태조사 문항 반영</li><li>향후 교육·안내 프로그램 기획</li></ul><p><a href="/resources/family-checklist/">공동생활 전 가족과 확인할 자료</a> · <a href="/resources/shared-living-rules/">생활규칙 작성표</a></p></section>' +
    '<section class="field-chapter" id="digital-education"><div class="field-chapter-heading"><div><p class="eyebrow">03 · 디지털 활용</p><h2>직접 확인하고,<br>다시 해보는 시간</h2></div><p>어르신이 스마트폰 화면을 직접 확인하는 모습과 구성원들이 함께한 디지털 교육 경험을 소개합니다. 개인 대화와 세부 정보는 공개용 사진에서 가렸습니다.</p></div><div class="field-photo-single">' + photoFigure(consultationPhotos[3]) + '</div><div class="field-photo-pair field-photo-pair-education">' + photoFigure(record.photos[0]) + photoFigure(record.photos[1]) + '</div><p class="field-chapter-link"><a class="text-link" href="/activities/senior-digital-education/">디지털 교육 경험 읽기' + icon("arrow") + '</a></p></section>' +
    '<section class="field-chapter" id="community-exchange"><div class="field-chapter-heading"><div><p class="eyebrow">04 · 구성원의 관련 현장 경험</p><h2>지역행사에서 나눈<br>주거와 생활 이야기</h2></div><p>공릉1동 지역행사에서 주민을 만난 기존 현장 기록입니다. 구성원들이 안내 부스에서 자료를 펼치고 주민과 대화하는 모습을 담았습니다.</p></div><aside class="photo-context"><h3>현장 기록과 현재 서비스 안내를 구분합니다</h3><p>사진의 현수막은 당시 현장 안내이며 한지붕의 지급·수익 보장이 아닙니다. 사진에 보이는 기관 로고만으로 해당 기관과 한지붕의 공식 협약·후원 관계를 뜻하지는 않습니다.</p></aside><div class="field-photo-pair">' + photoFigure(record.photos[2]) + photoFigure(record.photos[3]) + '</div></section>' +
    '<section class="field-chapter" id="housing-dialogue"><div class="field-chapter-heading"><div><p class="eyebrow">구성원의 관련 현장 경험</p><h2>지역의 삶을 듣고,<br>주거모델을 이야기합니다.</h2></div><p>운영진이 제공한 지역형 주거모델 기획 자료에 담긴 주민 만남입니다. 지역 주민과 테이블에 둘러앉은 현장의 모습을 전합니다.</p></div><div class="field-photo-single">' + photoFigure(record.photos[4]) + '</div></section>' +
    '<aside class="field-record-note"><h2>사진 기록 안내</h2><p>운영자가 제공하고 공개 동의를 확인한 사진입니다. 위 세 상담의 날짜·지역·회차별 참여인원과 사진 연결은 운영진의 확인에 따라 반영했습니다. 회차별 참여인원을 중복 제거한 전체 실인원으로 합산하지 않습니다. 나머지 교육·관련 현장 사진에는 확인되지 않은 날짜를 붙이지 않았습니다. 게시일은 실제 활동일을 뜻하지 않습니다.</p></aside>' +
    '<div class="contact-strip"><div><h2>빈방 활용과 공동생활이 궁금하신가요?</h2><p>온라인·전화·이메일로 문의할 수 있습니다. 기관·경로당 상담은 사전 협의해 주세요.</p></div><div class="contact-actions"><a class="button" href="/consultation/">무료상담 신청 문의</a><a class="button button-secondary" href="/programs/senior-home-consulting/">상담 가능한 내용 확인하기</a><a class="button button-secondary" href="/partnership/">기관·경로당 상담 요청하기</a></div></div>' + evidenceFlow() + '</div></section>';
  return layout({
    title: record.title, description: record.description, path: record.href, body,
    breadcrumbs: [{ label: "활동과 기록", href: "/activities/" }, { label: "어르신 상담 현장", href: record.href }],
    jsonLd: { "@context": "https://schema.org", "@type": "CollectionPage", name: record.title, description: record.description, url: absolute(record.href), datePublished: record.publishedAt, dateModified: "2026-09-24", image: [...consultationPhotos, ...record.photos].map((item) => absolute("/assets/activities/" + item.file)) },
  });
}
