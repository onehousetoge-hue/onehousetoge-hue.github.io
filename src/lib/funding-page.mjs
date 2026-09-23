import { funding, fundingTotals } from "../content/funding.mjs";
import { site } from "../config/site.mjs";
import { absolute, escapeHtml, layout, pageHero } from "./template.mjs";

const won = (amount) => `${amount.toLocaleString("ko-KR")}원`;

export function fundingSummary({ detailed = false } = {}) {
  return `<section class="funding-section" id="funding" aria-labelledby="funding-title">
    <p class="eyebrow">공모사업 지원금 · 집행내역 공개</p>
    <h2 id="funding-title">60만 원의 지원금,<br>이렇게 사용했습니다.</h2>
    <p>한지붕은 노원구청 공모사업을 통해 지원금 ${won(funding.received)}을 받았습니다. 운영자가 제공한 ${funding.period} 집행내역을 기준으로 수입과 지출을 공개합니다.</p>
    <dl class="funding-totals"><div><dt>이 지원금 수입</dt><dd>${won(funding.received)}</dd></div><div><dt>제공 내역의 지출 합계</dt><dd>${won(fundingTotals.spent)}</dd></div><div><dt>계산 잔액</dt><dd>${won(fundingTotals.balance)}</dd></div></dl>
    <p class="funding-formula">지원금 ${won(funding.received)} − 지출 ${won(fundingTotals.spent)} = 잔액 ${won(fundingTotals.balance)}</p>
    <h3>월별 사용 금액</h3><dl class="funding-months">${fundingTotals.byMonth.map((item) => `<div><dt>${item.month}월</dt><dd>${won(item.amount)}</dd></div>`).join("")}</dl>
    ${detailed ? `<h3>지출 세부내역 · 6건</h3><ol class="expense-list">${funding.expenses.map((item) => `<li><div class="expense-heading"><div><span class="expense-month">2026년 ${item.month}월</span><h4>${escapeHtml(item.category)}</h4></div><strong class="expense-amount">${won(item.amount)}</strong></div><p>${escapeHtml(item.detail)}</p></li>`).join("")}</ol>` : `<p><a class="text-link" href="${funding.href}">월별 지출 6건과 공개 기준 자세히 보기</a></p>`}
    <aside class="funding-scope"><h3>이 내역의 범위</h3><p><time datetime="${funding.confirmedAt}">2026년 9월 24일</time> 운영자 제공 내역 기준입니다. 노원구청 공모사업 지원금 ${won(funding.received)}에 한정한 공개 요약이며, 단체 전체의 연간 결산이나 지원기관의 정산 승인 결과를 뜻하지 않습니다.</p><p>계산 잔액은 이 지원금 수입에서 제공된 지출 합계를 뺀 금액입니다. 단체 전체 계좌 잔액을 의미하지 않습니다.</p></aside>
  </section>`;
}

export function fundingPage(activity) {
  const body = pageHero({
    eyebrow: "운영기록 · 지원금 집행",
    title: "노원구청 공모사업 지원금<br>사용 내역을 공개합니다.",
    description: "상담 안내 홍보물, 운영 소모품, 상담·현장 운영과 결과 정리에 사용한 지원금의 항목별 내역입니다.",
    meta: '<div class="page-meta"><span>게시·확인일 <time datetime="2026-09-24">2026년 9월 24일</time></span><span>집행내역 기간 2026년 7~9월</span><span>작성 한지붕 운영팀</span></div>',
  }) + `<section class="section"><div class="container content-layout"><article class="prose">${fundingSummary({ detailed: true })}
    <h2>지원금과 현재 무료상담은 이렇게 구분합니다</h2><p>위 내역은 지원금으로 사용한 비용을 정리한 것으로, 어르신에게 청구한 상담료가 아닙니다. 현재 전화·이메일 기초상담은 한지붕 대표와 운영진이 무료로 응대합니다.</p><p>지출 항목의 전문가·강사 활동비가 현재 개별 법률·세무 자문 제공을 의미하지는 않습니다. 복지관·경로당 방문 경비도 일반 가정을 대상으로 한 방문상담·안전진단 서비스 제공을 뜻하지 않습니다.</p>
    <h2>증빙과 공개 원칙</h2><p>지출 증빙은 개인정보와 거래 세부정보를 보호하여 관리합니다. 이 페이지에는 개인의 계좌번호, 연락처, 서명이 들어 있는 원본 영수증이나 원본 상담기록을 공개하지 않습니다.</p><p>지원금 수령은 지원기관이 한지붕의 모든 서비스의 품질이나 안전을 보증한다는 의미가 아닙니다. 공개 내역의 확인이나 정정이 필요한 경우 <a href="${site.emailHref}">${site.email}</a>으로 문의해 주세요.</p>
    <h2>함께 확인하기</h2><ul><li><a href="/transparency/">단체 등록정보와 운영·회계 원칙</a></li><li><a href="/programs/senior-home-consulting/">현재 이용 가능한 무료상담</a></li><li><a href="/activities/field-records/">어르신 상담 현장 사진</a></li></ul></article><aside class="side-nav"><h2>관련 안내</h2><a href="#funding">지원금·지출 요약</a><a href="/transparency/">운영·투명성</a><a href="/activities/">활동과 기록</a><a href="/contact/">전화·이메일 문의</a></aside></div></section>`;
  return layout({ title: activity.title, description: activity.description, path: activity.href, body, type: "article", publishedAt: activity.publishedAt, updatedAt: activity.updatedAt,
    breadcrumbs: [{ label: "활동과 기록", href: "/activities/" }, { label: "공모사업 지원금 집행내역", href: activity.href }],
    jsonLd: { "@context": "https://schema.org", "@type": "Article", headline: activity.title, datePublished: activity.publishedAt, dateModified: activity.updatedAt, author: { "@type": "Organization", name: site.name }, mainEntityOfPage: absolute(activity.href) },
  });
}
