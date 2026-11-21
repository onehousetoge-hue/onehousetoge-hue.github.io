// Offline only: capture the queued GA commands without loading Google's tag.
import fs from "node:fs";
import vm from "node:vm";
import test from "node:test";
import assert from "node:assert/strict";

const source = fs.readFileSync(new URL("../src/assets/analytics.js", import.meta.url), "utf8");
function visit(url, analyticsId = "G-58PJ9VG8GC") {
  const window = {};
  const scripts = [];
  const document = {
    currentScript: { dataset: { analyticsId } },
    referrer: "https://example.org/private?email=private@example.org#receipt",
    title: "한지붕",
    createElement: () => ({}),
    head: { appendChild: (script) => scripts.push(script) },
  };
  vm.runInNewContext(source, { window, document, URL, location: new URL(url) });
  return { commands: Array.from(window.dataLayer || [], (args) => Array.from(args)), scripts };
}

test("campaign and click parameters reach GA once, without inquiry data or fragments", () => {
  const params = new URLSearchParams({
    utm_source: "google", utm_medium: "cpc", utm_campaign: "hanjibung_grants",
    utm_id: "24356881358", utm_content: "828096696187", utm_term: "세대공감 프로그램",
    gclid: "test-click", gbraid: "test-braid", wbraid: "test-web-braid",
    dclid: "test-display", gad_source: "1", gad_campaignid: "24356881358",
    utm_source_platform: "google_ads", utm_creative_format: "text", utm_marketing_tactic: "search",
    name: "private-name", phone: "01000000000", email: "private@example.org",
    requestId: "private-receipt", address: "private-address", memo: "private-message",
    diagnosis: "1", utm_unknown: "private-value",
  });
  const { commands, scripts } = visit(`https://hanjibung.kr/reservation/?${params}#private-fragment`);
  const config = commands.find(([command, id]) => command === "config" && id === "G-58PJ9VG8GC")[2];
  const events = commands.filter(([command, name]) => command === "event" && name === "page_view");
  assert.equal(events.length, 1);
  assert.equal(events[0][2].page_location, config.page_location);
  const recorded = new URL(config.page_location);
  assert.equal(recorded.origin + recorded.pathname, "https://hanjibung.kr/reservation/");
  assert.equal(recorded.hash, "");
  for (const [name, value] of params) {
    const allowed = ["utm_id", "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term",
      "utm_source_platform", "utm_creative_format", "utm_marketing_tactic",
      "gclid", "dclid", "gbraid", "wbraid", "gad_source", "gad_campaignid"].includes(name);
    assert.equal(recorded.searchParams.get(name), allowed ? value : null, name);
  }
  assert.equal(config.page_referrer, "https://example.org");
  assert.equal(config.send_page_view, false);
  assert.equal(events[0][2].send_to, "G-58PJ9VG8GC");
  assert.equal(scripts.length, 1);
  assert.equal(scripts[0].src, "https://www.googletagmanager.com/gtag/js?id=G-58PJ9VG8GC");
  assert.equal(commands.some(([command, name]) => command === "event" && name === "conversion"), false);
});

test("direct and internal visits stay untagged; marketing values are not stored or added", () => {
  for (const url of ["https://hanjibung.kr/", "https://hanjibung.kr/consultation/?email=private@example.org#private",
    "https://hanjibung.kr/reservation/?utm_source=&utm_medium=&utm_campaign="]) {
    const { commands } = visit(url);
    const page = commands.find(([command, name]) => command === "event" && name === "page_view")[2];
    const input = new URL(url);
    assert.equal(page.page_location, input.origin + input.pathname);
    const consent = commands.find(([command]) => command === "consent")[2];
    assert.equal(consent.ad_storage, "denied");
    assert.equal(consent.ad_user_data, "denied");
    assert.equal(consent.ad_personalization, "denied");
  }
});

test("social UTM values and encoded Korean text survive, including ampersands", () => {
  const { commands } = visit("https://hanjibung.kr/?utm_source=instagram&utm_medium=social&utm_campaign=%EC%84%B8%EB%8C%80%EA%B3%B5%EA%B0%90&utm_content=a%26b%3Dc");
  const page = commands.find(([command, name]) => command === "event" && name === "page_view")[2];
  const params = new URL(page.page_location).searchParams;
  assert.equal(params.get("utm_source"), "instagram");
  assert.equal(params.get("utm_medium"), "social");
  assert.equal(params.get("utm_campaign"), "세대공감");
  assert.equal(params.get("utm_content"), "a&b=c");
  assert.equal(params.size, 4);
});

test("legacy links count only the final form as a page view", () => {
  for (const [alias, destination] of [["/?diagnosis=1", "/reservation/"], ["/reservation/?consultation=quick", "/consultation/"]]) {
    const origin = "https://hanjibung.kr";
    const intermediate = visit(origin + alias);
    assert.equal(intermediate.scripts.length, 0);
    const commands = [...intermediate.commands, ...visit(origin + destination).commands];
    const views = commands.filter(([command, event]) => command === "event" && event === "page_view");
    assert.deepEqual(views.map(([, , params]) => params.page_location), [origin + destination]);
  }
});

test("invalid measurement ID never initializes tracking", () => {
  assert.deepEqual(visit("https://hanjibung.kr/?utm_source=google", "invalid"), { commands: [], scripts: [] });
});
