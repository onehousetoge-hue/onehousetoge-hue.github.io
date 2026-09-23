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
git add --all
git commit -m "Rebuild HanJibung nonprofit website"
git push origin main
```

`publish:root`는 검증된 `dist/` 결과를 GitHub Pages가 사용하는 저장소 루트로 복사하고, 구형 공개 페이지와 관련 자산을 제거합니다. 자세한 내용은 `DEPLOYMENT.md`를 확인하세요.

## 콘텐츠 수정 위치

- 공식 단체정보: `src/config/site.mjs`
- 공익사업 목록: `src/config/site.mjs`
- 프로그램 상세내용: `src/data/program-details.mjs`
- 공익자료: `src/content/resources.mjs`
- 활동·운영기록: `src/content/activities.mjs`
- 공통 페이지 구조: `src/lib/template.mjs`
- 페이지 생성: `scripts/build.mjs`
- 디자인: `src/assets/site.css`
- 모바일 메뉴·인쇄: `src/assets/site.js`

공식 전화, 주소, 고유번호와 이메일은 `src/config/site.mjs`에서만 수정합니다. 수정 후 `npm run check`와 `npm run publish:root`를 다시 실행합니다.

## 환경변수

현재 사이트는 분석도구와 온라인 문의 API를 사용하지 않으므로 필수 환경변수가 없습니다. `.env.example`에는 향후 기능을 추가할 때 검토할 이름만 주석으로 기록했습니다. 실제 키나 비밀값은 저장소에 커밋하지 않습니다.

## 문의 처리방식

현재 호스팅은 정적 GitHub Pages입니다. 서버 측 유효성 검사, 요청 빈도 제한과 저장 성공 확인이 가능한 백엔드가 없으므로 온라인 문의폼을 제공하지 않습니다. 문의는 전화 `010-4587-9428`과 실제 대표 이메일 `hometo.kr@gmail.com`으로 받습니다. 온라인 폼을 추가할 때는 개인정보 처리방침, 보유기간과 접수 성공 로직을 함께 수정해야 합니다.

## 라우팅과 구형 URL

확장자 없는 경로는 각 디렉터리의 `index.html`로 생성됩니다. 구형 서비스 파일은 삭제하여 GitHub Pages의 실제 404 응답을 사용하며, 맞춤 `404.html`에는 `noindex`가 적용됩니다. GitHub Pages는 사용자 지정 410 상태와 서버 보안 헤더를 지원하지 않습니다.
