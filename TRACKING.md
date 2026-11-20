# GA4와 유입 링크

GA4 측정 ID는 `G-58PJ9VG8GC`이며 방문자용 페이지에서 공통 태그를 한 번 로드합니다.
자동 페이지뷰를 끄고 `page_view`를 한 번 전송합니다.

`page_location`에는 경로와 다음 허용 매개변수만 포함합니다.

- UTM: `utm_id`, `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`, `utm_source_platform`, `utm_creative_format`, `utm_marketing_tactic`
- Google 광고: `gclid`, `dclid`, `gbraid`, `wbraid`, `gad_source`, `gad_campaignid`

이름·전화번호·이메일·주소·문의내용·접수번호와 기타 조회값 및 URL fragment는
분석용 페이지 주소에 포함하지 않습니다. UTM 값에도 개인정보를 넣지 않습니다.
첫 방문 페이지와 유입 매체, 캠페인, 실제 노출된 제목은 현재 탭의 세션 저장소에서 신청서로 이어집니다. 방문 기록이 30분 이상 지난 경우 새로 시작합니다.
광고 쿠키·광고 사용자 데이터·개인맞춤 광고의 기존 `denied` 설정은 유지합니다.

## 광고 UTM

Google Ads 자동 태깅을 유지하면서 현재 Grants 캠페인의 최종 URL 접미사에
다음 값을 사용합니다. 접미사 앞에 `?`를 넣지 않습니다.

```text
utm_source=google&utm_medium=cpc&utm_campaign=hanjibung_grants&utm_id={campaignid}&utm_content={creative}&utm_term={keyword}
```

`{keyword}`는 실제 검색어가 아니라 광고 계정에 등록한 일치 키워드입니다.
캠페인 설정은 외부 Ads API에서 별도 적용·재조회하며, 이 문서 배포만으로
광고 설정이 바뀌는 것은 아닙니다. 하위 광고그룹·광고·키워드의 접미사가 있으면
캠페인 설정을 덮어쓰므로 운영 점검 때 확인합니다.

외부 SNS 링크는 채널에 맞는 값을 붙여 공유합니다. 예:

```text
https://hanjibung.kr/?utm_source=instagram&utm_medium=social&utm_campaign=hanjibung_intro&utm_content=profile
```

일반 주소 방문을 임의로 광고 유입으로 기록하지 않습니다.

## 검증

### 첫 화면 A/B/C 문구 비교

| 안 | 첫 화면 제목 | 노출 이벤트 | 월세 진단 접수 완료 이벤트 |
| --- | --- | --- | --- |
| A | 관리비 걱정은 이제 그만! | `headline_view_a` | `headline_complete_a` |
| B | 우리 집 빈 방 얼마 받을 수 있을까? | `headline_view_b` | `headline_complete_b` |
| C | 혼자 계신 부모님께 드릴 수 있는 선물 | `headline_view_c` | `headline_complete_c` |

GA4의 유입경로 탐색에서 같은 기간에 각 안의 노출 이벤트와 완료 이벤트를 순서대로 지정합니다. 닫힌 유입경로의 사용자 기준 완료율을 비교하면 여러 번 방문한 사람을 한 명으로 셀 수 있습니다. 노출은 활성 탭에서 제목이 보일 때 기록하고, 완료는 접수 서버가 같은 신청 번호로 저장을 확인했을 때 기록합니다.

상담 신청은 `callback_complete`, 방 등록 신청은 `room_registration_complete`로 기록합니다. 제목을 실제로 본 방문자가 신청하면 `headline_callback_a/b/c` 또는 `headline_registration_a/b/c`도 기록합니다. `diagnosis_complete`와 `callback_complete`는 기존 GA4 주요 이벤트입니다. 관리자 화면은 세 양식 중 하나 이상을 접수한 활성 사용자 수를 해당 문구를 본 활성 사용자 수로 나눠 전환율을 표시합니다. 페이지 조회수에는 반복 조회가 포함됩니다. 유입 표는 세션 출처·매체와 캠페인별 세션 수를 보여줍니다.

소개, 상담, 진단, 방 등록 페이지는 각 주소로 조회수를 집계합니다. `/consultation/`과 `/rooms/register/`의 신청은 기존 `상담문의` 시트에 기록합니다. 방 등록 행의 상담 주제는 `방 등록`이며, 문의 내용에 동네, 남는 방 개수, 입주 가능 시기를 함께 저장합니다. 기존 빠른 상담 링크는 캠페인 매개변수를 유지해 상담 신청 페이지로 연결합니다.

홈 주소의 `?headline_preview=A`, `B`, `C`는 내부 확인용입니다. 미리보기에서 신청서로 이동해도 위 실험 이벤트는 발생하지 않습니다. 브라우저에 저장한 일반 방문자의 배정값은 그대로입니다.

### 배포 전 검사

두 접수용 Apps Script에는 `integrations/attribution/LeadAttribution.gs`를 함께 배포합니다. 월세 진단은 기존 19개 열 다음에, 상담은 기존 13개 열 다음에 첫 방문·전환 페이지, 본 문구, 출처, 매체, 캠페인, 캠페인 ID, 소재, 키워드, 유입 도메인을 기록합니다. 재전송 시 같은 접수번호를 조회하여 처음 저장한 값을 보존합니다.

관리자 전용 Apps Script의 소스는 `integrations/admin/`에 있습니다. 이 프로젝트의 비공개 설정 `DEPLOYMENT`에는 `admin`(로그인 이메일), `property`(GA4 속성 번호), `diagnosis`와 `callback`(각각 `book` 스프레드시트 ID와 `gid` 탭 ID)을 둡니다. 관리자가 소유한 웹 앱을 ‘나만’으로 배포합니다. GA4 통계는 관리자 조회 시 10분 동안 재사용하고 접수 내역과 연락처는 요청할 때 원본 시트에서 조회합니다.

`npm run check`는 광고·SNS UTM, 한글 값, 광고 클릭 식별자 보존과 문의 데이터 제외,
페이지뷰 중복 방지 및 기존 서버 확인 후 문의 전환 조건을 오프라인으로 검사합니다.
테스트에서 Google 태그나 실제 접수 API를 호출하지 않습니다.
코드 검증·배포와 GA4 수신 보고서의 실제 유입 집계 확인은 별개입니다.

공식 문서:

- https://support.google.com/analytics/answer/11242841?hl=en
- https://developers.google.com/google-ads/api/docs/ads/upgraded-urls/fields
- https://support.google.com/google-ads/answer/6305348?hl=en
