import { layout, pageHero, escapeHtml, absolute } from './template.mjs';

const date = '2026-09-25';
export const homesharingArticles = [
  {
    slug: 'prepare-unused-room', title: '빈방 활용을 준비하는 방법',
    description: '방을 등록하기 전에 가족의 의견, 개인공간과 공용공간, 생활규칙을 살펴보세요. 한지붕의 전화·이메일 무료상담으로 준비할 질문을 정리할 수 있습니다.',
    sections: [
      ['start', '지금 사는 집에, 안 쓰는 방이 있나요?', '<p>자녀가 독립한 뒤 비어 있는 방, 어느새 짐을 보관하는 공간이 된 방. “우리 집도 방을 활용할 수 있을까?” 하고 궁금하셨나요?</p><p>이 글은 방 등록이나 입주 신청 절차가 아니라, 빈방 활용을 검토하기 전에 준비할 내용을 안내합니다. 처음부터 방을 비우거나 가구를 구입할 필요는 없습니다. 내가 원하는 생활과 가족의 생각부터 살펴보세요.</p>'],
      ['ask', '1. 궁금한 점부터 이야기해 주세요', '<p>빈방 활용과 공동생활에 관한 질문을 전화·이메일로 문의할 수 있습니다. 부모님 댁의 남는 공간이 궁금한 자녀도 상담할 수 있습니다. 한지붕 대표와 운영진이 기초정보와 참고자료를 무료로 안내합니다.</p><p>초기 문의에는 궁금한 점과 답변받을 연락처만 알려주세요. 방 사진, 상세주소, 신분증이나 계약서 원본은 보내지 마세요. 문의만으로 주택 방문이나 방 등록이 진행되지는 않습니다.</p>'],
      ['space', '2. 개인공간과 함께 쓸 공간을 나눠 봅니다', '<p>집주인이 계속 거주하는 집의 빈방을 다른 사람의 개인방으로 활용할 수 있을지 생각해 봅니다. 같은 침실을 공유하거나 집 전체를 비우는 방식과는 구분됩니다.</p><ul><li>개인방에 드나드는 동선과 사생활은 어떨까요?</li><li>주방·욕실·거실은 어느 범위까지 함께 사용할 수 있을까요?</li><li>개인 물건과 공용 물건을 어떻게 구분할까요?</li></ul><p>이 과정은 생각을 정리하는 준비이며 주택의 안전성이나 공동거주 적합성을 판정하는 검사가 아닙니다.</p>'],
      ['family', '3. 가족의 생각과 생활방식을 확인합니다', '<p>먼저 어르신 본인이 원하는 점과 원하지 않는 점을 듣습니다. 가족의 걱정과 의견도 나눠 보고, 아직 합의하지 못한 부분은 결정을 보류합니다.</p><p>취침·기상 시간, 주방 사용, 청소, 방문객, 소음과 공용공간 이용방식을 구체적으로 적어 보세요. 일방적으로 정하기보다 실제 함께 거주할 사람과 서로 확인하고 합의할 항목입니다.</p><p><a href="/resources/family-checklist/">가족과 먼저 이야기할 10가지 질문</a>과 <a href="/resources/shared-living-rules/">생활규칙 작성표</a>를 활용할 수 있습니다.</p>'],
      ['prepare', '4. 정리와 가구 준비는 결정한 뒤에 합니다', '<p>방에 짐이 남아 있어도 상담할 수 있습니다. 어떤 물건을 옮길 수 있는지, 침대·책상·수납공간을 마련할 여지가 있는지 차분히 살펴보세요.</p><p>정리나 가구 구매를 검토한다면 필요한 범위와 예산부터 적어 봅니다. 한지붕은 방 정리 업체나 수리 시공 서비스가 아니며, 물품 구매나 비용 지출을 상담의 조건으로 요구하지 않습니다.</p>'],
      ['next', '5. 방 등록과 계약은 별도로 확인합니다', '<p>실제로 방을 등록하거나 함께 살 사람을 찾기로 했다면, 이용하려는 기관이나 서비스가 무엇을 제공하는지 직접 확인해야 합니다. 모집·소개 방식, 비용, 개인정보 처리, 계약 지원 범위와 문제가 생겼을 때의 문의처를 살펴보세요.</p><p>월세·공과금·기간 등은 따로 확인해야 할 조건입니다. 한지붕은 예상 월세를 산정하거나 임대수익을 보장하지 않으며, 청년을 소개하거나 신원·재학 여부를 확인하고 계약을 대행하지 않습니다.</p><p>계약·세금 등 전문 판단이 필요한 질문은 관련 공공기관이나 자격 있는 전문가에게 확인하세요. 이해하지 못한 조건을 서둘러 결정하지 않아도 됩니다.</p>'],
      ['choice', '준비의 끝은, 나에게 맞는 선택입니다', '<p>빈방이 있다고 반드시 다른 사람과 함께 살아야 하는 것은 아닙니다. 상담 후에는 가족과 더 이야기할 내용과 추가로 확인할 질문을 정리해 보세요. 지금 생활을 유지하거나 결정을 미루는 선택도 존중합니다.</p>'],
    ],
  },
  {
    slug: 'homesharing-basics', title: '홈쉐어링이 낯설다면? 개인방은 따로, 생활공간은 함께',
    description: '같은 집에서 살아도 개인방과 사생활은 존중합니다. 식사·청소·공용공간 등 세대 간 홈쉐어링을 알아볼 때 먼저 나눌 질문을 소개합니다.',
    sections: [
      ['meaning', '살고 있는 집의 빈방에서 생각해 봅니다', '<p>“모르는 사람과 한집에 산다고요?” 홈쉐어링이 낯설다면 가장 먼저 떠오를 질문입니다. 어디까지 함께하고 무엇은 따로 하는지부터 알아보세요.</p><p>이 글에서 세대 간 홈쉐어링은 집주인이 거주하는 집에서 다른 세대의 사람이 개인방을 사용하고, 합의한 공용공간을 함께 이용하는 생활방식을 뜻합니다. 한지붕이 제공하는 입주 상품이나 특정 법률상 주택 유형을 뜻하지 않습니다.</p><p>집주인은 자신의 생활을 이어가고, 청년은 개인방에서 공부하고 쉬는 시간을 가집니다. 주방·거실·욕실은 미리 정한 범위에서 이용하며, 같은 침실을 쓰는 방식과는 다릅니다.</p>'],
      ['meals', '옛날 하숙처럼 밥을 챙겨줘야 하나요?', '<p>집주인이 식사를 차려주거나 청년을 돌보는 것을 전제로 생각할 필요는 없습니다. 청년도 돌봄이나 가사도움을 제공하는 사람으로 여겨서는 안 됩니다.</p><p>함께 식사하거나 대화하는 일은 모두가 원할 때 선택할 수 있습니다. 식재료와 조리도구 사용, 냉장고 보관 공간, 사용 후 정리는 서로 기대하는 바를 구체적으로 이야기해 보세요.</p>'],
      ['privacy', '함께 살아도 각자의 시간과 사생활이 있습니다', '<p>한집에 산다고 늘 함께 시간을 보내거나 자신의 일정을 모두 공유해야 하는 것은 아닙니다. 개인방에 들어가기 전 허락을 구하고, 서로의 물건과 쉬는 시간을 존중하는 것이 중요합니다.</p><ul><li>조용히 쉬고 싶은 시간은 언제인가요?</li><li>개인방과 공용공간의 경계는 어디인가요?</li><li>손님을 초대하기 전에 어떻게 이야기할까요?</li><li>청소와 공용 물품 관리는 어떻게 나눌까요?</li></ul><p>주방과 거실까지 모두 혼자 쓰고 싶다면 공동생활 방식이 자신의 생활과 맞는지 먼저 생각해 보세요.</p>'],
      ['concerns', '낯선 사람과 지내는 일이 걱정된다면', '<p>신원정보를 확인했다는 이유만으로 잘 맞는 사람이나 안전한 생활이 보장되지는 않습니다. 생활시간, 소음, 청소, 방문객과 공간 이용 등 일상에서 중요하게 생각하는 기준을 서로 이야기할 필요가 있습니다.</p><p>별도의 입주 연결 서비스를 이용한다면 어떤 확인 절차가 있는지, 필요한 개인정보와 이용 목적은 무엇인지 해당 운영기관에 문의하세요. 한지붕은 입주자 연결이나 신원 확인 서비스를 제공하지 않으며, 홈페이지에서 신분증·재학증명서·보호자 연락처를 받지 않습니다.</p>'],
      ['communication', '불편함을 말할 방법도 미리 정합니다', '<p>함께 지내며 불편이 생길 때 어떻게 말을 꺼낼지 정해 보세요. “항상 시끄럽다”는 평가보다 언제 어떤 소리로 불편했는지 설명하고, 서로 가능한 방법을 제안할 수 있습니다.</p><p>다만 모든 갈등을 대화만으로 해결할 수 있는 것은 아닙니다. 계약이나 권리에 관한 문제는 전문기관에 확인해야 합니다. 한지붕은 입주 후 정기 점검이나 상시 중재를 제공하지 않습니다.</p><p><a href="/resources/conflict-prevention/">공동생활 갈등 예방 가이드</a>에서 대화를 준비할 예문을 살펴보세요.</p>'],
      ['fit', '수익보다 먼저, 생활에 맞는지 살펴보세요', '<p>빈방 활용이나 주거비 분담을 기대할 수 있지만 실제 비용과 조건은 주택과 계약에 따라 다릅니다. 일정한 월세 수익이나 주거비 절감 효과가 보장되는 것은 아닙니다.</p><p>가족과 충분히 이야기했는지, 개인공간이 있는지, 함께 쓰는 공간의 기준을 정할 수 있는지부터 확인해 보세요. 한지붕의 무료상담에서는 이런 준비 질문과 참고할 생활자료를 안내합니다.</p>'],
    ],
  },
].map(article => ({...article, href: `/resources/${article.slug}/`, updatedAt: date}));

