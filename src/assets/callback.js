import { validateInquiryInput, send, recordHostConsultationConversion } from "./inquiry.js";

// The existing consultation contract accepts this topic, consent version and
// receipt format. Photo diagnosis and its separate conversion remain unchanged.
export function callbackPayload(values, requestId, consentVersion) {
  return {
    action: "submit", kind: "consultation", requestId,
    name: String(values.name || "").trim(),
    contactMethod: "phone", contact: String(values.contact || "").trim(),
    topic: "빈방·유휴공간 활용", message: String(values.message || "").trim(),
    consent: values.consent === true, consentVersion,
    website: String(values.website || ""),
  };
}

export async function submitCallback(endpoint, payload) {
  const errors = validateInquiryInput(payload, "consultation");
  if (Object.keys(errors).length) throw new Error(Object.values(errors)[0]);
  const receipt = await send(endpoint, payload);
  await recordHostConsultationConversion(receipt, payload);
  return receipt;
}

const form = typeof document === "undefined" ? null : document.querySelector("[data-callback-form]");
if (form) {
  const fieldset = form.querySelector("fieldset");
  const button = form.querySelector("[type=submit]");
  const status = form.querySelector("[data-callback-status]");
  const dialog = document.querySelector("[data-callback-dialog]");
  const trigger = document.querySelector("[data-open-callback]");
  const success = dialog?.querySelector("[data-callback-success]");
  if (form.dataset.endpoint) fieldset.disabled = false;
  let requestId = crypto.randomUUID(), busy = false, submitted = false;
  trigger?.addEventListener("click", () => {
    dialog.showModal();
    dialog.querySelector("#callback-dialog-title").focus();
  });
  dialog?.querySelectorAll("[data-close-callback]").forEach((close) => {
    close.addEventListener("click", () => { if (!busy) dialog.close(); });
  });
  dialog?.addEventListener("click", (event) => { if (event.target === dialog && !busy) dialog.close(); });
  dialog?.addEventListener("cancel", (event) => { if (busy) event.preventDefault(); });
  dialog?.addEventListener("close", () => trigger?.focus());
  form.addEventListener("input", () => { if (!busy) requestId = crypto.randomUUID(); });
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (busy || submitted || !form.dataset.endpoint) return;
    const values = { ...Object.fromEntries(new FormData(form)), consent: form.elements.consent.checked };
    const payload = callbackPayload(values, requestId, form.dataset.consentVersion);
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
    busy = true; fieldset.disabled = true; form.setAttribute("aria-busy", "true");
    button.textContent = "접수 확인 중…";
    status.textContent = "문의 내용을 저장하고 있습니다. 잠시만 기다려 주세요.";
    try {
      const receipt = await submitCallback(form.dataset.endpoint, payload);
      submitted = true; form.reset();
      button.textContent = "상담 신청 접수 완료";
      status.textContent = `상담 신청이 접수되었습니다. 남겨주신 번호로 안내드립니다. 접수번호: ${receipt.requestId}`;
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
