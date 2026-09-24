import { site } from "../config/site.mjs";
import { icon, pageHero } from "../lib/template.mjs";
import { inquiryTemplateSection } from "./inquiry-templates.mjs";

export const contactBody = `${pageHero({
  eyebrow: "상담·기관협력 문의",
  title: "한지붕에 문의하세요",
  description: "빈방 활용이 궁금한 어르신과 가족은 무료상담으로, 교육·봉사를 함께할 기관은 기관협력으로 문의해 주세요. 홈페이지에 내용을 남기거나 전화·이메일로 연락하실 수 있습니다.",
  meta: `<div class="hero-actions"><a class="button" href="${site.phoneHref}">${icon("phone")}전화 ${site.phone}</a><a class="button button-secondary" href="${site.emailHref}">${icon("mail")}이메일 작성하기</a></div><p class="field-hint">메일 앱에서 내용을 작성한 뒤 직접 전송해 주세요.</p><a class="text-link" href="#inquiry-templates">문의 문안 예시 보기${icon("arrow")}</a>`,
})}
<section class="section"><div class="container">
  <div class="hero-actions"><a class="button" href="/consultation/">홈페이지에서 무료상담 문의</a><a class="button button-secondary" href="/partnership/">홈페이지에서 기관협력 문의</a></div>
  <div class="contact-cards">
    <article class="contact-card">${icon("phone")}<h2>전화로 이야기하기</h2><p>궁금한 점을 말씀해 주세요. 통화가 연결되지 않으면 이메일로 문의 내용과 연락받을 방법을 남겨 주세요.</p><a id="contact-phone" href="${site.phoneHref}">${site.phone}</a><button type="button" class="button button-secondary copy-contact" data-copy-contact="phone" data-copy-target="contact-phone" aria-describedby="copy-phone-status" hidden>전화번호 복사하기</button><p id="copy-phone-status" class="copy-status" role="status" aria-live="polite" aria-atomic="true"></p></article>
    <article class="contact-card">${icon("mail")}<h2>이메일로 문의하기</h2><p>상담·봉사 참여·기관협력 중 문의 유형과 궁금한 내용을 적어 주세요. 답변받을 전화 또는 이메일 중 하나만 알려주셔도 됩니다.</p><a id="contact-email" href="${site.emailHref}">${site.email}</a><p class="field-hint">메일 앱이 열리면 내용을 작성하고 직접 전송해 주세요. 앱이 열리지 않으면 주소를 복사하거나 직접 입력할 수 있습니다.</p><button type="button" class="button button-secondary copy-contact" data-copy-contact="email" data-copy-target="contact-email" aria-describedby="copy-email-status" hidden>이메일 주소 복사하기</button><p id="copy-email-status" class="copy-status" role="status" aria-live="polite" aria-atomic="true"></p></article>
  </div>
  ${inquiryTemplateSection()}
  <section class="contact-process" aria-labelledby="contact-process-title"><p class="eyebrow">문의하는 방법</p><h2 id="contact-process-title">짧은 질문으로 시작해도 괜찮습니다.</h2><ol><li><strong>궁금한 내용 정리</strong><p>상담, 봉사, 기관협력 등 문의 유형과 질문을 적습니다.</p></li><li><strong>전화 또는 이메일로 연락</strong><p>이름, 답변받을 연락수단 하나, 필요한 경우 시·군·구 수준의 지역을 알려 주세요.</p></li><li><strong>답변을 확인하고 다음 단계 결정</strong><p>제공 가능한 범위와 필요한 사항을 확인한 뒤 진행 여부를 결정하세요. 문의만으로 참여나 계약이 확정되지 않습니다.</p></li></ol></section>
  <div class="notice"><h2>이 정보는 보내지 마세요</h2><p>주민등록번호, 신분증, 계좌번호, 상세주소, 가족의 연락처와 집 사진은 초기 문의에 필요하지 않습니다.</p><p>상담정보는 상담 종료일로부터 최대 1년간 보관한 뒤 삭제합니다. 자세한 내용은 <a href="/privacy/">개인정보 처리방침</a>에서 확인할 수 있습니다.</p></div>
  <section class="prose"><h2>지금 이용할 수 있는 상담</h2><p>전화·이메일 기초상담은 무료이며 예약비나 상담료를 받지 않습니다. 한지붕 대표와 운영진이 직접 응대합니다. 어르신 유휴공간·빈방 활용을 검토할 때의 준비사항, 공간 정리·개선에 관한 일반 정보, 세대공감형 공동거주와 청년 주거 공익정보를 안내합니다. 현재 주택 방문상담·집수리·안전진단·부동산 중개·법률·세무 자문은 제공하지 않습니다.</p><p><a href="/resources/consultation-preparation/">무료상담 준비 질문지</a>를 먼저 살펴보셔도 좋습니다.</p><h2>기관 프로그램은 사전 협의로 진행합니다</h2><p>스마트폰·디지털 기초교육, AI 활용 교육, 세대교류, 한국 주거문화·공동생활 안내와 유휴공간 정리·활용 관련 정보 제공·봉사를 협의할 수 있습니다. 상설 정규반은 아니며 기관명, 대상, 희망 주제와 일정 범위를 알려 주세요. 운영진과 기관이 날짜·장소·역할을 함께 정합니다. 강사·공간·재료 등 비용이 필요한 항목은 금액과 부담 주체를 이메일로 확인하고 합의한 뒤 진행하며, 합의하지 않은 비용을 청구하지 않습니다.</p><p>개인 봉사 참여에는 가입비가 없습니다. 확정된 활동과 필요한 역할에 맞춰 참여 가능 여부를 안내합니다.</p></section>
</div></section>`;
