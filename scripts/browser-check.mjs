import { spawnSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";

const bin = process.env.AGENT_BROWSER_BIN;
if (!bin) throw new Error("AGENT_BROWSER_BIN is required");
const base = process.env.QA_BASE_URL || "http://127.0.0.1:4178";
const output = path.resolve(process.env.QA_OUTPUT || "../.qa-runtime/browser-report");
await mkdir(output, { recursive: true });
function browser(...args) {
  const result = spawnSync(bin, ["--session", "hanjibung-qa", "--json", ...args], { encoding: "utf8", timeout: 40000, windowsHide: true });
  if (result.status !== 0) throw new Error(result.stderr || result.stdout || "Browser command failed");
  const json = JSON.parse(result.stdout);
  if (!json.success) throw new Error(JSON.stringify(json.error));
  return json.data;
}
function evaluate(code) {
  const data = browser("eval", code);
  return data.result;
}
const manifest = JSON.parse(await readFile("dist/build-manifest.json", "utf8"));
const routes = manifest.pages.filter((page) => page.indexable).map((page) => page.route);
const results = [];
for (const width of [320, 390, 1440]) {
  browser("set", "viewport", String(width), "900");
  for (const route of routes) {
    browser("open", `${base}${route}`);
    const dimensions = evaluate("({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,bodyFont:getComputedStyle(document.body).fontSize,h1:document.querySelector('h1')?.innerText,errors:document.querySelector('.vite-error-overlay, [data-nextjs-dialog]')!==null})");
    assert.ok(dimensions?.h1, `Missing content ${route}`);
    assert.ok(dimensions.scrollWidth <= width, `Horizontal overflow ${width} ${route}: ${JSON.stringify(dimensions)}`);
    assert.equal(dimensions.errors, false);
    assert.ok(Number.parseInt(dimensions.bodyFont, 10) >= 20);
    const item = { route, width, dimensions };
    if (width === 390) {
      const audit = browser("a11y");
      item.accessibility = audit;
      assert.equal(audit.violations.length, 0, `Axe violations ${route}: ${JSON.stringify(audit.violations)}`);
    }
    if (["/", "/contact/", "/resources/family-checklist/", "/resources/private-common-space/"].includes(route)) {
      const name = route === "/" ? "home" : route.split("/").filter(Boolean).at(-1);
      browser("screenshot", path.join(output, `${name}-${width}.png`));
    }
    results.push(item);
    console.log(`${width}px ${route}: layout${width === 390 ? " + axe" : ""} passed`);
  }
}
browser("set", "viewport", "390", "844");
browser("open", `${base}/resources/conflict-prevention/`);
browser("snapshot", "-i");
browser("fill", "#conflict-fact", "검증용 메모: 생활시간을 함께 확인하기");
browser("check", "#conflict-check-0");
assert.equal(evaluate("document.querySelector('[data-check-progress]').textContent"), "1 / 4개 확인");
assert.equal(evaluate("document.querySelector('[data-print-answer]').textContent"), "검증용 메모: 생활시간을 함께 확인하기");
assert.equal(evaluate("localStorage.length + sessionStorage.length"), 0);
browser("click", "summary");
assert.equal(evaluate("document.querySelector('.resource-details').open"), true);
browser("press", "Enter");
assert.equal(evaluate("document.querySelector('.resource-details').open"), false);
evaluate("window.__printCalls=0;window.print=()=>{window.__printCalls++;window.dispatchEvent(new Event('beforeprint'));}; true");
browser("click", "[data-print]");
assert.equal(evaluate("window.__printCalls"), 1);
assert.equal(evaluate("document.querySelector('.resource-details').open"), true);
evaluate("window.dispatchEvent(new Event('afterprint')); true");
assert.equal(evaluate("document.querySelector('.resource-details').open"), false);
browser("click", "[data-menu-button]");
assert.equal(evaluate("document.querySelector('main').inert"), true);
browser("focus", "[data-navigation] > .button");
browser("press", "Tab");
assert.equal(evaluate("document.activeElement.hasAttribute('data-menu-button')"), true);
browser("press", "Shift+Tab");
assert.equal(evaluate("document.activeElement===document.querySelector('[data-navigation] > a')"), true);
browser("press", "Escape");
assert.equal(evaluate("document.activeElement.hasAttribute('data-menu-button')"), true);
assert.equal(evaluate("document.querySelector('main').inert"), false);
browser("open", `${base}/programs/senior-home-consulting/`);
browser("snapshot", "-i");
browser("focus", ".faq summary");
browser("press", "Enter");
assert.equal(evaluate("document.querySelector('.faq details').open"), true);
browser("open", `${base}/contact/`);
const contacts = evaluate("[...document.querySelectorAll('.contact-card a')].map(a=>a.getAttribute('href'))");
assert.deepEqual(contacts, ["tel:+821045879428", "mailto:onehousetoge@gmail.com"]);
const statuses = [];
for (const route of ["/", "/contact/", "/thanks/consultation/", "/thanks/partnership/", "/daily-word.html", "/fortune.html", "/meeting.html", "/does-not-exist/"]) {
  const response = await fetch(`${base}${route}`);
  const expected = ["/", "/contact/"].includes(route) ? 200 : 404;
  assert.equal(response.status, expected, route);
  const html = await response.text();
  if (expected === 404) assert.ok(html.includes('name="robots" content="noindex,nofollow"'));
  statuses.push({ route, status: response.status });
}
const errors = browser("errors");
assert.deepEqual(errors.errors, [], "Browser errors detected");
await writeFile(path.join(output, "results.json"), JSON.stringify({ checkedAt: new Date().toISOString(), base, results, statuses, contacts, errors, functionality: "memo, checklist, print callback + mirrors, details, menu focus trap, Escape, FAQ keyboard", limitations: "전화 발신·이메일 전송을 실행하지 않음. 인쇄 대화상자 호출은 대체함; 실제 종이 출력은 확인하지 않음." }, null, 2));
console.log(`Browser QA passed: ${results.length} viewport checks; ${routes.length} axe checks; interactions and status codes.`);
