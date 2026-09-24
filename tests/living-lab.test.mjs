import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { preparationQuestions, preparationResult, summarizeCosts, costItems } from "../src/assets/living-lab.mjs";

test("preparation requires known choices and rejects unexpected values", () => {
  assert.equal(preparationResult({}).missing.length, 4);
  assert.deepEqual(preparationResult({ perspective: "resident", decision: "pause", concern: "privacy", next: "evil" }).missing, ["next"]);
});
test("all 192 preparation paths generate specific questions and safe internal links", () => {
  let count = 0;
  for (const [perspective] of preparationQuestions[0].options) for (const [decision] of preparationQuestions[1].options) for (const [concern] of preparationQuestions[2].options) for (const [next] of preparationQuestions[3].options) {
    const result = preparationResult({ perspective, decision, concern, next });
    assert.equal(result.complete, true);
    assert.equal(result.answers.length, 4);
    assert.ok(result.topic.question.length > 20);
    assert.match(result.topic.href, /^\/resources\//);
    assert.match(result.next.href, /^\/(resources|programs)\//);
    if (decision === "pause") assert.match(result.notes[0], /함께 살지 않는 선택/);
    if (decision === "disagree") assert.match(result.notes[0], /보류/);
    count++;
  }
  assert.equal(count, 192);
});
test("unknown costs are not represented as a complete zero-cost budget", () => {
  const result = summarizeCosts({});
  assert.equal(result.total, 0);
  assert.equal(result.complete, false);
  assert.equal(result.unknown.length, 6);
});
test("cost sum distinguishes known, included and unknown amounts", () => {
  const result = summarizeCosts({ rent: { mode: "known", amount: "300000" }, management: { mode: "known", amount: "50000" }, internet: { mode: "included", amount: "99999" }, supplies: { mode: "known", amount: "0" } });
  assert.equal(result.total, 350000);
  assert.deepEqual(result.unknown, ["전기·수도·가스", "통학·출퇴근 교통비"]);
  assert.deepEqual(result.included, ["인터넷"]);
});
test("empty, negative, decimal, exponential, oversized and malformed numbers are rejected", () => {
  for (const amount of ["", "-1", "1.5", "1e6", "100000000", "10,000", "Infinity", "<script>"]) {
    assert.deepEqual(summarizeCosts({ rent: { mode: "known", amount } }).invalid, ["rent"]);
  }
  const rows = Object.fromEntries(costItems.map(([id]) => [id, { mode: "known", amount: "99999999" }]));
  assert.equal(summarizeCosts(rows).total, 599999994);
  assert.equal(summarizeCosts(rows).complete, true);
});
test("educational tools cannot send data, store input, or manufacture conversion events", async () => {
  const js = await readFile(new URL("../src/assets/living-lab.mjs", import.meta.url), "utf8");
  assert.doesNotMatch(js, /fetch\s*\(|XMLHttpRequest|sendBeacon|localStorage|sessionStorage|document\.cookie|dataLayer|gtag|innerHTML/);
});
test("new original pages have complete HTML, printable outcomes and honest scope", async () => {
  for (const slug of ["preparation-room", "conversation-practice", "living-cost-planner", "community-session-kit"]) {
    const html = await readFile(new URL(`../dist/resources/${slug}/index.html`, import.meta.url), "utf8");
    assert.match(html, /<h1>/);
    assert.match(html, /입주자 연결·계약대행은 제공하지 않습니다/);
    assert.match(html, /자동 저장하지 않습니다/);
    assert.match(html, /작성: 한지붕/);
    assert.match(html, /외부 전문가 검수나/);
    assert.doesNotMatch(html, /<form\b/);
    assert.match(html, /<script type="module" src="\/assets\/living-lab\.mjs\?v=/);
    assert.match(html, /data-print/);
  }
  const practice = await readFile(new URL("../dist/resources/conversation-practice/index.html", import.meta.url), "utf8");
  assert.equal((practice.match(/class="lab-scenario"/g) || []).length, 4);
  assert.match(practice, /실제 참여자의 발언이나 활동 성과가 아닙니다/);
  const session = await readFile(new URL("../dist/resources/community-session-kit/index.html", import.meta.url), "utf8");
  assert.match(session, /실제로 개최한 행사나 확정 모집 공고가 아닙니다/);
});
test("home and directory expose the new tools without replacing historical six-resource counts", async () => {
  for (const relative of ["index.html", "resources/index.html"]) {
    const html = await readFile(new URL(`../dist/${relative}`, import.meta.url), "utf8");
    assert.match(html, /공동생활 준비실/);
    for (const slug of ["preparation-room", "conversation-practice", "living-cost-planner", "community-session-kit"]) assert.ok(html.includes(`/resources/${slug}/`));
    assert.match(html, /6종/);
  }
});
