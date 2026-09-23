const receiptKey = (kind) => `hanjibung-receipt-${kind}`;
async function send(endpoint, payload) {
  if (!/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(endpoint)) throw new Error('UNAVAILABLE');
  const response = await fetch(endpoint, {method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(payload),redirect:'follow',credentials:'omit',referrerPolicy:'no-referrer',signal:AbortSignal.timeout(55000)});
  if (!response.ok || response.type === 'opaque') throw new Error('UNAVAILABLE');
  const result = await response.json();
  if (!result.ok || result.requestId !== payload.requestId || result.kind !== payload.kind || !/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(result.receivedAt || '')) throw new Error(result.code || 'UNAVAILABLE');
  return {requestId:result.requestId, kind:result.kind, receivedAt:result.receivedAt};
}
function showReceipt(target, receipt) {
  target.replaceChildren();
  const heading = document.createElement('h2'); heading.textContent = '문의가 접수되었습니다';
  const number = document.createElement('p'); number.textContent = `접수번호: ${receipt.requestId}`;
  const time = document.createElement('p'); time.textContent = `접수시각: ${receipt.receivedAt} (한국시간)`;
  target.append(heading, number, time); target.focus();
}
const form = document.querySelector('[data-inquiry]');
if (form) {
  const endpoint = form.dataset.endpoint, kind = form.dataset.inquiry;
  const status = form.querySelector('[data-form-status]'), button = form.querySelector('[type="submit"]');
  const fieldset = form.querySelector('fieldset');
  if (endpoint) fieldset.disabled = false;
  let requestId = crypto.randomUUID(), busy = false, submitted = false;
  const method = form.elements.contactMethod, contact = form.elements.contact;
  method.addEventListener('change', () => {
    const email = method.value === 'email'; contact.type = email ? 'email' : 'tel'; contact.inputMode = email ? 'email' : 'tel'; contact.autocomplete = email ? 'email' : 'tel';
    form.querySelector('[data-contact-label]').textContent = email ? '연락받을 이메일 (필수)' : '연락받을 전화번호 (필수)';
    contact.value = ''; contact.removeAttribute('aria-invalid');
  });
  form.addEventListener('input', () => { if (!busy) requestId = crypto.randomUUID(); });
  form.addEventListener('submit', async event => {
    event.preventDefault(); if (busy || submitted || !endpoint) return;
    form.querySelectorAll('[aria-invalid]').forEach(el=>el.removeAttribute('aria-invalid'));
    let invalid = [...form.elements].find(el => el.willValidate && !el.validity.valid);
    if (!invalid && method.value === 'phone' && !/^0\d{8,10}$/.test(contact.value.replace(/[ -]/g,''))) invalid = contact;
    if (invalid) { invalid.setAttribute('aria-invalid','true'); status.textContent = invalid === contact ? '회신 연락처를 확인해 주세요. 전화번호는 010-1234-5678처럼, 이메일은 전체 주소를 입력해 주세요.' : '필수 항목과 문의 내용 길이를 확인하고 개인정보 동의에 체크해 주세요.'; invalid.focus(); invalid.scrollIntoView({block:'center',behavior:'instant'}); return; }
    const fields = new FormData(form);
    const payload = Object.fromEntries(fields); Object.assign(payload,{action:'submit',kind,requestId,consent:form.elements.consent.checked,consentVersion:form.dataset.consentVersion});
    busy = true; button.disabled = true; fieldset.disabled = true; form.setAttribute('aria-busy','true'); status.textContent = '문의 내용을 저장하고 있습니다. 잠시만 기다려 주세요.';
    try {
      const receipt = await send(endpoint,payload); submitted = true; form.reset();
      try { sessionStorage.setItem(receiptKey(kind),JSON.stringify(receipt)); }
      catch { showReceipt(status,receipt); return; }
      location.assign(`/${kind}/complete/`);
    } catch (error) {
      status.textContent = error.message === 'SENSITIVE' ? '주민등록번호처럼 보이는 내용은 보내실 수 없습니다. 민감정보를 지운 뒤 다시 보내 주세요.' : error.message === 'CONFLICT' ? '내용이 바뀐 문의입니다. 입력 내용을 한 번 수정한 뒤 다시 보내 주세요.' : '접수 여부를 확인하지 못했습니다. 입력 내용은 남아 있습니다. 다시 보내기를 눌러 확인하거나 전화·이메일로 문의해 주세요. 같은 내용을 그대로 다시 보내면 중복 접수를 방지합니다.';
      if (error.name === 'TimeoutError') status.textContent = '저장 확인 응답이 늦어지고 있습니다. 이미 저장됐을 수 있으니 입력 내용을 바꾸지 말고 다시 보내기를 눌러 접수 여부를 확인해 주세요.';
      status.focus(); status.scrollIntoView({block:'center',behavior:'instant'});
    } finally { busy = false; form.removeAttribute('aria-busy'); button.disabled = submitted; fieldset.disabled = submitted; }
  });
}
const complete = document.querySelector('[data-inquiry-complete]');
if (complete) {
  const kind = complete.dataset.inquiryComplete, status = complete.querySelector('[data-receipt-status]');
  let receipt;
  try { receipt = JSON.parse(sessionStorage.getItem(receiptKey(kind)) || 'null'); } catch { /* private browsing may prohibit storage */ }
  if (receipt?.kind === kind && /^[a-f0-9-]{36}$/.test(receipt.requestId)) {
    status.textContent = '저장된 접수번호를 확인하고 있습니다.';
    send(complete.dataset.endpoint,{action:'status',kind,requestId:receipt.requestId}).then(saved => showReceipt(status,saved)).catch(() => { status.textContent = '현재 접수 확인 정보를 불러오지 못했습니다. 이미 보내셨다면 중복 작성 전에 전화·이메일로 확인해 주세요.'; });
  }
}
