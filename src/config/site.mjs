export const site = Object.freeze({
  name: "한지붕",
  englishName: "HANJIBUNG",
  type: "세법상 비영리법인",
  legalType: "비영리법인(국세기본법상 법인으로 보는 단체)",
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
    "한지붕은 어르신 유휴공간·빈방 활용 무료상담과 세대교류 교육·봉사를 제공하는 세법상 비영리법인입니다. 주거상생 실태조사는 현재 진행 중입니다.",
  footerDescription:
    "한지붕은 공익 목적의 무료상담·교육·봉사와 생활자료를 제공합니다. 주거상생 실태조사는 진행 중이며, 조사 결과와 공익 보고서는 검토를 거쳐 공개할 예정입니다.",
  updatedAt: "2026-09-24",
});

export const navigation = Object.freeze([
  ["한지붕 소개", "/about/"],
  ["공익사업", "/programs/"],
  ["활동과 기록", "/activities/"],
  ["주거상생 자료", "/resources/"],
  ["운영·투명성", "/transparency/"],
]);

export const programs = Object.freeze([
  {
    slug: "senior-home-consulting",
    order: "01",
    title: "어르신 유휴공간·빈방 활용 무료상담",
    registeredTitle: "어르신 주택 개선 무료상담",
    status: "전화·이메일 상담 운영",
    shortTitle: "빈방 활용 무료상담",
    description:
      "한지붕 대표와 운영진이 빈방 활용을 검토할 때의 준비사항, 공간 정리·개선에 관한 일반 정보, 공동생활 기준과 청년 주거 공익정보를 전화·이메일로 안내합니다.",
    href: "/programs/senior-home-consulting/",
  },
  {
    slug: "intergenerational-volunteer",
    order: "02",
    title: "세대교류 교육·봉사",
    registeredTitle: "세대교류 봉사 프로그램",
    status: "기관 요청에 따라 사전 협의",
    shortTitle: "세대교류 봉사",
    description:
      "시니어 스마트폰·AI 활용 교육, 세대교류, 한국 주거문화·공동생활 안내와 유휴공간 정리·활용 관련 정보 제공·봉사를 기관과 협의해 진행합니다. 상설 정규반은 아닙니다.",
    href: "/programs/intergenerational-volunteer/",
  },
  {
    slug: "housing-research",
    order: "03",
    title: "주거상생 실태조사",
    registeredTitle: "주거상생 실태조사",
    status: "진행 중",
    shortTitle: "주거상생 실태조사",
    description:
      "청년 주거와 고령층 유휴공간에 관한 실태조사를 진행하고 있습니다. 조사 결과와 공익 보고서는 검토를 거쳐 공개할 예정이며, 현재 공개한 생활 가이드는 자체 교육자료입니다.",
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
