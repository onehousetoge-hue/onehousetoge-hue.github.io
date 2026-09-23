// Activity ownership and photo-publication permission were confirmed by the owner.
// A publication date is not an event date. Do not infer dates from asset filenames.
export const digitalLearning = Object.freeze({
  href: "/activities/field-records/",
  title: "시니어와 지역사회, 함께한 현장 기록",
  description: "한지붕의 시니어 디지털 교육과 같은 구성원이 참여한 지역교류·주거모델 현장 경험을 사진으로 전합니다.",
  location: "서울 노원구",
  publishedAt: "2026-09-23",
  eventDate: null,
  // Owner confirmed 2026-08-12 specifically for the digital education activity.
  // Do not reuse this date for the other three related-experience photos.
  educationEventDate: "2026-08-12",
  photos: [
    {
      file: "digital-learning.jpg",
      width: 1600,
      height: 1200,
      alt: "교육실에서 어르신과 청년이 테이블에 마주 앉아 대화하고 휴대전화 화면을 함께 살펴보는 모습",
      title: "마주 앉아, 궁금한 것부터",
      caption: "작은 테이블을 사이에 두고 대화를 나누고, 어르신이 사용하는 휴대전화 화면을 함께 살펴봅니다.",
    },
    {
      file: "digital-guidance.jpg",
      width: 1200,
      height: 1600,
      alt: "어르신이 직접 휴대전화 화면을 누르고 옆에 앉은 청년이 손으로 화면을 짚어 안내하는 모습",
      title: "직접 해보는 시간을 함께",
      caption: "어르신이 직접 화면을 눌러보는 동안 옆에서 사용 방법을 짚어주는 교육 현장입니다.",
    },
    {
      file: "field-conversation.jpg", width: 1200, height: 1600,
      alt: "야외 지역행사 부스에서 자료를 펼치고 주민과 대화하는 운영진",
      caption: "지역행사 부스에서 자료를 펼치고 주민과 이야기를 나누는 모습입니다.",
    },
    {
      file: "community-booth.jpg", width: 1200, height: 1600,
      alt: "지역행사 안내 부스에 앉아 주민을 맞이하는 운영진",
      caption: "구성원들이 별도 프로젝트로 참여한 지역행사 부스입니다. 현수막의 수익 안내는 한지붕의 지급·수익 보장이 아닙니다.",
    },
    {
      file: "housing-conversation.jpg", width: 1200, height: 1600,
      alt: "지역 주민과 구성원들이 테이블에 둘러앉은 현장 만남",
      caption: "지역형 주거모델 기획 자료에 담긴 주민 만남 사진입니다.",
    },
  ],
});
