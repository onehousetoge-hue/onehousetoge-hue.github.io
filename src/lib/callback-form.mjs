import { inquiries } from "../config/inquiries.mjs";
import { site } from "../config/site.mjs";
import { escapeHtml } from "./template.mjs";
import { callbackScriptUrl, headlineExperiment } from "./static-assets.mjs";
import { reservationFooter } from "./reservation-page.mjs";

export function intakePage(registration = false) {
  const title = registration ? "방 등록하기" : "상담 신청하기";
  const action = registration ? "방 등록 신청하기" : "상담 신청하기";
  const success = registration ? "방 등록 신청을 받았습니다" : "상담 신청을 받았습니다";
  const description = registration
    ? "학생에게 내어줄 방의 정보를 남겨 주세요. 매니저가 연락드려 방 상태와 입주 조건을 확인합니다."
    : "빈방을 어떻게 활용할지, 대학생과 함께 지내면 어떨지 궁금한 점을 남겨 주세요. 한지붕 매니저가 연락드립니다.";
  const purpose = registration ? "방 등록 신청 확인과 입주 준비 상담" : "문의 확인과 상담 답변";
  const fields = registration ? "이름, 전화번호, 동네, 남는 방 개수, 입주 가능 시기" : "이름, 전화번호, 궁금한 점";
  return `<div class="reservation-app service-intake">${headlineExperiment}<div class="intake-layout">
    <section class="intake-intro"><h1>${title}</h1><p>${description}</p>
      <img src="/assets/figma/${registration ? "step-preparation.png" : "step-management.png"}" width="${registration ? 634 : 866}" height="${registration ? 488 : 574}" alt="" decoding="async">
      <a class="intake-related" href="/reservation/">예상 월세 먼저 알아보기 <span aria-hidden="true">→</span></a>
    </section>
    <section${registration ? "" : ' id="quick-consultation"'} class="intake-card" aria-labelledby="intake-title"><h2 id="intake-title">${registration ? "등록할 방 정보" : "상담받을 내용"}</h2>
      <form class="callback-form" data-callback-form data-intake="${registration ? "registration" : "consultation"}" data-endpoint="${escapeHtml(inquiries.endpoint)}" data-consent-version="${escapeHtml(inquiries.consentVersion)}">
        <fieldset disabled><legend class="sr-only">${title} 필수 정보</legend>
          ${registration ? `<div class="callback-field intake-full"><label for="room-area">방이 있는 동네</label><input id="room-area" name="location" required maxlength="100" placeholder="예: 서울 노원구 공릉동" aria-describedby="room-area-help"><p id="room-area-help">시·구·동까지만 입력해 주세요.</p></div>
          <div class="callback-field"><label for="room-count">남는 방 개수</label><select id="room-count" name="rooms" required><option value="">선택해 주세요</option><option>1개</option><option>2개</option><option>3개 이상</option></select></div>
          <div class="callback-field"><label for="move-in">입주 가능 시기</label><select id="move-in" name="availability" required><option value="">선택해 주세요</option><option>바로 가능</option><option>1개월 이내</option><option>일정 협의</option></select></div>` : ""}
          <div class="callback-field"><label for="callback-name">이름</label><input id="callback-name" name="name" autocomplete="name" maxlength="60" required></div>
          <div class="callback-field"><label for="callback-contact">연락받을 전화번호</label><input id="callback-contact" name="contact" type="tel" inputmode="tel" autocomplete="tel" maxlength="20" required placeholder="010-0000-0000"></div>
          ${registration ? "" : `<div class="callback-field intake-full"><label for="callback-message">궁금한 점</label><textarea id="callback-message" name="message" rows="4" minlength="5" maxlength="1000" required aria-describedby="message-help" placeholder="예: 부모님 집의 빈방에 학생이 지내려면 무엇을 준비해야 할까요?"></textarea><p id="message-help">상세 주소와 민감정보는 빼고 5자 이상 적어 주세요.</p></div>`}
          <div hidden aria-hidden="true"><label>자동입력 방지<input name="website" tabindex="-1" autocomplete="off"></label></div>
          <details class="callback-privacy"><summary>개인정보 수집·이용 안내</summary><p>한지붕은 다음 목적으로 신청 정보를 수집합니다. ${purpose}. 수집 항목은 ${fields} 및 접수·동의 기록입니다. 상담 종료일로부터 최대 1년간 보관한 뒤 삭제합니다. 필수 동의를 거부하면 온라인 신청이 어렵습니다. <a href="/reservation/privacy/">개인정보 처리방침</a></p></details>
          <label class="callback-consent"><input name="consent" type="checkbox" required><span>[필수] 개인정보 수집·이용에 동의합니다.</span></label>
          <p class="callback-status" data-callback-status role="status" aria-live="polite" tabindex="-1"></p>
          <button class="callback-submit" type="submit">${action} <span aria-hidden="true">→</span></button>
        </fieldset>
      </form>
      <div class="callback-success" data-callback-success hidden><span aria-hidden="true">✓</span><h3 tabindex="-1">${success}</h3><p>남겨 주신 번호로 매니저가 연락드립니다.</p><p class="callback-receipt" data-callback-receipt></p><a href="/">한지붕 홈으로</a></div>
      <noscript><p>온라인 신청에는 자바스크립트가 필요합니다. <a href="${site.phoneHref}">전화로 문의하기</a></p></noscript>
    </section></div>${reservationFooter()}<script type="module" src="${callbackScriptUrl}"></script></div>`;
}
