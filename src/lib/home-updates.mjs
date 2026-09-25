import { consultationRecords } from "../content/consultation-records.mjs";
import { activities } from "../content/activities.mjs";
import { escapeHtml, icon } from "./template.mjs";

export function homeUpdates() {
  const e = escapeHtml;
  const records = [...consultationRecords, ...activities.filter(item => item.eventDate).map(item => ({...item, date:item.eventDate, dateLabel:item.eventLabel}))]
    .sort((a,b) => b.date.localeCompare(a.date) || a.href.localeCompare(b.href)).slice(0,3);
  return `<section class="section home-updates" id="latest-updates" aria-labelledby="home-updates-title"><div class="container"><div class="section-header"><div><p class="eyebrow">활동 기록과 생활자료</p><h2 id="home-updates-title">현장에서 들은 질문,<br>지금 꺼내 쓸 도움</h2></div><p>과거에 진행한 활동은 기록에서,<br>오늘 사용할 자료는 준비실에서 확인하세요.</p></div><div class="home-update-grid">
    <article class="home-update-card"><h3>상담 현장 기록</h3><ul>${records.map(item=>`<li><p class="resource-meta"><time datetime="${item.date}">${e(item.dateLabel)}</time></p><h4><a href="${item.href}">${e(item.title)}</a></h4></li>`).join("")}</ul><div class="home-update-links"><a class="text-link" href="/activities/">활동기록 전체 보기${icon("arrow")}</a></div></article>
    <article class="home-update-card"><h3>진행 중인 실태조사</h3><p>주거상생 실태조사는 현재 진행 중입니다. 어르신·가족·청년·기관의 의견을 듣고 상담에 필요한 질문을 정리합니다.</p><p>참여 현황과 조사 방법, 앞으로의 일정을 별도 페이지에서 공개합니다.</p><a class="text-link" href="/programs/housing-research/#progress">조사 진행상황 확인${icon("arrow")}</a></article>
    <article class="home-update-card"><h3>공동생활 준비실</h3><p>상담 신청 없이 질문을 고르고, 대화·생활비·모임 준비를 직접 해볼 수 있습니다.</p><ul><li><a href="/resources/preparation-room/">내 상황에 맞는 준비 질문표</a></li><li><a href="/resources/conversation-practice/">생활 장면 대화 연습</a></li><li><a href="/resources/living-cost-planner/">한 달 생활비 항목 정리</a></li><li><a href="/resources/community-session-kit/">세대공감 대화모임 진행안</a></li></ul><div class="home-update-links"><a class="text-link" href="/resources/#housing-reading">주거정보 읽기${icon("arrow")}</a><a class="text-link" href="/resources/#find-guide">상황에 맞는 생활자료 찾기${icon("arrow")}</a></div></article>
  </div></div></section>`;
}
