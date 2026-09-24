import { escapeHtml } from "../lib/template.mjs";

const commonMeta = {
  author: "한지붕 운영팀", publishedAt: "2026-09-23", publishedLabel: "2026년 9월 23일",
  updatedAt: "2026-09-24", updatedLabel: "2026년 9월 24일",
  reviewNote: "한지붕 자체 생활 가이드 · 외부 전문가 검수 자료가 아닙니다.",
  noindex: false, photo: false,
};

export const officialSources = Object.freeze({
  legal: { title: "대한법률구조공단 — 법률상담과 상담예약", url: "https://klac.or.kr/", description: "계약·보증금 등 법률문제의 상담 경로를 확인합니다. 법률상담 전화는 132입니다.", checkedAt: "2026-09-23" },
  housing: { title: "마이홈포털 — 주거복지서비스 안내", url: "https://www.myhome.go.kr/hws/portal/main/selectMyHomeInfoView.do", description: "주거복지서비스와 공공주택 정보를 확인합니다. 마이홈 콜센터는 1600-1004입니다.", checkedAt: "2026-09-23" },
  foreign: { title: "하이코리아 — 외국인 행정·생활 안내", url: "https://www.hikorea.go.kr/Main.pt?locale=kr", description: "체류·출입국 관련 공식 안내와 다국어 상담 경로를 확인합니다. 외국인종합안내센터는 1345입니다.", checkedAt: "2026-09-23" },
});

function field(id, label, hint = "실명·연락처·상세주소 없이 적어 주세요.") {
  return `<div class="worksheet-field"><label for="${id}">${escapeHtml(label)}</label><p id="${id}-hint" class="field-hint">${escapeHtml(hint)}</p><textarea id="${id}" rows="3" maxlength="1500" autocomplete="off" aria-describedby="${id}-hint worksheet-privacy" data-worksheet></textarea><div class="print-answer" data-print-answer="${id}" aria-hidden="true"></div></div>`;
}
function checklist(id, items) {
  return `<fieldset class="worksheet-checklist" data-checklist><legend>마지막 확인</legend>${items.map((item, index) => `<label for="${id}-${index}"><input type="checkbox" id="${id}-${index}" data-local-check><span>${escapeHtml(item)}</span></label>`).join("")}<p class="check-progress" data-check-progress role="status" aria-live="polite">0 / ${items.length}개 확인</p></fieldset>`;
}
function section(id, title, body) { return { id, title, body }; }

