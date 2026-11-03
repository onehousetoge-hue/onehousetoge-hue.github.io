import { site } from "../config/site.mjs";
import { callbackForm } from "./callback-form.mjs";

const choices = (name, values, required = true) => values.map((value) => `<label class="choice"><input type="radio" name="${name}" value="${value}"${required ? " required" : ""}><span>${value}</span></label>`).join("");

export function reservationPage() {
  return `<div class="reservation-app">
    <header class="reservation-header"><div class="reservation-header-inner"><a class="reservation-brand" href="/" aria-label="한지붕 홈">한지붕</a><span class="reservation-header-label">방 등록</span><a class="reservation-about" href="/">홈으로 <span aria-hidden="true">→</span></a></div></header>
    <div class="reservation-layout">
      <section class="reservation-intro" aria-labelledby="reservation-title"><div class="reservation-intro-copy"><p class="reservation-kicker">예상 월세 무료 진단</p><h1 id="reservation-title">얼마나 받을 수 있을까요?</h1><p class="reservation-description">집 위치와 방 정보를 남겨주세요. <br>한지붕 매니저가 예상 월세와 준비사항을 안내해 드립니다.</p></div>${callbackForm()}<img class="reservation-illustration" src="/assets/figma/hero-floorplan.png" alt="남는 방 한 칸이 있는 우리 집 평면도" width="837" height="730" decoding="async"></section>
      <section class="reservation-card" aria-labelledby="diagnosis-title"><div class="reservation-card-heading"><div><h2 id="diagnosis-title" tabindex="-1">방 정보 입력</h2><p id="diagnosis-description">입력하신 내용은 월세 진단과 상담 연락에 사용합니다.</p></div><span class="required-guide"><span aria-hidden="true">*</span> 필수 입력</span></div>
        <form class="inquiry-form"><p class="prefill-notice" data-prefill-notice hidden>계산기에 입력하신 내용을 미리 채웠어요. 확인 후 나머지 정보를 입력해 주세요.</p><div class="setup-notice" role="status" hidden><p>신청 접수 연결을 확인하고 있어요. 잠시 후 다시 확인해 주세요.</p><button type="button" data-retry-connection>연결 다시 확인</button></div><fieldset class="form-fields"><legend class="sr-only">무료 월세 진단 신청 정보</legend>
          <section class="form-section" aria-labelledby="room-information-title"><div class="form-section-heading"><span aria-hidden="true">01</span><h3 id="room-information-title">집 위치와 방 정보</h3></div><div class="form-section-fields">
            <fieldset class="form-row"><legend>인근 시설 <span class="required">*</span></legend><div class="field-control"><div class="choices">${choices("areaType", ["대학교", "지하철역"])}</div><label class="sr-only" for="area">집 주변 대학교 또는 지하철역</label><input id="area" name="area" placeholder="대학교 또는 지하철역 이름" maxlength="100" required></div></fieldset>
            <fieldset class="form-row"><legend>방 유형</legend><div class="field-control"><div class="choices home-type-choices">${choices("homeType", ["원룸", "투룸 +", "단독 주택", "아파트"], false)}</div></div></fieldset>
            <div class="field form-row"><label for="location">집 위치 <span class="required">*</span></label><div class="field-control"><input id="location" name="location" placeholder="예: 서울 노원구 공릉동" maxlength="150" required aria-describedby="location-help"><span class="help" id="location-help">시·구·동까지만 적어주세요. 상세 주소는 필요 없어요.</span></div></div>
            <fieldset class="form-row"><legend>남는 방 개수 <span class="required">*</span></legend><div class="field-control"><div class="choices">${choices("rooms", ["1개", "2개", "3개 이상"])}</div></div></fieldset>
            <fieldset class="form-row"><legend>방 안 에어컨 <span class="required">*</span></legend><div class="field-control"><div class="choices">${choices("aircon", ["있음", "없음"])}</div></div></fieldset>
            <fieldset class="form-row"><legend>주택 형태 <span class="required">*</span></legend><div class="field-control"><div class="choices">${choices("tenure", ["자가", "전세·월세"])}</div></div></fieldset>
          </div></section>
          <section class="form-section" aria-labelledby="room-contact-title"><div class="form-section-heading"><span aria-hidden="true">02</span><h3 id="room-contact-title">월세 결과 받을 연락처</h3></div><div class="field form-row"><label for="phone">휴대폰 번호 <span class="required">*</span></label><div class="field-control"><input id="phone" name="phone" autocomplete="tel" type="tel" inputmode="tel" placeholder="010-0000-0000" maxlength="15" required><span class="help">진단 결과를 안내받으실 번호를 입력해 주세요.</span></div></div><div class="consent-area"><div class="consent"><label><input type="checkbox" name="consent" required><span>개인정보 수집·이용 동의 <strong>(필수)</strong></span></label><button type="button" class="privacy-toggle" aria-expanded="false" aria-controls="diagnosis-privacy">내용 보기</button></div><div class="privacy" id="diagnosis-privacy" hidden><strong>개인정보 수집·이용 안내</strong><p>수집 주체: 한지붕<br>목적: 남는 방 진단 및 상담 연락<br>항목: 집 위치(시·구·동), 인근 대학교·역, 방 정보, 연락처<br>보유 기간: 상담 완료 후 90일 이내 파기<br>동의를 거부할 수 있으며, 거부 시 진단 신청이 어렵습니다.</p><p><a href="/privacy/">개인정보 처리방침</a></p></div></div></section>
        </fieldset><div class="reservation-actions"><p class="error" role="alert" hidden></p><button class="primary submit" type="submit" disabled>신청 접수 준비 중</button><p class="submit-note" role="status" aria-live="polite">매니저가 확인 후 안내하는 진단 서비스입니다.</p></div></form>
        <div class="success" hidden><span class="success-mark" aria-hidden="true">✓</span><h3 tabindex="-1">신청해 주셔서 감사합니다</h3><p>보내주신 방 정보를 확인한 후<br>남겨주신 연락처로 안내해 드릴게요.</p><a class="primary" href="/">한지붕 홈으로</a></div>
      </section>
    </div>
    <footer class="reservation-footer"><div><a href="/">한지붕</a><a href="/privacy/">개인정보 처리방침</a><a href="${site.phoneHref}">문의 ${site.phone}</a></div><p>© 2026 hanjibung. All rights reserved.</p></footer>
  </div>`;
}
