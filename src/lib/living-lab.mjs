import { escapeHtml, icon, layout, pageHero } from "./template.mjs";
import { livingLabScriptUrl } from "./static-assets.mjs";
import { costItems, preparationQuestions } from "../assets/living-lab.mjs";

const date = "2026-09-25";
const hub = "/resources/preparation-room/";
const tools = [
  { slug: "preparation-room", title: "공동생활 준비실", description: "네 가지 질문으로 내 상황을 정리하고, 지금 먼저 이야기할 질문과 생활자료를 찾습니다.", outcome: "내 상황에 맞는 준비 질문표", label: "준비 질문표 만들기", time: "약 3분" },
  { slug: "conversation-practice", title: "생활 장면 대화 연습", description: "가족의 걱정, 다른 생활시간, 방문객과 집안일. 네 장면에서 말문을 여는 방법을 연습합니다.", outcome: "그대로 읽어 보며 시작하는 대화문", label: "네 가지 대화 장면 보기", time: "약 7분" },
  { slug: "living-cost-planner", title: "한 달 생활비 항목 정리", description: "월세와 별도 비용, 포함된 항목, 아직 모르는 비용을 구분합니다. 확인한 금액만 합산합니다.", outcome: "확인한 합계와 빠진 비용 목록", label: "생활비 항목 정리하기", time: "약 5분" },
  { slug: "community-session-kit", title: "세대공감 대화모임 진행안", description: "기관 담당자와 주민이 바로 활용할 수 있는 45분 대화모임 진행안과 빈 기록지를 제공합니다.", outcome: "진행 순서와 합의·보류 기록지", label: "모임 진행안 펼쳐 보기", time: "진행 45분 안팎" },
];

export function livingLabFeature({ compact = false } = {}) {
  return `<section class="living-lab-feature ${compact ? "lab-feature-compact" : "section"}" aria-labelledby="living-lab-title"><div class="${compact ? "" : "container"}"><div class="lab-feature-heading"><div><p class="eyebrow">한지붕 공동생활 준비실</p><h2 id="living-lab-title">함께 살기 전,<br>나의 기준부터 찾아보세요.</h2></div><div><p>상담을 신청하지 않아도 괜찮습니다. 질문을 고르고, 대화를 연습하고, 생활비를 정리하며 내게 필요한 다음 단계를 찾아보세요.</p><p class="lab-tagline">무료 이용 · 회원가입 없음 · 입력정보 전송 없음</p></div></div><div class="lab-tool-grid">${tools.map((tool, index) => `<article class="lab-tool-card"><span class="lab-tool-number" aria-hidden="true">0${index + 1}</span><p class="resource-meta">${tool.time}</p><h3>${tool.title}</h3><p>${tool.description}</p><p class="lab-card-outcome">남는 것 · ${tool.outcome}</p><a class="text-link" href="/resources/${tool.slug}/">${tool.label}${icon("arrow")}</a></article>`).join("")}</div></div></section>`;
}

function localNotice() {
  return `<div class="lab-privacy" id="lab-privacy"><strong>개인정보 없이 이용하세요.</strong><p>선택과 입력은 현재 화면에서만 처리합니다. 한지붕에 전송하거나 자동 저장하지 않습니다. 이름·연락처·상세주소를 적지 마세요. 인쇄본과 저장한 파일은 이용자가 관리하며, 공용 기기에서는 이용 후 내용을 지워 주세요.</p></div>`;
}

function resetMarkup(attribute, label = "선택") {
  return `<details class="lab-reset" data-lab-reset><summary>${label} 모두 지우기</summary><p>지운 내용은 되돌릴 수 없습니다.</p><button class="button button-secondary" type="button" ${attribute}>${label} 지우기 확인</button></details>`;
}

function noteField(id, label, hint) {
  return `<div class="worksheet-field"><label for="${id}">${label}</label><p class="field-hint" id="${id}-hint">${hint}</p><textarea id="${id}" rows="3" maxlength="1000" autocomplete="off" data-worksheet aria-describedby="${id}-hint lab-privacy"></textarea><div class="print-answer" data-print-answer="${id}" aria-hidden="true"></div></div>`;
}

