// Distinguish current support from historical records in every activity template.
export function serviceScope(context = "past") {
  const lead = context === "external"
    ? "대표자가 외부 사업의 자격으로 참여한 기록입니다. 방송 속 입주·운영 사례를 한지붕이 수행한 성과로 제시하는 것은 아닙니다."
    : "아래는 당시 진행한 활동의 기록입니다. 과거 현장활동이나 운영방안 논의가 현재 주택 방문·입주 지원 신청을 뜻하지는 않습니다.";
  return `<aside class="notice service-scope" data-service-scope="${context}"><h2>${context === "external" ? "대표자 외부활동과 현재 사업을 구분합니다" : "활동 당시의 기록과 현재 이용방법"}</h2><p>${lead}</p><p>현재 개인 기초상담은 전화·이메일로 진행합니다. 입주자 연결·계약대행과 주택 방문상담은 제공하지 않습니다. 기관 현장 프로그램은 대상·주제·여건을 사전 협의합니다.</p><a class="text-link" href="/programs/senior-home-consulting/">현재 무료상담 범위 확인</a></aside>`;
}
