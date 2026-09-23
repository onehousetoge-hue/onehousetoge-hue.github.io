import { funding, fundingTotals } from "../content/funding.mjs";
import { site } from "../config/site.mjs";
import { absolute, escapeHtml, layout, pageHero } from "./template.mjs";
import { evidenceFlow } from "./evidence-flow.mjs";

const won = (amount) => `${amount.toLocaleString("ko-KR")}원`;

function executionSummary() {
  return `<section id="execution" aria-labelledby="execution-title" class="execution-section"><p class="eyebrow">실제 집행 · 2026년 9월 20일 기준</p><h3 id="execution-title">실제 집행 현황</h3><dl class="funding-totals"><div><dt>총 지원금</dt><dd>${won(funding.received)}</dd></div><div><dt>누적 실제 집행액</dt><dd>${won(fundingTotals.spent)}</dd></div><div><dt>지원금 기준 미집행액</dt><dd>${won(fundingTotals.unspent)}</dd></div></dl><p class="funding-formula">지원금 ${won(funding.received)} − 실제 집행액 ${won(fundingTotals.spent)} = 미집행액 ${won(fundingTotals.unspent)}</p><ol class="expense-list">${funding.actualExpenses.map((item) => `<li><div class="expense-heading"><div><time class="expense-month" datetime="${item.date}">${item.date.replaceAll("-", ".")}</time><h4>${escapeHtml(item.detail)}</h4></div><strong class="expense-amount">${won(item.amount)}</strong></div><p>증빙 종류: ${escapeHtml(item.evidence)}</p></li>`).join("")}</ol><p>한지붕 운영진이 제공한 집행 집계와 증빙 종류입니다. 미집행액은 이 지원금 수령액에서 공개한 지출을 뺀 금액이며, 다른 자금이 포함된 단체 전체 계좌 잔액을 뜻하지 않습니다.</p></section>`;

}

export function fundingSummary({ detailed = false } = {}) {
  return `<section class="funding-section" id="funding" aria-labelledby="funding-title">
    <p class="eyebrow">마을공동체 사업 지원금 · 계획과 실제 집행</p>
    <h2 id="funding-title">지원금 사용 계획과<br>집행 현황을 공개합니다.</h2>
    <p>한지붕 명의로 ${escapeHtml(funding.grantProgram)}에 선정되어 지원금 ${won(funding.received)}을 받았습니다. 한지붕의 활동명은 ‘${escapeHtml(funding.activityName)}’입니다. 계획금액과 실제 지출금액을 구분하여 공개합니다.</p>
    <dl class="definition-list"><div><dt>지원기관</dt><dd>${funding.provider}</dd></div><div><dt>지원사업</dt><dd>${funding.grantProgram}</dd></div><div><dt>한지붕 활동명</dt><dd>${funding.activityName}</dd></div><div><dt>사업기간</dt><dd>${funding.period}</dd></div><div><dt>주요 사용목적</dt><dd>무료상담, 현장활동, 실태조사, 안내자료 제작</dd></div><div><dt>집행현황 기준일</dt><dd><time datetime="${funding.executionAsOf}">2026년 9월 20일</time></dd></div></dl>
    ${executionSummary()}
    <section id="budget-plan" aria-labelledby="budget-title"><p class="eyebrow">사용 계획 · 실제 지출과 별도</p><h3 id="budget-title">사업비 사용 계획</h3><p>아래 금액은 사업비 사용 계획이며, 지출이 완료된 금액이 아닙니다.</p>
    <dl class="funding-totals"><div><dt>총 지원금</dt><dd>${won(funding.received)}</dd></div><div><dt>계획상 집행 예정액</dt><dd>${won(fundingTotals.planned)}</dd></div><div><dt>계획상 추후 사업비</dt><dd>${won(fundingTotals.unallocated)}</dd></div></dl>
    <p class="funding-formula">총 지원금 ${won(funding.received)} = 집행 예정액 ${won(fundingTotals.planned)} + 추후 사업비 ${won(fundingTotals.unallocated)}</p>
    <h3>월별 집행 계획</h3><dl class="funding-months">${fundingTotals.byMonth.map((item) => `<div><dt>${item.month}월</dt><dd>${won(item.amount)}</dd></div>`).join("")}</dl>
    ${detailed ? `<h3>집행 계획 세부항목 · ${funding.plannedExpenses.length}건</h3><ol class="expense-list">${funding.plannedExpenses.map((item) => `<li><div class="expense-heading"><div><span class="expense-month">2026년 ${item.month}월 계획</span><h4>${escapeHtml(item.category)}</h4></div><strong class="expense-amount">${won(item.amount)}</strong></div><p>${escapeHtml(item.detail)}</p></li>`).join("")}</ol>` : `<p><a class="text-link" href="${funding.href}">월별 집행 계획 ${funding.plannedExpenses.length}건 자세히 보기</a></p>`}
    <h3>추후 사업비 ${won(fundingTotals.unallocated)}</h3><p>계획상 아직 구체적인 사용항목을 정하지 않은 금액으로, 실제 집행 후 남은 잔액이 아닙니다. 추가 상담·홍보·운영 등 필요가 있을 때 지원기관의 집행기준에 따라 사용하고, 사업기간 내 사용하지 않은 금액은 관련 기준에 따라 정산합니다.</p></section>
    <aside class="funding-scope"><h3>공개 기준</h3><p>집행현황은 2026년 9월 20일 기준이며, 상세 내역은 <time datetime="${funding.confirmedAt}">2026년 9월 24일</time> 홈페이지에 반영했습니다. 계획과 실제 집행을 함께 보되 서로 같은 금액으로 해석하지 않습니다.</p><p>노원구청 마을공동체 사업 지원금 ${won(funding.received)}에 한정한 공개이며, 단체 전체의 연간 결산이나 지원기관의 정산 승인 결과를 뜻하지 않습니다.</p></aside>
  </section>`;
}

