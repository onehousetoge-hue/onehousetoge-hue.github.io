const icon = (name, size) => `<img src="/assets/figma/calculator/${name}.svg" width="${size}" height="${size}" alt="" aria-hidden="true">`;
const homeTypes = [["studio", "원룸"], ["two-room", "투룸 +"], ["house", "단독 주택"], ["apartment", "아파트"]];

export function incomeCalculator() {
  return `<aside class="income-calculator" data-income-calculator aria-label="우리 집 예상 수입 계산기" hidden>
    <button class="income-launcher" type="button" data-income-open aria-expanded="true" aria-controls="income-panel">빈방 예상 월세 알아보기 <span aria-hidden="true">→</span></button>
    <section class="income-panel" id="income-panel" aria-labelledby="income-title">
      <div class="income-heading"><div class="income-title-row"><h2 id="income-title">예상 수입 계산기</h2><button class="income-close" type="button" data-income-close aria-label="예상 수입 계산기 닫기">${icon("close", 18)}</button></div></div>
      <div class="income-form" data-income-form>
        <div class="income-search-field"><label for="income-area">근처 대학교나 지하철역 이름</label><div class="income-search"><input id="income-area" name="area" type="text" enterkeyhint="go" maxlength="100" autocomplete="off" placeholder="예: 공릉역" aria-describedby="income-message"><button type="button" data-income-search aria-label="입력한 시설로 월세 진단 신청서 열기"><span aria-hidden="true">→</span></button></div></div>
        <fieldset class="income-home-types"><legend>방 유형을 선택해 주세요.</legend>${homeTypes.map(([value, label]) => `<label class="income-home-option"><input type="radio" name="homeType" value="${value}"><span class="income-home-label">${icon(value, 16)}<span>${label}</span></span><span class="income-radio" aria-hidden="true">${icon("radio", 18)}</span></label>`).join("")}</fieldset>
      </div>
      <p class="income-message" id="income-message" data-income-message role="status" aria-live="polite" hidden></p>
      <a class="income-reservation" href="/reservation/">예상 월세 무료 진단 받기 <span aria-hidden="true">→</span></a>
    </section>
  </aside>`;
}
