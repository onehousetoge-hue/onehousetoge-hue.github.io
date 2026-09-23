(() => {
  "use strict";

  // Copy only the organization's already-public contact details; no transmission.
  document.querySelectorAll("[data-copy-contact]").forEach((copyButton) => {
    if (!navigator.clipboard?.writeText) return;
    const target = document.getElementById(copyButton.dataset.copyTarget);
    const status = document.getElementById(copyButton.getAttribute("aria-describedby"));
    if (!target || !status) return;
    copyButton.hidden = false;
    copyButton.addEventListener("click", async () => {
      copyButton.disabled = true;
      status.textContent = "";
      try {
        await navigator.clipboard.writeText(target.textContent.trim());
        status.textContent = copyButton.dataset.copyContact === "phone"
          ? "전화번호를 복사했습니다. 전화 앱에서 직접 전화해 주세요."
          : "이메일 주소를 복사했습니다. 메일을 작성하고 직접 전송해 주세요.";
      } catch {
        status.textContent = "복사가 허용되지 않았습니다. 위 연락처를 길게 눌러 복사하거나 직접 입력해 주세요.";
      } finally {
        copyButton.disabled = false;
      }
    });
  });

  const button = document.querySelector("[data-menu-button]");
  const navigation = document.querySelector("[data-navigation]");
  let lastFocused = null;

  function setMenu(open) {
    if (!button || !navigation) return;
    button.setAttribute("aria-expanded", String(open));
    button.querySelector(".visually-hidden").textContent = open ? "전체 메뉴 닫기" : "전체 메뉴 열기";
    document.body.classList.toggle("menu-open", open);
    document.querySelectorAll("main, footer, .breadcrumb").forEach((element) => { element.inert = open; });
    if (open) {
      lastFocused = document.activeElement;
      navigation.querySelector("a")?.focus();
    } else if (lastFocused === button || navigation.contains(lastFocused)) {
      button.focus();
    }
  }

  button?.addEventListener("click", () => setMenu(button.getAttribute("aria-expanded") !== "true"));
  navigation?.addEventListener("click", (event) => {
    if (event.target.closest("a")) setMenu(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && button?.getAttribute("aria-expanded") === "true") setMenu(false);
    if (event.key === "Tab" && button?.getAttribute("aria-expanded") === "true") {
      const links = [...navigation.querySelectorAll("a")];
      const first = button;
      const last = links.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  document.addEventListener("click", (event) => {
    if (button?.getAttribute("aria-expanded") !== "true") return;
    if (!navigation?.contains(event.target) && !button.contains(event.target)) setMenu(false);
  });
  window.matchMedia("(min-width: 1121px)").addEventListener("change", (event) => {
    if (event.matches) setMenu(false);
  });

  document.querySelectorAll("[data-print]").forEach((printButton) => {
    printButton.addEventListener("click", () => window.print());
  });

  const worksheets = [...document.querySelectorAll("[data-worksheet]")];
  function updatePrintAnswers() {
    worksheets.forEach((input) => {
      const output = document.querySelector(`[data-print-answer="${input.id}"]`);
      if (output) output.textContent = input.value || " ";
    });
  }
  worksheets.forEach((input) => input.addEventListener("input", updatePrintAnswers));
  document.querySelectorAll("[data-checklist]").forEach((group) => {
    group.addEventListener("change", () => {
      const total = group.querySelectorAll("input[type=checkbox]").length;
      const checked = group.querySelectorAll("input:checked").length;
      group.querySelector("[data-check-progress]").textContent = `${checked} / ${total}개 확인`;
    });
  });
  let closedDetails = [];
  window.addEventListener("beforeprint", () => {
    updatePrintAnswers();
    closedDetails = [...document.querySelectorAll(".resource-details:not([open])")];
    closedDetails.forEach((detail) => { detail.open = true; });
  });
  window.addEventListener("afterprint", () => {
    closedDetails.forEach((detail) => { detail.open = false; });
    closedDetails = [];
  });
  updatePrintAnswers();
  document.body.classList.add("worksheet-ready");
})();
