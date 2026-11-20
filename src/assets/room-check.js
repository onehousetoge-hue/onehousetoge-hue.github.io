(() => {
  "use strict";
  const root = document.querySelector(".room-app");
  if (!root) return;

  const currentUrl = new URL(window.location.href);
  if (currentUrl.searchParams.get("diagnosis") === "1") {
    currentUrl.searchParams.delete("diagnosis");
    currentUrl.pathname = "/reservation/";
    window.location.replace(currentUrl.href);
  }
})();
