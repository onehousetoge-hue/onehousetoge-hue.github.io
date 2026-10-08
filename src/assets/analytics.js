(() => {
  "use strict";

  // The parent records the homepage visit. The embedded room check forwards
  // only allowlisted form events so one visit creates one page_view.
  const analyticsId = document.currentScript?.dataset.analyticsId;
  if (!/^G-[A-Z0-9]{6,20}$/.test(analyticsId || "")) return;

  try {
    window.dataLayer ||= [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;
    let referrerOrigin = "";
    try { referrerOrigin = new URL(document.referrer).origin; } catch { /* Direct visit. */ }
    const pageContext = {
      page_location: location.origin + location.pathname,
      page_title: document.title,
      page_referrer: referrerOrigin,
    };
    gtag("consent", "default", {
      analytics_storage: "granted", ad_storage: "denied",
      ad_user_data: "denied", ad_personalization: "denied",
    });
    gtag("js", new Date());
    gtag("config", analyticsId, {
      ...pageContext,
      send_page_view: false,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      cookie_expires: 180 * 86400,
      cookie_update: false,
    });
    const tag = document.createElement("script");
    tag.async = true;
    tag.src = `https://www.googletagmanager.com/gtag/js?id=${analyticsId}`;
    document.head.appendChild(tag);
    gtag("event", "page_view", { ...pageContext, send_to: analyticsId });

    const roomFrame = document.querySelector(".room-check-frame");
    const roomOrigin = "https://hanjibung-room-check.hometo-kr.chatgpt.site";
    const inquiryEvents = new Set(["inquiry_open", "inquiry_start", "inquiry_photo_added", "inquiry_submit", "inquiry_complete", "inquiry_error"]);
    if (roomFrame) window.addEventListener("message", (event) => {
      if (event.origin !== roomOrigin || event.source !== roomFrame.contentWindow) return;
      const data = event.data;
      if (data?.type !== "hanjibung-room-analytics-v1" || !inquiryEvents.has(data.name)) return;
      const params = { send_to: analyticsId };
      if (Number.isInteger(data.photo_count) && data.photo_count >= 0 && data.photo_count <= 5) params.photo_count = data.photo_count;
      if (data.name === "inquiry_complete" && Number.isFinite(data.value) && data.value >= 0 && data.value <= 3600) params.value = data.value;
      if (data.name === "inquiry_error" && ["photo", "validation", "submission"].includes(data.error_stage)) params.error_stage = data.error_stage;
      gtag("event", data.name, params);
    });
  } catch { /* Visit analysis must not interrupt the site. */ }
})();
