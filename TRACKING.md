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

`npm run check`는 광고·SNS UTM, 한글 값, 광고 클릭 식별자 보존과 문의 데이터 제외,
페이지뷰 중복 방지 및 기존 서버 확인 후 문의 전환 조건을 오프라인으로 검사합니다.
테스트에서 Google 태그나 실제 접수 API를 호출하지 않습니다.
코드 검증·배포와 GA4 수신 보고서의 실제 유입 집계 확인은 별개입니다.

공식 문서:

- https://support.google.com/analytics/answer/11242841?hl=en
- https://developers.google.com/google-ads/api/docs/ads/upgraded-urls/fields
- https://support.google.com/google-ads/answer/6305348?hl=en
