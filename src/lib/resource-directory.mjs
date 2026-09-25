import { editorialGuides } from "../content/editorial-guides.mjs";
import { homesharingArticles } from "./homesharing-articles.mjs";
import { guideFinder } from "./help-paths.mjs";
import { livingLabFeature } from "./living-lab.mjs";
import { escapeHtml, pageHero } from "./template.mjs";

export function resourceDirectory(meta) {
  const e = escapeHtml;
  const link = item => `<li><a href="${item.href}">${e(item.title)}</a><p>${e(item.description)}</p></li>`;
  const senior = editorialGuides[0], youth = editorialGuides[1];
  return `${pageHero({eyebrow:"주거정보와 생활자료",title:"필요한 질문부터<br>찾아보세요.",description:"설명을 읽고 싶을 때, 내 상황을 직접 정리하고 싶을 때, 작성표가 필요할 때 나눠 찾을 수 있습니다. 모든 자료는 무료입니다.",meta})}<section class="section"><div class="container"><nav class="section-jumps resource-navigation" aria-label="자료 유형 선택"><a href="#find-guide">작성형 자료 찾기</a><a href="#living-lab-title">직접 해보는 도구</a><a href="#housing-reading">주제별 설명 읽기</a></nav>
  ${guideFinder()}
  ${livingLabFeature({compact:true})}
  <section id="housing-reading" class="guide-reading" aria-labelledby="housing-reading-title"><p class="eyebrow">주제별 설명</p><h2 id="housing-reading-title">처음 알아볼 때 읽는 글</h2><div class="resource-grid"><article class="resource-card"><h3>어르신·가족의 빈방 활용</h3><ul>${link(senior)}${link(homesharingArticles[0])}</ul></article><article class="resource-card" id="youth-housing"><h3>청년·외국인 유학생의 주거 준비</h3><p>자료는 한국어로 제공합니다. 주거 선택의 질문과 공동생활 방식을 먼저 이해해 보세요.</p><ul>${link(youth)}${link(homesharingArticles[1])}</ul></article><article class="resource-card" id="homesharing-articles"><h3>생활규칙과 세대교류 이해하기</h3><ul>${editorialGuides.slice(2).map(link).join("")}</ul></article></div></section>
  </div></section>`;
}
