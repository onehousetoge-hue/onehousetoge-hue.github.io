import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const source = Object.fromEntries(await Promise.all(["diagnosis-prefill", "income-calculator", "reservation"].map(async (name) => [name, await readFile(new URL(`../src/assets/${name}.js`, import.meta.url), "utf8")])));
const plain = (value) => JSON.parse(JSON.stringify(value));

function storage() {
  const values = new Map();
  return { values, getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: (key) => values.delete(key) };
}

function environment(store = storage()) {
  let now = 1_800_000_000_000;
  const window = { sessionStorage: store, addEventListener() {}, matchMedia: () => ({ matches: true, addEventListener() {} }), requestAnimationFrame: (callback) => callback(), scrollY: 0, innerHeight: 900 };
  const context = vm.createContext({ window, Date: { now: () => now } });
  vm.runInContext(source["diagnosis-prefill"], context);
  return { context, window, store, prefill: window.hanjibungDiagnosisPrefill, advance: (milliseconds) => { now += milliseconds; } };
}

function element(options = {}) {
  const listeners = new Map();
  return {
    value: "", checked: false, disabled: false, hidden: false, name: "", type: "text", textContent: "",
    ...options,
    classList: { toggle() {} },
    addEventListener(type, listener) { listeners.set(type, listener); },
    emit(type, event = {}) { return listeners.get(type)?.({ target: this, currentTarget: this, preventDefault() {}, ...event }); },
    setAttribute() {}, focus() {},
  };
}

function calculator(env, landmarks = []) {
  const area = element({ name: "area" });
  const types = ["studio", "two-room", "house", "apartment"].map((value) => element({ name: "homeType", value, type: "radio" }));
  const cta = element({ clicks: 0, click() { this.clicks++; this.emit("click"); } });
  const nodes = new Map([["#income-area", area], [".income-reservation", cta]]);
  for (const selector of ["#income-panel", "[data-income-open]", "[data-income-close]", "[data-income-search]", "[data-income-message]"]) nodes.set(selector, element());
  const root = element({
    contains: (node) => node === area || node === cta,
    querySelector: (selector) => selector === '[name="homeType"]:checked' ? types.find((input) => input.checked) : nodes.get(selector),
    querySelectorAll: () => types,
  });
  env.context.document = {
    querySelector: (selector) => selector === "[data-income-calculator]" ? root : null,
    querySelectorAll: (selector) => landmarks.filter(item => selector.includes(item.selector)),
    addEventListener() {},
  };
  vm.runInContext(source["income-calculator"], env.context);
  return { root, area, types, cta, next: nodes.get("[data-income-search]"), message: nodes.get("[data-income-message]") };
}

test("the floating calculator clears the footer and inline CTA without taking focus away", async () => {
  const env = environment();
  const inline = { selector: ".host-intro-estimate-button" }, footer = { selector: ".host-footer" };
  const observed = [];
  let intersect;
  env.context.IntersectionObserver = env.window.IntersectionObserver = class {
    constructor(callback) { intersect = callback; }
    observe(target) { observed.push(target); }
  };
  env.context.queueMicrotask = queueMicrotask;
  const { root, area } = calculator(env, [inline, footer]);
  assert.deepEqual(observed, [inline, footer]);
  intersect([{ target: footer, isIntersecting: true }]);
  assert.equal(root.hidden, true);
  intersect([{ target: footer, isIntersecting: false }, { target: inline, isIntersecting: true }]);
  assert.equal(root.hidden, true);
  intersect([{ target: inline, isIntersecting: false }]);
  assert.equal(root.hidden, false);
  env.context.document.activeElement = area;
  intersect([{ target: footer, isIntersecting: true }]);
  assert.equal(root.hidden, false);
  env.context.document.activeElement = null;
  root.emit("focusout", { relatedTarget: null });
  await Promise.resolve();
  assert.equal(root.hidden, true);
});

