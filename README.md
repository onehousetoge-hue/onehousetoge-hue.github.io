# 비영리단체 한지붕 웹사이트

어르신 주택 개선 무료상담, 세대교류 봉사 프로그램, 주거상생 실태조사와 자체 공익자료를 제공하는 정적 웹사이트입니다. GitHub Pages와 `hanjibung.kr` 맞춤 도메인에서 운영합니다.

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

## 사진 전송 최적화

사진 JPEG 원본은 유지하고 WebP 640px·960px·원본 너비 파생본을 함께 제공합니다. 홈 대표 사진에는 중간 해상도 768px도 제공합니다. 브라우저는 화면에 맞는 파일을 선택하고 미지원 환경은 기존 JPEG를 사용합니다. 사진 자르기·내용 변경은 하지 않습니다. CSS·JavaScript URL에는 빌드 시 콘텐츠 해시를 붙여 배포 후 오래된 파일 캐시와의 혼용을 줄입니다.

파생본은 저장소에 포함되어 일반 빌드는 외부 이미지 라이브러리 없이 가능합니다. 재생성이 필요할 때만 설치된 `sharp` 모듈을 사용합니다. 별도 런타임의 모듈은 `SHARP_MODULE`에 경로를 지정한 후 `npm run assets:optimize`를 실행합니다. 스크립트가 원본 해시 보존과 메타데이터 제거를 검사합니다. 새 사진을 추가하면 공개 동의·개인정보 검토 후 파생본과 함께 추가하세요.

## 콘텐츠 수정 위치

- 공식 단체정보: `src/config/site.mjs`
- 공익사업 목록: `src/config/site.mjs`
- 프로그램 상세내용: `src/data/program-details.mjs`
- 공익자료: `src/content/resources.mjs`
- 활동·운영기록: `src/content/activities.mjs`
- 상담 현장기록: `src/content/consultation-records.mjs` — 작성 기준은 `CONTENT_AUTHORING.md`
- 페이지별 실제 편집일: `src/config/page-dates.mjs`
- 온라인 문의 설정: `src/config/inquiries.mjs` — 운영 절차는 `integrations/inquiries/README.md`
- 공통 페이지 구조: `src/lib/template.mjs`
- 페이지 생성: `scripts/build.mjs`
- 디자인: `src/assets/site.css`
- 모바일 메뉴·인쇄: `src/assets/site.js`

공식 전화, 주소, 고유번호와 이메일은 `src/config/site.mjs`에서만 수정합니다. 수정 후 `npm run check`와 `npm run publish:root`를 다시 실행합니다.

## 환경변수

현재 필수 환경변수는 없습니다. 온라인 문의는 `src/config/inquiries.mjs`에 설정한 공개 제출용 Apps Script URL을 사용합니다. 이 URL은 인증 비밀값이 아니며, 문의 목록을 조회하는 API는 제공하지 않습니다. 분석도구는 설치하지 않았습니다. `.env.example`은 향후 기능 검토용입니다. 실제 키나 비밀값은 저장소에 커밋하지 않습니다.

## 문의 처리방식

웹사이트는 정적 GitHub Pages이고, 무료상담·기관협력 문의 저장은 별도의 Google Apps Script가 담당합니다. 지정한 Google 스프레드시트의 `상담문의`·`기관협력` 탭에만 저장합니다. 서버 검증과 저장 후 접수번호 확인을 통과해야 완료로 표시하며, 확인 실패 시 입력 내용을 유지합니다. 실제 서버 코드는 `integrations/inquiries/Code.gs`입니다.

전화 `010-4587-9428`과 이메일 `onehousetoge@gmail.com` 문의도 유지합니다. 상담 종료 후 최대 1년 보관 원칙에 따라 운영담당자가 종료일·삭제 예정일을 관리해야 합니다. 자동 삭제나 자동 답변 알림 기능은 없습니다. 서버 공개 배포와 웹사이트 프론트엔드 배포는 별도 단계이므로, 코드 변경만으로 운영 사이트에 반영됐다고 판단하지 않습니다.

실제 저장 시험에는 개인정보가 아닌 명확한 시험 데이터를 사용하고 접수번호를 대조합니다. 실패·시간 초과를 성공으로 처리하거나 완료 페이지 방문만 전환으로 집계하지 않습니다.

## 전체 경로 검사

로컬 서버를 실행한 뒤 다음 명령으로 사이트맵, 내부 링크, 앵커, 이미지와 메타데이터를 검사합니다. 보고서는 공개 저장소 밖에 보관하세요.

```powershell
node scripts/crawl.mjs http://127.0.0.1:4173 ../한지붕-운영검토/local-crawl
```

## 라우팅과 구형 URL

확장자 없는 경로는 각 디렉터리의 `index.html`로 생성됩니다. 구형 서비스 파일은 삭제하여 GitHub Pages의 실제 404 응답을 사용하며, 맞춤 `404.html`에는 `noindex`가 적용됩니다. GitHub Pages는 사용자 지정 410 상태와 서버 보안 헤더를 지원하지 않습니다.
