(() => {
  "use strict";
  const root = document.getElementById("rent-faq");
  if (!root) return;

  const search = root.querySelector(".host-faq-search");
  const input = search.querySelector("input");
  const clear = search.querySelector("[data-faq-clear]");
  const status = search.querySelector('[role="status"]');
  const filters = root.querySelector(".host-faq-chips");
  const chips = Array.from(filters.querySelectorAll("button"));
  const results = root.querySelector("#rent-faq-results");
  const empty = root.querySelector(".host-faq-empty");
  const taxNotice = root.querySelector(".host-faq-tax-notice");
  const normalize = text => text.normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "");
  const items = Array.from(results.querySelectorAll("details"), element => ({
    element,
    category: element.dataset.category,
    text: normalize(element.textContent),
  }));
  let category = "all";

  function applyFilters() {
    const terms = input.value.trim().split(/\s+/).map(normalize).filter(Boolean);
    let count = 0;
    chips.forEach(chip => chip.setAttribute("aria-pressed", String(chip.dataset.category === category)));
    items.forEach(({ element, category: group, text }) => {
      const visible = (category === "all" || category === group) && terms.every(term => text.includes(term));
      element.hidden = !visible;
      if (visible) count++;
    });
    clear.hidden = !input.value;
    empty.hidden = count !== 0;
    results.hidden = count === 0;
    taxNotice.hidden = count === 0 || (category !== "tax" && category !== "all") || terms.length > 0;
    status.textContent = terms.length || category !== "all" ? `${count}개 질문` : "";
  }

  function selectCategory(key) {
    category = key;
    applyFilters();
  }

  // Resolve links shared from the checklist, individual answers, and the previous homepage.
  const formerGroups = { "faq-costs": "contract", "faq-application": "service", "faq-move-in": "living", "faq-living": "living", "faq-tax": "tax" };
  const formerQuestions = {
    "faq-rent-estimate": "faq-host-payout", "faq-utilities": "faq-host-payout", "faq-after-estimate": "faq-registration-steps",
    "faq-room-furniture": "faq-room-preparation", "faq-air-conditioning": "faq-room-preparation", "faq-photos-address": "faq-registration-steps",
    "faq-visit-area": "faq-registration-steps", "faq-consultation-options": "faq-registration-steps",
  };
  function followHash() {
    const hash = location.hash.slice(1);
    const chip = chips.find(item => item.id === hash || item.dataset.category === formerGroups[hash]);
    const item = items.find(({ element }) => element.id === (formerQuestions[hash] || hash));
    if (!chip && !item) {
      if (!hash || hash === "rent-faq" || hash === "faq") selectCategory("all");
      return;
    }
    input.value = "";
    selectCategory(chip?.dataset.category || item.category);
    if (item) item.element.open = true;
    (item?.element || chip).scrollIntoView({ block: "start" });
  }

  filters.addEventListener("click", event => {
    const chip = event.target.closest("button[data-category]");
    if (!chip) return;
    history.replaceState(history.state, "", "#" + chip.id);
    selectCategory(chip.dataset.category);
  });
  input.addEventListener("input", applyFilters);
  clear.addEventListener("click", () => { input.value = ""; applyFilters(); input.focus(); });
  empty.querySelector("button").addEventListener("click", () => {
    input.value = "";
    history.replaceState(history.state, "", "#rent-faq");
    selectCategory("all");
    input.focus();
  });
  window.addEventListener("hashchange", followHash);
  document.querySelectorAll(".host-faq-category-link").forEach(link => {
    link.addEventListener("click", () => { if (link.hash === location.hash) followHash(); });
  });
  search.hidden = false;
  filters.hidden = false;
  applyFilters();
  followHash();
})();
