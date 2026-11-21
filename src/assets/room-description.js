// The final registration contains the host's reviewed fields, never the chat transcript.
export const roomFields = Object.freeze({
  location: "동네", rooms: "남는 방", availability: "입주 가능 시기",
  rent: "희망 월세", deposit: "보증금", fee: "관리비", homeType: "주택 유형", area: "방 면적", floor: "층수",
});
export const requiredFields = ["location", "rooms", "availability"];
export const roomQuestions = {
  location: "방이 있는 동네나 가까운 역은 어디인가요?",
  rooms: "학생에게 내어줄 방은 몇 개인가요?",
  availability: "언제부터 입주할 수 있나요?",
};

// A small, on-device character n-gram classifier for colloquial move-in replies.
// Amounts, dates, and addresses are extracted separately and never predicted.
const examples = {
  "바로 가능": ["지금 들어와도 돼요", "시기는 오늘부터예요", "당장 들어올 수 있어요", "언제든 바로 들어오세요", "지금 비어서 곧장 가능해요", "오늘부터 살 수 있어요", "바로 입주할 수 있어요", "즉시 가능해요"],
  "일정 협의": ["날짜는 맞춰 볼게요", "입주일은 상의해서 정해요", "아직 날짜는 모르겠어요", "들어오는 때는 서로 조율해요", "입주는 의논해 봐야 해요", "날짜는 나중에 정하고 싶어요", "입주 시기는 협의 가능해요", "아직 정해진 날짜가 없어요"],
};
function grams(value) {
  const s = value.replace(/[^가-힣]/g, "");
  return new Set(Array.from({ length: Math.max(0, s.length - 1) }, (_, i) => s.slice(i, i + 2)));
}
const samples = Object.entries(examples).flatMap(([value, texts]) => texts.map(text => [value, grams(text)]));
function moveInIntent(text) {
  const tokens = grams(text), scores = {};
  if (tokens.size < 3) return "";
  for (const [value, sample] of samples) {
    let intersection = 0;
    for (const token of sample) if (tokens.has(token)) intersection++;
    const similarity = intersection / Math.sqrt(tokens.size * sample.size);
    scores[value] = Math.max(scores[value] || 0, similarity);
  }
  const [[first, a], [, b]] = Object.entries(scores).sort((left, right) => right[1] - left[1]);
  return a >= .43 && a - b > .12 ? first : "";
}

