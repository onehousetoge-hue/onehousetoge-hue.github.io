(() => {
  "use strict";
  const root = document.querySelector(".room-app");
  if (!root) return;

  const currentUrl = new URL(window.location.href);
  if (currentUrl.searchParams.get("diagnosis") === "1") {
    currentUrl.searchParams.delete("diagnosis");
    currentUrl.pathname = "/reservation/";
    window.location.replace(currentUrl.href);
    return;
  }

  const nav = root.querySelector(".site-menu");
  const navToggle = root.querySelector(".nav-toggle");
  const goals = root.querySelector("#goals");
  const floating = root.querySelector(".floating-diagnosis");
  let framePending = false;

  function updateFloating() {
    framePending = false;
    if (!goals || !floating) return;
    const visible = goals.getBoundingClientRect().top <= window.innerHeight * .85
      && !nav?.classList.contains("is-open");
    floating.classList.toggle("is-visible", visible);
    floating.setAttribute("aria-hidden", String(!visible));
    floating.tabIndex = visible ? 0 : -1;
    floating.inert = !visible;
  }
  function scheduleFloating() {
    if (framePending) return;
    framePending = true;
    window.requestAnimationFrame(updateFloating);
  }
  function setMenu(open, restoreFocus = false) {
    if (!nav || !navToggle) return;
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.textContent = open ? "닫기" : "메뉴";
    nav.classList.toggle("is-open", open);
    if (open && nav.querySelectorAll(".nav-group").length === 1) nav.querySelector(".nav-group").open = true;
    if (!open) nav.querySelectorAll(".nav-group").forEach((group) => { group.open = false; });
    if (restoreFocus && navToggle.getClientRects().length) navToggle.focus();
    updateFloating();
  }

  navToggle?.addEventListener("click", () => {
    setMenu(navToggle.getAttribute("aria-expanded") !== "true");
  });
  window.addEventListener("scroll", () => {
    if (nav?.classList.contains("is-open")) setMenu(false);
    scheduleFloating();
  }, { passive: true });
  window.addEventListener("resize", scheduleFloating);
  window.addEventListener("pageshow", scheduleFloating);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav?.classList.contains("is-open")) setMenu(false, true);
    else if (e.key === "Escape") {
      const openGroup = nav?.querySelector(".nav-group[open]");
      if (openGroup) { openGroup.open = false; openGroup.querySelector("summary").focus(); }
    }
  });
  document.addEventListener("click", (e) => {
    if (nav && navToggle && !nav.contains(e.target) && !navToggle.contains(e.target)) setMenu(false);
  });
  window.matchMedia("(min-width: 981px)").addEventListener("change", (e) => {
    if (e.matches) setMenu(false);
  });
  root.querySelectorAll(".nav-group").forEach((group) => group.addEventListener("toggle", () => {
    if (group.open) root.querySelectorAll(".nav-group").forEach((other) => { if (other !== group) other.open = false; });
  }));
  updateFloating();
})();
