(() => {
  "use strict";

  // The homepage and room diagnosis now run on the same origin.
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

  } catch { /* Visit analysis must not interrupt the site. */ }
})();