function memoControls() {
  return `<div class="reader-actions"><button class="print-button" type="button" data-print>${icon("print")}안내와 메모 인쇄하기</button><details data-clear-section hidden><summary>내 메모 모두 지우기</summary><p>지운 내용은 되돌릴 수 없으니 필요한 메모는 먼저 인쇄하세요.</p><button class="button button-secondary" type="button" data-clear-worksheet>메모 지우기 확인</button></details><p role="status" data-clear-status></p></div>`;
}

const preparationBody = () => `<section class="section lab-section"><div class="container lab-layout"><div>
  <nav class="lab-jumps" aria-label="준비실 이용 순서"><a href="#preparation-questions">네 가지 질문 고르기</a><a href="#preparation-reading">선택하기 전 읽을 내용</a><a href="#other-tools">다른 도구 보기</a></nav>
  ${localNotice()}
  <section class="lab-tool" id="preparation-questions" data-preparation aria-labelledby="preparation-heading"><p class="eyebrow">내 상황 정리</p><h2 id="preparation-heading">어디부터 이야기하면 좋을까요?</h2><p>각 질문에서 한 가지를 골라 주세요. 공동생활 가능 여부나 안전을 판정하는 검사가 아니라, 읽을 자료와 대화 주제를 정하는 도구입니다.</p><p class="lab-progress" data-preparation-progress role="status">0 / 4개 선택</p>
  ${preparationQuestions.map((q, n) => `<fieldset class="lab-question" data-question="${q.id}"><legend><span>${n + 1}.</span> ${q.title}</legend>${q.options.map(([value, label]) => `<label class="lab-option"><input type="radio" name="${q.id}" value="${value}" autocomplete="off" aria-describedby="lab-privacy"><span>${label}</span></label>`).join("")}</fieldset>`).join("")}
  <p class="lab-error" data-preparation-error role="alert" hidden></p><button class="button" type="button" data-preparation-run hidden>나의 준비 질문표 만들기${icon("arrow")}</button>${resetMarkup("data-preparation-reset")}
  <noscript><p>자동 정리 기능을 이용하려면 자바스크립트가 필요합니다. 아래 안내와 자료를 읽으며 종이에 질문을 정리할 수도 있습니다.</p></noscript></section>
  <section class="lab-result" data-preparation-result hidden aria-labelledby="preparation-result-heading"><p class="eyebrow">내 화면에서 만든 정리표</p><h2 id="preparation-result-heading" tabindex="-1">지금 함께 살펴볼 질문</h2><p>선택한 주제에 따른 안내입니다. 상담 접수·입주 신청·전문가 진단 결과가 아닙니다.</p><h3>먼저 기억할 점</h3><ul data-result-notes data-result-list></ul><h3 data-result-topic></h3><p class="lab-key-question" data-result-question></p><h3>내가 선택한 내용</h3><ul data-result-answers data-result-list></ul><div class="lab-result-actions"><a class="text-link" href="/resources/" data-result-link="topic">관련 자료 보기</a><a class="text-link" href="/resources/" data-result-link="next">다음 단계 보기</a><button type="button" class="print-button" data-print-result>${icon("print")}이 정리표 인쇄하기</button><a href="#preparation-questions">선택 수정하기</a></div><p class="lab-print-source">한지붕 공동생활 준비실 · https://hanjibung.kr/resources/preparation-room/ · 교육용 대화 도구</p></section>
  <article class="prose lab-reading" id="preparation-reading"><h2>결정을 서두르지 않기 위한 세 가지 기준</h2><h3>1. 빈방이 있다고 함께 살아야 하는 것은 아닙니다</h3><p>공간을 그대로 두기, 취미나 가족 방문을 위한 공간으로 쓰기, 공동생활에 대해 더 알아보기는 모두 검토할 수 있는 선택입니다. ‘얼마를 받을까’에 앞서 현재의 생활에서 바꾸고 싶은 것과 유지하고 싶은 것을 구분하세요. 함께 살고 싶지 않다는 의견도 충분한 답입니다.</p><h3>2. 공간의 크기보다 일상의 경계를 먼저 이야기합니다</h3><p>문을 닫고 쉬는 시간, 방에 들어오기 전 허락을 구하는 방법, 냉장고와 수납장의 구역처럼 하루의 장면을 떠올려 보세요. ‘서로 배려한다’는 말은 사람마다 뜻이 다릅니다. 누구나 같은 행동을 떠올릴 수 있는 말로 바꾸어 적는 것이 도움이 됩니다.</p><h3>3. 생활 대화와 전문 확인은 나눕니다</h3><p>청소 순서와 방문객 연락 방법은 당사자가 이야기할 수 있습니다. 계약의 권리·의무, 세금, 체류와 시설 안전은 이 도구로 판단할 수 없습니다. <a href="/resources/korean-housing-culture/">공식 안내기관을 찾는 방법</a>에서 질문에 맞는 경로를 확인하세요.</p><h3>무엇을 하게 되나요?</h3><p>‘나의 준비 질문표’는 선택한 입장과 고민에 맞는 대화 질문을 보여줍니다. 가능성 점수, 예상 월세, 입주자 추천은 계산하지 않습니다. 정리표를 인쇄해 가족과 읽거나, 필요한 내용만 전화·이메일 상담에서 질문할 수 있습니다. 한지붕은 입주자 연결이나 계약대행을 제공하지 않습니다.</p></article>
  </div>${labAside()}</div></section><section class="section" id="other-tools"><div class="container">${relatedTools("preparation-room")}</div></section>`;

