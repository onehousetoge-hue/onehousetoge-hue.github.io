import { absolute, escapeHtml, icon } from "./template.mjs";

const subject = "빈방 월세 진단";
const title = "자주 묻는 질문";
const quickConsultation = "/consultation/";

const topics = [
  {
    id: "faq-costs",
    title: "월세와 비용",
    icon: "research",
    questions: [
      {
        id: "faq-rent-estimate",
        question: "우리 집 빈방의 예상 월세는 얼마인가요?",
        answer: "빈방 월세는 집이 있는 동네와 방 상태에 따라 달라집니다. 한지붕 무료 진단에 가까운 대학교나 지하철역, 남는 방 개수와 에어컨 유무를 알려 주세요. 매니저가 방 정보를 살펴보고 신청할 때 남긴 휴대폰 번호로 예상 월세를 안내합니다.",
        links: [{ href: "/reservation/", label: "우리 집 예상 월세 진단받기" }],
      },
      {
        id: "faq-after-estimate",
        question: "월세 진단을 받으면 꼭 방을 임대해야 하나요?",
        answer: "임대할지는 진단 결과를 받아본 뒤 집주인이 결정합니다. 예상 월세와 방을 준비하는 데 드는 비용을 살펴보고, 생활공간을 학생과 함께 써도 좋을지 생각해 보세요.",
      },
      {
        id: "faq-utilities",
        question: "관리비와 전기·가스 요금은 어떻게 나누나요?",
        answer: "먼저 최근 고지서에서 관리비에 포함된 항목과 별도로 내는 요금을 확인하세요. 학생과는 입주 전에 월세에 포함할 항목, 따로 나눠 낼 금액이나 분담 기준을 정해 적어 두면 좋습니다.",
      },
      {
        id: "faq-rental-tax",
        question: "살고 있는 집의 방 한 칸을 빌려줘도 월세에 세금이 붙나요?",
        answer: "부부가 합쳐 주택 한 채만 보유하고 그 집이 국내에 있으며 기준시가가 12억 원 이하라면, 그 집에서 받는 월세는 비과세입니다. 보유 주택 수를 셀 때는 배우자 명의의 주택도 함께 확인하세요.\n\n과세 대상인 경우에도 연간 주택임대 수입금액이 2,000만 원 이하라면 종합과세와 분리과세 중 선택할 수 있습니다. 개인별 신고 여부는 국세청에, 건강보험료와 기초연금에 미치는 영향은 각각 국민건강보험공단과 국민연금공단에 확인하세요.",
        links: [
          { href: "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7682&mi=2251", label: "국세청 주택임대소득 과세 대상" },
          { href: "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7686&mi=2255", label: "국세청 종합과세·분리과세 안내" },
        ],
      },
    ],
  },
  {
    id: "faq-application",
    title: "신청 방법과 지역",
    icon: "home",
    questions: [
      {
        id: "faq-one-spare-room",
        question: "제가 사는 아파트에 방이 한 칸만 남아도 신청할 수 있나요?",
        answer: "아파트에 남는 방이 한 칸이어도 월세 진단을 신청할 수 있습니다. 신청서에서 방 유형은 ‘아파트’, 남는 방 개수는 ‘1개’를 고르세요.",
      },
      {
        id: "faq-photos-address",
        question: "월세 진단을 신청할 때 집 사진이나 상세 주소가 필요한가요?",
        answer: "집 사진 없이 신청할 수 있고, 주소는 시·구·동까지만 적으면 됩니다. 집 위치에는 ‘서울 노원구 공릉동’처럼 동네 이름을, 인근 시설에는 가까운 대학교나 지하철역 이름을 적어 주세요.",
        links: [{ href: "/reservation/privacy/", label: "연락처와 방 정보의 보관 기간 보기" }],
      },
      {
        id: "faq-air-conditioning",
        question: "빈방에 에어컨이 없어도 월세 진단을 받을 수 있나요?",
        answer: "에어컨이 없는 방도 진단을 신청할 수 있습니다. ‘방 안 에어컨’ 항목에서 ‘없음’을 선택하세요. 매니저가 현재 방 상태를 기준으로 예상 월세와 준비할 점을 안내합니다.",
      },
      {
        id: "faq-visit-area",
        question: "서울 노원구 공릉동 밖에서도 방문 지원을 받을 수 있나요?",
        answer: "한지붕은 서울 노원구 공릉동에서 시작했고, 방문 지원 가능 여부는 집이 있는 동네별로 확인합니다. 상담 신청 페이지에 동네 이름과 필요한 도움을 적으면 매니저가 확인해 연락드립니다.",
        links: [{ href: quickConsultation, label: "우리 동네 방문 가능 여부 문의하기" }],
      },
      {
        id: "faq-parents-room",
        question: "부모님 집의 빈방을 알아보는 자녀는 무엇부터 하면 좋을까요?",
        answer: "먼저 부모님께 어느 방을 내어줄 수 있는지, 주방이나 욕실을 다른 사람과 함께 써도 편안할지 여쭤보세요. 가족이 먼저 상담을 원하면 상담 신청 페이지에 본인의 이름과 연락처로 궁금한 점을 남길 수 있습니다. 함께 살 학생은 집주인이 직접 확인하고 결정합니다.",
      },
      {
        id: "faq-consultation-options",
        question: "예상 월세 진단과 상담 신청은 어떻게 다른가요?",
        answer: "예상 월세 진단은 집 위치와 방 정보를 보내고 매니저에게 예상 금액을 안내받는 신청입니다. 상담 신청은 이름, 전화번호, 궁금한 점만 남기는 방식이라 방을 내놓을지 고민하는 단계에도 이용할 수 있습니다.",
      },
    ],
  },
  {
    id: "faq-move-in",
    title: "방 준비와 입주",
    icon: "check",
    questions: [
      {
        id: "faq-room-preparation",
        question: "빈방 청소와 가구 준비에 드는 비용은 누가 정하나요?",
        answer: "집주인과 매니저가 방 상태를 살펴보고 준비할 범위와 비용을 함께 정합니다. 그대로 쓸 가구와 치울 짐을 먼저 나누고, 청소나 새 가구가 필요한 부분을 정하면 어떤 항목에 돈이 드는지 알 수 있습니다.",
      },
      {
        id: "faq-student-matching",
        question: "어떤 대학생이 입주할지 집주인이 직접 결정하나요?",
        answer: "함께 살 학생은 집주인이 최종 결정합니다. 한지붕이 학생의 본인·재학 정보를 확인하고, 집주인은 희망 거주 기간과 귀가 시간, 흡연 여부 등 생활 조건을 미리 살펴봅니다. 조건이 맞지 않으면 다른 후보를 소개받을 수 있습니다.",
      },
      {
        id: "faq-house-rules",
        question: "귀가 시간이나 방문객에 대한 규칙은 언제 정하나요?",
        answer: "집주인과 학생이 입주 전에 생활규칙을 의논해 서면으로 남깁니다. 늦게 들어올 때 현관문을 어떻게 닫을지, 지인을 초대할 때 미리 알릴지처럼 실제 생활에서 마주칠 상황을 하나씩 정하면 좋습니다.",
      },
    ],
  },
  {
    id: "faq-living",
    title: "함께 사는 동안",
    icon: "people",
    questions: [
      {
        id: "faq-meals-laundry",
        question: "집주인이 학생의 식사나 빨래도 챙겨 줘야 하나요?",
        answer: "식사와 빨래는 각자 챙깁니다. 학생이 직접 요리하거나 세탁할 수 있도록 주방과 세탁기를 쓸 시간, 사용 후 정리하는 방법만 입주 전에 함께 정해 두세요.",
      },
      {
        id: "faq-shared-space",
        question: "주방·욕실과 각자의 방은 어떻게 구분해 쓰나요?",
        answer: "집주인과 학생이 집 구조에 맞춰 함께 쓸 공간과 각자 쓸 공간을 정합니다. 주방 수납칸을 어디까지 쓸지, 욕실 사용 시간이 겹칠 때 어떻게 할지, 개인 방에 들어갈 때는 어떻게 허락을 구할지 구체적으로 합의하세요.",
      },
      {
        id: "faq-manager-support",
        question: "입주 후 소음이나 생활 갈등이 생기면 누구에게 말하나요?",
        answer: "한지붕 매니저에게 언제 어떤 일이 있었는지 알려 주세요. 매니저가 집주인과 학생 양쪽의 이야기를 듣고 입주 전에 정한 규칙을 바탕으로 조율합니다. 같은 문제가 반복되면 계약 내용에 따라 다음 절차를 안내합니다.",
      },
      {
        id: "faq-room-damage",
        question: "학생이 살던 방의 가구나 시설이 파손되면 어떻게 하나요?",
        answer: "파손을 발견하면 상태를 사진으로 남기고 한지붕 매니저에게 알려 주세요. 입주 전 사진과 비교하면 원래 있던 흠집인지 새로 생긴 손상인지 확인하기 쉽습니다. 수리비 부담은 사용에 따른 노후화인지, 고의나 과실로 생긴 손상인지와 계약 내용을 함께 살펴 정합니다.",
      },
    ],
  },
];

