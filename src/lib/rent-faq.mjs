import { absolute, escapeHtml } from "./template.mjs";

const title = "빈방 월세 진단 자주 묻는 질문";
const questions = [
  {
    id: "faq-rent-estimate",
    question: "우리 집 빈방의 예상 월세는 어떻게 알 수 있나요?",
    answer: "한지붕에서 무료로 월세 진단을 신청할 수 있습니다. 집이 있는 동네와 가까운 대학교나 지하철역, 남는 방 개수와 에어컨 유무를 알려 주세요. 매니저가 방 정보를 확인한 뒤 신청할 때 남긴 휴대폰 번호로 예상 월세와 준비할 일을 안내합니다.",
    link: { href: "/reservation/", label: "예상 월세 무료 진단 신청하기" },
  },
  {
    id: "faq-one-spare-room",
    question: "제가 사는 아파트에 방이 한 칸 남는데 신청할 수 있나요?",
    answer: "네. 아파트에 남는 방이 한 칸이어도 진단을 신청할 수 있습니다. 신청서에서 방 유형은 ‘아파트’, 남는 방 개수는 ‘1개’를 고르세요. 진단 결과를 듣고 나서 임대를 진행할지 결정할 수 있습니다.",
  },
  {
    id: "faq-photos-address",
    question: "신청할 때 집 사진이나 상세 주소가 필요한가요?",
    answer: "집 사진 없이 신청할 수 있습니다. 집 위치는 ‘서울 노원구 공릉동’처럼 동네까지만 적으면 됩니다. 동·호수는 필요하지 않습니다.",
    link: { href: "/reservation/privacy/", label: "개인정보 수집 항목과 보관기간 보기" },
  },
  {
    id: "faq-room-preparation",
    question: "방 청소나 가구 준비 비용은 어떻게 정하나요?",
    answer: "집주인과 매니저가 방 상태를 살펴보고 준비할 범위와 비용을 함께 정합니다. 청소가 필요한 곳, 그대로 쓸 가구와 새로 마련할 가구를 먼저 정하면 어떤 준비에 비용이 드는지 확인할 수 있습니다.",
  },
  {
    id: "faq-meals-laundry",
    question: "함께 사는 학생의 식사나 빨래도 챙겨 줘야 하나요?",
    answer: "식사와 빨래는 각자 챙깁니다. 입주 전에는 집주인과 학생이 주방과 세탁기를 언제 쓸지, 함께 쓰는 공간은 어떻게 청소할지 의논하고 생활규칙을 서면으로 정합니다.",
  },
  {
    id: "faq-visit-area",
    question: "우리 동네도 방문 지원이 가능한지 어디서 확인하나요?",
    answer: "한지붕은 서울 노원구 공릉동에서 시작했습니다. 집이 있는 동네에서 방문 지원을 받을 수 있는지 확인하려면 빠른 상담의 ‘궁금한 점’에 동네 이름과 필요한 도움을 적어 주세요. 매니저가 확인해 연락드립니다.",
    link: { href: "/reservation/?consultation=quick", label: "우리 동네 방문 가능 여부 문의하기" },
  },
];

export const rentFaqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "@id": absolute("/#rent-faq"),
  isPartOf: { "@type": "WebPage", "@id": absolute("/") },
  name: title,
  inLanguage: "ko",
  mainEntity: questions.map(({ id, question, answer }) => ({
    "@type": "Question",
    "@id": absolute(`/#${id}`),
    name: question,
    acceptedAnswer: { "@type": "Answer", text: answer },
  })),
};

export function rentFaqSection() {
  const items = questions.map(({ id, question, answer, link }) => `
    <article class="rent-faq-item" id="${id}">
      <h3>${escapeHtml(question)}</h3>
      <div><p>${escapeHtml(answer)}</p>${link ? `<a href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a>` : ""}</div>
    </article>`);
  return `<section class="rent-faq" id="rent-faq" aria-labelledby="rent-faq-title">
    <div class="host-container">
      <h2 id="rent-faq-title">${title}</h2>
      <div class="rent-faq-list">${items.join("")}</div>
    </div>
  </section>`;
}
