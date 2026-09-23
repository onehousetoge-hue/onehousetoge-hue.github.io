// Deploy as a web app executing as the owner. Never return sheet rows or contacts.
var INQUIRY_SHEET_ID = '1VmJHrSyc_HinoDgLInKDyL3xQaUJlg6F28kpDKXELBk';
var INQUIRY_VERSION = '2026-09-24';
var INQUIRY_TABS = { consultation: '상담문의', partnership: '기관협력' };
var INQUIRY_TOPICS = {
  consultation: ['빈방·유휴공간 활용', '공동생활 준비', '가족과 생활규칙', '주거·복지정보', '기타 상담'],
  partnership: ['디지털·AI 교육', '세대교류·봉사', '주거문화 안내', '실태조사 협력', '기타 기관협력']
};

function jsonResponse(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}
function doGet() {
  return jsonResponse({ service: 'hanjibung-inquiries', version: INQUIRY_VERSION });
}
function cleanCell(value) {
  return /^[=+\-@\t\r\n]/.test(value) ? "'" + value : value;
}
function validateInquiry(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('INVALID');
  var kind = input.kind;
  if (!Object.prototype.hasOwnProperty.call(INQUIRY_TABS, kind)) throw new Error('INVALID');
  if (typeof input.requestId !== 'string' || !/^[a-f0-9-]{36}$/.test(input.requestId)) throw new Error('INVALID');
  if (input.action === 'status') return { action: 'status', kind: kind, requestId: input.requestId };
  if (input.action !== 'submit' || input.website || input.consent !== true || input.consentVersion !== INQUIRY_VERSION) throw new Error('INVALID');
  function text(key, min, max) {
    var value = typeof input[key] === 'string' ? input[key].trim() : '';
    if (value.length < min || value.length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value)) throw new Error('INVALID');
    return value;
  }
  var name = text('name', 1, 60), contact = text('contact', 5, 120);
  if (!['phone', 'email'].includes(input.contactMethod)) throw new Error('INVALID');
  if (input.contactMethod === 'phone' && !/^0\d{8,10}$/.test(contact.replace(/[ -]/g, ''))) throw new Error('INVALID');
  if (input.contactMethod === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact)) throw new Error('INVALID');
  if (!INQUIRY_TOPICS[kind].includes(input.topic)) throw new Error('INVALID');
  var message = text('message', 5, 1000);
  if (/\b\d{6}[- ]?[1-8]\d{6}\b/.test(message)) throw new Error('SENSITIVE');
  return { action: 'submit', kind: kind, requestId: input.requestId, name: name,
    contactMethod: input.contactMethod, contact: contact,
    organization: kind === 'partnership' ? text('organization', 1, 100) : '', topic: input.topic, message: message };
}
function doPost(e) {
  var lock;
  try {
    if (!e || !e.postData || e.postData.contents.length > 12000) throw new Error('INVALID');
    var data = validateInquiry(JSON.parse(e.postData.contents));
    lock = LockService.getScriptLock();
    if (!lock.tryLock(8000)) throw new Error('BUSY');
    var sheet = SpreadsheetApp.openById(INQUIRY_SHEET_ID).getSheetByName(INQUIRY_TABS[data.kind]);
    if (!sheet || sheet.getRange(1, 1).getValue() !== '접수번호') throw new Error('UNAVAILABLE');
    var found = sheet.getRange('A:A').createTextFinder(data.requestId).matchEntireCell(true).findNext();
    var values = [data.name, data.contactMethod === 'phone' ? '전화' : '이메일', data.contact, data.organization, data.topic, data.message];
    if (found) {
      var existing = sheet.getRange(found.getRow(), 1, 1, 13).getDisplayValues()[0];
      if (data.action === 'submit' && values.some(function(value, index) { return existing[index + 2].replace(/^'/, '') !== value; })) throw new Error('CONFLICT');
      return jsonResponse({ ok: true, requestId: data.requestId, kind: data.kind, receivedAt: existing[1] });
    }
    if (data.action === 'status') return jsonResponse({ ok: false, code: 'NOT_FOUND' });
    // Hard daily cap limits storage spam. This is not a substitute for CAPTCHA/WAF at scale.
    var props = PropertiesService.getScriptProperties();
    var day = Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd');
    var count = props.getProperty('dailyDate') === day ? Number(props.getProperty('dailyCount') || 0) : 0;
    if (count >= 100) throw new Error('BUSY');
    var receivedAt = Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd HH:mm:ss');
    var row = [data.requestId, receivedAt].concat(values.map(cleanCell), ['동의', INQUIRY_VERSION, '접수', '', '']);
    var rowIndex = sheet.getLastRow() + 1;
    sheet.getRange(rowIndex, 1, 1, 13).setNumberFormat('@').setValues([row]);
    SpreadsheetApp.flush();
    if (sheet.getRange(rowIndex, 1).getDisplayValue() !== data.requestId) throw new Error('UNAVAILABLE');
    props.setProperties({ dailyDate: day, dailyCount: String(count + 1) });
    return jsonResponse({ ok: true, requestId: data.requestId, kind: data.kind, receivedAt: receivedAt });
  } catch (error) {
    var code = ['INVALID', 'SENSITIVE', 'CONFLICT', 'BUSY', 'UNAVAILABLE'].includes(error.message) ? error.message : 'UNAVAILABLE';
    return jsonResponse({ ok: false, code: code });
  } finally {
    if (lock && lock.hasLock()) lock.releaseLock();
  }
}
