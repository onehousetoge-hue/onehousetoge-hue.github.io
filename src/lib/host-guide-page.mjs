import { reservationFooter } from "./reservation-page.mjs";
import { icon } from "./template.mjs";

export function hostGuidePage() {
  return `<div class="host-guide">
    <section class="guide-cover" aria-labelledby="guide-title">
      <div class="guide-wrap guide-cover-inner">
        <div class="guide-intro">
          <p class="guide-kicker">한지붕 활용 방법</p>
          <h1 id="guide-title">우리 집에 <br>빈 방이 있나요?</h1>
          <p class="guide-lead"><strong>창고처럼 쓰는 방이 있나요?</strong> 짐을 넣어 두던 방 한 칸을 대학생에게 내어주고, 매달 월세 수입을 만들어 보세요.</p>
          <a class="guide-button" href="/reservation/">우리 집 빈 방 예상 월세 알아보기 ${icon("arrow")}</a>
        </div>
        <div class="guide-room-photos">
          <figure><img src="/assets/host/process-before.webp" alt="장롱 옆에 짐과 상자를 쌓아 둔 방" width="768" height="1024" decoding="async"><figcaption>정리 전</figcaption></figure>
          <figure><img src="/assets/host/process-after.webp" alt="창가에 침대와 책상을 놓아 학생을 맞을 준비가 된 방" width="1024" height="768" decoding="async"><figcaption>입주 준비 후</figcaption></figure>
        </div>
      </div>
    </section>
    <section class="guide-wrap guide-process" aria-labelledby="guide-process-title">
      <h2 id="guide-process-title">방을 등록하면 <br>어떻게 진행되나요?</h2>
      <ol class="guide-steps" role="list">
        <li><h3>방 등록하기</h3><p>방이 있는 동네와 방 상태, 입주 가능한 시기를 알려주세요. 매니저와 함께 정리나 가구 준비가 필요한지도 살펴봐요.</p></li>
        <li><h3>학생 소개서 받아보기</h3><p>우리 집 조건에 맞는 학생의 소개서를 받아보세요. 학생이 다니는 학교와 희망 거주 기간, 평소 귀가 시간 같은 생활습관을 미리 살펴볼 수 있어요.</p></li>
        <li><h3>집주인이 최종 결정하기</h3><p>마음에 드는 학생과 직접 이야기하고, 함께 살지 결정하세요. 생활 방식이 맞지 않으면 매니저에게 다른 학생을 소개해 달라고 할 수 있어요.</p></li>
      </ol>
      <a class="guide-register" href="/rooms/register/">방 등록하기 ${icon("arrow")}</a>
    </section>
    ${reservationFooter()}
  </div>`;
}