export const rentFaqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "@id": absolute("/#rent-faq"),
  isPartOf: { "@type": "WebPage", "@id": absolute("/") },
  name: `${subject} ${title}`,
  inLanguage: "ko",
  mainEntity: topics.flatMap(({ questions }) => questions.map(({ id, question, answer }) => ({
    "@type": "Question",
    "@id": absolute(`/#${id}`),
    name: question,
    acceptedAnswer: { "@type": "Answer", text: answer },
  }))),
};

function renderQuestion({ id, question, answer, links = [] }, open) {
  const paragraphs = answer.split("\n\n").map(text => `<p>${escapeHtml(text)}</p>`).join("");
  const actions = links.map(({ href, label }) => `<a href="${escapeHtml(href)}">${escapeHtml(label)}</a>`).join("");
  return `<details class="rent-faq-item"${open ? " open" : ""}>
    <summary><h4>${escapeHtml(question)}</h4></summary>
    <div class="rent-faq-answer" id="${id}">${paragraphs}${actions ? `<div class="rent-faq-links">${actions}</div>` : ""}</div>
  </details>`;
}

export function rentFaqSection() {
  const jumps = topics.map(topic => `<a href="#${topic.id}">${escapeHtml(topic.title)}${icon("arrow")}</a>`).join("");
  const groups = topics.map((topic, groupIndex) => `<div class="rent-faq-group">
    <h3 id="${topic.id}"><span class="rent-faq-symbol">${icon(topic.icon)}</span>${escapeHtml(topic.title)}</h3>
    <div class="rent-faq-list">${topic.questions.map((q, index) => renderQuestion(q, groupIndex === 0 && index === 0)).join("")}</div>
  </div>`);
  return `<section class="rent-faq" id="rent-faq" aria-labelledby="rent-faq-title">
    <div class="host-container" id="faq"><div class="rent-faq-layout">
      <div class="rent-faq-index" id="faq-title">
        <h2 id="rent-faq-title"><span>${subject}</span> ${title}</h2>
        <nav class="rent-faq-nav" aria-label="자주 묻는 질문 주제">${jumps}</nav>
      </div>
      <div class="rent-faq-groups">${groups.join("")}
        <a class="rent-faq-contact" href="${quickConsultation}">매니저에게 다른 질문하기 ${icon("arrow")}</a>
      </div>
    </div></div>
  </section>`;
}
