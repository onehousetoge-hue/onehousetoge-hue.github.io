import { site } from "../config/site.mjs";
import { programDetails } from "../data/program-details.mjs";
import { getResource } from "../content/resources.mjs";
import { consultationPhotos } from "../content/consultation-photos.mjs";
import { digitalLearning } from "../content/field-records.mjs";
import { photoFigure } from "./photo.mjs";
import { layout, pageHero, icon } from "./template.mjs";

export function programPage(program) {
  const detail = programDetails[program.slug];
  const research = program.slug === "housing-research";
  const consultation = program.slug === "senior-home-consulting";
  const related = detail.resources.map(getResource);
  const summary = consultation
    ? [["대상", "빈방·유휴공간 활용과 공동생활을 고민하는 어르신 및 가족"], ["응대", "한지붕 대표 및 운영진"], ["비용", "초기 전화·이메일 상담 무료"], ["방법", "전화 또는 이메일 문의"]]
    : research
      ? [["현재 상태", "실태조사 진행 중"], ["조사 주제", "청년 주거와 고령층 유휴공간"], ["결과 공개", "검토를 거쳐 공개 예정"], ["참여·협력", "전화·이메일 문의"]]
      : [["대상", "기관·복지관·지역단체와 교육·봉사 참여에 관심 있는 분"], ["운영", "기관 요청에 따라 사전 협의"], ["프로그램", "디지털·AI 활용, 세대교류, 주거문화 안내"], ["비용", "개인 봉사 가입비 없음·기관 프로그램 사전 합의"]];
  const title = consultation ? program.title : research ? "주거상생 실태조사를<br>진행하고 있습니다" : "세대가 함께 배우는<br>교육·봉사";
  const meta = `<div class="page-meta"><span>${program.status}</span><span>마지막 수정일 ${site.updatedAt.replaceAll("-", ".")}</span></div><div class="hero-actions">${consultation ? `<a class="button" href="${site.phoneHref}">${icon("phone")}전화로 무료상담 문의</a><a class="button button-secondary" href="${site.emailHref}">${icon("mail")}이메일 작성하기</a>` : `<a class="button" href="/contact/">${research ? "조사 협력 문의" : "교육·봉사 기관협력 문의"}${icon("arrow")}</a><a class="button button-secondary" href="/resources/">생활자료 보기</a>`}</div>`;
  const photos = consultation
    ? `<section class="program-photo-story"><div><p class="eyebrow">사진으로 만나는 상담</p><h2>어르신과 이야기를<br>나누는 현장</h2><p>함께 걷고 대화를 나누는 상담 현장의 사진입니다. 현재 이용할 수 있는 무료상담은 전화·이메일로 안내합니다.</p><a class="text-link" href="/activities/field-records/">상담 현장 기록 보기${icon("arrow")}</a></div>${photoFigure(consultationPhotos[0])}</section>`
    : research ? "" : `<section class="program-photo-story"><div><p class="eyebrow">직접 해보고, 다시 해보는 시간</p><h2>일상에서 다시 쓸 수 있도록</h2><p>참여자의 사용 수준에 맞춰 직접 해보는 실습, 반복 안내와 개별 질문 대응을 중심으로 구성합니다. 현재 매주 운영하는 상설 정규반은 아닙니다.</p><a class="text-link" href="/activities/senior-digital-education/">디지털 교육 경험 읽기${icon("arrow")}</a></div>${photoFigure(digitalLearning.photos[0])}</section>`;
  const extra = consultation
    ? `<h2>상담 후 얻을 수 있는 도움</h2><p>바로 계약하거나 결정을 내리기보다, 가족과 더 이야기할 항목, 확인이 필요한 정보, 참고할 생활자료를 정리하는 데 도움을 받을 수 있습니다.</p><h2>상담 전에 준비할 내용</h2><p>궁금한 점과 현재 고민을 간단히 알려주세요. 처음 문의하실 때 주민등록번호, 상세 주소, 등기·계약 서류, 금융정보를 보내실 필요는 없습니다. 추가 정보가 필요하다면 담당자가 목적과 범위를 설명한 뒤 요청합니다.</p><p><a href="/resources/consultation-preparation/">상담 준비 질문지 보기</a></p>`
    : research
      ? `<h2>주거상생을 위해 살피는 질문</h2><dl class="plain-definitions"><div><dt>필요한 주거정보를 찾기 쉬운가요?</dt><dd>청년과 어르신이 생활공간을 알아보거나 활용할 때 어떤 정보를 필요로 하는지 살핍니다.</dd></div><div><dt>유휴공간 활용 전 무엇을 확인해야 할까요?</dt><dd>당사자와 가족의 생각, 개인공간과 공용공간, 공간 정리·개선에 관한 필요를 다룹니다.</dd></div><div><dt>다른 세대와 함께 생활할 때 무엇이 걱정되나요?</dt><dd>생활시간, 방문객, 공동공간과 소통 방식 등 공동생활에서 확인할 사항을 다룹니다.</dd></div></dl><p>위 질문은 조사 주제를 이해하기 위한 설명이며, 확정 설문지나 실제 응답·조사 결과를 제시한 것이 아닙니다.</p><div class="notice"><h2>생활 가이드와 조사 결과는 다릅니다</h2><p>현재 공개한 생활 가이드는 상담과 교육에 참고하는 자체 자료이며, 완료된 실태조사의 결과 보고서가 아닙니다.</p><a href="/resources/">지금 볼 수 있는 생활자료</a></div>`
      : `<h2>기관 문의 시 알려주세요</h2><ul><li>기관명과 담당자의 회신 연락처</li><li>대상과 대략적인 참여 규모</li><li>원하는 주제, 희망 시기와 장소</li><li>이용 가능한 기기·공간 등 진행 여건</li></ul>`;
  const body = `${pageHero({ eyebrow: `공익사업 ${program.order}`, title, description: detail.subtitle, meta })}
    <section class="section"><div class="container"><dl class="program-facts">${summary.map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`).join("")}</dl>${photos}</div>
    <div class="container content-layout"><article class="prose"><p class="registration-note">등록 고유사업명: ${program.registeredTitle || program.title}</p><h2>${consultation ? "빈방 활용, 준비부터 함께" : "이 사업이 필요한 이유"}</h2><p class="lead">${detail.problem}</p>
    <div class="program-overview"><section class="info-block"><h2>${research ? "조사 관련 대상" : "이런 분께 도움이 됩니다"}</h2><ul>${detail.targets.map((item) => `<li>${item}</li>`).join("")}</ul></section><section class="info-block"><h2>${consultation ? "상담에서 함께 살펴볼 내용" : research ? "조사 내용" : "협의할 수 있는 프로그램"}</h2><ul>${detail.provides.map((item) => `<li>${item}</li>`).join("")}</ul></section></div>
    ${extra}<h2>${research ? "진행 현황과 결과 공개" : "이용방법"}</h2><ol>${detail.steps.map(([heading, copy]) => `<li><strong>${heading}</strong><br>${copy}</li>`).join("")}</ol><h2>${research ? "현재 이용 안내" : "비용과 진행 안내"}</h2><p>${detail.cost}</p><h2>안내 범위와 한계</h2><ul>${detail.limits.map((item) => `<li>${item}</li>`).join("")}</ul><h2>개인정보 안내</h2><p>${detail.privacy}</p>
    <h2>자주 묻는 질문</h2><div class="faq">${detail.faqs.map(([question, answer]) => `<details><summary>${question}</summary><p>${answer}</p></details>`).join("")}</div>
    <section class="related-section"><h2>함께 읽는 생활자료</h2><div class="related-grid">${related.map((resource) => `<a class="related-link" href="${resource.href}"><span class="resource-meta">${resource.category}</span>${resource.title}</a>`).join("")}</div></section>
    </article><aside class="side-nav"><h2>${consultation ? "무료상담 문의" : research ? "조사 협력 문의" : "기관협력 문의"}</h2><a href="${site.phoneHref}">${site.phone}</a><a href="${site.emailHref}">${site.email}</a><a href="/contact/">문의 방법 보기</a><a href="/participate/#partnership">참여·기관협력 안내</a><a href="/programs/">공익사업 전체 보기</a></aside></div>
    <div class="container contact-strip"><div><h2>${consultation ? "궁금한 점부터 이야기해 주세요." : research ? "조사 협력을 문의해 주세요." : "교육·봉사를 함께 기획하고 싶으신가요?"}</h2><p>민감정보나 상세주소 없이 궁금한 내용부터 알려 주세요.</p></div><div class="contact-actions"><a class="button" href="${site.phoneHref}">전화 문의</a><a class="button button-secondary" href="${site.emailHref}">이메일 작성하기</a></div></div></section>`;
  return layout({ title: program.title, description: detail.subtitle, path: program.href, body, breadcrumbs: [{ label: "공익사업", href: "/programs/" }, { label: program.title, href: program.href }] });
}