const geoWord = "(?:[가-힣]{1,9}(?:[1-9](?:·[1-9])?)?(?:특별자치시|특별시|광역시|시|군|구|읍|면|동|리|역)|(?:경기|강원|제주)도|(?:경상|충청|전라)[남북]도|(?:강원|전북|제주)특별자치도|서울|부산|대구|인천|광주|대전|울산|세종|제주|여의도|김포|홍대|판교)";
const geography = new RegExp("(?<![가-힣0-9])(" + geoWord + "(?:\\s+" + geoWord + "){0,3})(?=에서|에는|근처|인근|이에|이예|이고|인데|이랑|에|의|은|는|이야|입니다|예요|이요|이구|[\\s,.!?·]|$)", "g");
const notPlaces = new Set(["관리", "거리", "자리", "처리", "수리", "정리", "미리", "우리", "아무리", "리모델링", "혹시", "즉시", "당시", "상시", "다시", "표시", "임시", "가구", "다가구", "공동", "거주면", "되면", "하면", "출구", "입구"]);
const roomNumbers = { 한: 1, 하나: 1, 일: 1, 두: 2, 둘: 2, 이: 2, 세: 3, 셋: 3, 삼: 3, 네: 4, 넷: 4, 사: 4, 다섯: 5, 여섯: 6 };
function numberOfRooms(text, focused) {
  const count = "(\\d{1,2}|하나|다섯|여섯|한|두|둘|세|셋|네|넷)";
  const subset = text.match(new RegExp("(?:개|칸)(?:\\s*중(?:에서)?|인데[,\\s]*(?:그중)?|가?\\s*있지만)\\s*" + count + "\\s*(?:개|칸)?만"));
  const corrected = text.match(new RegExp("(?:방\\s*(?:은|이)?\\s*|^\\s*)" + count + "\\s*(?:개|칸)\\s*(?:가?\\s*아니(?:라|고)|말고)\\s*" + count + "\\s*(?:개|칸)"));
  const before = text.match(new RegExp("(?:남는\\s*방|빈\\s*방|방)\\s*(?:은|는|이|을|이요)?\\s*" + count + "\\s*(?:개|칸|실|뿐|자리|(?=예요|이에요|입니다|[\\s,.!?]|$))"));
  const after = text.match(new RegExp(count + "\\s*(?:개|칸)(?:의|짜리)?\\s*(?:빈\\s*)?방"));
  const bare = focused === "rooms" && text.match(new RegExp("^\\s*" + count + "\\s*(?:개|칸|실)?(?:\\s*이상)?(?:예요|이에요|입니다|요)?[.!]?\\s*$"));
  const found = corrected?.[2] || (subset || before || after || bare)?.[1];
  const n = Number(found) || roomNumbers[found];
  return n >= 1 && n <= 10 ? String(n) + "개" + (/개\s*이상/.test(text) ? " 이상" : "") : "";
}
const moveInTime = /(?<!\d)(?:20\d{2}[-./]\d{1,2}[-./]\d{1,2}|(?:20\d{2}년\s*)?\d{1,2}\s*월(?:\s*(?:\d{1,2}\s*일|초순?|중순|말))?|(?:다다음|다음|이번)\s*(?:달|주)|내달|내년|올해|한\s*달\s*(?:후|이내|뒤)|\d+\s*(?:주|개월)\s*(?:후|이내|뒤))(?:\s*(?:초순?|중순|말))?(?:\s*(?:부터|이후))?/g;
export function validMoveInDate(value) {
  const date = value.match(/^(?:(\d{4})년\s*)?(\d{1,2})\s*월(?:\s*(\d{1,2})\s*일)?/) ||
    value.match(/^(\d{4})[-./](\d{1,2})[-./](\d{1,2})/);
  if (!date) return true;
  const month = Number(date[2]), day = Number(date[3] || 1);
  return month >= 1 && month <= 12 && day >= 1 && day <= new Date(Date.UTC(Number(date[1] || 2000), month, 0)).getUTCDate();
}
function moveIn(text, focused, previous) {
  // Keep the rejection with the old date when the speaker corrects it.
  const clauses = text.split(/[,;!?\n]|(?<!\d)\.|\.(?!\d)|(?<=말고|아니라|아니고|어렵고|어렵지만|불가능하고|되고|되지만|협의하고|수리하고|공사하고|끝나고)\s*/);
  const choices = new Set();
  let withdrewPrevious = false;
  const comparable = value => value.replace(/\s|부터|이후/g, "");
  for (const clause of clauses) {
    const otherSubject = /월세|관리비|보증금|임대료|가격|공사|수리/.test(clause);
    const aboutMove = /입주|이사|들어오|들어와/.test(clause);
    const aboutTime = aboutMove || (!otherSubject && (focused === "availability" || /날짜|시기|일정/.test(clause)));
    const times = [...clause.matchAll(moveInTime)]
      .filter(hit => !/(?:월세|관리비|보증금|임대료|공사|수리)(?:[은는이가를을])?\s*$/.test(clause.slice(0, hit.index)))
      .map(hit => hit[0].trim());
    if (otherSubject && !aboutMove && !/부터\s*(?:가능|들어)|(?:바로|즉시)\s*가능/.test(clause)) continue;
    if (!times.length && /(?:바로|즉시|당장|오늘부터|지금부터)(?:\s*(?:입주|들어|가능|돼|되|비어|안|불가)|\s*$)/.test(clause)) times.push("바로 가능");
    if (/말고|아니라|아니고|아닌|아니에요|않|못|불가|어렵|어려|힘들|안\s*(?:돼|되|된|될|됩|들어|맞)/.test(clause)) {
      if (previous && times.some(value => comparable(previous).startsWith(comparable(value)))) withdrewPrevious = true;
      continue;
    }
    if (times.length) {
      for (const time of times) if (validMoveInDate(time)) choices.add(time);
    } else if (aboutTime) {
      const intent = /미정|(?:일정|입주|날짜).{0,8}협의|아직.{0,5}(?:몰라|모르)/.test(clause) ? "일정 협의" : moveInIntent(clause);
      if (intent) choices.add(intent);
    }
  }
  if (choices.size === 1) return [...choices][0];
  return withdrewPrevious ? "" : undefined;
}

