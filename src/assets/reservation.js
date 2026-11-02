(() => {
  "use strict";
  const root = document.querySelector(".reservation-app");
  if (!root) return;
  const form = root.querySelector(".inquiry-form");
  const submit = form.querySelector(".submit");
  const note = form.querySelector(".submit-note");
  const error = form.querySelector(".error");
  const setup = form.querySelector(".setup-notice");
  const success = root.querySelector(".success");
  const heading = root.querySelector("#diagnosis-title");
  const description = root.querySelector("#diagnosis-description");
  const connectionRetry = root.querySelector("[data-retry-connection]");
  let ready = false;
  let busy = false;
  let uncertain = false;
  let requestId = "";
  let pendingBody = "";
  let started = false;
  let submissionStart = 0;
  const endpoint = "https://hanjibung-room-api.vercel.app/api/inquiries";
  const analyticsId = document.querySelector("script[data-analytics-id]")?.dataset.analyticsId;
  const event = (name, params = {}) => {
    if (typeof window.gtag === "function" && /^G-[A-Z0-9]{6,20}$/.test(analyticsId || "")) {
      window.gtag("event", name, { ...params, send_to: analyticsId });
    }
  };
  const setError = (message) => {
    error.textContent = message;
    error.hidden = !message;
  };
  const lock = (locked) => {
    busy = locked;
    form.querySelectorAll("input, .privacy-toggle").forEach((control) => { control.disabled = locked || uncertain; });
    form.classList.toggle("is-uncertain", uncertain);
    submit.disabled = locked || !ready;
    form.setAttribute("aria-busy", String(locked));
  };
  async function checkConnection() {
    setup.hidden = true;
    if (connectionRetry) connectionRetry.disabled = true;
    try {
      const response = await fetch(endpoint, { cache: "no-store", signal: AbortSignal.timeout(8000) });
      const data = await response.json();
      ready = response.ok && data.ready === true;
    } catch { ready = false; }
    submit.disabled = busy || !ready;
    if (!busy) submit.textContent = ready ? "진단 신청하기 →" : "신청 접수 준비 중";
    setup.hidden = ready;
    if (connectionRetry) connectionRetry.disabled = false;
  }
  connectionRetry?.addEventListener("click", checkConnection);
  event("inquiry_open");
  checkConnection();
  form.querySelector(".privacy-toggle").addEventListener("click", (e) => {
    const panel = form.querySelector(".privacy");
    panel.hidden = !panel.hidden;
    e.currentTarget.setAttribute("aria-expanded", String(!panel.hidden));
  });
  form.addEventListener("input", (e) => {
    if (uncertain) return;
    if (!started) { started = true; event("inquiry_start"); }
    requestId = ""; pendingBody = "";
    if (e.target.name === "areaType") {
      form.querySelector("#area").placeholder = `집 주변 ${e.target.value} 이름을 입력해 주세요`;
      form.querySelector("#area").value = "";
    }
  });
  function send(body, id) {
    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", endpoint); xhr.setRequestHeader("Content-Type", "application/json"); xhr.timeout = 300000;
      xhr.upload.onprogress = (e) => { note.textContent = e.lengthComputable ? `${Math.min(100, Math.round(e.loaded / e.total * 100))}% 전송` : "신청 정보를 보내고 있어요."; };
      xhr.upload.onload = () => { note.textContent = "접수 결과를 확인하고 있어요."; };
      xhr.onerror = xhr.ontimeout = () => resolve({ ok: false, uncertain: true, message: "접수 결과를 확인하지 못했어요. 다시 확인해 주세요." });
      xhr.onload = () => {
        let result; try { result = JSON.parse(xhr.responseText); } catch { result = null; }
        if (xhr.status >= 200 && xhr.status < 300 && result?.ok && result.requestId === id) resolve({ ok: true, requestId: result.requestId });
        else resolve({ ok: false, uncertain: result?.uncertain === true || xhr.status >= 500, message: result?.message || "접수 결과를 확인하지 못했어요. 다시 확인해 주세요." });
      };
      xhr.send(body);
    });
  }
  form.addEventListener("submit", async (e) => {
    e.preventDefault(); if (busy) return; setError("");
    if (!ready) { setError("신청 접수 연결을 확인한 후 다시 시도해 주세요."); return; }
    if (!uncertain) {
      if (!form.reportValidity()) return;
      const data = new FormData(form);
      const phone = String(data.get("phone") || "").replace(/\D/g, "");
      if (!/^01[016789]\d{7,8}$/.test(phone)) { setError("연락받을 휴대폰 번호를 확인해 주세요."); return; }
      if (!data.get("areaType")) { setError("지역 기준을 선택해 주세요."); return; }
      requestId ||= crypto.randomUUID(); submissionStart ||= performance.now();
      pendingBody = JSON.stringify({ requestId, inquiry: { areaType: data.get("areaType"), area: data.get("area"), location: data.get("location"), rooms: data.get("rooms"), aircon: data.get("aircon"), tenure: data.get("tenure"), phone, consent: data.get("consent") === "on", consentVersion: "2026-09-20" }, photos: [] });
    }
    const body = pendingBody;
    lock(true); event("inquiry_submit", { photo_count: 0 });
    submit.textContent = "신청 정보를 보내고 있어요"; note.textContent = "화면을 닫지 말고 잠시 기다려 주세요.";
    const result = await send(body, requestId);
    if (result.ok) {
      uncertain = false; lock(false);
      event("inquiry_complete", { photo_count: 0, value: Math.min(3600, Math.round((performance.now() - submissionStart) / 1000)) });
      // Only this branch has a successful response with the exact request ID.
      // Ad measurement must not interrupt the saved submission's success UI.
      try {
        window.hanjibungTrackDiagnosisAdsConversion?.(result.requestId);
      } catch { /* The inquiry has already been accepted. */ }
      form.hidden = true; success.hidden = false; heading.textContent = "진단 신청이 접수되었어요";
      description.textContent = "보내주신 방 정보를 확인한 후 남겨주신 연락처로 안내해 드릴게요.";
      heading.setAttribute("tabindex", "-1"); heading.focus();
      return;
    }
    uncertain = result.uncertain; lock(false);
    submit.textContent = uncertain ? "접수 결과 다시 확인" : "진단 신청하기 →";
    note.textContent = uncertain ? "입력한 내용을 그대로 보관하고 있어요." : "매니저가 확인 후 안내하는 진단 서비스입니다.";
    event("inquiry_error", { error_stage: "submission" }); setError(result.message);
  });
})();