export function homesharingCards() {
  return `<section id="homesharing-articles"><h2>처음 알아보는 홈쉐어링</h2><p>작성형 생활자료 6종과 별도로 읽을 수 있는 안내글입니다. 방 등록이나 입주 신청 기능은 제공하지 않습니다.</p><div class="resource-grid">${homesharingArticles.map(a => `<article class="resource-card"><p class="resource-meta">생활 안내 · 2026년 9월 25일</p><h3>${escapeHtml(a.title)}</h3><p>${escapeHtml(a.description)}</p><a class="text-link" href="${a.href}">안내글 읽기</a></article>`).join('')}</div></section>`;
}

export function homesharingPage(article) {
  const other = homesharingArticles.filter(a => a.slug !== article.slug);
  const body = pageHero({eyebrow:'생활·주거 안내',title:escapeHtml(article.title),description:escapeHtml(article.description)}) + `<section class="section"><div class="container content-layout"><article class="prose"><p class="resource-meta">작성: 한지붕 운영팀 · 게시·수정일 <time datetime="${date}">2026년 9월 25일</time></p><div class="notice"><p>한지붕은 전화·이메일로 기초정보를 무료로 안내합니다. 입주자 연결·계약대행은 제공하지 않습니다.</p></div><nav class="resource-toc" aria-label="글 목차"><h2>이 글에서 살펴볼 내용</h2><ol>${article.sections.map(([id,title])=>`<li><a href="#${id}">${escapeHtml(title)}</a></li>`).join('')}</ol></nav>${article.sections.map(([id,title,content])=>`<section aria-labelledby="${id}"><h2 id="${id}">${escapeHtml(title)}</h2>${content}</section>`).join('')}<h2>궁금한 점부터 함께 정리해요</h2><div class="hero-actions"><a class="button" href="/consultation/">무료상담 문의</a><a class="button button-secondary" href="/resources/">생활자료 보기</a></div><p>한지붕 자체 생활 안내글입니다. 개별 주택의 적합성이나 계약·법률·세무 판단을 대신하지 않습니다.</p></article><aside class="side-nav"><h2>함께 읽기</h2>${other.map(a=>`<a href="${a.href}">${escapeHtml(a.title)}</a>`).join('')}<a href="/programs/senior-home-consulting/">무료상담 범위 확인</a><a href="/resources/">생활자료 전체 보기</a></aside></div></section>`;
  return layout({title:article.title,description:article.description,path:article.href,body,type:'article',publishedAt:date,updatedAt:date,breadcrumbs:[{label:'생활자료',href:'/resources/'},{label:article.title,href:article.href}],jsonLd:{'@context':'https://schema.org','@type':'Article',headline:article.title,datePublished:date,dateModified:date,author:{'@type':'Organization',name:'한지붕'},mainEntityOfPage:absolute(article.href)}});
}
