# 한지붕 방 진단 접수 서버

한지붕 첫 화면은 이 저장소의 정적 페이지로 빌드되어 GitHub Pages에서 제공됩니다. 사진이 포함된 신청서는 별도 Vercel 프로젝트 `hanjibung-room-api`의 `/api/inquiries`로 보내며, 이 서버가 기존 Google Apps Script에 서명된 요청을 전달합니다. ChatGPT Sites는 이 경로에 포함되지 않습니다.

## 운영 전환

1. 기존 Apps Script 프로젝트의 Script Properties에 있는 `WEBHOOK_SECRET`을 확인합니다. 키를 저장소, 이슈, 채팅이나 로그에 남기지 않습니다.
2. Vercel 프로젝트 `hanjibung-room-api`에 동일한 값을 `GOOGLE_SCRIPT_SECRET`의 암호화된 환경변수로 등록합니다. `GOOGLE_SCRIPT_URL`은 이미 설정되어 있습니다.
3. 사용자 승인 후 해당 프로젝트의 SSO 접근 설정을 공개 신청 경로에 맞게 변경합니다. 접수 API는 허용한 한지붕 Origin과 사진·필드 검증을 적용합니다.
4. `COLLECTION_ENABLED=true`로 변경하고 새 배포를 만듭니다. `GET /api/inquiries`가 `{"ready":true}`를 반환하는지 확인합니다.
5. 실제 신청 한 건을 접수해 Google Sheets 행과 Google Drive 사진, 동일 `requestId` 재시도 결과를 확인합니다. 이 확인 뒤 사이트 브랜치를 병합합니다.

Vercel 함수의 본문 한도 때문에 브라우저에서 사진을 장당 500 KB 이하로 줄이고 전체 요청을 4 MB 이하로 제한합니다. 기존 일반 무료상담 문의는 별도 경로를 계속 사용합니다.
