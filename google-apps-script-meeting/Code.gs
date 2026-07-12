const ACK_TYPE = "HANJIBUNG_MEETING_RESULT";
const DEFAULT_SPREADSHEET_ID = "1sxDS8D_SzMUfIcFFbJ-KMQciwu1CBW7oiAhoMd-_zJs";
const DEFAULT_SHEET_ID = 1936939386;
const DEFAULT_SHEET_NAME = "50대 연인";
const DEFAULT_CONSENT_VERSION = "2026-07-12-meeting-v1";
const SERVICE_TYPE = "50plus-meeting";

const HEADERS = [
  "request_id",
  "접수일시",
  "서비스유형",
  "신청자_성함",
  "만_나이",
  "시도",
  "시군구",
  "만50세이상_확인",
  "솔로여부_확인",
  "이용규칙_안전수칙_동의",
  "개인정보_수집이용_동의",
  "동의문버전",
  "클라이언트제출일시",
  "처리상태",
  "카카오확인일시",
  "입장안내일시",
  "파기예정일",
];

const PROVINCES = [
  "서울특별시",
  "경기도",
  "인천광역시",
  "부산광역시",
  "대구광역시",
  "광주광역시",
  "대전광역시",
  "울산광역시",
  "세종특별자치시",
  "강원특별자치도",
  "충청북도",
  "충청남도",
  "전북특별자치도",
  "전라남도",
  "경상북도",
  "경상남도",
  "제주특별자치도",
];

const DEFAULT_ORIGINS = [
  "https://hanjibung.kr",
  "https://www.hanjibung.kr",
  "https://onehousetoge-hue.github.io",
];

function setup() {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    getSheet_();
  } finally {
    lock.releaseLock();
  }
}

function doPost(e) {
  const params = (e && e.parameter) || {};
  const requestId = safeId_(params.requestId);
  const returnOrigin = normalizeOrigin_(params.returnOrigin);

  try {
    assertAllowedOrigin_(returnOrigin);

    // 자동 입력 봇이 숨겨진 필드를 채운 경우 개인정보를 저장하지 않고 일반 성공 응답만 보냅니다.
    if (String(params.website || "").trim()) {
      return ack_({ type: ACK_TYPE, ok: true, requestId: requestId }, returnOrigin);
    }

    const data = validate_(params);
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);

    try {
      const sheet = getSheet_();
      if (!hasRequestId_(sheet, data.requestId)) {
        const row = [[
          data.requestId,
          new Date(),
          data.serviceType,
          data.applicantName,
          data.age,
          data.province,
          data.district,
          "확인",
          "확인",
          "동의",
          "동의",
          data.consentVersion,
          data.submittedAt,
          "신청접수",
          "",
          "",
          "",
        ]];

        const target = sheet.getRange(sheet.getLastRow() + 1, 1, 1, HEADERS.length);
        target.setValues(row);
        target.getCell(1, 2).setNumberFormat("yyyy-mm-dd hh:mm:ss");
        target.getCell(1, 13).setNumberFormat("yyyy-mm-dd hh:mm:ss");
        SpreadsheetApp.flush();
      }
    } finally {
      lock.releaseLock();
    }

    return ack_({ type: ACK_TYPE, ok: true, requestId: data.requestId }, returnOrigin);
  } catch (error) {
    // 이름·나이·지역 등 신청 원문은 로그에 남기지 않습니다.
    console.error(String(error.name || "Error") + ": " + String(error.message || ""));
    return ack_(
      {
        type: ACK_TYPE,
        ok: false,
        requestId: requestId,
        code: error.name === "ValidationError" ? "INVALID_INPUT" : "TEMPORARY_ERROR",
      },
      returnOrigin,
    );
  }
}

