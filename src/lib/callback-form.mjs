import { inquiries } from "../config/inquiries.mjs";
import { escapeHtml } from "./template.mjs";
import { callbackScriptUrl } from "./static-assets.mjs";

export function callbackForm() {
  return `<div class="consultation-action">
    <a class="consultation-trigger" href="/reservation/?consultation=quick" data-open-callback aria-haspopup="dialog" aria-controls="callback-dialog" aria-label="사진 없이 10초만에 상담"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5h16v11H10l-5 3v-3H4z"/><path d="M8 9.5h8M8 12.5h5"/></svg><span><strong><em>사진 없이</em>10초만에 상담</strong><small>궁금한 점부터 편하게 물어보세요</small></span><span class="consultation-trigger-arrow" aria-hidden="true">↗</span></a>
    <dialog class="callback-dialog" id="callback-dialog" data-callback-dialog aria-labelledby="callback-dialog-title" aria-describedby="callback-dialog-description">
      <div class="callback-dialog-head"><span class="callback-eyebrow">사진 없이 간단하게</span><button class="callback-close" type="button" data-close-callback aria-label="상담 신청 창 닫기">×</button><h2 id="callback-dialog-title" tabindex="-1">10초 만에 상담 신청</h2><p id="callback-dialog-description">이름과 연락처, 궁금한 점만 남겨주세요.<br>한지붕 매니저가 확인 후 연락드립니다.</p></div>
      <div class="callback-dialog-body"><form class="callback-form" data-callback-form data-endpoint="${escapeHtml(inquiries.endpoint)}" data-consent-version="${escapeHtml(inquiries.consentVersion)}" novalidate>
        <fieldset disabled><legend class="sr-only">사진 없는 빈방 활용 상담 신청</legend>
          <div class="callback-field"><label for="callback-name">이름 <span>(필수)</span></label><input id="callback-name" name="name" autocomplete="name" maxlength="60" required></div>
          <div class="callback-field"><label for="callback-contact">연락받을 전화번호 <span>(필수)</span></label><input id="callback-contact" name="contact" type="tel" inputmode="tel" autocomplete="tel" maxlength="20" placeholder="010-0000-0000" required></div>
          <div class="callback-field"><label for="callback-message">궁금한 점 <span>(필수, 5자 이상)</span></label><textarea id="callback-message" name="message" rows="3" minlength="5" maxlength="1000" placeholder="예: 부모님 집의 남는 방을 활용할 수 있을지 궁금해요." required></textarea><p>상세 주소·민감정보는 적지 마세요.</p></div>
          <div hidden aria-hidden="true"><label>자동입력 방지<input name="website" tabindex="-1" autocomplete="off"></label></div>
          <details class="callback-privacy"><summary>개인정보 수집·이용 안내</summary><p>수집 주체: 한지붕. 항목: 이름, 전화번호, 문의유형, 문의내용과 동의·접수 기록. 목적: 문의 확인과 상담 답변. 보유기간: 상담 종료일로부터 최대 1년간 보관 후 삭제. 동의를 거부할 수 있으며, 거부하면 온라인 상담을 접수할 수 없습니다. <a href="/privacy/">개인정보 처리방침</a></p></details>
          <label class="callback-consent"><input name="consent" type="checkbox" required><span>[필수] 개인정보 수집·이용에 동의합니다.</span></label>
          <p class="callback-status" data-callback-status role="status" aria-live="polite" tabindex="-1"></p><button class="callback-submit" type="submit">무료상담 신청하기 <span aria-hidden="true">→</span></button>
        </fieldset>
      </form><div class="callback-success" data-callback-success hidden><span aria-hidden="true">✓</span><h3 tabindex="-1">상담 신청이 접수됐어요</h3><p>남겨주신 번호로 안내드릴게요.</p><p class="callback-receipt" data-callback-receipt></p><button type="button" data-close-callback>창 닫기</button></div><noscript><p>온라인 신청에는 자바스크립트가 필요합니다. <a href="tel:+821045879428">전화 문의</a>를 이용해 주세요.</p></noscript></div>
    </dialog><script type="module" src="${callbackScriptUrl}"></script>
  </div>`;
}
