import test from "node:test";
import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { fieldStories } from "../src/content/field-stories.mjs";
const route = href => readFile(new URL(`../dist${href}index.html`, import.meta.url), "utf8");

test("homepage exposes current activity, sourced news and practical resources before deep content", async () => {
  const html=await route("/");
  const section=html.match(/id="latest-updates"[\s\S]*?<\/section>/)?.[0];
  assert.ok(section);
  assert.equal((section.match(/class="home-update-card"/g)||[]).length,3);
  assert.ok(html.indexOf('id="latest-updates"')<html.indexOf('id="living-lab-title"'));
  for(const href of ["/activities/gyeongchun-line-field-counseling/","/activities/buramsan-housing-survey/","/activities/mbc-news-home-sharing/","/programs/housing-research/#progress","/guide/senior-empty-room/","/guide/youth-housing-checklist/","/resources/preparation-room/","/resources/#housing-reading"]) assert.ok(section.includes(`href="${href}"`));
  assert.match(section,/방송.*2026-09-12/);
  assert.doesNotMatch(section,/<iframe|<form|autoplay|보도자료 준비 중/);
});

test("five September records have distinct contents, period precision and working entry points", async () => {
  assert.equal(fieldStories.length, 5);
  const directory=await route("/activities/");
  const sitemap=await readFile(new URL("../dist/sitemap.xml",import.meta.url),"utf8");
  for(const item of fieldStories) {
    const html=await route(item.href);
    assert.ok(directory.includes(item.href));
    assert.ok(directory.includes(item.area));
    assert.ok(sitemap.includes(item.href));
    assert.ok(html.includes(item.takeaway));
    assert.ok(html.includes(`datetime="${item.date}"`));
    assert.equal((html.match(/<h1\b/g)||[]).length,1);
    assert.match(html,/입주자 연결·계약대행과 주택 방문상담은 제공하지 않습니다/);
    assert.match(html,/href="\/consultation\/"/);
    assert.match(html,/href="\/partnership\/"/);
    assert.doesNotMatch(html,/AI 사진|가상의 사진|가상 사진|홈투게더|<iframe\b|<form\b/);
    for(const part of item.sections) {
      assert.ok(html.includes(`id="${part.id}"`));
      assert.ok(html.includes(`href="#${part.id}"`));
      assert.ok(part.body.includes("<p>"));
    }
    if(!item.media) assert.equal(item.date,"2026-09");
  }
});
test("explanatory photos remain in a separate living-space section without event attribution", async () => {
  for(const item of fieldStories.filter(item=>item.illustration)) {
    const html=await route(item.href);
    assert.match(html,/aria-label="생활공간 이해하기"/);
    assert.ok(html.includes(item.illustration.caption));
    assert.ok(!/경춘선|불암산|경로당|공릉동|취재|주민과 상담/.test(item.illustration.alt+item.illustration.caption));
    assert.match(html,/width="1200" height="800"/);
    for(const suffix of [".jpg","-640.webp","-1200.webp"]) {
      const info=await stat(new URL(`../dist/assets/field-guides/${item.illustration.image}${suffix}`,import.meta.url));
      assert.ok(info.size>10000&&info.size<220000);
    }
  }
});
test("MBC record uses verified broadcast date and original links without fictional endorsement", async () => {
  const media=fieldStories.find(item=>item.media);
  const html=await route(media.href);
  assert.equal(media.date,"2026-09-12");
  assert.ok(html.includes("https://www.youtube.com/watch?v=DdCxyz9kNs4"));
  assert.ok(html.includes("https://imnews.imbc.com/replay/2026/nwdesk/article/6851406_37004.html"));
  assert.match(html,/대표자의 외부활동 기록/);
  assert.match(html,/스타트업 대표의 자격/);
  assert.match(html,/수행한 성과로 제시하는 것은 아닙니다/);
  assert.doesNotMatch(html,/2026-09-14|한지붕의 현장 활동이 MBC 뉴스에 소개됐습니다|<video|<iframe/);
  assert.equal(media.illustration,undefined);
});
