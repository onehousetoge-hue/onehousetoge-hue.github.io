import { site } from "../config/site.mjs";
import { icon, pageHero } from "../lib/template.mjs";

export const contactBody = `${pageHero({
  eyebrow: "전화·이메일 문의",
  title: "궁금한 내용부터<br>편하게 이야기해 주세요.",
  description: "가족과 확인할 사항, 개인공간과 공용공간, 공동생활 규칙을 함께 정리합니다. 상담과 프로그램 참여는 전화 또는 이메일로 문의해 주세요.",
})}
<section class="section"><div class="container">
  <div class="contact-cards">
    <article class="contact-card">${icon("phone")}<h2>전화로 이야기하기</h2><p>궁금한 점을 말씀해 주세요. 통화가 연결되지 않으면 이메일로 문의 내용과 연락받을 방법을 남겨 주세요.</p><a href="${site.phoneHref}">${site.phone}</a></article>
    <article class="contact-card">${icon("mail")}<h2>이메일로 문의하기</h2><p>상담·봉사 참여·기관협력 중 문의 유형과 궁금한 내용을 적어 주세요. 답변받을 전화 또는 이메일 중 하나만 알려주셔도 됩니다.</p><a href="${site.emailHref}">${site.email}</a><p class="field-hint">메일 앱이 열리면 내용을 작성하고 직접 전송해 주세요.</p></article>
  </div>
  <section class="contact-process" aria-labelledby="contact-process-title"><p class="eyebrow">문의하는 방법</p><h2 id="contact-process-title">짧은 질문으로 시작해도 괜찮습니다.</h2><ol><li><strong>궁금한 내용 정리</strong><p>상담, 봉사, 기관협력 등 문의 유형과 질문을 적습니다.</p></li><li><strong>전화 또는 이메일로 연락</strong><p>이름, 답변받을 연락수단 하나, 필요한 경우 시·군·구 수준의 지역을 알려 주세요.</p></li><li><strong>답변을 확인하고 다음 단계 결정</strong><p>제공 가능한 범위와 필요한 사항을 확인한 뒤 진행 여부를 결정하세요. 문의만으로 참여나 계약이 확정되지 않습니다.</p></li></ol></section>
  <div class="notice"><h2>이 정보는 보내지 마세요</h2><p>주민등록번호, 신분증, 계좌번호, 상세주소, 가족의 연락처와 집 사진은 초기 문의에 필요하지 않습니다.</p><p>문의정보는 답변 완료일부터 1년 보관 후 삭제합니다. 자세한 내용은 <a href="/privacy/">개인정보 처리방침</a>에서 확인할 수 있습니다.</p></div>
  <section class="prose"><h2>상담 범위를 확인해 주세요</h2><p>기초상담은 무료입니다. 가족과의 대화, 공간 사용기준, 공동생활 준비에 관한 일반 정보를 안내합니다. 집수리·안전진단·부동산 중개·법률·세무 자문은 제공하지 않습니다.</p><p>방문 가능 여부와 기관 프로그램의 일정·비용은 문의할 때 확인해 주세요. <a href="/resources/consultation-preparation/">무료상담 준비 질문지</a>를 먼저 살펴보셔도 좋습니다.</p></section>
</div></section>`;
