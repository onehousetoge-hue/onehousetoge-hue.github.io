import { validateInquiryInput, send, recordHostConsultationConversion } from "./inquiry.js";

function contactNumber(value) {
  const raw = String(value || "").trim();
  const normalized = raw.normalize("NFKC").replace(/^\+82[\s.()-]*(?:0[\s.()-]*)?/, "0");
  const digits = normalized.replace(/[\s.()-]/g, "");
  // Keep familiar domestic formatting when already accepted by the intake sheet.
  return /^0\d{8,10}$/.test(digits) && !/^0\d{8,10}$/.test(raw.replace(/[ -]/g, "")) ? digits : raw;
}

export function callbackPayload(values, requestId, consentVersion, registration = false) {
  let message = String(values.message || "").trim();
  if (registration) {
    const lines = [`동네: ${values.location.trim()}`, `남는 방: ${values.rooms}`, `입주 가능 시기: ${values.availability}`];
    const optional = [["rent","희망 월세"],["deposit","보증금"],["fee","관리비"],["homeType","주택 유형"],["area","방 면적"],["floor","층수"]];
    for (const [key, label] of optional) {
      if (values[key]) lines.push(label + ": " + values[key]);
    }
    if (values.address?.trim()) {
      lines.push("방문할 상세주소: " + values.address.trim());
      if (values.consent === true) lines.push("주소·연락처 이용 동의: 방 등록 확인 및 방문 일정 조율");
    }
    message = lines.join("\n");
  }
  return {
    action: "submit", kind: "consultation", requestId,
    name: String(values.name || "").trim(),
    contactMethod: "phone", contact: contactNumber(values.contact),
    topic: registration ? "방 등록" : "빈방·유휴공간 활용",
    message,
    consent: values.consent === true, consentVersion,
    website: String(values.website || ""),
  };
}

// Keep the unconfirmed payload only in memory. Compare the actual submission so
// visiting an earlier step or editing and undoing a field cannot duplicate a lead.
export function callbackAttempt(payload, prior) {
  if (prior && prior.roomPhoto === payload.roomPhoto &&
      Object.entries(payload).every(([key, value]) => key === "requestId" || value === prior[key])) return prior;
  const attempt = { ...payload, requestId: crypto.randomUUID() };
  const attribution = globalThis.window?.hanjibungLeadVisit?.snapshot();
  if (attribution) attempt.attribution = attribution;
  return attempt;
}

export async function submitCallback(endpoint, payload) {
  const errors = validateInquiryInput(payload, "consultation");
  if (Object.keys(errors).length) throw new Error(Object.values(errors)[0]);
  const receipt = await send(endpoint, payload);
  try {
    const target = document.querySelector("script[data-analytics-id]")?.dataset.analyticsId;
    const registration = payload.topic === "방 등록";
    if (/^G-[A-Z0-9]{6,20}$/.test(target || "")) window.gtag?.("event", registration ? "room_registration_complete" : "callback_complete", { send_to: target });
    window.hanjibungTrackHeadlineCompletion?.(payload.attribution, registration ? "registration" : "callback");
  } catch { /* A verified receipt remains valid when measurement is unavailable. */ }
  await recordHostConsultationConversion(receipt, payload);
  return receipt;
}

const form = typeof document === "undefined" ? null : document.querySelector("[data-callback-form]:not([data-room-registration])");
if (form) {
  const fieldset = form.querySelector("fieldset");
  const button = form.querySelector("[type=submit]");
  const status = form.querySelector("[data-callback-status]");
  const success = document.querySelector("[data-callback-success]");
  if (form.dataset.endpoint) fieldset.disabled = false;
  let attempt, busy = false, submitted = false;
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (busy || submitted || !form.dataset.endpoint) return;
    const values = { ...Object.fromEntries(new FormData(form)), consent: form.elements.consent.checked };
    const payload = callbackPayload(values, undefined, form.dataset.consentVersion);
    const errors = validateInquiryInput(payload, "consultation");
    form.querySelectorAll("[aria-invalid]").forEach((element) => element.removeAttribute("aria-invalid"));
    if (Object.keys(errors).length) {
      const name = Object.keys(errors)[0];
      status.textContent = Object.values(errors)[0];
      const invalid = form.elements[name];
      invalid?.setAttribute("aria-invalid", "true");
      invalid?.focus();
      return;
    }
    attempt = callbackAttempt(payload, attempt);
    busy = true; fieldset.disabled = true; form.setAttribute("aria-busy", "true");
    button.textContent = "접수 확인 중…";
    status.textContent = "문의 내용을 저장하고 있습니다. 잠시만 기다려 주세요.";
    try {
      const receipt = await submitCallback(form.dataset.endpoint, attempt);
      submitted = true; attempt = undefined; form.reset();
      button.textContent = "접수 완료";
      status.textContent = `신청이 접수되었습니다. 남겨주신 번호로 안내드립니다. 접수번호: ${receipt.requestId}`;
      if (success) {
        form.hidden = true;
        success.hidden = false;
        success.querySelector("[data-callback-receipt]").textContent = `접수번호 ${receipt.requestId}`;
        success.querySelector("h3").focus();
      } else status.focus();
    } catch (error) {
      button.textContent = "같은 내용으로 다시 보내기";
      status.textContent = error.message === "SENSITIVE"
        ? "주민등록번호처럼 보이는 내용은 보내실 수 없습니다. 민감정보를 지운 뒤 다시 보내 주세요."
        : "접수 결과를 확인하지 못했습니다. 입력한 내용은 남아 있습니다. 이미 접수됐을 수 있으니 내용을 바꾸지 말고 다시 보내기를 눌러 확인하거나 010-4587-9428로 문의해 주세요.";
      status.focus();
    } finally {
      busy = false; fieldset.disabled = submitted; form.removeAttribute("aria-busy");
    }
  });
}
