(() => {
  "use strict";

  // Keep the first landing in this tab. A fresh external arrival or tagged
  // campaign starts a new visit. Only public route labels leave the browser.
  const key = "hanjibung.lead-visit.v1";
  const idleLimit = 30 * 60 * 1000;
  const publicPaths = ["/", "/reservation/", "/reservation/privacy/"];
  const current = new URL(location.href);
  const route = publicPaths.includes(current.pathname) ? current.pathname : "";
  const preview = /^[ABC]$/.test(current.searchParams.get("headline_preview") || "");
  function campaignValue(name) {
    const value = (current.searchParams.get(name) || "").trim();
    return value.length <= 100 && !/^[=+@-]|[\u0000-\u001f<>@]|01[016789][ -]?\d{3,4}[ -]?\d{4}|\d{6}[- ]?[1-8]\d{6}/.test(value) ? value : "";
  }
  function referrerHost() {
    try {
      const ref = new URL(document.referrer);
      if (["http:", "https:"].includes(ref.protocol) && ref.origin !== current.origin &&
          !["hanjibung.kr", "www.hanjibung.kr"].includes(ref.hostname)) return ref.hostname.slice(0, 180);
    } catch { /* Direct visits have no referrer. */ }
    return "";
  }
  if (route && !preview) {
    const hostname = referrerHost();
    const campaign = Object.fromEntries(["source", "medium", "campaign", "id", "content", "term"]
      .map((name) => [name, campaignValue("utm_" + name)]));
    const tagged = Object.values(campaign).some(Boolean);
    const googleAd = ["gclid","gbraid","wbraid","dclid"].some((name) => current.searchParams.has(name));
    let visit;
    try { visit = JSON.parse(window.sessionStorage.getItem(key)); } catch { /* Memory-only visit. */ }
    const now = Date.now();
    const timedOut = () => !visit || Date.now() - visit.touched >= idleLimit;
    function newVisit() {
      return { landing: route, referrer: hostname, variant: "", ...campaign,
        source: campaign.source || (googleAd ? "google" : hostname || (tagged ? "(not set)" : "(direct)")),
        medium: campaign.medium || (googleAd ? "cpc" : hostname ? "referral" : (tagged ? "(not set)" : "(none)")), touched: now };
    }
    // A reload or back navigation retains the original visit, including on a tagged landing.
    const nav = window.performance?.getEntriesByType?.("navigation")[0]?.type;
    if (timedOut() || (!["reload", "back_forward"].includes(nav) && (tagged || hostname || googleAd))) visit = newVisit();
    function persist() {
      visit.touched = Date.now();
      try { window.sessionStorage.setItem(key, JSON.stringify(visit)); } catch { /* Still works on this page. */ }
    }
    persist();
    window.hanjibungLeadVisit = {
      expose(variant) {
        if (route === "/" && /^[ABC]$/.test(variant)) {
          if (timedOut()) visit = newVisit();
          visit.variant = variant; persist();
        }
      },
      snapshot() {
        if (timedOut()) visit = newVisit();
        persist();
        const { touched, ...record } = visit;
        return record;
      },
    };
  }

  // Keep reading-position jumps usable under the sticky header, including with a keyboard.
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", () => {
      const target = document.getElementById(decodeURIComponent(link.hash.slice(1)));
      if (!target) return;
      if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    });
  });
})();
