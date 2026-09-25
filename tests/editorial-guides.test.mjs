import test from "node:test";
import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { editorialGuides } from "../src/content/editorial-guides.mjs";
const readRoute = href => readFile(new URL(`../dist${href}index.html`, import.meta.url), "utf8");

test("five requested editorial routes preserve distinct content, captions and working reading paths", async () => {
  assert.equal(editorialGuides.length, 5);
  const sitemap = await readFile(new URL("../dist/sitemap.xml", import.meta.url), "utf8");
  for (const article of editorialGuides) {
    const html = await readRoute(article.href);
    assert.ok(sitemap.includes(`https://hanjibung.kr${article.href}`));
    assert.ok(html.includes(article.title));
    assert.ok(html.includes(article.outcome));
    assert.ok(html.includes(article.caption));
    assert.equal((html.match(/<h1\b/g) || []).length, 1);
    assert.match(html, /data-print/);
    assert.match(html, /입주자 연결·계약대행은 제공하지 않습니다/);
    assert.doesNotMatch(html, /<form\b|신청이 완료|AI 사진|가상의 사진|실제 주택 사례/);
    for (const section of article.sections) {
      assert.ok(html.includes(`href="#${section.id}"`));
      assert.ok(html.includes(`id="${section.id}"`));
      assert.ok(section.body.includes("<p>") || section.body.includes("<ul>"));
    }
    for (const href of article.related) assert.ok(html.includes(`href="${href}"`));
    for (const suffix of [".jpg", "-640.webp", "-1200.webp"]) {
      const info=await stat(new URL(`../dist/assets/guides/${article.image}${suffix}`, import.meta.url));
      assert.ok(info.size > 10000 && info.size < 200000);
      assert.ok(html.includes(`/assets/guides/${article.image}${suffix}`));
    }
    assert.match(html, /width="1200" height="800"/);
    assert.match(html, /loading="eager" fetchpriority="high"/);
  }
});
test("research essay distinguishes question themes, current progress and contact from submitted responses", async () => {
  const html=await readRoute("/research/housing-coexistence/");
  assert.match(html, /통계 결과 보고서가 아닙니다/);
  assert.match(html, /문의만으로 조사 참여가 완료되지는 않습니다/);
  assert.match(html, /href="\/programs\/housing-research\/"/);
  assert.match(html, /href="\/contact\/">조사 참여 방법 문의/);
});
test("guides are reachable from home and directory without replacing existing resources", async () => {
  const home=await readRoute("/");
  const directory=await readRoute("/resources/");
  assert.match(home, /href="\/resources\/#housing-reading"/);
  for (const article of editorialGuides) assert.ok(directory.includes(article.href));
  assert.match(directory, /직접 작성하는 생활자료 6종/);
  for (const label of ["한지붕 소개", "우리가 하는 일", "주거정보", "조사·연구", "활동기록", "참여하기"]) assert.ok(home.includes(`>${label}</a>`));
  assert.match(home, /href="\/transparency\/">운영·투명성/);
  const guide=await readRoute("/guide/senior-empty-room/");
  assert.match(guide, /href="\/resources\/" aria-current="page">주거정보/);
});
