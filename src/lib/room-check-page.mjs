import { readFileSync } from "node:fs";
import { site } from "../config/site.mjs";
import { incomeCalculator } from "./income-calculator.mjs";
import { rentFaqSection } from "./rent-faq.mjs";
import { headlineExperiment } from "./static-assets.mjs";

const section = name => readFileSync(new URL(`../content/host/${name}.html`, import.meta.url), "utf8").trim();

const heroVariants = {
  A: {
    title: "관리비 걱정은 <strong>이제 그만!</strong>",
    description: "비어 있는 방을 대학생에게 내어주고,<br>매달 받는 월세로 관리비에 보태세요.",
    image: "hero-household.webp", width: 1000, height: 750,
    alt: "빈방 옆 식탁에서 관리비 고지서를 살펴보는 집주인",
  },
  B: {
    title: "우리 집 빈 방 <strong>얼마 받을 수 있을까?</strong>",
    description: "방 준비부터 청년 입주, 거주 중 관리까지<br>한지붕이 함께합니다.",
    image: "hero.webp", width: 837, height: 730,
    alt: "살던 집의 빈방을 월세 생활비로 활용하는 모습을 표현한 평면도 일러스트",
  },
  C: {
    title: "혼자 계신 부모님께 <strong>드릴 수 있는 선물</strong>",
    description: "부모님은 익숙한 집에서 지내며,<br>함께 사는 대학생과 일상의 안부를 나눠요.",
    image: "hero-companion.webp", width: 1000, height: 750,
    alt: "집 식탁에 마주 앉아 웃으며 대화하는 어르신과 대학생",
  },
};

function heroImage({ image, width, height, alt }) {
  return `<img class="host-intro-hero-art" src="/assets/host/${image}" width="${width}" height="${height}" alt="${alt}" fetchpriority="high" decoding="async">`;
}

function hostHero() {
  const first = heroVariants.A;
  const templates = Object.entries(heroVariants).map(([key, scene]) => {
    const copy = key === "A" ? "" : `<template id="host-title-${key}">${scene.title}</template>
      <template id="host-description-${key}">${scene.description}</template>`;
    return `${copy}<template id="host-visual-${key}">${heroImage(scene)}</template>`;
  }).join("\n");
  return `<section class="host-hero" id="host-hero" aria-labelledby="host-title"><div class="host-intro-container">
    <div class="host-intro-hero-content">
      <div class="host-intro-hero-copy">
        <h1 id="host-title">${first.title}</h1>
        <p id="host-description" class="host-intro-hero-description">${first.description}</p>
        <div class="host-intro-registration"><a class="host-intro-registration-button" href="/reservation/">우리 집 빈 방 얼마나 받을 수 있을까?<img alt="" width="8" height="12" src="/assets/host/chevron-right.svg"></a></div>
      </div>
      <div id="host-visual" class="host-intro-hero-visual"><noscript>${heroImage(first)}</noscript></div>
    </div>
    ${templates}
    ${headlineExperiment}
  </div></section>`;
}

export function roomCheckPage() {
  return `<div class="room-app">
    <div class="host-main">
      ${hostHero()}
      ${section("introduction")}
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
