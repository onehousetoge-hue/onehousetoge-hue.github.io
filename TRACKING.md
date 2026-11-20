# GA4와 유입 링크

GA4 측정 ID는 `G-58PJ9VG8GC`이며 모든 페이지에 공통 태그를 한 번 로드합니다.
자동 페이지뷰를 끄고 `page_view`를 한 번 전송합니다.

`page_location`에는 경로와 다음 허용 매개변수만 포함합니다.

- UTM: `utm_id`, `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`, `utm_source_platform`, `utm_creative_format`, `utm_marketing_tactic`
- Google 광고: `gclid`, `dclid`, `gbraid`, `wbraid`, `gad_source`, `gad_campaignid`

이름·전화번호·이메일·주소·문의내용·접수번호와 기타 조회값 및 URL fragment는
분석용 페이지 주소에 포함하지 않습니다. UTM 값에도 개인정보를 넣지 않습니다.
별도의 캠페인 저장소나 내부 링크 재태깅은 추가하지 않습니다.
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

홈 주소의 `?headline_preview=A`, `B`, `C`는 내부 확인용입니다. 미리보기에서 신청서로 이동해도 위 실험 이벤트는 발생하지 않습니다. 브라우저에 저장한 일반 방문자의 배정값은 그대로입니다.

### 배포 전 검사

`npm run check`는 광고·SNS UTM, 한글 값, 광고 클릭 식별자 보존과 문의 데이터 제외,
페이지뷰 중복 방지 및 기존 서버 확인 후 문의 전환 조건을 오프라인으로 검사합니다.
테스트에서 Google 태그나 실제 접수 API를 호출하지 않습니다.
코드 검증·배포와 GA4 수신 보고서의 실제 유입 집계 확인은 별개입니다.

공식 문서:

- https://support.google.com/analytics/answer/11242841?hl=en
- https://developers.google.com/google-ads/api/docs/ads/upgraded-urls/fields
- https://support.google.com/google-ads/answer/6305348?hl=en