// Accept an explicit won unit or a clear no-cost/negotiable answer. A bare number is ambiguous.
const amount = "(?:[\\d,]+(?:\\.\\d+)?\\s*억(?:\\s*[\\d,]+(?:\\.\\d+)?\\s*(?:천)?만)?\\s*(?:원)?|[\\d,]+(?:\\.\\d+)?\\s*(?:천만|백만|십만|만|천)\\s*(?:원)?|[\\d,]+\\s*원|(?:별도\\s*)?없(?:음|는|고|어(?:요)?|습니다)|안\\s*받(?:아요|을게요|습니다)|무료|협의|미정|포함)";
const moneyLabels = { rent: "희망\\s*월세|월세|(?:월\\s*)?임대료|매달", deposit: "보증금", fee: "관리비" };
function money(text, label) {
  const matches = [...text.matchAll(new RegExp("(?:" + label + ")\\s*(?:[은는이가를을]|로)?\\s*[:：]?\\s*(" + amount + ")", "g"))];
  const match = matches.at(-1);
  if (!match) return "";
  const correction = text.slice(match.index + match[0].length).match(new RegExp("^\\s*(?:이?\\s*아니라|이?\\s*아니고|말고)\\s*(" + amount + ")"));
  const value = (correction?.[1] || match[1]).trim();
  if (/없|안\s*받|무료/.test(value)) return "없음";
  return /\d/.test(value) && !value.endsWith("원") ? value + " 원" : value;
}
// With an explicitly selected chip, a short answer can name just the new value.
// A bare number, a question, or a value labelled for a different field is not a price.
export function correctionPatch(text, field, proposed = {}, previousAvailability = "") {
  const clean = String(text).trim().normalize("NFKC");
  if (!Object.hasOwn(roomFields, field) || !clean || roomChatPrivate(clean)) return {};
  if (!requiredFields.includes(field) && /^(?:비우기|지우기|삭제|(?:지워|빼|삭제해)\s*(?:줘|주세요|요)?)[.!]?$/.test(clean)) return { [field]: "" };
  if (/[?？]|(?:까요|나요|을까|일까)[.!]?$/.test(clean)) return {};
  const replacement = clean.split(/말고|아니라|아니고/).at(-1).trim();
  if (!replacement || (field !== "availability" && /아니에요|아닙니다|않아|불가능|어려워/.test(replacement))) return {};
  const local = extractRoom(replacement, field, previousAvailability);
  if (Object.hasOwn(moneyLabels, field)) {
    const label = moneyLabels[field];
    if (Object.entries(moneyLabels).some(([key, pattern]) => key !== field && new RegExp(pattern).test(clean)) && !new RegExp(label).test(clean)) return {};
    const standalone = replacement.match(new RegExp("^(" + amount + ")(?:으로|로|이요|요|이에요|예요|입니다)?[.!]?$"));
    if (standalone) return { [field]: money(roomFields[field] + " " + standalone[1], label) };
    if (!/(?:원|천|만|억|무료|없|포함|협의|미정|안\s*받)/.test(replacement)) return {};
  }
  if (Object.hasOwn(local, field)) return { [field]: local[field] };
  if (Object.keys(local).length || typeof proposed[field] !== "string" || !proposed[field]) return {};
  return { [field]: proposed[field] };
}
export function privateText(text) {
  return /(?<!\d)(?:0(?:2|1[016789]|[3-6][1-5]|70)|\+82[-.\s]?(?:\(0\))?(?:2|1[016789]|[3-6][1-5]|70))[-.\s)]?\d{3,4}[-.\s]?\d{4}(?!\d)|\b\d{6}[- ]?[1-8]\d{6}\b|[\w.+-]+@[\w.-]+\.[a-z]{2,}/i.test(String(text).normalize("NFKC"));
}
export function detailedLocation(text) {
  const value = String(text).normalize("NFKC");
  const buildingNumber = /[가-힣\d·.]+(?:대로|로|길|읍|면|동|리)\s*(?:산\s*)?\d+(?:-\d+)?(?!\d)(?!\s*(?:개|칸|실|층|평|월|년|주|일|만|천|원|분|번\s*출구))(?=[\s,.!?()]|번지|번길|에|이|예요|입니다|이고|번|$)/;
  const apartmentOrLot = /\d+(?:-\d+)?\s*번지|\d+\s*동\s*\d+|\d+\s*호(?:실)?(?!선)|(?:아파트|빌라|오피스텔)\s*\d+\s*동/;
  return buildingNumber.test(value) || apartmentOrLot.test(value);
}
// Applied on both sides of the optional AI request, before contacting the model.
export function roomChatPrivate(text) {
  const value = String(text).normalize("NFKC");
  return privateText(value) || detailedLocation(value) ||
    /(?:전화\s*번호|연락처|제\s*이름|이름은|성함은|주민\s*번호|카톡\s*(?:아이디|ID)|계좌\s*번호|상세\s*주소|동[·.]?호수)|(?:공일공|영일공)[\s영공일이삼사오육칠팔구-]{4,}|(?:https?:\/\/|www\.)\S+/i.test(value);
}
export function visitAddressError(text) {
  const value = String(text || "").normalize("NFKC").trim();
  if (privateText(value)) return "주소 칸에는 방문할 주소를 적고, 전화번호는 연락처 칸에 적어주세요.";
  const withoutDistrict = value.replace(/\d+\s*(?:동|가|리|호선|번\s*출구|층)/g, "");
  if (value.length < 4 || value.length > 180 || !/\d/.test(withoutDistrict) || !/[가-힣a-z]/i.test(value)) return "도로명과 건물번호 또는 지번이 포함된 주소를 적어주세요.";
  return "";
}
export function extractRoom(text, focused = "", previousAvailability = "") {
  const clean = String(text).normalize("NFKC").slice(0, 500).trim();
  if (!clean || privateText(clean) || detailedLocation(clean)) return {};
  const patch = {};
  const places = [...clean.matchAll(geography)].map(hit => hit[1].trim().split(/\s+/).filter(w => !notPlaces.has(w)).join(" ")).filter(Boolean);
  if (places.length) patch.location = places[places.length - 1];
  const count = numberOfRooms(clean, focused);
  if (count) patch.rooms = count;
  const availability = moveIn(clean, focused, previousAvailability);
  if (availability !== undefined) patch.availability = availability;
  for (const [field, label] of Object.entries(moneyLabels)) {
    const value = money(clean, label);
    if (value) patch[field] = value;
  }
  const area = clean.match(/(?:전용\s*)?(\d+(?:\.\d+)?)\s*(m2|㎡|평|제곱미터)(?![가-힣]*형대)/i);
  if (area) patch.area = area[1] + (area[2] === "평" ? "평" : "㎡");
  const floor = clean.match(/(?:지하\s*)?\d{1,2}\s*층|반지하|옥탑/);
  if (floor) patch.floor = floor[0];
  const homeType = clean.match(/아파트|단독\s*주택|다세대(?:\s*주택)?|다가구(?:\s*주택)?|빌라|오피스텔|원룸|투룸/);
  if (homeType) patch.homeType = homeType[0];
  return patch;
}

