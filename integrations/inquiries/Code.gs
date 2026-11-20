// Deploy as a web app executing as the owner. Never return sheet rows or contacts.
var INQUIRY_SHEET_ID = '1VmJHrSyc_HinoDgLInKDyL3xQaUJlg6F28kpDKXELBk';
var INQUIRY_VERSION = '2026-09-24';
var ROOM_VERSION = '2026-11-21';
var ROOM_PHOTO_HEADER = '방 등록 사진 (관리자 미리보기)';
var INQUIRY_TABS = { consultation: '상담문의', partnership: '기관협력' };
var INQUIRY_TOPICS = {
  consultation: ['빈방·유휴공간 활용', '공동생활 준비', '가족과 생활규칙', '주거·복지정보', '기타 상담', '방 등록'],
  partnership: ['디지털·AI 교육', '세대교류·봉사', '주거문화 안내', '실태조사 협력', '기타 기관협력']
};

function jsonResponse(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}
function doGet() {
  return jsonResponse({ service: 'hanjibung-inquiries', version: INQUIRY_VERSION, registrationVersion: ROOM_VERSION });
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
  var registration = kind === 'consultation' && input.topic === '방 등록' && input.consentVersion === ROOM_VERSION;
  if (input.action !== 'submit' || input.website || input.consent !== true || (!registration && input.consentVersion !== INQUIRY_VERSION)) throw new Error('INVALID');
  var photo = '';
  if (input.roomPhoto !== undefined) {
    photo = input.roomPhoto;
    if (!registration || typeof photo !== 'string' || photo.length > 44000 || !/^data:image\/jpeg;base64,\/9j\/[A-Za-z0-9+/]+={0,2}$/.test(photo)) throw new Error('INVALID');
    var bytes = Utilities.base64Decode(photo.slice(23));
    if (bytes.length < 4 || (bytes[bytes.length-2] & 255) !== 255 || (bytes[bytes.length-1] & 255) !== 217) throw new Error('INVALID');
  }
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
    organization: kind === 'partnership' ? text('organization', 1, 100) : '', topic: input.topic, message: message,
    attribution: kind === 'consultation' ? input.attribution : undefined, consentVersion:input.consentVersion, roomPhoto:photo };
}
function photoColumn_(sheet, create) {
  if (sheet.getMaxColumns() < 24) {
    if (!create) return false;
    sheet.insertColumnsAfter(sheet.getMaxColumns(), 24 - sheet.getMaxColumns());
  }
  var header = sheet.getRange(1, 24);
  if (header.getValue() === ROOM_PHOTO_HEADER) return true;
  if (!create) return false;
  if (!sheet.getRange(1,24,Math.max(1,sheet.getLastRow()),1).isBlank()) throw new Error('UNAVAILABLE');
  header.setValue(ROOM_PHOTO_HEADER);
  return true;
}
function doPost(e) {
  var lock;
  try {
    if (!e || !e.postData || e.postData.contents.length > 56000) throw new Error('INVALID');
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
      var prior = { ok:true, requestId:data.requestId, kind:data.kind, receivedAt:existing[1] };
      if (data.action === 'submit' && data.topic === '방 등록') {
        var savedPhoto = photoColumn_(sheet,false) ? String(sheet.getRange(found.getRow(),24).getValue() || '') : '';
        if (savedPhoto !== data.roomPhoto) throw new Error('CONFLICT');
        if (savedPhoto) prior.roomPhotoSaved = true;
      }
      return jsonResponse(prior);
    }
    if (data.action === 'status') return jsonResponse({ ok: false, code: 'NOT_FOUND' });
    // Hard daily cap limits storage spam. This is not a substitute for CAPTCHA/WAF at scale.
    var props = PropertiesService.getScriptProperties();
    var day = Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd');
    var count = props.getProperty('dailyDate') === day ? Number(props.getProperty('dailyCount') || 0) : 0;
    if (count >= 100) throw new Error('BUSY');
    var receivedAt = Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd HH:mm:ss');
    var row = [data.requestId, receivedAt].concat(values.map(cleanCell), ['동의', data.consentVersion, '접수', '', '']);
    if (data.attribution) {
      var additional = leadCells_(data.attribution, data.topic === '방 등록' ? 'registration' : 'callback');
      if (additional.length) { ensureLeadColumns_(sheet, 13); row = row.concat(additional); }
    }
    var rowIndex = sheet.getLastRow() + 1;
    if (data.roomPhoto) {
      photoColumn_(sheet,true);
      while (row.length < 23) row.push('');
      row.push(data.roomPhoto);
      sheet.getRange(rowIndex,24).setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP);
    }
    sheet.getRange(rowIndex, 1, 1, row.length).setNumberFormat('@').setValues([row]);
    SpreadsheetApp.flush();
    if (sheet.getRange(rowIndex, 1).getDisplayValue() !== data.requestId) throw new Error('UNAVAILABLE');
    props.setProperties({ dailyDate: day, dailyCount: String(count + 1) });
    var receipt = { ok:true, requestId:data.requestId, kind:data.kind, receivedAt:receivedAt };
    if (data.roomPhoto) receipt.roomPhotoSaved = true;
    return jsonResponse(receipt);
  } catch (error) {
    var code = ['INVALID', 'SENSITIVE', 'CONFLICT', 'BUSY', 'UNAVAILABLE'].includes(error.message) ? error.message : 'UNAVAILABLE';
    return jsonResponse({ ok: false, code: code });
  } finally {
    if (lock && lock.hasLock()) lock.releaseLock();
  }
}
