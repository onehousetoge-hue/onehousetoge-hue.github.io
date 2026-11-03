const icon = (name, size) => `<img src="/assets/figma/calculator/${name}.svg" width="${size}" height="${size}" alt="" aria-hidden="true">`;
const homeTypes = [["studio", "원룸"], ["two-room", "투룸 +"], ["house", "단독 주택"], ["apartment", "아파트"]];

export function incomeCalculator() {
  return `<aside class="income-calculator" data-income-calculator aria-label="우리 집 예상 수입 계산기" hidden>
    <button class="income-launcher" type="button" data-income-open aria-expanded="true" aria-controls="income-panel">예상 수입 계산기 <span aria-hidden="true">↗</span></button>
    <section class="income-panel" id="income-panel" aria-labelledby="income-title">
      <div class="income-heading"><p class="income-eyebrow">우리 집 빈 방 얼마 받을 수 있을까</p><div class="income-title-row"><h2 id="income-title">예상 수입 계산기</h2><button class="income-close" type="button" data-income-close aria-label="예상 수입 계산기 닫기">${icon("close", 18)}</button></div></div>
      <div class="income-form" data-income-form role="search" aria-label="예상 월세 지역 입력">
        <div class="income-search-field"><label for="income-area">근처 대학교나 지하철역을 검색해 주세요</label><div class="income-search"><input id="income-area" name="area" type="search" maxlength="100" autocomplete="off" placeholder="대학교나 지하철역을 검색하세요" aria-describedby="income-message"><button type="button" data-income-search aria-label="주변 지역 검색">${icon("search", 22)}</button></div></div>
        <fieldset class="income-home-types"><legend>방 유형을 선택해 주세요.</legend>${homeTypes.map(([value, label]) => `<label class="income-home-option"><input type="radio" name="homeType" value="${value}"><span class="income-home-label">${icon(value, 16)}<span>${label}</span></span><span class="income-radio" aria-hidden="true">${icon("radio", 18)}</span></label>`).join("")}</fieldset>
      </div>
      <p class="income-message" id="income-message" data-income-message role="status" aria-live="polite" hidden></p>
      <a class="income-reservation" href="/reservation/">예상 월세 무료 진단 받기 <span aria-hidden="true">→</span></a>
    </section>
  </aside>`;
}
