import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import test from "node:test";

const source = (file) => readFileSync(new URL(file, import.meta.url), "utf8");
const site = source("../src/assets/site.js");
const sheets = source("../integrations/attribution/LeadAttribution.gs");
const admin = source("../integrations/admin/Code.gs");
function navigate(path, storage, referrer = "", type = "navigate") {
  const location = new URL(path, "https://hanjibung.kr");
  const window = { sessionStorage: { getItem:key=>storage.get(key), setItem:(key,val)=>storage.set(key,val) },
    performance: { getEntriesByType:()=>[{type}] } };
  vm.runInNewContext(site,{window,location,URL,document:{referrer,querySelectorAll:()=>[]}});
  return window.hanjibungLeadVisit;
}
test("a confirmed lead carries the first campaign, real exposure and safe public paths across the form",()=>{
  const store = new Map();
  const home = navigate("/?utm_source=naver&utm_medium=cpc&utm_campaign=겨울&email=private@example.com",store,"https://search.naver.com/search?private=1");
  home.expose("B");
  const form = navigate("/reservation/",store,"https://hanjibung.kr/");
  const data = JSON.parse(JSON.stringify(form.snapshot()));
  assert.equal(data.landing,"/"); assert.equal(data.variant,"B");assert.equal(data.referrer,"search.naver.com");
  assert.equal(data.source,"naver");assert.equal(data.medium,"cpc");assert.equal(data.campaign,"겨울");
  assert.doesNotMatch(JSON.stringify(data),/private|@|requestId|gclid/);
  const ctx = vm.createContext({data});
  vm.runInContext(sheets,ctx);
  for (const kind of ["diagnosis","callback"]) {
    const cells = vm.runInContext("leadCells_(data,'"+kind+"')",ctx);
    assert.equal(cells.length,10);assert.equal(cells[2],"B");
    assert.equal(cells[1],kind==="callback"?"/reservation/?consultation=quick":"/reservation/");
  }
  const fresh = navigate("/reservation/?utm_source=message",store,"https://kakao.com/");
  assert.equal(fresh.snapshot().variant,"");assert.equal(fresh.snapshot().landing,"/reservation/");
  assert.equal(navigate("/?headline_preview=B",store),undefined);
  const key = Array.from(store.keys())[0], old=JSON.parse(store.get(key));
  old.touched=Date.now()-31*60000;old.variant="A";store.set(key,JSON.stringify(old));
  const direct=navigate("/reservation/",store).snapshot();assert.equal(direct.variant,"");assert.equal(direct.source,"(direct)");
});
test("campaign formulae and contact strings stay out of saved attribution",()=>{
  const scope=vm.createContext({});vm.runInContext(sheets,scope);
  const cells=vm.runInContext("leadCells_({landing:'/',variant:'other',source:'=SUM(5)',campaign:'a@a.kr',term:'010-1234-5678',referrer:'https://bad.test/private'},'callback')",scope);
  assert.equal(cells.length,10);assert.ok(cells.slice(2).every(x=>x===""));
});
test("all web and data entry points deny missing or different Google identities before reading data",()=>{
  for(const email of ["","another@example.org"]){
    const ctx=vm.createContext({DEPLOYMENT:{admin:"authorized@example.org"},Session:{getActiveUser:()=>({getEmail:()=>email})}});
    vm.runInContext(admin,ctx);
    for(const call of ["doGet()","getTraffic(28)","listLeads('diagnosis',null)","getContact('callback',2,'bad')","getInquiryDetail(2,'bad')"])
      assert.throws(()=>vm.runInContext(call,ctx),/관리자 로그인/);
  }
});

test("new entry pages retain the original campaign and distinguish each conversion destination",()=>{
  for(const landing of ["/about/","/consultation/","/rooms/register/"]){
    for(const [kind,conversion] of [["diagnosis","/reservation/"],["callback","/consultation/"],["registration","/rooms/register/"]]){
      const store=new Map();
      navigate(landing+"?utm_source=naver&utm_medium=referral",store);
      const data=navigate(conversion,store).snapshot();
      const ctx=vm.createContext({data});vm.runInContext(sheets,ctx);
      const cells=ctx.leadCells_(data,kind);
      assert.equal(cells[0],landing);
      assert.equal(cells[1],conversion);
      assert.equal(cells[3],"naver");
    }
  }
});