const scenarios = [
  { id: "family", label: "가족의 생각이 다를 때", scene: "부모님은 빈방 활용에 관심이 있지만 자녀는 낯선 사람과 생활하는 것이 걱정됩니다.", question: "어떤 말로 대화를 시작할까요?", choices: [
    ["방이 비어 있으니 일단 시작해 봐요.", "결정을 먼저 권하면 망설이는 이유를 듣기 어렵습니다. ‘아직 결정하지 않아도 괜찮다’는 점부터 확인해 보세요."],
    ["원하는 점과 걱정되는 점을 각각 한 가지씩 말해 볼까요?", "희망과 걱정을 따로 듣는 출발점입니다. 한쪽의 이야기가 끝나기 전에 해결책을 제시하지 않고, 들은 내용을 다시 확인해 보세요."],
    ["가족이 반대하니 더 이야기하지 않는 게 좋겠어요.", "걱정을 존중하되 당사자의 생각을 대신 결론 내리지는 않습니다. 대화를 멈추고 싶은지, 정보를 더 알아보고 싶은지 먼저 물어보세요."],
  ], example: ["거주자: 방을 활용하고 싶은 마음은 있지만 조용히 지내는 시간은 지키고 싶어요.", "가족: 바로 결정하는 것이 걱정이었어요. 먼저 어떤 공간을 함께 쓰게 되는지 알아보고 싶어요.", "함께: 오늘은 결론을 내리지 않고, 각자 꼭 지키고 싶은 기준만 적어 봅시다."], takeaway: "합의: 더 알아보기. 보류: 공동생활 시작 여부. 다음 질문: 각자의 개인시간은 어떻게 보장할까?" },
  { id: "routine", label: "생활시간이 다를 때", scene: "한 사람은 일찍 잠들고, 다른 사람은 늦게 귀가해 주방을 사용합니다. 누가 잘못했는지를 먼저 따지면 대화가 막힐 수 있습니다.", question: "불편을 구체적으로 전하는 말은 무엇일까요?", choices: [
    ["원래 늦게 다니는 사람과는 못 살겠어요.", "사람을 평가하는 말 대신 실제로 불편했던 소리와 시간대를 나누세요. 생활시간이 다른 이유를 모두 설명할 의무를 요구할 필요는 없습니다."],
    ["밤에 주방 소리 때문에 깼어요. 쉬는 시간에 어떤 사용 방식을 정하면 좋을까요?", "관찰한 상황, 나에게 미친 영향, 의논할 행동을 구분한 표현입니다. 무조건 귀가를 금지하기보다 조리·설거지·통화처럼 조정할 수 있는 행동을 찾아보세요."],
  ], example: ["거주자: 쉬는 시간에 설거지 소리가 들리면 잠에서 깨요.", "청년: 늦게 돌아오는 날이 있어요. 그 시간에는 간단히 먹고 설거지는 다음 날 하는 건 어떨까요?", "함께: 쉬는 시간과 가능한 주방 사용 범위를 적고, 불편이 남는지 다시 이야기합시다."], takeaway: "사람의 성향을 단정하지 않고, 불편한 행동·조정할 방법·다시 확인할 시점을 남깁니다." },
  { id: "visitors", label: "방문객 기준이 다를 때", scene: "한 사람에게는 잠깐의 친구 방문이 자연스럽지만, 다른 사람에게는 미리 알지 못한 방문이 부담스러울 수 있습니다.", question: "어떤 기준을 같이 정하면 좋을까요?", choices: [
    ["내 손님이니 따로 알릴 필요는 없어요.", "개인적인 만남도 공용공간 이용에 영향을 줄 수 있습니다. 방문 전 알릴 방법, 머무는 시간, 공용공간 이용 여부를 함께 확인해 보세요."],
    ["방문과 숙박을 나누고, 알릴 방법과 사용할 공간을 정해 볼까요?", "낮 방문과 숙박을 같은 약속으로 뭉뚱그리지 않는 접근입니다. 거주자와 청년 양쪽의 방문객에 적용할 기준을 함께 정합니다."],
  ], example: ["청년: 친구와 잠깐 공부하고 싶은데, 방문 전에 어떻게 말씀드리면 좋을까요?", "거주자: 미리 알면 좋겠어요. 거실 사용과 늦은 시간 방문은 따로 이야기해 봐요.", "함께: 각자의 손님에게 같은 기준을 설명하고, 숙박은 별도로 합의합시다."], takeaway: "미리 알림, 시간, 공용공간, 숙박을 구분합니다. 합의하지 않은 부분은 허용된 것으로 단정하지 않습니다." },
  { id: "roles", label: "식사·집안일 기대가 다를 때", scene: "한 사람은 함께 살면 식사를 챙기거나 일을 도와주는 것이 당연하다고 생각할 수 있습니다. 다른 사람은 독립적인 주거생활을 기대할 수 있습니다.", question: "어떤 부분을 먼저 분리해서 이야기할까요?", choices: [
    ["가족처럼 살면 알아서 서로 해 주는 거죠.", "‘가족처럼’이라는 말의 기대가 다를 수 있습니다. 식사 준비, 개인 심부름, 공용공간 청소를 나누어 구체적으로 확인하세요."],
    ["각자 생활은 스스로 하고, 함께 쓰는 공간의 일만 따로 정해 볼까요?", "식사 제공이나 돌봄을 당연한 의무로 두지 않는 출발점입니다. 자발적인 도움과 정기적인 역할을 구분하고, 원하지 않는 요청에는 거절할 수 있어야 합니다."],
  ], example: ["거주자: 식사는 각자 준비하는 것이 편해요.", "청년: 저도 그래요. 주방 사용 후 정리와 공용 쓰레기는 어떻게 나누면 좋을까요?", "함께: 개인적인 부탁은 거절할 수 있고, 공용공간 관리는 지킬 수 있는 범위로 적읍시다."], takeaway: "함께 거주한다는 이유만으로 식사·돌봄·개인 심부름을 맡는 것은 아닙니다. 서로 이해한 범위를 다시 확인합니다." },
];

