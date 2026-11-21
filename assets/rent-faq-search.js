(() => {
  "use strict";
  const faq = document.getElementById("rent-faq");
  if (!faq) return;
  const search = faq.querySelector(".rent-faq-search");
  const input = search.querySelector("input");
  const clear = search.querySelector("button");
  const status = search.querySelector('[role="status"]');
  const topics = faq.querySelector(".rent-faq-nav");
  const picks = faq.querySelector(".rent-faq-picks");
  const empty = faq.querySelector(".rent-faq-empty");

  function words(text) {
    return text.normalize("NFKC").toLowerCase().match(/[\p{L}\p{M}\p{N}]+/gu) || [];
  }

  const groups = Array.from(faq.querySelectorAll(".rent-faq-group"), group => ({
    element: group,
    questions: Array.from(group.querySelectorAll("details"), item => ({
      item,
      text: Array.from(item.querySelectorAll("h4, .rent-faq-answer p"), part => words(part.textContent).join("")).join(" "),
    })),
  }));
  let openedForSearch = null;

  function update() {
    const query = input.value.trim();
    const terms = words(query);
    const matches = [];
    for (const { element, questions } of groups) {
      let anyVisible = false;
      for (const { item, text } of questions) {
        const visible = !query || (terms.length > 0 && terms.every(term => text.includes(term)));
        item.hidden = !visible;
        if (visible) {
          anyVisible = true;
          matches.push(item);
        }
      }
      element.hidden = !anyVisible;
    }

    const single = query && matches.length === 1 ? matches[0] : null;
    if (openedForSearch && openedForSearch !== single) {
      openedForSearch.open = false;
      openedForSearch = null;
    }
    if (single && !single.open) {
      single.open = true;
      openedForSearch = single;
    }
    topics.hidden = Boolean(query);
    if (picks) picks.hidden = Boolean(query);
    empty.hidden = matches.length !== 0;
    clear.hidden = input.value.length === 0;
    const message = (query ? "검색 결과 " : "전체 ") + matches.length + "개";
    if (status.textContent !== message) status.textContent = message;
  }

  function reset() {
    input.value = "";
    update();
    input.focus();
  }

  function revealAnswer(hash) {
    const answer = document.getElementById(hash.slice(1));
    if (!answer?.classList.contains("rent-faq-answer")) return;
    if (input.value) {
      input.value = "";
      update();
    }
    answer.closest("details").open = true;
  }

  picks?.addEventListener("click", event => {
    const link = event.target.closest("a");
    if (link) revealAnswer(link.hash);
  });
  window.addEventListener("hashchange", () => revealAnswer(location.hash));

  input.addEventListener("input", event => { if (!event.isComposing) update(); });
  input.addEventListener("compositionend", update);
  input.addEventListener("keydown", event => {
    if (event.key === "Escape" && !event.isComposing && input.value) {
      event.preventDefault();
      reset();
    }
  });
  clear.addEventListener("click", reset);
  empty.querySelector("button").addEventListener("click", reset);
  update();
  revealAnswer(location.hash);
  search.hidden = false;
})();