export function fundingPage(activity) {
  const body = pageHero({
    eyebrow: "운영기록 · 지원금 계획과 집행",
    title: "지원금 사용 계획과<br>실제 집행내역",
    description: "노원구청 마을공동체 사업 지원금 600,000원 중 2026년 9월 20일까지 실제 집행한 금액은 191,500원입니다. 사업 계획과 실제 지출을 구분해 공개합니다.",
    meta: '<div class="page-meta"><span>집행현황 기준일 <time datetime="2026-09-20">2026년 9월 20일</time></span><span>게시·수정일 <time datetime="2026-09-24">2026년 9월 24일</time></span><span>작성 한지붕 운영팀</span></div>',
  }) + `<section class="section"><div class="container content-layout"><article class="prose">${fundingSummary({ detailed: true })}
    <h2>계획금액과 실제 지출이 다른 이유</h2><p>계획은 예상금액이며 실제 지출은 인쇄수량, 상담 참여인원, 현장 방문횟수와 물품 단가에 따라 달라질 수 있습니다. 계획을 지출 완료금액처럼 표시하지 않고 운영진이 실제 결제와 증빙을 확인한 지출을 별도로 집계합니다.</p>
    <h2>10~11월 집행 계획</h2><h3>2026년 10월 · 계획금액 80,000원</h3><ul><li>어르신 주거·복지정보 상담자료 보완</li><li>실태조사 응답 정리</li><li>공동생활 준비 체크리스트 제작</li><li>추가 현장상담 운영물품 구입</li></ul><h3>2026년 11월 · 계획금액 80,000원</h3><ul><li>실태조사 결과 요약자료 제작</li><li>지역기관·참여자용 안내자료 인쇄</li><li>활동 사진과 기록 정리</li><li>홈페이지 활동·집행현황 업데이트</li></ul><p>이는 향후 계획이며 현재 완료된 지출이나 활동으로 집계하지 않습니다.</p>
    <h2>지원금과 현재 무료상담은 이렇게 구분합니다</h2><p>위 금액은 어르신에게 청구하는 상담료가 아닙니다. 현재 전화·이메일 기초상담은 한지붕 대표와 운영진이 무료로 응대합니다. 기관·경로당 상담은 사전 협의하며, 일반 가정의 주택 방문상담·안전진단을 제공한다는 뜻은 아닙니다.</p>
    <h2>집행내역 공개 기준</h2><ul><li>카드전표·현금영수증·세금계산서 등 증빙자료 확인</li><li>사업목적과 직접 관련된 지출 반영</li><li>계획금액과 실제 지출금액 별도 표시</li><li>실제 집행일과 현황 기준일 표시</li><li>환불·취소 발생 시 집행금액 수정</li><li>개인정보·결제정보를 제외한 범위에서 공개</li><li>사업 종료 후 최종 집행액과 잔액 업데이트</li></ul>
    <h2>홈페이지 업데이트 기록</h2><dl class="plain-definitions"><div><dt>2026년 9월 24일</dt><dd>지원사업명과 사용 계획 정정, 9월 20일 기준 실제 집행 5건 및 조사 진행 현황 반영.</dd></div><div><dt>2026년 11월 30일 예정</dt><dd>최종 집행내역과 사업 결과 공개 예정. 실제 공개 시 해당 일자를 기록합니다.</dd></div></dl>
    <h2>증빙과 공개 원칙</h2><p>지출 증빙은 개인정보와 거래 세부정보를 보호하여 관리합니다. 이 페이지에는 개인의 계좌번호, 연락처, 서명이 들어 있는 원본 영수증이나 원본 상담기록을 공개하지 않습니다.</p><p>지원금 수령은 지원기관이 한지붕의 모든 서비스의 품질이나 안전을 보증한다는 의미가 아닙니다. 공개 내역의 확인이나 정정이 필요한 경우 <a href="${site.emailHref}">${site.email}</a>으로 문의해 주세요.</p>
    <div class="hero-actions"><a class="button" href="#execution">지원금 집행내역 확인하기</a><a class="button button-secondary" href="/contact/">사업 관련 문의하기</a></div>${evidenceFlow()}</article><aside class="side-nav"><h2>관련 안내</h2><a href="#execution">실제 집행 현황</a><a href="#budget-plan">사업비 사용 계획</a><a href="/transparency/">운영·투명성</a><a href="/activities/field-records/">상담 현장 기록</a><a href="/programs/housing-research/#progress">실태조사 진행상황</a><a href="/contact/">전화·이메일 문의</a></aside></div></section>`;
  return layout({ title: activity.title, description: activity.description, path: activity.href, body, type: "article", publishedAt: activity.publishedAt, updatedAt: activity.updatedAt,
    breadcrumbs: [{ label: "활동과 기록", href: "/activities/" }, { label: "마을공동체 사업 지원금 계획과 집행", href: activity.href }],
    jsonLd: { "@context": "https://schema.org", "@type": "Article", headline: activity.title, datePublished: activity.publishedAt, dateModified: activity.updatedAt, author: { "@type": "Organization", name: site.name }, mainEntityOfPage: absolute(activity.href) },
  });
}
