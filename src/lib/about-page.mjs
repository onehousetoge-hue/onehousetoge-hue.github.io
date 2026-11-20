import { reservationFooter } from "./reservation-page.mjs";

const benefits = [
  ["benefit-income.svg", "빈방으로 생활소득", "사용하지 않던 방을 청년의 주거 공간으로 활용해, 생활비에 보탬이 되는 월세를 받아보세요."],
  ["benefit-youth.svg", "서로 맞는 청년과 함께", "청년의 신원과 생활습관을 미리 확인하고, 입주 전 함께 지킬 생활 규칙을 정합니다."],
  ["benefit-chores.svg", "식사·빨래 부담 없이", "청년의 식사나 빨래를 챙겨줄 필요 없이, 각자의 생활을 존중하며 함께 지냅니다."],
  ["benefit-manager.svg", "거주 중에도 함께 관리", "함께 살며 불편이나 갈등이 생기면, 한지붕이 중간에서 함께 조율합니다."],
];

export function aboutPage() {
  return `<div class="service-about">
    <section class="about-intro"><div class="about-copy"><h1>한지붕 소개</h1>
      <p>남는 방이 있는 집주인과 살 곳을 찾는 대학생이 한집에서 각자의 일상을 이어갈 수 있도록 돕습니다.</p>
      <a class="service-action" href="/consultation/">상담 신청하기 <span aria-hidden="true">→</span></a>
    </div><img src="/assets/figma/step-management.png" width="866" height="574" alt="집주인과 학생이 지내는 집을 방문한 한지붕 매니저" decoding="async"></section>
    <section class="about-benefits" id="goals"><h2>한지붕이 함께하는 일</h2><div class="about-benefit-grid">${benefits.map(([file, title, text]) => `<article><img src="/assets/figma/${file}" width="52" height="52" alt="" loading="lazy"><div><h3>${title}</h3><p>${text}</p></div></article>`).join("")}</div></section>
    <section class="about-local"><h2>서울 노원구 공릉동에서 시작했습니다</h2><p>한지붕은 2026년 9월 기준 55가구를 관리하고 있습니다. 우리 동네에서도 방문 지원이 가능한지 궁금하시면 상담 신청에 동네 이름을 남겨 주세요.</p><a href="/#rent-faq">집주인이 자주 묻는 질문 보기 <span aria-hidden="true">→</span></a></section>
    ${reservationFooter()}</div>`;
}
