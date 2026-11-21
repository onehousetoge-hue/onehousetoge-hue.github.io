import { extractRoom, privateText, requiredFields, roomFields } from "./room-description.js";
import { callbackPayload, submitCallback } from "./callback.js";
import { validateInquiryInput } from "./inquiry.js";

const draftKey = "hanjibung.room-draft.v1";
const draftAge = 7 * 24 * 60 * 60 * 1000;
const photoLimit = 44000;
const questions = {
  location: "방이 있는 동네나 가까운 역 이름을 알려주세요.",
  rooms: "학생에게 내어줄 방은 몇 개인가요?",
  availability: "언제부터 입주할 수 있나요? 아직 정하지 않으셨다면 ‘일정 협의’도 괜찮아요.",
};
function badRoomField(name, value) {
  if (requiredFields.includes(name) && !value) return "필수 항목을 입력해 주세요.";
  if (privateText(value)) return "전화번호나 개인 식별정보는 방 조건에서 빼주세요.";
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
  const contact = find(".rr-contact"), contactFields = contact.querySelector("fieldset");
  const workspace = find(".rr-workspace"), status = find("[data-status]"), reviewButton = find("[data-review]");
  const fileInput = find("#rr-photo"), photoPreview = find("[data-photo-preview]"), erase = find("[data-erase]");
  let photo = "", photoGeneration = 0, resizing = false, busy = false, complete = false, requestId, attribution;
  function fields() { return Object.fromEntries(entries.map(([key]) => [key, input(key).value.trim()])); }
  function invalidate() { requestId = undefined; attribution = undefined; }
  function firstMissing() { return requiredFields.find(key => !input(key).value.trim()); }
  function notify(text) { status.textContent = text; }
  function bubble(text, human = false) {
    const item = document.createElement("p");
    item.className = human ? "rr-user" : "rr-bot";
    item.textContent = text;
    log.append(item);
    log.scrollTop = log.scrollHeight;
  }
  function renderFacts(target, review = false) {
    const data = fields();
    const rows = [];
    for (const [key, label] of entries) {
      if (!requiredFields.includes(key) && !data[key]) continue;
      const row = document.createElement("div"), dt = document.createElement("dt"), dd = document.createElement("dd");
      dt.textContent = label; dd.textContent = data[key] || "입력 전";
      if (!data[key]) dd.dataset.empty = "";
      row.append(dt, dd); rows.push(row);
    }
    if (review && photo) {
      const row = document.createElement("div"), label = document.createElement("dt"), value = document.createElement("dd");
      label.textContent = "방 사진"; value.textContent = "1장 첨부"; row.append(label, value); rows.push(row);
    }
    target.replaceChildren(...rows);
  }
  function refresh() {
    renderFacts(find("[data-facts]"));
    find("[data-progress]").textContent = "필수 " + requiredFields.filter(key => input(key).value.trim()).length + "/3";
    const missing = firstMissing(), choices = find(".rr-choices");
    choices.replaceChildren();
    const options = { rooms: ["1개","2개","3개 이상"], availability: ["바로 가능","다음 달","일정 협의"] };
    for (const value of options[missing] || []) {
      const button = document.createElement("button");
      button.type = "button"; button.textContent = value;
      button.addEventListener("click", () => addText(value));
      choices.append(button);
    }
  }
  function addText(raw) {
    const text = raw.trim();
    if (!text) { composer.focus(); return; }
    if (privateText(text)) { notify("전화번호와 개인 식별정보를 지워 주세요. 연락처는 마지막 단계에서 입력합니다."); composer.focus(); return; }
    if (/^(?:일단\s*)?(?:임시\s*저장|저장)(?:해\s*(?:줘|주세요|둘래|둘게))?[.! ]*$/.test(text)) {
      composer.value = ""; find("[data-save]").click(); return;
    }
    if (/^(?:(?:응|네|좋아)[, ]*)?(?:(?:이|그|수정한)\s*내용(?:으로|대로)\s*)?(?:등록|신청)(?:할게요|해\s*(?:줘|주세요))?[.! ]*$/.test(text)) {
      composer.value = ""; review(); return;
    }
    const missing = firstMissing();
    const patch = extractRoom(text, missing, input("availability").value);
    bubble(text, true); composer.value = "";
    const applied = [];
    for (const [key, value] of Object.entries(patch)) {
      if ((value && badRoomField(key, value)) || value.length > input(key).maxLength) continue;
      input(key).value = value; input(key).setCustomValidity(""); applied.push(roomFields[key]);
    }
    invalidate(); notify(""); refresh();
    const next = firstMissing();
    if (!applied.length) {
      bubble("어떤 항목인지 확인이 필요해요. " + (questions[next] || "‘월세 40만 원’처럼 항목과 값을 함께 적거나 ‘직접 입력’을 눌러 주세요."));
    } else {
      const note = applied.length === 1 ? applied[0] + " 항목을 반영했어요. " : "알려 주신 방 정보를 정리했어요. ";
      bubble(note + (questions[next] || "미리보기를 확인하고 다음 단계로 넘어가 주세요."));
    }
  }
  function validateRoom(includeMissing) {
    for (const [key] of entries) {
      const target = input(key), value = target.value.trim();
      if (!includeMissing && !value) continue;
      const error = badRoomField(key, value);
      if (!error) { target.setCustomValidity(""); continue; }
      editor.open = true; target.setCustomValidity(error); target.focus(); target.reportValidity();
      notify(roomFields[key] + " 항목을 확인해 주세요."); return false;
    }
    return true;
  }
  function review() {
    if (resizing || busy || !validateRoom(true)) return;
    if (composer.value.trim()) {
      notify("작성 중인 설명을 보내거나 입력란을 비운 뒤 다음 단계로 이동해 주세요."); composer.focus(); return;
    }
    workspace.hidden = true; contact.hidden = false; contactFields.disabled = false; notify("");
    renderFacts(find("[data-review-facts]"), true);
    contact.querySelector("h2").focus();
  }
  function removePhoto() {
    photoGeneration++; resizing = false; photo = ""; fileInput.value = ""; photoPreview.hidden = true;
    photoPreview.querySelector("img").removeAttribute("src"); reviewButton.disabled = false;
    invalidate();
  }
  fileInput.addEventListener("change", async () => {
    const file = fileInput.files[0];
    if (!file) return;
    const sequence = ++photoGeneration;
    resizing = true; reviewButton.disabled = true; notify("방 사진을 준비하고 있어요.");
    try {
      const jpeg = await smallPhoto(file);
      if (sequence !== photoGeneration) return;
      photo = jpeg; photoPreview.querySelector("img").src = jpeg; photoPreview.hidden = false; invalidate(); notify("");
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
    if (composer.value.trim()) { notify("입력 중인 설명을 먼저 보내 주세요."); composer.focus(); return; }
    if (!Object.values(fields()).some(Boolean)) { notify("저장할 방 정보를 먼저 입력해 주세요."); return; }
    try {
      localStorage.setItem(draftKey, JSON.stringify({ at:Date.now(), fields:fields() }));
      erase.hidden = false; notify("방 조건을 이 기기에 7일간 저장했어요. 사진과 연락처는 다시 입력해 주세요.");
    } catch { notify("이 브라우저에서는 임시저장을 사용할 수 없어요. 현재 작성은 계속할 수 있습니다."); }
  };
  erase.onclick = () => {
    try { localStorage.removeItem(draftKey); erase.hidden = true; notify("기기에 임시저장한 방 정보를 지웠어요."); }
    catch { notify("기기의 저장 공간에 접근할 수 없어요."); }
  };
  try {
    const draft = JSON.parse(localStorage.getItem(draftKey));
    if (draft && Number.isFinite(draft.at) && draft.at <= Date.now() && Date.now() - draft.at < draftAge && draft.fields) {
      for (const [key] of entries) {
        const value = draft.fields[key];
        if (typeof value === "string" && value.length <= input(key).maxLength && !badRoomField(key, value)) input(key).value = value;
      }
      erase.hidden = false; notify("이 기기에 임시저장한 방 조건을 불러왔어요.");
    } else if (draft) localStorage.removeItem(draftKey);
  } catch { /* The application works with storage disabled. */ }
  find("[data-edit]").onclick = () => { editor.open = true; input(firstMissing() || "location").focus(); };
  find("[data-send]").onclick = () => addText(composer.value);
  composer.addEventListener("keydown", e => {
    if (e.key === "Enter" && !e.shiftKey && !e.isComposing && e.keyCode !== 229) { e.preventDefault(); addText(composer.value); }
  });
  form.addEventListener("input", e => {
    if (e.target === composer || e.target === fileInput || busy) return;
    invalidate();
    if (Object.hasOwn(roomFields, e.target.name)) { e.target.setCustomValidity(""); refresh(); }
  });
  reviewButton.onclick = review;
  find("[data-back]").onclick = () => {
    contactFields.disabled = true; contact.hidden = true; workspace.hidden = false; notify(""); reviewButton.focus();
  };
  form.addEventListener("submit", async e => {
    e.preventDefault();
    if (busy || complete) return;
    if (contact.hidden) { review(); return; }
    const values = { ...fields(), name:input("name").value, contact:input("contact").value, website:input("website").value, consent:input("consent").checked };
    requestId ||= crypto.randomUUID();
    const payload = callbackPayload(values, requestId, form.dataset.consentVersion, true);
    if (photo) payload.roomPhoto = photo;
    const errors = validateInquiryInput(payload, "consultation");
    if (Object.keys(errors).length) {
      notify(Object.values(errors)[0]); input(Object.keys(errors)[0])?.focus(); return;
    }
    attribution ||= window.hanjibungLeadVisit?.snapshot();
    if (attribution) payload.attribution = attribution;
    busy = true; form.setAttribute("aria-busy","true"); form.querySelector("fieldset").disabled = true;
    notify("방 등록 신청을 저장하고 있어요.");
    try {
      const receipt = await submitCallback(form.dataset.endpoint, payload);
      complete = true;
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
  refresh(); form.querySelector("fieldset").disabled = false;
}
const form = typeof document === "undefined" ? null : document.querySelector("[data-room-registration]");
if (form) init(form);
