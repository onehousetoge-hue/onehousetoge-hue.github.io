import { site } from "../config/site.mjs";
import { consultationPhotos } from "../content/consultation-photos.mjs";
import { getResource } from "../content/resources.mjs";
import { icon } from "./template.mjs";
import { photoFigure } from "./photo.mjs";
import { fieldRecordFeature } from "./field-record-page.mjs";

export function landingPage(programCards) {
  const guides = ["family-checklist", "consultation-preparation", "shared-living-rules"].map(getResource);
  return `<section class="hero consultation-hero"><div class="container hero-grid">
    <div class="hero-copy"><p class="eyebrow nonprofit-badge">${icon("home")}한지붕은 비영리단체입니다</p><h1>비어 있는 방의 가능성,<br>함께 살아갈 준비부터 살핍니다.</h1>
      <p>빈방을 어떻게 활용하면 좋을지, 함께 생활하려면 무엇을 준비해야 할지 궁금하신가요?</p><p>한지붕 대표와 운영진이 어르신과 가족의 이야기를 듣고, 공간 활용과 공동생활에 필요한 기본 정보를 무료로 안내합니다.</p>
      <div class="hero-actions"><a class="button" href="/programs/senior-home-consulting/">빈방 활용 무료상담 안내${icon("arrow")}</a><a class="button button-secondary" href="/resources/consultation-preparation/">상담 전 준비자료 보기</a></div>
      <p class="hero-service-note">현재 전화·이메일로 상담합니다.<br>초기 상담에는 비용이 없습니다.</p>
    </div><div class="hero-documentary">${photoFigure(consultationPhotos[0], { eager: true })}</div>
  </div></section>
  <section class="section section-muted"><div class="container"><div class="section-header"><div><p class="eyebrow">이런 고민부터 이야기해 주세요</p><h2>빈방 활용,<br>무엇부터 생각하면 좋을까요?</h2></div><p>바로 결정하지 않아도 괜찮습니다. 당사자와 가족의 생각을 먼저 듣고, 필요한 질문을 함께 정리합니다.</p></div>
    <div class="question-grid"><article><span class="question-number">01</span><h3>비어 있는 방이 있는데,<br>무엇부터 확인해야 할까요?</h3><p>가족과 먼저 이야기할 사항과 활용을 검토할 때 필요한 준비사항을 정리합니다.</p><a class="text-link" href="/resources/family-checklist/">가족과 나눌 질문${icon("arrow")}</a></article><article><span class="question-number">02</span><h3>다른 세대와 함께 살려면<br>무엇을 약속해야 할까요?</h3><p>개인공간과 공용공간, 생활시간과 방문객 등 공동생활 기준을 살펴봅니다.</p><a class="text-link" href="/resources/shared-living-rules/">생활규칙 작성표${icon("arrow")}</a></article><article><span class="question-number">03</span><h3>집을 정리하거나 개선할<br>부분이 궁금해요.</h3><p>공간 정리·개선에 관한 일반 정보와 추가로 확인할 질문을 안내합니다.</p><a class="text-link" href="/resources/private-common-space/">공간 구분 살펴보기${icon("arrow")}</a></article></div>
  </div></section>
  <section class="section"><div class="container"><div class="section-header"><div><p class="eyebrow">한지붕이 하는 일</p><h2>공간과 세대를 잇는<br>세 가지 공익사업</h2></div><p>${site.nonprofitDescription}</p></div><div class="program-grid">${programCards()}</div></div></section>
  ${fieldRecordFeature()}
  <section class="section"><div class="container"><div class="section-header"><div><p class="eyebrow">먼저 읽어보는 생활자료</p><h2>가족과 이야기할 때,<br>함께 생활할 때 꺼내 보세요.</h2></div><p>상담 전에 생각을 정리하고 공동생활의 기준을 적어볼 수 있는 한지붕 생활자료입니다.</p></div><div class="resource-grid">${guides.map((guide) => `<article class="resource-card"><span class="resource-meta">${guide.category} · 읽고 직접 적는 자료</span><h3>${guide.title}</h3><p>${guide.outcome}</p><a class="text-link" href="${guide.href}">자료 읽기${icon("arrow")}</a></article>`).join("")}</div><p class="section-action"><a class="button button-secondary" href="/resources/">주거상생 자료 6종 보기${icon("arrow")}</a></p></div></section>
  <section class="section section-dark"><div class="container"><div class="section-header"><div><p class="eyebrow">상담 이용방법</p><h2>궁금한 내용을<br>편하게 말씀해 주세요.</h2></div><p>전화와 이메일로 상담을 시작할 수 있습니다. 복잡한 온라인 신청은 필요하지 않습니다.</p></div><ol class="steps consultation-steps"><li><span>1</span><h3>전화하거나<br>이메일을 보냅니다.</h3><p>궁금한 점과 필요한 안내를 간단히 알려주세요.</p></li><li><span>2</span><h3>대표 또는 운영진이<br>내용을 확인합니다.</h3><p>안내 가능한 범위를 설명하고 함께 확인할 사항을 정리합니다.</p></li><li><span>3</span><h3>필요한 자료와<br>다음 확인처를 안내합니다.</h3><p>전문 판단이 필요한 내용은 관련 공공기관이나 전문가에게 확인할 수 있도록 안내합니다.</p></li></ol><p class="scope-note">세금·법률·계약에 대한 확정적인 판단, 주택 안전 진단, 공사·중개·입주 연결은 제공하지 않습니다.</p></div></section>
<section class="section"><div class="container organization-intro"><div><p class="eyebrow">한지붕 소개</p><h2>남는 공간을 살피고,<br>세대가 함께 살아갈 기준을 만듭니다.</h2></div><div><p>한지붕은 어르신의 유휴공간과 청년 주거 문제를 함께 살피고, 세대가 함께 살아가기 위한 정보를 나누는 비영리단체입니다.</p><p>대표 ${site.representative} · 고유번호 ${site.registrationNumber}</p><a class="text-link" href="/transparency/">단체 운영정보 확인하기${icon("arrow")}</a><p>노원구청 공모사업 지원금 600,000원의 사용 내역을 공개했습니다. <a href="/activities/nowon-grant-execution/">지원금 집행내역 보기</a></p><p><a href="/privacy/">개인정보 처리방침</a></p></div></div></section>
  <section class="final-cta"><div class="container"><p class="eyebrow">전화·이메일 무료상담</p><h2>혼자 결정하기 전에,<br>궁금한 점부터 이야기해 주세요.</h2><div class="hero-actions"><a class="button" href="${site.phoneHref}">${icon("phone")}전화로 문의하기</a><a class="button button-secondary" href="${site.emailHref}">${icon("mail")}이메일로 문의하기</a></div><p class="contact-readable"><a href="${site.phoneHref}">${site.phone}</a><span aria-hidden="true"> · </span><a href="${site.emailHref}">${site.email}</a></p><a class="text-link" href="/participate/#partnership">교육·봉사 기관협력 문의${icon("arrow")}</a></div></section>`;
}