const items = [
  {
    slug: "family-checklist", category: "가족 대화", title: "가족과 먼저 이야기할 10가지 질문",
    description: "당사자의 생각부터 듣고, 합의한 내용과 아직 결정하지 않을 내용을 나누는 인쇄용 가족회의 질문지입니다.",
    outcome: "회의 뒤 ‘합의한 것·보류한 것·다시 확인할 것’을 한 장에 남깁니다.", readTime: "읽기 약 5분 · 예상 시간",
    related: ["shared-living-rules", "consultation-preparation"], program: "senior-home-consulting", sources: ["legal"],
    sections: [
      section("start", "1. 결론보다 당사자의 생각을 먼저 듣습니다", `<p>빈방이 있어도 공동생활을 시작해야 하는 것은 아닙니다. 현재 그 집에 사는 분이 원하는 점과 원하지 않는 점을 먼저 말하고, 가족은 걱정되는 점을 따로 적어 보세요. 오늘 회의의 목표는 계약이나 입주를 결정하는 것이 아니라 서로의 기준을 알아보는 것입니다.</p><ol><li>남는 공간을 어떻게 쓰고 싶은가요?</li><li>생활에서 꼭 지키고 싶은 것은 무엇인가요?</li><li>가족이 기대하는 점과 걱정하는 점은 무엇인가요?</li><li>더 알아본 뒤 결정하고 싶은가요, 지금은 원하지 않나요?</li></ol>${field("family-wishes", "당사자의 생각과 가족의 질문", "사람 이름 대신 ‘거주자’, ‘가족’처럼 역할로 적어 주세요.")}`),
      section("questions", "2. 구체적인 생활 장면을 함께 떠올립니다", `<p>‘괜찮을 것 같다’에서 한 걸음 더 나아가 하루의 장면을 비교합니다. 의견이 다르면 그 자리에서 설득하기보다 다른 이유를 들어 보세요.</p><ul><li>개인방과 함께 쓰는 곳은 어디인가요?</li><li>잠자는 시간과 조용히 쉬고 싶은 시간은 언제인가요?</li><li>주방·욕실 사용이 겹치면 어떻게 하나요?</li><li>방문객, 청소, 쓰레기 처리는 어떤 기준이 편한가요?</li><li>불편을 누구에게 어떤 방식으로 말할까요?</li><li>함께 살지 않기로 하거나 중단할 때 무엇을 확인할까요?</li></ul>${field("family-agreed", "서로 같은 생각인 항목")}`),
      section("pause", "3. 오늘 결정하지 않아도 되는 항목을 남깁니다", `<p>당사자가 망설이거나 가족 의견이 다르면 결정은 보류할 수 있습니다. 비용·계약·세금·시설 안전처럼 별도 확인이 필요한 문제도 생활 대화만으로 결론 내리지 않습니다. 계약의 권리·의무가 궁금하면 아래 공식 법률상담 안내를 이용하세요.</p>${field("family-pending", "보류한 항목과 확인할 곳")}${field("family-next", "다음 대화에서 확인할 질문", "다시 이야기할 시점은 모두가 동의한 경우에만 적습니다.")}${checklist("family-check", ["당사자가 원하지 않는 점도 들었습니다.", "합의한 내용과 보류한 내용을 구분했습니다.", "전문 확인이 필요한 문제를 따로 적었습니다.", "참여하지 않을 선택도 존중하기로 했습니다."])}`),
    ],
  },
  {
    slug: "shared-living-rules", category: "생활규칙", title: "함께 살기 전 확인할 생활규칙",
    description: "생활시간·방문객·청소·비용 기준을 직접 적고, 예외와 재논의 시점까지 정리하는 빈 워크시트입니다.",
    outcome: "막연한 부탁을 ‘누가·언제·무엇을’ 하는지 알 수 있는 생활 약속으로 바꿉니다.", readTime: "읽기 약 5분 · 예상 시간",
    related: ["private-common-space", "conflict-prevention"], program: "intergenerational-volunteer", sources: [],
    sections: [
      section("how", "1. 각자 적고, 다른 부분부터 이야기합니다", `<p>한 사람이 규칙을 정해 통보하지 않습니다. 각자 편한 기준을 말한 뒤 서로 지킬 수 있는 범위를 찾습니다. 다음 빈칸은 생활 대화를 돕는 도구이며 계약서나 법률문서를 대신하지 않습니다.</p><p>표현 예시: ‘조용히 지내기’ 대신 ‘합의한 휴식 시간에는 공용공간의 영상 소리를 줄이기’. 예시는 실제 상담 사례가 아니라 작성 방법을 설명하기 위한 문장입니다.</p>`),
      section("worksheet", "2. 생활의 여섯 가지 기준을 적습니다", `${field("rules-time", "생활시간과 소음", "쉬는 시간, 통화·TV·세탁기 사용, 일정 변경 시 알릴 방법")}${field("rules-space", "주방·욕실·공용물품", "사용이 겹칠 때 순서, 사용 후 정리, 개인 물건 구분")}${field("rules-visitors", "방문객과 숙박", "방문 전 알릴 방법, 가능한 시간, 숙박은 별도로 이야기할지 여부")}${field("rules-cleaning", "청소와 쓰레기", "공간별 담당, 주기, 담당하기 어려운 날의 조정 방법")}${field("rules-cost", "생활비 항목과 확인 방법", "공용 소모품·공과금 등 항목과 확인 방법만 적습니다. 계좌번호는 적지 마세요.")}${field("rules-exceptions", "예외와 다시 살펴볼 시점", "일정이 바뀌었을 때의 연락 방법과 다음 점검 때 이야기할 항목")}`),
      section("review", "3. 지키기 어려운 약속은 다시 조정합니다", `<p>실제 생활에서 불편한 항목을 발견하면 상대의 성격을 평가하기보다 어떤 행동이 어려웠는지 이야기합니다. 비용·계약 권리의 변경은 이 작성표만으로 처리하지 말고 관련 내용을 별도로 확인하세요.</p>${checklist("rules-check", ["모두가 내용을 이해했습니다.", "누가 무엇을 할지 구체적으로 적었습니다.", "예외 상황과 다시 이야기할 방법을 정했습니다.", "한쪽에 일방적인 의무가 생기지 않는지 살폈습니다."])}`),
    ],
  },
  {
    slug: "consultation-preparation", category: "청년 주거정보", title: "청년 주거 체크리스트",
    description: "집을 알아볼 때 비용·생활환경·통학시간·개인공간을 비교하고 무료상담에 필요한 질문을 준비합니다.",
    outcome: "주거비·통학시간·개인공간을 비교하고, 계약 전에 따로 확인할 질문을 정리합니다.", readTime: "읽기 약 5분 · 예상 시간",
    related: ["family-checklist", "private-common-space"], program: "senior-home-consulting", sources: ["legal", "housing"],
    sections: [
      section("youth-housing", "집을 알아보기 전, 비용 외에 무엇을 볼까요?", `<p>청년의 주거 선택에는 월세뿐 아니라 통학·출근 시간, 거주기간, 생활환경과 개인공간도 중요합니다. 아래 항목을 서로 비교하고 모르는 부분은 질문으로 남겨보세요. 계약을 체결하거나 비용을 지급하기 전에는 계약 조건과 권리관계를 전문기관에 따로 확인해야 합니다.</p>${field("youth-budget", "주거비에 포함되는 항목", "월세 외 관리비·공과금·인터넷 등 포함 여부를 질문으로 적습니다. 금융정보는 적지 마세요.")}${field("youth-route", "통학·출근과 생활환경", "이동시간, 늦은 귀가 때의 동선, 주변 생활시설 등 직접 확인할 사항")}${field("youth-space", "개인공간과 거주기간", "개인방의 출입 기준, 수납, 소음, 원하는 기간과 중도 종료 때 확인할 조건")}${checklist("youth-review", ["비용에 포함되는 항목을 구분했습니다.", "생활 동선과 시간을 확인했습니다.", "개인공간과 공용공간의 기준을 질문으로 남겼습니다.", "계약 조건은 별도로 확인하기로 했습니다."])}`),
      section("prepare", "1. 무엇이 궁금한지 짧게 적습니다", `<p>한지붕은 가족과 확인할 사항, 개인공간과 공용공간, 공동생활 규칙을 함께 정리합니다. 집수리·안전진단·부동산 중개·법률·세무 자문은 제공하지 않습니다. 무료상담을 받았다고 방을 제공하거나 계약할 의무가 생기지 않습니다.</p>${field("consult-question", "상담에서 가장 궁금한 질문 세 가지", "예: 가족 의견이 다를 때 무엇부터 이야기하면 좋을까요?")}`),
      section("minimum", "2. 초기 문의에는 최소한의 정보만 전달합니다", `<dl class="plain-definitions"><div><dt>전화·이메일로 알려줄 내용</dt><dd>이름, 답변받을 전화 또는 이메일 중 하나, 시·군·구 수준의 지역, 궁금한 내용.</dd></div><div><dt>보내지 않아도 되는 내용</dt><dd>주민등록번호, 신분증, 계좌번호, 상세주소, 가족의 실명·연락처, 진단서, 집 사진과 등기서류.</dd></div></dl><p>아래 준비 메모에는 개인정보를 적지 마세요. 이 화면의 메모는 상담 접수가 아니며 한지붕에 전송되지 않습니다.</p>${field("consult-context", "설명할 생활 상황", "예: 남는 방의 유무, 함께 쓰는 공간, 당사자와 가족의 의견 차이")}`),
      section("after", "3. 상담 뒤에는 확인할 일과 보류할 일을 나눕니다", `<p>상담에서 들은 일반 정보와 전문기관에 다시 확인할 문제를 구분하세요. 바로 결정할 필요는 없습니다. 가족이나 실제 거주자와 이야기한 뒤 다음 문의가 필요한지 판단할 수 있습니다.</p>${field("consult-after", "상담 뒤 가족과 다시 이야기할 것")}${field("consult-referral", "전문기관에 따로 확인할 질문", "계약·권리 문제는 법률상담, 주거지원제도는 공식 주거복지 안내에서 확인합니다.")}${checklist("consult-check", ["상담 목적을 한 문장으로 정리했습니다.", "초기 문의에 민감서류를 넣지 않았습니다.", "상담 범위와 전문 확인이 필요한 범위를 구분했습니다."])}`),
    ],
  },
  {
    slug: "private-common-space", category: "공간 구분", title: "우리 집 빈방 활용 체크리스트",
    description: "설명용 공간 도식과 사용기준표로 출입·보관·사용 후 정리 기준을 구분합니다.",
    outcome: "공간마다 ‘누가 사용할 수 있는지·먼저 물어볼 것·사용 후 할 일’을 정합니다.", readTime: "읽기 약 3분 · 예상 시간",
    related: ["shared-living-rules", "family-checklist"], program: "senior-home-consulting", sources: [],
    sections: [
      section("room-check", "남는 방의 현재 상태부터 살펴보세요", `<p>사용하지 않는 방이 있다는 것만으로 공동생활에 적합하다고 판단할 수는 없습니다. 이 체크리스트는 가족과 상담할 질문을 찾는 도구이며 안전진단이나 입주 가능 판정이 아닙니다.</p>${field("room-current", "방의 현재 용도와 정리할 물건", "방을 실제로 비울 수 있는지, 보관물은 어디로 옮길지 적어보세요.")}${field("room-privacy", "사생활과 공용공간에서 걱정되는 점", "출입, 소음, 물건 보관, 주방과 욕실 사용이 겹치는 시간을 살펴보세요.")}${checklist("room-review", ["거주자 본인의 의사를 확인했습니다.", "가족과 더 이야기할 부분을 남겼습니다.", "개인공간과 함께 쓸 곳을 구분했습니다.", "시설 안전은 별도 전문 확인이 필요함을 이해했습니다."])}`),
      section("diagram", "1. 색보다 이름으로 공간을 구분합니다", `<p>같은 집에서도 개인방, 함께 쓰는 곳, 허락을 구해야 하는 수납공간은 다릅니다. 아래 도식은 구분 방법을 설명하는 교육용 예시입니다. 실제 주택·평면도·방문상담 결과가 아니며 크기나 동선을 나타내지 않습니다.</p><figure class="space-figure"><div class="space-map"><div class="space-private"><strong>개인공간 A</strong><span>들어가기 전 당사자에게 묻기</span></div><div class="space-private"><strong>개인공간 B</strong><span>물건도 허락 없이 사용하지 않기</span></div><div class="space-shared"><strong>공용공간</strong><span>거실·주방·욕실 등 함께 정한 곳</span></div><div class="space-permission"><strong>별도 확인 공간</strong><span>수납장·냉장고 개인 구역 등</span></div></div><figcaption>설명용 도식 · 실제 주택과 무관 · 비율 없음</figcaption></figure>`),
      section("boundaries", "2. 사용할 권한과 사용 후 할 일을 나눠 적습니다", `<p>공용공간이라고 모든 물건을 함께 쓰는 것은 아닙니다. 같은 욕실 안의 개인 세면도구, 주방의 식재료처럼 물건의 구분도 필요합니다. 사진·도면에 집 주소나 출입 비밀번호를 적어 공유하지 마세요.</p>${field("space-private", "개인공간의 출입·물건 사용 기준")}${field("space-shared", "공용공간의 사용 순서·정리 기준")}${field("space-permission", "허락이 필요한 공간·물건과 확인 방법")}`),
      section("check", "3. 실제 생활에서 불편한 경계를 다시 살핍니다", `<p>출입할 때 다른 사람의 개인공간을 지나야 하는지, 공용물품을 보관할 곳이 충분한지 이야기해 보세요. 이 자료로 시설의 안전성이나 법적 용도를 판정할 수는 없습니다. 시설·전기·가스 등의 점검은 적합한 전문기관에 확인해야 합니다.</p>${checklist("space-check", ["개인공간을 누구나 알아볼 수 있게 구분했습니다.", "개인 물건과 공용물품을 나눴습니다.", "허락을 구할 방법을 정했습니다.", "도식만으로 안전하다고 판단하지 않았습니다."])}`),
    ],
  },
  {
    slug: "conflict-prevention", category: "갈등 예방", title: "공동생활 갈등 예방 가이드",
    description: "교육용 대화 예문을 바탕으로 관찰한 사실·불편·요청을 나누고 외부 도움이 필요한 상황을 구분합니다.",
    outcome: "상대를 평가하는 말 대신 바라는 행동을 설명하는 문장을 만들어 봅니다.", readTime: "읽기 약 8분 · 예상 시간",
    related: ["shared-living-rules", "family-checklist"], program: "intergenerational-volunteer", sources: ["legal"],
    sections: [
      section("example", "1. 평가 대신 장면과 요청을 말합니다", `<p>아래 문장은 교육용으로 만든 예시이며 실제 상담 사례·참여자 후기·성과가 아닙니다. 상대가 대화를 원치 않으면 억지로 계속하지 않습니다.</p><div class="dialogue-example"><p><strong>평가하는 말</strong><br>“왜 항상 배려가 없으세요?”</p><p><strong>생활 요청으로 바꾸기</strong><br>“어젯밤 늦은 시간에 거실 TV 소리가 방까지 들려 잠들기 어려웠어요. 쉬는 시간에는 소리를 줄이거나 이어폰을 사용하는 방법을 함께 정해 볼까요?”</p></div><p>시간·장소·행동처럼 관찰한 사실을 먼저 말하고, 어떤 불편이 있었는지와 원하는 행동을 나눠 설명합니다. 상대의 대답을 들은 뒤 서로 할 수 있는 방법을 찾습니다.</p>`),
      section("practice", "2. 나의 문장으로 바꿔 봅니다", `${field("conflict-fact", "관찰한 사실", "‘항상’, ‘절대’ 같은 평가 대신 언제 어디서 어떤 행동이 있었는지 적습니다.")}${field("conflict-impact", "생활에서 불편했던 점", "다른 사람의 실명이나 사적인 건강정보는 적지 않습니다.")}${field("conflict-request", "함께 정하고 싶은 구체적인 행동", "상대가 선택하거나 다른 방법을 제안할 수 있는 요청으로 적습니다.")}<details class="resource-details"><summary>청소 문제로 연습해 보기</summary><p>교육용 예시: “어제 조리 후 싱크대에 그릇이 남아 있어 아침 준비 공간이 부족했어요. 사용한 뒤 정리할 시점을 함께 정하면 어떨까요?”</p></details>`),
      section("help", "3. 대화만으로 해결하지 않아도 됩니다", `<p>같은 불편이 반복되면 생활규칙을 다시 살펴보고 당사자 모두가 동의하는 제3자의 도움을 검토합니다. 폭력·협박 등 즉각적인 위험이 있다면 대화를 계속하기보다 안전한 장소로 이동하고 긴급 도움을 요청하세요. 한지붕은 긴급 대응·심리치료·법률대리 기관이 아닙니다. 계약·권리와 관련한 갈등은 아래 공식 법률상담 안내를 이용할 수 있습니다.</p>${checklist("conflict-check", ["성격이 아니라 관찰한 행동을 말했습니다.", "원하는 행동을 구체적으로 요청했습니다.", "상대의 의견과 대화 중단 의사를 존중합니다.", "위험하거나 전문 도움이 필요한 상황을 구분했습니다."])}`),
    ],
  },
  {
    slug: "korean-housing-culture", category: "주거문화 안내", title: "세대공유주거 처음 알아보기",
    description: "낯선 주거 용어를 쉬운 말로 이해하고, 계약·주거지원·외국인 생활 질문에 맞는 공식 창구를 찾습니다.",
    outcome: "생활 약속과 제도상 확인할 문제를 구분하고 필요한 기관에 질문할 수 있습니다.", readTime: "읽기 약 7분 · 예상 시간",
    related: ["private-common-space", "shared-living-rules"], program: "intergenerational-volunteer", sources: ["legal", "housing", "foreign"],
    sections: [
      section("sharing-intro", "세대가 다른 사람이 함께 생활한다는 것", `<p>이 자료에서 세대공유주거는 서로 다른 세대가 한 집의 일부 공간을 함께 쓰며 생활하는 형태를 뜻합니다. 특정 법률상 주택 유형이나 한지붕의 입주 상품을 뜻하지 않습니다.</p><p>집을 임차할 때 확인하는 비용·기간 외에도 생활시간, 방문객, 청소, 개인방 출입, 주방·욕실 사용처럼 매일 부딪치는 기준을 구체적으로 이야기해야 합니다. 모두가 원하지 않으면 시작하지 않아도 됩니다.</p><ol><li>당사자와 가족의 기대·걱정을 따로 듣습니다.</li><li>개인방과 함께 쓸 공간을 구분합니다.</li><li>생활습관과 불편을 전달할 방법을 이야기합니다.</li><li>비용·계약·제도 관련 문제는 공식 창구에서 확인합니다.</li></ol><p>한지붕은 기초정보를 안내하며 입주자를 연결하거나 계약을 대행하지 않습니다. 함께 거주하면 수익이나 안전이 보장되는 것은 아닙니다.</p>${field("sharing-first", "시작하기 전에 더 알고 싶은 점")}`),
      section("words", "1. 생활에서 쓰는 말을 풀어 봅니다", `<p>다음은 생활 안내를 위한 쉬운 풀이입니다. 법적 정의나 개별 계약 해석은 아니며, 실제 부담과 반환 조건은 계약·공식 안내에서 따로 확인해야 합니다.</p><dl class="plain-definitions"><div><dt>개인공간 / 공용공간</dt><dd>한 사람이 사용하는 곳 / 함께 사용하기로 정한 곳. 공용공간 안에서도 개인 물건은 구분합니다.</dd></div><div><dt>보증금</dt><dd>주택 계약에서 맡기는 돈을 가리킵니다. 금액, 반환 조건과 권리 보호 방법은 계약 전 확인할 질문입니다.</dd></div><div><dt>월세 / 관리비</dt><dd>매달 내는 주거 비용 / 건물이나 공동시설 관리 등에 관한 비용을 가리킵니다. 전기·수도 등이 포함되는지는 따로 확인합니다.</dd></div><div><dt>분리배출</dt><dd>쓰레기를 종류별로 나눠 내놓는 일입니다. 장소·요일·방법은 거주지 관할 지자체 안내를 확인합니다.</dd></div></dl>`),
      section("questions", "2. 생활 질문과 제도 질문을 구분합니다", `<ul><li><strong>함께 사는 사람과 정할 것:</strong> 조용히 쉬는 시간, 식사·청소, 방문객, 개인 물건 사용.</li><li><strong>계약과 공식 안내에서 확인할 것:</strong> 비용 항목, 계약 상대와 조건, 보증금 반환, 전입·체류 관련 절차.</li></ul><p>‘한국에서는 모두 이렇게 한다’고 단정하지 마세요. 집과 사람마다 생활방식이 다릅니다. 이해하기 어려운 말은 쉬운 표현으로 다시 설명해 달라고 요청하고, 뜻을 모르는 서류는 충분히 확인한 뒤 판단합니다.</p>${field("culture-question", "뜻을 더 확인하고 싶은 말과 질문", "계약서 원문·신분증·주소를 이 화면에 옮겨 적지 않습니다.")}`),
      section("where", "3. 질문에 맞는 공식 창구를 찾습니다", `<p>아래 링크는 한지붕의 제휴·추천 보증 표시가 아니라 각 기관의 공식 이용안내입니다. 이용 대상, 상담 범위, 운영시간과 비용은 기관에서 다시 확인하세요.</p><ul><li><strong>계약·보증금 등 법률문제:</strong> 대한법률구조공단의 상담 안내.</li><li><strong>주거지원과 공공주택:</strong> 마이홈포털의 제도·모집 안내.</li><li><strong>체류·출입국과 외국인 생활:</strong> 하이코리아의 공식 안내와 다국어 상담 경로.</li></ul><p>한지붕은 현재 이 자료를 한국어로 제공합니다. 검수되지 않은 번역문을 공식 안내로 제공하지 않습니다.</p>${checklist("culture-check", ["생활 약속과 제도 질문을 나눴습니다.", "비용에 포함되는 항목을 확인할 질문으로 남겼습니다.", "필요한 공식 문의처를 찾았습니다."])}`),
    ],
  },
];

export const resources = Object.freeze(items.map((item) => ({
  ...commonMeta, ...item, href: `/resources/${item.slug}/`,
  content: item.sections.map(({ id, title, body }) => `<section class="resource-section" aria-labelledby="${id}"><h2 id="${id}">${escapeHtml(title)}</h2>${body}</section>`).join(""),
})));
export function getResource(slug) { return resources.find((resource) => resource.slug === slug); }
