# GitHub Pages 배포 안내

## 현재 환경

- 원격 저장소: `onehousetoge-hue/onehousetoge-hue.github.io`
- 배포 브랜치: `main`
- 게시 위치: 저장소 루트
- 맞춤 도메인: `hanjibung.kr`
- 정적 생성 결과: `dist/`

## 배포 절차

```powershell
npm install
npm run check
npm run publish:root
git status
git add --all
git commit -m "Rebuild HanJibung nonprofit website"
git push origin main
```

사용자 작업으로 보이는 관련 없는 미추적 파일은 커밋 전에 반드시 제외합니다.

## 환경변수

현재는 필수 환경변수가 없습니다. 온라인 문의 API 또는 분석도구를 추가하는 경우 저장소가 아닌 호스팅 보안설정에 값을 저장하고 `.env.example`과 개인정보 처리방침을 함께 갱신합니다.

## HTTPS와 도메인

`CNAME`은 `hanjibung.kr`을 사용합니다. GitHub Pages 설정에서 맞춤 도메인과 HTTPS 강제를 활성화하고 다음을 확인합니다.

- `https://hanjibung.kr` 정상 응답
- `http://hanjibung.kr`에서 HTTPS 주소로 이동
- `www` 사용 여부와 DNS 일관성
- 인증서 만료와 혼합 콘텐츠 없음

## 구형 URL과 상태코드

구형 공개 파일은 빌드 게시 과정에서 삭제합니다. GitHub Pages는 사용자 지정 `410 Gone`을 지원하지 않으므로 삭제된 URL은 실제 404 응답과 맞춤 `404.html`의 `noindex`를 사용합니다. 구형 URL을 홈으로 이동시키지 않습니다.

## 보안 헤더 제한

GitHub Pages에서는 저장소만으로 Content-Security-Policy, HSTS, Permissions-Policy 같은 응답 헤더를 직접 설정할 수 없습니다. 별도 CDN을 도입하기 전까지 정적 자산 최소화, 외부 스크립트 제거와 HTTPS 강제로 위험을 줄입니다.

## 배포 후 검사

`POST_DEPLOY_CHECKLIST.md`에 따라 공개 페이지, HTTPS, 사이트맵, 404, 모바일 성능과 검색엔진 반영을 확인합니다.

## 롤백

문제가 생기면 마지막 정상 커밋을 확인한 뒤 되돌림 커밋을 만들어 `main`에 푸시합니다. 사용자 변경을 삭제하는 `git reset --hard`는 사용하지 않습니다.
