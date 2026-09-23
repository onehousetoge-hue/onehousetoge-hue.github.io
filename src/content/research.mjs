// Operator-provided interim summary; participant counts are deduplicated people,
// not consultation attendances or a representative population sample.
export const research = Object.freeze({
  title: "노원구 고령가구 유휴공간 및 세대공존 실태조사",
  start: "2026-07-15", end: "2026-11-30", asOf: "2026-09-20", publishedAt: "2026-09-24",
  area: "서울시 노원구 공릉동·하계동 일대",
  methods: "대면상담, 간단한 설문, 개별 인터뷰, 기관 의견청취",
  stage: "1차 의견수집 및 질문 분류",
  participants: Object.freeze([
    { label: "지역 어르신", count: 24 }, { label: "어르신 가족", count: 8 },
    { label: "청년", count: 12 }, { label: "지역기관 관계자", count: 4 },
  ].map(Object.freeze)),
  topics: Object.freeze([
    { title: "사용하지 않는 공간의 현황", questions: ["자녀 독립 이후 남은 방이 있는지", "현재 공간을 어떻게 사용하고 있는지", "공간을 계속 비워두는 이유", "공간 활용을 검토한 경험"] },
    { title: "공동생활을 고려할 때의 걱정", questions: ["낯선 사람과의 생활에 대한 불안", "가족의 반대 또는 걱정", "주방·욕실 등 공용공간 사용", "생활시간·소음·방문객·사생활", "계약·세금·전입신고에 관한 질문"] },
    { title: "필요하다고 생각하는 안전장치", questions: ["신원과 재학·직업을 확인할 방법", "가족동의와 비상연락 방법", "생활습관 사전확인", "생활규칙 합의서와 계약내용 문서화", "불편사항 상담 및 중재창구"] },
    { title: "청년이 필요로 하는 주거조건", questions: ["학교·직장과의 거리와 월 주거비", "최소 계약기간", "개인방의 크기·가구", "개인공간과 공용공간의 분리", "함께 사는 가족의 생활패턴", "문제가 생겼을 때 필요한 지원"] },
  ]),
  findings: Object.freeze([
    { title: "낯선 사람과 함께 사는 것에 대한 걱정", summary: "신원확인뿐 아니라 상대방의 일상 일정과 직업·재학 상태 등 생활에 필요한 정보를 함께 확인하고 싶다는 의견이 있었습니다." },
    { title: "가족이 이해할 수 있는 설명자료", summary: "어르신 본인의 의사와 함께 가족의 걱정을 듣고, 공동생활 방식과 안전을 위해 확인할 사항을 설명하는 자료가 필요하다는 의견이 있었습니다." },
    { title: "욕실과 주방을 함께 쓰는 기준", summary: "개인방뿐 아니라 공용공간 사용시간, 청소방법과 물품보관 위치를 미리 정하고 싶다는 의견이 있었습니다." },
    { title: "이해하기 쉬운 계약·제도 안내", summary: "계약기간, 월 이용금액, 공과금, 중도종료 조건과 확인할 기관을 쉬운 말로 안내해 달라는 요청이 있었습니다." },
    { title: "불편사항을 전달할 연락창구", summary: "당사자끼리 해결하기 어려운 갈등이 생겼을 때 상황을 듣고 조율할 별도 연락창구가 필요하다는 의견이 있었습니다." },
  ]),
  timeline: Object.freeze([
    { period: "2026년 7월 15일부터", title: "조사 설계", status: "진행 기록", items: ["조사목적과 주요 질문 설정", "상담기록 작성방식 검토", "개인정보를 제외한 기록항목 정리"] },
    { period: "2026년 8~9월", title: "현장 의견수집", status: "진행 중", items: ["어르신 무료상담과 가족·청년 의견청취", "지역기관 관계자 인터뷰", "반복 질문과 우려사항 분류"] },
    { period: "2026년 10월", title: "자료 정리 및 분석", status: "예정", items: ["의견의 주제별 분류", "어르신·가족·청년 의견 비교", "상담자료와 생활규칙 개선사항 도출"] },
    { period: "2026년 11월", title: "조사결과 요약", status: "예정", items: ["주요 조사내용과 조사방법·한계 공개", "무료상담 자료와 향후 프로그램에 반영"] },
  ]),
});
export const researchTotal = research.participants.reduce((sum, group) => sum + group.count, 0);