function validate_(params) {
  const requestId = safeId_(params.requestId);
  if (!requestId) invalid_("request id");

  const serviceType = String(params.serviceType || "").trim();
  if (serviceType !== SERVICE_TYPE) invalid_("service type");

  const applicantName = cleanLine_(params.applicantName, 30);
  if (!/^[가-힣A-Za-z][가-힣A-Za-z·' \-]{1,29}$/.test(applicantName)) {
    invalid_("applicant name");
  }

  const age = integer_(params.age, 50, 120, "age");
  const province = allowedValue_(params.province, PROVINCES);
  const district = cleanLine_(params.district, 40);
  if (
    !district ||
    district === "시·군·구 선택" ||
    !/^[가-힣A-Za-z0-9· \-]{1,40}$/.test(district)
  ) {
    invalid_("district");
  }

  ["eligibility50", "singleStatus", "rulesConsent", "privacyConsent"].forEach(
    function (field) {
      if (String(params[field]) !== "true") invalid_(field);
    },
  );

  const configuredConsentVersion =
    PropertiesService.getScriptProperties().getProperty("CONSENT_VERSION") ||
    DEFAULT_CONSENT_VERSION;
  const consentVersion = cleanLine_(params.consentVersion, 80);
  if (!consentVersion || consentVersion !== configuredConsentVersion) {
    invalid_("consent version");
  }

  const submittedAt = submittedAt_(params.submittedAt);

  return {
    requestId: requestId,
    serviceType: serviceType,
    applicantName: applicantName,
    age: age,
    province: province,
    district: district,
    consentVersion: consentVersion,
    submittedAt: submittedAt,
  };
}

function cleanLine_(value, maxLength) {
  const text = String(value || "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
  return safeSheetText_(text);
}

function safeSheetText_(value) {
  return /^[=+\-@]/.test(value) ? "'" + value : value;
}

function integer_(value, min, max, label) {
  const text = String(value == null ? "" : value).trim();
  if (!/^\d+$/.test(text)) invalid_(label);
  const number = Number(text);
  if (!Number.isInteger(number) || number < min || number > max) invalid_(label);
  return number;
}

function submittedAt_(value) {
  const text = String(value || "").trim();
  if (
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+\-]\d{2}:\d{2})$/.test(text)
  ) {
    invalid_("submitted at");
  }

  const date = new Date(text);
  if (isNaN(date.getTime())) invalid_("submitted at");
  return date;
}

function allowedValue_(value, allowed) {
  const text = String(value || "").trim();
  if (allowed.indexOf(text) < 0) invalid_("unsupported value");
  return text;
}

function safeId_(value) {
  const id = String(value || "").toLowerCase();
  return /^[a-f0-9]{32}$/.test(id) ? id : "";
}

function invalid_(message) {
  const error = new Error(message);
  error.name = "ValidationError";
  throw error;
}

function getSheet_() {
  const properties = PropertiesService.getScriptProperties();
  const spreadsheetId = properties.getProperty("SPREADSHEET_ID") || DEFAULT_SPREADSHEET_ID;
  const sheetId = Number(properties.getProperty("SHEET_ID") || DEFAULT_SHEET_ID);
  const sheetName = properties.getProperty("SHEET_NAME") || DEFAULT_SHEET_NAME;

  const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  let sheet = Number.isFinite(sheetId) ? spreadsheet.getSheetById(sheetId) : null;
  if (!sheet) sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) throw new Error("Target meeting sheet was not found");

  const currentHeaders = sheet.getRange(1, 1, 1, HEADERS.length).getDisplayValues()[0];
  const isBlank = currentHeaders.every(function (value) { return !value; });
  if (isBlank) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight("bold");
    sheet.setFrozenRows(1);
  } else if (currentHeaders.join("|") !== HEADERS.join("|")) {
    throw new Error("Spreadsheet headers do not match the meeting application schema");
  }
  return sheet;
}

function hasRequestId_(sheet, requestId) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return false;
  return Boolean(
    sheet
      .getRange(2, 1, lastRow - 1, 1)
      .createTextFinder(requestId)
      .matchEntireCell(true)
      .findNext(),
  );
}

function configuredOrigins_() {
  const raw = PropertiesService.getScriptProperties().getProperty("PARENT_ORIGINS") || "";
  const values = DEFAULT_ORIGINS.concat(raw.split(","))
    .map(normalizeOrigin_)
    .filter(Boolean);

  return values.filter(function (value, index) {
    return values.indexOf(value) === index;
  });
}

function normalizeOrigin_(value) {
  const origin = String(value || "").trim();
  return origin === "*" ? origin : origin.replace(/\/+$/, "");
}

function assertAllowedOrigin_(origin) {
  const allowed = configuredOrigins_();
  if (allowed.indexOf("*") >= 0) return;
  if (!origin || allowed.indexOf(origin) < 0) {
    const error = new Error("origin not allowed");
    error.name = "SecurityError";
    throw error;
  }
}

function ack_(payload, requestedOrigin) {
  const allowed = configuredOrigins_();
  const targetOrigin = allowed.indexOf("*") >= 0
    ? "*"
    : (allowed.indexOf(requestedOrigin) >= 0 ? requestedOrigin : allowed[0]);
  const data = JSON.stringify(payload)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
  const html = "<!doctype html><meta charset=\"utf-8\"><script>" +
    "window.top.postMessage(" + data + "," + JSON.stringify(targetOrigin) + ");<\/script>";

  return HtmlService.createHtmlOutput(html)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
