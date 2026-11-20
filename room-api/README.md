# 한지붕 방 진단 접수 서버

GitHub Pages의 `/reservation/`에서 작성한 방 정보와 연락처는 Vercel 프로젝트 `hanjibung-room-api`의 `/api/inquiries`로 전송됩니다. 이 서버는 신청에 서명해 기존 Google Apps Script로 전달하고, ‘진단 신청’ 시트에 저장된 신청 번호를 확인합니다. 현재 양식은 사진 없이 접수합니다.

## 운영 전환

1. Vercel의 Production 환경에 기존 Apps Script 웹 앱의 `/exec` 주소를 `GOOGLE_SCRIPT_URL`로 등록합니다. 같은 Apps Script의 스크립트 속성 `WEBHOOK_SECRET` 값을 Vercel의 `GOOGLE_SCRIPT_SECRET`에 Secret 유형으로 등록합니다.
2. `COLLECTION_ENABLED=true`로 설정한 후 이 디렉터리를 Production에 배포합니다. 설치 단계는 서명한 빈 객체를 보내 스크립트의 `BAD_REQUEST` 응답을 확인합니다. 스크립트는 서명을 검증한 뒤 신청 번호가 없는 요청을 시트에 접근하기 전에 종료합니다.
3. 운영 별칭 `hanjibung-room-api.vercel.app`에서 `GET /api/inquiries`가 `{"ready":true}`를 반환하는지 확인합니다. `https://hanjibung.kr`에서 보내는 교차 출처 `OPTIONS` 요청의 응답 코드는 204입니다.
4. `/reservation/`의 ‘진단 신청하기’ 버튼과 연결 실패 후 재시도를 확인합니다. 실제 접수에서는 저장 응답의 `requestId`가 원래 신청 번호와 같을 때 완료 화면이 열립니다.
