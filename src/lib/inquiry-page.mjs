import { site } from '../config/site.mjs';
import { inquiries } from '../config/inquiries.mjs';
import { escapeHtml, layout, pageHero } from './template.mjs';
import { inquiryScriptUrl } from './static-assets.mjs';

export function inquiryPage(kind) {
  const partner = kind === 'partnership';
  const title = partner ? '기관협력 문의' : '무료상담 문의';
  const route = partner ? '/partnership/' : '/consultation/';
  const enabled = Boolean(inquiries.endpoint);
  const body = pageHero({eyebrow: partner ? '함께하는 공익활동' : '어르신·가족 무료상담', title, description: partner ? '교육·봉사와 주거상생 조사 협력을 제안해 주세요. 내용과 일정·비용·역할은 운영진과 협의한 뒤 정합니다.' : '빈방 활용과 공동생활 준비에 대해 궁금한 점을 남겨 주세요. 한지붕 대표와 운영진이 확인하고 선택한 연락방법으로 안내합니다.'}) +
  `<section class="section"><div class="container narrow"><div class="notice"><h2>필요한 내용만 간단히 알려 주세요</h2><p>초기 상담에는 주민등록번호, 상세주소, 계약서, 금융정보 등 민감정보를 보내실 필요가 없습니다. 다른 사람의 연락처나 건강정보도 적지 마세요.</p><p>${partner ? '문의만으로 일정이나 협력이 확정되지는 않습니다.' : '기초상담은 무료입니다. 주택 방문·집수리·입주 알선·계약대행·법률·세무 자문은 제공하지 않습니다.'}</p></div>
  <details class="inquiry-writing-help"><summary>어떤 내용을 적으면 좋을까요?</summary><p>${partner ? '기관명, 참여 대상, 희망 주제와 시기를 적어 주세요. 확정하지 않은 부분은 협의 희망으로 남겨도 됩니다.' : '현재 고민 한 가지와 상담에서 확인하고 싶은 질문을 적어 주세요. 가족이나 다른 사람의 사적인 정보는 넣지 않아도 됩니다.'}</p><p>${partner ? '작성 예시: 어르신 대상 스마트폰 교육을 제안하고 싶습니다. 참여 규모와 가능한 일정을 함께 협의하고 싶습니다.' : '작성 예시: 자녀 독립 후 남은 방이 있습니다. 가족과 어떤 점부터 이야기하면 좋을지 궁금합니다.'}</p><p>위 문장은 작성 방법을 보여주는 예시이며 실제 접수 내용이 아닙니다.</p></details>
  ${enabled ? '' : '<p class="notice" role="status">온라인 문의는 아직 접수를 시작하지 않았습니다. 지금은 아래 전화·이메일로 문의해 주세요.</p>'}
  <form class="inquiry-form" data-inquiry="${kind}" data-endpoint="${escapeHtml(inquiries.endpoint)}" data-consent-version="${inquiries.consentVersion}" method="post" action="${route}" novalidate>
    <fieldset disabled><legend>${partner ? '기관과 담당자 정보' : '문의하시는 분 정보'}</legend>
    ${partner ? '<div class="form-field"><label for="organization">기관명 <span>(필수)</span></label><input id="organization" name="organization" autocomplete="organization" maxlength="100" required></div>' : ''}
    <div class="form-field"><label for="inquiry-name">${partner ? '담당자 이름' : '이름'} <span>(필수)</span></label><input id="inquiry-name" name="name" autocomplete="name" maxlength="60" required></div>
    <div class="form-field"><label for="contact-method">연락받을 방법 <span>(필수)</span></label><select id="contact-method" name="contactMethod"><option value="phone">전화</option><option value="email">이메일</option></select></div>
    <div class="form-field"><label for="inquiry-contact" data-contact-label>연락받을 전화번호 (필수)</label><input id="inquiry-contact" name="contact" type="tel" inputmode="tel" autocomplete="tel" maxlength="120" required aria-describedby="contact-help"><p id="contact-help" class="field-hint">전화번호 또는 이메일 중 선택한 연락처 하나만 입력해 주세요.</p></div>
    <div class="form-field"><label for="inquiry-topic">${partner ? '희망 프로그램' : '문의 유형'} <span>(필수)</span></label><select id="inquiry-topic" name="topic" required><option value="">선택해 주세요</option>${inquiries.topics[kind].map(x=>`<option>${escapeHtml(x)}</option>`).join('')}</select></div>
    <div class="form-field"><label for="inquiry-message">간단한 문의 내용 <span>(필수, 5~1,000자)</span></label><textarea id="inquiry-message" name="message" rows="5" minlength="5" maxlength="1000" required aria-describedby="message-help"></textarea><p id="message-help" class="field-hint">현재 궁금한 점을 적어 주세요. 민감정보나 첨부서류는 받지 않습니다.</p></div>
    <div hidden aria-hidden="true"><label>자동입력 방지<input name="website" tabindex="-1" autocomplete="off"></label></div>
    <div class="consent-summary"><h2>개인정보 수집·이용 안내</h2><p>수집항목: ${partner ? '기관명, 담당자 이름' : '이름'}, 전화번호 또는 이메일, 문의유형, 문의내용과 동의·접수 기록. 목적: 문의 확인과 상담·협력 답변. 보유기간: 상담 종료일로부터 최대 1년간 보관 후 삭제.</p><p>동의를 거부할 수 있으며, 거부하면 온라인 문의를 접수할 수 없습니다. <a href="/privacy/">개인정보 처리방침 전체 보기</a></p><label class="consent-check"><input name="consent" type="checkbox" required><span>[필수] 개인정보 수집·이용에 동의합니다.</span></label></div>
    <p class="form-status" role="alert" tabindex="-1" data-form-status></p>
    <button type="submit" class="button" ${enabled ? '' : 'disabled'}>${title} 보내기</button>
    <p class="field-hint">저장이 확인되면 접수번호를 안내합니다. 접수는 상담·참여 확정이나 답변 완료를 뜻하지 않습니다.</p></fieldset>
  </form><noscript><p class="notice">온라인 문의에는 자바스크립트가 필요합니다. 전화·이메일 문의도 이용할 수 있습니다.</p></noscript>
  <div class="hero-actions"><a class="button button-secondary" href="${site.phoneHref}">전화 ${site.phone}</a><a class="button button-secondary" href="${site.emailHref}">이메일 작성하기</a></div><p><a href="/contact/">전화·이메일 문의 방법</a> · <a href="${partner ? '/programs/intergenerational-volunteer/' : '/programs/senior-home-consulting/'}">제공하는 내용과 범위 보기</a></p></div></section><script type="module" src="${inquiryScriptUrl}"></script>`;
  return layout({title,description:partner ? '복지관·경로당·학교·지역기관의 디지털 교육, 봉사, 주거문화 안내와 조사 협력 문의입니다.' : '어르신과 가족의 빈방 활용·공동생활 준비에 관한 무료상담 문의입니다. 이름과 회신 연락처 하나, 궁금한 내용만 남겨 주세요.',path:route,body,breadcrumbs:[{label:title,href:route}]});
}