async function reservation(env, initial = {}, checkReadiness = async () => ({ ok: true, json: async () => ({ ready: true }) }),
  respond = (payload) => ({ status: 200, text: JSON.stringify({ ok: true, requestId: payload.requestId }) })) {
  const controls = [];
  const textFields = Object.fromEntries(["area", "location", "phone"].map((name) => {
    const input = element({ name, value: initial[name] || "" });
    controls.push(input);
    return [name, input];
  }));
  const choices = { areaType: ["대학교", "지하철역"], homeType: ["원룸", "투룸 +", "단독 주택", "아파트"], rooms: ["1개", "2개", "3개 이상"], aircon: ["있음", "없음"], tenure: ["자가", "전세·월세"] };
  for (const [name, values] of Object.entries(choices)) controls.push(...values.map((value) => element({ name, value, type: "radio", checked: initial[name] === value })));
  const consent = element({ name: "consent", value: "on", type: "checkbox" });
  controls.push(consent);
  const nodes = new Map(Object.entries(textFields).map(([name, input]) => [`#${name}`, input]));
  for (const selector of [".submit", ".submit-note", ".error", ".setup-notice", ".privacy-toggle", ".privacy"]) nodes.set(selector, element());
  function matching(selector) {
    const name = selector.match(/\[name="([^"]+)"\]/)?.[1];
    return controls.filter((input) => input.name === name && (!selector.endsWith(":checked") || input.checked));
  }
  const form = element({
    querySelector: (selector) => nodes.get(selector) || matching(selector)[0],
    querySelectorAll: (selector) => selector === "input, .privacy-toggle" ? [...controls, nodes.get(".privacy-toggle")] : matching(selector),
    reportValidity: () => true,
  });
  const rootNodes = new Map([[".inquiry-form", form], ...[".success", "#diagnosis-title", "#diagnosis-description", "[data-retry-connection]"].map((selector) => [selector, element()])]);
  const root = { querySelector: (selector) => rootNodes.get(selector) };
  const sent = [];
  Object.assign(env.context, {
    document: { querySelector: (selector) => selector === ".reservation-app" ? root : null },
    fetch: (url, options) => { assert.equal(options.method, undefined); return checkReadiness(url, options); },
    AbortController, setTimeout, clearTimeout,
    crypto: { randomUUID: () => "7baffc1d-aef8-423c-ad43-70ae1fbd873b" },
    performance: { now: () => 100 },
    FormData: class {
      get(name) { return controls.find((input) => input.name === name && !input.disabled && (!['radio', 'checkbox'].includes(input.type) || input.checked))?.value ?? null; }
    },
    XMLHttpRequest: class {
      constructor() { this.upload = {}; }
      open(method) { assert.equal(method, "POST"); }
      setRequestHeader() {}
      send(body) {
        const payload = JSON.parse(body);
        sent.push(payload);
        const result = respond(payload, sent.length);
        this.status = result.status;
        this.responseText = result.text;
        this.onload();
      }
    },
  });
  vm.runInContext(source.reservation, env.context);
  await new Promise(setImmediate);
  function select(name, value) {
    for (const input of controls.filter((control) => control.name === name)) input.checked = input.value === value;
    return controls.find((input) => input.name === name && input.checked);
  }
  function completeRequiredFields() {
    textFields.area.value ||= "공릉역";
    textFields.location.value = "서울 노원구 공릉동";
    textFields.phone.value = "010-0000-0000";
    if (!matching('[name="areaType"]:checked').length) select("areaType", "지하철역");
    select("rooms", "2개"); select("aircon", "있음"); select("tenure", "전세·월세");
    consent.checked = true;
  }
  return { form, nodes, controls, textFields, consent, sent, select, completeRequiredFields, retry: rootNodes.get("[data-retry-connection]") };
}

test("a failed connection can be retried without sending or clearing room details", async () => {
  let online = false;
  const page = await reservation(environment(), {}, async () => online
    ? { ok: true, json: async () => ({ ready: true }) }
    : { ok: false, status: 404 });
  assert.equal(page.nodes.get(".setup-notice").hidden, false);
  assert.equal(page.nodes.get(".submit").disabled, true);
  page.completeRequiredFields();
  online = true;
  await page.retry.emit("click");
  assert.equal(page.nodes.get(".setup-notice").hidden, true);
  assert.equal(page.nodes.get(".submit").disabled, false);
  assert.equal(page.textFields.area.value, "공릉역");
  assert.equal(page.consent.checked, true);
  assert.equal(page.sent.length, 0);
});

