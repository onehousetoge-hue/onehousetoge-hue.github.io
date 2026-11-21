import { completeRoomTurn, correctionPatch, extractRoom, offlineRoomTurn, requiredFields, roomChatPrivate, roomFields, roomQuestions, visitAddressError } from "./room-description.js";
import { callbackAttempt, callbackPayload, submitCallback } from "./callback.js";
import { validateInquiryInput } from "./inquiry.js";

const draftKey = "hanjibung.room-draft.v1";
const draftAge = 7 * 24 * 60 * 60 * 1000;
const photoLimit = 44000;
const hints = {
  location: "예: 노원구 공릉동", rooms: "예: 방 한 개", availability: "예: 다음 달부터",
  rent: "예: 40만 원", deposit: "예: 100만 원", fee: "예: 관리비 포함",
  homeType: "예: 아파트", area: "예: 6평", floor: "예: 2층",
};
const options = { rooms: ["1개", "2개", "3개 이상"], availability: ["바로 가능", "다음 달", "일정 협의"] };
function badRoomField(name, value) {
  if (requiredFields.includes(name) && !value) return "필수 항목을 입력해 주세요.";
  if (roomChatPrivate(value)) return "상세주소와 연락처는 마지막 단계의 전용 칸에 적어주세요.";
  if (name === "location" && (/\d+\s*(?:번지|호실|호|층)|(?:로|길|동)\s*\d+(?:[-\s]|$)|\d+\s*동\s*\d+/.test(value))) return "동네나 역 이름까지만 입력해 주세요.";
  if (name === "rooms" && !/^(?:[1-9]|10)\s*(?:개|칸)?(?:\s*이상)?$/.test(value)) return "내어줄 방 개수를 1~10개 사이로 적어 주세요.";
  return "";
}

export async function smallPhoto(file) {
  if (!["image/jpeg","image/png","image/webp"].includes(file.type) || file.size > 15 * 1024 * 1024) throw Error("15MB 이하의 JPG, PNG, WebP 사진을 골라 주세요.");
  const url = URL.createObjectURL(file);
  try {
    const picture = new Image();
    picture.src = url;
    try { await picture.decode(); } catch { throw Error("사진을 읽지 못했어요. 다른 사진을 골라 주세요."); }
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { alpha: false });
    for (const longest of [960, 750, 590, 440, 320]) {
      const scale = Math.min(1, longest / Math.max(picture.naturalWidth, picture.naturalHeight));
      canvas.width = Math.max(1, Math.round(picture.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(picture.naturalHeight * scale));
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(picture, 0, 0, canvas.width, canvas.height);
      const jpeg = canvas.toDataURL("image/jpeg", .72);
      if (jpeg.startsWith("data:image/jpeg;base64,") && jpeg.length <= photoLimit) return jpeg;
    }
    throw Error("사진을 줄이지 못했어요. 다른 사진을 골라 주세요.");
  } finally { URL.revokeObjectURL(url); }
}

