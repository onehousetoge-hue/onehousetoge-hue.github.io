import { site } from "../config/site.mjs";
import { icon, escapeHtml } from "../lib/template.mjs";
import { consultationRecords } from "./consultation-records.mjs";
import { consultationPhotos } from "./consultation-photos.mjs";
import { photoImage } from "../lib/photo.mjs";

export const aboutTitle = "한지붕 소개 | 고령층 유휴공간과 청년 주거문제를 잇는 비영리단체";
export const aboutDescription = "한지붕은 서울 노원구에서 어르신 유휴공간 활용 무료상담, 청년 주거문화 안내, 세대교류와 주거상생 실태조사를 수행하는 비영리단체입니다.";

const link = (href, label, primary = false) => `<a class="${primary ? "button" : "text-link"}" href="${href}">${label}${icon("arrow")}</a>`;
const work = [
  {title:"어르신 유휴공간 무료상담", icon:"home", status:"현재 전화·이메일 기초상담 · 무료", text:"빈방이 있다고 해서 반드시 누군가와 함께 살아야 하는 것은 아닙니다. 현재 생활환경과 가족의 의견, 개인공간과 공용공간, 공동생활에 대한 걱정을 함께 살펴보고 활용을 고민할 때 확인할 정보를 안내합니다.", href:"/programs/senior-home-consulting/", cta:"무료상담 알아보기"},
  {title:"청년·외국인 유학생 주거문화 안내", icon:"book", status:"회원가입 없이 무료로 읽는 정보", text:"낯선 공간에서 다른 사람과 생활하기 전에 무엇을 확인해야 하는지 정리합니다. 생활시간, 방문객, 청소, 소음, 공간 사용과 공식적인 주거 문의처 등 일상에 필요한 정보를 제공합니다.", href:"/resources/#youth-housing", cta:"청년 주거정보 보기"},
  {title:"세대교류 교육·봉사", icon:"people", status:"지역기관 요청에 따라 사전 협의", text:"어르신과 청년이 서로를 단순히 집을 가진 사람과 집을 구하는 사람으로 바라보지 않도록 이해의 접점을 만듭니다. 경로당·복지관·주민센터·학교 등과 교육·봉사와 세대교류 활동을 협의합니다. 상설 정규반은 아닙니다.", href:"/programs/intergenerational-volunteer/", cta:"세대교류 활동 보기"},
  {title:"주거상생 실태조사", icon:"research", status:"조사 진행 중 · 결과 보고서는 검토 후 공개", text:"현장에서 반복되는 질문과 걱정을 기록합니다. 청년 주거 문제와 고령층 유휴공간, 공동생활에 필요한 조건을 조사하고 공익자료·보고서와 정책제안으로 이어가는 것을 목표로 합니다.", href:"/programs/housing-research/", cta:"조사 현황 보기"},
];
const questions = ["나는 정말 다른 사람과 생활할 준비가 되어 있는가?", "어디까지 개인공간이고 어디부터 공용공간인가?", "가족은 어떻게 생각하고 있는가?", "생활시간과 방문객은 어떻게 할 것인가?", "소음과 청소에 대한 기준은 무엇인가?", "문제가 생기면 누구에게 도움을 요청할 것인가?"];
const principles = [
  ["당사자의 선택을 가장 먼저 존중합니다.", "상담을 받았다고 반드시 공동생활이나 공간 활용을 진행해야 하는 것은 아닙니다."],
  ["진행하지 않을 권리도 존중합니다.", "충분히 고민한 뒤 하지 않기로 결정하는 것 역시 중요한 선택입니다."],
  ["생활에서 이해하기 쉬운 정보를 제공합니다.", "전문용어보다 일상에서 확인해야 할 질문과 정보를 알기 쉽게 설명합니다."],
  ["서로 다른 세대의 생활방식을 존중합니다.", "누가 맞고 틀린지 정하기보다 서로 다른 생활방식을 미리 확인합니다."],
  ["실제 활동과 계획을 구분합니다.", "현재 하는 활동, 앞으로 하려는 활동, 전문기관에 확인할 문제를 구분하여 안내합니다."],
];
const records = [...consultationRecords].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,3);

