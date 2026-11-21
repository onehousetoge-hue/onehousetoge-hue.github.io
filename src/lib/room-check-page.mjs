import { site } from "../config/site.mjs";
import { diagnosisBanner } from "./template.mjs";
import { incomeCalculator } from "./income-calculator.mjs";
import { rentFaqSection } from "./rent-faq.mjs";
import { headlineExperiment } from "./static-assets.mjs";

const art = (file, alt, width, height, eager = false) => `<img src="/assets/figma/${file}" alt="${alt}" width="${width}" height="${height}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`;
const reviews = [
  ["각자 지내다가,<br>마주치면 안부를 나눠요.", "누군가와 같이 살면 종일 신경을 써야 할까 봐 망설였어요. 막상 지내보니 학생은 학교생활을 하고, 저는 제 일상을 보내요. 그러다 저녁에 마주치면 “오늘 어땠어요?” 하고 한마디 나누는 게 생각보다 반갑더라고요.", "김영호", "68세"],
  ["짐만 두던 방이<br>생활비에 보탬이 되네요.", "아이가 독립한 뒤로 방 하나를 거의 창고처럼 쓰고 있었어요. 방을 어떻게 준비해야 할지 막막했는데 한지붕과 하나씩 정리했죠. 비워두던 방에 학생이 들어오고 월세를 받으니, 매달 생활비에 보탬이 돼요.", "이정숙", "64세"],
  ["밥까지 챙겨줘야 하는 줄<br>알았어요.", "처음에는 예전 하숙처럼 밥하고 빨래까지 해줘야 하나 싶었어요. 각자 식사와 집안일을 챙기고, 함께 쓰는 공간의 규칙만 정하면 된다고 해서 시작했죠. 제 일상을 크게 바꾸지 않고도 함께 지낼 수 있어서 좋았어요.", "박미영", "59세"],
];

