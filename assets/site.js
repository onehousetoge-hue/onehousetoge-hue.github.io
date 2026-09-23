(() => {
  "use strict";

  const button = document.querySelector("[data-menu-button]");
  const navigation = document.querySelector("[data-navigation]");
  let lastFocused = null;

  function setMenu(open) {
    if (!button || !navigation) return;
    button.setAttribute("aria-expanded", String(open));
    button.querySelector(".visually-hidden").textContent = open ? "전체 메뉴 닫기" : "전체 메뉴 열기";
    document.body.classList.toggle("menu-open", open);
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
  });
  document.addEventListener("click", (event) => {
    if (button?.getAttribute("aria-expanded") !== "true") return;
    if (!navigation?.contains(event.target) && !button.contains(event.target)) setMenu(false);
  });
  window.matchMedia("(min-width: 1040px)").addEventListener("change", (event) => {
    if (event.matches) setMenu(false);
  });

  document.querySelectorAll("[data-print]").forEach((printButton) => {
    printButton.addEventListener("click", () => window.print());
  });
})();
