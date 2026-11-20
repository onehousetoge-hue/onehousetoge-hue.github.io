import { inquiries } from "../config/inquiries.mjs";
import { site } from "../config/site.mjs";
import { roomFields } from "../assets/room-description.js";
import { headlineExperiment, registrationScriptUrl } from "./static-assets.mjs";
import { reservationFooter } from "./reservation-page.mjs";

const fields = [
  ["location", "예: 서울 노원구 공릉동", 45], ["rooms", "예: 1개", 10],
  ["availability", "예: 다음 달 초, 일정 협의", 35], ["rent", "예: 40만 원", 25],
  ["deposit", "예: 100만 원", 25], ["fee", "예: 3만 원", 25],
  ["homeType", "예: 아파트", 20], ["area", "예: 6평", 20], ["floor", "예: 2층", 12],
];
function editor([name, placeholder, length], index) {
  return `<label>${roomFields[name]}<input name="${name}" maxlength="${length}" placeholder="${placeholder}"${index < 3 ? " required" : ""}></label>`;
}
export function roomRegistrationPage() {
  return `<div class="room-registration">${headlineExperiment}<div class="rr-wrap">
    <header class="rr-intro"><h1>방 등록하기</h1><p>학생에게 내어줄 방을 편하게 설명해 주세요. 한지붕 매니저가 등록 내용을 확인하고 연락드립니다.</p></header>
    <form data-callback-form data-room-registration data-intake="registration" data-endpoint="${inquiries.endpoint}" data-consent-version="${inquiries.registrationVersion}">
      <fieldset disabled><legend class="sr-only">방 등록 신청</legend>
        <div class="rr-workspace"><section class="rr-chat rr-card" aria-labelledby="rr-chat-title">
          <header class="rr-card-head"><h2 id="rr-chat-title">방 등록 도우미</h2><button type="button" class="rr-text" data-edit>직접 입력</button></header>
          <div class="rr-chat-body"><div class="rr-log" role="log" aria-label="방 등록 대화" aria-live="polite" aria-relevant="additions" tabindex="0"><p class="rr-bot">어느 동네에 방이 몇 개 비어 있나요? 입주할 수 있는 시기도 함께 알려주세요.</p></div>
          <div class="rr-choices" aria-label="빠른 답변"></div>
          <label class="sr-only" for="room-chat-line">방 설명 또는 수정할 내용</label><textarea id="room-chat-line" rows="3" maxlength="500" placeholder="예: 공릉동에 방 한 칸 있어요. 다음 달부터 입주할 수 있고 월세는 40만 원이에요."></textarea>
          <div class="rr-composer-foot"><small>상세주소와 연락처는 대화에서 빼주세요.</small><button type="button" class="rr-send" data-send>보내기</button></div></div>
        </section>
        <section class="rr-summary rr-card" aria-labelledby="rr-summary-title"><header class="rr-card-head"><h2 id="rr-summary-title">등록 내용 미리보기</h2><span class="rr-stage" data-progress>필수 0/3</span></header>
          <div class="rr-summary-body"><dl class="rr-facts" data-facts></dl>
          <details class="rr-editor"><summary>내용 직접 수정</summary><div class="rr-edit-grid">${fields.map(editor).join("")}</div></details>
          <div class="rr-photo"><label class="rr-photo-label" for="rr-photo">방 사진 한 장 <small>선택</small></label><input id="rr-photo" type="file" accept="image/jpeg,image/png,image/webp"><p>얼굴이나 주소가 보이지 않는 방 사진을 골라 주세요.</p><div data-photo-preview hidden><img alt="첨부할 방 사진"><button type="button" class="rr-text" data-remove-photo>사진 빼기</button></div></div>
          <div class="rr-secondary"><button type="button" class="rr-text" data-save>기기에 임시저장</button><button type="button" class="rr-text" data-erase hidden>임시저장 삭제</button></div>
          <button type="button" class="rr-primary" data-review>이 내용으로 다음 단계 <span aria-hidden="true">→</span></button></div>
        </section></div>
        <section class="rr-contact rr-card" aria-labelledby="rr-contact-title" hidden><header class="rr-card-head"><h2 id="rr-contact-title" tabindex="-1">연락받을 분</h2><button type="button" class="rr-text" data-back>방 정보 수정</button></header>
          <fieldset disabled><legend class="sr-only">연락처와 신청 확인</legend>
            <dl class="rr-facts" data-review-facts></dl><div class="rr-contact-grid"><label>이름<input name="name" autocomplete="name" maxlength="60" required></label><label>연락받을 전화번호<input name="contact" type="tel" autocomplete="tel" inputmode="tel" maxlength="20" placeholder="010-0000-0000" required></label></div>
            <div hidden><label>자동입력 방지<input name="website" autocomplete="off" tabindex="-1"></label></div>
            <details class="rr-privacy"><summary>개인정보 수집·이용 안내</summary><p>한지붕은 방 등록 및 연락을 위해 이름, 전화번호, 동네, 방 개수, 입주 시기, 선택한 방 조건·사진과 동의 기록을 받습니다. 상담 종료일로부터 최대 1년간 보관한 뒤 삭제합니다. 필수 동의를 거부하면 온라인 신청이 어렵습니다. <a href="/reservation/privacy/">개인정보 처리방침</a></p></details>
            <label class="rr-consent"><input name="consent" type="checkbox" required> [필수] 개인정보 수집·이용에 동의합니다.</label>
            <button class="rr-primary" type="submit">방 등록 신청하기</button>
          </fieldset></section>
        <p class="rr-status" role="status" data-status aria-live="polite" tabindex="-1"></p>
      </fieldset>
    </form>
    <section class="rr-done rr-card" data-success hidden><h2 tabindex="-1">방 등록 신청을 받았습니다</h2><p>한지붕 매니저가 남겨 주신 번호로 연락드립니다.</p><p data-receipt></p><a href="/">한지붕 홈으로</a></section>
    <noscript><p>온라인 신청에는 자바스크립트가 필요합니다. <a href="${site.phoneHref}">전화로 방 등록 문의하기</a></p></noscript>
  </div>${reservationFooter()}<script type="module" src="${registrationScriptUrl}"></script></div>`;
}
