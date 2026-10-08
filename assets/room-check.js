(() => {
  "use strict";
  const root = document.querySelector(".room-app");
  if (!root) return;
  const dialog = root.querySelector("#room-inquiry");
  const form = dialog.querySelector("form");
  const fileInput = form.querySelector("#photos");
  const submit = form.querySelector(".submit");
  const note = form.querySelector(".submit-note");
  const error = form.querySelector(".error");
  const count = form.querySelector(".photo-count");
  const photoList = form.querySelector(".photo-list");
  const setup = form.querySelector(".setup-notice");
  const success = dialog.querySelector(".success");
  const heading = dialog.querySelector("#dialog-title");
  const description = dialog.querySelector("#dialog-description");
  const nav = root.querySelector(".site-menu");
  const navToggle = root.querySelector(".nav-toggle");
  const photos = [];
  let ready = false;
  let busy = false;
  let uncertain = false;
  let requestId = "";
  let lastTrigger = null;
  let started = false;
  let submissionStart = 0;
  const endpoint = "https://hanjibung-room-api.vercel.app/api/inquiries";
  const event = (name, params = {}) => {
    if (typeof window.gtag === "function") window.gtag("event", name, params);
  };
  const setError = (message) => {
    error.textContent = message;
    error.hidden = !message;
  };
  const lock = (locked) => {
    busy = locked;
    form.querySelectorAll("input, .upload, .privacy-toggle").forEach((control) => { control.disabled = locked; });
    form.classList.toggle("is-uncertain", uncertain);
    submit.disabled = locked || !ready;
    dialog.querySelector(".close").disabled = locked;
  };
  async function checkConnection() {
    setup.hidden = true;
    try {
      const response = await fetch(endpoint, { cache: "no-store", signal: AbortSignal.timeout(8000) });
      const data = await response.json();
      ready = response.ok && data.ready === true;
    } catch { ready = false; }
    submit.disabled = !ready;
    submit.textContent = ready ? "진단 신청하기 →" : "신청 접수 준비 중";
    setup.hidden = ready;
  }
  function setMenu(open, restoreFocus = false) {
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.textContent = open ? "닫기" : "메뉴";
    nav.classList.toggle("is-open", open);
    if (!open) nav.querySelectorAll(".nav-group").forEach((group) => { group.open = false; });
    if (restoreFocus && navToggle.getClientRects().length) navToggle.focus();
  }
  function show(trigger = document.activeElement) {
    lastTrigger = trigger;
    dialog.showModal();
    event("inquiry_open");
    checkConnection();
  }
  function close() {
    if (busy) return;
    dialog.close();
    if (!success.hidden) {
      success.hidden = true; form.hidden = false;
      heading.innerHTML = "우리 집에 맞는 조건을<br>알려드릴게요";
      description.textContent = "방 정보를 남겨주시면 확인 후 연락드립니다.";
      form.reset(); photos.splice(0); renderPhotos();
      setError(""); requestId = ""; uncertain = false; started = false;
    }
  }
  root.querySelectorAll("[data-open-inquiry]").forEach((button) => button.addEventListener("click", () => {
    const trigger = nav.contains(button) && navToggle.getClientRects().length ? navToggle : button;
    setMenu(false);
    show(trigger);
  }));
  dialog.querySelector(".close").addEventListener("click", close);
  success.querySelector("button").addEventListener("click", close);
  dialog.addEventListener("cancel", (e) => { if (busy) e.preventDefault(); });
  dialog.addEventListener("close", () => { lastTrigger?.focus?.(); });
  navToggle.addEventListener("click", () => {
    setMenu(navToggle.getAttribute("aria-expanded") !== "true");
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("is-open")) setMenu(false, true);
  });
  document.addEventListener("click", (e) => {
    if (nav.classList.contains("is-open") && !nav.contains(e.target) && !navToggle.contains(e.target)) setMenu(false);
  });
  window.matchMedia("(min-width: 981px)").addEventListener("change", (e) => {
    if (e.matches) setMenu(false);
  });
  root.querySelectorAll(".nav-group").forEach((group) => group.addEventListener("toggle", () => {
    if (group.open) root.querySelectorAll(".nav-group").forEach((other) => { if (other !== group) other.open = false; });
  }));
  form.querySelector(".privacy-toggle").addEventListener("click", (e) => {
    const panel = form.querySelector(".privacy");
    panel.hidden = !panel.hidden;
    e.currentTarget.setAttribute("aria-expanded", String(!panel.hidden));
  });
  form.addEventListener("input", (e) => {
    if (uncertain) return;
    if (!started) { started = true; event("inquiry_start"); }
    requestId = "";
    if (e.target.name === "areaType") {
      form.querySelector("#area").placeholder = `집 주변 ${e.target.value} 이름을 입력해 주세요`;
      form.querySelector("#area").value = "";
    }
  });
  fileInput.addEventListener("change", () => addPhotos(fileInput.files));
  form.querySelector(".upload").addEventListener("click", () => fileInput.click());
  const upload = form.querySelector(".upload");
  upload.addEventListener("dragover", (e) => e.preventDefault());
  upload.addEventListener("drop", (e) => { e.preventDefault(); addPhotos(e.dataTransfer.files); });
  function renderPhotos() {
    count.textContent = `${photos.length}/5장`;
    photoList.replaceChildren();
    photos.forEach((photo, index) => {
      const item = document.createElement("div"); item.className = "photo-item";
      const image = document.createElement("img"); image.src = photo.preview; image.alt = `첨부한 방 사진 ${index + 1}`;
      const remove = document.createElement("button"); remove.type = "button"; remove.textContent = "×"; remove.setAttribute("aria-label", `사진 ${index + 1} 삭제`);
      remove.addEventListener("click", () => { if (busy || uncertain) return; photos.splice(index, 1); requestId = ""; renderPhotos(); });
      const size = document.createElement("span"); size.textContent = `${Math.ceil(photo.bytes / 1024)} KB`;
      item.append(image, remove, size); photoList.append(item);
    });
    upload.disabled = photos.length >= 5;
  }
  async function compressPhoto(file) {
    if (file.size > 30 * 1024 * 1024) throw new Error(`${file.name}: 사진 한 장은 30MB 이하로 선택해 주세요.`);
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) throw new Error(`${file.name}: JPG, PNG, WEBP 사진을 선택해 주세요.`);
    const image = await createImageBitmap(file).catch(() => { throw new Error("사진을 읽을 수 없어요. JPG 사진으로 다시 선택해 주세요."); });
    try {
      if (image.width * image.height > 65000000) throw new Error("사진 해상도가 너무 높아요. 6,500만 화소 이하 사진을 선택해 주세요.");
      let width = image.width, height = image.height;
      const scale = Math.min(1, 1600 / Math.max(width, height));
      width = Math.max(1, Math.round(width * scale)); height = Math.max(1, Math.round(height * scale));
      let blob;
      for (const dimension of [1, .8, .65]) {
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(width * dimension); canvas.height = Math.round(height * dimension);
        const ctx = canvas.getContext("2d"); if (!ctx) throw new Error("이 브라우저에서는 사진을 준비할 수 없어요.");
        ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        for (const quality of [.78, .62, .46, .32]) {
          blob = await new Promise((resolve, reject) => canvas.toBlob((result) => result ? resolve(result) : reject(new Error("사진을 준비하지 못했어요.")), "image/jpeg", quality));
          if (blob.size <= 500 * 1024) break;
        }
        if (blob.size <= 500 * 1024) break;
      }
      if (!blob || blob.size > 500 * 1024) throw new Error("사진을 충분히 줄이지 못했어요. 더 작은 사진을 선택해 주세요.");
      const preview = await new Promise((resolve, reject) => {
        const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(new Error("사진을 읽지 못했어요.")); reader.readAsDataURL(blob);
      });
      return { id: crypto.randomUUID(), name: file.name.replace(/\.[^.]+$/, "").slice(0, 160) + ".jpg", base64: preview.split(",")[1], preview, bytes: blob.size };
    } finally { image.close(); }
  }
  async function addPhotos(files) {
    if (!files || busy || uncertain) return;
    const selected = Array.from(files);
    if (photos.length + selected.length > 5) { setError("사진은 최대 5장까지 첨부할 수 있어요."); return; }
    lock(true); setError(""); upload.querySelector("strong").textContent = "사진 용량을 줄이고 있어요…";
    try {
      for (const file of selected) photos.push(await compressPhoto(file));
      renderPhotos(); requestId = "";
      event("inquiry_photo_added", { photo_count: photos.length });
    } catch (e) { event("inquiry_error", { error_stage: "photo" }); setError(e.message || "사진을 준비하지 못했어요."); }
    finally { upload.querySelector("strong").textContent = "사진 첨부하기"; fileInput.value = ""; lock(false); }
  }
  function send(body, id) {
    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", endpoint); xhr.setRequestHeader("Content-Type", "application/json"); xhr.timeout = 300000;
      xhr.upload.onprogress = (e) => { note.textContent = e.lengthComputable ? `${Math.min(100, Math.round(e.loaded / e.total * 100))}% 전송` : "사진과 정보를 보내고 있어요."; };
      xhr.upload.onload = () => { note.textContent = "접수 결과를 확인하고 있어요."; };
      xhr.onerror = xhr.ontimeout = () => resolve({ ok: false, uncertain: true, message: "접수 결과를 확인하지 못했어요. 다시 확인해 주세요." });
      xhr.onload = () => {
        let result; try { result = JSON.parse(xhr.responseText); } catch { result = null; }
        if (xhr.status >= 200 && xhr.status < 300 && result?.ok && result.requestId === id) resolve({ ok: true });
        else resolve({ ok: false, uncertain: result?.uncertain === true || xhr.status >= 500, message: result?.message || "접수 결과를 확인하지 못했어요. 다시 확인해 주세요." });
      };
      xhr.send(body);
    });
  }
  form.addEventListener("submit", async (e) => {
    e.preventDefault(); if (busy) return; setError("");
    if (!ready) { setError("신청 접수 연결을 확인한 후 다시 시도해 주세요."); return; }
    if (!photos.length) { setError("방 사진을 1장 이상 첨부해 주세요."); return; }
    const data = new FormData(form);
    const phone = String(data.get("phone") || "").replace(/\D/g, "");
    if (!/^01[016789]\d{7,8}$/.test(phone)) { setError("연락받을 휴대폰 번호를 확인해 주세요."); return; }
    if (!data.get("areaType")) { setError("지역 기준을 선택해 주세요."); return; }
    requestId ||= crypto.randomUUID(); submissionStart ||= performance.now();
    const body = JSON.stringify({ requestId, inquiry: { areaType: data.get("areaType"), area: data.get("area"), location: data.get("location"), rooms: data.get("rooms"), aircon: data.get("aircon"), tenure: data.get("tenure"), phone, consent: data.get("consent") === "on", consentVersion: "2026-09-20" }, photos: photos.map(({ name, base64 }) => ({ name, mime: "image/jpeg", base64 })) });
    if (new TextEncoder().encode(body).length > 4_000_000) { setError("사진 용량이 너무 커요. 사진 수를 줄여 주세요."); return; }
    lock(true); event("inquiry_submit", { photo_count: photos.length });
    submit.textContent = "사진과 정보를 보내고 있어요"; note.textContent = "화면을 닫지 말고 잠시 기다려 주세요.";
    const result = await send(body, requestId);
    lock(false);
    if (result.ok) {
      event("inquiry_complete", { photo_count: photos.length, value: Math.min(3600, Math.round((performance.now() - submissionStart) / 1000)) });
      form.hidden = true; success.hidden = false; heading.textContent = "진단 신청이 접수되었어요";
      description.textContent = "보내주신 방 정보를 확인한 후 남겨주신 연락처로 안내해 드릴게요.";
      return;
    }
    uncertain = result.uncertain; if (uncertain) lock(false);
    submit.textContent = uncertain ? "접수 결과 다시 확인" : "진단 신청하기 →";
    note.textContent = uncertain ? "입력한 내용과 사진을 그대로 보관하고 있어요." : "매니저가 확인 후 안내하는 진단 서비스입니다.";
    event("inquiry_error", { error_stage: "submission" }); setError(result.message);
  });
})();
