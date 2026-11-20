# 비영리단체 한지붕 웹사이트

남는 방의 예상 월세 진단과 빠른 상담을 제공하는 정적 웹사이트입니다. GitHub Pages와 `hanjibung.kr` 맞춤 도메인에서 운영합니다.

## 기술 구조

- Node.js 20 이상
- 외부 런타임 라이브러리가 없는 정적 사이트 생성기
- 소스: `src/`
- 생성 스크립트: `scripts/`
- 테스트: `tests/`
- 프로덕션 결과물: `dist/`
- GitHub Pages 게시 위치: 저장소 루트

## 로컬 실행

```powershell
npm install
npm run build
npm run serve
```

브라우저에서 `http://127.0.0.1:4173`을 엽니다.

## 검사와 빌드

```powershell
npm run lint
npm run typecheck
npm run build
npm test
npm run audit
```

전체 검사는 `npm run check`로 실행합니다.

## 배포

```powershell
npm run check
npm run publish:root
git status --short
git add -u
git commit -m "Rebuild HanJibung nonprofit website"
git push origin main
```

`publish:root`는 검증된 `dist/` 결과를 GitHub Pages가 사용하는 저장소 루트로 복사하고, 구형 공개 페이지와 관련 자산을 제거합니다. 자세한 내용은 `DEPLOYMENT.md`를 확인하세요.

새 파일은 공개해도 되는 소스·생성물인지 검토한 뒤 `git add -- 경로`로 개별 추가합니다. 상담 명부·영수증 원본·운영관리표는 이 공개 저장소에 넣지 않습니다.

## 현재 공개 경로

| 경로 | 편집할 소스 |
| --- | --- |
| `/` | `src/lib/room-check-page.mjs` |
| `/reservation/` | `src/lib/reservation-page.mjs`, `src/lib/callback-form.mjs` |
| `/reservation/privacy/` | `src/content/privacy.mjs` |

‘한지붕 알아보기’에 속했던 53개 주소는 2026년 11월 20일에 공개를 종료했다. 이전 게시본의 기준 커밋은 `8513c0ef4c830abdf37b17d506e851f5e1aeea2c`이다.

공통 화면은 `src/lib/template.mjs`, 단체정보와 페이지 수정일은 `src/config/`, 페이지 생성은 `scripts/build.mjs`에서 관리한다.

## 환경변수

현재 필수 환경변수는 없습니다. 온라인 문의는 `src/config/inquiries.mjs`에 설정한 공개 제출용 Apps Script URL을 사용합니다. 이 URL은 인증 비밀값이 아니며, 문의 목록을 조회하는 API는 제공하지 않습니다. GA4는 `src/config/site.mjs`의 공개 측정 ID와 `src/assets/analytics.js`로 설정합니다. UTM 운영과 확인 범위는 `TRACKING.md`에 정리되어 있습니다. `.env.example`은 향후 기능 검토용입니다. 실제 키나 비밀값은 저장소에 커밋하지 않습니다.

## 문의 처리방식

방 진단은 `room-api/`에서, 예약 화면의 빠른 상담은 기존 Google Apps Script 연동에서 접수합니다. 서버 검증과 저장 후 접수번호 확인을 통과해야 완료로 표시하며, 확인 실패 시 입력 내용을 유지합니다. 실제 서버 코드는 `integrations/inquiries/Code.gs`입니다.

전화 `010-4587-9428`과 이메일 `onehousetoge@gmail.com` 문의도 유지합니다. 상담 종료 후 최대 1년 보관 원칙에 따라 운영담당자가 종료일·삭제 예정일을 관리해야 합니다. 자동 삭제나 자동 답변 알림 기능은 없습니다. 서버 공개 배포와 웹사이트 프론트엔드 배포는 별도 단계이므로, 코드 변경만으로 운영 사이트에 반영됐다고 판단하지 않습니다.

실제 저장 시험에는 개인정보가 아닌 명확한 시험 데이터를 사용하고 접수번호를 대조합니다. 실패·시간 초과를 성공으로 처리하거나 완료 페이지 방문만 전환으로 집계하지 않습니다.

## 전체 경로 검사

로컬 서버를 실행한 뒤 다음 명령으로 사이트맵, 내부 링크, 앵커, 이미지와 메타데이터를 검사합니다. 보고서는 공개 저장소 밖에 보관하세요.

```powershell
node scripts/crawl.mjs http://127.0.0.1:4173 ../한지붕-운영검토/local-crawl
```

## 라우팅과 구형 URL

확장자 없는 경로는 각 디렉터리의 `index.html`로 생성됩니다. 구형 서비스 파일은 삭제하여 GitHub Pages의 실제 404 응답을 사용하며, 맞춤 `404.html`에는 `noindex`가 적용됩니다. GitHub Pages는 사용자 지정 410 상태와 서버 보안 헤더를 지원하지 않습니다.
