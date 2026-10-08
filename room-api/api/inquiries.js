import { createHmac } from "node:crypto";

const MAX_BODY = 4_000_000;
const allowedOrigins = new Set(["https://hanjibung.kr", "https://www.hanjibung.kr"]);
const scriptUrl = process.env.GOOGLE_SCRIPT_URL;
const secret = process.env.GOOGLE_SCRIPT_SECRET;
const ready = () => process.env.COLLECTION_ENABLED === "true"
  && /^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(scriptUrl || "")
  && (secret?.length || 0) >= 32;
const reply = (res, status, body) => res.status(status).setHeader("Cache-Control", "no-store").json(body);
const fail = (status, message, uncertain = false) => ({ ok: false, status, message, uncertain });
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const transient = new Set(["BUSY", "STORAGE_ERROR", "UPSTREAM_NETWORK", "UPSTREAM_RESPONSE", "UPSTREAM_BUSY"]);

async function deliver(submission) {
  let code = "UPSTREAM_NETWORK";
  let uncertain = false;
  for (let attempt = 0; attempt < 2; attempt++) {
    const payload = JSON.stringify({ ...submission, sentAt: Date.now() });
    const signature = createHmac("sha256", secret).update(payload).digest("hex");
    try {
      const response = await fetch(scriptUrl, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload, signature }), redirect: "follow",
        signal: AbortSignal.timeout(25000),
      });
      if (!response.ok) code = response.status === 429 || response.status >= 500 ? "UPSTREAM_BUSY" : "UPSTREAM_CONFIGURATION";
      else {
        const result = await response.json().catch(() => null);
        if (result?.ok === true && result.requestId === submission.requestId) {
          console.info(JSON.stringify({ event: "inquiry_saved", requestId: submission.requestId, photoCount: submission.photos.length }));
          return { ok: true, requestId: submission.requestId };
        }
        code = typeof result?.code === "string" ? result.code : "UPSTREAM_RESPONSE";
      }
    } catch { code = "UPSTREAM_NETWORK"; }
    console.warn(JSON.stringify({ event: "inquiry_delivery_failed", requestId: submission.requestId, code, attempt: attempt + 1 }));
    uncertain ||= transient.has(code);
    if (!transient.has(code) || attempt === 1) break;
    await pause(600);
  }
  if (code === "RATE_LIMIT") return fail(429, "같은 연락처로 신청이 여러 번 접수되었어요. 잠시 후 다시 시도해 주세요.", uncertain);
  if (code.startsWith("BAD_") || code === "PHOTO_TOO_LARGE") return fail(400, "사진과 신청 내용을 확인한 뒤 다시 신청해 주세요.", uncertain);
  if (code === "IDEMPOTENCY_CONFLICT" || code === "STATE_CONFLICT") return fail(409, "기존 신청 내용과 달라 접수 결과를 확인하지 못했어요. 한지붕에 문의해 주세요.", true);
  if (transient.has(code)) return fail(503, "접수 결과 확인이 늦어지고 있어요. 같은 신청으로 다시 확인해 주세요.", true);
  return fail(503, "접수 연결을 확인하고 있어요. 입력 내용은 유지되니 잠시 후 다시 시도해 주세요.", uncertain);
}

export default async function handler(req, res) {
  const origin = req.headers.origin;
  if (allowedOrigins.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  }
  if (req.method === "OPTIONS") return allowedOrigins.has(origin) ? res.status(204).end() : reply(res, 403, { ok: false });
  if (req.method === "GET") return reply(res, 200, { ready: ready() });
  if (req.method !== "POST") return reply(res, 405, { ok: false });
  if (!ready()) return reply(res, 503, { ok: false, message: "아직 신청 접수를 준비하고 있어요." });
  if (!allowedOrigins.has(origin)) return reply(res, 403, { ok: false, message: "한지붕 방 진단 화면에서 다시 신청해 주세요." });
  if (!req.headers["content-type"]?.startsWith("application/json")) return reply(res, 415, { ok: false });
  if (Number(req.headers["content-length"]) > MAX_BODY) return reply(res, 413, { ok: false, message: "사진 용량이 너무 커요. 사진 수를 줄여 주세요." });
  try {
    const data = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    if (!data || JSON.stringify(data).length > MAX_BODY) return reply(res, 413, { ok: false, message: "사진 용량이 너무 커요." });
    const i = data.inquiry;
    const text = (value, max) => typeof value === "string" && value.trim().length > 0 && value.length <= max;
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(data.requestId)
      || !i || !["대학교", "지하철역"].includes(i.areaType) || !text(i.area, 100) || !text(i.location, 150)
      || !["1개", "2개", "3개 이상"].includes(i.rooms) || !["있음", "없음"].includes(i.aircon)
      || !["자가", "전세·월세"].includes(i.tenure) || !/^01[016789]\d{7,8}$/.test(i.phone)
      || i.consent !== true || i.consentVersion !== "2026-09-20"
      || !Array.isArray(data.photos) || data.photos.length < 1 || data.photos.length > 5) return reply(res, 400, fail(400, "신청 내용을 다시 확인해 주세요."));
    for (const photo of data.photos) {
      if (!photo || !text(photo.name, 180) || photo.mime !== "image/jpeg" || typeof photo.base64 !== "string"
        || photo.base64.length > 700000 || photo.base64.length % 4 || !/^[A-Za-z0-9+/]+={0,2}$/.test(photo.base64)) return reply(res, 400, fail(400, "사진 파일을 확인해 주세요."));
      const bytes = Buffer.from(photo.base64, "base64");
      if (bytes.length < 4 || bytes[0] !== 255 || bytes[1] !== 216 || bytes[2] !== 255 || bytes.at(-2) !== 255 || bytes.at(-1) !== 217) return reply(res, 400, fail(400, "올바른 JPG 사진을 첨부해 주세요."));
    }
    const submission = {
      requestId: data.requestId.toLowerCase(),
      inquiry: { areaType: i.areaType, area: i.area.trim(), location: i.location.trim(), rooms: i.rooms, aircon: i.aircon, tenure: i.tenure, phone: i.phone, consent: true, consentVersion: i.consentVersion },
      photos: data.photos.map((photo) => ({ name: photo.name, mime: "image/jpeg", base64: photo.base64 })),
    };
    const result = await deliver(submission);
    return reply(res, result.ok ? 200 : result.status, result);
  } catch (e) {
    console.error(JSON.stringify({ event: "inquiry_processing_failed", name: e?.name || "Error" }));
    return reply(res, 400, fail(400, "신청 내용을 읽지 못했어요. 입력 내용과 사진을 확인해 주세요."));
  }
}
