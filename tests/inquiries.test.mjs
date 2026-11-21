import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { inquiries } from '../src/config/inquiries.mjs';
import { validateInquiryInput, send } from '../src/assets/inquiry.js';
import { callbackPayload } from '../src/assets/callback.js';
const code = await readFile(new URL('../integrations/inquiries/Code.gs',import.meta.url),'utf8');
const valid = {action:'submit',kind:'consultation',requestId:'11111111-2222-4333-8444-555555555555',name:'접수 시험',contactMethod:'email',contact:'qa@hanjibung.invalid',organization:'',topic:'기타 상담',message:'연결 검증용 비개인 시험 내용입니다.',consent:true,consentVersion:'2026-09-24',website:''};
test('client transport rejects errors, timeouts, malformed and mismatched receipts without real network',async(t)=>{
  const good={ok:true,kind:valid.kind,requestId:valid.requestId,receivedAt:'2026-09-25 12:00:00'};
  const stub=t.mock.method(globalThis,'fetch',async()=>({ok:true,type:'basic',json:async()=>good}));
  assert.deepEqual(await send(inquiries.endpoint,valid),{kind:good.kind,requestId:good.requestId,receivedAt:good.receivedAt});
  for(const response of [{ok:false},{ok:true,type:'opaque'},{ok:true,json:async()=>({...good,requestId:'wrong'})},{ok:true,json:async()=>({...good,kind:'partnership'})},{ok:true,json:async()=>({...good,receivedAt:''})},{ok:true,json:async()=>{throw new SyntaxError('invalid JSON');}}]) {
    stub.mock.mockImplementation(async()=>response); await assert.rejects(send(inquiries.endpoint,valid));
  }
  stub.mock.mockImplementation(async()=>{throw new DOMException('timeout','TimeoutError');});
  await assert.rejects(send(inquiries.endpoint,valid),{name:'TimeoutError'});
  const calls=stub.mock.callCount(); await assert.rejects(send('https://unapproved.invalid',valid)); assert.equal(stub.mock.callCount(),calls);
});
test('client validation gives actionable errors without sending an inquiry',()=>{
  assert.deepEqual(validateInquiryInput(valid,'consultation'),{});
  assert.deepEqual(validateInquiryInput({...valid,contactMethod:'phone',contact:'010-1234-5678'},'consultation'),{});
  const empty=validateInquiryInput({},'consultation');
  assert.deepEqual(Object.keys(empty),['name','contact','topic','message','consent']);
  assert.match(empty.contact,/010-1234-5678/);
  assert.match(validateInquiryInput({...valid,contact:'invalid'},'consultation').contact,/이메일 전체 주소/);
  assert.ok(validateInquiryInput({...valid,name:'   ',message:'     '},'consultation').name);
  assert.ok(validateInquiryInput({...valid,name:'   ',message:'     '},'consultation').message);
  assert.ok(validateInquiryInput(valid,'partnership').organization);
  assert.deepEqual(validateInquiryInput({...valid,organization:'시험 기관'},'partnership'),{});
});
function server({failWrite=false}={}) {
  const rows=[['접수번호']]; let flush=0; const props={};
  const sheet={getMaxColumns:()=>26,getLastRow:()=>rows.length,getRange:(row,col,height=1,width=1)=>{
    if(typeof row==='string') return {createTextFinder:id=>({matchEntireCell(){return this;},findNext(){const index=rows.findIndex(value=>value[0]===id);return index<0?null:{getRow:()=>index+1};}})};
    function getValues(){return Array.from({length:height},(_,i)=>Array.from({length:width},(_,j)=>rows[row+i-1]?.[col+j-1]||''));}
    const range={getValue:()=>getValues()[0][0],getDisplayValue:()=>getValues()[0][0],getValues,getDisplayValues:getValues,
      isBlank:()=>getValues().flat().every(v=>v===''),setNumberFormat:()=>range,setWrapStrategy:()=>range,setFontWeight:()=>range,
      setValue:value=>range.setValues([[value]]),setValues:values=>{if(failWrite) throw new Error('storage failed');
        for(const [i,entry] of values.entries()){rows[row+i-1]||=[];entry.forEach((v,j)=>{rows[row+i-1][col+j-1]=v;});}return range;}};return range;
  }};
  const context=vm.createContext({ContentService:{MimeType:{JSON:'json'},createTextOutput:text=>({setMimeType:()=>JSON.parse(text)})},SpreadsheetApp:{openById:()=>({getSheetByName:()=>sheet}),flush:()=>flush++},LockService:{getScriptLock:()=>({tryLock:()=>true,hasLock:()=>true,releaseLock(){}})},PropertiesService:{getScriptProperties:()=>({getProperty:key=>props[key],setProperties:value=>Object.assign(props,value)})},Utilities:{formatDate:(_date,_zone,format)=>format==='yyyy-MM-dd'?'2026-09-24':'2026-09-24 12:00:00'}});
  context.Utilities.base64Decode = value => [...Buffer.from(value,'base64')];
  context.SpreadsheetApp.WrapStrategy = {CLIP:'CLIP'};
  vm.runInContext(code,context);return {context,rows,flush:()=>flush,post:payload=>context.doPost({postData:{contents:JSON.stringify(payload)}})};
}
test('a room photo is saved with the confirmed lead and attribution, and only the receipt is public',async()=>{
  const s=server();
  vm.runInContext(await readFile(new URL('../integrations/attribution/LeadAttribution.gs',import.meta.url),'utf8'),s.context);
  const photo='data:image/jpeg;base64,'+Buffer.from([255,216,255,224,0,16,255,217]).toString('base64');
  const registration={...valid,topic:'방 등록',consentVersion:inquiries.registrationVersion,roomPhoto:photo,
    attribution:{landing:'/about/',conversion:'/rooms/register/',variant:'B',source:'naver'}};
  const receipt=s.post(registration);
  assert.equal(receipt.ok,true);assert.equal(receipt.roomPhotoSaved,true);assert.ok(!JSON.stringify(receipt).includes(photo));
  assert.equal(s.rows[1][23],photo);assert.equal(s.rows[1][13],'/about/');assert.equal(s.rows[1][14],'/rooms/register/');
  assert.equal(s.rows[1][9],inquiries.registrationVersion);assert.equal(s.rows.length,2);
  assert.deepEqual(s.post(registration),receipt);assert.equal(s.rows.length,2);
  assert.equal(s.post({...registration,roomPhoto:undefined}).code,'CONFLICT');
  for(const bad of [{topic:'기타 상담'},{consentVersion:valid.consentVersion},{roomPhoto:'https://outside.invalid/file'},{roomPhoto:'data:image/jpeg;base64,/9j/AAAA'}]) assert.equal(s.post({...registration,...bad}).code,'INVALID');
  const lookup=s.post({action:'status',kind:'consultation',requestId:valid.requestId});
  assert.deepEqual(Object.keys(lookup).sort(),['kind','ok','receivedAt','requestId']);
});
test('backend and frontend share topics and consent version',()=>{const {context}=server();assert.deepEqual(JSON.parse(JSON.stringify(context.INQUIRY_TOPICS)),inquiries.topics);assert.equal(context.INQUIRY_VERSION,inquiries.consentVersion);});
test('private registration address and phone reach the existing admin detail in one row', async()=>{
  const s = server();
  const address = '테스트길 17 시험동 301호', phone = '010-0000-0000';
  const registration = callbackPayload({location:'시험동',rooms:'2개',availability:'일정 협의',address,contact:phone,name:'오프라인 확인',consent:true},valid.requestId,inquiries.registrationVersion,true);
  const receipt = s.post(registration);
  assert.equal(receipt.ok, true);
  assert.deepEqual(s.post(registration), receipt);
  assert.equal(s.rows.length, 2);
  assert.equal(s.rows[1][4], phone);
  assert.ok(s.rows[1][7].includes('방문할 상세주소: '+address));
  assert.equal(s.post({...registration,message:registration.message.replace('301호','302호')}).code,'CONFLICT');
  assert.deepEqual(Object.keys(s.post({action:'status',kind:'consultation',requestId:valid.requestId})).sort(),['kind','ok','receivedAt','requestId']);
  const admin = vm.createContext({
    DEPLOYMENT:{admin:'operator',callback:{book:'test',gid:1}},
    Session:{getActiveUser:()=>({getEmail:()=> 'operator'})},
    Sheets:{Spreadsheets:{
      get:()=>({sheets:[{properties:{sheetId:1,gridProperties:{columnCount:13}}}]}),
      Values:{batchGet:()=>({valueRanges:[{values:[[s.rows[1][0]]]},{values:[[s.rows[1][6],s.rows[1][7]]]}]})},
    }},
  });
  vm.runInContext(await readFile(new URL('../integrations/admin/Code.gs',import.meta.url),'utf8'),admin);
  assert.ok(admin.getInquiryDetail(2,valid.requestId).message.includes(address));
  admin.Session.getActiveUser=()=>({getEmail:()=>''});
  assert.throws(()=>admin.getInquiryDetail(2,valid.requestId),/관리자/);
});
test('successful receipt is returned only after storage and flush',()=>{const s=server(),r=s.post(valid);assert.equal(r.ok,true);assert.equal(s.rows.length,2);assert.equal(s.flush(),1);assert.deepEqual(Object.keys(r).sort(),['kind','ok','receivedAt','requestId']);});
test('same request ID is idempotent, changed content cannot silently reuse it',()=>{const s=server();s.post(valid);assert.equal(s.post(valid).ok,true);assert.equal(s.rows.length,2);assert.equal(s.post({...valid,message:'다른 문의 내용입니다.'}).code,'CONFLICT');});
test('storage failures do not return success',()=>{const s=server({failWrite:true});assert.equal(s.post(valid).ok,false);assert.equal(s.rows.length,1);});
test('server rejects missing consent, invalid contacts, payload abuse and automated honeypot',()=>{for(const patch of [{consent:false},{contact:'invalid'},{website:'robot'},{message:'짧음'},{message:'a'.repeat(1001)},{kind:'admin'},{requestId:'guess'},{topic:'other'},{contactMethod:'fax'}]) assert.equal(server().post({...valid,...patch}).ok,false,JSON.stringify(patch));});
test('potential resident ID input is rejected, formulas are escaped',()=>{const s=server();assert.equal(s.post({...valid,message:'900101-1234567'}).code,'SENSITIVE');assert.equal(s.context.cleanCell('=IMPORTXML()'),"'=IMPORTXML()");assert.equal(s.context.cleanCell('+123'),"'+123");});
test('receipt lookups disclose no contact data and unknown IDs fail',()=>{const s=server();assert.equal(s.post({action:'status',kind:valid.kind,requestId:valid.requestId}).code,'NOT_FOUND');s.post(valid);const result=s.post({action:'status',kind:valid.kind,requestId:valid.requestId});assert.equal(result.ok,true);assert.ok(!JSON.stringify(result).includes(valid.contact));});
test('partnership requires institution name',()=>{const s=server();assert.equal(s.post({...valid,kind:'partnership',topic:'기타 기관협력'}).ok,false);assert.equal(s.post({...valid,kind:'partnership',topic:'기타 기관협력',organization:'시험 기관'}).ok,true);});
test('completion checks backend and stores only receipt metadata',async()=>{const js=await readFile(new URL('../src/assets/inquiry.js',import.meta.url),'utf8');assert.match(js,/action:'status'/);assert.match(js,/response.type === 'opaque'/);assert.doesNotMatch(js,/mode:\s*['"]no-cors|gtag\(|dataLayer|localStorage/);assert.match(js,/sessionStorage.setItem\(receiptKey\(kind\),JSON.stringify\(receipt\)\)/);assert.match(js,/invalid\.scrollIntoView\(\{block:'center'/);});
