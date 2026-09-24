import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { inquiries } from '../src/config/inquiries.mjs';
import { validateInquiryInput } from '../src/assets/inquiry.js';
import { consultationRecords, validateConsultationRecord } from '../src/content/consultation-records.mjs';
const code = await readFile(new URL('../integrations/inquiries/Code.gs',import.meta.url),'utf8');
const valid = {action:'submit',kind:'consultation',requestId:'11111111-2222-4333-8444-555555555555',name:'접수 시험',contactMethod:'email',contact:'qa@hanjibung.invalid',organization:'',topic:'기타 상담',message:'연결 검증용 비개인 시험 내용입니다.',consent:true,consentVersion:'2026-09-24',website:''};
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
test('inquiry errors have a keyboard summary and adjacent field descriptions',async()=>{
  for(const kind of ['consultation','partnership']) {
    const html=await readFile(new URL(`../dist/${kind}/index.html`,import.meta.url),'utf8');
    assert.match(html,/data-form-errors role="alert" tabindex="-1" hidden/);
    assert.ok(html.indexOf('class="inquiry-channels"')<html.indexOf('id="inquiry-form"'));
    for(const name of ['name','contact','topic','message','consent']) assert.ok(html.includes(`id="error-${name}"`));
    assert.match(html,/data-message-count/);
  }
});
function server({failWrite=false}={}) {
  const rows=[['접수번호']]; let flush=0; const props={};
  const sheet={getLastRow:()=>rows.length,getRange:(row,col,height,width)=>{
    if(typeof row==='string') return {createTextFinder:id=>({matchEntireCell(){return this;},findNext(){const index=rows.findIndex(value=>value[0]===id);return index<0?null:{getRow:()=>index+1};}})};
    const range={getValue:()=>rows[row-1]?.[col-1]||'',getDisplayValue:()=>rows[row-1]?.[col-1]||'',getDisplayValues:()=>[rows[row-1]||[]],setNumberFormat:()=>range,setValues:values=>{if(failWrite) throw new Error('storage failed');rows[row-1]=values[0];return range;}};return range;
  }};
  const context=vm.createContext({ContentService:{MimeType:{JSON:'json'},createTextOutput:text=>({setMimeType:()=>JSON.parse(text)})},SpreadsheetApp:{openById:()=>({getSheetByName:()=>sheet}),flush:()=>flush++},LockService:{getScriptLock:()=>({tryLock:()=>true,hasLock:()=>true,releaseLock(){}})},PropertiesService:{getScriptProperties:()=>({getProperty:key=>props[key],setProperties:value=>Object.assign(props,value)})},Utilities:{formatDate:(_date,_zone,format)=>format==='yyyy-MM-dd'?'2026-09-24':'2026-09-24 12:00:00'}});
  vm.runInContext(code,context);return {context,rows,flush:()=>flush,post:payload=>context.doPost({postData:{contents:JSON.stringify(payload)}})};
}
test('backend and frontend share topics and consent version',()=>{const {context}=server();assert.deepEqual(JSON.parse(JSON.stringify(context.INQUIRY_TOPICS)),inquiries.topics);assert.equal(context.INQUIRY_VERSION,inquiries.consentVersion);});
test('successful receipt is returned only after storage and flush',()=>{const s=server(),r=s.post(valid);assert.equal(r.ok,true);assert.equal(s.rows.length,2);assert.equal(s.flush(),1);assert.deepEqual(Object.keys(r).sort(),['kind','ok','receivedAt','requestId']);});
test('same request ID is idempotent, changed content cannot silently reuse it',()=>{const s=server();s.post(valid);assert.equal(s.post(valid).ok,true);assert.equal(s.rows.length,2);assert.equal(s.post({...valid,message:'다른 문의 내용입니다.'}).code,'CONFLICT');});
test('storage failures do not return success',()=>{const s=server({failWrite:true});assert.equal(s.post(valid).ok,false);assert.equal(s.rows.length,1);});
test('server rejects missing consent, invalid contacts, payload abuse and automated honeypot',()=>{for(const patch of [{consent:false},{contact:'invalid'},{website:'robot'},{message:'짧음'},{message:'a'.repeat(1001)},{kind:'admin'},{requestId:'guess'},{topic:'other'},{contactMethod:'fax'}]) assert.equal(server().post({...valid,...patch}).ok,false,JSON.stringify(patch));});
test('potential resident ID input is rejected, formulas are escaped',()=>{const s=server();assert.equal(s.post({...valid,message:'900101-1234567'}).code,'SENSITIVE');assert.equal(s.context.cleanCell('=IMPORTXML()'),"'=IMPORTXML()");assert.equal(s.context.cleanCell('+123'),"'+123");});
test('receipt lookups disclose no contact data and unknown IDs fail',()=>{const s=server();assert.equal(s.post({action:'status',kind:valid.kind,requestId:valid.requestId}).code,'NOT_FOUND');s.post(valid);const result=s.post({action:'status',kind:valid.kind,requestId:valid.requestId});assert.equal(result.ok,true);assert.ok(!JSON.stringify(result).includes(valid.contact));});
test('partnership requires institution name',()=>{const s=server();assert.equal(s.post({...valid,kind:'partnership',topic:'기타 기관협력'}).ok,false);assert.equal(s.post({...valid,kind:'partnership',topic:'기타 기관협력',organization:'시험 기관'}).ok,true);});
test('only substantive existing activity records can generate pages',()=>{for(const record of consultationRecords) validateConsultationRecord(record);assert.throws(()=>validateConsultationRecord({...consultationRecords[0],questions:[]}));assert.throws(()=>validateConsultationRecord({...consultationRecords[0],publishedAt:''}));});
test('forms preserve contact choice, privacy consent, actual endpoint and completion noindex',async()=>{
  for(const kind of ['consultation','partnership']) {
    const html=await readFile(new URL(`../dist/${kind}/index.html`,import.meta.url),'utf8');
    assert.ok(html.includes(inquiries.endpoint));for(const name of ['name','contactMethod','contact','topic','message','consent']) assert.ok(html.includes(`name="${name}"`));
    assert.match(html, /<fieldset disabled>/, 'no-JS cannot post contact fields to the static host');
    assert.match(html,/상담 종료일로부터 최대 1년간/);assert.doesNotMatch(html,/<input[^>]*type="file"/);
    const complete=await readFile(new URL(`../dist/${kind}/complete/index.html`,import.meta.url),'utf8');assert.match(complete,/noindex,follow/);assert.match(complete,/접수가 확인된 상태가 아닙니다/);
    const sitemap=await readFile(new URL('../dist/sitemap.xml',import.meta.url),'utf8');assert.ok(sitemap.includes(`/${kind}/</loc>`));assert.ok(!sitemap.includes(`/${kind}/complete/`));
  }
});
test('completion checks backend and stores only receipt metadata',async()=>{const js=await readFile(new URL('../src/assets/inquiry.js',import.meta.url),'utf8');assert.match(js,/action:'status'/);assert.match(js,/response.type === 'opaque'/);assert.doesNotMatch(js,/mode:\s*['"]no-cors|gtag\(|dataLayer|localStorage/);assert.match(js,/sessionStorage.setItem\(receiptKey\(kind\),JSON.stringify\(receipt\)\)/);assert.match(js,/invalid\.scrollIntoView\(\{block:'center'/);});
test('independent activity pages preserve all questions, guidance and follow-up',async()=>{for(const record of consultationRecords){const html=await readFile(new URL(`../dist${record.href}index.html`,import.meta.url),'utf8');for(const fact of [record.date,record.area,record.participants,...record.questions,...record.guidance,...record.followup]) assert.ok(html.includes(fact),fact);assert.match(html,/"@type":"Article"/);}});
