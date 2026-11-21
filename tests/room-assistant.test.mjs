import test from "node:test";
import assert from "node:assert/strict";
import worker, { DailyBudget, model } from "../room-assistant/worker.mjs";
import { extractRoom } from "../src/assets/room-description.js";

const origin = "https://hanjibung.kr";
function post(message, extra = {}, site = origin) {
  return new Request("https://example.test/interpret", {
    method: "POST", headers: { Origin: site, "Content-Type": "application/json" },
    body: JSON.stringify({ message, focus: "rooms", ...extra }),
  });
}
function bindings(run) {
  return {
    AI: { run },
    ROOM_RATE: { limit: async () => ({ success: true }) },
    ROOM_BUDGET: { idFromName: name => name, get: () => ({ fetch: async () => new Response(null, { status: 204 }) }) },
  };
}
test("an AI turn uses the pinned model, transmits only the current turn and accepts quoted room facts", async () => {
  const message = "딸들이 쓰던 침실 둘을 내놓을게요. 설 연휴가 끝나면 들어오셔도 돼요.";
  assert.equal(extractRoom(message, "rooms").rooms, undefined);
  const env = bindings(async (id, data) => {
    assert.equal(id, model);
    assert.deepEqual(JSON.parse(data.messages[1].content), { message, focus: "rooms" });
    return { choices: [{ message: { content: JSON.stringify({ updates: [
      { field: "rooms", value: "2개", quote: "침실 둘" },
      { field: "availability", value: "설 연휴 이후", quote: "설 연휴가 끝나면" },
      { field: "rent", value: "45만 원", quote: "침실 둘" },
      { field: "name", value: "방 주인", quote: "침실 둘" },
      { field: "floor", value: "3층", quote: "3층" },
    ] }) } }] };
  });
  const response = await worker.fetch(post(message), env);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("Access-Control-Allow-Origin"), origin);
  assert.equal(response.headers.get("Cache-Control"), "no-store");
  assert.deepEqual(await response.json(), { source: "llm", model, fields: { rooms: "2개", availability: "설 연휴 이후" }, reply: "" });
});
test("private inputs, unexpected form fields, foreign origins and oversized turns never reach inference", async () => {
  let calls = 0;
  const env = bindings(() => { calls++; });
  for (const [req, status] of [
    [post("방 하나, 시험길 17"), 422], [post("０１０－００００－００００"), 422],
    [post("제 이름은 방문자예요"), 422], [post("연락은 test@example.org로"), 422],
    [post("두 개", { contact: "test" }), 400], [post("두 개", { focus: "address" }), 400],
    [post("가".repeat(2000)), 400], [post("두 개", {}, "https://example.org"), 403],
  ]) assert.equal((await worker.fetch(req, env)).status, status);
  assert.equal(calls, 0);
});
test("model uncertainty, quota exhaustion and transport failures remain distinct", async () => {
  const msg = "월세 50, 입주는 2월 30일, 다음 달에는 입주가 안 돼요. 침실 둘.";
  const env = bindings(async () => ({ response: { updates: [
    { field: "rent", value: "50만 원", quote: "월세 50" },
    { field: "availability", value: "2월 30일", quote: "2월 30일" },
    { field: "availability", value: "다음 달", quote: "다음 달에는 입주가 안 돼요" },
    { field: "area", value: "2평", quote: "침실 둘" },
    { field: "rooms", value: "8개", quote: "침실 둘" },
  ], reply: "월세의 금액과 단위를 함께 적어 주시겠어요?" } }));
  const result = await (await worker.fetch(post(msg), env)).json();
  assert.deepEqual(result.fields, {});
  assert.match(result.reply, /단위/);
  for (const upstream of [async () => { throw Error("offline"); }, async () => ({ response: "not json" })]) {
    assert.equal((await worker.fetch(post(msg), bindings(upstream))).status, 503);
  }
  env.AI.run = assert.fail;
  env.ROOM_BUDGET.get = () => ({ fetch: async () => new Response(null, { status: 429 }) });
  assert.equal((await worker.fetch(post(msg), env)).status, 429);
});

async function interpret(message, updates, focus = "") {
  const env = bindings(async () => ({ response: { updates } }));
  const response = await worker.fetch(post(message, { focus }), env);
  assert.equal(response.status, 200);
  return (await response.json()).fields;
}

test("a quote about one charge cannot set a different charge, even when the question focused on it", async () => {
  const message = "보증금 300만 원, 월세 30만 원, 관리비 3만 원이에요.";
  const fields = await interpret(message, [
    { field: "rent", value: "300만 원", quote: "보증금 300만 원" },
    { field: "fee", value: "30만 원", quote: "월세 30만 원" },
    { field: "deposit", value: "3만 원", quote: "관리비 3만 원" },
  ], "deposit");
  assert.deepEqual(fields, {});
  const matched = await interpret(message, [
    { field: "rent", value: "30만 원", quote: "월세 30만 원" },
    { field: "deposit", value: "300만 원", quote: "보증금 300만 원" },
    { field: "fee", value: "3만 원", quote: "관리비 3만 원" },
  ]);
  assert.deepEqual(matched, { rent: "30만 원", deposit: "300만 원", fee: "3만 원" });
  const clippedLabel = await interpret("월세 45만 원이에요.", [
    { field: "deposit", value: "45만 원", quote: "45만 원" },
  ], "deposit");
  assert.deepEqual(clippedLabel, {});
});

test("floor, area and housing type stay grounded in the host's words", async () => {
  const message = "아파트 12층이고 방 면적은 18평이에요.";
  const facts = [
    { field: "floor", value: "12층", quote: "12층" },
    { field: "area", value: "18평", quote: "18평" },
    { field: "homeType", value: "아파트", quote: "아파트" },
  ];
  assert.deepEqual(await interpret(message, facts), { floor: "12층", area: "18평", homeType: "아파트" });
  for (const clipped of [false, true]) {
    const fields = await interpret(message, [
      { field: "floor", value: "2층", quote: clipped ? "2층" : "12층" },
      { field: "area", value: "8평", quote: clipped ? "8평" : "18평" },
      { field: "homeType", value: "빌라", quote: "아파트" },
    ]);
    assert.ok(fields.floor === undefined || fields.floor === "12층");
    assert.ok(fields.area === undefined || fields.area === "18평");
    assert.ok(fields.homeType === undefined || fields.homeType === "아파트");
  }
});

test("focused short answers and spoken Korean money keep their original amount and field", async () => {
  const bare = await interpret("45만 원", [{ field: "rent", value: "450만 원", quote: "45만 원" }], "rent");
  assert.equal(bare.rent.replace(/\s/g, ""), "45만원");
  assert.deepEqual(Object.keys(bare), ["rent"]);
  const spoken = await interpret("월세 삼십오만원 정도 생각해요.", [
    { field: "rent", value: "350만 원", quote: "월세 삼십오만원" },
  ]);
  assert.match(spoken.rent.replace(/\s/g, ""), /^(?:삼십오만원|35만원|350000원)$/);
});

test("the daily limit is shared by all visits and starts again on the next UTC date", async () => {
  const values = new Map();
  const tx = { get: key => values.get(key), put: (key, value) => values.set(key, value) };
  const limit = new DailyBudget({ storage: { transaction: fn => fn(tx) } });
  for (let n = 0; n < 120; n++) assert.equal((await limit.fetch()).status, 204);
  assert.equal((await limit.fetch()).status, 429);
  assert.deepEqual(Object.keys(values.get("usage")).sort(), ["count", "day"]);
  values.set("usage", { day: "2020-01-01", count: 120 });
  assert.equal((await limit.fetch()).status, 204);
});
