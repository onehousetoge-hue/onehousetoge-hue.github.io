import { absolute, escapeHtml, icon } from "./template.mjs";

const subject = "빈방 월세와 한집살이";
const title = "자주 묻는 질문";
const quickConsultation = "/consultation/";

const topics = [
  {
    id: "faq-costs",
    title: "월세와 정산",
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
        id: "faq-host-payout",
        question: "매달 제가 실제로 받는 금액은 어떻게 확인하나요?",
        answer: "계약 전에 매니저와 월세, 관리비, 방 준비 비용을 나눠 확인하세요. 이용료나 공제 항목이 있다면 금액과 부담 주체를 확인하고, 집주인에게 들어오는 금액과 지급일을 계약서에 적어 두세요.",
      },
      {
        id: "faq-vacancy",
        question: "학생을 기다리는 공실 기간에도 월세가 생기나요?",
        answer: "공실 기간에 받을 수 있는 금액은 계약 조건에 달려 있습니다. 월세를 받는 첫날과 마지막 날을 계약 전에 확인하세요. 학기 사이에 방이 비거나 입주일이 미뤄질 때의 월세와 관리비도 미리 정해 두면 좋습니다.",
      },
    ],
  },
  {
    id: "faq-application",
    title: "신청 방법과 지역",
    icon: "home",
    questions: [
      {
        id: "faq-hanjibung-service",
        question: "한지붕은 빈방이 있는 집주인에게 어떤 도움을 주나요?",
        answer: "한지붕은 집주인이 살던 집에서 대학생에게 방 한 칸을 빌려주고 주방이나 욕실을 함께 쓰는 홈셰어링을 돕습니다. 매니저가 방 상태와 학생의 신원을 확인하고, 두 사람이 만나 거주 기간과 생활규칙을 정하도록 돕습니다. 입주 후 생활이 불편할 때도 매니저에게 상의할 수 있습니다.",
        links: [{ href: "/about/", label: "한지붕 소개와 MBC 보도" }],
      },
      {
        id: "faq-host-age",
        question: "어르신이 아니어도 한지붕에 상담할 수 있나요?",
        answer: "네. 집에 남는 방이 있고 대학생과 한집살이를 생각하고 있다면 나이와 관계없이 상담을 신청할 수 있습니다. 매니저와 학생이 독립적으로 쓸 방이 있는지, 주방이나 욕실을 어디까지 함께 쓸 수 있는지부터 살펴보세요.",
      },
      {
        id: "faq-one-spare-room",
        question: "제가 사는 아파트에 방이 한 칸만 남아도 신청할 수 있나요?",
        answer: "아파트에 남는 방이 한 칸이어도 월세 진단을 신청할 수 있습니다. 신청서에서 방 유형은 ‘아파트’, 남는 방 개수는 ‘1개’를 고르세요.",
      },
      {
        id: "faq-rented-home",
        question: "전세·월세로 살고 있는 집의 방도 등록할 수 있나요?",
        answer: "상담할 때 먼저 본인이 세입자라고 알려 주세요. 다른 사람에게 방을 빌려줄 수 있는지는 임대차계약의 특약, 빌려줄 공간의 범위와 소유자의 동의 여부에 따라 달라집니다. 기존 계약서를 확인한 뒤에 입주 조건을 정하세요.",
        links: [
          { href: "https://www.law.go.kr/LSW/lsSideInfoP.do?docCls=jo&joBrNo=00&joNo=0629&lsiSeq=284415&urlMode=lsScJoRltInfoR", label: "민법 제629조 전대 제한" },
          { href: "https://www.law.go.kr/LSW/lsSideInfoP.do?docCls=jo&joBrNo=00&joNo=0632&lsiSeq=284415&urlMode=lsScJoRltInfoR", label: "민법 제632조 건물 일부 사용" },
        ],
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
        question: "예상 월세 진단, 상담 신청, 방 등록 중 무엇을 선택하면 되나요?",
        answer: "받을 수 있는 월세가 궁금하면 ‘우리 집 빈 방 월세 진단’을 선택하세요. 가족과 먼저 상의하고 싶거나 한집살이에 궁금한 점이 있으면 ‘상담 신청하기’에 질문을 남기세요. 학생에게 내어줄 방이 정해졌다면 ‘방 등록하기’에서 방 조건과 방문 연락처를 보낼 수 있습니다.",
        links: [{ href: "/reservation/", label: "예상 월세 진단" }, { href: quickConsultation, label: "상담 신청" }, { href: "/rooms/register/", label: "방 등록" }],
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
        id: "faq-room-furniture",
        question: "학생을 만나기 전에 침대와 책상부터 새로 사야 하나요?",
        answer: "먼저 지금 있는 가구로 무엇을 쓸 수 있는지 확인하세요. 침대를 놓을 자리, 밤에 공부할 조명, 옷을 둘 수납공간, 환기와 냉난방을 매니저와 함께 살펴본 뒤 필요한 물건을 정하면 됩니다.",
      },
      {
        id: "faq-registration-steps",
        question: "방 등록을 마치면 학생은 언제, 어떻게 만나나요?",
        answer: "등록 내용을 보고 매니저가 집주인에게 연락합니다. 사용할 방과 공용공간, 입주 가능 시기와 원하는 거주 기간을 먼저 맞춥니다. 그 조건에 맞는 학생을 소개받아 생활 습관을 이야기하고, 양쪽이 동의하면 계약 내용과 입주일을 정합니다.",
        links: [{ href: "/rooms/register/", label: "우리 집 방 등록하기" }],
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
    title: "공동생활과 계약",
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
      {
        id: "faq-ending-stay",
        question: "가족이 돌아와서 방을 다시 써야 하면 어떻게 하나요?",
        answer: "아직 학생과 계약하기 전이라면 매니저에게 방 등록을 중단하거나 입주 가능일을 바꾸고 싶다고 알려 주세요. 계약 후에는 학생이 이사할 시기를 일방적으로 정하기 어렵습니다. 계약기간과 종료·통지 조건을 확인하고 학생, 매니저와 퇴실 날짜와 정산 방법을 상의하세요.",
      },
    ],
  },
  {
    id: "faq-tax",
    title: "세금과 신고",
    icon: "book",
    questions: [
      {
        id: "faq-rental-tax",
        question: "살고 있는 집의 방 한 칸을 빌려줘도 월세에 세금이 붙나요?",
        answer: "부부 합산으로 보유한 집이 국내 주택 한 채이고 그 주택의 기준시가가 12억 원 이하라면 월세 소득은 비과세입니다. 기준시가가 12억 원을 넘거나 다른 주택이 있다면 보유 주택 수와 임대수입을 기준으로 과세 여부를 확인하세요.\n\n과세 대상이라도 연간 주택임대 총수입금액이 2,000만 원 이하라면 종합과세와 분리과세 중 선택할 수 있습니다.",
        links: [
          { href: "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7682&mi=2251", label: "국세청 주택임대소득 과세 대상" },
          { href: "https://nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7679&mi=2247", label: "국세청 분리과세 안내" },
        ],
      },
      {
        id: "faq-home-value",
        question: "우리 집 기준시가는 어디서 찾아보나요?",
        answer: "아파트라면 부동산공시가격 알리미에서 ‘공동주택 공시가격’을 열고 집 주소와 해당 연도를 선택하세요. 단독주택은 ‘개별주택 공시가격’에서 확인할 수 있습니다. 월세 과세 여부를 살필 때는 매물 호가나 최근 거래가와 구분해 확인하세요.",
        links: [{ href: "https://www.realtyprice.kr/notice/main/main.do", label: "우리 집 공시가격 조회" }],
      },
      {
        id: "faq-business-registration",
        question: "한지붕에 방을 등록하면 세무서 사업자등록도 되나요?",
        answer: "한지붕의 방 등록은 학생과 함께 살 공간을 소개하는 절차입니다. 주택임대업 사업자등록 대상에 해당하면 세무서나 홈택스를 통해 사업 개시일부터 20일 이내에 신청하는 것이 원칙입니다. 해당 여부는 보유 주택과 임대 형태를 기준으로 국세청에 확인하세요.",
        links: [{ href: "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7687&mi=2257", label: "국세청 주택임대업의 사업자등록" }],
      },
      {
        id: "faq-income-records",
        question: "월세가 입금된 뒤 세금 신고를 위해 무엇을 보관하나요?",
        answer: "임대차계약서와 월세 입금 내역, 방을 임대하면서 쓴 비용의 증빙을 함께 보관하세요. 집주인 본인의 신고 여부는 보유 주택과 한 해의 임대수입에 따라 판단합니다. 정산 내역을 받았다면 실제 입금액과 비교해 두세요.",
        links: [{ href: "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7684&mi=2253", label: "국세청 주택임대 소득세 계산" }],
      },
      {
        id: "faq-resident-report",
        question: "학생이 전입신고를 하면 제 월세에 바로 세금이 붙나요?",
        answer: "월세 소득의 과세 여부는 집주인이 보유한 주택 수, 기준시가와 임대수입을 기준으로 판단합니다. 학생이 주소를 옮긴 사실만으로는 세액을 판단할 수 없습니다.",
        links: [{ href: "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7682&mi=2251", label: "국세청 과세 기준 확인" }],
      },
      {
        id: "faq-pension-insurance",
        question: "빈방 월세가 건강보험료나 기초연금에 영향을 주나요?",
        answer: "임대소득은 건강보험료와 피부양자 자격, 기초연금의 소득인정액을 확인할 때 영향을 줄 수 있습니다. 예상 월세와 다른 소득을 정리한 뒤 건강보험은 국민건강보험공단에, 기초연금은 국민연금공단이나 주소지 행정복지센터에 문의하세요.",
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
    <div class="host-container" id="faq">
      <div class="rent-faq-head" id="faq-title">
        <h2 id="rent-faq-title"><span>${subject}</span> ${title}</h2>
        <div class="rent-faq-search" role="search" aria-label="자주 묻는 질문" hidden>
          <div class="rent-faq-search-label"><label for="rent-faq-query">질문과 답변 검색</label><span role="status" aria-atomic="true"></span></div>
          <div class="rent-faq-field">${icon("search")}<input type="search" id="rent-faq-query" placeholder="관리비, 에어컨, 생활규칙 등" autocomplete="off" enterkeyhint="search" aria-controls="rent-faq-results"><button type="button" aria-label="검색어 지우기" hidden>${icon("close")}</button></div>
        </div>
      </div>
      <nav class="rent-faq-picks" aria-label="먼저 살펴볼 질문">
        <strong>먼저 살펴볼 질문</strong>
        <a href="#faq-student-matching">어떤 학생이 오나요?</a>
        <a href="#faq-rental-tax">월세에 세금이 붙나요?</a>
        <a href="#faq-manager-support">생활이 맞지 않으면요?</a>
      </nav>
      <div class="rent-faq-layout">
        <nav class="rent-faq-nav" aria-label="자주 묻는 질문 주제">${jumps}</nav>
        <div class="rent-faq-groups" id="rent-faq-results">
          <div class="rent-faq-empty" hidden><p>일치하는 질문이 없습니다.</p><button type="button">전체 질문 보기</button></div>
          ${groups.join("")}
          <a class="rent-faq-contact" href="${quickConsultation}">매니저에게 다른 질문하기 ${icon("arrow")}</a>
        </div>
      </div>
    </div>
  </section>`;
}
