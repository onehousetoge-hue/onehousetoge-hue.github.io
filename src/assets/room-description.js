// The form only sends the fields the host reviews. The original conversation stays in memory.
export const roomFields = Object.freeze({
  location: "동네", rooms: "남는 방", availability: "입주 가능 시기",
  rent: "희망 월세", deposit: "보증금", fee: "관리비", homeType: "주택 유형", area: "방 면적", floor: "층수",
});
export const requiredFields = ["location", "rooms", "availability"];

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
const notPlaces = new Set(["관리", "거리", "자리", "처리", "수리", "정리", "미리", "우리", "아무리", "리모델링", "혹시", "즉시", "당시", "상시", "다시", "표시", "임시", "가구", "다가구", "공동", "거주면", "되면", "하면"]);
const roomNumbers = { 한: 1, 하나: 1, 일: 1, 두: 2, 둘: 2, 이: 2, 세: 3, 셋: 3, 삼: 3, 네: 4, 넷: 4, 사: 4, 다섯: 5, 여섯: 6 };
function numberOfRooms(text, focused) {
  const count = "(\\d{1,2}|하나|다섯|여섯|한|두|둘|세|셋|네|넷)";
  const subset = text.match(new RegExp("(?:개|칸)\\s*중(?:에서)?\\s*" + count + "\\s*(?:개|칸)?만"));
  const before = text.match(new RegExp("(?:남는\\s*방|빈\\s*방|방)\\s*(?:은|는|이|을|이요)?\\s*" + count + "\\s*(?:개|칸|실|뿐|자리|(?=예요|이에요|입니다|[\\s,.!?]|$))"));
  const after = text.match(new RegExp(count + "\\s*(?:개|칸)(?:의|짜리)?\\s*(?:빈\\s*)?방"));
  const bare = focused === "rooms" && text.match(new RegExp("^\\s*" + count + "\\s*(?:개|칸|실)?(?:\\s*이상)?(?:예요|이에요|입니다|요)?[.!]?\\s*$"));
  const found = (subset || before || after || bare)?.[1];
  const n = Number(found) || roomNumbers[found];
  return n >= 1 && n <= 10 ? String(n) + "개" + (/개\s*이상/.test(text) ? " 이상" : "") : "";
}
function moveIn(text, focused) {
  const dates = text.match(/(?:20\d\d년\s*)?(?:1[0-2]|0?[1-9])\s*월\s*(?:(?:3[01]|[12]?\d)\s*일|초순?|중순|말)?(?:부터|이후)?|20\d{2}[-./]\d{1,2}[-./]\d{1,2}/g);
  if (dates && (dates.length === 1 || /말고|아니라|아니고/.test(text))) return dates[dates.length-1].trim();
  const relative = text.match(/(?:다음\s*달|내달|이번\s*달|다음\s*주|내년|올해|한\s*달\s*(?:후|이내|뒤)|\d+\s*(?:주|개월)\s*(?:후|이내|뒤))(?:\s*(?:초순?|중순|말|부터|이후))?/);
  if (relative) return relative[0].trim();
  if (/(?:바로|즉시|당장|오늘부터|지금부터)(?:\s*(?:입주|들어|가능|돼|되|비어)|[.! ]*$)/.test(text) && !/않|못|안\s*(?:돼|되|들어)|불가/.test(text)) return "바로 가능";
  const aboutTime = /입주|이사|날짜|시기|들어오|들어와/.test(text) || (focused === "availability" && !/월세|관리비|보증금|임대료|가격/.test(text));
  if (aboutTime && /미정|일정\s*협의|입주.{0,6}협의|날짜.{0,5}협의|아직.{0,5}(?:몰라|모르|미정)/.test(text)) return "일정 협의";
  if (aboutTime && !/[않못]|안\s*(?:돼|되|들어)/.test(text)) return moveInIntent(text);
  return "";
}

// Accept an explicit won unit or a clear no-cost/negotiable answer. A bare number is ambiguous.
const amount = "(?:[\\d,]+(?:\\.\\d+)?\\s*억(?:\\s*[\\d,]+(?:\\.\\d+)?\\s*(?:천)?만)?\\s*(?:원)?|[\\d,]+(?:\\.\\d+)?\\s*(?:천만|백만|십만|만|천)\\s*(?:원)?|[\\d,]+\\s*원|없(?:음|는|어(?:요)?|습니다)|무료|협의|미정|포함)";
const moneyLabels = { rent: "희망\\s*월세|월세|(?:월\\s*)?임대료|매달", deposit: "보증금", fee: "관리비" };
function money(text, label) {
  const matches = [...text.matchAll(new RegExp("(?:" + label + ")\\s*(?:[은는이가를을]|로)?\\s*[:：]?\\s*(" + amount + ")", "g"))];
  const match = matches.at(-1);
  if (!match) return "";
  const correction = text.slice(match.index + match[0].length).match(new RegExp("^\\s*(?:이?\\s*아니라|이?\\s*아니고|말고)\\s*(" + amount + ")"));
  const value = (correction?.[1] || match[1]).trim();
  if (value.startsWith("없") || value === "무료") return "없음";
  return /\d/.test(value) && !value.endsWith("원") ? value + " 원" : value;
}
export function privateText(text) {
  return /(?:01[016789][\s.-]?\d{3,4}[\s.-]?\d{4}|\b\d{6}[- ]?[1-8]\d{6}\b|[\w.+-]+@[\w.-]+\.[a-z]{2,})/i.test(text);
}
export function extractRoom(text, focused = "") {
  const clean = String(text).normalize("NFKC").slice(0, 500).trim();
  if (!clean || privateText(clean)) return {};
  const patch = {};
  const places = [...clean.matchAll(geography)].map(hit => hit[1].trim().split(/\s+/).filter(w => !notPlaces.has(w)).join(" ")).filter(Boolean);
  if (places.length) patch.location = places[places.length - 1];
  const count = numberOfRooms(clean, focused);
  if (count) patch.rooms = count;
  const availability = moveIn(clean, focused);
  if (availability) patch.availability = availability;
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
