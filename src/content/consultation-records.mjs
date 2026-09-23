// Activity facts and the first three photos' chronological mapping were supplied
// by the operator. Publication dates must not be inferred from activity dates.
export const consultationRecords = Object.freeze([
  {
    id: "consultation-july", date: "2026-07-18", dateLabel: "2026년 7월 18일",
    publishedAt: "2026-09-24", updatedAt: "2026-09-24", author: "한지붕 운영팀",
    title: "공릉동 어르신 주거공간 활용 상담", area: "서울시 노원구 공릉동",
    participants: "지역 어르신 12명", photoIndex: 0,
    overview: "자녀가 독립한 뒤 사용하지 않는 방을 어떻게 관리하고 있는지, 남는 공간을 다른 사람과 함께 사용하는 방안을 검토할 때 어떤 점이 걱정되는지 이야기를 들었습니다.",
    questions: ["자녀가 독립한 뒤 남은 방을 활용해도 괜찮을까요?", "모르는 사람과 함께 생활하면 안전하지 않을까요?", "가족에게는 언제, 어떻게 설명해야 하나요?", "주방과 욕실을 함께 사용하면 불편하지 않을까요?"],
    guidance: ["가족 구성원과 먼저 합의할 사항과 개인공간·공용공간을 구분하는 방법을 안내했습니다.", "공동생활 전에는 기상·취침·식사·귀가 시간, 방문객과 청소 방법 등 서로의 생활습관을 미리 이야기해야 한다는 점을 설명했습니다."],
    followup: ["반복적으로 나온 질문을 ‘공동생활 전 가족과 확인할 사항’ 상담자료에 반영했습니다.", "추가 상담을 희망하는 참여자에게 무료상담 문의방법과 연락처를 안내했습니다."],
    caption: "2026년 7월 18일 공릉동 상담 현장. 자녀 독립 후 남은 방의 활용과 공동생활 전 확인사항을 안내했습니다. 참여자의 이름과 상세주소는 공개하지 않습니다.",
  },
  {
    id: "consultation-august", date: "2026-08-22", dateLabel: "2026년 8월 22일",
    publishedAt: "2026-09-24", updatedAt: "2026-09-24", author: "한지붕 운영팀",
    title: "어르신 주거·복지정보 무료상담", area: "서울시 노원구 하계동",
    participants: "지역 어르신 9명", photoIndex: 1,
    overview: "고령가구의 주거공간 활용과 관련해 계약, 세금, 건강보험, 전입신고 등의 질문을 듣고 확인해야 할 기관과 준비할 내용을 정리했습니다.",
    questions: ["남는 방을 다른 사람에게 제공하면 세금이 발생하나요?", "건강보험료나 연금에 영향을 줄 수 있나요?", "같이 사는 사람이 전입신고를 할 수 있나요?", "계약서를 반드시 작성해야 하나요?"],
    guidance: ["세금과 보험료 등에 대해 개인별 결과를 일률적으로 판단하거나 보장하지 않고, 관계기관이나 자격을 갖춘 전문가에게 확인할 질문을 정리해 전달했습니다.", "계약을 검토할 때 금액·기간·공과금·공용공간 사용기준·중도종료 조건을 빠뜨리지 않고 확인하고, 합의사항을 문서로 남기는 중요성을 안내했습니다. 개별 계약의 효력이나 세금·급여 변동을 판단한 상담은 아닙니다."],
    followup: ["세금·전입신고·건강보험 관련 반복 질문을 정리해 어르신용 주거상담 FAQ 제작을 시작했습니다.", "개별 법률·세무 판단은 관계기관이나 자격을 갖춘 전문가의 확인이 필요하다고 안내했습니다."],
    caption: "2026년 8월 22일 하계동 상담 현장. 주거공간 활용과 관련한 질문을 듣고 확인할 내용을 안내했습니다. 상담내용은 개인을 식별할 수 없도록 요약했습니다.",
  },
  {
    id: "consultation-september", date: "2026-09-12", dateLabel: "2026년 9월 12일",
    publishedAt: "2026-09-24", updatedAt: "2026-09-24", author: "한지붕 운영팀",
    title: "가족과 함께하는 공동생활 준비 상담", area: "서울시 노원구 공릉동",
    participants: "어르신 7명 · 가족 3명", photoIndex: 2,
    overview: "어르신 혼자 결정하기 어려운 주거공간 활용 문제를 가족과 함께 논의할 수 있도록 가족동의, 안전확인, 생활규칙과 사생활 보호에 관한 상담을 진행했습니다.",
    questions: ["부모님은 괜찮다고 하지만 자녀는 걱정됩니다.", "상대방의 신원은 어떻게 확인하나요?", "생활 중 문제가 생기면 누가 중재하나요?", "가족이나 친구가 집에 방문해도 되나요?"],
    guidance: ["어르신과 가족의 걱정을 각각 확인하고, 서로 합의한 내용만 생활규칙에 반영하는 방법을 안내했습니다.", "상대방의 신원만으로 공동생활의 적합성을 판단하지 않고, 당사자가 동의한 범위에서 재학·직업과 일상 일정, 귀가시간·방문객 등 생활에 필요한 사항을 함께 이야기하도록 안내했습니다.", "불편이 생겼을 때 연락할 방법과 상황을 기록·조율할 담당자를 미리 합의하는 중요성을 설명했습니다. 한지붕이 신원조회나 상시 중재를 제공한다는 뜻은 아닙니다."],
    followup: ["상담에서 확인한 질문을 공동생활 사전질문지에 반영했습니다."],
    checklist: ["희망 계약기간", "주중·주말 생활시간", "개인공간과 공용공간 구분", "식사 및 주방 이용방식", "청소 및 세탁 기준", "방문객과 외박 기준", "불편사항 전달방법", "당사자 동의를 받은 가족 비상연락 방법"],
    caption: "2026년 9월 12일 공릉동 상담 현장. 어르신과 가족이 공동생활 전 안전, 생활규칙, 사생활 보호에 관해 상담했습니다.",
  },
].map((record) => Object.freeze({
  ...record,
  href: `/activities/${record.date}-${record.id}/`,
})));

export function validateConsultationRecord(record) {
  for (const key of ["id", "date", "title", "area", "participants", "overview", "href", "publishedAt", "updatedAt", "author"]) {
    if (typeof record[key] !== "string" || !record[key].trim()) throw new Error(`Activity field missing: ${key}`);
  }
  for (const key of ["questions", "guidance", "followup"]) {
    if (!Array.isArray(record[key]) || !record[key].length) throw new Error(`Activity content missing: ${key}`);
  }
  for (const key of ["date", "publishedAt", "updatedAt"]) if (!/^\d{4}-\d{2}-\d{2}$/.test(record[key])) throw new Error(`Invalid activity date: ${key}`);
  if (record.updatedAt < record.publishedAt) throw new Error("Modified date precedes publication");
  if (!Number.isInteger(record.photoIndex) || record.photoIndex < 0) throw new Error("Activity photo mapping missing");
}
