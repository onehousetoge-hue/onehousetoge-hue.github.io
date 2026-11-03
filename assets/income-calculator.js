(() => {
  "use strict";
  const root = document.querySelector("[data-income-calculator]");
  if (!root) return;
  const panel = root.querySelector("#income-panel");
  const openButton = root.querySelector("[data-income-open]");
  const closeButton = root.querySelector("[data-income-close]");
  const searchButton = root.querySelector("[data-income-search]");
  const area = root.querySelector("#income-area");
  const message = root.querySelector("[data-income-message]");
  const prefill = window.hanjibungDiagnosisPrefill;
  const draft = prefill?.read();
  if (draft) {
    if (!area.value) area.value = draft.area;
    root.querySelectorAll('[name="homeType"]').forEach((input) => {
      input.checked = prefill.homeTypes[input.value] === draft.homeType;
    });
  }
  function saveDraft() {
    prefill?.save({ area: area.value, homeType: root.querySelector('[name="homeType"]:checked')?.value });
  }
  area.addEventListener("input", saveDraft);
  root.querySelectorAll('[name="homeType"]').forEach((input) => input.addEventListener("change", saveDraft));
  root.querySelector(".income-reservation").addEventListener("click", saveDraft);
  const desktop = window.matchMedia("(min-width: 1200px)");
  let open = desktop.matches;
  let manuallyToggled = false;

  function setOpen(value, focus = false) {
    open = value;
    root.classList.toggle("is-expanded", open);
    root.classList.toggle("is-collapsed", !open);
    panel.hidden = !open;
    openButton.hidden = open;
    openButton.setAttribute("aria-expanded", String(open));
    if (focus) (open ? area : openButton).focus();
  }
  openButton.addEventListener("click", () => { manuallyToggled = true; setOpen(true, true); });
  closeButton.addEventListener("click", () => { manuallyToggled = true; setOpen(false, true); });
  desktop.addEventListener("change", () => { if (!manuallyToggled) setOpen(desktop.matches); });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && open && root.contains(document.activeElement)) {
      event.preventDefault(); manuallyToggled = true; setOpen(false, true);
    }
  });
  setOpen(open);

  // Keep the first view clear, then reveal without changing the page layout.
  const hero = document.querySelector(".host-hero");
  let revealAt = 400;
  let visibilityPending = false;
  function updateVisibility() {
    visibilityPending = false;
    root.hidden = window.scrollY < revealAt && !root.contains(document.activeElement);
  }
  function queueVisibility() {
    if (visibilityPending) return;
    visibilityPending = true;
    window.requestAnimationFrame(updateVisibility);
  }
  function updateThreshold() {
    const heroBottom = hero ? hero.getBoundingClientRect().bottom + window.scrollY : 640;
    revealAt = Math.max(320, Math.min(640, heroBottom - window.innerHeight * .3));
    queueVisibility();
  }
  window.addEventListener("scroll", queueVisibility, { passive: true });
  window.addEventListener("resize", updateThreshold);
  window.addEventListener("pageshow", updateThreshold);
  root.addEventListener("focusout", queueVisibility);
  updateThreshold();

  function explainDiagnosis() {
    message.hidden = false;
    saveDraft();
    message.textContent = area.value.trim() ? "입력하신 내용은 진단 신청서에 자동으로 반영됩니다." : "대학교나 지하철역을 입력해 주세요.";
    area.focus();
  }
  searchButton.addEventListener("click", explainDiagnosis);
  area.addEventListener("keydown", (event) => {
    if (event.key === "Enter") { event.preventDefault(); explainDiagnosis(); }
  });
})();
