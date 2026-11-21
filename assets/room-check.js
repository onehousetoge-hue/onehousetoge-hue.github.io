(() => {
  "use strict";
  const target = new URL(window.location.href);
  const originalPath = target.pathname;
  if (target.pathname === "/" && target.searchParams.get("diagnosis") === "1") {
    target.searchParams.delete("diagnosis");
    target.pathname = "/reservation/";
  }
  if (target.pathname === "/reservation/" && target.searchParams.get("consultation") === "quick") {
    target.searchParams.delete("consultation");
    target.pathname = "/consultation/";
  }
  if (target.pathname === originalPath) return;
  window.hanjibungRedirecting = true;
  // A browser redirect may replace the external referrer with our own address.
  if (!/^[ABC]$/.test(target.searchParams.get("headline_preview") || "")) {
    try {
      const source = new URL(document.referrer);
      if (["https:", "http:"].includes(source.protocol) && source.origin !== target.origin) {
        window.sessionStorage.setItem("hanjibung.redirect-referrer.v1", JSON.stringify({
          origin: source.origin, path: target.pathname, at: Date.now(),
        }));
      }
    } catch { /* A direct visit or blocked storage still redirects. */ }
  }
  window.location.replace(target.href);
})();