const conversationBody = () => `<section class="section lab-section"><div class="container lab-layout"><article>
  <div class="notice"><h2>정답을 맞히는 시험이 아닙니다</h2><p>아래는 대화 방법을 설명하기 위해 한지붕이 구성한 <strong>교육용 상황과 예문</strong>입니다. 실제 참여자의 발언이나 활동 성과가 아닙니다. 한 가지 표현이 모든 갈등을 해결하지는 않으므로 상대가 대화에 동의하는지부터 확인하세요.</p></div>
  <nav class="lab-jumps" aria-label="대화 장면 선택">${scenarios.map(s => `<a href="#scene-${s.id}">${s.label}</a>`).join("")}</nav>
  ${scenarios.map((s, n) => `<section class="lab-scenario" id="scene-${s.id}"><p class="eyebrow">장면 0${n + 1}</p><h2>${s.label}</h2><p>${s.scene}</p><h3>${s.question}</h3><p>말풍선을 펼쳐 표현에 담긴 차이를 살펴보세요.</p><div class="lab-dialogue-options">${s.choices.map(([line, response]) => `<details class="resource-details"><summary>${line}</summary><p>${response}</p></details>`).join("")}</div><div class="lab-dialogue"><h3>함께 읽어 보는 대화 예문</h3>${s.example.map(line => `<p>${line}</p>`).join("")}</div><p class="lab-takeaway"><strong>대화 뒤 남길 것</strong> ${s.takeaway}</p></section>`).join("")}
  <section class="lab-reading prose"><h2>세 문장으로 내 표현을 바꿔 보세요</h2><p>“항상 그러세요” 대신 언제, 어디서, 어떤 일이 있었는지 짧게 말합니다. “배려가 없어요” 대신 내가 느낀 불편을 설명합니다. 마지막에는 상대가 답할 수 있는 작은 제안을 질문으로 남깁니다.</p>${localNotice()}${noteField("dialogue-observation", "1. 내가 관찰한 상황", "‘어제 늦은 시간에 공용공간의 소리가 들렸어요’처럼 행동을 적습니다.")}${noteField("dialogue-impact", "2. 내가 느낀 불편 또는 필요한 점", "사람에 대한 평가보다 내 생활에 생긴 영향을 적습니다.")}${noteField("dialogue-request", "3. 함께 의논할 작은 제안", "상대가 거절하거나 다른 방법을 제안할 수 있는 질문으로 적어 보세요.")}${memoControls()}<h3>대화 연습만으로 해결하려 하지 않아야 할 때</h3><p>대화를 원하지 않는 사람에게 설명을 강요하지 마세요. 위협이나 폭력이 있는 상황에서는 둘만의 조정을 우선하지 말고 안전한 장소와 긴급 도움을 먼저 확보하세요. 계약 권리나 금전 분쟁은 생활규칙 예문만으로 판단하지 말고 <a href="/resources/korean-housing-culture/">해당 분야 공식 상담기관</a>에 확인하세요.</p></section>
  </article>${labAside()}</div></section>`;

