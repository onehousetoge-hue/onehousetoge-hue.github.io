import { readFileSync } from "node:fs";
import { site } from "../config/site.mjs";
import { incomeCalculator } from "./income-calculator.mjs";
import { rentFaqSection } from "./rent-faq.mjs";
import { headlineExperiment } from "./static-assets.mjs";

const section = name => readFileSync(new URL(`../content/host/${name}.html`, import.meta.url), "utf8").trim();

const headlines = `<h1 id="host-title">관리비 걱정은 <strong>이제 그만!</strong></h1>
        <template id="host-title-B">우리 집 빈 방 <strong>얼마 받을 수 있을까?</strong></template>
        <template id="host-title-C">혼자 계신 부모님께 <strong>드릴 수 있는 선물</strong></template>
        ${headlineExperiment}`;

export function roomCheckPage() {
  return `<div class="room-app">
    <div class="host-main">
      ${section("introduction").replace("<!-- headline-experiment -->", headlines)}
      ${section("process")}
      ${section("community")}
      ${section("story")}
      ${section("estimate")}
      ${section("checklist")}
      ${rentFaqSection()}
    </div>
    <footer class="host-footer">
      <div class="host-footer-inner">
        <div class="host-footer-identity"><strong>한지붕</strong><p>${site.legalType} · 고유번호 ${site.registrationNumber} · 대표 ${site.representative}</p><p>${site.address}</p><p>© 2026 hanjibung. All rights reserved.</p></div>
        <div class="host-footer-contact"><a href="${site.emailHref}">${site.email}</a><a href="${site.phoneHref}">${site.phone}</a><a href="/reservation/privacy/">개인정보 처리방침</a></div>
      </div>
    </footer>
    ${incomeCalculator()}
  </div>`;
}
