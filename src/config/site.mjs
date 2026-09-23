export const site = Object.freeze({
  name: "한지붕",
  englishName: "HANJIBUNG",
  type: "비영리단체",
  registrationNumber: "120-82-82898",
  representative: "김현수",
  foundedAt: "2026-07-05",
  foundedAtLabel: "2026년 7월 5일",
  registeredAt: "2026-07-09",
  address: "서울특별시 노원구 동일로195길 14-5, 401호",
  phone: "010-4587-9428",
  phoneHref: "tel:+821045879428",
  email: "onehousetoge@gmail.com",
  emailHref: "mailto:onehousetoge@gmail.com",
  url: "https://hanjibung.kr",
  nonprofitDescription:
    "한지붕은 어르신 주택 개선 무료상담, 세대교류 봉사 프로그램, 주거상생 실태조사를 수행하는 비영리단체입니다.",
  footerDescription:
    "한지붕은 수익사업을 하지 않는 비영리단체로, 공익 목적의 상담·교육·조사 활동을 수행합니다.",
  updatedAt: "2026-09-23",
});

export const navigation = Object.freeze([
  ["한지붕 소개", "/about/"],
  ["공익사업", "/programs/"],
  ["활동과 기록", "/activities/"],
  ["주거상생 자료", "/resources/"],
  ["참여하기", "/participate/"],
  ["운영·투명성", "/transparency/"],
  ["문의", "/contact/"],
]);

export const programs = Object.freeze([
  {
    slug: "senior-home-consulting",
    order: "03",
    title: "어르신 주택 개선 무료상담",
    shortTitle: "무료 주택상담",
    description:
      "현재 거주 중인 주택과 남는 공간을 어떻게 안전하게 활용할 수 있을지 궁금한 어르신과 가족을 대상으로 생활환경, 가족 의견, 공간 이용기준과 준비사항을 함께 살펴봅니다.",
    href: "/programs/senior-home-consulting/",
  },
  {
    slug: "intergenerational-volunteer",
    order: "01",
    title: "세대교류 봉사 프로그램",
    shortTitle: "세대교류 봉사",
    description:
      "청년과 시니어가 서로의 생활방식을 이해할 수 있도록 공동생활 규칙, 갈등 예방, 주거문화와 일상생활을 주제로 교육·봉사 프로그램을 운영합니다.",
    href: "/programs/intergenerational-volunteer/",
  },
  {
    slug: "housing-research",
    order: "02",
    title: "주거상생 실태조사",
    shortTitle: "주거상생 조사",
    description:
      "청년 주거와 고령층 유휴공간에 관한 현장의 의견을 수집하고, 결과를 체크리스트·가이드·보고서 등 공익정보로 정리하여 공개합니다.",
    href: "/programs/housing-research/",
  },
]);

export const policies = Object.freeze({
  noCommercialBusiness: true,
  onlineFormEnabled: false,
  analyticsEnabled: false,
  thirdPartyAds: false,
  goodstackVerified: true,
});