export const aboutBody = `<div class="about-page">
<section class="about-hero" aria-labelledby="about-title"><div class="container">
  <p class="about-identity">비영리단체 <span aria-hidden="true">·</span> 서울 노원구에서 활동</p>
  <p class="about-legal">국세기본법상 법인으로 보는 단체</p>
  <h1 id="about-title">빈방은 남고,<br>월세 부담은 커지고 있습니다.</h1>
  <p class="about-hero-lead">한지붕은 어르신의 남는 주거공간과<br class="about-desktop-break"> 청년의 주거 문제를 함께 바라봅니다.</p>
  <p class="about-hero-description">서울 노원구에서 어르신의 유휴공간 활용, 청년의 주거부담 완화와 세대 간 고립 완화에 기여하기 위해 무료상담, 주거문화 안내, 세대교류와 주거상생 실태조사를 수행합니다.</p>
  <nav class="about-hero-actions" aria-label="한지붕 소개 주요 내용"><a class="button" href="#why">우리가 해결하려는 문제</a><a class="button button-secondary" href="#programs">현재 하는 활동</a><a class="button button-secondary" href="#governance">단체정보·투명성</a></nav>
</div></section>

<section id="why" class="about-section about-problem about-problem-senior" aria-labelledby="senior-problem-title"><div class="container about-split">
  <div><p class="eyebrow">01 · 고령층의 주거와 생활</p><h2 id="senior-problem-title">집은 있지만,<br>생활에 쓸 수 있는 현금은<br>부족할 수 있습니다.</h2><ul class="about-keywords" aria-label="함께 살펴볼 문제"><li>남는 방</li><li>생활비</li><li>혼자 거주</li></ul></div>
  <div class="about-copy"><p>은퇴 이후 매달 들어오는 소득은 줄어드는 반면, 오랫동안 살아온 집은 그대로 남아 있는 경우가 있습니다.</p><p>자녀의 독립, 배우자와의 사별, 가족구조의 변화로 혼자 살아가거나 집 안에 사용하지 않는 방이 생기기도 합니다.</p><p>집은 중요한 자산이지만, 그 공간이 매달 필요한 생활비나 새로운 관계로 자연스럽게 이어지는 것은 아닙니다.</p><p class="about-pullquote">집 안에는 공간이 남지만,<br>생활비와 사람과의 관계는<br>오히려 줄어들 수 있습니다.</p></div>
</div></section>

<section class="about-section about-problem about-problem-youth" aria-labelledby="youth-problem-title"><div class="container about-split">
  <div><p class="eyebrow">02 · 청년의 주거</p><h2 id="youth-problem-title">청년에게 집은<br>매달 지출되는<br>큰 비용입니다.</h2><ul class="about-keywords" aria-label="주거 선택의 조건"><li>보증금·월세</li><li>거주기간</li><li>생활환경</li></ul></div>
  <div class="about-copy"><p>학교와 직장을 따라 서울에서 생활하는 대학생·사회초년생·외국인 유학생에게 주거공간은 선택이 아니라 생활의 기반입니다.</p><p>목돈인 보증금을 마련하는 일과 매달 월세·관리비를 부담하는 일이 함께 놓여 있습니다. 몇 개월만 머물 공간이나 자신의 생활방식에 맞는 집을 찾는 것도 쉽지 않을 수 있습니다.</p><p class="about-pullquote">한쪽에는 사용하지 않는 방이 있고,<br>다른 한쪽에는 방 한 칸의 비용을<br>부담하는 청년이 있습니다.</p></div>
</div></section>

<section class="about-section about-perspective" aria-labelledby="perspective-title"><div class="container">
  <p class="eyebrow">두 문제를 하나의 지역 문제로</p><h2 id="perspective-title">공간은 남고,<br>필요한 주거공간은 부족합니다.</h2>
  <div class="about-connection" role="group" aria-label="고령층의 유휴공간과 청년의 주거부담을 함께 살펴 지역의 주거상생을 준비합니다"><div><span>지역에 이미 있는 자원</span><strong>고령층의 유휴공간</strong></div><span class="about-connector" aria-hidden="true">+</span><div><span>함께 살펴야 할 필요</span><strong>청년의 주거부담</strong></div><span class="about-connector" aria-hidden="true">→</span><div class="about-connection-result"><span>한지붕이 준비하는 방향</span><strong>지역의 주거상생</strong></div></div>
  <div class="about-copy about-wide-copy"><p>한지붕은 이 두 문제를 따로 바라보지 않습니다. 지역 안에 이미 존재하는 유휴 주거공간이 더 잘 활용된다면 고령층과 청년 모두에게 새로운 가능성이 생길 수 있습니다.</p><p>하지만 빈방과 사람을 연결하는 것만으로 문제가 해결되지는 않습니다. 안전, 개인공간, 생활시간, 방문객, 청소, 소음과 공용공간 사용처럼 먼저 살펴보고 합의할 기준이 있기 때문입니다.</p></div>
</div></section>

<section id="purpose" class="about-section about-mission" aria-labelledby="mission-title"><div class="container">
  <p class="eyebrow" lang="en">OUR MISSION</p><h2 id="mission-title">남는 공간을 지역의 주거자원으로 바꾸고,<br>서로 다른 세대가 함께 살아갈 수 있는<br>기준을 만듭니다.</h2>
  <p class="about-mission-intro">정보를 나누고, 생활의 기준을 세우고,<br>세대가 서로를 이해할 관계를 준비합니다.</p>
  <div class="about-mission-columns"><p>우리의 목표는 빈방을 많이 연결하는 것이 아닙니다. 어르신에게는 자신의 공간을 충분히 알아보고 선택할 정보를, 청년에게는 공동생활 전에 확인할 주거문화와 생활의 기준을 제공합니다.</p><p>현장에서 발견한 문제를 조사하고 기록하며, 청년의 주거 부담과 고령층 고립 완화에 기여하는 것. 더 나은 주거문화를 준비하는 것이 한지붕의 설립 목적이자 사명입니다.</p></div>
</div></section>

<section id="programs" class="about-section" aria-labelledby="work-title"><div class="container">
  <p class="eyebrow">한지붕이 하는 일</p><h2 id="work-title">문제를 연결하는<br>네 가지 공익활동</h2>
  <div class="about-work-grid">${work.map((item,i)=>`<article class="about-work-card"><div class="about-card-top"><span>0${i+1}</span>${icon(item.icon)}</div><h3>${item.title}</h3><p class="about-status">${item.status}</p><p>${item.text}</p>${i===0 ? '<p class="about-process">상담 → 생활환경에 관한 질문 → 고려사항 정리 → 본인이 결정</p>' : ''}${link(item.href,item.cta)}</article>`).join("")}</div>
</div></section>

<section class="about-section about-first" aria-labelledby="first-title"><div class="container">
  <div class="about-split"><div><p class="eyebrow">연결보다 먼저, 준비</p><h2 id="first-title">한지붕은 빈방부터<br>연결하지 않습니다.</h2></div><div class="about-copy"><p>공간이 남는다고 곧바로 누군가와 함께 살 수 있는 것은 아닙니다. 누구와 함께 살 것인지보다 먼저 확인해야 할 질문이 있습니다.</p><p><strong>현재 한지붕은 입주자를 연결하거나 계약을 대행하지 않습니다.</strong> 전화·이메일 기초상담과 생활자료로 준비할 질문을 안내합니다.</p></div></div>
  <ul class="about-question-grid">${questions.map(q=>`<li>${icon("check")}<span>${q}</span></li>`).join("")}</ul>
  <p class="about-closing-line">‘방을 연결하는 것’보다<br>‘함께 살아갈 수 있는 조건을 만드는 것’을 먼저 생각합니다.</p>
</div></section>

<section class="about-section" aria-labelledby="audience-title"><div class="container"><p class="eyebrow">누구를 위한 활동인가요?</p><h2 id="audience-title">어르신과 청년에게,<br>그리고 지역의 이웃에게</h2><div class="about-audience-grid">
  <article><h3>어르신과 가족</h3><p>자녀 독립 후 남은 방이나 집의 일부를 어떻게 활용할지 고민한다면 무료상담을 받을 수 있습니다. 가족이 함께 상담해도 됩니다.</p>${link("/consultation/","어르신 무료상담")}</article>
  <article><h3>청년·외국인 유학생</h3><p>한국에서 집을 구하고 공동생활을 준비할 때 확인할 주거문화와 생활규칙 정보를 무료로 이용할 수 있습니다.</p>${link("/resources/#youth-housing","청년 주거정보")}</article>
  <article><h3>지역기관 · 협력 대상</h3><p>복지관·경로당·주민센터·학교 등과 세대교류, 주거교육, 상담 프로그램과 지역 실태조사 협력을 논의합니다.</p>${link("/partnership/","기관 협력 문의")}</article>
</div></div></section>

<section class="about-section about-records" aria-labelledby="records-title"><div class="container"><p class="eyebrow">지역에서 이어가는 활동</p><h2 id="records-title">우리는 지역에서<br>직접 듣고 기록합니다.</h2><p class="about-section-lead">서울 노원구를 중심으로 어르신과 청년의 이야기를 듣고, 현장에서 발견되는 주거 문제를 기록합니다. 아래는 공개된 상담 기록입니다.</p>
<div class="about-record-grid">${records.map(record=>{const photo=consultationPhotos[record.photoIndex];return `<article class="about-record-card"><figure>${photoImage(photo,{sizes:"(max-width: 700px) calc(100vw - 40px), 400px"})}<figcaption>${escapeHtml(photo.caption)}${photo.context ? `<span class="photo-context-caption">${escapeHtml(photo.context)}</span>` : ""}</figcaption></figure><p class="resource-meta"><time datetime="${record.date}">${record.dateLabel}</time><br>${record.area}</p><h3>${record.title}</h3><p>${record.overview}</p><p class="about-record-question"><strong>현장에서 나온 질문</strong><br>${escapeHtml(record.questions[0])}</p>${link(record.href,"활동 기록 읽기")}</article>`;}).join("")}</div><p class="section-action">${link("/activities/","모든 활동 기록 보기",true)}</p>
</div></section>

<section id="governance" class="about-section" aria-labelledby="governance-title"><div class="container about-split"><div><p class="eyebrow">운영주체와 투명성</p><h2 id="governance-title">한지붕은 비영리<br>목적으로 운영됩니다.</h2><div class="about-copy"><p>2026년 7월 5일 창립총회에서 단체 설립, 대표자 선임, 회칙 승인과 고유사업을 의결했습니다.</p><p>2026년 7월 9일 국세기본법상 법인으로 보는 단체로 승인받고 고유번호를 발급받았습니다.</p><h3>대표자와 의사결정 구조</h3><p>대표와 운영진은 상담 응대와 일상 운영을 맡고, 주요 사항은 정관과 단체 운영 절차에 따라 결정합니다.</p></div>${link("/transparency/","운영·투명성 확인하기")}</div><div class="about-organization"><dl><div><dt>단체명</dt><dd>한지붕</dd></div><div><dt>대표자</dt><dd>${site.representative}</dd></div><div><dt>창립일</dt><dd>2026년 7월 5일</dd></div><div><dt>고유번호</dt><dd>${site.registrationNumber}</dd></div><div><dt>단체 성격</dt><dd>비영리단체<br>국세기본법상 법인으로 보는 단체</dd></div><div><dt>활동지역</dt><dd>서울특별시 노원구 및 서울 지역</dd></div></dl><p>한지붕의 수입과 재산은<br>단체의 목적사업과 운영을 위해 사용합니다.</p></div></div></section>

<section id="charter" class="about-section about-charter" aria-labelledby="charter-title"><div class="container about-split"><div><p class="eyebrow">정관과 목적사업</p><h2 id="charter-title">우리가 약속한<br>공익 목적</h2><p>청년의 주거 부담 완화와 고령층 고립 완화에 기여하는 목적을 기준으로 활동합니다.</p><p>아래는 목적사업 요약이며 정관 조문 전문이 아닙니다. 목적사업 전체와 현재 제공 범위는 구분합니다.</p></div><div><ul class="about-charter-list"><li>어르신 빈방 활용 무료상담 및 교육</li><li>청년·외국인 유학생 한국 주거문화 안내</li><li>지역기관 연계 세대공감 프로그램</li><li>청년 주거 및 고령층 유휴공간 실태조사</li><li>공익 목적 보고서 발간 및 정책제안</li></ul><p>정관 원문은 현재 웹사이트에 공개하지 않습니다. 열람을 요청하시면 개인정보와 서명 등을 점검한 공개 가능한 범위를 안내합니다.</p><div class="hero-actions">${link("/contact/#inquiry-templates","정관 열람 문의")}${link("/contact/","단체정보 문의")}</div></div></div></section>

<section class="about-section" aria-labelledby="principles-title"><div class="container"><p class="eyebrow">한지붕이 지키는 기준</p><h2 id="principles-title">선택과 일상을 존중하는<br>다섯 가지 원칙</h2><ol class="about-principles">${principles.map(([title,text],i)=>`<li><span class="about-principle-number" aria-hidden="true">0${i+1}</span><div><h3>${title}</h3><p>${text}</p></div></li>`).join("")}</ol><p class="about-privacy-note">${icon("shield")}초기 문의 단계에서는 민감정보나 상세주소를 요구하지 않습니다.</p></div></section>

<section class="about-section about-final" aria-labelledby="final-title"><div class="container"><p class="eyebrow">함께 준비하는 주거상생</p><h2 id="final-title">집에 남는 방과,<br>집을 구하는 청년 사이에는<br>아직 해결해야 할 질문이 많습니다.</h2><p>누구와 함께 살아야 하는지, 서로 얼마나 다른지,<br class="about-desktop-break"> 어떤 규칙이 필요한지, 문제가 생기면 어떻게 해야 하는지.<br>한지붕은 그 질문에 대한 답을 지역에서 하나씩 찾아갑니다.</p><p class="about-final-promise">남는 공간이 누군가의 생활을 돕고,<br>새로운 만남이 어르신과 청년 모두에게 도움이 되는<br class="about-desktop-break"> 주거문화를 만들겠습니다.</p><div class="hero-actions"><a class="button" href="/activities/">한지붕의 활동 보기</a><a class="button button-secondary" href="/consultation/">무료상담 신청</a><a class="button button-secondary" href="/partnership/">기관 협력 문의</a></div></div></section>
</div>`;
