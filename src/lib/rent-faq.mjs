import { absolute, escapeHtml, icon } from "./template.mjs";
import { hostQuestions } from "../content/host/faq.mjs";

const categories = [
  ["all", "전체"],
  ["service", "서비스 소개·집주인 신청"],
  ["living", "입주 준비·공동생활"],
  ["contract", "계약·정산·거주 관리"],
  ["tax", "월세 수입·세금"],
];

export const rentFaqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "@id": absolute("/#rent-faq"),
  isPartOf: { "@type": "WebPage", "@id": absolute("/") },
  name: "자주 묻는 질문",
  inLanguage: "ko",
  mainEntity: hostQuestions.map(({ id, question, summary, detail }) => ({
    "@type": "Question",
    "@id": absolute(`/#${id}`),
    name: question,
    acceptedAnswer: { "@type": "Answer", text: `${summary}\n\n${detail}` },
  })),
};

function renderQuestion({ id, category, question, summary, detail, links = [] }, index) {
  const paragraphs = detail.split("\n\n").map(text => `<p class="host-faq-answer-detail">${escapeHtml(text)}</p>`).join("");
  const resources = links.map(([url, label]) => `<a href="${escapeHtml(url)}">${escapeHtml(label)}</a>`).join("");
  return `<details class="rent-faq-item" name="host-questions" id="${id}" data-category="${category}"${index === 0 ? " open" : ""}>
    <summary class="host-faq-question"><span class="host-faq-question-mark" aria-hidden="true">Q</span><span class="host-faq-question-text">${escapeHtml(question)}</span><span class="host-faq-arrow" aria-hidden="true"></span></summary>
    <div class="host-faq-answer"><p class="host-faq-answer-summary">${escapeHtml(summary)}</p>${paragraphs}${resources ? `<div class="host-faq-resources">${resources}</div>` : ""}</div>
  </details>`;
}

export function rentFaqSection() {
  const chips = categories.map(([key, label]) => `<button type="button" class="host-faq-chip" id="faq-category-${key}" data-category="${key}" aria-pressed="${key === "all"}" aria-controls="rent-faq-results">${label}</button>`).join("");
  return `<section class="rent-faq" id="rent-faq" aria-labelledby="rent-faq-title">
    <div class="host-faq-container" id="faq">
      <header class="host-faq-header">
        <h2 id="rent-faq-title" class="host-faq-heading">자주 묻는 질문</h2>
        <p>빈방 준비부터 공동생활, 계약과 정산, 월세 수입에 대한 세금까지 안내합니다.</p>
      </header>
      <div class="host-faq-search" role="search" aria-label="자주 묻는 질문 검색" hidden>
        <label for="rent-faq-query">질문과 답변 검색</label>
        <div class="host-faq-field">${icon("search")}<input type="search" id="rent-faq-query" autocomplete="off" enterkeyhint="search" placeholder="월세, 생활규칙, 세금 등" aria-controls="rent-faq-results"><button type="button" data-faq-clear aria-label="검색어 지우기" hidden>${icon("close")}</button></div>
        <span class="host-faq-status" role="status" aria-atomic="true"></span>
      </div>
      <div class="host-faq-chips" role="group" aria-label="질문 분류" hidden>${chips}</div>
      <div class="host-faq-list" id="rent-faq-results">${hostQuestions.map(renderQuestion).join("")}</div>
      <div class="host-faq-empty" hidden><p>일치하는 질문이 없습니다.</p><button type="button">전체 질문 보기</button></div>
      <aside class="host-faq-tax-notice" aria-labelledby="host-tax-notice"><h3 id="host-tax-notice">세금 안내</h3><p>개인 집주인이 주거용으로 방을 임대할 때 적용되는 일반적인 기준입니다. 공동소유 여부와 다른 주택·임대수입, 귀속연도에 따라 달라질 수 있습니다. <a href="https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7682&amp;mi=2251">국세청 주택임대소득 과세 기준</a>에서 확인하세요.</p></aside>
      <a class="host-faq-contact" href="/consultation/">매니저에게 다른 질문하기 <span aria-hidden="true">→</span></a>
    </div>
  </section>`;
}
