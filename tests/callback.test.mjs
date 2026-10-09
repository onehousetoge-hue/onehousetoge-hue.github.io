import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { callbackPayload, submitCallback } from '../src/assets/callback.js';
import { inquiries } from '../src/config/inquiries.mjs';

const id = 'aa111111-2222-4333-8444-555555555555';
const values = {name:'오프라인 시험',contact:'010-0000-0000',message:'사진 없이 먼저 빈방 활용 상담을 받고 싶습니다.',consent:true,website:''};
const payload = callbackPayload(values, id, inquiries.consentVersion);
const receipt = {requestId:id,kind:'consultation',receivedAt:'2026-10-09 12:00:00'};

test('callback is compatible with the existing server and requires real consent and contact',async()=>{
  const code = await readFile(new URL('../integrations/inquiries/Code.gs',import.meta.url),'utf8');
  const context = vm.createContext({}); vm.runInContext(code,context);
  const normalized = context.validateInquiry(payload);
  assert.equal(normalized.kind,'consultation');
  assert.equal(normalized.topic,'빈방·유휴공간 활용');
  assert.equal(normalized.message,values.message);
  assert.equal(normalized.contactMethod,'phone');
  assert.equal('photos' in payload,false);
  for(const patch of [{consent:false},{consentVersion:'wrong'},{contact:'invalid'},{message:'짧음'},{website:'robot'}]) {
    assert.throws(()=>context.validateInquiry({...payload,...patch}));
  }
});

test('callback tracks only after a matching saved receipt, and retry preserves its ID',async(t)=>{
  const tracked=[]; const sent=[];
  globalThis.window={hanjibungTrackConsultationAdsConversion:async requestId=>tracked.push(requestId)};
  t.after(()=>{delete globalThis.window;});
  const fetchStub=t.mock.method(globalThis,'fetch',async(_url,options)=>{
    sent.push(JSON.parse(options.body));
    return {ok:true,type:'basic',json:async()=>({ok:false})};
  });
  await assert.rejects(submitCallback(inquiries.endpoint,payload));
  assert.deepEqual(tracked,[]);
  for(const bad of [{...receipt,requestId:'wrong'},{...receipt,kind:'partnership'},{...receipt,receivedAt:'invalid'}]) {
    fetchStub.mock.mockImplementation(async()=>({ok:true,type:'basic',json:async()=>({ok:true,...bad})}));
    await assert.rejects(submitCallback(inquiries.endpoint,payload));
    assert.deepEqual(tracked,[]);
  }
  fetchStub.mock.mockImplementation(async(_url,options)=>{
    sent.push(JSON.parse(options.body));
    return {ok:true,type:'basic',json:async()=>({ok:true,...receipt})};
  });
  assert.deepEqual(await submitCallback(inquiries.endpoint,payload),receipt);
  assert.deepEqual(tracked,[id]);
  assert.deepEqual(sent.map(p=>p.requestId),[id,id]);
  assert.deepEqual(sent[0],sent[1]);
  const calls=fetchStub.mock.callCount();
  await assert.rejects(submitCallback(inquiries.endpoint,{...payload,consent:false}));
  assert.equal(fetchStub.mock.callCount(),calls);
});

test('photo-free form stays on reservation and cannot interfere with photo diagnosis',async()=>{
  const html=await readFile(new URL('../dist/reservation/index.html',import.meta.url),'utf8');
  assert.equal((html.match(/data-callback-form/g)||[]).length,1);
  assert.equal((html.match(/class="inquiry-form"/g)||[]).length,1);
  assert.match(html,/<form class="callback-form"[^>]*>[\s\S]*?<fieldset disabled>/);
  assert.match(html,/사진 없이 먼저 상담 신청/);
  assert.ok(html.indexOf('사진 없이 먼저 상담 신청') < html.indexOf('class="reservation-illustration"'));
  assert.ok(html.includes(inquiries.endpoint));
  assert.match(html,/상담 종료일로부터 최대 1년간/);
  assert.match(html,/상담 완료 후 90일 이내/);
  assert.doesNotMatch(html.match(/<form class="callback-form"[\s\S]*?<\/form>/)[0],/type="file"|data-inquiry=/);
  const diagnosis=await readFile(new URL('../src/assets/reservation.js',import.meta.url),'utf8');
  assert.match(diagnosis,/if \(!photos.length\)/);
  assert.match(diagnosis,/hanjibungTrackDiagnosisAdsConversion/);
});
