import { spawnSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";

const bin = process.env.AGENT_BROWSER_BIN;
if (!bin) throw new Error("AGENT_BROWSER_BIN is required");
const base = process.env.QA_BASE_URL || "http://127.0.0.1:4178";
const session = process.env.QA_BROWSER_SESSION || "hanjibung-qa";
const output = path.resolve(process.env.QA_OUTPUT || "../.qa-runtime/browser-report");
await mkdir(output, { recursive: true });
function browser(...args) {
  const result = spawnSync(bin, ["--session", session, "--json", ...args], { encoding: "utf8", timeout: 40000, windowsHide: true });
  if (result.status !== 0) throw new Error(result.stderr || result.stdout || "Browser command failed");
  const json = JSON.parse(result.stdout);
  if (!json.success) throw new Error(JSON.stringify(json.error));
  return json.data;
}
function evaluate(code) {
  const data = browser("eval", code);
  return data.result;
}
function openPage(route) {
  browser("open", `${base}${route}`);
  browser("wait", "--load", "networkidle");
  browser("wait", "h1");
}
const manifest = JSON.parse(await readFile("dist/build-manifest.json", "utf8"));
const routes = manifest.pages.filter((page) => page.indexable).map((page) => page.route);
const results = [];
for (const width of [320, 390, 1440]) {
  browser("set", "viewport", String(width), "900");
  for (const route of routes) {
    openPage(route);
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
    results.push(item);
    console.log(`${width}px ${route}: layout${width === 390 ? " + axe" : ""} passed`);
  }
}
browser("set", "viewport", "390", "844");
openPage("/");
assert.equal(evaluate("Boolean(document.querySelector('.nav-toggle, [data-menu-button]'))"), false);
openPage("/reservation/");
browser("click", "[data-open-callback]");
assert.equal(evaluate("document.querySelector('[data-callback-dialog]').open"), true);
browser("press", "Escape");
assert.equal(evaluate("document.querySelector('[data-callback-dialog]').open"), false);
const statuses = [];
for (const route of ["/", "/reservation/", "/reservation/privacy/", "/about/", "/contact/", "/privacy/", "/thanks/consultation/", "/thanks/partnership/", "/daily-word.html", "/fortune.html", "/meeting.html", "/does-not-exist/"]) {
  const response = await fetch(`${base}${route}`);
  const expected = routes.includes(route) ? 200 : 404;
  assert.equal(response.status, expected, route);
  const html = await response.text();
  if (expected === 404) assert.ok(html.includes('name="robots" content="noindex,nofollow"'));
  statuses.push({ route, status: response.status });
}
const errors = browser("errors");
assert.deepEqual(errors.errors, [], "Browser errors detected");
await writeFile(path.join(output, "results.json"), JSON.stringify({ checkedAt: new Date().toISOString(), base, results, statuses, errors, functionality: "retired menu, quick consultation, active routes and 404 responses" }, null, 2));
console.log(`Browser QA passed: ${results.length} viewport checks; ${routes.length} axe checks; interactions and status codes.`);