test("calculator input carries into the reservation without inventing other answers", async () => {
  const env = environment();
  const firstPage = calculator(env);
  firstPage.area.value = "  서울대입구역  ";
  firstPage.area.emit("input");
  const apartment = firstPage.types.find((input) => input.value === "apartment");
  apartment.checked = true;
  apartment.emit("change");
  firstPage.cta.emit("click");
  const secondPage = await reservation(environment(env.store));
  assert.equal(secondPage.textFields.area.value, "서울대입구역");
  assert.equal(secondPage.controls.find((input) => input.name === "areaType" && input.checked)?.value, "지하철역");
  assert.equal(secondPage.controls.find((input) => input.name === "homeType" && input.checked)?.value, "아파트");
  assert.equal(secondPage.textFields.location.value, "");
  assert.equal(secondPage.textFields.phone.value, "");
  assert.equal(secondPage.consent.checked, false);
  assert.equal(secondPage.controls.some((input) => ["rooms", "aircon", "tenure"].includes(input.name) && input.checked), false);
});

test("only clear facility names infer a type and unrelated fields never enter the draft", () => {
  const { prefill, store } = environment();
  prefill.save({ area: "서울과학기술대학교", homeType: "house", phone: "01000000000", consent: true, tenure: "자가", rooms: "3개 이상" });
  assert.deepEqual(plain(prefill.read()), { area: "서울과학기술대학교", areaType: "대학교", homeType: "단독 주택" });
  const saved = JSON.parse([...store.values.values()][0]);
  for (const name of ["phone", "consent", "tenure", "rooms"]) assert.equal(Object.hasOwn(saved, name), false);
  prefill.save({ area: "공릉동", homeType: "two-room" });
  assert.deepEqual(plain(prefill.read()), { area: "공릉동", areaType: "", homeType: "투룸 +" });
  prefill.save({ area: "공릉동", areaType: "대학교", homeType: "constructor" });
  assert.deepEqual(plain(prefill.read()), { area: "공릉동", areaType: "대학교", homeType: "" });
});

test("expired or malformed drafts are removed and unavailable storage never blocks the form", () => {
  const env = environment();
  env.prefill.save({ area: "공릉역", homeType: "studio" });
  env.advance(30 * 60 * 1000 + 1);
  assert.equal(env.prefill.read(), null);
  assert.equal(env.store.values.size, 0);
  env.prefill.save({ area: "공릉역" });
  const key = [...env.store.values.keys()][0];
  env.store.values.set(key, "{broken");
  assert.equal(env.prefill.read(), null);
  assert.equal(env.store.values.size, 0);
  env.prefill.save({ area: "공릉역" });
  env.prefill.save({ area: "  ", homeType: "unknown" });
  assert.equal(env.store.values.size, 0);
  const blocked = environment({ getItem() { throw new Error("blocked"); }, setItem() { throw new Error("blocked"); }, removeItem() { throw new Error("blocked"); } });
  assert.doesNotThrow(() => blocked.prefill.save({ area: "공릉역" }));
  assert.equal(blocked.prefill.read(), null);
});

test("changing facility type keeps the typed name, and confirmed submission preserves home type then clears the draft", async () => {
  const env = environment();
  env.prefill.save({ area: "공릉역", homeType: "apartment" });
  const page = await reservation(env);
  const university = page.select("areaType", "대학교");
  page.form.emit("input", { target: university });
  assert.equal(page.textFields.area.value, "공릉역");
  page.textFields.area.value = "서울과학기술대학교";
  const house = page.select("homeType", "단독 주택");
  page.form.emit("input", { target: house });
  page.completeRequiredFields();
  await page.form.emit("submit");
  assert.equal(page.sent.length, 1);
  assert.equal(page.sent[0].inquiry.homeType, "단독 주택");
  assert.equal(page.sent[0].inquiry.areaType, "대학교");
  assert.equal(page.sent[0].inquiry.area, "서울과학기술대학교");
  assert.equal(page.sent[0].inquiry.rooms, "2개");
  assert.equal(page.sent[0].inquiry.tenure, "전세·월세");
  assert.deepEqual(page.sent[0].photos, []);
  assert.equal(env.prefill.read(), null);
});

test("a direct application without a home type retains the old payload shape", async () => {
  const env = environment();
  const page = await reservation(env);
  page.completeRequiredFields();
  await page.form.emit("submit");
  assert.equal(page.sent.length, 1);
  assert.equal(Object.hasOwn(page.sent[0].inquiry, "homeType"), false);
});