export function roomCheckPage() {
  return `<div class="room-app">${diagnosisBanner()}
    <div class="host-main">
      <section class="host-hero" aria-labelledby="host-title"><div class="host-container hero-layout"><div class="host-hero-copy"><h1 id="host-title">관리비 걱정은 <strong>이제 그만!</strong></h1>
        <template id="host-title-B">우리 집 빈 방 <strong>얼마 받을 수 있을까?</strong></template>
        <template id="host-title-C">혼자 계신 부모님께 <strong>드릴 수 있는 선물</strong></template>
        ${headlineExperiment}
        <p class="hero-description">방 준비부터 청년 입주, 거주 중 관리까지<br>한지붕이 함께합니다.</p><a class="host-primary hero-diagnosis" href="/reservation/">우리 집 예상 월세 무료 진단 받기 ${art("arrow-cta.svg", "", 8, 12)}</a></div><div class="hero-floorplan">${art("hero-floorplan.png", "남는 방 한 칸을 월세 생활비로 활용하는 주택 평면도", 837, 730, true)}</div></div></section>
      <section class="host-process" id="process" aria-labelledby="process-title"><div class="host-container" id="goals"><h2 id="process-title">진행 방법</h2><div class="process-rows">
        <article class="process-row"><div class="process-copy"><h3>빈방 준비,<br>매니저에게 맡기세요</h3><p>준비 범위와 비용은 집주인과 함께 정하고,<br>정리·청소부터 가구 배치와 점검까지 도와드려요.</p><ol class="preparation-list"><li>${art("prepare-plan.png", "", 46, 46)}<strong>준비 계획</strong><small>범위·비용<br>함께 결정</small></li><li>${art("prepare-cleaning.png", "", 46, 46)}<strong>정리·청소</strong><small>일정·진행<br>꼼꼼히 관리</small></li><li>${art("prepare-furniture.png", "", 46, 46)}<strong>가구 준비</strong><small>가구 마련과<br>배치까지</small></li><li>${art("prepare-check.svg", "", 46, 46)}<strong>최종 점검</strong><small>가구·시설<br>마지막 확인</small></li></ol></div><div class="process-art preparation">${art("step-preparation.png", "빈방 점검 전과 정리·가구 배치를 마친 점검 후 비교", 634, 488)}<span class="art-label before">점검 전</span><span class="art-label after">점검 후</span></div></article>
        <article class="process-row reverse"><div class="process-copy"><h3>함께 살 학생,<br>최종 결정은 집주인이 합니다!</h3><p>본인·재학 정보와 생활조건을 먼저 확인해요.<br>우리 집과 잘 맞는 학생을 충분히 살펴보고 결정하세요.</p><div class="process-pill">${art("matching-alternative.svg", "", 28, 28)}<strong>마음에 드는 학생이 없으면</strong><span>다른 후보를 찾아드려요</span></div></div><div class="process-art matching">${art("step-matching.png", "본인·재학 정보와 희망 거주기간, 생활패턴을 확인하는 청년 후보 안내 예시", 758, 623)}</div></article>
        <article class="process-row"><div class="process-copy"><h3>우리 집 생활규칙,<br>집주인이 직접 정해요</h3><p>입주 전 서로의 생활 패턴과 성향을 고려해 생활규칙을 함께 논의하고, 별도의 서면 합의서를 작성해요.<br>지내는 동안 불편하거나 궁금한 점이 생기면, 언제든지 365일 24시간 문의하실 수 있어요.</p><div class="process-pills"><div class="process-pill">${art("rules-shared.png", "", 27, 29)}<strong>함께 정할 규칙</strong><span>주방 사용, 생활시간·소음, 방문객</span></div><div class="process-pill">${art("rules-space.png", "", 27, 29)}<strong>우리 집 기준</strong><span>세탁·청소, 공용·개인 공간 범위</span></div></div></div><div class="process-art rules">${art("step-rules.png", "생활조건 확인 화면과 공동생활 서면 합의서", 820, 534)}</div></article>
        <article class="process-row reverse"><div class="process-copy"><h3>입주한 뒤에도,<br>매니저가 함께해요</h3><p>매니저가 집주인과 학생의 안부를 확인해요.<br>함께 지내며 불편한 점이 생기면 이야기를 듣고 조율해요.</p><dl class="management-list"><div>${art("management-check.svg", "", 28, 28)}<dt>정기 확인</dt><dd>안부와 생활 속 불편 확인</dd></div><div>${art("management-contact.png", "", 28, 28)}<dt>문의 접수</dt><dd>전용 채널로 문의·불편 접수</dd></div><div>${art("management-coordinate.svg", "", 28, 28)}<dt>갈등 조율</dt><dd>양측의 의견을 듣고 함께 조율</dd></div></dl></div><div class="process-art management">${art("step-management.png", "집주인과 청년의 생활을 확인하는 한지붕 매니저 정기점검 현장", 866, 574)}<span class="art-label inspection">매니저 정기점검</span></div></article>
      </div></div></section>
      <section class="host-operations" id="operations" aria-labelledby="operations-title"><div class="operations-art" aria-hidden="true">${art("operations-house.png", "", 1658, 877)}</div><div class="host-container operations-content"><div class="operations-heading"><p class="host-kicker">한지붕 운영 현황</p><h2 id="operations-title">노원구 공릉동에서 시작해,<br>현재 <span>55가구</span>를 관리하고 있습니다.</h2><p>방 준비부터 청년 입주, 거주 중 관리까지 함께합니다.</p></div><div class="operations-line" aria-hidden="true">${art("operations-line.svg", "", 134, 82)}</div><div class="household-stat"><div><strong>55</strong><span>가구 관리 중</span></div><small>2026.09 기준</small></div><div class="review-grid">${reviews.map(([title, body, name, age]) => `<figure class="host-review"><blockquote><h3>“${title}”</h3><p>${body}</p></blockquote><figcaption><strong>${name}</strong><span>${age} 집주인</span></figcaption></figure>`).join("")}</div></div></section>
      <section class="host-consultation" aria-labelledby="consultation-title"><div class="host-container"><p>한지붕에 방을 등록하면</p><h2 id="consultation-title"><span>1:1 전담 매니저가</span><br>노하우를 안내해 드립니다</h2><a class="consultation-link" href="/rooms/register/">+ 방 등록하기</a></div></section>
      ${rentFaqSection()}
    </div>
    <footer class="host-footer"><div class="host-container"><div class="footer-contact"><div><a href="${site.emailHref}">E-mail : ${site.email}</a><a href="${site.phoneHref}">Tel : ${site.phone}</a></div><p>© 2026 hanjibung. All rights reserved.</p></div><p class="footer-legal">${site.legalType} · 고유번호 ${site.registrationNumber} · 대표 ${site.representative}</p><p class="footer-legal">${site.address} <a href="/reservation/privacy/">개인정보 처리방침</a></p></div></footer>
    ${incomeCalculator()}</div>`;
}