function init(form) {
  const find = selector => form.querySelector(selector);
  const input = name => form.elements.namedItem(name);
  const entries = Object.entries(roomFields);
  const editor = find(".rr-editor"), composer = find("#room-chat-line"), log = find(".rr-log");
  const historyButton = find(".rr-history");
  const panels = [...form.querySelectorAll("[data-panel]")], steps = [...form.querySelectorAll(".rr-steps li")];
  const status = find("[data-status]"), reviewButton = find("[data-review]"), chatNext = find("[data-chat-next]");
  const fileInput = find("#rr-photo"), photoPreview = find("[data-photo-preview]"), erase = find("[data-erase]");
  const send = find("[data-send]");
  const summary = find("[data-chat-summary]"), chips = find("[data-chat-facts]");
  const undo = find("[data-chat-undo]"), cancel = find("[data-cancel-correction]"), progress = find("[data-room-progress]");
  let pendingTurn, correction, previousTurn;
  let stage = "chat", lastQuestion, editedInDetails = false;
  log.addEventListener("scroll", () => log.toggleAttribute("data-scrolled", log.scrollTop > 3), { passive: true });
  historyButton.onclick = () => {
    const expanded = log.toggleAttribute("data-expanded");
    historyButton.setAttribute("aria-expanded", String(expanded));
    historyButton.textContent = expanded ? "이전 대화 접기" : "이전 대화 보기";
    log.scrollTop = expanded ? 0 : log.scrollHeight;
  };
  let photo = "", photoGeneration = 0, resizing = false, busy = false, complete = false, attempt;
  function fields() { return Object.fromEntries(entries.map(([key]) => [key, input(key).value.trim()])); }
  function firstMissing() { return requiredFields.find(key => badRoomField(key, input(key).value.trim())); }
  function notify(text) { status.textContent = text; }
  function bubble(text, human = false) {
    const item = document.createElement("p");
    item.className = human ? "rr-user" : "rr-bot";
    historyButton.hidden = log.childElementCount < 2;
    item.textContent = text;
    log.append(item);
    log.scrollTop = log.scrollHeight;
  }
  function renderFacts(target, data) {
    if (!target) return;
    const rows = [];
    for (const [key, label] of entries) {
      const value = badRoomField(key, data[key]) ? "" : data[key];
      if (!requiredFields.includes(key) && !value) continue;
      const row = document.createElement("div"), dt = document.createElement("dt"), dd = document.createElement("dd");
      dt.textContent = label; dd.textContent = value || "입력 전";
      if (!value) dd.dataset.empty = "";
      row.append(dt, dd); rows.push(row);
    }
    target.replaceChildren(...rows);
  }
  function renderChips(data) {
    if (!chips) return;
    const buttons = [];
    for (const [key, label] of entries) {
      if (!data[key] || badRoomField(key, data[key])) continue;
      const button = document.createElement("button"), title = document.createElement("span"), value = document.createElement("strong");
      button.type = "button"; button.className = "rr-fact-chip";
      button.dataset.field = key;
      button.setAttribute("aria-label", label + " " + data[key] + " 수정");
      button.setAttribute("aria-pressed", String(correction === key));
      title.textContent = label; value.textContent = data[key]; button.append(title, value);
      buttons.push(button);
    }
    chips.replaceChildren(...buttons);
    if (summary) summary.hidden = !buttons.length && !previousTurn;
  }
  function refresh() {
    const data = fields(), hasFields = Object.values(data).some(Boolean);
    renderFacts(find("[data-facts]"), data);
    renderFacts(find("[data-final-facts]"), data);
    renderChips(data);
    const missing = firstMissing(), focus = correction || missing, choices = find(".rr-choices");
    composer.placeholder = !hasFields ? "예: 공릉동에 방 한 개가 있어요. 다음 달부터 입주할 수 있어요." : hints[focus] || "예: 월세는 40만 원이에요";
    composer.setAttribute("aria-label", correction ? roomFields[correction] + " 수정할 내용" : "AI에게 방 설명 보내기");
    chatNext.hidden = Boolean(missing || correction);
    if (undo) undo.hidden = !previousTurn;
    if (cancel) cancel.hidden = !correction;
    if (progress) progress.textContent = "필수 조건 " + requiredFields.filter(key => !badRoomField(key, data[key])).length + "/" + requiredFields.length;
    find("[data-draft-tools]").hidden = stage === "contact" || (erase.hidden && !hasFields);
    choices.replaceChildren();
    for (const value of options[focus] || []) {
      const button = document.createElement("button");
      button.type = "button"; button.textContent = value;
      button.addEventListener("click", () => {
        addText(value, true);
        if (!form.contains(document.activeElement)) (choices.querySelector("button") || (chatNext.hidden ? composer : chatNext)).focus();
      });
      choices.append(button);
    }
  }
  function ask(note = "") {
    if (correction) { bubble(note + roomFields[correction] + "의 새 값을 알려주세요. " + hints[correction]); return; }
    lastQuestion = firstMissing();
    bubble(note + (roomQuestions[lastQuestion] || "기본 조건을 모두 적었어요. 방 조건을 확인하고 사진을 추가할 수 있어요."));
  }
  function markPending(controller) {
    pendingTurn = controller;
    const pending = Boolean(controller);
    composer.readOnly = pending; send.disabled = pending; chatNext.disabled = pending;
    find("[data-save]").disabled = pending;
    for (const choice of find(".rr-choices").children) choice.disabled = pending;
    if (chips) for (const chip of chips.children) chip.disabled = pending;
    if (undo) undo.disabled = pending;
    if (cancel) cancel.disabled = pending;
    log.setAttribute("aria-busy", String(pending));
    if (pending) {
      const reading = document.createElement("p");
      reading.className = "rr-bot rr-reading"; reading.setAttribute("aria-hidden", "true");
      reading.textContent = "방 설명에서 조건을 찾고 있어요…";
      log.append(reading); log.scrollTop = log.scrollHeight;
    } else log.querySelector(".rr-reading")?.remove();
  }
  function showStage(name) {
    if (pendingTurn) {
      pendingTurn.abort(); markPending(null);
    }
    stage = name; notify("");
    for (const [index, panel] of panels.entries()) {
      const active = panel.dataset.panel === name;
      panel.hidden = !active; panel.disabled = !active;
      if (active) steps[index].setAttribute("aria-current", "step");
      else steps[index].removeAttribute("aria-current");
    }
    refresh();
    find('[data-panel="' + name + '"] h2').focus();
    if (name === "chat" && (editedInDetails || lastQuestion !== firstMissing())) {
      ask(editedInDetails ? "수정한 방 조건으로 이어갈게요. " : "");
      editedInDetails = false;
    }
  }
  function openDetails(edit = false) {
    if (!edit && composer.value.trim()) { notify("작성한 답변을 보내거나 지운 뒤 이동해 주세요."); composer.focus(); return; }
    showStage("details");
    if (edit || firstMissing()) { editor.open = true; input(firstMissing() || "location").focus(); }
  }
  async function addText(raw, quickChoice = false) {
    if (pendingTurn || stage !== "chat") return;
    const text = raw.trim();
    if (!text) { composer.focus(); return; }
    if (roomChatPrivate(text)) {
      composer.value = ""; notify("");
      ask("개인정보가 있을 수 있어 이 문장은 보내지 않았어요. ");
      composer.focus(); return;
    }
    if (/^(?:일단\s*)?(?:임시\s*저장|저장)(?:해\s*(?:줘|주세요|둘래|둘게))?[.! ]*$/.test(text)) {
      composer.value = ""; find("[data-save]").click(); return;
    }
    if (/^(?:(?:응|네|좋아)[, ]*)?(?:(?:이|그|수정한)\s*내용(?:으로|대로)\s*)?(?:등록|신청)(?:할게요|해\s*(?:줘|주세요))?[.! ]*$/.test(text)) {
      composer.value = ""; openDetails(); return;
    }
    const missing = firstMissing(), focus = correction || missing || "";
    const previousAvailability = input("availability").value;
    let patch, aiReply = "", notice = "";
    if (quickChoice) {
      patch = extractRoom(text, focus, previousAvailability);
    } else {
      const controller = new AbortController();
      markPending(controller); notify("AI가 방 설명을 읽고 있어요.");
      const timeout = setTimeout(() => controller.abort(), 18000);
      let cancelled = false;
      try {
        const response = await fetch(form.dataset.assistant, {
          method: "POST", headers: { "Content-Type": "application/json" },
          credentials: "omit", referrerPolicy: "no-referrer", signal: controller.signal,
          body: JSON.stringify({ message: text, focus }),
        });
        if (response.status === 422) {
          if (pendingTurn !== controller) return;
          composer.value = ""; notify(""); ask("개인정보가 있을 수 있어 이 문장은 AI에 전달하지 않았어요. "); return;
        }
        if (!response.ok) throw Error(response.status === 429 ? "LIMIT" : "UNAVAILABLE");
        const result = await response.json();
        if (result.source !== "llm" || !result.fields || typeof result.fields !== "object" || Array.isArray(result.fields)) throw Error("FORMAT");
        patch = correction ? result.fields : completeRoomTurn(text, focus, previousAvailability, result.fields);
        aiReply = typeof result.reply === "string" ? result.reply : "";
      } catch (error) {
        patch = offlineRoomTurn(text, focus, previousAvailability);
        notice = (error.message === "LIMIT" ? "AI 이용 한도에 도달했어요." : "AI에 연결할 수 없어요.") + " 기기에서 방 조건을 정리하거나 ‘직접 입력’으로 계속할 수 있어요.";
      } finally {
        clearTimeout(timeout);
        cancelled = pendingTurn !== controller;
        if (!cancelled) markPending(null);
      }
      if (cancelled) return;
    }
    if (correction) patch = correctionPatch(text, correction, patch, previousAvailability);
    let recognized = false;
    const before = {};
    for (const [key, value] of Object.entries(patch)) {
      if (!Object.hasOwn(roomFields, key) || typeof value !== "string") continue;
      if ((value && badRoomField(key, value)) || value.length > input(key).maxLength) continue;
      if (input(key).value !== value) before[key] = input(key).value;
      input(key).value = value; input(key).setCustomValidity("");
      recognized = true;
    }
    if (!recognized) {
      notify(notice); composer.focus(); composer.select();
      if (correction) ask("이 값을 확인하기 어려워요. ");
      else bubble(aiReply || (missing ? roomQuestions[missing] + " (" + hints[missing] + ")" : "바꿀 조건을 아래에서 누르거나 ‘월세 40만 원’처럼 알려주세요."));
      return;
    }
    const wasCorrection = Boolean(correction);
    correction = undefined;
    if (Object.keys(before).length) previousTurn = before;
    composer.value = ""; notify(notice); refresh();
    bubble(text, true);
    ask(wasCorrection ? "수정한 조건을 반영했어요. " : "");
  }
  function validateRoom(includeMissing) {
    for (const [key] of entries) {
      const target = input(key), value = target.value.trim();
      if (!includeMissing && !value) continue;
      const error = badRoomField(key, value);
      if (!error) { target.setCustomValidity(""); continue; }
      if (stage !== "details") showStage("details");
      editor.open = true; target.setCustomValidity(error); target.focus(); target.reportValidity();
      notify(roomFields[key] + " 항목을 확인해 주세요."); return false;
    }
    return true;
  }
  function review() {
    if (resizing || busy || !validateRoom(true)) return;
    showStage("contact");
  }
  function removePhoto() {
    photoGeneration++; resizing = false; photo = ""; fileInput.value = ""; photoPreview.hidden = true;
    photoPreview.querySelector("img").removeAttribute("src"); reviewButton.disabled = false;
  }
  fileInput.addEventListener("change", async () => {
    const file = fileInput.files[0];
    if (!file) return;
    const sequence = ++photoGeneration;
    resizing = true; reviewButton.disabled = true; notify("방 사진을 준비하고 있어요.");
    try {
      const jpeg = await smallPhoto(file);
      if (sequence !== photoGeneration) return;
      photo = jpeg; photoPreview.querySelector("img").src = jpeg; photoPreview.hidden = false; notify("");
    } catch (err) {
      if (sequence !== photoGeneration) return;
      fileInput.value = ""; notify(err.message + (photo ? " 이전 사진은 유지됩니다." : ""));
    } finally {
      if (sequence === photoGeneration) { resizing = false; reviewButton.disabled = false; }
    }
  });
  find("[data-remove-photo]").onclick = () => { removePhoto(); notify("첨부할 사진을 뺐습니다."); };
  find("[data-save]").onclick = () => {
    if (!validateRoom(false)) return;
    if (stage === "chat" && composer.value.trim()) { notify("입력 중인 설명을 먼저 보내 주세요."); composer.focus(); return; }
    if (!Object.values(fields()).some(Boolean)) { notify("저장할 방 정보를 먼저 입력해 주세요."); return; }
    try {
      localStorage.setItem(draftKey, JSON.stringify({ at:Date.now(), fields:fields() }));
      erase.hidden = false; notify("방 조건을 이 기기에 7일간 저장했어요. 사진, 상세주소와 연락처는 신청할 때 다시 입력해 주세요.");
    } catch { notify("이 브라우저에서는 임시저장을 사용할 수 없어요. 현재 작성은 계속할 수 있습니다."); }
  };
  erase.onclick = () => {
    try { localStorage.removeItem(draftKey); erase.hidden = true; refresh(); notify("기기에 임시저장한 방 정보를 지웠어요."); }
    catch { notify("기기의 저장 공간에 접근할 수 없어요."); }
  };
  try {
    const stored = localStorage.getItem(draftKey);
    let draft;
    try { draft = JSON.parse(stored); } catch { /* Remove an unreadable saved draft below. */ }
    if (draft && Number.isFinite(draft.at) && draft.at <= Date.now() && Date.now() - draft.at < draftAge && draft.fields && typeof draft.fields === "object") {
      for (const [key] of entries) {
        const value = draft.fields[key];
        if (typeof value === "string" && value.length <= input(key).maxLength && !badRoomField(key, value)) input(key).value = value;
      }
      const restored = fields();
      if (Object.values(restored).some(Boolean)) {
        const safeDraft = JSON.stringify({ at:draft.at, fields:restored });
        if (stored !== safeDraft) localStorage.setItem(draftKey, safeDraft);
        erase.hidden = false; notify("이 기기에 임시저장한 방 조건을 불러왔어요.");
      } else localStorage.removeItem(draftKey);
    } else if (stored !== null) localStorage.removeItem(draftKey);
  } catch { /* The application works with storage disabled. */ }
  if (chips) chips.onclick = event => {
    const chip = event.target.closest("button[data-field]");
    if (!chip || pendingTurn) return;
    if (composer.value.trim()) { notify("지금 작성한 답변을 먼저 보내거나 지워주세요."); composer.focus(); return; }
    correction = chip.dataset.field;
    refresh(); notify(""); ask(); composer.focus();
  };
  if (cancel) cancel.onclick = () => {
    composer.value = ""; correction = undefined; notify(""); refresh(); ask(); composer.focus();
  };
  if (undo) undo.onclick = () => {
    if (!previousTurn || pendingTurn) return;
    if (composer.value.trim()) { notify("지금 작성한 답변을 먼저 보내거나 지워주세요."); composer.focus(); return; }
    for (const [key, value] of Object.entries(previousTurn)) {
      input(key).value = value; input(key).setCustomValidity("");
    }
    previousTurn = undefined; correction = undefined;
    refresh(); notify(""); ask("방금 반영한 내용을 되돌렸어요. "); composer.focus();
  };
  find("[data-edit]").onclick = () => openDetails(true);
  chatNext.onclick = () => openDetails();
  find("[data-chat-back]").onclick = () => { if (validateRoom(false)) showStage("chat"); };
  send.onclick = () => addText(composer.value);
  composer.addEventListener("keydown", e => {
    if (e.key === "Enter" && !e.shiftKey && !e.isComposing && e.keyCode !== 229) { e.preventDefault(); addText(composer.value); }
  });
  form.addEventListener("input", e => {
    if (e.target === composer || e.target === fileInput || busy) return;
    e.target.setCustomValidity("");
    if (Object.hasOwn(roomFields, e.target.name)) {
      previousTurn = undefined;
      editedInDetails = true; refresh();
    }
  });
  reviewButton.onclick = review;
  find("[data-back]").onclick = () => showStage("details");
  form.addEventListener("submit", async e => {
    e.preventDefault();
    if (busy || complete) return;
    if (stage === "chat") { if (composer.value.trim()) addText(composer.value); else openDetails(); return; }
    if (stage === "details") { review(); return; }
    const address = input("address");
    address.setCustomValidity(visitAddressError(address.value));
    if (!form.reportValidity()) return;
    const values = { ...fields(), address:address.value, name:input("name").value, contact:input("contact").value, website:input("website").value, consent:input("consent").checked };
    const payload = callbackPayload(values, undefined, form.dataset.consentVersion, true);
    if (photo) payload.roomPhoto = photo;
    const errors = validateInquiryInput(payload, "consultation");
    if (Object.keys(errors).length) {
      notify(Object.values(errors)[0]); input(Object.keys(errors)[0])?.focus(); return;
    }
    attempt = callbackAttempt(payload, attempt);
    busy = true; form.setAttribute("aria-busy","true"); form.querySelector("fieldset").disabled = true;
    notify("방 등록 신청을 저장하고 있어요.");
    try {
      const receipt = await submitCallback(form.dataset.endpoint, attempt);
      complete = true; attempt = undefined;
      try { localStorage.removeItem(draftKey); } catch { /* Optional device storage. */ }
      form.reset(); removePhoto(); log.replaceChildren(); form.hidden = true;
      const success = document.querySelector("[data-success]");
      success.hidden = false; success.querySelector("[data-receipt]").textContent = "접수번호 " + receipt.requestId;
      success.querySelector("h2").focus();
    } catch (error) {
      notify(error.message === "SENSITIVE" ? "개인 식별정보를 지운 뒤 다시 신청해 주세요." : "저장을 확인하지 못했어요. 입력 내용은 유지됩니다. 같은 내용으로 다시 신청하면 접수번호를 재확인합니다.");
      status.focus();
    } finally { busy = false; form.removeAttribute("aria-busy"); form.querySelector("fieldset").disabled = complete; }
  });
  refresh();
  if (Object.values(fields()).some(Boolean)) { log.replaceChildren(); ask("저장한 방 조건부터 이어갈게요. "); }
  else lastQuestion = firstMissing();
  form.querySelector("fieldset").disabled = false;
}
const form = typeof document === "undefined" ? null : document.querySelector("[data-room-registration]");
if (form) init(form);