const costBody = () => `<section class="section lab-section"><div class="container lab-layout"><div>
  <article class="prose lab-reading"><h2>월세 하나만으로 비교하기 어려운 이유</h2><p>같은 월세라도 관리비에 포함되는 항목, 계절별 공과금, 통학·출퇴근 비용에 따라 생활에서 지출하는 금액은 다를 수 있습니다. 이 표에서는 <strong>내가 확인한 월 금액만 더하고, 아직 모르는 항목은 별도로 남깁니다.</strong></p><p>예상 임대수익이나 적정 월세를 계산하지 않습니다. 계약상 납부 의무를 정하는 도구도 아닙니다. 아래 항목 밖의 식비·휴대전화 요금·보증금·이사비·가구 구입비 등은 별도로 살펴보세요.</p></article>
  ${localNotice()}<section class="lab-tool" data-cost-planner aria-labelledby="cost-heading"><p class="eyebrow">한 달 기준 · 금액 단위 원</p><h2 id="cost-heading">확인한 비용과 모르는 비용 나누기</h2><p>각 항목에서 상태를 고르세요. ‘포함·별도 지출 없음’은 이미 다른 항목에 넣었거나 해당 비용이 없음을 확인했을 때만 선택합니다.</p>
  ${costItems.map(([id, label, hint]) => `<fieldset class="lab-cost-row"><legend>${label}</legend><p id="cost-${id}-hint" class="field-hint">${hint}</p><label for="cost-${id}-mode">${label} 확인 상태</label><select id="cost-${id}-mode" aria-describedby="cost-${id}-hint"><option value="unknown">아직 모름 · 확인 필요</option><option value="known">금액을 확인했어요</option><option value="included">포함 · 별도 지출 없음</option></select><div data-amount-row><label for="cost-${id}">${label} 월 금액 (원)</label><input type="text" id="cost-${id}" inputmode="numeric" pattern="[0-9]{1,8}" maxlength="8" autocomplete="off" aria-describedby="cost-${id}-hint lab-privacy" placeholder="쉼표 없이 숫자 입력"></div></fieldset>`).join("")}
  <p class="lab-error" data-cost-error role="alert" hidden></p><button type="button" class="button" data-cost-run hidden>확인한 금액 합산하기${icon("arrow")}</button>${resetMarkup("data-cost-reset", "금액과 상태")}<p role="status" data-cost-reset-status></p><noscript><p>자동 합산에는 자바스크립트가 필요합니다. 아래 인쇄 버튼으로 빈 항목표를 인쇄하고 직접 더할 수 있습니다.</p></noscript></section>
  <section class="lab-result" data-cost-result hidden aria-labelledby="cost-result-heading"><p class="eyebrow">입력한 값만 합산</p><h2 tabindex="-1" id="cost-result-heading">확인한 월 금액의 합계</h2><p class="lab-cost-total" data-cost-total></p><p class="lab-cost-state" data-cost-state></p><ul data-cost-lines></ul><p>다른 항목에 포함한 금액은 중복으로 더하지 않습니다. 확인되지 않은 금액은 합계에서 제외했으며, 0원이라고 판단한 것이 아닙니다. 계절이나 이용량에 따라 달라지는 비용도 다시 확인하세요.</p><div class="lab-result-actions"><button class="print-button" type="button" data-print-result>${icon("print")}비용 정리표 인쇄하기</button><a class="text-link" href="/resources/consultation-preparation/">청년 주거 체크리스트로 이어가기</a></div><p class="lab-print-source">한지붕 생활비 항목 정리 · https://hanjibung.kr/resources/living-cost-planner/ · 시세 추정·법률 판단이 아닌 단순 합산</p></section>
  <article class="prose lab-reading"><h2>금액을 확인할 때 함께 물어볼 질문</h2><ol><li><strong>포함 범위:</strong> 관리비에 전기·수도·가스·인터넷 중 무엇이 포함되는지 항목별로 물어보세요.</li><li><strong>변동 범위:</strong> 고정 금액인지 사용량에 따라 달라지는지, 여름·겨울에는 무엇이 달라지는지 확인하세요.</li><li><strong>나누는 방식:</strong> 함께 쓰는 비용의 전체 금액과 내가 부담할 금액을 구분하세요. 이 표에는 본인 부담분만 입력합니다.</li><li><strong>확인 근거:</strong> 누구에게 언제 확인했는지 개인 메모로 남기되, 다른 사람의 청구서·계좌·개인정보를 사이트에 입력하지 마세요.</li></ol><h3>한 번 드는 비용은 따로 적습니다</h3><p>보증금처럼 처음 준비해야 하는 금액과 월별 소비를 섞으면 비교가 어렵습니다. 계약 전 필요한 돈, 매달 드는 돈, 상황에 따라 달라지는 돈을 별도 줄로 적어 보세요. 보증금 반환이나 계약 조건은 이 계산 결과로 판단할 수 없습니다.</p><h3>낮은 합계가 언제나 더 나은 선택은 아닙니다</h3><p>통학시간, 개인공간, 쉴 수 있는 시간, 생활규칙처럼 금액으로 표시하기 어려운 조건도 함께 살펴보세요. 비용을 모두 확인하지 못한 집과 확인을 마친 집의 합계를 그대로 비교하지 않는 것이 중요합니다.</p><button class="print-button" type="button" data-print>${icon("print")}안내와 항목표 전체 인쇄하기</button></article>
  </div>${labAside()}</div></section>`;

