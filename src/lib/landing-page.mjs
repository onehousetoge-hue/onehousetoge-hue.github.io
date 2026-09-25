import { impactSection } from "./impact.mjs";
import { site } from "../config/site.mjs";
import { consultationPhotos } from "../content/consultation-photos.mjs";
import { icon } from "./template.mjs";
import { photoImage } from "./photo.mjs";
import { helpPaths } from "./help-paths.mjs";
import { homeUpdates } from "./home-updates.mjs";

export function landingPage() {
  return `<section class="editorial-hero"><div class="container">
    <p class="eyebrow">한지붕 · 비영리단체</p><h1>어르신의 남는 공간과<br>청년의 주거 고민을 잇습니다.</h1>
    <div class="editorial-cover"><figure class="editorial-cover-photo">${photoImage(consultationPhotos[0], { eager: true, sizes: "(max-width: 880px) calc(100vw - 40px), (max-width: 1440px) 64vw, 870px" })}<figcaption>지역을 걷고, 이야기를 듣습니다. <span>한지붕의 현장 상담 기록</span></figcaption></figure>
    <div class="editorial-cover-copy"><p class="editorial-note">서울 노원구에서 시작하는<br>주거상생 공익활동</p><p class="cover-intro">한지붕은 서울 노원구를 중심으로 어르신 유휴공간 활용 무료상담, 청년·외국인 유학생 주거문화 안내, 세대공감 프로그램과 주거상생 실태조사를 운영하는 비영리단체입니다.</p><div class="cover-actions"><a class="button" href="/consultation/">어르신 무료상담${icon("arrow")}</a><a class="button button-secondary" href="/resources/#youth-housing">청년 주거정보 보기</a><a class="button button-secondary" href="/activities/">한지붕 활동기록</a></div><p class="cover-footnote">현재 개인상담은 전화·이메일로 진행합니다.<br>입주 알선·계약대행은 하지 않습니다.</p></div></div>
  </div></section>
  ${helpPaths()}${homeUpdates()}${impactSection()}
  <section class="section editorial-transparency"><div class="container organization-intro"><div><p class="eyebrow">운영·공개</p><h2>활동과 운영을<br>함께 공개합니다.</h2><p>${site.nonprofitDescription}</p><a class="text-link" href="/about/">한지붕 소개${icon("arrow")}</a></div><div><p>대표 ${site.representative} · 고유번호 ${site.registrationNumber}</p><p>노원구청 마을공동체 사업 지원금 600,000원의 계획과 실제 사용 내역을 구분해 공개합니다.</p><dl class="editorial-funding"><div><dt>실제 집행액</dt><dd>191,500원</dd></div><div><dt>미집행액</dt><dd>408,500원</dd></div></dl><p class="resource-meta">2026년 9월 20일 기준 · 해당 지원금에 한정한 공개</p><a class="text-link" href="/transparency/">단체 운영정보 확인하기${icon("arrow")}</a><br><a class="text-link" href="/activities/nowon-grant-execution/">지원금 계획·집행 현황 보기${icon("arrow")}</a></div></div></section>
  <section class="final-cta"><div class="container"><p class="eyebrow">한지붕 무료상담</p><h2>혼자 결정하기 전에,<br>궁금한 점부터 나눠주세요.</h2><p>궁금한 내용과 연락받을 방법을 알려주시면,<br>운영진이 안내 가능한 범위와 함께 볼 자료를 설명합니다.</p><div class="hero-actions"><a class="button" href="/consultation/">무료상담 문의하기${icon("arrow")}</a><a class="button button-secondary" href="${site.phoneHref}">전화로 문의하기</a></div><p class="contact-readable"><a href="${site.phoneHref}">${site.phone}</a><span aria-hidden="true"> · </span><a href="${site.emailHref}">${site.email}</a></p></div></section>`;
}
