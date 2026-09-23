// Public facts supplied by the operator on 2026-09-24.
// The reporting date is not the grant payment date or an agency approval date.
export const funding = Object.freeze({
  provider: "노원구청",
  source: "공모사업 지원금",
  received: 600000,
  currency: "KRW",
  period: "2026년 7~9월",
  confirmedAt: "2026-09-24",
  receivedAt: null,
  officialProjectName: null,
  agencySettlementApproved: null,
  href: "/activities/nowon-grant-execution/",
  expenses: Object.freeze([
    { month: 7, category: "홍보비", detail: "노인 무료상담 안내 포스터·리플렛 제작", amount: 100000 },
    { month: 7, category: "운영 소모품비", detail: "상담 기록지, 파일, 명찰, 문구류 등", amount: 50000 },
    { month: 8, category: "노인 무료상담 진행비", detail: "상담 진행을 위한 전문가·강사 활동비", amount: 150000 },
    { month: 8, category: "현장 운영비", detail: "복지관·경로당 방문 교통비 및 운영경비", amount: 50000 },
    { month: 9, category: "노인복지 프로그램 운영비", detail: "참여 어르신 대상 상담·정보제공 프로그램", amount: 150000 },
    { month: 9, category: "홍보·결과정리비", detail: "추가 홍보물, 결과보고 자료 제작 등", amount: 100000 },
  ].map(Object.freeze)),
});

export const fundingTotals = Object.freeze({
  spent: funding.expenses.reduce((sum, item) => sum + item.amount, 0),
  balance: funding.received - funding.expenses.reduce((sum, item) => sum + item.amount, 0),
  byMonth: Object.freeze([7, 8, 9].map((month) => Object.freeze({
    month,
    amount: funding.expenses.filter((item) => item.month === month).reduce((sum, item) => sum + item.amount, 0),
  }))),
});
