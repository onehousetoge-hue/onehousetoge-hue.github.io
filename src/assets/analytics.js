(() => {
  "use strict";

  // The homepage and room diagnosis now run on the same origin.
  const analyticsId = document.currentScript?.dataset.analyticsId;
  if (!/^G-[A-Z0-9]{6,20}$/.test(analyticsId || "")) return;
  if (/^[ABC]$/.test(new URL(location.href || location.origin).searchParams.get("headline_preview") || "")) return;

  try {
    window.dataLayer ||= [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;
    let referrerOrigin = "";
    try { referrerOrigin = new URL(document.referrer).origin; } catch { /* Direct visit. */ }
    // Keep campaign attribution while excluding form fields, receipt IDs and
    // fragments from the URL sent to Analytics. Do not forward arbitrary queries.
    const pageUrl = new URL(location.origin + location.pathname);
    const landingParams = new URL(location.search || "", pageUrl).searchParams;
    const attributionParams = [
      "utm_id", "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content",
      "utm_source_platform", "utm_creative_format", "utm_marketing_tactic",
      "gclid", "dclid", "gbraid", "wbraid", "gad_source", "gad_campaignid",
    ];
    for (const name of attributionParams) {
      const value = landingParams.get(name);
      if (value && value.length <= 300 && !/[\u0000-\u001f<>@]|01[016789][ -]?\d{3,4}[ -]?\d{4}|\d{6}-[1-8]\d{6}/.test(value)) pageUrl.searchParams.set(name, value);
    }
    const pageContext = {
      page_location: pageUrl.href,
      page_title: document.title,
      page_referrer: referrerOrigin,
    };
    gtag("consent", "default", {
      analytics_storage: "granted", ad_storage: "denied",
      ad_user_data: "denied", ad_personalization: "denied",
    });
    gtag("js", new Date());
    // Preserve ad-click attribution on same-domain navigation without granting
    // advertising storage or sending inquiry fields to Google.
    gtag("set", "url_passthrough", true);
    gtag("config", analyticsId, {
      ...pageContext,
      send_page_view: false,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      cookie_expires: 180 * 86400,
      cookie_update: false,
    });
    // Website conversions: confirmed diagnosis and selected host consultations.
    const diagnosisAdsDestination = "AW-18497247404/MD8JCKK0_ZUdEKyxlvRE";
    const consultationAdsDestination = "AW-18497247404/YtwgCJGU_JUdEKyxlvRE";
    if (/^AW-\d+\/[A-Za-z0-9_-]+$/.test(diagnosisAdsDestination)) {
      const adsId = diagnosisAdsDestination.split("/")[0];
      gtag("config", adsId, {
        groups: ["hanjibung_ads"],
        send_page_view: false,
        allow_ad_personalization_signals: false,
      });
      const countedConversionIds = new Set();
      const trackConfirmedConversion = (destination, confirmedRequestId, onComplete) => {
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(confirmedRequestId || "")) return false;
        const key = destination + ":" + confirmedRequestId;
        if (countedConversionIds.has(key)) return false;
        const params = {
          send_to: destination,
          transaction_id: confirmedRequestId,
        };
        if (typeof onComplete === "function") {
          params.event_callback = onComplete;
          params.event_timeout = 1000;
        }
        gtag("event", "conversion", params);
        countedConversionIds.add(key);
        return true;
      };
      window.hanjibungTrackDiagnosisAdsConversion = (id) => trackConfirmedConversion(diagnosisAdsDestination, id);
      window.hanjibungTrackConsultationAdsConversion = (id) => new Promise((resolve) => {
        // Navigation may proceed even if gtag.js is blocked or its callback fails.
        let finished = false;
        const finish = () => { if (!finished) { finished = true; clearTimeout(timer); resolve(); } };
        const timer = setTimeout(finish, 1200);
        try { if (!trackConfirmedConversion(consultationAdsDestination, id, finish)) finish(); }
        catch { finish(); }
      });
    }
    const tag = document.createElement("script");
    tag.async = true;
    tag.src = `https://www.googletagmanager.com/gtag/js?id=${analyticsId}`;
    document.head.appendChild(tag);
    gtag("event", "page_view", { ...pageContext, send_to: analyticsId });

  } catch { /* Visit analysis must not interrupt the site. */ }
})();
