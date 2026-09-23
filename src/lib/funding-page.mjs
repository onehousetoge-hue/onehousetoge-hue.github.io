import { funding, fundingTotals } from "../content/funding.mjs";
import { site } from "../config/site.mjs";
import { absolute, escapeHtml, layout, pageHero } from "./template.mjs";

const won = (amount) => `${amount.toLocaleString("ko-KR")}원`;

export function fundingSummary({ detailed = false } = {}) {
  return `<section class="funding-section" id="funding" aria-labelledby="funding-title">
    <p class="eyebrow">마을공동체 사업 지원금 · 사용 계획</p>
    <h2 id="funding-title">60만 원의 지원금,<br>이렇게 사용할 계획입니다.</h2>
    <p>한지붕은 ${escapeHtml(funding.provider)} ${escapeHtml(funding.source)} ${won(funding.received)}을 받았습니다. 운영자가 정정한 ${funding.period} 집행 계획과 추후 사업비를 공개합니다.</p>
    <dl class="funding-totals"><div><dt>총 지원금</dt><dd>${won(funding.received)}</dd></div><div><dt>집행 예정액</dt><dd>${won(fundingTotals.planned)}</dd></div><div><dt>계획상 잔액 · 추후 사업비</dt><dd>${won(fundingTotals.unallocated)}</dd></div></dl>
    <p class="funding-formula">총 지원금 ${won(funding.received)} − 집행 예정액 ${won(fundingTotals.planned)} = 계획상 잔액 ${won(fundingTotals.unallocated)}</p>
    <h3>월별 집행 계획</h3><dl class="funding-months">${fundingTotals.byMonth.map((item) => `<div><dt>${item.month}월</dt><dd>${won(item.amount)}</dd></div>`).join("")}</dl>
    ${detailed ? `<h3>집행 계획 세부항목 · ${funding.plannedExpenses.length}건</h3><ol class="expense-list">${funding.plannedExpenses.map((item) => `<li><div class="expense-heading"><div><span class="expense-month">2026년 ${item.month}월 계획</span><h4>${escapeHtml(item.category)}</h4></div><strong class="expense-amount">${won(item.amount)}</strong></div><p>${escapeHtml(item.detail)}</p></li>`).join("")}</ol>` : `<p><a class="text-link" href="${funding.href}">월별 집행 계획 ${funding.plannedExpenses.length}건 자세히 보기</a></p>`}
    <h3>추후 사업비 ${won(fundingTotals.unallocated)}</h3><p>추가 상담·홍보·운영비 등 사업에 필요한 경우 사용할 예정입니다.</p>
    <aside class="funding-scope"><h3>공개 기준</h3><p><time datetime="${funding.confirmedAt}">2026년 9월 24일</time> 운영자 정정 자료 기준입니다. 위 금액은 집행 계획으로, 실제 지출 완료액이나 현재 계좌 잔액을 뜻하지 않습니다.</p><p>노원구청 마을공동체 사업 지원금 ${won(funding.received)}에 한정한 공개이며, 단체 전체의 연간 결산이나 지원기관의 정산 승인 결과를 뜻하지 않습니다.</p></aside>
  </section>`;
}

export function fundingPage(activity) {
  const body = pageHero({
    eyebrow: "운영기록 · 지원금 사용 계획",
    title: "노원구청 마을공동체 사업 지원금<br>사용 계획을 공개합니다.",
    description: "총 지원금 60만 원 중 40만 원은 7~11월 상담·홍보·프로그램 운영에 배정하고, 20만 원은 추후 사업비로 사용할 계획입니다.",
    meta: '<div class="page-meta"><span>게시·정정일 <time datetime="2026-09-24">2026년 9월 24일</time></span><span>계획 기간 2026년 7~11월</span><span>작성 한지붕 운영팀</span></div>',
  }) + `<section class="section"><div class="container content-layout"><article class="prose">${fundingSummary({ detailed: true })}
    <h2>지원금과 현재 무료상담은 이렇게 구분합니다</h2><p>위 내역은 지원금의 사용 계획으로, 어르신에게 청구하는 상담료가 아닙니다. 현재 전화·이메일 기초상담은 한지붕 대표와 운영진이 무료로 응대합니다.</p><p>경로당·복지시설 방문 운영경비는 일반 가정을 대상으로 한 방문상담·안전진단 서비스 제공을 뜻하지 않습니다.</p>
    <h2>정정 안내</h2><p>2026년 9월 24일 운영자의 정정 요청에 따라 앞서 공개한 사용 내역을 위 집행 계획으로 변경했습니다. 지원사업명과 월별 항목·금액을 함께 바로잡았습니다.</p>
    <h2>증빙과 공개 원칙</h2><p>지출 증빙은 개인정보와 거래 세부정보를 보호하여 관리합니다. 이 페이지에는 개인의 계좌번호, 연락처, 서명이 들어 있는 원본 영수증이나 원본 상담기록을 공개하지 않습니다.</p><p>지원금 수령은 지원기관이 한지붕의 모든 서비스의 품질이나 안전을 보증한다는 의미가 아닙니다. 공개 내역의 확인이나 정정이 필요한 경우 <a href="${site.emailHref}">${site.email}</a>으로 문의해 주세요.</p>
    <h2>함께 확인하기</h2><ul><li><a href="/transparency/">단체 등록정보와 운영·회계 원칙</a></li><li><a href="/programs/senior-home-consulting/">현재 이용 가능한 무료상담</a></li><li><a href="/activities/field-records/">어르신 상담 현장 사진</a></li></ul></article><aside class="side-nav"><h2>관련 안내</h2><a href="#funding">지원금 사용 계획</a><a href="/transparency/">운영·투명성</a><a href="/activities/">활동과 기록</a><a href="/contact/">전화·이메일 문의</a></aside></div></section>`;
  return layout({ title: activity.title, description: activity.description, path: activity.href, body, type: "article", publishedAt: activity.publishedAt, updatedAt: activity.updatedAt,
    breadcrumbs: [{ label: "활동과 기록", href: "/activities/" }, { label: "마을공동체 사업 지원금 사용 계획", href: activity.href }],
    jsonLd: { "@context": "https://schema.org", "@type": "Article", headline: activity.title, datePublished: activity.publishedAt, dateModified: activity.updatedAt, author: { "@type": "Organization", name: site.name }, mainEntityOfPage: absolute(activity.href) },
  });
}
