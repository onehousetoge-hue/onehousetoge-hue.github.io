// Offline contract test only. No Google tag, HTTP, form, or database requests.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const source = fs.readFileSync(new URL('../src/assets/analytics.js', import.meta.url), 'utf8');
function load(code) {
  const window = {};
  const timers = new Map(); let nextTimer = 0;
  const document = {
    currentScript: {dataset:{analyticsId:'G-58PJ9VG8GC'}},
    referrer: 'https://example.org/private?q=unused',
    title: 'Review only',
    createElement: () => ({}),
    head: {appendChild(){}},
  };
  vm.runInNewContext(code, {window, document, URL, location:{origin:'https://hanjibung.kr', pathname:'/reservation/'},
    setTimeout(fn,ms){const id=++nextTimer;timers.set(id,{fn,ms});return id;},
    clearTimeout(id){timers.delete(id);},
  });
  window.testTimers=timers;
  return window;
}
const inert = load(source.replace('AW-18497247404/MD8JCKK0_ZUdEKyxlvRE','AW-CONVERSION_ID/CONVERSION_LABEL'));
assert.equal(inert.hanjibungTrackDiagnosisAdsConversion, undefined);
assert.equal(inert.dataLayer.some(args=>args[0]==='config' && String(args[1]).startsWith('AW-')), false);
const enabled = load(source);
const callback = enabled.hanjibungTrackDiagnosisAdsConversion;
assert.equal(callback('invalid'), false);
const id='aa111111-2222-4333-8444-555555555555';
assert.equal(callback(id), true);
assert.equal(callback(id), false);
const conversions=enabled.dataLayer.filter(args=>args[0]==='event' && args[1]==='conversion');
assert.equal(conversions.length,1);
assert.equal(conversions[0][2].transaction_id,id);
assert.equal(conversions[0][2].send_to,'AW-18497247404/MD8JCKK0_ZUdEKyxlvRE');
assert.deepEqual(Object.keys(conversions[0][2]).sort(),['send_to','transaction_id']);
const defaults=enabled.dataLayer.find(args=>args[0]==='consent');
assert.equal(defaults[2].ad_storage,'denied');
assert.equal(defaults[2].ad_user_data,'denied');
assert.equal(defaults[2].ad_personalization,'denied');
const reservation=fs.readFileSync(new URL('../src/assets/reservation.js',import.meta.url),'utf8');
assert.match(reservation,/result\.requestId === id\) resolve\(\{ ok: true, requestId: result\.requestId \}\)/);
assert.equal(reservation.split('hanjibungTrackDiagnosisAdsConversion').length-1,1);
assert.ok(reservation.indexOf('hanjibungTrackDiagnosisAdsConversion')>reservation.indexOf('    if (result.ok) {'));
new vm.Script(reservation);
const consultationPending=enabled.hanjibungTrackConsultationAdsConversion(id);
const consultationEvent=enabled.dataLayer.filter(args=>args[0]==='event' && args[1]==='conversion').at(-1);
assert.equal(consultationEvent[2].send_to,'AW-18497247404/YtwgCJGU_JUdEKyxlvRE');
assert.equal(consultationEvent[2].transaction_id,id);
assert.deepEqual(Object.keys(consultationEvent[2]).sort(),['event_callback','event_timeout','send_to','transaction_id']);
assert.equal(consultationEvent[2].event_timeout,1000);
assert.equal([...enabled.testTimers.values()][0].ms,1200);
consultationEvent[2].event_callback();
await consultationPending;
assert.equal(enabled.testTimers.size,0);
const countBefore=enabled.dataLayer.length;
await enabled.hanjibungTrackConsultationAdsConversion(id);
assert.equal(enabled.dataLayer.length,countBefore);
const timeoutPending=enabled.hanjibungTrackConsultationAdsConversion('bb111111-2222-4333-8444-555555555555');
[...enabled.testTimers.values()][0].fn();
await timeoutPending;
assert.equal(enabled.testTimers.size,0);
const inquirySource=fs.readFileSync(new URL('../src/assets/inquiry.js',import.meta.url),'utf8');
const inquiry=await import('data:text/javascript;base64,'+Buffer.from(inquirySource).toString('base64'));
const tracked=[];
globalThis.window={hanjibungTrackConsultationAdsConversion:async requestId=>tracked.push(requestId)};
const receipt={requestId:id,kind:'consultation',receivedAt:'2026-10-09 15:00:00'};
const payload={action:'submit',kind:'consultation',requestId:id,topic:'빈방·유휴공간 활용'};
for(const topic of ['빈방·유휴공간 활용','공동생활 준비','가족과 생활규칙']) {
  await inquiry.recordHostConsultationConversion(receipt,{...payload,topic});
}
assert.deepEqual(tracked,[id,id,id]);
for(const topic of ['주거·복지정보','기타 상담','기타 기관협력','']) {
  await inquiry.recordHostConsultationConversion(receipt,{...payload,topic});
}
await inquiry.recordHostConsultationConversion({...receipt,kind:'partnership'},{...payload,kind:'partnership'});
await inquiry.recordHostConsultationConversion(receipt,{...payload,action:'status'});
await inquiry.recordHostConsultationConversion(receipt,{...payload,requestId:'mismatch'});
assert.equal(tracked.length,3);
globalThis.window.hanjibungTrackConsultationAdsConversion=()=>{throw Error('blocked');};
await inquiry.recordHostConsultationConversion(receipt,payload);
const testEndpoint='https://script.google.com/macros/s/ReviewOnlyFakeId/exec';
globalThis.fetch=async()=>({ok:true,type:'basic',json:async()=>({ok:true,...receipt})});
assert.deepEqual(await inquiry.send(testEndpoint,payload),receipt);
for(const result of [{ok:false,...receipt},{ok:true,...receipt,requestId:'mismatch'},{ok:true,...receipt,kind:'partnership'},{ok:true,...receipt,receivedAt:'invalid'}]) {
  globalThis.fetch=async()=>({ok:true,type:'basic',json:async()=>result});
  await assert.rejects(inquiry.send(testEndpoint,payload));
}
assert.ok(inquirySource.indexOf('await recordHostConsultationConversion(receipt, payload)')>inquirySource.indexOf('const receipt = await send(endpoint,payload)'));
assert.ok(inquirySource.indexOf('await recordHostConsultationConversion(receipt, payload)')<inquirySource.indexOf('location.assign('));
assert.equal(inquirySource.slice(inquirySource.indexOf('const complete =')).includes('recordHostConsultationConversion'),false);
console.log('PASS: exact two Ads destinations; confirmed receipt validation; three allowed consultation types only; other topics, partnership, status and mismatched IDs excluded; bounded callback/timeout; per-action UUID deduplication; no value/PII/topic in Ads params; unchanged denied consent; success-only hooks; no completion-page firing; JavaScript syntax. Offline mocks only, no HTTP or DB writes.');