// Supplement an incomplete model answer only for a plain factual description.
// Corrections, alternatives and questions stay with the model's interpretation.
export function completeRoomTurn(text, focused, previousAvailability, confirmed) {
  if (/[?？]|(?:까요|나요|일까|만약|이라면|라면|다면)/.test(text)) return confirmed;
  const local = extractRoom(text, focused, previousAvailability);
  if (local.availability === "" && !Object.hasOwn(confirmed, "availability")) return { ...confirmed, availability: "" };
  if (/(?:인지|말고|아니|않|못|없|안\s+|안(?:받|되|돼|된|될|나|맞)|어렵|어려|힘들|불가|모르|미정|혹시|거나|또는|아직|고민|예를\s*들|예시|쯤일|생각\s*중)/.test(text)) return confirmed;
  // An amount may describe a different field, and room size can describe the whole home.
  // Deterministic supplements cover the three required facts and named charges only.
  const supplement = {};
  for (const key of [...requiredFields, ...Object.keys(moneyLabels)]) {
    if (!local[key] || Object.hasOwn(confirmed, key)) continue;
    if (key === "availability" && !/입주|이사|들어오|가능|부터/.test(text)) continue;
    if (key === "location" && !/(?:[가-힣\d]+(?:동|읍|면|구|역)|서울|부산|인천|대전|대구|광주|울산|세종|제주)/.test(local.location)) continue;
    supplement[key] = local[key];
  }
  return { ...supplement, ...confirmed };
}
