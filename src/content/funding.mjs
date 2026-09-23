// Corrected public budget supplied by the operator on 2026-09-24.
// Planned allocations are not evidence of completed payments or a bank balance.
// The reporting date is not the grant payment date or an agency approval date.
export const funding = Object.freeze({
  provider: "노원구청",
  source: "마을공동체 사업 지원금",
  received: 600000,
  currency: "KRW",
  period: "2026년 7~11월",
  disclosureType: "plan",
  actualSpent: null,
  confirmedAt: "2026-09-24",
  receivedAt: null,
  officialProjectName: null,
  agencySettlementApproved: null,
  href: "/activities/nowon-grant-execution/",
  plannedExpenses: Object.freeze([
    { month: 7, category: "홍보비", detail: "노인 무료상담 안내 포스터·리플렛 제작", amount: 70000 },
    { month: 8, category: "노인복지 상담 운영비", detail: "어르신 대상 무료상담 진행 및 상담자료 준비", amount: 90000 },
    { month: 9, category: "현장 운영경비", detail: "경로당·복지시설 방문 및 상담 운영비", amount: 80000 },
    { month: 10, category: "노인복지 프로그램비", detail: "어르신 대상 복지정보 안내·상담 프로그램 운영", amount: 80000 },
    { month: 11, category: "홍보 및 결과정리비", detail: "추가 상담 홍보, 결과보고 자료 및 인쇄물 제작", amount: 80000 },
  ].map(Object.freeze)),
});

export const fundingTotals = Object.freeze({
  planned: funding.plannedExpenses.reduce((sum, item) => sum + item.amount, 0),
  unallocated: funding.received - funding.plannedExpenses.reduce((sum, item) => sum + item.amount, 0),
  byMonth: Object.freeze([7, 8, 9, 10, 11].map((month) => Object.freeze({
    month,
    amount: funding.plannedExpenses.filter((item) => item.month === month).reduce((sum, item) => sum + item.amount, 0),
  }))),
});
