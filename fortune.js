(() => {
  "use strict";

  const runtimeConfig = window.HANJIBUNG_FORTUNE_CONFIG || {};
  const appsScriptEndpoint = String(runtimeConfig.appsScriptEndpoint || "").trim();
  const submitTimeoutMs = Math.max(5000, Number(runtimeConfig.submitTimeoutMs) || 20000);
  const consentVersion = String(
    runtimeConfig.consentVersion || "2026-07-12-fortune-v1",
  );
  const ACK_TYPE = "HANJIBUNG_FORTUNE_RESULT";
  const isSubmissionConfigured =
    /^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(
      appsScriptEndpoint,
    );
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const scrollBehavior = reducedMotion ? "auto" : "smooth";
  const currentYear = new Date().getFullYear();

  const formRoot = document.querySelector("#fortune-form");
  const form = formRoot?.matches("form") ? formRoot : formRoot?.querySelector("form");
  if (!formRoot || !form) return;

  const ageGate = formRoot.querySelector("[data-age-gate]");
  const formShell = formRoot.querySelector("[data-form-shell]");
  const startButton = formRoot.querySelector("[data-start-application]");
  const ineligibleMessage = formRoot.querySelector("[data-ineligible-message]");
  const subjectLive = formRoot.querySelector("[data-subject-live]");
  const questionInput = formRoot.querySelector("[data-question-input]") || form.elements.additionalQuestion;
  const submitButton = formRoot.querySelector("[data-submit-button]");
  const submitState = formRoot.querySelector("[data-submit-state]");
  const submissionError = formRoot.querySelector("[data-submission-error]");
  const submissionErrorText = formRoot.querySelector("[data-submission-error-text]");
  const successCard = document.querySelector("[data-success-card]");
  const successName = document.querySelector("[data-success-name]");
  const successMessage = document.querySelector("[data-success-message]");
  const successSubject = document.querySelector("[data-success-subject]");
  const successPhone = document.querySelector("[data-success-phone]");
  const startAnotherButton = document.querySelector("[data-start-another]");
  const connectionRibbon = document.querySelector("[data-connection-ribbon]");
  const connectionRibbonText = document.querySelector("[data-connection-ribbon-text]");
  const mobileCta = document.querySelector("[data-mobile-cta]");
  const formSection = formRoot.closest("[data-form-section]") || formRoot;
  const siteFooter = document.querySelector(".site-footer, footer");
  const siteHeader = document.querySelector("[data-site-header]");

  const consentNames = ["privacyConsent", "marketingConsent", "termsConsent"];
  const fieldAliases = {
    eligibility: ["eligibility", "eligible60Plus"],
    applicantName: ["applicantName", "name"],
    phone: ["phone", "applicantPhone"],
    ageGroup: ["ageGroup", "age"],
    subjectType: ["subjectType", "subject"],
    subjectLabel: ["subjectLabel", "relationship", "relation"],
    gender: ["gender"],
    birthDate: ["birthDate", "birthYear", "date"],
    calendarType: ["calendarType", "calendar"],
    leapMonth: ["leapMonth", "lunarLeapStatus"],
    timeAccuracy: ["timeAccuracy", "birthTimeAccuracy"],
    birthTime: ["birthTime", "birthPeriod", "time"],
    birthRegion: ["birthRegion", "birthPlace", "region"],
    interestTopic: ["interestTopic", "topic"],
    additionalQuestion: ["additionalQuestion", "question"],
    agreements: ["agreements", "consents", "agreement"],
  };

  const valueMaps = {
    ageGroup: {
      "60s": "60대",
      "60대": "60대",
      "70s": "70대",
      "70대": "70대",
      "80plus": "80대 이상",
      "80대 이상": "80대 이상",
    },
    subjectType: {
      child: "자녀분",
      "자녀": "자녀분",
      "자녀분": "자녀분",
      self: "본인",
      "본인": "본인",
    },
    gender: {
      female: "여성",
      "여성": "여성",
      male: "남성",
      "남성": "남성",
    },
    calendarType: {
      solar: "양력",
      "양력": "양력",
      lunar: "음력",
      "음력": "음력",
    },
    leapMonth: {
      regular: "해당 없음",
      none: "해당 없음",
      "해당 없음": "해당 없음",
      leap: "윤달",
      "윤달": "윤달",
      unknown: "잘 모르겠어요",
      "잘 모르겠어요": "잘 모르겠어요",
    },
    birthPeriod: {
      am: "오전",
      "오전": "오전",
      pm: "오후",
      "오후": "오후",
    },
    timeAccuracy: {
      exact: "정확히 알고 있습니다",
      "정확히 알고 있습니다": "정확히 알고 있습니다",
      approximate: "대략 알고 있습니다",
      approx: "대략 알고 있습니다",
      "대략 알고 있습니다": "대략 알고 있습니다",
      unknown: "태어난 시간을 모릅니다",
      "태어난 시간을 모릅니다": "태어난 시간을 모릅니다",
    },
    interestTopic: {
      overall: "전체적인 사주와 성향",
      "전체적인 사주와 성향": "전체적인 사주와 성향",
      health: "건강과 생활의 흐름",
      "건강운": "건강과 생활의 흐름",
      "건강과 생활의 흐름": "건강과 생활의 흐름",
      wealth: "재물운",
      "재물운": "재물운",
      career: "직업·사업운",
      "직업·사업운": "직업·사업운",
      love: "연애·결혼운",
      "연애·결혼운": "연애·결혼운",
      family: "가족운",
      "가족운": "가족운",
      other: "기타",
      "기타": "기타",
    },
  };

  let currentStep = 1;
  let lastSubjectType = "";
  let pendingSubmission = null;
  let retryRequestId = null;
  let lastApplication = null;
  let isSubmitting = false;
  let formInView = false;
  let footerInView = false;

  function normalizeLine(value) {
    return String(value || "")
      .replace(/[\u0000-\u001f\u007f]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function normalizeText(value) {
    return String(value || "")
      .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, " ")
      .trim();
  }

  function getRadioValue(name) {
    return form.querySelector(`input[name="${name}"]:checked`)?.value || "";
  }

  function setRadioValue(name, value) {
    form.querySelectorAll(`input[name="${name}"]`).forEach((input) => {
      input.checked = input.value === value;
    });
  }

  function clearRadio(name) {
    form.querySelectorAll(`input[name="${name}"]`).forEach((input) => {
      input.checked = false;
    });
  }

  function mappedValue(name) {
    const value = getRadioValue(name);
    return valueMaps[name]?.[value] || value;
  }

  function eligibilityValue() {
    const raw = getRadioValue("eligibility").trim().toLowerCase();
    if (["yes", "true", "네", "60대 이상", "60대 이상입니다"].includes(raw)) return "yes";
    if (["no", "false", "아니요"].includes(raw)) return "no";
    return "";
  }

  function fieldFor(fieldName) {
    const aliases = fieldAliases[fieldName] || [fieldName];
    for (const alias of aliases) {
      const field = formRoot.querySelector(`[data-field="${alias}"]`);
      if (field) return field;
    }
    return null;
  }

  function fieldErrorElement(field) {
    return field?.querySelector("[data-field-error], .field-error") || null;
  }

  function setFieldError(fieldName, message) {
    const field = fieldFor(fieldName);
    if (!field) return;
    const error = fieldErrorElement(field);
    field.classList.toggle("has-error", Boolean(message));
    if (error) error.textContent = message;
    field.querySelectorAll("input, select, textarea").forEach((control) => {
      if (message) control.setAttribute("aria-invalid", "true");
      else control.removeAttribute("aria-invalid");
    });
  }

  function clearFieldElementError(field) {
    if (!field) return;
    field.classList.remove("has-error");
    const error = fieldErrorElement(field);
    if (error) error.textContent = "";
    field.querySelectorAll("[aria-invalid]").forEach((control) => {
      control.removeAttribute("aria-invalid");
    });
  }

  function clearAllErrors() {
    formRoot.querySelectorAll("[data-field]").forEach(clearFieldElementError);
    formRoot.querySelectorAll("[aria-invalid]").forEach((control) => {
      control.removeAttribute("aria-invalid");
    });
  }

  function isVisibleControl(control) {
    return !control.disabled && !control.closest("[hidden]");
  }

  function focusField(fieldName) {
    const field = fieldFor(fieldName);
    if (!field) return;
    const requiredUnchecked = fieldName === "agreements"
      ? field.querySelector("input[required]:not(:checked):not(:disabled)")
      : null;
    const control = requiredUnchecked || [
      ...field.querySelectorAll("input, select, textarea, button"),
    ].find(isVisibleControl);
    (control || field).focus?.({ preventScroll: true });
    field.scrollIntoView({ behavior: scrollBehavior, block: "center" });
  }

  function formatPhoneNumber(value) {
    const digits = String(value || "").replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    if (digits.length === 10) {
      return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }

  function parseInteger(value) {
    const text = String(value == null ? "" : value).trim();
    if (!/^\d+$/.test(text)) return null;
    const number = Number(text);
    return Number.isInteger(number) ? number : null;
  }

  function isValidSolarDate(year, month, day) {
    const date = new Date(Date.UTC(year, month - 1, day));
    return (
      date.getUTCFullYear() === year &&
      date.getUTCMonth() === month - 1 &&
      date.getUTCDate() === day
    );
  }

  function isFutureSolarDate(year, month, day) {
    const now = new Date();
    const todayUtc = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
    return Date.UTC(year, month - 1, day) > todayUtc;
  }

  function setControlsDisabled(container, disabled) {
    if (!container) return;
    if ("disabled" in container) container.disabled = disabled;
    container.setAttribute("aria-disabled", String(disabled));
    container.querySelectorAll("input, select, textarea, button").forEach((control) => {
      control.disabled = disabled;
    });
  }

  function updateConnectionStatus() {
    if (connectionRibbon) connectionRibbon.hidden = false;
    if (isSubmissionConfigured) {
      connectionRibbon?.classList.remove("is-warning");
      if (connectionRibbonText) {
        connectionRibbonText.textContent =
          "신청 정보는 한지붕 운영용 접수 목록에 안전하게 저장됩니다.";
      }
      return;
    }

    connectionRibbon?.classList.add("is-warning");
    if (connectionRibbonText) {
      connectionRibbonText.textContent =
        "현재 온라인 신청 접수를 준비 중입니다. 준비가 끝나면 신청하실 수 있습니다.";
    }
  }

  function syncAgeGate() {
    const value = eligibilityValue();
    if (ineligibleMessage) ineligibleMessage.hidden = value !== "no";
    if (startButton) startButton.disabled = value !== "yes";
    if (value !== "no") setFieldError("eligibility", "");
  }

  function validateEligibility(shouldFocus = true) {
    const value = eligibilityValue();
    let message = "";
    if (!value) message = "60대 이상 여부를 선택해 주세요.";
    else if (value !== "yes") {
      message = "현재 무료 사주풀이는 60대 이상 신청자를 대상으로 운영하고 있습니다.";
    }
    setFieldError("eligibility", message);
    if (ineligibleMessage) ineligibleMessage.hidden = value !== "no";
    if (message && shouldFocus) focusField("eligibility");
    return !message;
  }

  function validateStepOne(shouldFocus = true) {
    const nameInput = form.elements.applicantName;
    const phoneInput = form.elements.phone;
    const name = normalizeLine(nameInput?.value);
    const phone = String(phoneInput?.value || "").trim();
    let firstError = "";

    if (nameInput) nameInput.value = name;
    if (!name) {
      setFieldError("applicantName", "신청하시는 분의 성함을 입력해 주세요. 예: 김영희");
      firstError ||= "applicantName";
    } else if (!/^[가-힣A-Za-z][가-힣A-Za-z·' \-]{1,29}$/.test(name)) {
      setFieldError(
        "applicantName",
        "성함은 한글 또는 영문으로 2자 이상 입력해 주세요. 예: 김영희",
      );
      firstError ||= "applicantName";
    } else {
      setFieldError("applicantName", "");
    }

    if (!phone) {
      setFieldError("phone", "휴대전화 번호를 입력해 주세요. 예: 010-1234-5678");
      firstError ||= "phone";
    } else if (!/^010-\d{4}-\d{4}$/.test(phone)) {
      setFieldError("phone", "휴대전화 번호를 다시 확인해 주세요. 예: 010-1234-5678");
      firstError ||= "phone";
    } else {
      setFieldError("phone", "");
    }

    if (!valueMaps.ageGroup[getRadioValue("ageGroup")]) {
      setFieldError("ageGroup", "연령대를 하나 선택해 주세요.");
      firstError ||= "ageGroup";
    } else {
      setFieldError("ageGroup", "");
    }

    if (firstError && shouldFocus) focusField(firstError);
    return !firstError;
  }

  function validateStepTwo(shouldFocus = true) {
    const subjectType = mappedValue("subjectType");
    const subjectLabelInput = form.elements.subjectLabel;
    const subjectLabel = normalizeLine(subjectLabelInput?.value);
    const gender = mappedValue("gender");
    const year = parseInteger(form.elements.birthYear?.value);
    const month = parseInteger(form.elements.birthMonth?.value);
    const day = parseInteger(form.elements.birthDay?.value);
    const calendarType = mappedValue("calendarType");
    const leapMonth = mappedValue("leapMonth");
    const timeAccuracy = mappedValue("timeAccuracy");
    let firstError = "";

    if (subjectLabelInput) subjectLabelInput.value = subjectLabel;

    if (!valueMaps.subjectType[getRadioValue("subjectType")]) {
      setFieldError("subjectType", "자녀분 또는 본인 중 누구의 사주인지 선택해 주세요.");
      firstError ||= "subjectType";
    } else {
      setFieldError("subjectType", "");
    }

    if (subjectType === "자녀분") {
      if (!subjectLabel) {
        setFieldError(
          "subjectLabel",
          "자녀분을 부르시는 호칭을 입력해 주세요. 예: 첫째 딸",
        );
        firstError ||= "subjectLabel";
      } else if (subjectLabel.length > 30) {
        setFieldError("subjectLabel", "호칭은 30자 이내로 입력해 주세요.");
        firstError ||= "subjectLabel";
      } else {
        setFieldError("subjectLabel", "");
      }
    } else {
      setFieldError("subjectLabel", "");
    }

    if (!valueMaps.gender[getRadioValue("gender")]) {
      setFieldError("gender", `${subjectType === "본인" ? "본인의" : "자녀분의"} 성별을 선택해 주세요.`);
      firstError ||= "gender";
    } else {
      setFieldError("gender", "");
    }

    if (year === null || month === null || day === null) {
      setFieldError("birthDate", "생년월일의 연도, 월, 일을 모두 입력해 주세요.");
      firstError ||= "birthDate";
    } else if (year < 1900 || year > currentYear || month < 1 || month > 12) {
      setFieldError(
        "birthDate",
        `생년월일을 다시 확인해 주세요. 연도는 1900년부터 ${currentYear}년까지 입력할 수 있습니다.`,
      );
      firstError ||= "birthDate";
    } else if (calendarType === "양력" && !isValidSolarDate(year, month, day)) {
      setFieldError(
        "birthDate",
        "실제로 존재하는 양력 날짜인지 확인해 주세요. 예: 2월 30일은 입력할 수 없습니다.",
      );
      firstError ||= "birthDate";
    } else if (calendarType === "양력" && isFutureSolarDate(year, month, day)) {
      setFieldError("birthDate", "생년월일에는 오늘보다 이후 날짜를 입력할 수 없습니다.");
      firstError ||= "birthDate";
    } else if (calendarType === "음력" && (day < 1 || day > 30)) {
      setFieldError("birthDate", "음력 날짜의 일은 1일부터 30일까지 입력해 주세요.");
      firstError ||= "birthDate";
    } else if (calendarType !== "양력" && calendarType !== "음력") {
      // 달력 구분 오류를 별도 항목에서 안내하므로 날짜 자체의 오류는 지웁니다.
      setFieldError("birthDate", "");
    } else {
      setFieldError("birthDate", "");
    }

    if (calendarType !== "양력" && calendarType !== "음력") {
      setFieldError("calendarType", "양력 또는 음력 중 하나를 선택해 주세요.");
      firstError ||= "calendarType";
    } else {
      setFieldError("calendarType", "");
    }

    if (calendarType === "음력" && !valueMaps.leapMonth[getRadioValue("leapMonth")]) {
      setFieldError(
        "leapMonth",
        "윤달 여부를 선택해 주세요. 모르시면 ‘잘 모르겠어요’를 선택하셔도 됩니다.",
      );
      firstError ||= "leapMonth";
    } else {
      setFieldError("leapMonth", "");
    }

    if (!valueMaps.timeAccuracy[getRadioValue("timeAccuracy")]) {
      setFieldError("timeAccuracy", "태어난 시간을 얼마나 정확히 아시는지 선택해 주세요.");
      firstError ||= "timeAccuracy";
    } else {
      setFieldError("timeAccuracy", "");
    }

    if (timeAccuracy && timeAccuracy !== "태어난 시간을 모릅니다") {
      const period = mappedValue("birthPeriod");
      const hour = parseInteger(form.elements.birthHour?.value);
      const minute = parseInteger(form.elements.birthMinute?.value);
      if (
        (period !== "오전" && period !== "오후") ||
        hour === null ||
        hour < 1 ||
        hour > 12 ||
        minute === null ||
        minute < 0 ||
        minute > 59
      ) {
        setFieldError(
          "birthTime",
          "태어난 시간을 오전·오후, 시, 분까지 확인해 주세요. 예: 오전 8시 30분",
        );
        firstError ||= "birthTime";
      } else {
        setFieldError("birthTime", "");
      }
    } else {
      setFieldError("birthTime", "");
    }

    const regionInput = form.elements.birthRegion;
    const region = normalizeLine(regionInput?.value);
    if (regionInput) regionInput.value = region;
    if (region.length > 60) {
      setFieldError("birthRegion", "태어난 지역은 60자 이내로 입력해 주세요.");
      firstError ||= "birthRegion";
    } else {
      setFieldError("birthRegion", "");
    }

    if (firstError && shouldFocus) focusField(firstError);
    return !firstError;
  }

  function validateStepThree(shouldFocus = true) {
    const topic = mappedValue("interestTopic");
    const question = normalizeText(form.elements.additionalQuestion?.value);
    let firstError = "";

    if (form.elements.additionalQuestion) form.elements.additionalQuestion.value = question;

    if (!valueMaps.interestTopic[getRadioValue("interestTopic")]) {
      setFieldError("interestTopic", "가장 궁금한 내용을 하나 선택해 주세요.");
      firstError ||= "interestTopic";
    } else {
      setFieldError("interestTopic", "");
    }

    if (question.length > 500) {
      setFieldError("additionalQuestion", "추가로 궁금한 점은 500자 이내로 입력해 주세요.");
      firstError ||= "additionalQuestion";
    } else if (topic === "기타" && !question) {
      setFieldError("additionalQuestion", "‘기타’를 선택하셨다면 궁금한 내용을 입력해 주세요.");
      firstError ||= "additionalQuestion";
    } else {
      setFieldError("additionalQuestion", "");
    }

    if (firstError && shouldFocus) focusField(firstError);
    return !firstError;
  }

  function requiredConsentsChecked() {
    return Boolean(form.elements.privacyConsent?.checked && form.elements.termsConsent?.checked);
  }

  function validateStepFour(shouldFocus = true) {
    const valid = requiredConsentsChecked();
    setFieldError(
      "agreements",
      valid ? "" : "개인정보 수집·이용과 이용약관의 필수 동의를 확인해 주세요.",
    );
    if (!valid && shouldFocus) focusField("agreements");
    return valid;
  }

  function validateStep(step, shouldFocus = true) {
    if (step === 1) return validateStepOne(shouldFocus);
    if (step === 2) return validateStepTwo(shouldFocus);
    if (step === 3) return validateStepThree(shouldFocus);
    if (step === 4) return validateStepFour(shouldFocus);
    return true;
  }

  function syncAllConsentState() {
    const allConsent = form.elements.allConsent;
    if (!allConsent) return;
    const inputs = consentNames.map((name) => form.elements[name]).filter(Boolean);
    const checkedCount = inputs.filter((input) => input.checked).length;
    allConsent.checked = inputs.length > 0 && checkedCount === inputs.length;
    allConsent.indeterminate = checkedCount > 0 && checkedCount < inputs.length;
  }

  function updateSubmitAvailability() {
    const ready = requiredConsentsChecked();
    if (submitButton) submitButton.disabled = isSubmitting || !ready;
    if (submitState) {
      submitState.hidden = false;
      if (isSubmitting) submitState.textContent = "신청 내용을 안전하게 접수하고 있습니다.";
      else if (ready) submitState.textContent = "필수 동의를 모두 확인했습니다. 신청할 수 있습니다.";
      else submitState.textContent = "필수 동의 2개를 확인하면 신청할 수 있습니다.";
    }
  }

  function syncChoiceStates() {
    syncAllConsentState();
    formRoot.querySelectorAll(".choice-card, .agreement-card").forEach((label) => {
      const input = label.querySelector("input");
      label.classList.toggle("is-selected", Boolean(input?.checked));
    });
    updateSubmitAvailability();
  }

  function clearInterestDetails() {
    clearRadio("interestTopic");
    if (form.elements.additionalQuestion) form.elements.additionalQuestion.value = "";
    updateQuestionCount();
    setFieldError("interestTopic", "");
    setFieldError("additionalQuestion", "");
  }

  function clearConsentDetails() {
    if (form.elements.allConsent) {
      form.elements.allConsent.checked = false;
      form.elements.allConsent.indeterminate = false;
    }
    consentNames.forEach((name) => {
      if (form.elements[name]) form.elements[name].checked = false;
    });
    setFieldError("agreements", "");
  }

  function targetHasData() {
    const textNames = [
      "subjectLabel",
      "birthYear",
      "birthMonth",
      "birthDay",
      "birthHour",
      "birthMinute",
      "birthRegion",
      "additionalQuestion",
    ];
    const radioNames = [
      "gender",
      "calendarType",
      "leapMonth",
      "birthPeriod",
      "timeAccuracy",
      "interestTopic",
    ];
    return (
      textNames.some((name) => normalizeText(form.elements[name]?.value)) ||
      radioNames.some((name) => Boolean(getRadioValue(name))) ||
      consentNames.some((name) => Boolean(form.elements[name]?.checked))
    );
  }

  function clearTargetDetails({ clearConsents = true } = {}) {
    [
      "subjectLabel",
      "birthYear",
      "birthMonth",
      "birthDay",
      "birthHour",
      "birthMinute",
      "birthRegion",
    ].forEach((name) => {
      if (form.elements[name]) form.elements[name].value = "";
    });
    ["gender", "calendarType", "leapMonth", "birthPeriod", "timeAccuracy"].forEach(
      clearRadio,
    );
    clearInterestDetails();
    if (clearConsents) clearConsentDetails();
    [
      "subjectLabel",
      "gender",
      "birthDate",
      "calendarType",
      "leapMonth",
      "timeAccuracy",
      "birthTime",
      "birthRegion",
    ].forEach((fieldName) => setFieldError(fieldName, ""));
  }

  function applySubjectMode(subjectType, { announce = false } = {}) {
    const isSelf = subjectType === "본인";
    formRoot.querySelectorAll("[data-child-only]").forEach((element) => {
      element.hidden = isSelf;
      setControlsDisabled(element, isSelf);
    });
    formRoot.querySelectorAll("[data-subject-word]").forEach((element) => {
      const customText = isSelf ? element.dataset.selfText : element.dataset.childText;
      element.textContent = customText || (isSelf ? "본인" : "자녀분");
    });

    if (questionInput) {
      const childPlaceholder =
        questionInput.dataset.childPlaceholder ||
        "예: 아들이 최근 일을 그만두었는데 앞으로 어떤 일이 잘 맞을지 궁금합니다.";
      const selfPlaceholder =
        questionInput.dataset.selfPlaceholder ||
        "예: 앞으로 일을 계속하는 것이 좋을지, 편안하게 쉬는 것이 좋을지 궁금합니다.";
      questionInput.placeholder = isSelf ? selfPlaceholder : childPlaceholder;
    }

    if (announce && subjectLive) {
      subjectLive.textContent = `${isSelf ? "본인" : "자녀분"} 사주 입력 항목으로 변경되었습니다.`;
    }
  }

  function handleSubjectChange(changedInput) {
    const nextSubjectType = valueMaps.subjectType[changedInput.value] || changedInput.value;
    const previousSubjectType = lastSubjectType;
    if (!nextSubjectType || nextSubjectType === previousSubjectType) {
      applySubjectMode(nextSubjectType || "자녀분");
      return;
    }

    if (
      previousSubjectType &&
      targetHasData() &&
      !window.confirm(
        "사주 대상을 바꾸면 입력한 대상 정보와 궁금한 내용, 동의 선택이 지워집니다. 변경하시겠습니까?",
      )
    ) {
      const previousRaw = [...form.querySelectorAll('input[name="subjectType"]')].find(
        (input) => (valueMaps.subjectType[input.value] || input.value) === previousSubjectType,
      )?.value;
      if (previousRaw) setRadioValue("subjectType", previousRaw);
      syncChoiceStates();
      return;
    }

    if (previousSubjectType && targetHasData()) clearTargetDetails();
    lastSubjectType = nextSubjectType;
    applySubjectMode(nextSubjectType, { announce: true });
    setFieldError("subjectType", "");
    retryRequestId = null;
    syncLunarFields();
    syncTimeControls();
    syncChoiceStates();
  }

  function syncLunarFields({ clearWhenHidden = true } = {}) {
    const isLunar = mappedValue("calendarType") === "음력";
    formRoot.querySelectorAll("[data-lunar-only]").forEach((element) => {
      element.hidden = !isLunar;
      setControlsDisabled(element, !isLunar);
    });
    if (!isLunar && clearWhenHidden) clearRadio("leapMonth");
    if (!isLunar) setFieldError("leapMonth", "");
  }

  function syncTimeControls({ clearWhenUnknown = true } = {}) {
    const unknown = mappedValue("timeAccuracy") === "태어난 시간을 모릅니다";
    formRoot.querySelectorAll("[data-time-controls]").forEach((element) => {
      setControlsDisabled(element, unknown);
      element.classList.toggle("is-disabled", unknown);
    });
    if (unknown && clearWhenUnknown) {
      clearRadio("birthPeriod");
      if (form.elements.birthHour) form.elements.birthHour.value = "";
      if (form.elements.birthMinute) form.elements.birthMinute.value = "";
      setFieldError("birthTime", "");
    }
  }

  function updateProgress(step) {
    formRoot.querySelectorAll("[data-progress-step]").forEach((item) => {
      const itemStep = Number(item.dataset.progressStep);
      item.classList.toggle("is-current", itemStep === step);
      item.classList.toggle("is-complete", itemStep < step);
      if (itemStep === step) item.setAttribute("aria-current", "step");
      else item.removeAttribute("aria-current");
    });
  }

  function setSummaryText(selector, text) {
    const element = formRoot.querySelector(selector);
    if (element) element.textContent = text;
  }

  function updateSummary() {
    const applicantName = normalizeLine(form.elements.applicantName?.value) || "—";
    const phone = String(form.elements.phone?.value || "—");
    const subjectType = mappedValue("subjectType");
    const subjectLabel = subjectType === "본인"
      ? "본인"
      : normalizeLine(form.elements.subjectLabel?.value) || "자녀분";
    const gender = mappedValue("gender") || "—";
    const year = form.elements.birthYear?.value || "—";
    const month = form.elements.birthMonth?.value || "—";
    const day = form.elements.birthDay?.value || "—";
    const calendarType = mappedValue("calendarType") || "—";
    const leapMonth = mappedValue("leapMonth");
    const timeAccuracy = mappedValue("timeAccuracy");
    const region = normalizeLine(form.elements.birthRegion?.value) || "입력하지 않음";
    const topic = mappedValue("interestTopic") || "—";
    const question = normalizeText(form.elements.additionalQuestion?.value);

    const lead = subjectType === "본인"
      ? `${applicantName} 님이 본인의 사주풀이를 신청합니다.`
      : `${applicantName} 님이 ${subjectLabel}의 사주풀이를 신청합니다.`;
    const birth = `${year}년 ${month}월 ${day}일 · ${calendarType}${
      calendarType === "음력" && leapMonth ? ` (${leapMonth})` : ""
    }`;
    const time = timeAccuracy === "태어난 시간을 모릅니다"
      ? "태어난 시간 모름"
      : `${mappedValue("birthPeriod") || "—"} ${form.elements.birthHour?.value || "—"}시 ${String(
          form.elements.birthMinute?.value || "—",
        ).padStart(2, "0")}분 · ${timeAccuracy || "—"}`;

    setSummaryText("[data-summary-lead]", lead);
    setSummaryText(
      "[data-summary-phone]",
      phone,
    );
    setSummaryText("[data-summary-subject]", `${subjectLabel} · ${gender}`);
    setSummaryText("[data-summary-birth]", birth);
    setSummaryText("[data-summary-time]", time);
    setSummaryText("[data-summary-region]", region);
    setSummaryText("[data-summary-topic]", question ? `${topic} · ${question}` : topic);
    setSummaryText(
      "[data-final-summary]",
      `${lead} 결과는 ${phone} 번호의 카카오톡 알림 메시지로 보내드립니다.`,
    );
  }

  function updateQuestionCount() {
    const count = normalizeText(form.elements.additionalQuestion?.value).length;
    const countElement = formRoot.querySelector("[data-question-count]");
    if (countElement) countElement.textContent = String(Math.min(500, count));
  }

  function goToStep(step, options = {}) {
    currentStep = Math.min(4, Math.max(1, Number(step) || 1));
    formRoot.querySelectorAll("[data-form-step]").forEach((panel) => {
      const active = Number(panel.dataset.formStep) === currentStep;
      panel.hidden = !active;
      panel.classList.toggle("is-active", active);
    });
    if (currentStep === 4) updateSummary();
    updateProgress(currentStep);

    if (options.focus !== false) {
      const panel = formRoot.querySelector(`[data-form-step="${currentStep}"]`);
      const heading = panel?.querySelector("h2, h3");
      if (heading) {
        heading.setAttribute("tabindex", "-1");
        heading.focus({ preventScroll: true });
      }
      if (options.scroll !== false) {
        formShell?.scrollIntoView({ behavior: scrollBehavior, block: "start" });
      }
    }
  }

  function createRequestId() {
    const bytes = new Uint8Array(16);
    if (window.crypto?.getRandomValues) window.crypto.getRandomValues(bytes);
    else {
      for (let index = 0; index < bytes.length; index += 1) {
        bytes[index] = Math.floor(Math.random() * 256);
      }
    }
    return [...bytes].map((value) => value.toString(16).padStart(2, "0")).join("");
  }

  function isAppsScriptOrigin(origin) {
    try {
      const url = new URL(origin);
      return (
        url.protocol === "https:" &&
        (url.hostname === "script.google.com" ||
          url.hostname === "script.googleusercontent.com" ||
          url.hostname.endsWith(".script.googleusercontent.com"))
      );
    } catch {
      return false;
    }
  }

  function hideSubmissionError() {
    if (submissionError) submissionError.hidden = true;
  }

  function showSubmissionError(message) {
    if (!submissionError) return;
    if (submissionErrorText) submissionErrorText.textContent = message;
    else submissionError.textContent = message;
    submissionError.hidden = false;
    submissionError.focus?.({ preventScroll: true });
    submissionError.scrollIntoView({ behavior: scrollBehavior, block: "center" });
  }

  function setSubmitting(submitting) {
    isSubmitting = submitting;
    if (submitButton) {
      if (!submitButton.dataset.originalHtml) {
        submitButton.dataset.originalHtml = submitButton.innerHTML;
      }
      if (submitting) {
        submitButton.setAttribute("aria-busy", "true");
        submitButton.textContent = "신청 내용을 안전하게 접수하고 있습니다…";
      } else {
        submitButton.removeAttribute("aria-busy");
        submitButton.innerHTML = submitButton.dataset.originalHtml;
      }
    }
    updateSubmitAvailability();
  }

  function buildApplication() {
    const timeAccuracy = mappedValue("timeAccuracy");
    const knowsTime = timeAccuracy !== "태어난 시간을 모릅니다";
    const subjectType = mappedValue("subjectType");
    return {
      applicantName: normalizeLine(form.elements.applicantName?.value),
      phone: String(form.elements.phone?.value || "").trim(),
      ageGroup: mappedValue("ageGroup"),
      eligibilityConfirmed: true,
      subjectType,
      subjectLabel: subjectType === "본인"
        ? "본인"
        : normalizeLine(form.elements.subjectLabel?.value),
      gender: mappedValue("gender"),
      birthYear: String(form.elements.birthYear?.value || "").trim(),
      birthMonth: String(form.elements.birthMonth?.value || "").trim(),
      birthDay: String(form.elements.birthDay?.value || "").trim(),
      calendarType: mappedValue("calendarType"),
      leapMonth: mappedValue("calendarType") === "음력"
        ? mappedValue("leapMonth")
        : "해당 없음",
      birthPeriod: knowsTime ? mappedValue("birthPeriod") : "",
      birthHour: knowsTime ? String(form.elements.birthHour?.value || "").trim() : "",
      birthMinute: knowsTime ? String(form.elements.birthMinute?.value || "").trim() : "",
      timeAccuracy,
      birthRegion: normalizeLine(form.elements.birthRegion?.value),
      interestTopic: mappedValue("interestTopic"),
      additionalQuestion: normalizeText(form.elements.additionalQuestion?.value),
      privacyConsent: Boolean(form.elements.privacyConsent?.checked),
      marketingConsent: Boolean(form.elements.marketingConsent?.checked),
      termsConsent: Boolean(form.elements.termsConsent?.checked),
      website: normalizeLine(form.elements.website?.value),
    };
  }

  function submitApplication(application) {
    hideSubmissionError();
    if (pendingSubmission) return;
    if (!isSubmissionConfigured) {
      showSubmissionError(
        "현재 온라인 신청 접수를 준비 중입니다. 준비가 완료된 뒤 다시 이용해 주세요.",
      );
      return;
    }
    if (navigator.onLine === false) {
      showSubmissionError("인터넷 연결을 확인해 주세요. 입력 내용은 그대로 유지됩니다.");
      return;
    }

    const requestId = retryRequestId || createRequestId();
    retryRequestId = requestId;
    const payload = {
      requestId,
      ...application,
      privacyConsent: String(application.privacyConsent),
      marketingConsent: String(application.marketingConsent),
      termsConsent: String(application.termsConsent),
      eligibilityConfirmed: String(application.eligibilityConfirmed),
      consentVersion,
      returnOrigin: window.location.origin || "null",
    };

    const transportForm = document.createElement("form");
    transportForm.method = "post";
    transportForm.action = appsScriptEndpoint;
    transportForm.target = "hanjibung-fortune-submit";
    transportForm.hidden = true;
    Object.entries(payload).forEach(([name, value]) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      input.value = String(value ?? "");
      transportForm.appendChild(input);
    });

    document.body.appendChild(transportForm);
    setSubmitting(true);
    const timer = window.setTimeout(() => {
      if (!pendingSubmission || pendingSubmission.requestId !== requestId) return;
      pendingSubmission = null;
      setSubmitting(false);
      showSubmissionError(
        "접수 확인이 늦어지고 있습니다. 입력 내용은 그대로입니다. 잠시 후 다시 시도해 주세요.",
      );
    }, submitTimeoutMs);
    pendingSubmission = { requestId, application, timer };
    transportForm.submit();
    window.setTimeout(() => transportForm.remove(), 0);
  }

  function showSuccess(application) {
    lastApplication = application;
    if (formShell) formShell.hidden = true;
    if (ageGate) ageGate.hidden = true;
    if (successCard) successCard.hidden = false;
    if (successName) {
      successName.textContent = application.applicantName;
    }
    if (successMessage) {
      successMessage.textContent =
        "입력해 주신 내용을 확인한 뒤 사주풀이 결과를 카카오톡 알림 메시지로 보내드리겠습니다.";
    }
    if (successSubject) {
      successSubject.textContent = application.subjectType === "본인"
        ? "본인"
        : application.subjectLabel;
    }
    if (successPhone) successPhone.textContent = application.phone;
    if (startAnotherButton) {
      const label = application.subjectType === "본인"
        ? "자녀 사주도 신청하기"
        : "다른 자녀도 신청하기";
      const labelElement = startAnotherButton.querySelector("[data-button-text]");
      if (labelElement) labelElement.textContent = label;
      else startAnotherButton.textContent = label;
    }
    updateMobileCtaVisibility();
    successCard?.focus?.({ preventScroll: true });
    successCard?.scrollIntoView({ behavior: scrollBehavior, block: "start" });
  }

  function handleSubmissionMessage(event) {
    if (!isAppsScriptOrigin(event.origin)) return;
    const data = event.data;
    if (
      !pendingSubmission ||
      data?.type !== ACK_TYPE ||
      data.requestId !== pendingSubmission.requestId
    ) {
      return;
    }

    const pending = pendingSubmission;
    pendingSubmission = null;
    window.clearTimeout(pending.timer);
    setSubmitting(false);
    if (data.ok) {
      retryRequestId = null;
      hideSubmissionError();
      showSuccess(pending.application);
      return;
    }

    showSubmissionError(
      data.code === "INVALID_INPUT"
        ? "입력 내용을 다시 확인해 주세요. 문제가 계속되면 한지붕 운영자에게 알려주세요."
        : "접수 중 문제가 생겼습니다. 입력 내용은 그대로입니다. 잠시 후 다시 시도해 주세요.",
    );
  }

  function clearApplicantAndGate() {
    ["applicantName", "phone"].forEach((name) => {
      if (form.elements[name]) form.elements[name].value = "";
    });
    clearRadio("eligibility");
    clearRadio("ageGroup");
  }

  function startAnotherApplication() {
    retryRequestId = null;
    hideSubmissionError();
    clearTargetDetails();
    const childInput = [...form.querySelectorAll('input[name="subjectType"]')].find(
      (input) => (valueMaps.subjectType[input.value] || input.value) === "자녀분",
    );
    if (childInput) childInput.checked = true;
    lastSubjectType = "자녀분";
    applySubjectMode("자녀분");
    syncLunarFields();
    syncTimeControls();
    syncChoiceStates();
    if (successCard) successCard.hidden = true;
    if (ageGate) ageGate.hidden = true;
    if (formShell) formShell.hidden = false;
    goToStep(2);
    updateMobileCtaVisibility();
  }

  function resetApplication() {
    if (pendingSubmission) {
      window.clearTimeout(pendingSubmission.timer);
      pendingSubmission = null;
    }
    retryRequestId = null;
    lastApplication = null;
    setSubmitting(false);
    form.reset();
    clearAllErrors();
    hideSubmissionError();
    clearApplicantAndGate();
    if (successCard) successCard.hidden = true;
    if (ageGate) ageGate.hidden = false;
    if (formShell) formShell.hidden = true;
    if (ineligibleMessage) ineligibleMessage.hidden = true;
    lastSubjectType = mappedValue("subjectType") || "자녀분";
    applySubjectMode(lastSubjectType);
    syncLunarFields();
    syncTimeControls();
    syncAgeGate();
    syncChoiceStates();
    goToStep(1, { focus: false, scroll: false });
    updateMobileCtaVisibility();

    const target = document.querySelector("#fortune-title, #hero-title, #top") || ageGate;
    target?.setAttribute?.("tabindex", "-1");
    target?.focus?.({ preventScroll: true });
    document.querySelector("#top")?.scrollIntoView({ behavior: scrollBehavior, block: "start" });
  }

  function validateAllAndSubmit() {
    if (!validateEligibility(false)) {
      if (successCard) successCard.hidden = true;
      if (ageGate) ageGate.hidden = false;
      if (formShell) formShell.hidden = true;
      validateEligibility(true);
      return;
    }

    for (let step = 1; step <= 4; step += 1) {
      if (!validateStep(step, false)) {
        if (ageGate) ageGate.hidden = true;
        if (formShell) formShell.hidden = false;
        goToStep(step, { focus: false });
        validateStep(step, true);
        return;
      }
    }
    submitApplication(buildApplication());
  }

  function updateMobileCtaVisibility() {
    if (!mobileCta) return;
    const successVisible = Boolean(successCard && !successCard.hidden);
    const hide = formInView || footerInView || successVisible;
    mobileCta.classList.toggle("is-hidden", hide);
    mobileCta.setAttribute("aria-hidden", String(hide));
    if ("inert" in mobileCta) mobileCta.inert = hide;
  }

  startButton?.addEventListener("click", () => {
    if (!validateEligibility()) return;
    if (ageGate) ageGate.hidden = true;
    if (successCard) successCard.hidden = true;
    if (formShell) formShell.hidden = false;
    goToStep(1);
    updateMobileCtaVisibility();
  });

  formRoot.querySelectorAll("[data-next-step]").forEach((button) => {
    button.addEventListener("click", () => {
      if (!validateStep(currentStep)) return;
      goToStep(Number(button.dataset.nextStep) || currentStep + 1);
    });
  });

  formRoot.querySelectorAll("[data-prev-step]").forEach((button) => {
    button.addEventListener("click", () => {
      goToStep(Number(button.dataset.prevStep) || currentStep - 1);
    });
  });

  formRoot.querySelectorAll("[data-edit-step]").forEach((button) => {
    button.addEventListener("click", () => goToStep(Number(button.dataset.editStep)));
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (currentStep < 4) {
      if (validateStep(currentStep)) goToStep(currentStep + 1);
      return;
    }
    validateAllAndSubmit();
  });

  const phoneInput = form.elements.phone;
  phoneInput?.addEventListener("input", (event) => {
    const input = event.target;
    const originalValue = input.value;
    const originalCaret = input.selectionStart ?? originalValue.length;
    const digitsBeforeCaret = originalValue.slice(0, originalCaret).replace(/\D/g, "").length;
    const formattedValue = formatPhoneNumber(originalValue);
    input.value = formattedValue;
    let nextCaret = 0;
    let digitsSeen = 0;
    while (nextCaret < formattedValue.length && digitsSeen < digitsBeforeCaret) {
      if (/\d/.test(formattedValue[nextCaret])) digitsSeen += 1;
      nextCaret += 1;
    }
    input.setSelectionRange?.(nextCaret, nextCaret);
    setFieldError("phone", "");
  });

  form.addEventListener("input", (event) => {
    if (!pendingSubmission) retryRequestId = null;
    hideSubmissionError();
    clearFieldElementError(event.target.closest("[data-field]"));
    if (event.target.name === "additionalQuestion") updateQuestionCount();
  });

  form.addEventListener("change", (event) => {
    const { name } = event.target;
    if (name === "eligibility") syncAgeGate();
    if (name === "subjectType") handleSubjectChange(event.target);
    if (name === "calendarType") {
      syncLunarFields();
      setFieldError("calendarType", "");
    }
    if (name === "timeAccuracy") {
      syncTimeControls();
      setFieldError("timeAccuracy", "");
    }
    if (name === "interestTopic") {
      setFieldError("interestTopic", "");
      if (mappedValue("interestTopic") !== "기타") setFieldError("additionalQuestion", "");
    }
    if (name === "allConsent") {
      consentNames.forEach((consentName) => {
        if (form.elements[consentName]) {
          form.elements[consentName].checked = event.target.checked;
        }
      });
    }
    if (name === "allConsent" || consentNames.includes(name)) {
      if (requiredConsentsChecked()) setFieldError("agreements", "");
    }
    if (name !== "subjectType") syncChoiceStates();
  });

  startAnotherButton?.addEventListener("click", startAnotherApplication);
  document.querySelectorAll("[data-restart]").forEach((button) => {
    button.addEventListener("click", resetApplication);
  });

  document.querySelectorAll("[data-scroll-to-form]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      formSection.scrollIntoView({ behavior: scrollBehavior, block: "start" });
      window.setTimeout(() => {
        if (ageGate && !ageGate.hidden) {
          ageGate.querySelector("input:not(:disabled)")?.focus({ preventScroll: true });
          return;
        }
        const panel = formRoot.querySelector(`[data-form-step="${currentStep}"]`);
        panel?.querySelector("h2, h3, input:not(:disabled)")?.focus({ preventScroll: true });
      }, reducedMotion ? 0 : 450);
    });
  });

  const dialogOpeners = new WeakMap();
  document.querySelectorAll("[data-dialog-open]").forEach((button) => {
    button.addEventListener("click", () => {
      const dialog = document.getElementById(button.dataset.dialogOpen);
      if (!dialog) return;
      dialogOpeners.set(dialog, button);
      if (typeof dialog.showModal === "function") dialog.showModal();
      else dialog.setAttribute("open", "");
      document.body.classList.add("dialog-open");
      dialog.querySelector("[data-dialog-close], button")?.focus();
    });
  });

  document.querySelectorAll("[data-dialog-close]").forEach((button) => {
    button.addEventListener("click", () => {
      const dialog = button.closest("dialog");
      if (typeof dialog?.close === "function") dialog.close();
      else {
        dialog?.removeAttribute("open");
        document.body.classList.remove("dialog-open");
        dialogOpeners.get(dialog)?.focus();
      }
    });
  });

  document.querySelectorAll("dialog").forEach((dialog) => {
    dialog.addEventListener("close", () => {
      document.body.classList.remove("dialog-open");
      dialogOpeners.get(dialog)?.focus();
    });
    dialog.addEventListener("click", (event) => {
      const rect = dialog.getBoundingClientRect();
      const clickedBackdrop =
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom;
      if (clickedBackdrop && typeof dialog.close === "function") dialog.close();
    });
  });

  document.querySelectorAll(".faq-list details").forEach((detail) => {
    detail.addEventListener("toggle", () => {
      if (!detail.open) return;
      document.querySelectorAll(".faq-list details").forEach((other) => {
        if (other !== detail) other.open = false;
      });
    });
  });

  window.addEventListener(
    "scroll",
    () => siteHeader?.classList.toggle("is-scrolled", window.scrollY > 20),
    { passive: true },
  );
  window.addEventListener("message", handleSubmissionMessage);

  if ("IntersectionObserver" in window && mobileCta && formSection && siteFooter) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target === formSection) formInView = entry.isIntersecting;
          if (entry.target === siteFooter) footerInView = entry.isIntersecting;
        });
        updateMobileCtaVisibility();
      },
      { threshold: 0.08 },
    );
    observer.observe(formSection);
    observer.observe(siteFooter);
  } else if (mobileCta) {
    const updateFallbackVisibility = () => {
      const formRect = formSection.getBoundingClientRect();
      const footerRect = siteFooter?.getBoundingClientRect();
      formInView = formRect.top < window.innerHeight && formRect.bottom > 0;
      footerInView = Boolean(
        footerRect && footerRect.top < window.innerHeight && footerRect.bottom > 0,
      );
      updateMobileCtaVisibility();
    };
    window.addEventListener("scroll", updateFallbackVisibility, { passive: true });
    updateFallbackVisibility();
  }

  updateConnectionStatus();
  lastSubjectType = mappedValue("subjectType") || "자녀분";
  applySubjectMode(lastSubjectType);
  syncLunarFields({ clearWhenHidden: false });
  syncTimeControls({ clearWhenUnknown: false });
  syncAgeGate();
  syncChoiceStates();
  updateQuestionCount();
  goToStep(1, { focus: false, scroll: false });
  updateMobileCtaVisibility();
})();
