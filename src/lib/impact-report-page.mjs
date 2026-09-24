import { layout, pageHero, escapeHtml } from "./template.mjs";
import { impactSection, consultationImpact, activityTimeline } from "./impact.mjs";
import { resources } from "../content/resources.mjs";

export const annualGoals = Object.freeze([
  { label: "무료상담", current: 34, target: 100, unit: "건", description: "주거와 유휴공간 문제로 고민하는 주민이 부담 없이 정보를 얻도록 상담을 확대합니다." },
  { label: "실태조사", current: 127, target: 300, unit: "명", description: "청년과 어르신 양쪽의 목소리를 듣고 지역의 의견을 지속적으로 수집합니다." },
  { label: "무료자료", current: 6, target: 10, unit: "종", description: "반복되는 질문을 누구나 활용할 수 있는 공익자료로 만듭니다." },
  { label: "지역기관 방문·협력", current: 9, target: 20, unit: "곳", description: "경로당·복지관·학교·주민기관 등 지역 커뮤니티와의 접점을 확대합니다." },
  { label: "세대교류·현장활동", current: 12, target: 20, unit: "회", description: "온라인 홍보에 머물지 않고 지역주민을 직접 만나는 활동을 이어갑니다." },
]);
export const localActivities = Object.freeze([
  ["공릉1동", 5, "어르신 주거상담과 유휴공간 활용 의견수렴"],
  ["공릉2동", 3, "경로당 방문상담과 세대교류 활동"],
  ["하계동", 2, "주거·공동생활 정보 안내"],
  ["중계동", 2, "어르신 주거 의견 인터뷰"],
]);

