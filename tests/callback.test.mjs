import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { callbackPayload, submitCallback } from '../src/assets/callback.js';
import { inquiries } from '../src/config/inquiries.mjs';
import { extractRoom } from '../src/assets/room-description.js';

const id = 'aa111111-2222-4333-8444-555555555555';
const values = {name:'오프라인 시험',contact:'010-0000-0000',message:'사진 없이 먼저 빈방 활용 상담을 받고 싶습니다.',consent:true,website:''};
const payload = callbackPayload(values, id, inquiries.consentVersion);
const receipt = {requestId:id,kind:'consultation',receivedAt:'2026-10-09 12:00:00'};

test('a host can describe, correct and review a room using a real sentence or a short follow-up',()=>{
  assert.deepEqual(extractRoom('노원구 공릉동 아파트 방 두 개, 12월 1일부터. 월세 45만원, 관리비 5만원, 보증금 500만원. 방 6평에 2층이에요.'),{
    location:'노원구 공릉동',rooms:'2개',availability:'12월 1일부터',rent:'45만원',deposit:'500만원',fee:'5만원',homeType:'아파트',area:'6평',floor:'2층'
  });
  assert.deepEqual(extractRoom('월세는 45만 원 말고 38만 원으로 바꿔줘'),{rent:'38만 원'});
  assert.deepEqual(extractRoom('3개 이상','rooms'),{rooms:'3개 이상'});
  assert.equal(extractRoom('방 두 개 중 하나만 빌려요').rooms,'1개');
  assert.equal(extractRoom('일정은 서로 상의해서 정해요','availability').availability,'일정 협의');
  assert.equal(extractRoom('바로 가능하지 않아요','availability').availability,undefined);
  assert.equal(extractRoom('월세 50').rent,undefined);
  assert.deepEqual(extractRoom('공릉동 010-0000-0000'),{});
  assert.equal(extractRoom('월세는 아직 잘 모르겠어요','availability').availability,undefined);
  assert.equal(extractRoom('다가구주택이고 가구도 있어요').location,undefined);
});

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

test('the two intake forms have distinct fields and the existing diagnosis keeps its inputs',async()=>{
  const page = async path => readFile(new URL('../dist/' + path + '/index.html',import.meta.url),'utf8');
  const consultation=await page('consultation'), registration=await page('rooms/register'), diagnosis=await page('reservation');
  for(const [html,kind] of [[consultation,'consultation'],[registration,'registration']]){
    assert.equal((html.match(/<form\b/g)||[]).length,1);
    assert.ok(html.includes('data-intake="'+kind+'"'));
    assert.ok(html.includes(inquiries.endpoint));
    assert.match(html,/<fieldset disabled>/);
    assert.match(html,/상담 종료일로부터 최대 1년간/);
    if(kind==="consultation") assert.doesNotMatch(html,/type="file"/);
    else assert.match(html,/<input[^>]+type="file"[^>]+accept="image\/jpeg,image\/png,image\/webp"/);
  }
  assert.match(consultation,/<textarea[^>]+name="message"/);
  for(const field of ['location','rooms','availability']){
    assert.ok(registration.includes('name="'+field+'"'));
    assert.ok(!consultation.includes('name="'+field+'"'));
  }
  assert.doesNotMatch(diagnosis,/data-callback-form|data-open-callback/);
  assert.match(diagnosis,/class="inquiry-form"/);
  assert.match(diagnosis,/href="\/consultation\/"/);
  assert.match(diagnosis,/상담 완료 후 90일 이내/);
  const redirect=diagnosis.match(/<script>(const legacyConsultation[\s\S]*?)<\/script>/)[1];
  let destination;
  vm.runInNewContext(redirect,{URL,location:{href:'https://hanjibung.kr/reservation/?consultation=quick&utm_source=naver#quick-consultation',replace:url=>{destination=url;}}});
  assert.equal(destination,'https://hanjibung.kr/consultation/?utm_source=naver#quick-consultation');
});

test('registration accepts room details in the existing sheet contract and measures a separate confirmed event',async(t)=>{
  const form={...values,location:'공릉동',rooms:'1개',availability:'일정 협의'};
  const data=callbackPayload(form,id,inquiries.consentVersion,true);
  const ctx=vm.createContext({});
  vm.runInContext(await readFile(new URL('../integrations/inquiries/Code.gs',import.meta.url),'utf8'),ctx);
  const normalized=ctx.validateInquiry(data);
  assert.equal(normalized.topic,'방 등록');
  assert.equal(normalized.message,'동네: 공릉동\n남는 방: 1개\n입주 가능 시기: 일정 협의');
  assert.throws(()=>ctx.validateInquiry({...data,consent:false}));
  const events=[], ads=[];
  globalThis.document={querySelector:()=>({dataset:{analyticsId:'G-58PJ9VG8GC'}})};
  globalThis.window={gtag:(...args)=>events.push(args),hanjibungTrackConsultationAdsConversion:key=>ads.push(key)};
  t.after(()=>{delete globalThis.document; delete globalThis.window;});
  t.mock.method(globalThis,'fetch',async()=>({ok:true,type:'basic',json:async()=>({ok:true,...receipt})}));
  await submitCallback(inquiries.endpoint,data);
  assert.deepEqual(events,[['event','room_registration_complete',{send_to:'G-58PJ9VG8GC'}]]);
  assert.deepEqual(ads,[]);
});
