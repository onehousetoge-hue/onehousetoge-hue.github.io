import assert from "node:assert/strict";
import test from "node:test";

process.env.COLLECTION_ENABLED = "true";
process.env.GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/test-script/exec";
process.env.GOOGLE_SCRIPT_SECRET = "test-secret-value-with-at-least-32-characters";
const { default: handler } = await import("../room-api/api/inquiries.js");

function response() {
  return {
    statusCode: 200, headers: {}, body: null,
    status(value) { this.statusCode = value; return this; },
    setHeader(key, value) { this.headers[key] = value; return this; },
    json(value) { this.body = value; return this; },
    end() { return this; },
  };
}
const request = (body, origin = "https://hanjibung.kr") => ({
  method: "POST",
  headers: { origin, host: "hanjibung.kr", "content-type": "application/json" },
  body,
});
const valid = () => ({
  requestId: "3d066cba-3ae1-4a64-8121-906297c23660",
  inquiry: { areaType: "대학교", area: "테스트대학교", location: "서울 마포구", rooms: "1개", aircon: "있음", tenure: "자가", phone: "01012345678", consent: true, consentVersion: "2026-09-20" },
  photos: [{ name: "room.jpg", mime: "image/jpeg", base64: Buffer.from([255, 216, 255, 0, 255, 217]).toString("base64") }],
});

test("room API readiness and origin rejection", async () => {
  const get = response();
  await handler({ method: "GET", headers: {} }, get);
  assert.deepEqual(get.body, { ready: true });
  const foreign = response();
  await handler(request(valid(), "https://example.com"), foreign);
  assert.equal(foreign.statusCode, 403);
  assert.equal(foreign.headers["Access-Control-Allow-Origin"], undefined);
  const preflight = response();
  await handler({ method: "OPTIONS", headers: { origin: "https://hanjibung.kr" } }, preflight);
  assert.equal(preflight.statusCode, 204);
  assert.equal(preflight.headers["Access-Control-Allow-Origin"], "https://hanjibung.kr");
});

test("room API validates personal data and image before delivery", async () => {
  let calls = 0;
  const previous = globalThis.fetch;
  globalThis.fetch = async () => { calls++; throw new Error("unexpected delivery"); };
  try {
    for (const bad of [
      { ...valid(), inquiry: { ...valid().inquiry, consent: false } },
      { ...valid(), inquiry: { ...valid().inquiry, phone: "1234" } },
      { ...valid(), photos: [{ name: "room.jpg", mime: "image/jpeg", base64: Buffer.from("not a jpeg").toString("base64") }] },
    ]) {
      const res = response(); await handler(request(bad), res);
      assert.equal(res.statusCode, 400);
    }
    assert.equal(calls, 0);
  } finally { globalThis.fetch = previous; }
});

test("room API signs a valid submission and returns its matching receipt", async () => {
  const previous = globalThis.fetch;
  let delivered;
  globalThis.fetch = async (url, options) => {
    delivered = { url, ...JSON.parse(options.body) };
    return { ok: true, json: async () => ({ ok: true, requestId: valid().requestId }) };
  };
  try {
    const res = response(); await handler(request(valid()), res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.requestId, valid().requestId);
    assert.equal(delivered.url, process.env.GOOGLE_SCRIPT_URL);
    assert.match(delivered.signature, /^[0-9a-f]{64}$/);
    assert.equal(JSON.parse(delivered.payload).inquiry.phone, "01012345678");
  } finally { globalThis.fetch = previous; }
});