const sessionBody = () => `<section class="section lab-section"><div class="container lab-layout"><article class="prose">
  <div class="resource-summary"><h2>이 모임에서 남길 것은 ‘입주 결정’이 아닙니다</h2><p>서로 중요하게 생각하는 생활 기준 한 가지, 아직 합의하지 않은 질문 한 가지, 다음에 확인할 방법 한 가지를 남깁니다. 기관 담당자·주민 모임이 자유롭게 참고할 수 있는 한지붕 자체 교육 진행안입니다. 실제로 개최한 행사나 확정 모집 공고가 아닙니다.</p></div>
  <nav class="lab-jumps" aria-label="진행안 목차"><a href="#session-before">모임 전 준비</a><a href="#session-plan">45분 진행 순서</a><a href="#session-notes">빈 기록지</a><a href="#session-after">모임 뒤 점검</a></nav>
  <section id="session-before"><h2>모임 전에 준비할 것</h2><p>진행자 한 명, 큰 글씨로 인쇄한 대화 예문, 빈 종이와 필기구를 준비하세요. 예상 시간은 약 45분이며 참여자의 읽기 속도와 대화 속도에 맞춰 줄이거나 나눌 수 있습니다. 이 순서를 모두 끝내는 것보다 자발적으로 말할 수 있는 분위기가 먼저입니다.</p><ul><li>한 사람이 대신 답하지 않도록 각자 생각할 시간을 줍니다.</li><li>본인 경험을 이야기하지 않고 예문 속 상황만 다루어도 됩니다.</li><li>실명·집 주소·소득·건강정보·체류자격 등 사적인 내용을 묻지 않습니다.</li><li>설명 없이 건너뛰거나 모임을 쉬어도 괜찮다고 처음에 안내합니다.</li><li>사진 촬영과 외부 기록 공개는 대화 참여와 별개의 동의를 확인합니다.</li></ul></section>
  <section id="session-plan"><h2>45분 대화모임 진행 순서</h2><ol class="lab-session-steps">
  <li><span>0~5분</span><h3>오늘의 범위 정하기</h3><p>“오늘은 누군가와 살기로 결정하지 않습니다. 서로의 생활 기준을 듣고, 더 확인할 질문을 남깁니다.”라고 시작하세요. 대답하지 않을 권리와 서로의 말을 끊지 않는 약속을 확인합니다.</p></li>
  <li><span>5~15분</span><h3>같은 장면, 다른 생각 듣기</h3><p><a href="/resources/conversation-practice/#scene-routine">생활시간이 다른 장면</a>을 함께 읽습니다. ‘누가 맞는가’ 대신 각자가 불편할 수 있는 점을 하나씩 말합니다. 진행자는 평가하지 않고 ‘조용한 시간’, ‘귀가 후 식사’처럼 주제로 받아 적습니다.</p></li>
  <li><span>15~30분</span><h3>막연한 부탁을 작은 약속으로 바꾸기</h3><p>‘서로 배려하기’를 시간·공간·행동으로 나눕니다. 예를 들어 휴식 시간, 주방을 쓴 뒤 정리할 범위, 상황이 달라졌을 때 알릴 방법을 질문합니다. 현실에서 지키기 어려운 약속은 합의된 것으로 기록하지 않습니다.</p></li>
  <li><span>30~40분</span><h3>합의와 보류를 나눠 적기</h3><p>서로 이해한 점, 의견이 다른 점, 전문기관에 확인할 점을 나눕니다. 계약이나 세금 질문이 나오면 진행자가 답을 단정하지 않고 공식 문의 경로를 안내합니다.</p></li>
  <li><span>40~45분</span><h3>당사자에게 다시 확인하기</h3><p>정리한 문장을 읽고 “내 생각과 다르게 적힌 부분이 있나요?”라고 묻습니다. 다음 대화를 원하는지 확인하고, 원하지 않으면 추가 연락이나 참여를 당연하게 정하지 않습니다.</p></li></ol></section>
  <section id="session-notes"><h2>모임에서 사용할 빈 기록지</h2><p>실명이나 참석자 명단 대신 이야기한 주제만 남기세요. 공유하기 전에는 문장으로 특정 사람을 알아볼 수 없는지 확인합니다.</p>${localNotice()}${noteField("session-shared", "서로 이해한 기준", "생활시간·공용공간처럼 주제와 기준만 적습니다.")}${noteField("session-pending", "아직 생각이 다른 질문", "보류를 실패로 표현하지 않고, 각각의 이유를 적습니다.")}${noteField("session-next", "다음에 확인할 내용과 방법", "당사자가 원하는 후속 확인만 적습니다. 이름·연락처는 적지 마세요.")}${memoControls()}</section>
  <section id="session-after"><h2>모임이 끝난 뒤 진행자가 점검할 것</h2><ul><li>어르신과 청년 중 한쪽만 길게 말하지 않았나요?</li><li>말하지 않거나 결정을 보류한 사람을 설득하지 않았나요?</li><li>생활 대화가 계약·입주·상담 신청으로 오해되지 않았나요?</li><li>기록을 참여자가 이해하는 표현으로 다시 읽어 보았나요?</li><li>외부 공개가 필요한 기록은 별도로 공개 범위를 확인했나요?</li></ul><p>모임의 성과를 발표할 때 이 진행안을 사용했다는 사실과 실제 참석자·실시일·결과를 구분하세요. 자료를 내려받거나 인쇄한 것만으로 실제 행사 실적이 생기지는 않습니다.</p><div class="notice"><h3>한지붕과 함께 기획하고 싶다면</h3><p>기관명, 대상, 희망 주제와 일정 범위를 문의해 주세요. 온라인 자료는 무료로 이용할 수 있습니다. 기관 프로그램은 일정·역할·비용 부담을 별도로 협의한 뒤 진행하며, 문의만으로 개최가 확정되지는 않습니다.</p><a class="text-link" href="/partnership/">기관협력 문의하기${icon("arrow")}</a></div></section>
  </article>${labAside()}</div></section>`;

