import { fieldStories } from "../content/field-stories.mjs";
import { editorialGuides } from "../content/editorial-guides.mjs";
import { escapeHtml, icon } from "./template.mjs";

export function homeUpdates() {
  const e = escapeHtml;
  const records = fieldStories.filter(item => !item.media).slice(0, 2);
  const media = fieldStories.find(item => item.media);
  const guides = editorialGuides.slice(0, 2);
  const entry = (item, dateLabel, date) => `<li><p class="resource-meta">${e(dateLabel)}${date ? ` · <time datetime="${date}">${date.replaceAll("-", ".")}</time>` : ""}</p><h4><a href="${item.href}">${e(item.title)}</a></h4></li>`;
  return `<section class="section home-updates" id="latest-updates" aria-labelledby="home-updates-title"><div class="container"><div class="section-header"><div><p class="eyebrow">활동기록 · 언론 소식 · 주거정보</p><h2 id="home-updates-title">지금, 한지붕에서<br>나누는 이야기</h2></div><p>현장에서 들은 질문과 진행 중인 조사,<br>생활에 도움이 되는 자료를 함께 만나보세요.</p></div><div class="home-update-grid">
    <article class="home-update-card"><p class="home-update-number" aria-hidden="true">01</p><h3>동네에서 이어가는 활동</h3><p>어르신과 나눈 주거 고민을 기록하고 다음 상담과 조사에 반영합니다.</p><ul>${records.map(item=>entry(item,`활동 ${item.dateLabel}`)).join("")}</ul><div class="home-update-links"><a class="text-link" href="/activities/#september-field-stories">새 활동기록 5편 보기${icon("arrow")}</a><a class="text-link" href="/programs/housing-research/#progress">진행 중인 실태조사 보기${icon("arrow")}</a></div></article>
    <article class="home-update-card"><p class="home-update-number" aria-hidden="true">02</p><h3>원문으로 확인하는 소식</h3><p>대표자 인터뷰와 관련 보도를 소개하고, 현재 한지붕의 활동 범위도 함께 안내합니다.</p><ul>${entry(media,"방송",media.date)}</ul><p class="home-update-detail">MBC 공식 영상과 기사 원문을 연결했습니다. 방송 속 다른 사업·거주 사례와 한지붕의 현재 무료상담은 구분합니다.</p><div class="home-update-links"><a class="text-link" href="${media.href}">인터뷰와 보도 내용 보기${icon("arrow")}</a></div></article>
    <article class="home-update-card"><p class="home-update-number" aria-hidden="true">03</p><h3>생활에 바로 쓰는 자료</h3><p>빈방 활용부터 주거 선택·생활규칙까지, 읽고 내 상황에 맞는 질문을 정리해 보세요.</p><ul>${guides.map(item=>entry(item,item.category)).join("")}</ul><div class="home-update-links"><a class="text-link" href="/resources/#housing-reading">새 주거정보 읽기${icon("arrow")}</a><a class="text-link" href="/resources/preparation-room/">내 상황에 맞는 질문표 만들기${icon("arrow")}</a><a class="text-link" href="/stories/why-generational-connection/">한지붕이 세대를 잇는 이유${icon("arrow")}</a></div></article>
  </div></div></section>`;
}
