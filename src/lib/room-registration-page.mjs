import { inquiries } from "../config/inquiries.mjs";
import { site } from "../config/site.mjs";
import { requiredFields, roomFields } from "../assets/room-description.js";
import { icon } from "./template.mjs";
import { headlineExperiment, registrationScriptUrl } from "./static-assets.mjs";
import { reservationFooter } from "./reservation-page.mjs";

const fields = [
  ["location", "예: 서울 노원구 공릉동", 45], ["rooms", "예: 1개", 10],
  ["availability", "예: 다음 달 초, 일정 협의", 35], ["rent", "예: 40만 원", 25],
  ["deposit", "예: 100만 원", 25], ["fee", "예: 3만 원", 25],
  ["homeType", "예: 아파트", 20], ["area", "예: 6평", 20], ["floor", "예: 2층", 12],
];
function editor([name, placeholder, length]) {
  return `<label>${roomFields[name]}<input name="${name}" maxlength="${length}" placeholder="${placeholder}"${requiredFields.includes(name) ? " required" : ""}></label>`;
}
export function roomRegistrationPage() {
  return `<div class="room-registration">${headlineExperiment}<div class="rr-wrap">
    <header class="rr-intro"><div><h1>우리 집 빈방 <strong>등록하기</strong></h1><p>학생을 맞이할 방을 소개해 주세요.<br>한지붕 매니저가 확인한 뒤 연락드려요.</p></div>
      <figure class="rr-room-photo"><img src="/assets/host/process-after.webp" width="1024" height="768" alt="창가에 책상과 침대를 놓은 방" decoding="async"><figcaption>입주를 준비한 방</figcaption></figure></header>
    <form class="rr-card" novalidate data-callback-form data-room-registration data-intake="registration" data-endpoint="${inquiries.endpoint}" data-assistant="${inquiries.roomAssistant}" data-consent-version="${inquiries.registrationVersion}">
      <ol class="rr-steps" aria-label="방 등록 진행 단계"><li aria-current="step"><span>1</span>방 이야기</li><li><span>2</span>조건·사진</li><li><span>3</span>주소·연락처</li></ol>
      <fieldset disabled><legend class="sr-only">방 등록 신청</legend>
        <fieldset class="rr-panel rr-chat" data-panel="chat"><legend class="sr-only">방 이야기</legend>
          <div class="rr-heading"><div class="rr-guide"><span class="rr-avatar">${icon("home")}</span><h2 tabindex="-1">한지붕 AI 도우미</h2></div><button type="button" class="rr-text" data-edit>직접 입력</button></div>
          <div class="rr-thread"><button type="button" class="rr-history" aria-controls="rr-history-log" aria-expanded="false" hidden>이전 대화 보기</button>
            <div class="rr-log" id="rr-history-log" role="log" aria-label="방 등록 대화" aria-live="polite" aria-relevant="additions" tabindex="0"><p class="rr-bot">방이 있는 동네, 남는 방 개수, 입주할 수 있는 시기를 알려주세요. 정해진 것부터 편하게 이야기해 주세요.</p></div>
            <div class="rr-choices" aria-label="빠른 답변"></div></div>
          <div class="rr-composer"><label class="sr-only" for="room-chat-line">AI에게 방 설명 보내기</label><textarea id="room-chat-line" rows="2" maxlength="500" placeholder="예: 공릉동에 방 한 칸, 다음 달부터 가능해요."></textarea><div class="rr-compose-actions"><span class="rr-progress" data-room-progress>필수 조건 0/3</span><button type="button" class="rr-text" data-cancel-correction hidden>수정 취소</button><button type="button" class="rr-send" data-send aria-label="AI로 보내기">보내기 ${icon("arrow")}</button></div></div>
          <div class="rr-chat-summary" data-chat-summary hidden><div class="rr-summary-heading"><h3>지금까지 정리한 조건</h3><button type="button" class="rr-text" data-chat-undo hidden>방금 입력 되돌리기</button></div><div class="rr-chat-facts" data-chat-facts></div></div>
          <button type="button" class="rr-primary" data-chat-next hidden>방 조건과 사진 확인하기 ${icon("arrow")}</button>
        </fieldset>
        <fieldset class="rr-panel" data-panel="details" hidden disabled><legend class="sr-only">방 조건과 사진</legend>
          <div class="rr-heading"><h2 tabindex="-1">방 조건을 확인해 주세요</h2><button type="button" class="rr-text" data-chat-back>대화로 돌아가기</button></div>
          <dl class="rr-facts" data-facts></dl>
          <details class="rr-editor"><summary>방 조건 입력·수정</summary><div class="rr-editor-fields"><h3>필수 방 정보</h3><div class="rr-edit-grid">${fields.filter(([name]) => requiredFields.includes(name)).map(editor).join("")}</div><h3>추가 조건 <small>선택</small></h3><div class="rr-edit-grid">${fields.filter(([name]) => !requiredFields.includes(name)).map(editor).join("")}</div></div></details>
          <div class="rr-photo"><label class="rr-photo-label" for="rr-photo">방 사진 한 장 <small>선택</small></label><p id="rr-photo-hint">방 안이 잘 보이는 사진을 골라주세요.</p><input id="rr-photo" type="file" accept="image/jpeg,image/png,image/webp" aria-describedby="rr-photo-hint"><div data-photo-preview hidden><img alt="첨부할 방 사진"><button type="button" class="rr-text" data-remove-photo>사진 빼기</button></div></div>
          <button type="button" class="rr-primary" data-review>주소·연락처 입력하기 ${icon("arrow")}</button>
        </fieldset>
        <fieldset class="rr-panel rr-contact" data-panel="contact" hidden disabled><legend class="sr-only">주소와 연락처</legend>
          <div class="rr-heading"><h2 tabindex="-1">방문 주소와 연락처</h2><button type="button" class="rr-text" data-back>조건 다시 보기</button></div>
          <p class="rr-explain">매니저가 등록 내용을 확인하고 방문 일정을 상의할 때 사용해요.</p>
          <details class="rr-final-summary"><summary>등록할 방 정보</summary><dl class="rr-facts" data-final-facts></dl></details>
          <div class="rr-contact-grid">
            <label class="rr-address">방문할 상세주소<input name="address" autocomplete="street-address" maxlength="180" aria-describedby="rr-address-hint" required><small id="rr-address-hint">도로명과 건물번호 또는 지번을 적어주세요. 동·호수가 있으면 함께 적어주세요.</small></label>
            <label>이름<input name="name" autocomplete="name" maxlength="60" required></label><label>연락받을 전화번호<input name="contact" type="tel" autocomplete="tel" inputmode="tel" maxlength="20" placeholder="010-0000-0000" required></label>
          </div>
          <div hidden><label>자동입력 방지<input name="website" autocomplete="off" tabindex="-1"></label></div>
          <details class="rr-privacy"><summary>${icon("shield")} 개인정보 수집·이용 안내</summary><p>한지붕은 방 등록 확인과 방문 일정 조율을 위해 이름, 전화번호, 방문할 상세주소, 동네, 방 개수, 입주 시기, 선택한 방 조건·사진과 동의 기록을 받습니다. 상담 종료일로부터 최대 1년간 보관한 뒤 삭제합니다. 필수 동의를 거부하면 온라인 신청이 어렵습니다. <a href="/reservation/privacy/">개인정보 처리방침</a></p></details>
          <label class="rr-consent"><input name="consent" type="checkbox" required> [필수] 개인정보 수집·이용에 동의합니다.</label>
          <button class="rr-primary" type="submit">방 등록 신청하기 ${icon("arrow")}</button>
        </fieldset>
        <div class="rr-secondary" data-draft-tools hidden><button type="button" class="rr-text" data-save>기기에 임시저장</button><button type="button" class="rr-text" data-erase hidden>임시저장 삭제</button></div>
        <p class="rr-status" role="status" data-status aria-live="polite" tabindex="-1"></p>
      </fieldset>
    </form>
    <section class="rr-done rr-card" data-success hidden><span class="rr-avatar">${icon("check")}</span><h2 tabindex="-1">방 등록 신청을 받았습니다</h2><p>한지붕 매니저가 남겨 주신 번호로 연락드릴게요.</p><p data-receipt></p><a href="/">한지붕 홈으로</a></section>
    <noscript><p>온라인 신청에는 자바스크립트가 필요합니다. <a href="${site.phoneHref}">전화로 방 등록 문의하기</a></p></noscript>
  </div>${reservationFooter()}<script type="module" src="${registrationScriptUrl}"></script></div>`;
}