export function inquiryCompletePage(kind) {
  const partner = kind === 'partnership';
  const route = partner ? '/partnership/complete/' : '/consultation/complete/';
  const title = partner ? '기관협력 문의 접수 확인' : '무료상담 문의 접수 확인';
  const body = `<section class="status-page"><div class="container narrow" data-inquiry-complete="${kind}" data-endpoint="${escapeHtml(inquiries.endpoint)}"><p class="eyebrow">한지붕 문의</p><h1>${title}</h1><div data-receipt-status role="status" tabindex="-1"><p>이 화면에 접수번호가 표시되지 않으면 접수가 확인된 상태가 아닙니다.</p></div><p>문의 확인 후 남겨주신 연락방법으로 안내합니다. 접수만으로 상담 일정이나 기관 협력이 확정되지는 않습니다.</p><div class="hero-actions"><a class="button" href="${partner ? '/partnership/' : '/consultation/'}">문의 페이지로 돌아가기</a><a class="button button-secondary" href="/">홈으로 가기</a></div><p>확인이 필요하면 <a href="${site.phoneHref}">${site.phone}</a>으로 연락해 주세요.</p></div></section><script type="module" src="${inquiryScriptUrl}"></script>`;
  return layout({title, description:'접수번호와 실제 저장 여부를 확인하는 페이지입니다.',path:route,body,robots:'noindex,follow'});
}
