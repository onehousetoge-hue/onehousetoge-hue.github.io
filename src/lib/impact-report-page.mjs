import { layout, pageHero, escapeHtml } from "./template.mjs";
import { impactSection, activityTimeline } from "./impact.mjs";
import { resources } from "../content/resources.mjs";

export const annualGoals = Object.freeze([
  { label: "무료상담", current: 40, target: 100, unit: "건", description: "주거와 유휴공간 문제로 고민하는 주민이 부담 없이 정보를 얻도록 상담을 확대합니다." },
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
  const body = pageHero({ eyebrow: "2026 활동현황 · 항목별 집계일 안내", title: "현장에서 듣고,<br>다음 활동으로 이어갑니다.", description: activity.description })
  + impactSection()
  + `<section class="section"><div class="container content-layout"><article class="prose">
  <nav class="field-toc" aria-label="활동현황 목차"><a href="#consultation-results">상담·자료 운영 실적</a><a href="#people">만나는 사람들</a><a href="#places">지역별 활동</a><a href="#questions">현장의 고민</a><a href="#outputs">자료로 이어지는 기록</a><a href="#counting">집계 기준</a><a href="#goals">2026 목표</a></nav>
  <section id="consultation-results" aria-labelledby="consultation-results-title">
  <h2 id="consultation-results-title">상담이 실제 도움으로 이어지도록</h2>
  <p>한지붕은 어르신과 가족이 유휴공간 활용을 충분히 이해하고, 자신의 생활에 맞는 선택을 준비하도록 돕고자 합니다.</p>
  <h3>상담·자료 운영 실적</h3>
  <p>집계 기간: 2026년 7월 5일(창립일)~2026년 9월 25일 · 출처: 한지붕 운영진 제공 집계</p>
  <dl class="plain-definitions">
  <div><dt>누적 문의 접수 · 72건</dt><dd>운영진이 확인한 문의 접수 수. 상담 완료 건수와 구분합니다.</dd></div>
  <div><dt>무료 기초상담 · 40건</dt><dd>동일 문의의 반복 연락을 제외한 상담 완료 기록</dd></div>
  <div><dt>후속 정보 안내 · 25건</dt><dd>자료 전달이나 추가 질문 안내 완료 기록</dd></div>
  <div><dt>상담 이용자 의견 수렴 · 30명</dt><dd>자발적 설문 응답, 중복 제외</dd></div>
  <div><dt>생활·주거자료 보완 · 3종</dt><dd>수정한 내용과 공개일 기록</dd></div>
  </dl>
  <p>문의 72건과 상담 완료 40건은 서로 다른 처리 단계의 집계입니다. 두 수치를 더하지 않으며, 차이인 32건이 모두 상담 대기라는 뜻은 아닙니다.</p>
  <p>자료 보완 3종은 기존 자료를 개선한 실적이며, 무료 공개자료 6종에 더해 9종으로 계산하지 않습니다. 의견 수렴 인원은 상담 만족도나 효과를 입증하는 비율이 아니라 참여 규모입니다.</p>
  <h3>상담 후 남는 도움</h3>
  <h4>가족과 이야기할 질문</h4><p>어르신 본인의 희망과 가족의 걱정을 구분하고, 함께 의논할 항목을 정리합니다.</p>
  <h4>공동생활 전 확인할 기준</h4><p>개인공간, 주방·욕실, 방문객, 청소와 생활시간에 관한 질문을 살펴봅니다.</p>
  <h4>추가로 확인할 기관과 정보</h4><p>계약·세금 등 전문적인 판단이 필요한 문제는 관련 기관에 확인하도록 안내합니다.</p>
  <h3>활동을 점검하는 방법</h3><p>상담 건수만 늘리기보다 안내가 이해하기 쉬웠는지, 필요한 정보를 얻었는지 의견을 듣겠습니다. 결과를 공개할 때에는 집계 기간과 응답자 수를 함께 표시하고, 목표와 실제 실적을 구분하겠습니다.</p>
  <div class="hero-actions"><a class="button" href="/programs/senior-home-consulting/">무료상담 안내 보기</a><a class="button button-secondary" href="/resources/">생활자료 보기</a><a class="button button-secondary" href="/activities/">실제 활동기록 보기</a></div>
  </section>
  <h2 id="people">한지붕은 누구를 만나고 있나요?</h2><dl class="research-counts"><div><dt>60세 이상 지역 주민</dt><dd>58명</dd></div><div><dt>청년·대학생</dt><dd>28명</dd></div><div><dt>직접 방문한 지역 가정</dt><dd>18가구</dd></div><div><dt>방문·협력 지역기관</dt><dd>9곳</dd></div></dl><p>상담·프로그램 참여자 86명의 구성입니다. 사람·가구·기관은 다른 집계 단위이므로 합산하지 않습니다.</p><p>어르신에게는 유휴공간과 공동생활, 가족의 의견과 생활환경에 관한 이야기를 들었습니다. 청년에게는 주거비 부담과 계약기간, 통학, 안전과 개인공간에 관한 의견을 들었습니다.</p><p>한지붕은 온라인 설문만으로 지역 문제를 판단하지 않습니다. 직접 사람을 만나 생활환경과 주거 고민을 듣고 그 의견을 다음 활동에 반영합니다.</p>
  <h2 id="places">지역으로 직접 찾아갑니다</h2><p>한지붕은 노원구를 중심으로 주민을 만나고 있습니다.</p><dl class="plain-definitions">${localActivities.map(([area, count, description]) => `<div><dt>${area} · ${count}회</dt><dd>${description}</dd></div>`).join("")}</dl><p>지역별 활동 합계는 12회입니다. 현장조사·인터뷰 9회는 별도 활동 구분이며 이 수치에 더해 전체 횟수로 표시하지 않습니다.</p><h3>노원구에서 시작합니다</h3><p>지역의 문제는 지역 안에서 직접 사람을 만날 때 더 구체적으로 보입니다. 한 지역에서 상담과 조사를 축적하고, 그 경험과 자료를 다른 지역에서도 활용할 수 있도록 정리하고 있습니다.</p>
  <h2>상담 이후 확인하고 싶은 변화</h2><p>상담에서 들은 정보가 이해하기 쉬웠는지, 가족과 더 이야기할 항목이 생겼는지, 추가로 궁금한 점이 있는지 의견을 듣습니다. 상담 후의 의향은 실제 행동 변화나 입주 성사와 구분하며, 확인되지 않은 결과를 성과로 집계하지 않습니다.</p>
<h2 id="questions">현장에서 반복해서 듣는 고민</h2><p>다음 질문은 상담과 조사에서 접한 고민을 주제별로 정리한 표현입니다. 특정 참여자의 직접 인용문은 아닙니다.</p><ul><li><strong>모르는 사람과 함께 살아도 안전할까요?</strong> 함께 살 사람과 생활환경에 대해 어떤 정보를 확인해야 할지 고민합니다.</li><li><strong>가족들이 반대하면 어떻게 하나요?</strong> 어르신의 의사와 가족의 우려를 함께 듣고 대화할 자료가 필요합니다.</li><li><strong>전입신고는 어떻게 되나요?</strong> 주소 이전과 행정절차는 개인의 상황에 맞게 공식 기관에 확인할 질문으로 남깁니다.</li><li><strong>생활시간이 다르면 불편하지 않을까요?</strong> 취침·식사·욕실·청소 등 일상생활의 기준을 미리 이야기합니다.</li><li><strong>생활비와 공간 사용 기준은 어떻게 정하나요?</strong> 비용과 공간의 경계를 구체적으로 정리할 필요가 있습니다.</li></ul>
  <h2>상담 이후에도 선택을 돕습니다</h2><p>한지붕이 목표로 하는 변화는 당장 빈방을 활용하게 만드는 것이 아닙니다. 주민이 충분한 정보를 가지고 자신의 상황에 맞는 선택을 할 수 있도록 돕는 것입니다.</p><p>가족과 논의할 내용, 생활조건과 추가로 확인할 질문을 정리하고 필요할 때 후속 정보를 안내합니다. 상담 후의 의향과 실제 행동 변화는 구분해서 기록해야 합니다.</p>
  <h2>한 사람의 변화도 기록합니다</h2><blockquote>“막연했던 걱정이 조금 구체적인 질문으로 바뀌었어요.”</blockquote><p>공릉동의 한 상담 참여자는 자녀 독립 후 방 하나를 사용하지 않고 있었습니다. 빈방을 활용할 수 있다는 이야기는 들었지만, 모르는 사람과 함께 사는 걱정 때문에 실제로 알아본 적은 없었습니다.</p><p>상담에서는 활용 여부를 바로 결정하지 않고 걱정되는 점부터 이야기했습니다. 이후 가족과 먼저 논의하기로 했고, 공간을 공유한다면 지키고 싶은 생활기준을 하나씩 정리하기 시작했습니다.</p><p><strong>상담 1회 → 가족과 논의 → 공간조건 확인 → 추가상담</strong></p><p>익명 공개 동의를 받은 실제 사례입니다. 개인의 경험이며 모든 상담에서 같은 변화가 나타남을 보장하지 않습니다.</p><h2 id="outputs">현장의 이야기를 결과물로 남깁니다</h2><p>상담과 조사는 그 자체가 목적이 아닙니다. 현장에서 들은 이야기를 기록하고 반복되는 질문을 지역사회가 사용할 수 있는 자료로 정리합니다.</p><ol class="research-timeline"><li><strong>127명 · 실태조사 참여</strong><p>청년의 주거 고민과 어르신의 유휴공간 활용 의견을 듣습니다.</p></li><li><strong>42개 · 반복적으로 수집된 주거·공동생활 질문</strong><p>비슷한 질문을 정리해 상담자료를 보완할 항목으로 남깁니다.</p></li><li><strong>6종 · 무료 생활·주거자료 공개</strong><p>상담·조사에서 얻은 질문을 참고해 누구나 읽고 작성할 수 있도록 제공합니다.</p></li></ol><p>진행 중인 조사와 자료 보완의 흐름입니다. 6종이 모두 조사 완료 후 제작된 최종 연구 결과라는 뜻은 아닙니다.</p><p>자료는 회원가입 없이 HTML로 읽고 필요한 부분을 인쇄할 수 있습니다. 인쇄나 화면 열람은 상담 접수와 별개이며, 자료를 이용했다는 이유로 개인정보가 접수되지는 않습니다.</p>
  <h3>무료로 공개하고 있는 자료</h3><div class="related-grid">${resources.map(resource => `<a class="related-link" href="${resource.href}"><strong>${escapeHtml(resource.title)}</strong><span class="resource-meta">${escapeHtml(resource.readTime)}</span><span>${escapeHtml(resource.description)}</span></a>`).join("")}</div><p>한 사람에게서 들은 질문이 비슷한 고민을 하는 다른 사람에게도 도움이 되도록 자료를 만듭니다. 빈방 체크리스트는 준비할 질문을 찾는 도구이며 공간의 안전성·입주 적합성을 판정하지 않습니다.</p>
  <h2>2026 노원구 주거상생 실태조사</h2><p>2026년 9월 시작한 조사에는 현재 127명이 참여했습니다. 주요 조사문항은 18개, 현장조사 및 인터뷰는 9회입니다. 어르신의 유휴공간 여부와 공유 의향, 우려사항을 묻고 청년에게는 주거비·희망 거주기간·주거 선택 기준을 듣고 있습니다.</p><p>조사 내용을 향후 보고서와 생활자료 보완에 반영합니다. 현재 결과는 지역 전체를 대표하는 통계가 아닙니다.</p><a class="text-link" href="/programs/housing-research/">조사방법과 진행상황 보기</a>
  <h2>이번 달 한지붕은 이렇게 활동했습니다</h2><h3>2026년 9월 활동보고 · 9월 24일까지</h3><dl class="research-counts"><div><dt>현장활동</dt><dd>4회</dd></div><div><dt>신규 상담 참여</dt><dd>23명</dd></div><div><dt>새로운 생활자료 제작</dt><dd>2종</dd></div><div><dt>지역기관 방문</dt><dd>3곳</dd></div><div><dt>후속 정보안내</dt><dd>12건</dd></div></dl><p>출처: 한지붕 운영진 월간 중간 집계. 위 수치는 누적 실적에 포함되므로 누적 수치에 다시 더하지 않습니다. 한 달 전체의 확정 결산은 아닙니다.</p><p>월별 활동을 기록하고 공개해 계획한 사업이 어떻게 진행되는지 확인할 수 있도록 하겠습니다.</p><section id="counting" aria-labelledby="counting-title"><h2 id="counting-title">어떤 기록을 어떻게 집계했나요?</h2><p>출처는 한지붕 운영진이 제공한 내부 집계입니다. 아래 기준일이 서로 다른 항목을 합쳐 하나의 총인원이나 달성률로 표시하지 않습니다.</p><dl class="plain-definitions"><div><dt>상담·후속 안내·의견 수렴·자료 보완</dt><dd>2026년 7월 5일~9월 25일 누적. 상담 40건과 후속 안내 25건은 서로 다른 단계이며 합쳐 65건의 상담으로 계산하지 않습니다.</dd></div><div><dt>참여자·방문·활동·공개자료</dt><dd>2026년 9월 24일 기준. 사람·가구·기관·활동 횟수는 다른 단위입니다. 참여자와 기관 수는 각 항목 안의 중복을 제외했습니다.</dd></div><div><dt>실태조사</dt><dd>2026년 9월 조사 시작~9월 24일 기준 127명. 상담·프로그램 참여자와 겹칠 수 있으며 지역 전체를 대표하는 통계가 아닙니다.</dd></div><div><dt>자료 보완과 공개</dt><dd>기존 자료를 수정한 3종과 공개 중인 작성형 자료 6종은 별도 개념입니다. 새로 추가한 읽기 안내글 2편도 구분합니다.</dd></div></dl><p>개인정보가 담긴 원자료는 공개하지 않습니다. 집계 기준이나 공개 내역에 관한 질문은 <a href="/contact/">전화·이메일 문의</a>로 알려주세요.</p></section><h2 id="goals">2026년 우리가 만들고 싶은 변화</h2><p>아래 수치는 연간 목표이며 달성한 실적과 구분합니다. 진행률은 현재 실적 ÷ 목표로 계산하고 정수로 반올림했습니다.</p><div class="annual-goals">${annualGoals.map(goal => { const percent=Math.round(goal.current/goal.target*100); return `<section><h3>${goal.label} ${goal.target}${goal.unit}</h3><p>현재 ${goal.current}${goal.unit} · ${percent}% 진행</p><progress value="${goal.current}" max="${goal.target}" aria-label="${goal.label} 목표 대비 ${percent}%"></progress><p>${goal.description}</p></section>`; }).join("")}</div>

  </article><aside class="side-nav"><h2>활동과 참여</h2><a href="/activities/">활동 기록</a><a href="/consultation/">무료상담 문의</a><a href="/partnership/">기관협력 문의</a><a href="/transparency/">운영·공개</a></aside></div></section>`
  + activityTimeline();
  return layout({ title: activity.title, description: activity.description, path: activity.href, body, updatedAt: activity.updatedAt, breadcrumbs: [{label:"활동과 기록",href:"/activities/"},{label:"2026 활동현황",href:activity.href}] });
}
