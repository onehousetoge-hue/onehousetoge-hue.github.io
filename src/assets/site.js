(() => {
  "use strict";

  // Copy public contact details or static blank prompts, never visitor input.
  document.querySelectorAll("[data-copy-contact], [data-copy-template]").forEach((copyButton) => {
    if (!navigator.clipboard?.writeText) return;
    const target = document.getElementById(copyButton.dataset.copyTarget);
    const status = document.getElementById(copyButton.getAttribute("aria-describedby"));
    if (!target || !status) return;
    copyButton.hidden = false;
    let copying = false;
    copyButton.addEventListener("click", async () => {
      if (copying) return;
      copying = true;
      copyButton.setAttribute("aria-busy", "true");
      status.textContent = "";
      try {
        await navigator.clipboard.writeText(target.textContent.trim());
        status.textContent = copyButton.hasAttribute("data-copy-template")
          ? "빈 문의 문안을 복사했습니다. 메일에 붙여 넣고 내용을 작성한 뒤 직접 전송해 주세요."
          : copyButton.dataset.copyContact === "phone"
            ? "전화번호를 복사했습니다. 전화 앱에서 직접 전화해 주세요."
            : "이메일 주소를 복사했습니다. 메일을 작성하고 직접 전송해 주세요.";
      } catch {
        status.textContent = copyButton.hasAttribute("data-copy-template")
          ? "복사가 허용되지 않았습니다. 위 문안을 참고해 메일에 직접 작성해 주세요."
          : "복사가 허용되지 않았습니다. 위 연락처를 길게 눌러 복사하거나 직접 입력해 주세요.";
      } finally {
        copying = false;
        copyButton.setAttribute("aria-busy", "false");
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
    const menuLabel = button.querySelector("[data-menu-label]");
    if (menuLabel) menuLabel.textContent = open ? "닫기" : "메뉴";
    document.body.classList.toggle("menu-open", open);
    document.querySelectorAll("main, footer, .breadcrumb").forEach((element) => { element.inert = open; });
    if (open) {
      lastFocused = document.activeElement;
      navigation.querySelector("a")?.focus();
    } else if ((lastFocused === button || navigation.contains(lastFocused)) && button.getClientRects().length) {
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

  // Keep reading-position jumps usable under the sticky header, including with a keyboard.
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", () => {
      const target = document.getElementById(decodeURIComponent(link.hash.slice(1)));
      if (!target) return;
      if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    });
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
  const clearSection = document.querySelector("[data-clear-section]");
  if (clearSection && (worksheets.length || document.querySelector("[data-checklist]"))) {
    clearSection.hidden = false;
    clearSection.querySelector("[data-clear-worksheet]").addEventListener("click", () => {
      worksheets.forEach((input) => { input.value = ""; });
      document.querySelectorAll("[data-checklist]").forEach((group) => {
        group.querySelectorAll("input[type=checkbox]").forEach((input) => { input.checked = false; });
        group.querySelector("[data-check-progress]").textContent = `0 / ${group.querySelectorAll("input[type=checkbox]").length}개 확인`;
      });
      updatePrintAnswers();
      document.querySelector("[data-clear-status]").textContent = "이 화면에 작성한 메모와 체크를 모두 지웠습니다.";
      clearSection.open = false;
      clearSection.querySelector("summary").focus();
    });
  }
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
