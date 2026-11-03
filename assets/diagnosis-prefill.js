(() => {
  "use strict";
  const key = "hanjibung:diagnosis-prefill:v1";
  const lifetime = 30 * 60 * 1000;
  const homeTypes = Object.freeze({ studio: "원룸", "two-room": "투룸 +", house: "단독 주택", apartment: "아파트" });
  function normalize(values) {
    const area = typeof values?.area === "string" ? values.area.trim().slice(0, 100) : "";
    const homeType = Object.hasOwn(homeTypes, values?.homeType) ? homeTypes[values.homeType] : (Object.values(homeTypes).includes(values?.homeType) ? values.homeType : "");
    let areaType = ["대학교", "지하철역"].includes(values?.areaType) ? values.areaType : "";
    if (!areaType && /역(?:\s*\d+번\s*출구)?$/.test(area)) areaType = "지하철역";
    if (!areaType && /(?:대학교|대학)(?:\s*\S*캠퍼스)?$/.test(area)) areaType = "대학교";
    return { area, areaType, homeType };
  }
  function clear() {
    try { window.sessionStorage.removeItem(key); } catch { /* Storage can be disabled. */ }
  }
  function save(values) {
    const draft = normalize(values);
    if (!draft.area && !draft.homeType) { clear(); return; }
    try { window.sessionStorage.setItem(key, JSON.stringify({ ...draft, savedAt: Date.now() })); } catch { /* The form remains usable without storage. */ }
  }
  function read() {
    try {
      const draft = JSON.parse(window.sessionStorage.getItem(key) || "null");
      if (!draft || !Number.isSafeInteger(draft.savedAt) || Date.now() - draft.savedAt > lifetime || draft.savedAt > Date.now()) { clear(); return null; }
      return normalize(draft);
    } catch { clear(); return null; }
  }
  window.hanjibungDiagnosisPrefill = Object.freeze({ save, read, clear, homeTypes });
})();