function labAside() {
  return `<aside class="side-nav lab-aside"><h2>함께 쓰는 도구</h2>${tools.map(t => `<a href="/resources/${t.slug}/">${t.title}</a>`).join("")}<a href="/resources/">모든 생활자료 보기</a><a href="/programs/senior-home-consulting/">전화·이메일 상담 안내</a><p>입주자 연결·계약대행은 제공하지 않습니다.</p></aside>`;
}

function relatedTools(exclude) {
  return `<h2>다음 준비도 내 속도에 맞게</h2><div class="resource-grid">${tools.filter(t => t.slug !== exclude).map(t => `<article class="resource-card"><h3>${t.title}</h3><p>${t.description}</p><a class="text-link" href="/resources/${t.slug}/">${t.label}${icon("arrow")}</a></article>`).join("")}</div>`;
}

const bodies = { "preparation-room": preparationBody, "conversation-practice": conversationBody, "living-cost-planner": costBody, "community-session-kit": sessionBody };
export const livingLabPages = tools.map(tool => ({ ...tool, href: `/resources/${tool.slug}/`, updatedAt: date }));

export function livingLabPage(tool) {
  const body = `${pageHero({ eyebrow: "한지붕 공동생활 준비실 · 무료 교육자료", title: tool.title, description: tool.description, meta: `<div class="page-meta"><span>${tool.time} · 예상 시간</span><span>작성: 한지붕</span><time datetime="${date}">공개·수정 2026.09.25</time></div><p class="lab-editorial-note">생활 대화를 돕기 위해 작성한 자체 콘텐츠입니다. 외부 전문가 검수나 법률·주택 안전 진단을 대신하지 않습니다.</p>` })}${bodies[tool.slug]()}<script type="module" src="${escapeHtml(livingLabScriptUrl)}"></script>`;
  return layout({ title: tool.title, description: tool.description, path: tool.href, body, bodyClass: "living-lab-page", updatedAt: date, publishedAt: date, breadcrumbs: [{ label: "생활자료", href: "/resources/" }, ...(tool.href !== hub ? [{ label: "공동생활 준비실", href: hub }] : []), { label: tool.title, href: tool.href }] });
}
