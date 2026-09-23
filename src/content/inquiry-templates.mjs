import { site } from "../config/site.mjs";
import { escapeHtml } from "../lib/template.mjs";

// Static prompts only. Visitors edit their message in their own email application.
export const inquiryTemplates = Object.freeze([
  {
    id: "consultation",
    title: "무료상담 문의",
    subject: "[한지붕] 빈방 활용 무료상담 문의",
    text: "빈방 활용 무료상담을 문의합니다.\n\n궁금한 점:\n가족과 함께 확인하고 싶은 내용:\n지역 (필요한 경우, 시·군·구까지만):\n\n이 이메일로 회신 부탁드립니다.",
    help: "모든 항목을 채울 필요는 없습니다. 궁금한 점 하나만 적어도 괜찮습니다.",
  },
  {
    id: "partnership",
    title: "교육·봉사 기관협력 문의",
    subject: "[한지붕] 교육·봉사 기관협력 문의",
    text: "교육·봉사 프로그램 협력을 문의합니다.\n\n기관명:\n희망 주제:\n대상과 대략적인 인원:\n희망 시기와 지역:\n\n이 이메일로 회신 부탁드립니다.",
    help: "참여자 명부나 개인 연락처 대신 기관의 요청 내용만 적어 주세요. 문의만으로 일정이 확정되지는 않습니다.",
  },
  {
    id: "research",
    title: "실태조사 참여·기관 인터뷰 문의",
    subject: "[한지붕] 주거상생 실태조사 문의",
    text: "주거상생 실태조사에 관해 문의합니다.\n\n관심 있는 주제:\n문의 목적 (참여 방법 / 기관 인터뷰 / 기타):\n\n이 이메일로 회신 부탁드립니다.",
    help: "조사 응답이나 상담 사례 원문은 보내지 마세요. 먼저 참여 방법과 개인정보 안내를 확인하세요.",
  },
]);

export function inquiryTemplateSection() {
  return `<section class="inquiry-templates" id="inquiry-templates" tabindex="-1" aria-labelledby="inquiry-templates-title">
    <p class="eyebrow">무엇부터 적을지 막막하다면</p><h2 id="inquiry-templates-title">문의 문안을 골라 참고하세요</h2>
    <p>아래는 보내기 전 참고하는 빈 문안입니다. 복사한 뒤 본인의 메일 앱에 붙여 넣고 필요한 내용만 작성해 주세요. 홈페이지에서 입력하거나 접수하는 폼은 아닙니다.</p>
    <p class="field-hint">주민등록번호·상세주소·신분증·계좌번호·민감서류는 보내지 마세요. 복사하거나 메일 앱을 여는 것만으로 문의가 접수되지는 않습니다.</p>
    ${inquiryTemplates.map((item) => `<details class="inquiry-example" id="inquiry-${item.id}"><summary>${escapeHtml(item.title)} 문안</summary><div class="inquiry-example-body"><p>${escapeHtml(item.help)}</p><pre class="inquiry-copy" id="inquiry-text-${item.id}">${escapeHtml(item.text)}</pre><div class="inquiry-example-actions"><button type="button" class="button button-secondary" data-copy-template data-copy-target="inquiry-text-${item.id}" aria-describedby="inquiry-status-${item.id}" hidden>빈 문의 문안 복사하기</button><a class="button" href="${site.emailHref}?subject=${encodeURIComponent(item.subject)}">이 주제로 이메일 작성하기</a></div><p class="copy-status" id="inquiry-status-${item.id}" role="status" aria-live="polite" aria-atomic="true"></p><p class="field-hint">메일 제목만 준비됩니다. 복사한 문안을 붙여 넣고 내용을 확인한 뒤 직접 전송해 주세요.</p></div></details>`).join("")}
  </section>`;
}
