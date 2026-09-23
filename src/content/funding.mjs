// Public plan and actual spending summary supplied by the operator on 2026-09-24.
// Receipts were described by the operator, not independently inspected here.
// The reporting date is not the grant payment date or an agency approval date.
export const funding = Object.freeze({
  provider: "노원구청",
  source: "마을공동체 사업 지원금",
  grantProgram: "노원구청 마을공동체 사업",
  activityName: "노인복지 및 지역 어르신 무료상담",
  received: 600000,
  currency: "KRW",
  period: "2026년 7~11월",
  disclosureType: "plan-and-actual",
  executionAsOf: "2026-09-20",
  confirmedAt: "2026-09-24",
  receivedAt: null,
  officialProjectName: "마을공동체 사업",
  agencySettlementApproved: null,
  href: "/activities/nowon-grant-execution/",
  plannedExpenses: Object.freeze([
    { month: 7, category: "상담 홍보비", detail: "무료상담 안내 포스터·리플렛 제작", amount: 70000 },
    { month: 8, category: "상담 운영비", detail: "상담기록지, 안내자료, 운영물품 준비", amount: 90000 },
    { month: 9, category: "현장 운영경비", detail: "경로당·복지시설 방문 및 조사활동", amount: 80000 },
    { month: 10, category: "프로그램 운영비", detail: "노인복지·주거정보 안내 프로그램", amount: 80000 },
    { month: 11, category: "결과정리비", detail: "조사내용 정리 및 후속 안내자료 제작", amount: 80000 },
  ].map(Object.freeze)),
  actualExpenses: Object.freeze([
    { date: "2026-07-16", detail: "무료상담 안내 리플렛 인쇄", evidence: "카드전표·거래명세서", amount: 58300 },
    { date: "2026-08-09", detail: "상담기록지·파일·명찰 구입", evidence: "카드전표", amount: 31200 },
    { date: "2026-08-22", detail: "어르신용 상담 안내자료 출력·제본", evidence: "현금영수증·거래명세서", amount: 44000 },
    { date: "2026-09-11", detail: "실태조사 설문지·기록용품 제작", evidence: "카드전표", amount: 39600 },
    { date: "2026-09-12", detail: "현장 방문 교통비", evidence: "교통이용내역", amount: 18400 },
  ].map(Object.freeze)),
});

export const fundingTotals = Object.freeze({
  spent: funding.actualExpenses.reduce((sum, item) => sum + item.amount, 0),
  unspent: funding.received - funding.actualExpenses.reduce((sum, item) => sum + item.amount, 0),
  planned: funding.plannedExpenses.reduce((sum, item) => sum + item.amount, 0),
  unallocated: funding.received - funding.plannedExpenses.reduce((sum, item) => sum + item.amount, 0),
  byMonth: Object.freeze([7, 8, 9, 10, 11].map((month) => Object.freeze({
    month,
    amount: funding.plannedExpenses.filter((item) => item.month === month).reduce((sum, item) => sum + item.amount, 0),
  }))),
});