export function impactReportPage(activity) {
  const body = pageHero({ eyebrow: "2026 활동현황 · 9월 24일 기준", title: "현장에서 듣고,<br>다음 활동으로 이어갑니다.", description: activity.description })
  + impactSection()
  + `<section class="section"><div class="container content-layout"><article class="prose">
  <nav class="field-toc" aria-label="활동현황 목차"><a href="#people">만나는 사람들</a><a href="#places">지역별 활동</a><a href="#questions">현장의 고민</a><a href="#outputs">자료로 이어지는 기록</a><a href="#goals">2026 목표</a></nav>
  <h2 id="people">한지붕은 누구를 만나고 있나요?</h2><dl class="research-counts"><div><dt>60세 이상 지역 주민</dt><dd>58명</dd></div><div><dt>청년·대학생</dt><dd>28명</dd></div><div><dt>직접 방문한 지역 가정</dt><dd>18가구</dd></div><div><dt>방문·협력 지역기관</dt><dd>9곳</dd></div></dl><p>상담·프로그램 참여자 86명의 구성입니다. 사람·가구·기관은 다른 집계 단위이므로 합산하지 않습니다.</p><p>어르신에게는 유휴공간과 공동생활, 가족의 의견과 생활환경에 관한 이야기를 들었습니다. 청년에게는 주거비 부담과 계약기간, 통학, 안전과 개인공간에 관한 의견을 들었습니다.</p><p>한지붕은 온라인 설문만으로 지역 문제를 판단하지 않습니다. 직접 사람을 만나 생활환경과 주거 고민을 듣고 그 의견을 다음 활동에 반영합니다.</p>
  <h2 id="places">지역으로 직접 찾아갑니다</h2><p>한지붕은 노원구를 중심으로 주민을 만나고 있습니다.</p><dl class="plain-definitions">${localActivities.map(([area, count, description]) => `<div><dt>${area} · ${count}회</dt><dd>${description}</dd></div>`).join("")}</dl><p>지역별 활동 합계는 12회입니다. 현장조사·인터뷰 9회는 별도 활동 구분이며 이 수치에 더해 전체 횟수로 표시하지 않습니다.</p><h3>노원구에서 시작합니다</h3><p>지역의 문제는 지역 안에서 직접 사람을 만날 때 더 구체적으로 보입니다. 한 지역에서 상담과 조사를 축적하고, 그 경험과 자료를 다른 지역에서도 활용할 수 있도록 정리하고 있습니다.</p>
  <h2>상담 이후에 들은 응답</h2><p>단순히 몇 명을 만났는지만 기록하지 않습니다. 어떤 정보가 도움이 됐는지, 이후 무엇을 해보고 싶은지도 듣습니다.</p><dl class="research-counts"><div><dt>필요한 정보를 얻었다고 응답</dt><dd>91%</dd></div><div><dt>가족과 빈방 활용을 이야기해보겠다고 응답</dt><dd>64%</dd></div><div><dt>추가 상담을 희망</dt><dd>38%</dd></div><div><dt>공동생활 전 생활규칙 합의가 필요하다고 응답</dt><dd>82%</dd></div></dl><p>출처: 한지붕 내부 응답 집계. 문항별 응답자 수와 조사기간은 이 페이지에 공개되어 있지 않습니다. 각 비율은 별도 문항의 응답으로 서로 합산하지 않으며, 실태조사 전체 127명의 응답 비율로 해석하지 않습니다. 대화·추가상담 의향은 실제 실행 완료와 구분합니다.</p>
<h2 id="questions">현장에서 반복해서 듣는 고민</h2><p>다음 질문은 상담과 조사에서 접한 고민을 주제별로 정리한 표현입니다. 특정 참여자의 직접 인용문은 아닙니다.</p><dl class="plain-definitions"><div><dt>안전과 상대방 정보에 관한 걱정</dt><dd>32%</dd></div><div><dt>가족의 반대·걱정</dt><dd>26%</dd></div><div><dt>전입신고 등 행정절차</dt><dd>21%</dd></div><div><dt>생활시간의 차이</dt><dd>13%</dd></div><div><dt>생활비·공간 사용 기준</dt><dd>8%</dd></div></dl><p>출처: 한지붕 내부 고민 분류 집계. 분류 대상 건수와 선택·분류 방식은 공개되어 있지 않아 인구 전체의 의견 분포로 일반화하지 않습니다.</p><ul><li><strong>모르는 사람과 함께 살아도 안전할까요?</strong> 함께 살 사람과 생활환경에 대해 어떤 정보를 확인해야 할지 고민합니다.</li><li><strong>가족들이 반대하면 어떻게 하나요?</strong> 어르신의 의사와 가족의 우려를 함께 듣고 대화할 자료가 필요합니다.</li><li><strong>전입신고는 어떻게 되나요?</strong> 주소 이전과 행정절차는 개인의 상황에 맞게 공식 기관에 확인할 질문으로 남깁니다.</li><li><strong>생활시간이 다르면 불편하지 않을까요?</strong> 취침·식사·욕실·청소 등 일상생활의 기준을 미리 이야기합니다.</li><li><strong>생활비와 공간 사용 기준은 어떻게 정하나요?</strong> 비용과 공간의 경계를 구체적으로 정리할 필요가 있습니다.</li></ul>
  ${consultationImpact()}
  <h2>상담 이후에도 선택을 돕습니다</h2><p>한지붕이 목표로 하는 변화는 당장 빈방을 활용하게 만드는 것이 아닙니다. 주민이 충분한 정보를 가지고 자신의 상황에 맞는 선택을 할 수 있도록 돕는 것입니다.</p><p>가족과 논의할 내용, 생활조건과 추가로 확인할 질문을 정리하고 필요할 때 후속 정보를 안내합니다. 상담 후의 의향과 실제 행동 변화는 구분해서 기록해야 합니다.</p>
  <h2>한 사람의 변화도 기록합니다</h2><blockquote>“막연했던 걱정이 조금 구체적인 질문으로 바뀌었어요.”</blockquote><p>공릉동의 한 상담 참여자는 자녀 독립 후 방 하나를 사용하지 않고 있었습니다. 빈방을 활용할 수 있다는 이야기는 들었지만, 모르는 사람과 함께 사는 걱정 때문에 실제로 알아본 적은 없었습니다.</p><p>상담에서는 활용 여부를 바로 결정하지 않고 걱정되는 점부터 이야기했습니다. 이후 가족과 먼저 논의하기로 했고, 공간을 공유한다면 지키고 싶은 생활기준을 하나씩 정리하기 시작했습니다.</p><p><strong>상담 1회 → 가족과 논의 → 공간조건 확인 → 추가상담</strong></p><p>익명 공개 동의를 받은 실제 사례입니다. 개인의 경험이며 모든 상담에서 같은 변화가 나타남을 보장하지 않습니다.</p><h2 id="outputs">현장의 이야기를 결과물로 남깁니다</h2><p>상담과 조사는 그 자체가 목적이 아닙니다. 현장에서 들은 이야기를 기록하고 반복되는 질문을 지역사회가 사용할 수 있는 자료로 정리합니다.</p><ol class="research-timeline"><li><strong>127명 · 실태조사 참여</strong><p>청년의 주거 고민과 어르신의 유휴공간 활용 의견을 듣습니다.</p></li><li><strong>42개 · 반복적으로 수집된 주거·공동생활 질문</strong><p>비슷한 질문을 정리해 상담자료를 보완할 항목으로 남깁니다.</p></li><li><strong>6종 · 무료 생활·주거자료 공개</strong><p>상담·조사에서 얻은 질문을 참고해 누구나 읽고 작성할 수 있도록 제공합니다.</p></li></ol><p>진행 중인 조사와 자료 보완의 흐름입니다. 6종이 모두 조사 완료 후 제작된 최종 연구 결과라는 뜻은 아닙니다.</p><dl class="research-counts"><div><dt>자료 열람·다운로드 합산</dt><dd>428회</dd></div></dl><p>출처: 한지붕 내부 이용 집계. 열람과 다운로드를 합친 횟수이며 428명의 개별 이용자를 의미하지 않습니다. 측정 기간·도구·중복 제거 방식은 공개되어 있지 않습니다. 현재 홈페이지는 HTML 자료를 제공하며 인쇄 기능을 사용할 수 있습니다.</p>
  <h3>무료로 공개하고 있는 자료</h3><div class="related-grid">${resources.map(resource => `<a class="related-link" href="${resource.href}"><strong>${escapeHtml(resource.title)}</strong><span class="resource-meta">${escapeHtml(resource.readTime)}</span><span>${escapeHtml(resource.description)}</span></a>`).join("")}</div><p>한 사람에게서 들은 질문이 비슷한 고민을 하는 다른 사람에게도 도움이 되도록 자료를 만듭니다. 빈방 체크리스트는 준비할 질문을 찾는 도구이며 공간의 안전성·입주 적합성을 판정하지 않습니다.</p>
  <h2>2026 노원구 주거상생 실태조사</h2><p>2026년 9월 시작한 조사에는 현재 127명이 참여했습니다. 주요 조사문항은 18개, 현장조사 및 인터뷰는 9회입니다. 어르신의 유휴공간 여부와 공유 의향, 우려사항을 묻고 청년에게는 주거비·희망 거주기간·주거 선택 기준을 듣고 있습니다.</p><p>조사 내용을 향후 보고서와 생활자료 보완에 반영합니다. 현재 결과는 지역 전체를 대표하는 통계가 아닙니다.</p><a class="text-link" href="/programs/housing-research/">조사방법과 진행상황 보기</a>
  <h2>이번 달 한지붕은 이렇게 활동했습니다</h2><h3>2026년 9월 활동보고 · 9월 24일까지</h3><dl class="research-counts"><div><dt>현장활동</dt><dd>4회</dd></div><div><dt>신규 상담 참여</dt><dd>23명</dd></div><div><dt>새로운 생활자료 제작</dt><dd>2종</dd></div><div><dt>지역기관 방문</dt><dd>3곳</dd></div><div><dt>후속 정보안내</dt><dd>12건</dd></div></dl><p>출처: 한지붕 운영진 월간 중간 집계. 위 수치는 누적 실적에 포함되므로 누적 수치에 다시 더하지 않습니다. 한 달 전체의 확정 결산은 아닙니다.</p><p>월별 활동을 기록하고 공개해 계획한 사업이 어떻게 진행되는지 확인할 수 있도록 하겠습니다.</p><h2 id="goals">2026년 우리가 만들고 싶은 변화</h2><p>아래 수치는 연간 목표이며 달성한 실적과 구분합니다. 진행률은 현재 실적 ÷ 목표로 계산하고 정수로 반올림했습니다.</p><div class="annual-goals">${annualGoals.map(goal => { const percent=Math.round(goal.current/goal.target*100); return `<section><h3>${goal.label} ${goal.target}${goal.unit}</h3><p>현재 ${goal.current}${goal.unit} · ${percent}% 진행</p><progress value="${goal.current}" max="${goal.target}" aria-label="${goal.label} 목표 대비 ${percent}%"></progress><p>${goal.description}</p></section>`; }).join("")}</div>
  <h2>한눈에 보는 2026 한지붕</h2><p>무료상담 34건 · 직접 방문 18가구 · 현장활동 12회 · 상담·프로그램 참여자 86명 · 실태조사 127명 · 지역기관 방문·협력 9곳 · 후속 정보안내 21건 · 무료자료 6종</p><p>출처: 한지붕 운영진 제공 집계 · 기준일 2026년 9월 24일. 실명·연락처·상세주소와 응답 원자료는 공개하지 않습니다.</p>
  </article><aside class="side-nav"><h2>활동과 참여</h2><a href="/activities/">활동 기록</a><a href="/consultation/">무료상담 문의</a><a href="/partnership/">기관협력 문의</a><a href="/transparency/">운영·공개</a></aside></div></section>`
  + activityTimeline();
  return layout({ title: activity.title, description: activity.description, path: activity.href, body, updatedAt: activity.updatedAt, breadcrumbs: [{label:"활동과 기록",href:"/activities/"},{label:"2026 활동현황",href:activity.href}] });
}
