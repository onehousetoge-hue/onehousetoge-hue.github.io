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
  const desktop = window.matchMedia("(min-width: 1280px)");
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

  function explainDiagnosis() {
    message.hidden = false;
    message.textContent = "예상 월세는 무료 진단 신청 후 안내해 드립니다.";
    area.focus();
  }
  searchButton.addEventListener("click", explainDiagnosis);
  area.addEventListener("keydown", (event) => {
    if (event.key === "Enter") { event.preventDefault(); explainDiagnosis(); }
  });
})();
