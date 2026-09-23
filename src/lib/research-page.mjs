import { research, researchTotal } from "../content/research.mjs";
import { site } from "../config/site.mjs";
import { escapeHtml, layout, pageHero } from "./template.mjs";
import { evidenceFlow } from "./evidence-flow.mjs";

const list = (items) => `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;

export function researchPage(program) {
  const body = pageHero({
    eyebrow: "공익사업 03 · 실태조사 진행 중",
    title: "노원구 고령가구 유휴공간 및<br>세대공존 실태조사",
    description: "사용하지 않는 방이 생긴 고령가구가 공간 활용을 검토할 때 겪는 어려움을 조사합니다. 어르신과 가족, 청년, 지역기관의 의견을 듣고 있습니다.",
    meta: `<div class="page-meta"><span>현황 기준일 <time datetime="${research.asOf}">2026년 9월 20일</time></span><span>상세 현황 게시일 <time datetime="${research.publishedAt}">2026년 9월 24일</time></span></div><div class="hero-actions"><a class="button" href="/contact/">실태조사 의견 전달 문의</a><a class="button button-secondary" href="#questions">조사 질문 확인하기</a></div>`,
  }) + `<section class="section"><div class="container content-layout"><article class="prose">
    <p class="registration-note">등록 고유사업명: 주거상생 실태조사</p><p class="lead">빈방의 개수만 확인하는 것이 아니라 안전, 가족동의, 생활습관, 계약과 사생활 보호에 대한 걱정을 함께 살펴봅니다.</p>
    <nav class="field-toc" aria-label="실태조사 목차"><a href="#overview">조사 개요</a><a href="#progress">진행상황 확인하기</a><a href="#questions">조사 질문</a><a href="#findings">현재까지의 의견</a><a href="#schedule">진행 일정</a></nav>
    <h2 id="overview">조사 개요</h2><dl class="definition-list"><div><dt>조사기간</dt><dd><time datetime="${research.start}">2026년 7월 15일</time>~<time datetime="${research.end}">11월 30일</time></dd></div><div><dt>조사지역</dt><dd>${escapeHtml(research.area)}</dd></div><div><dt>조사대상</dt><dd>지역 어르신, 어르신 가족, 청년, 복지기관 관계자</dd></div><div><dt>조사방법</dt><dd>${escapeHtml(research.methods)}</dd></div><div><dt>현재 단계</dt><dd>${escapeHtml(research.stage)}</dd></div><div><dt>현황 기준일</dt><dd>2026년 9월 20일</dd></div></dl>
    <section id="progress" aria-labelledby="progress-title" class="research-progress"><p class="eyebrow">2026년 9월 20일 기준 · 운영진 집계</p><h2 id="progress-title">현재까지 ${researchTotal}명의 의견을 들었습니다</h2><dl class="research-counts">${research.participants.map((group) => `<div><dt>${escapeHtml(group.label)}</dt><dd>${group.count}명</dd></div>`).join("")}</dl><p><strong>전체 의견수집 ${researchTotal}명</strong> · 동일인이 여러 차례 의견을 제공한 경우 한 명으로 집계했습니다. 상담 기록의 회차별 참여인원과는 집계 범위가 다릅니다.</p><p>이 수치는 의견수집 참여 현황이며, 지역 전체를 대표하는 통계나 공동거주 성과가 아닙니다.</p></section>
    <h2 id="questions">무엇을 조사하고 있나요?</h2>${research.topics.map((topic, index) => `<section class="research-topic"><h3>${index + 1}. ${escapeHtml(topic.title)}</h3>${list(topic.questions)}</section>`).join("")}
    <p>신원확인·중재창구 등은 조사에서 확인하는 수요입니다. 한지붕이 현재 신원조회, 입주자 연결이나 상시 중재 서비스를 제공한다는 뜻은 아닙니다.</p>
    <h2 id="findings">현재까지 반복적으로 나온 의견</h2><p>운영진이 제공한 현장 의견을 주제별로 요약했습니다. 참여자의 발언을 그대로 옮긴 직접 인용이나 주제별 응답 비율은 아닙니다.</p><div class="research-findings">${research.findings.map((finding) => `<section><h3>${escapeHtml(finding.title)}</h3><p>${escapeHtml(finding.summary)}</p></section>`).join("")}</div>
    <h2 id="schedule">조사 진행 일정</h2><ol class="research-timeline">${research.timeline.map((stage) => `<li><p class="eyebrow">${stage.period} · ${stage.status}</p><h3>${stage.title}</h3>${list(stage.items)}</li>`).join("")}</ol>
    <h2>진행 현황과 결과 공개</h2><p>이번 조사는 지역 전체를 대표하는 통계조사가 아니라, 현장에서 필요한 상담과 지원방식을 구체화하기 위한 기초조사입니다. 현재 공개된 조사보고서는 없습니다. 이 페이지의 참여 현황·의견 요약은 진행 중인 조사에 대한 중간 안내입니다.</p>
    <h3>조사결과는 이렇게 활용합니다</h3>${list(["어르신 주거상담 질문지와 가족설명 자료 개선", "공동생활 전 확인항목과 생활규칙 합의서 보완", "청년 주거조건 파악과 지역기관 협력 프로그램 기획", "향후 공익사업·교육자료 제작"])}<p>조사가 종료되면 조사대상, 조사방법과 한계를 함께 표시한 결과 요약자료를 공개할 예정입니다. 현재 자료실의 생활 가이드는 자체 교육자료이며 완료된 실태조사 보고서와 구분합니다.</p>
    <h2>참여·개인정보 안내</h2><p>이 웹사이트에서는 조사 응답을 접수하지 않습니다. 의견 전달이나 기관 인터뷰를 원하시면 먼저 전화·이메일로 문의해 주세요. 참여 시 안내받는 조사 목적·수집 항목·보유기간·담당자·동의 내용을 확인하실 수 있습니다.</p><p>홈페이지에는 이름, 연락처, 상세주소, 신분증이나 개인을 식별할 수 있는 응답 원자료를 공개하지 않습니다. 문의할 때에도 민감정보를 보내지 마세요.</p>
    <div class="hero-actions"><a class="button" href="/contact/">실태조사 의견 전달 문의</a><a class="button button-secondary" href="/participate/#partnership">기관 인터뷰 요청하기</a></div>
    ${evidenceFlow()}</article><aside class="side-nav"><h2>조사와 관련 기록</h2><a href="#progress">진행상황 확인하기</a><a href="#questions">조사 질문 확인하기</a><a href="/activities/field-records/">상담 현장 기록</a><a href="/transparency/#execution">지원금 집행 현황</a><a href="${site.phoneHref}">${site.phone}</a><a href="${site.emailHref}">${site.email}</a></aside></div></section>`;
  return layout({ title: research.title, description: "노원구 공릉동·하계동에서 진행 중인 고령가구 유휴공간 및 세대공존 실태조사. 2026년 9월 20일 기준 48명의 의견수집 현황과 조사 질문·일정을 안내합니다.", path: program.href, body, updatedAt: research.publishedAt, breadcrumbs: [{ label: "공익사업", href: "/programs/" }, { label: "주거상생 실태조사", href: program.href }] });
}
