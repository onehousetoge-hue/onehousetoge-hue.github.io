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
          <h1 id="about-title">MBC가 만난<br><em>어르신과 대학생</em></h1>
          <p class="about-lead">빈방을 내어준 어르신과 대학생은 한집에서 어떻게 지낼까요? MBC 뉴스데스크가 두 세대의 일상을 담았습니다. 김현수 대표도 방송에서 집주인과 학생이 서로의 신원을 확인하는 이유를 이야기합니다.</p>
        </div>
        <a class="about-broadcast" href="https://www.youtube.com/watch?v=DdCxyz9kNs4" aria-label="MBC 뉴스데스크 현장 36.5 보도 영상 보기 (유튜브)">
          <img src="https://i.ytimg.com/vi/DdCxyz9kNs4/maxresdefault.jpg" srcset="https://i.ytimg.com/vi/DdCxyz9kNs4/mqdefault.jpg 320w, https://i.ytimg.com/vi/DdCxyz9kNs4/maxresdefault.jpg 1280w" sizes="(max-width: 800px) min(660px, calc(100vw - 40px)), (max-width: 1144px) 49vw, 550px" width="1280" height="720" alt="" referrerpolicy="no-referrer" fetchpriority="high" decoding="async">
          <span class="about-broadcast-caption"><span><strong>MBC 뉴스데스크 · 현장 36.5</strong><time datetime="2026-09-12">2026년 9월 12일 방송</time></span><span class="about-watch">영상 보기</span></span>
        </a>
      </div>
    </section>

    <section class="about-wrap about-record" aria-labelledby="about-record-title">
      <div class="about-record-copy">
        <p class="about-kicker">서울 노원구 공릉동</p>
        <h2 id="about-record-title">살던 집의 빈방을<br>대학생의 방으로</h2>
        <p>한지붕은 공릉동에서 시작한 비영리단체입니다. 집주인은 익숙한 동네에서 지내며 빈방으로 월세를 받고, 대학생은 학교 근처에 자기 방을 마련합니다. 한지붕 매니저는 두 사람이 만나기 전부터 방을 살피고 입주 후 생활까지 함께 조율합니다.</p>
      </div>
      <div class="about-metric">
        <p class="about-metric-label">한지붕이 관리하는 가구</p>
        <p class="about-metric-value"><strong>55</strong>가구</p>
        <p class="about-metric-date"><time datetime="2026-09">2026년 9월</time> 기준</p>
      </div>
      <dl class="about-history">
        <div><dt><time datetime="2026-07-05">2026. 7. 5.</time></dt><dd>한지붕 창립총회</dd></div>
        <div><dt><time datetime="2026-07-09">2026. 7. 9.</time></dt><dd>단체 고유번호 발급</dd></div>
      </dl>
    </section>

    <section class="about-support" id="goals" aria-labelledby="about-support-title">
      <div class="about-wrap about-support-layout">
        <div class="about-support-copy">
          <h2 id="about-support-title">한집에서<br>어떻게 지낼까요?</h2>
          <figure class="about-model"><img src="/assets/about-home-640.webp" srcset="/assets/about-home-640.webp 640w, /assets/about-home-800.webp 800w" sizes="(max-width: 800px) min(340px, 100vw - 40px), 370px" width="1200" height="675" alt="양쪽 개인 방 사이에 식탁과 주방이 놓인 집 모형" loading="lazy" decoding="async"><figcaption>개인 방과 공용 주방 배치 예시</figcaption></figure>
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
