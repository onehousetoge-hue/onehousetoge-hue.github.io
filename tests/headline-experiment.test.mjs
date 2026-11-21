import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

const source = readFileSync(new URL("../src/assets/headline-experiment.js", import.meta.url), "utf8");
const measurementId = "G-58PJ9VG8GC";

function storage() {
  const values = new Map();
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
}

function visit({ home = true, search = "", random = 0, local = storage(), session = storage(), hidden = false, top = 0 } = {}) {
  const events = [];
  const window = Object.assign(new EventTarget(), {
    innerHeight: 800, localStorage: local, sessionStorage: session,
    gtag: (command, name, params) => events.push([command, name, ...Object.entries(params)]),
  });
  const heading = {
    variant: "A", top,
    getBoundingClientRect() { return { top: this.top, bottom: this.top + 80 }; },
    replaceChildren(variant) { this.variant = variant; },
  };
  const description = { variant: "A", replaceChildren(variant) { this.variant = variant; } };
  const visual = { variant: null, replaceChildren(variant) { this.variant = variant; } };
  const link = new URL("https://hanjibung.kr/reservation/");
  const quickLink = new URL("https://hanjibung.kr/reservation/?consultation=quick#quick-consultation");
  const privacyLink = new URL("https://hanjibung.kr/reservation/privacy/");
  const document = Object.assign(new EventTarget(), {
    hidden,
    getElementById(id) {
      if (id === "host-title") return home ? heading : null;
      if (id === "host-description") return description;
      if (id === "host-visual") return visual;
      assert.match(id, /^host-(?:(?:title|description)-[BC]|visual-[ABC])$/);
      return { content: { cloneNode: () => id.at(-1) } };
    },
    querySelector: () => ({ dataset: { analyticsId: measurementId } }),
    querySelectorAll: () => [link, quickLink, privacyLink],
  });
  vm.runInNewContext(source, { document, window, location: { search }, URL, URLSearchParams,
    Math: { floor: Math.floor, random: () => random } });
  document.dispatchEvent(new Event("DOMContentLoaded"));
  return { window, document, events, heading, visual, description, link, quickLink, privacyLink };
}

test("three equal ranges choose the headline once and keep it across visits and the form", () => {
  for (const [random, variant] of [[0, "A"], [1 / 3 - 0.00001, "A"], [1 / 3, "B"], [2 / 3 - 0.00001, "B"], [2 / 3, "C"], [0.99999, "C"]]) {
    const local = storage();
    const first = visit({ random, local });
    assert.equal(first.heading.variant, variant);
    assert.deepEqual(first.events, [["event", "headline_view_" + variant.toLowerCase(), ["send_to", measurementId]]]);
    assert.equal(visit({ random: (random + 0.5) % 1, local }).heading.variant, variant);
    const form = visit({ home: false, local });
    assert.equal(form.events.length, 0);
    form.window.hanjibungTrackHeadlineCompletion({ variant });
    assert.deepEqual(form.events, [["event", "headline_complete_" + variant.toLowerCase(), ["send_to", measurementId]]]);
  }
});

test("previews preserve normal assignment and exclude the whole preview journey from the experiment", () => {
  const local = storage();
  assert.equal(visit({ random: 0.5, local }).heading.variant, "B");
  for (const variant of ["A", "B", "C"]) {
    const page = visit({ local, search: "?headline_preview=" + variant });
    assert.equal(page.heading.variant, variant);
    assert.equal(page.description.variant, variant);
    assert.equal(page.visual.variant, variant);
    assert.deepEqual(page.events, []);
    assert.equal(page.link.search, "?headline_preview=" + variant);
    assert.equal(page.quickLink.href, "https://hanjibung.kr/reservation/?consultation=quick&headline_preview=" + variant + "#quick-consultation");
    assert.equal(page.privacyLink.search, "?headline_preview=" + variant);
    assert.equal(visit({ home: false, local, search: page.link.search }).window.hanjibungTrackHeadlineCompletion, undefined);
  }
  assert.equal(visit({ local }).heading.variant, "B");
  const fresh = storage();
  visit({ local: fresh, search: "?headline_preview=C" });
  visit({ local: fresh, search: "?diagnosis=1" });
  const directForm = visit({ home: false, local: fresh });
  directForm.window.hanjibungTrackHeadlineCompletion({});
  assert.deepEqual(directForm.events, []);
  assert.equal(visit({ local: fresh, search: "?headline_preview=unknown", random: 0.4 }).heading.variant, "B");
});

test("a visible headline generates one exposure; unavailable storage still allows the page to work", () => {
  const page = visit({ hidden: true, top: -200 });
  assert.deepEqual(page.events, []);
  page.document.hidden = false;
  page.document.dispatchEvent(new Event("visibilitychange"));
  assert.deepEqual(page.events, []);
  page.heading.top = 100;
  page.window.dispatchEvent(new Event("scroll"));
  page.window.dispatchEvent(new Event("resize"));
  assert.equal(page.events.length, 1);

  const blocked = { getItem() { throw Error("blocked"); }, setItem() { throw Error("blocked"); } };
  const session = storage();
  assert.equal(visit({ local: blocked, session, random: 0.9 }).heading.variant, "C");
  assert.equal(visit({ local: blocked, session }).heading.variant, "C");
  const noStorage = visit({ local: blocked, session: blocked, random: 0.5 });
  assert.equal(noStorage.heading.variant, "B");
  assert.deepEqual(noStorage.events, []);
});
