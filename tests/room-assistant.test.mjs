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
