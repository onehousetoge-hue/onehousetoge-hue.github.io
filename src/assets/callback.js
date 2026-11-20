import { validateInquiryInput, send, recordHostConsultationConversion } from "./inquiry.js";

export function callbackPayload(values, requestId, consentVersion, registration = false) {
  return {
    action: "submit", kind: "consultation", requestId,
    name: String(values.name || "").trim(),
    contactMethod: "phone", contact: String(values.contact || "").trim(),
    topic: registration ? "방 등록" : "빈방·유휴공간 활용",
    message: registration
      ? `동네: ${values.location.trim()}\n남는 방: ${values.rooms}\n입주 가능 시기: ${values.availability}`
      : String(values.message || "").trim(),
    consent: values.consent === true, consentVersion,
    website: String(values.website || ""),
  };
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

const form = typeof document === "undefined" ? null : document.querySelector("[data-callback-form]");
if (form) {
  const fieldset = form.querySelector("fieldset");
  const button = form.querySelector("[type=submit]");
  const status = form.querySelector("[data-callback-status]");
  const success = document.querySelector("[data-callback-success]");
  const registration = form.dataset.intake === "registration";
  if (form.dataset.endpoint) fieldset.disabled = false;
  let requestId = crypto.randomUUID(), busy = false, submitted = false;
  let attribution;
  form.addEventListener("input", () => { if (!busy) { requestId = crypto.randomUUID(); attribution = undefined; } });
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (busy || submitted || !form.dataset.endpoint) return;
    const values = { ...Object.fromEntries(new FormData(form)), consent: form.elements.consent.checked };
    if (registration && !values.location.trim()) {
      status.textContent = "방이 있는 동네를 입력해 주세요.";
      form.elements.location.focus();
      return;
    }
    const payload = callbackPayload(values, requestId, form.dataset.consentVersion, registration);
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
    attribution ||= window.hanjibungLeadVisit?.snapshot();
    if (attribution) payload.attribution = attribution;
    busy = true; fieldset.disabled = true; form.setAttribute("aria-busy", "true");
    button.textContent = "접수 확인 중…";
    status.textContent = "문의 내용을 저장하고 있습니다. 잠시만 기다려 주세요.";
    try {
      const receipt = await submitCallback(form.dataset.endpoint, payload);
      submitted = true; form.reset();
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