test("prefill does not replace answers already restored by the browser", async () => {
  const env = environment();
  env.prefill.save({ area: "공릉역", homeType: "apartment" });
  const page = await reservation(env, { area: "서울과학기술대학교", areaType: "대학교", homeType: "단독 주택" });
  assert.equal(page.textFields.area.value, "서울과학기술대학교");
  assert.equal(page.controls.find((input) => input.name === "areaType" && input.checked)?.value, "대학교");
  assert.equal(page.controls.find((input) => input.name === "homeType" && input.checked)?.value, "단독 주택");
});

test("the calculator submits a named facility on Enter or its arrow, but waits for Korean composition and invalid text", () => {
  const env = environment();
  const page = calculator(env);
  page.area.value = "4·19민주묘지역";
  page.area.emit("keydown", { key: "Enter", isComposing: true });
  assert.equal(page.cta.clicks, 0);
  page.area.emit("keydown", { key: "Enter" });
  assert.equal(page.cta.clicks, 1);
  assert.equal(env.prefill.read().area, "4·19민주묘지역");
  page.area.value = "1102";
  page.next.emit("click");
  assert.equal(page.cta.clicks, 1);
  assert.equal(page.message.hidden, false);
  page.area.value = "KTX광명역";
  page.next.emit("click");
  assert.equal(page.cta.clicks, 2);
  assert.equal(env.prefill.read().area, "KTX광명역");
});

test("facility type follows the same name across pages without attaching to an unrelated restored station", async () => {
  const env = environment();
  env.prefill.save({ area: "서울과기대", areaType: "대학교" });
  calculator(env).cta.click();
  assert.equal(env.prefill.read().areaType, "대학교");
  const page = await reservation(environment(env.store), { area: "서울대입구역" });
  assert.equal(page.controls.some(input => input.name === "areaType" && input.checked), false);
});

test("diagnosis excludes numeric-only places and private details while preserving numbered neighborhoods and station exits", async () => {
  const env = environment();
  for (const name of ["   ", "742", "010-0000-0000", "공릉역 test@example.org", "공릉동 100-2", "시험길 7, 201호"]) {
    env.prefill.save({area:name, homeType:"apartment"});
    assert.equal(env.prefill.read().area, "");
    assert.ok(!JSON.stringify([...env.store.values.values()]).includes(name));
  }
  const page = await reservation(env);
  page.completeRequiredFields();
  for (const [field, value] of [["area","124"],["location","   "],["location","시험로 73"],["phone","010a0000b0000"]]) {
    const input = page.textFields[field], previous = input.value;
    input.value = value; await page.form.emit("submit"); input.value = previous;
    assert.equal(page.sent.length, 0);
    assert.equal(page.nodes.get(".error").hidden, false);
  }
  page.textFields.area.value = "4·19민주묘지역 1번 출구";
  page.textFields.location.value = "서울 상계3·4동";
  page.textFields.phone.value = "+８２ (０)１０-００００-００００";
  await page.form.emit("submit");
  assert.equal(page.sent[0].inquiry.phone, "01000000000");
  assert.equal(page.sent[0].inquiry.location, "서울 상계3·4동");
  assert.equal(page.sent[0].inquiry.area, "4·19민주묘지역 1번 출구");
});

test("ambiguous success responses freeze the original request until its own receipt arrives", async () => {
  for (const text of ["", JSON.stringify({ok:true, requestId:"a-different-receipt"})]) {
    const page = await reservation(environment(), {}, undefined, (payload, attempt) => ({
      status:200, text:attempt === 1 ? text : JSON.stringify({ok:true, requestId:payload.requestId}),
    }));
    page.completeRequiredFields();
    await page.form.emit("submit");
    assert.equal(page.form.hidden, false);
    assert.equal(page.textFields.phone.disabled, true);
    assert.equal(page.nodes.get(".submit").disabled, false);
    assert.equal(page.nodes.get(".submit").textContent, "접수 결과 다시 확인");
    await page.form.emit("submit");
    assert.deepEqual(page.sent[1], page.sent[0]);
    assert.equal(page.form.hidden, true);
  }
});
