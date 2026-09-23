import { site } from "../config/site.mjs";
import { pageHero } from "../lib/template.mjs";
import { fundingSummary } from "../lib/funding-page.mjs";
import { evidenceFlow } from "../lib/evidence-flow.mjs";

export const transparencyBody = `${pageHero({ eyebrow: "운영·투명성", title: "지원금 사용 계획과<br>집행 현황을 공개합니다.", description: "노원구청 마을공동체 사업 지원금의 수령액·사용 계획·실제 집행내역, 단체 등록정보와 운영·회계 원칙을 확인할 수 있습니다.", meta: '<div class="page-meta"><span>마지막 수정일 2026.09.24</span></div>' })}
<section class="section"><div class="container content-layout"><article class="prose">${fundingSummary()}
<h2 id="organization">단체 등록정보</h2><dl class="definition-list"><div><dt>단체명</dt><dd>${site.name} (${site.englishName})</dd></div><div><dt>단체 유형</dt><dd>${site.legalType} · 현재 수익사업 없음</dd></div><div><dt>고유번호</dt><dd>${site.registrationNumber}</dd></div><div><dt>대표자</dt><dd>${site.representative}</dd></div><div><dt>결성일</dt><dd>${site.foundedAtLabel}</dd></div><div><dt>소재지</dt><dd>${site.address}</dd></div><div><dt>전화</dt><dd><a href="${site.phoneHref}">${site.phone}</a></dd></div><div><dt>이메일</dt><dd><a href="${site.emailHref}">${site.email}</a></dd></div></dl>
<h2>고유사업</h2><ol><li>세대교류 봉사 프로그램</li><li>주거상생 실태조사</li><li>어르신 주택 개선 무료상담</li></ol>
<h2>의사결정과 운영</h2><p>총회에서 단체의 주요 사항을 결정하고, 대표와 운영회의가 목적사업과 일상 운영을 살핍니다. 회계·감사 절차를 두어 지출 증빙과 자금의 사용 목적을 확인합니다.</p>
<h2 id="accounting">운영과 회계 원칙</h2><ul><li>수입과 재산은 목적사업과 단체 운영을 위해 사용합니다.</li><li>특정 개인에게 단체의 이익을 배분하지 않습니다.</li><li>단체 자금과 개인 또는 영리사업 자금을 혼용하지 않습니다.</li><li>지출은 객관적인 증빙자료와 함께 관리합니다.</li><li>외부 지원금은 정해진 지원 목적에 맞게 사용합니다.</li><li>이해관계가 있는 거래는 내부 절차에 따라 검토합니다.</li><li>개인정보는 활동에 필요한 최소한으로 수집합니다.</li></ul>
<h2>재정정보의 공개 범위</h2><p>현재 공개한 내용은 노원구청 마을공동체 사업 지원금의 수령액, 집행 계획과 2026년 9월 20일 기준 실제 집행내역입니다. 설립 당시 별도 보유재산이 없었으며, 현재 등록상 수익사업은 없습니다. 마을공동체 사업 지원금 수령과 수익사업 여부는 서로 다른 정보입니다.</p><p>단체 전체의 연간 결산은 이 지원금 내역과 구분합니다. 확인된 결산자료와 공개 범위가 마련되면 집계 기간과 기준일을 함께 안내합니다.</p>
<h2>공개문서 안내</h2><p>등록문서 원본에는 개인주소, 서명 등 공개에 적합하지 않은 정보가 포함될 수 있어 웹사이트에서 원본 파일을 제공하지 않습니다. 단체 등록문서 열람이 필요한 기관은 <a href="${site.emailHref}">${site.email}</a>으로 문의해 주세요.</p>
<h2>비영리단체 자격 확인</h2><p>한지붕은 Google 비영리단체 프로그램의 인증 파트너 Goodstack을 통해 비영리단체 자격 확인을 완료했습니다. 이 인증은 Google Ad Grants 승인이나 개별 프로그램의 품질·안전 보증을 의미하지 않습니다.</p>${evidenceFlow()}</article>
<aside class="side-nav"><h2>바로 확인하기</h2><a href="#execution">실제 집행 현황</a><a href="#budget-plan">사업비 사용 계획</a><a href="#organization">단체 등록정보</a><a href="#accounting">운영·회계 원칙</a><a href="/activities/nowon-grant-execution/">계획과 실제 집행 상세내역</a><a href="/activities/nonprofit-registration/">고유번호 발급 기록</a><a href="/privacy/">개인정보 처리방침</a><a href="/contact/">공개자료 문의</a></aside></div></section>`;
