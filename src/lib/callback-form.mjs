import { inquiries } from "../config/inquiries.mjs";
import { escapeHtml } from "./template.mjs";
import { callbackScriptUrl } from "./static-assets.mjs";

export function callbackForm() {
  return `<aside class="consultation-rail" aria-label="사진 없이 먼저 상담">
    <details class="consultation-panel" open>
      <summary>사진 없이 먼저 상담 신청<span class="consultation-chevron" aria-hidden="true"></span></summary>
      <div class="consultation-panel-body">
        <p class="consultation-intro">방 사진이 아직 없어도 괜찮아요. 궁금한 점을 먼저 남기면 매니저가 연락드립니다.</p>
        <form class="callback-form" data-callback-form data-endpoint="${escapeHtml(inquiries.endpoint)}" data-consent-version="${escapeHtml(inquiries.consentVersion)}" novalidate>
          <fieldset disabled><legend class="sr-only">사진 없는 빈방 활용 상담 신청</legend>
            <div class="quick-field"><label for="callback-name">이름 <span>(필수)</span></label><input id="callback-name" name="name" autocomplete="name" maxlength="60" required></div>
            <div class="quick-field"><label for="callback-contact">연락받을 전화번호 <span>(필수)</span></label><input id="callback-contact" name="contact" type="tel" inputmode="tel" autocomplete="tel" maxlength="20" placeholder="010-0000-0000" required></div>
            <div class="quick-field"><label for="callback-message">궁금한 점 <span>(필수, 5자 이상)</span></label><textarea id="callback-message" name="message" rows="2" minlength="5" maxlength="1000" placeholder="예: 부모님 집의 남는 방을 활용할 수 있을지 궁금해요." required></textarea><p class="quick-field-hint">상세 주소·민감정보는 적지 마세요.</p></div>
            <div hidden aria-hidden="true"><label>자동입력 방지<input name="website" tabindex="-1" autocomplete="off"></label></div>
            <details class="quick-privacy"><summary>개인정보 수집·이용 안내</summary><p>수집 주체: 한지붕. 항목: 이름, 전화번호, 문의유형, 문의내용과 동의·접수 기록. 목적: 문의 확인과 상담 답변. 보유기간: 상담 종료일로부터 최대 1년간 보관 후 삭제. 동의를 거부할 수 있으며, 거부하면 온라인 상담을 접수할 수 없습니다. <a href="/privacy/">개인정보 처리방침</a></p></details>
            <label class="quick-consent"><input name="consent" type="checkbox" required><span>[필수] 개인정보 수집·이용에 동의합니다.</span></label>
            <p class="quick-status" data-callback-status role="status" aria-live="polite" tabindex="-1"></p><button class="quick-submit" type="submit">무료상담 신청하기 <span aria-hidden="true">→</span></button>
          </fieldset>
        </form>
        <noscript><p>온라인 신청에는 자바스크립트가 필요합니다. <a href="tel:+821045879428">전화 문의</a>를 이용해 주세요.</p></noscript>
      </div>
    </details>
    <script type="module" src="${callbackScriptUrl}"></script>
  </aside>`;
}
