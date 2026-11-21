import { reservationFooter } from "./reservation-page.mjs";

const benefits = [
  ["benefit-income.svg", "쓰지 않던 방으로 월세를 받아요", "비워 두었던 방을 대학생에게 내어주면 월세가 생활비에 보탬이 될 수 있어요."],
  ["benefit-youth.svg", "함께 살 학생은 집주인이 선택해요", "학생의 신원과 생활습관을 미리 확인하고, 입주 전에 서로 지킬 규칙을 정해요."],
  ["benefit-chores.svg", "식사와 빨래는 각자 챙겨요", "각자의 방에서 지내고, 주방이나 세탁기처럼 함께 쓰는 공간의 이용 방법을 맞춰요."],
  ["benefit-manager.svg", "입주한 뒤에도 매니저와 상의해요", "생활하면서 불편한 점이 생기면 매니저가 집주인과 학생의 이야기를 듣고 조율해요."],
];

export function aboutPage() {
  return `<div class="service-about">
    <section class="about-cover" aria-labelledby="about-title">
      <div class="about-wrap about-cover-layout">
        <div class="about-cover-copy">
          <p class="about-kicker">한지붕 소개</p>
          <h1 id="about-title">우리 집 빈방이<br><em>대학생의 방이 됩니다.</em></h1>
          <p class="about-lead">남는 방이 있는 집주인과 살 곳을 찾는 대학생을 연결합니다. 방 준비부터 입주 후 생활까지 한지붕 매니저가 함께합니다.</p>
          <div class="about-actions">
            <a class="about-button" href="/consultation/">상담 신청하기 <span aria-hidden="true">→</span></a>
            <a class="about-inline" href="#goals">한집살이 알아보기 <span class="about-down" aria-hidden="true">→</span></a>
          </div>
        </div>
        <figure class="about-model">
          <img src="/assets/about-home-640.webp" srcset="/assets/about-home-640.webp 640w, /assets/about-home-800.webp 800w, /assets/about-home-1200.webp 1200w" sizes="(max-width: 800px) min(calc(100vw - 40px), 520px), (max-width: 1144px) 49vw, 550px" width="1200" height="675" alt="양쪽에 개인 방이 있고 가운데에 주방과 식탁이 있는 집 모형" fetchpriority="high" decoding="async">
          <figcaption>각자의 방과 함께 쓰는 주방을 보여주는 공간 예시</figcaption>
        </figure>
      </div>
    </section>

    <section class="about-wrap about-record" aria-labelledby="about-record-title">
      <div class="about-record-copy">
        <p class="about-kicker">서울 노원구</p>
        <h2 id="about-record-title">공릉동에서<br>시작했습니다.</h2>
        <p>동네 주민을 만나 빈방 활용과 대학생과의 공동생활에 대해 상담합니다.</p>
      </div>
      <div class="about-metric">
        <p class="about-metric-label">한지붕이 관리하는 가구</p>
        <p class="about-metric-value"><strong>55</strong>가구</p>
        <p class="about-metric-date"><time datetime="2026-09">2026년 9월</time> 기준</p>
      </div>
      <figure class="about-field">
        <img src="/assets/about-hagye.webp" width="720" height="518" loading="lazy" decoding="async" alt="산책길을 따라 나란히 걸으며 대화하는 두 사람">
        <figcaption>노원구 하계동 · 주민 상담 현장</figcaption>
      </figure>
    </section>

    <section class="about-support" id="goals" aria-labelledby="about-support-title">
      <div class="about-wrap about-support-layout">
        <div class="about-support-copy">
          <h2 id="about-support-title">한집에서<br>어떻게 지낼까요?</h2>
          <a class="about-inline" href="/#rent-faq">집주인이 자주 묻는 질문 <span aria-hidden="true">→</span></a>
        </div>
        <ul class="about-benefit-list">${benefits.map(([file, title, detail]) => `
          <li><img src="/assets/figma/${file}" width="52" height="52" alt="" loading="lazy" decoding="async">
            <div><h3>${title}</h3><p>${detail}</p></div></li>`).join("")}
        </ul>
      </div>
    </section>

    <section class="about-wrap about-next" aria-labelledby="about-next-title">
      <div><h2 id="about-next-title">우리 동네도 방문할 수 있나요?</h2>
        <p>상담 신청에 동네 이름을 남겨주시면 매니저가 방문 가능 여부를 확인해 드립니다.</p></div>
      <a class="about-button" href="/consultation/">상담 신청하기 <span aria-hidden="true">→</span></a>
    </section>
    ${reservationFooter()}
  </div>`;
}
