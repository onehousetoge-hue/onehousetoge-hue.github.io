(() => {
  "use strict";
  const root = document.querySelector("[data-income-calculator]");
  if (!root) return;
  const panel = root.querySelector("#income-panel");
  const openButton = root.querySelector("[data-income-open]");
  const closeButton = root.querySelector("[data-income-close]");
  const searchButton = root.querySelector("[data-income-search]");
  const reservationLink = root.querySelector(".income-reservation");
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
    const areaType = draft?.area === area.value.trim() ? draft.areaType : "";
    prefill?.save({ area: area.value, areaType, homeType: root.querySelector('[name="homeType"]:checked')?.value });
  }
  area.addEventListener("input", () => { message.hidden = true; saveDraft(); });
  root.querySelectorAll('[name="homeType"]').forEach((input) => input.addEventListener("change", saveDraft));
  reservationLink.addEventListener("click", (event) => {
    if (area.value.trim() && !validateArea()) { event.preventDefault(); return; }
    saveDraft();
  });
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

  root.hidden = false;
  if ("IntersectionObserver" in window) {
    const visible = new Set();
    const updateVisibility = () => {
      root.hidden = visible.size > 0 && !root.contains(document.activeElement);
    };
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) visible.add(entry.target);
        else visible.delete(entry.target);
      }
      updateVisibility();
    });
    for (const element of document.querySelectorAll(".host-intro-estimate-button, .host-footer")) {
      observer.observe(element);
    }
    root.addEventListener("focusout", event => {
      if (!root.contains(event.relatedTarget)) queueMicrotask(updateVisibility);
    });
  }

  function validateArea() {
    if (area.value.trim() && (!prefill || prefill.placeName(area.value))) return true;
    message.hidden = false;
    message.textContent = "공릉역이나 서울과학기술대학교처럼 근처 시설 이름을 입력해 주세요.";
    area.focus();
    return false;
  }
  function continueToDiagnosis() {
    if (validateArea()) reservationLink.click();
  }
  searchButton.addEventListener("click", continueToDiagnosis);
  area.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.isComposing && event.keyCode !== 229) { event.preventDefault(); continueToDiagnosis(); }
  });
})();
