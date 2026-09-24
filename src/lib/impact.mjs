// Counts and reference date confirmed by the operator on 2026-09-24.
export const impact = Object.freeze([
  ["34건", "어르신 주거·유휴공간 무료상담"],
  ["12회", "지역 현장 상담 및 세대교류 활동"],
  ["86명", "프로그램 및 상담 참여자"],
  ["9곳", "경로당·복지기관·지역기관 방문 및 협력"],
  ["127명", "주거상생 실태조사 참여"],
  ["6종", "무료 주거·공동생활 자료 공개"],
]);

export function impactSection() {
  return `<section class="section impact-section" aria-labelledby="impact-title"><div class="container"><p class="eyebrow">2026 한지붕 활동 현황</p><h2 id="impact-title">숫자로 보는 한지붕</h2><p>한지붕은 청년의 주거 부담과 어르신의 유휴공간 문제를 함께 해결하기 위해 지역 현장에서 활동하고 있습니다.</p><dl class="impact-grid">${impact.map(([value, label]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`).join("")}</dl><p class="impact-basis">2026년 9월 24일 기준 · 한지붕 운영진 집계<br>참여자와 기관 수는 각 항목 내 중복을 제외했습니다. 상담·프로그램 참여자와 조사 참여자는 집계 범위가 다르며 서로 더해 전체 인원으로 계산하지 않습니다. 기관 수는 방문 또는 협력한 곳의 수이며, 모두 공식 협약기관이라는 뜻은 아닙니다.</p><a class="text-link" href="/activities/">활동 기록 확인하기</a></div></section>`;
}

export function consultationImpact() {
  return `<section class="consultation-example"><h2>어르신의 남는 공간, 함께 방법을 찾아봅니다</h2><p>자녀의 독립 이후 사용하지 않는 방이 생겼지만 어떻게 활용할지 몰라 그대로 두고 있는 가정이 있습니다. 한지붕은 현재 공간과 생활환경을 함께 살펴보고, 다른 사람과 공간을 공유하기 전에 필요한 준비사항을 무료로 상담합니다.</p><p>2026년 9월 24일 기준 <strong>무료상담 34건</strong>을 진행했고, 이 가운데 <strong>18가구를 방문</strong>해 공간과 생활환경을 확인했습니다. 가족과 상의할 내용과 개인·공용공간의 구분 등에 관한 <strong>후속 안내 21건</strong>을 제공했습니다.</p><ol><li><strong>공간 확인:</strong> 사용하지 않는 방과 공용공간을 살펴봅니다.</li><li><strong>생활환경 확인:</strong> 함께 사는 사람과 평소 생활패턴을 듣습니다.</li><li><strong>우려사항 확인:</strong> 안전, 사생활, 가족의 의견을 듣습니다.</li><li><strong>활용방법 안내:</strong> 공동생활 전에 확인할 정보를 정리합니다.</li><li><strong>후속상담:</strong> 추가로 궁금한 점을 확인합니다.</li></ol><p>방문 수는 과거 활동 실적입니다. 현재 온라인·전화·이메일로 기초상담을 접수하며, 주택 방문을 상시 신청받는다는 뜻은 아닙니다. 공간 확인은 전문 안전진단이나 공동거주 적합성 보장이 아닙니다.</p></section>`;
}

export function exchangeImpact() {
  return `<section class="consultation-example"><h2>세대가 만날 수 있는 작은 접점을 만듭니다</h2><p>청년과 어르신은 같은 지역에서 생활하지만 서로 만날 기회는 많지 않습니다. 한지붕은 경로당·복지기관·지역 커뮤니티에서 주거·생활정보를 나누고 세대가 자연스럽게 교류할 접점을 만들고 있습니다.</p><dl class="research-counts"><div><dt>주거·생활 상담 활동</dt><dd>7회</dd></div><div><dt>청년·어르신 세대교류</dt><dd>3회</dd></div><div><dt>생활·디지털 정보 안내</dt><dd>2회</dd></div><div><dt>상담·프로그램 참여자</dt><dd>86명</dd></div></dl><p>2026년 9월 24일 기준 · 활동 총 12회, 참여자 중복 제외. 34건의 개별상담과 7회의 상담 활동은 서로 다른 집계 단위입니다.</p><p>한지붕은 대규모 행사보다 지역에서 반복적으로 만나는 작은 활동을 중요하게 생각합니다. 현장에서 나온 질문과 의견을 기록하고 다음 활동과 자료 제작에 반영합니다.</p></section>`;
}

export function activityTimeline() {
 return `<section class="section"><div class="container"><h2>2026년 7월, 한지붕의 활동이 시작됐습니다</h2><ol class="research-timeline"><li><strong>2026.07.05</strong><p>한지붕 설립 및 창립총회</p></li><li><strong>2026.07.09</strong><p>법인으로 보는 단체 승인 및 고유번호 발급</p></li><li><strong>2026.07</strong><p>어르신 유휴공간 무료상담 시작</p></li><li><strong>2026.08</strong><p>지역 현장 상담 및 세대교류 활동 시작</p></li><li><strong>2026.09</strong><p>노원구 주거상생 실태조사 시작 · 무료 생활·주거자료 6종 공개</p></li></ol></div></section>`;
}
