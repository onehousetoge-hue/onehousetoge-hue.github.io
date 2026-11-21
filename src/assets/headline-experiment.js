(() => {
  "use strict";
  const heading = document.getElementById("host-title");
  const params = new URLSearchParams(location.search);
  if (heading && params.get("diagnosis") === "1") return;

  const variants = ["A", "B", "C"];
  const preview = params.get("headline_preview");
  const isPreview = variants.includes(preview);
  const storageKey = "hanjibung.host-headline.v1";
  const storageTypes = ["localStorage", "sessionStorage"];
  let variant = isPreview ? preview : null;
  let assigned = false;

  if (!isPreview) {
    for (const type of storageTypes) {
      try {
        const saved = window[type].getItem(storageKey);
        if (variants.includes(saved)) { variant = saved; assigned = true; break; }
      } catch { /* Storage may be unavailable in a private browser. */ }
    }
    if (heading && !variant) {
      variant = variants[Math.floor(Math.random() * variants.length)];
      for (const type of storageTypes) {
        try {
          window[type].setItem(storageKey, variant);
          assigned = true;
          break;
        } catch { /* Try tab storage if persistent storage is blocked. */ }
      }
    }
  }
  if (!variant && heading) return;

  if (heading) {
    function showPart(element, templateId) {
      element.replaceChildren(document.getElementById(templateId).content.cloneNode(true));
    }
    if (variant !== "A") {
      showPart(heading, `host-title-${variant}`);
      showPart(document.getElementById("host-description"), `host-description-${variant}`);
    }
    // An inert template fetches only the image for the assigned experience.
    showPart(document.getElementById("host-visual"), `host-visual-${variant}`);
  }
  if (isPreview) {
    document.addEventListener("DOMContentLoaded", () => {
      for (const link of document.querySelectorAll('a[href^="/"]:not([href^="//"])')) {
        const destination = new URL(link.href);
        if (!["/", "/about/", "/how-it-works/", "/consultation/", "/reservation/", "/rooms/register/", "/reservation/privacy/"].includes(destination.pathname)) continue;
        destination.searchParams.set("headline_preview", variant);
        link.search = destination.search;
      }
    }, { once: true });
    return;
  }
  if (heading && !assigned) return;

  function track(step, group) {
    try {
      const id = document.querySelector("script[data-analytics-id]")?.dataset.analyticsId;
      if (/^G-[A-Z0-9]{6,20}$/.test(id || "") && typeof window.gtag === "function") {
        window.gtag("event", `headline_${step}_${group.toLowerCase()}`, { send_to: id });
      }
    } catch { /* Analytics must not interrupt the page or a confirmed application. */ }
  }
  if (heading) {
    document.addEventListener("DOMContentLoaded", () => {
      const recordView = () => {
        const { top, bottom } = heading.getBoundingClientRect();
        if (document.hidden || bottom <= 0 || top >= window.innerHeight) return;
        document.removeEventListener("visibilitychange", recordView);
        window.removeEventListener("scroll", recordView);
        window.removeEventListener("resize", recordView);
        window.hanjibungLeadVisit?.expose(variant);
        track("view", variant);
      };
      document.addEventListener("visibilitychange", recordView);
      window.addEventListener("scroll", recordView, { passive: true });
      window.addEventListener("resize", recordView);
      recordView();
    }, { once: true });
  } else {
    window.hanjibungTrackHeadlineCompletion = (record, kind = "diagnosis") => {
      const step = { diagnosis: "complete", callback: "callback", registration: "registration" }[kind];
      if (step && /^[ABC]$/.test(record?.variant || "")) track(step, record.variant);
    };
  }
})();
