import { getResource } from "../content/resources.mjs";

export function helpPaths() {
  return `<section class="section help-paths" aria-labelledby="help-paths-title"><div class="container"><p class="eyebrow">누가 도움을 받을 수 있나요?</p><h2 id="help-paths-title">어르신과 청년에게 필요한 도움,<br>지역기관과 함께 만듭니다.</h2><p>두 세대가 충분한 정보를 바탕으로 주거생활을 준비하도록 돕습니다. 가족도 어르신과 함께 상담할 수 있으며, 지역기관은 활동을 함께 기획하는 협력 대상입니다.</p><div class="resource-grid">
  <article class="resource-card"><h3>어르신</h3><p>유휴공간 활용, 공동생활 준비와 생활환경에 관한 무료상담과 정보를 제공합니다. 가족과 의논할 사항과 생활규칙을 함께 정리합니다.</p><a class="text-link" href="/programs/senior-home-consulting/">내가 받을 수 있는 상담 확인</a></article>
  <article class="resource-card"><h3>청년·외국인 유학생</h3><p>주거문화, 공동생활 전 안전을 위해 확인할 사항, 개인공간과 생활규칙에 관한 공익 정보를 제공합니다. 회원가입 없이 자료를 읽을 수 있습니다.</p><a class="text-link" href="/resources/#youth-housing">청년 주거정보 보기</a><a class="text-link" href="/resources/#find-guide">상황에 맞는 생활자료 찾기</a></article>
  <article class="resource-card"><h3>지역기관 · 협력 대상</h3><p>복지관·경로당·주민센터·학교 등과 교육, 상담, 세대교류 활동을 협의합니다. 대상·주제·진행 여건부터 함께 확인합니다.</p><a class="text-link" href="/partnership/">교육·봉사 기관협력 문의</a></article>
  </div></div></section>`;
}

const paths = [
  ["가족과 생각이 달라 대화를 시작하기 어렵습니다", "family-checklist", "먼저 당사자가 바라는 점과 원하지 않는 점을 나눠 적으세요. 오늘 결론 내리지 않을 항목도 남길 수 있습니다."],
  ["생활시간·청소·방문객 기준을 정하고 싶습니다", "shared-living-rules", "막연한 부탁보다 누가, 언제, 무엇을 할지 적어보세요. 의견이 다른 항목은 합의된 것처럼 기록하지 않습니다."],
  ["청년 주거공간을 고를 때 무엇을 봐야 할까요?", "consultation-preparation", "월세 외 비용, 통학·출근 시간, 개인공간과 거주기간을 비교하고 확인이 필요한 질문을 적어 보세요."],
  ["어디까지 함께 사용해도 되는지 걱정입니다", "private-common-space", "방·주방·욕실의 출입, 물건 보관, 사용 후 정리 기준을 각각 구분해 보세요."],
  ["불편한 점을 어떻게 말할지 고민입니다", "conflict-prevention", "사람을 평가하는 말 대신 관찰한 상황과 원하는 행동을 적어봅니다. 위협·폭력은 대화 연습으로 해결할 문제가 아닙니다."],
  ["주거 용어나 공식 문의처를 알고 싶습니다", "korean-housing-culture", "일상적인 생활 약속과 제도상 확인할 문제를 구분하고, 질문에 맞는 공식 안내 창구를 찾아보세요."],
];

export function youthGuides() {
 return `<section id="youth-housing" class="guide-finder jump-target" aria-labelledby="youth-title"><p class="eyebrow">청년·외국인 유학생을 위한 공익정보</p><h2 id="youth-title">주거생활을 준비할 때, 먼저 확인하세요</h2><p>집을 고를 때의 질문부터 한국의 주거문화와 공동생활의 약속까지 안내합니다. 자료는 한국어로 제공하며, 개인정보를 입력하거나 문의하지 않아도 무료로 읽을 수 있습니다.</p><div class="resource-grid"><article class="resource-card"><h3>주거공간 선택</h3><p>비용·통학·생활환경·개인공간을 비교하고 상담할 질문을 준비합니다.</p><a class="text-link" href="/resources/consultation-preparation/">청년 주거 체크리스트</a></article><article class="resource-card"><h3>한국의 주거문화</h3><p>공동생활 방식과 주거 용어를 살펴보고, 체류·계약 등은 공식 문의처를 확인합니다.</p><a class="text-link" href="/resources/korean-housing-culture/">세대공유주거 처음 알아보기</a></article><article class="resource-card"><h3>함께 사는 생활규칙</h3><p>생활시간, 방문객, 청소와 공간 사용 기준을 함께 정리합니다.</p><a class="text-link" href="/resources/shared-living-rules/">생활규칙 작성하기</a></article></div><p>안내자료는 주택의 안전성이나 계약을 보장하지 않으며, 입주 알선·계약대행·법률·세무 자문은 제공하지 않습니다.</p></section>`;
}

export function guideFinder() {
  return `${youthGuides()}<section id="find-guide" class="guide-finder jump-target" aria-labelledby="guide-finder-title"><p class="eyebrow">상황별 자료 길잡이</p><h2 id="guide-finder-title">어떤 질문이 가장 가까운가요?</h2><p>질문을 누르면 먼저 할 일과 연결 자료가 펼쳐집니다. 선택 내용은 저장하거나 전송하지 않습니다.</p><div class="faq">${paths.map(([question, slug, advice]) => { const guide = getResource(slug); return `<details><summary>${question}</summary><div class="guide-answer"><p>${advice}</p><p><strong>이 자료로 남길 수 있는 것</strong><br>${guide.outcome}</p><a class="text-link" href="${guide.href}">${guide.title} 읽기</a></div></details>`; }).join("")}</div><p>함께 정리하고 싶다면 <a href="/consultation/">무료상담 문의</a>를 이용하세요. 자료는 누구나 바로 읽을 수 있습니다.</p></section>`;
}

export function consultationExample() {
  return `<section class="consultation-example" aria-labelledby="consultation-example-title"><p class="eyebrow">도움을 구체적으로 살펴보기</p><h2 id="consultation-example-title">상담에서는 이렇게 질문을 정리합니다.</h2><p><strong>이해를 돕기 위한 가상 예시입니다.</strong> 실제 참여자의 발언, 상담 결과나 성과를 재현한 내용이 아닙니다.</p><blockquote>“남는 방은 있지만 가족이 걱정합니다. 무엇부터 이야기하면 좋을까요?”</blockquote><dl class="plain-definitions"><div><dt>1. 먼저 듣는 질문</dt><dd>어르신 본인은 어떤 점을 원하시나요? 가족이 가장 걱정하는 것은 사생활, 생활습관, 안전 중 무엇인가요?</dd></div><div><dt>2. 함께 나누는 항목</dt><dd>가족과 같은 생각인 부분, 서로 다른 부분, 아직 확인하지 못한 부분을 구분합니다. 합의하지 않은 내용은 결정을 보류합니다.</dd></div><div><dt>3. 상담 뒤 해볼 일</dt><dd>가족회의 질문지에 각자의 생각을 적고, 주방·욕실 등 공용공간의 사용 기준을 살펴봅니다. 추가 질문이 있으면 다시 문의할 수 있습니다.</dd></div></dl><p>상담은 질문과 준비사항을 정리하는 도움입니다. 공간의 안전성, 입주자의 적합성이나 수익을 판정·보장하지 않습니다.</p><div class="related-grid"><a class="related-link" href="/resources/family-checklist/">가족회의 질문지 직접 작성하기</a><a class="related-link" href="/resources/private-common-space/">개인·공용공간 기준표 보기</a></div></section>`;
}
