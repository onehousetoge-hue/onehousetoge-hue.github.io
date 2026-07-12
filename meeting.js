(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function initializeMeetingPage() {
    const form = document.querySelector("#meeting-form");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const scrollBehavior = reducedMotion ? "auto" : "smooth";

    setupDialogs();
    if (!form) return;

    const runtimeConfig = window.HANJIBUNG_MEETING_CONFIG || {};
    const appsScriptEndpoint = validAppsScriptEndpoint(runtimeConfig.appsScriptEndpoint);
    const kakaoChatUrl = validKakaoUrl(runtimeConfig.kakaoChatUrl);
    const configuredTimeout = Number(runtimeConfig.submitTimeoutMs);
    const submitTimeoutMs = Number.isFinite(configuredTimeout)
      ? Math.min(60000, Math.max(5000, configuredTimeout))
      : 20000;
    const consentVersion = normalizeLine(runtimeConfig.consentVersion) || "2026-07-12-meeting-v1";
    const ACK_TYPE = "HANJIBUNG_MEETING_RESULT";

    const provinceSelect = form.elements.province;
    const districtSelect = form.elements.district;
    const successCard = document.querySelector("[data-success-card]");
    const successName = document.querySelector("[data-success-name]");
    const successRegion = document.querySelector("[data-success-region]");
    const kakaoLink = document.querySelector("[data-kakao-link]");
    const submitButton = form.querySelector("[data-submit-button]");
    const submitState = form.querySelector("[data-submit-state]");
    const submissionError = form.querySelector("[data-submission-error]");
    const submissionErrorText = form.querySelector("[data-submission-error-text]");
    const toast = document.querySelector("[data-toast]");
    const formSection = form.closest("[data-form-section]") || form.closest("section") || form;
    const mobileCta = document.querySelector("[data-mobile-cta]");
    const siteFooter = document.querySelector(".site-footer");
    const consentNames = ["ageConsent", "singleConsent", "rulesConsent", "privacyConsent"];

    let currentStep = 1;
    let isSubmitting = false;
    let pendingSubmission = null;
    let toastTimer = null;
    let formInView = false;
    let footerInView = false;

    form.noValidate = true;

    const districtsByProvince = Object.freeze({
      "서울특별시": Object.freeze([
        "종로구", "중구", "용산구", "성동구", "광진구", "동대문구", "중랑구", "성북구",
        "강북구", "도봉구", "노원구", "은평구", "서대문구", "마포구", "양천구", "강서구",
        "구로구", "금천구", "영등포구", "동작구", "관악구", "서초구", "강남구", "송파구", "강동구",
      ]),
      "부산광역시": Object.freeze([
        "중구", "서구", "동구", "영도구", "부산진구", "동래구", "남구", "북구", "해운대구",
        "사하구", "금정구", "강서구", "연제구", "수영구", "사상구", "기장군",
      ]),
      "대구광역시": Object.freeze([
        "중구", "동구", "서구", "남구", "북구", "수성구", "달서구", "달성군", "군위군",
      ]),
      "인천광역시": Object.freeze([
        "중구", "동구", "미추홀구", "연수구", "남동구", "부평구", "계양구", "서구", "강화군", "옹진군",
      ]),
      "광주광역시": Object.freeze(["동구", "서구", "남구", "북구", "광산구"]),
      "대전광역시": Object.freeze(["동구", "중구", "서구", "유성구", "대덕구"]),
      "울산광역시": Object.freeze(["중구", "남구", "동구", "북구", "울주군"]),
      "세종특별자치시": Object.freeze(["세종특별자치시"]),
      "경기도": Object.freeze([
        "수원시", "성남시", "의정부시", "안양시", "부천시", "광명시", "평택시", "동두천시",
        "안산시", "고양시", "과천시", "구리시", "남양주시", "오산시", "시흥시", "군포시",
        "의왕시", "하남시", "용인시", "파주시", "이천시", "안성시", "김포시", "화성시",
        "광주시", "양주시", "포천시", "여주시", "연천군", "가평군", "양평군",
      ]),
      "강원특별자치도": Object.freeze([
        "춘천시", "원주시", "강릉시", "동해시", "태백시", "속초시", "삼척시", "홍천군", "횡성군",
        "영월군", "평창군", "정선군", "철원군", "화천군", "양구군", "인제군", "고성군", "양양군",
      ]),
      "충청북도": Object.freeze([
        "청주시", "충주시", "제천시", "보은군", "옥천군", "영동군", "증평군", "진천군", "괴산군", "음성군", "단양군",
      ]),
      "충청남도": Object.freeze([
        "천안시", "공주시", "보령시", "아산시", "서산시", "논산시", "계룡시", "당진시",
        "금산군", "부여군", "서천군", "청양군", "홍성군", "예산군", "태안군",
      ]),
      "전북특별자치도": Object.freeze([
        "전주시", "군산시", "익산시", "정읍시", "남원시", "김제시", "완주군", "진안군",
        "무주군", "장수군", "임실군", "순창군", "고창군", "부안군",
      ]),
      "전라남도": Object.freeze([
        "목포시", "여수시", "순천시", "나주시", "광양시", "담양군", "곡성군", "구례군",
        "고흥군", "보성군", "화순군", "장흥군", "강진군", "해남군", "영암군", "무안군",
        "함평군", "영광군", "장성군", "완도군", "진도군", "신안군",
      ]),
      "경상북도": Object.freeze([
        "포항시", "경주시", "김천시", "안동시", "구미시", "영주시", "영천시", "상주시",
        "문경시", "경산시", "의성군", "청송군", "영양군", "영덕군", "청도군", "고령군",
        "성주군", "칠곡군", "예천군", "봉화군", "울진군", "울릉군",
      ]),
      "경상남도": Object.freeze([
        "창원시", "진주시", "통영시", "사천시", "김해시", "밀양시", "거제시", "양산시",
        "의령군", "함안군", "창녕군", "고성군", "남해군", "하동군", "산청군", "함양군", "거창군", "합천군",
      ]),
      "제주특별자치도": Object.freeze(["제주시", "서귀포시"]),
    });

    function normalizeLine(value) {
      return String(value || "")
        .replace(/[\u0000-\u001f\u007f]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    }

    function validAppsScriptEndpoint(value) {
      const endpoint = String(value || "").trim();
      if (!/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec\/?$/.test(endpoint)) return "";
      return endpoint.replace(/\/$/, "");
    }

    function validKakaoUrl(value) {
      try {
        const url = new URL(String(value || "").trim());
        const hostname = url.hostname.toLowerCase();
        const isKakaoHost = hostname === "kakao.com" || hostname.endsWith(".kakao.com");
        if (url.protocol !== "https:" || !isKakaoHost || url.username || url.password) return "";
        return url.href;
      } catch (_error) {
        return "";
      }
    }

    function createRequestId() {
      const bytes = new Uint8Array(16);
      if (window.crypto?.getRandomValues) {
        window.crypto.getRandomValues(bytes);
        return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
      }
      if (window.crypto?.randomUUID) {
        return window.crypto.randomUUID().replace(/-/g, "").slice(0, 32).toLowerCase();
      }
      const seed = `${Date.now()}-${performance.now?.() || 0}-${Math.random()}-${Math.random()}`;
      for (let index = 0; index < bytes.length; index += 1) {
        const character = seed.charCodeAt(index % seed.length);
        bytes[index] = (character + Math.floor(Math.random() * 256) + index * 31) & 255;
      }
      return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
    }

    function currentReturnOrigin() {
      const origin = String(window.location.origin || "").trim();
      if (window.location.protocol === "file:" || !origin || origin === "null") return "";
      return origin;
    }

    function isAppsScriptOrigin(origin) {
      try {
        const url = new URL(origin);
        return url.protocol === "https:" && (
          url.hostname === "script.google.com"
          || url.hostname === "script.googleusercontent.com"
          || url.hostname.endsWith(".script.googleusercontent.com")
        );
      } catch (_error) {
        return false;
      }
    }

    function addOption(select, value, label, options) {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = label;
      if (options?.disabled) option.disabled = true;
      if (options?.selected) option.selected = true;
      select.appendChild(option);
    }

    function populateProvinces() {
      if (!provinceSelect) return;
      const previousValue = provinceSelect.value;
      const placeholder = provinceSelect.querySelector('option[value=""]')?.textContent.trim()
        || "시·도를 선택해 주세요";
      provinceSelect.replaceChildren();
      addOption(provinceSelect, "", placeholder, { disabled: true, selected: true });
      Object.keys(districtsByProvince).forEach((province) => addOption(provinceSelect, province, province));
      if (Object.prototype.hasOwnProperty.call(districtsByProvince, previousValue)) {
        provinceSelect.value = previousValue;
      }
    }

    function populateDistricts(province, preferredDistrict) {
      if (!districtSelect) return;
      const districts = districtsByProvince[province] || [];
      const placeholder = districts.length ? "시·군·구를 선택해 주세요" : "먼저 시·도를 선택해 주세요";
      districtSelect.replaceChildren();
      addOption(districtSelect, "", placeholder, { disabled: true, selected: true });
      districts.forEach((district) => addOption(districtSelect, district, district));
      districtSelect.disabled = districts.length === 0;
      if (preferredDistrict && districts.includes(preferredDistrict)) districtSelect.value = preferredDistrict;
    }

    function exactField(name) {
      return form.querySelector(`[data-field="${name}"]`);
    }

    function setFieldElementError(field, message) {
      if (!field) return;
      const error = field.querySelector(".field-error");
      field.classList.toggle("has-error", Boolean(message));
      if (error) error.textContent = message;
      field.querySelectorAll("input, select, textarea").forEach((control) => {
        if (message) control.setAttribute("aria-invalid", "true");
        else control.removeAttribute("aria-invalid");
      });
    }

    function clearAllErrors() {
      form.querySelectorAll("[data-field]").forEach((field) => setFieldElementError(field, ""));
      form.querySelectorAll("[aria-invalid]").forEach((control) => control.removeAttribute("aria-invalid"));
    }

    function setNamedFieldError(name, message, fallbackName) {
      setFieldElementError(exactField(name) || (fallbackName ? exactField(fallbackName) : null), message);
    }

    function setRegionErrors(provinceMessage, districtMessage) {
      const sharedField = exactField("region");
      if (sharedField) {
        setFieldElementError(sharedField, provinceMessage || districtMessage);
        return;
      }
      setFieldElementError(exactField("province"), provinceMessage);
      setFieldElementError(exactField("district"), districtMessage);
    }

    function setAgreementErrors() {
      const missingNames = consentNames.filter((name) => !form.elements[name]?.checked);
      const sharedField = exactField("agreements") || exactField("consents");
      if (sharedField) {
        setFieldElementError(
          sharedField,
          missingNames.length ? "필수 동의 네 가지를 모두 확인해 주세요." : "",
        );
        return missingNames.length === 0;
      }
      consentNames.forEach((name) => {
        setFieldElementError(
          exactField(name),
          missingNames.includes(name) ? "이 항목에 동의해야 신청할 수 있습니다." : "",
        );
      });
      return missingNames.length === 0;
    }

    function focusControl(control) {
      if (!control) return;
      control.focus({ preventScroll: true });
      control.scrollIntoView({ behavior: scrollBehavior, block: "center" });
    }

    function firstUsableControl(container) {
      if (!container) return null;
      return Array.from(container.querySelectorAll("input, select, textarea, button")).find((control) => (
        !control.disabled && !control.closest("[hidden]")
      )) || null;
    }

    function validateStepOne(shouldFocus = true) {
      const applicantName = normalizeLine(form.elements.applicantName?.value);
      const nameLength = Array.from(applicantName).length;
      const ageText = String(form.elements.age?.value || "").trim();
      const age = /^\d+$/.test(ageText) ? Number(ageText) : NaN;
      const province = String(provinceSelect?.value || "");
      const district = String(districtSelect?.value || "");

      let firstInvalid = null;
      let nameMessage = "";
      if (!applicantName) nameMessage = "성함을 입력해 주세요. 예: 김영희";
      else if (nameLength < 2 || nameLength > 30) nameMessage = "성함은 2자 이상 30자 이하로 입력해 주세요.";
      setNamedFieldError("applicantName", nameMessage, "name");
      if (nameMessage) firstInvalid = form.elements.applicantName;

      let ageMessage = "";
      if (!ageText) ageMessage = "현재 만 나이를 숫자로 입력해 주세요. 예: 62";
      else if (!Number.isInteger(age)) ageMessage = "만 나이는 소수점 없이 숫자로 입력해 주세요. 예: 62";
      else if (age < 50) ageMessage = "현재 이 서비스는 만 50세 이상만 신청할 수 있습니다.";
      else if (age > 120) ageMessage = "만 나이는 50세부터 120세 사이로 입력해 주세요.";
      setNamedFieldError("age", ageMessage);
      if (!firstInvalid && ageMessage) firstInvalid = form.elements.age;

      const provinceMessage = districtsByProvince[province] ? "" : "거주하시는 시·도를 선택해 주세요.";
      const districtMessage = provinceMessage
        ? ""
        : districtsByProvince[province]?.includes(district) ? "" : "거주하시는 시·군·구를 선택해 주세요.";
      setRegionErrors(provinceMessage, districtMessage);
      if (!firstInvalid && provinceMessage) firstInvalid = provinceSelect;
      if (!firstInvalid && districtMessage) firstInvalid = districtSelect;

      if (!firstInvalid && form.elements.applicantName) form.elements.applicantName.value = applicantName;
      if (firstInvalid && shouldFocus) focusControl(firstInvalid);
      return !firstInvalid;
    }

    function validateStepTwo(shouldFocus = true) {
      const valid = setAgreementErrors();
      if (!valid && shouldFocus) {
        const missing = consentNames
          .map((name) => form.elements[name])
          .find((control) => control && !control.checked);
        const sharedField = exactField("agreements") || exactField("consents");
        focusControl(missing || firstUsableControl(sharedField));
      }
      return valid;
    }

    function requiredConsentsChecked() {
      return consentNames.every((name) => Boolean(form.elements[name]?.checked));
    }

    function syncAllConsent() {
      const allConsent = form.elements.allConsent;
      if (!allConsent) return;
      const inputs = consentNames.map((name) => form.elements[name]).filter(Boolean);
      const checkedCount = inputs.filter((input) => input.checked).length;
      allConsent.checked = inputs.length > 0 && checkedCount === inputs.length;
      allConsent.indeterminate = checkedCount > 0 && checkedCount < inputs.length;
    }

    function syncChoiceStyles() {
      form.querySelectorAll(".choice-card, .agreement-card, [data-choice-card]").forEach((card) => {
        card.classList.toggle("is-selected", Boolean(card.querySelector("input")?.checked));
      });
    }

    function updateSubmitState() {
      const ready = requiredConsentsChecked();
      if (submitButton) {
        submitButton.disabled = isSubmitting || !ready;
        submitButton.setAttribute("aria-busy", String(isSubmitting));
      }
      if (!submitState) return;
      submitState.hidden = false;
      if (isSubmitting) {
        submitState.textContent = "신청 내용을 안전하게 접수하고 있습니다. 잠시만 기다려 주세요.";
      } else if (ready) {
        submitState.textContent = "필수 동의를 모두 확인했습니다. 무료 입장 신청을 접수할 수 있습니다.";
      } else {
        submitState.textContent = "필수 동의 네 가지를 모두 확인해 주세요.";
      }
    }

    function syncConsentState() {
      syncAllConsent();
      syncChoiceStyles();
      updateSubmitState();
    }

    function updateSummary() {
      const name = normalizeLine(form.elements.applicantName?.value);
      const age = String(form.elements.age?.value || "").trim();
      const province = String(provinceSelect?.value || "");
      const district = String(districtSelect?.value || "");
      document.querySelectorAll("[data-summary-name]").forEach((element) => {
        element.textContent = name || "-";
      });
      document.querySelectorAll("[data-summary-age]").forEach((element) => {
        element.textContent = age ? `만 ${age}세` : "-";
      });
      document.querySelectorAll("[data-summary-region]").forEach((element) => {
        element.textContent = province && district ? `${province} ${district}` : "-";
      });
    }

    function updateProgress(step) {
      document.querySelectorAll("[data-progress-step]").forEach((item, index) => {
        const itemStep = Number(item.dataset.progressStep) || index + 1;
        const active = itemStep === step;
        item.classList.toggle("is-active", active);
        item.classList.toggle("is-current", active);
        item.classList.toggle("is-complete", itemStep < step);
        if (active) item.setAttribute("aria-current", "step");
        else item.removeAttribute("aria-current");
      });
    }

    function updateMobileCtaVisibility() {
      if (!mobileCta) return;
      const successVisible = Boolean(successCard && !successCard.hidden);
      const hide = formInView || footerInView || successVisible;
      mobileCta.classList.toggle("is-hidden", hide);
      mobileCta.setAttribute("aria-hidden", String(hide));
      if ("inert" in mobileCta) mobileCta.inert = hide;
    }

    function goToStep(step, options = {}) {
      currentStep = Math.min(2, Math.max(1, Number(step) || 1));
      form.querySelectorAll("[data-form-step]").forEach((panel) => {
        const active = Number(panel.dataset.formStep) === currentStep;
        panel.hidden = !active;
        panel.classList.toggle("is-active", active);
      });
      if (currentStep === 2) updateSummary();
      updateProgress(currentStep);
      updateMobileCtaVisibility();

      if (options.scroll !== false) formSection.scrollIntoView({ behavior: scrollBehavior, block: "start" });
      if (options.focus !== false) {
        const panel = form.querySelector(`[data-form-step="${currentStep}"]`);
        const heading = panel?.querySelector("h2, h3, [data-step-heading]");
        const target = heading || firstUsableControl(panel);
        if (target) {
          if (heading && !heading.hasAttribute("tabindex")) heading.setAttribute("tabindex", "-1");
          window.setTimeout(() => target.focus({ preventScroll: true }), reducedMotion ? 0 : 350);
        }
      }
    }

    function hideSubmissionError() {
      if (submissionError) submissionError.hidden = true;
    }

    function showToast(message) {
      if (!toast) return;
      window.clearTimeout(toastTimer);
      toast.textContent = message;
      toast.hidden = false;
      toastTimer = window.setTimeout(() => { toast.hidden = true; }, 3600);
    }

    function showSubmissionError(message) {
      if (!submissionError) {
        showToast(message);
        return;
      }
      if (submissionErrorText) submissionErrorText.textContent = message;
      submissionError.hidden = false;
      if (!submissionError.hasAttribute("tabindex")) submissionError.setAttribute("tabindex", "-1");
      submissionError.focus({ preventScroll: true });
      submissionError.scrollIntoView({ behavior: scrollBehavior, block: "center" });
    }

    function setSubmitting(submitting) {
      isSubmitting = submitting;
      form.setAttribute("aria-busy", String(submitting));
      updateSubmitState();
    }

    function ensureSheetTarget() {
      let iframe = document.querySelector("[data-sheet-submit-target]");
      if (!iframe) {
        iframe = document.createElement("iframe");
        iframe.hidden = true;
        iframe.setAttribute("data-sheet-submit-target", "");
        iframe.title = "신청 접수 처리";
        document.body.appendChild(iframe);
      }
      iframe.name = "hanjibung-meeting-submit";
      return iframe;
    }

    const sheetTarget = ensureSheetTarget();

    function buildApplication() {
      return {
        serviceType: "50plus-meeting",
        applicantName: normalizeLine(form.elements.applicantName?.value),
        age: String(form.elements.age?.value || "").trim(),
        province: String(provinceSelect?.value || ""),
        district: String(districtSelect?.value || ""),
        eligibility50: Boolean(form.elements.ageConsent?.checked),
        singleStatus: Boolean(form.elements.singleConsent?.checked),
        rulesConsent: Boolean(form.elements.rulesConsent?.checked),
        privacyConsent: Boolean(form.elements.privacyConsent?.checked),
        consentVersion,
        submittedAt: new Date().toISOString(),
        website: normalizeLine(form.elements.website?.value),
      };
    }

    function appendHiddenInput(targetForm, name, value) {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      input.value = String(value == null ? "" : value);
      targetForm.appendChild(input);
    }

    function submitApplication(application) {
      hideSubmissionError();
      if (isSubmitting || pendingSubmission) return;
      if (application.website) {
        showSubmissionError("신청을 처리할 수 없습니다. 페이지를 새로고침한 뒤 다시 시도해 주세요.");
        return;
      }
      if (!appsScriptEndpoint) {
        showSubmissionError("현재 온라인 신청 접수 연결을 준비 중입니다. 연결이 완료된 뒤 다시 이용해 주세요.");
        return;
      }
      if (navigator.onLine === false) {
        showSubmissionError("인터넷 연결을 확인해 주세요. 입력하신 내용은 그대로 유지됩니다.");
        return;
      }

      const requestId = createRequestId();
      const payload = {
        requestId,
        ...application,
        returnOrigin: currentReturnOrigin(),
      };
      const transportForm = document.createElement("form");
      transportForm.method = "post";
      transportForm.action = appsScriptEndpoint;
      transportForm.target = "hanjibung-meeting-submit";
      transportForm.acceptCharset = "UTF-8";
      transportForm.hidden = true;
      Object.entries(payload).forEach(([name, rawValue]) => {
        const value = typeof rawValue === "boolean" ? String(rawValue) : rawValue;
        appendHiddenInput(transportForm, name, value);
      });

      document.body.appendChild(transportForm);
      setSubmitting(true);
      const timer = window.setTimeout(() => {
        if (!pendingSubmission || pendingSubmission.requestId !== requestId) return;
        pendingSubmission = null;
        setSubmitting(false);
        showSubmissionError("접수 확인이 지연되고 있습니다. 입력 내용은 그대로입니다. 잠시 후 다시 시도해 주세요.");
      }, submitTimeoutMs);
      pendingSubmission = { requestId, application, timer };

      try {
        transportForm.submit();
      } catch (_error) {
        window.clearTimeout(timer);
        pendingSubmission = null;
        setSubmitting(false);
        showSubmissionError("신청 접수 중 문제가 생겼습니다. 잠시 후 다시 시도해 주세요.");
      } finally {
        window.setTimeout(() => transportForm.remove(), 1000);
      }
    }

    function configureKakaoLink() {
      if (!kakaoLink) return;
      if (kakaoChatUrl) {
        if (kakaoLink.matches("a")) {
          kakaoLink.href = kakaoChatUrl;
          kakaoLink.target = "_blank";
          kakaoLink.rel = "noopener noreferrer";
        }
        kakaoLink.removeAttribute("aria-disabled");
        return;
      }
      if (kakaoLink.matches("a")) kakaoLink.href = "#";
      kakaoLink.setAttribute("aria-disabled", "true");
    }

    function showSuccess(application) {
      form.hidden = true;
      if (successCard) {
        successCard.hidden = false;
        if (!successCard.hasAttribute("tabindex")) successCard.setAttribute("tabindex", "-1");
      }
      if (successName) successName.textContent = application.applicantName;
      if (successRegion) successRegion.textContent = `${application.province} ${application.district}`;
      configureKakaoLink();
      updateMobileCtaVisibility();
      const target = successCard || formSection;
      target.focus?.({ preventScroll: true });
      target.scrollIntoView({ behavior: scrollBehavior, block: "start" });
    }

    sheetTarget.addEventListener("load", () => {
      if (pendingSubmission && submitState) {
        submitState.textContent = "접수 내용을 보냈습니다. 서버의 저장 확인을 기다리고 있습니다.";
      }
    });

    function handleSubmissionMessage(event) {
      if (!isAppsScriptOrigin(event.origin)) return;
      if (event.source !== sheetTarget.contentWindow) return;
      const data = event.data;
      if (
        !pendingSubmission
        || !data
        || typeof data !== "object"
        || data.type !== ACK_TYPE
        || data.requestId !== pendingSubmission.requestId
        || (data.ok !== true && data.ok !== false)
      ) {
        return;
      }

      const completed = pendingSubmission;
      pendingSubmission = null;
      window.clearTimeout(completed.timer);
      setSubmitting(false);

      if (data.ok === true) {
        hideSubmissionError();
        showSuccess(completed.application);
        return;
      }

      const serverMessage = normalizeLine(data.message).slice(0, 240);
      const fallbackMessage = data.code === "INVALID_INPUT"
        ? "입력 내용을 다시 확인해 주세요. 문제가 계속되면 한지붕 운영자에게 알려주세요."
        : "접수 중 문제가 생겼습니다. 입력 내용은 그대로입니다. 잠시 후 다시 시도해 주세요.";
      showSubmissionError(serverMessage || fallbackMessage);
    }

    function resetApplication() {
      if (pendingSubmission) {
        window.clearTimeout(pendingSubmission.timer);
        pendingSubmission = null;
      }
      setSubmitting(false);
      form.reset();
      populateProvinces();
      populateDistricts("", "");
      clearAllErrors();
      hideSubmissionError();
      if (successCard) successCard.hidden = true;
      form.hidden = false;
      syncConsentState();
      updateSummary();
      goToStep(1, { focus: true, scroll: true });
    }

    function scrollToForm(event) {
      event?.preventDefault();
      formSection.scrollIntoView({ behavior: scrollBehavior, block: "start" });
      const panel = form.querySelector(`[data-form-step="${currentStep}"]`);
      const control = panel?.querySelector("input:not([type='hidden']):not(:disabled), select:not(:disabled), button");
      window.setTimeout(() => control?.focus({ preventScroll: true }), reducedMotion ? 0 : 400);
    }

    provinceSelect?.addEventListener("change", () => {
      populateDistricts(provinceSelect.value, "");
      setRegionErrors("", "");
      updateSummary();
    });

    districtSelect?.addEventListener("change", () => {
      setRegionErrors("", "");
      updateSummary();
    });

    form.addEventListener("input", (event) => {
      hideSubmissionError();
      const field = event.target.closest("[data-field]");
      if (field && !["agreements", "consents", "region"].includes(field.dataset.field)) {
        setFieldElementError(field, "");
      }
      if (["applicantName", "age"].includes(event.target.name)) updateSummary();
    });

    form.addEventListener("change", (event) => {
      const name = event.target.name;
      hideSubmissionError();
      if (name === "allConsent") {
        consentNames.forEach((consentName) => {
          if (form.elements[consentName]) form.elements[consentName].checked = event.target.checked;
        });
      }
      if (name === "allConsent" || consentNames.includes(name)) {
        setAgreementErrors();
        syncConsentState();
      }
    });

    form.addEventListener("keydown", (event) => {
      const isEntryControl = event.target.matches("input:not([type='checkbox']):not([type='radio']), select");
      if (event.key !== "Enter" || !isEntryControl || currentStep !== 1) return;
      event.preventDefault();
      if (validateStepOne(true)) goToStep(2);
    });

    form.querySelectorAll("[data-next-step='2']").forEach((button) => {
      button.addEventListener("click", () => {
        if (validateStepOne(true)) goToStep(2);
      });
    });

    form.querySelectorAll("[data-prev-step='1']").forEach((button) => {
      button.addEventListener("click", () => goToStep(1));
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (currentStep === 1) {
        if (validateStepOne(true)) goToStep(2);
        return;
      }
      if (!validateStepOne(false)) {
        goToStep(1, { focus: false });
        validateStepOne(true);
        return;
      }
      if (!validateStepTwo(true)) return;
      submitApplication(buildApplication());
    });

    document.querySelectorAll("[data-scroll-to-form]").forEach((control) => {
      control.addEventListener("click", scrollToForm);
      control.dataset.meetingScrollBound = "true";
    });

    if (mobileCta && !mobileCta.matches("[data-scroll-to-form]")) {
      const mobileControl = mobileCta.matches("a, button") ? mobileCta : mobileCta.querySelector("a, button");
      if (mobileControl && mobileControl.dataset.meetingScrollBound !== "true") {
        mobileControl.addEventListener("click", scrollToForm);
      }
    }

    document.querySelectorAll("[data-restart]").forEach((button) => {
      button.addEventListener("click", resetApplication);
    });

    kakaoLink?.addEventListener("click", (event) => {
      if (!kakaoChatUrl) {
        event.preventDefault();
        showToast("카카오톡 1:1 확인 연결을 준비 중입니다. 운영자 안내를 기다려 주세요.");
        return;
      }
      if (!kakaoLink.matches("a")) {
        event.preventDefault();
        window.open(kakaoChatUrl, "_blank", "noopener,noreferrer");
      }
    });

    window.addEventListener("message", handleSubmissionMessage);

    populateProvinces();
    populateDistricts(provinceSelect?.value || "", districtSelect?.value || "");
    configureKakaoLink();
    clearAllErrors();
    syncConsentState();
    updateSummary();
    goToStep(1, { focus: false, scroll: false });

    if ("IntersectionObserver" in window && mobileCta) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.target === formSection) formInView = entry.isIntersecting;
          if (entry.target === siteFooter) footerInView = entry.isIntersecting;
        });
        updateMobileCtaVisibility();
      }, { threshold: 0.08 });
      observer.observe(formSection);
      if (siteFooter) observer.observe(siteFooter);
    } else if (mobileCta) {
      const updateFallbackVisibility = () => {
        const formRect = formSection.getBoundingClientRect();
        const footerRect = siteFooter?.getBoundingClientRect();
        formInView = formRect.top < window.innerHeight && formRect.bottom > 0;
        footerInView = Boolean(footerRect && footerRect.top < window.innerHeight && footerRect.bottom > 0);
        updateMobileCtaVisibility();
      };
      window.addEventListener("scroll", updateFallbackVisibility, { passive: true });
      window.addEventListener("resize", updateFallbackVisibility);
      updateFallbackVisibility();
    }

    function setupDialogs() {
      const dialogOpeners = new WeakMap();
      let fallbackDialog = null;

      function dialogForOpener(opener) {
        const target = opener.dataset.dialogOpen
          || String(opener.getAttribute("href") || "").replace(/^#/, "");
        return target ? document.getElementById(target) : null;
      }

      function restoreOpener(dialog) {
        const opener = dialogOpeners.get(dialog);
        opener?.setAttribute("aria-expanded", "false");
        opener?.focus();
      }

      function closeDialog(dialog) {
        if (!dialog) return;
        if (typeof dialog.close === "function" && dialog.open) {
          dialog.close();
          return;
        }
        dialog.removeAttribute("open");
        dialog.setAttribute("aria-hidden", "true");
        fallbackDialog = null;
        document.body.classList.remove("dialog-open");
        restoreOpener(dialog);
      }

      document.querySelectorAll("[data-dialog-open]").forEach((opener) => {
        const dialog = dialogForOpener(opener);
        if (dialog?.id) {
          opener.setAttribute("aria-controls", dialog.id);
          opener.setAttribute("aria-haspopup", "dialog");
        }
        opener.addEventListener("click", (event) => {
          event.preventDefault();
          if (!dialog) return;
          dialogOpeners.set(dialog, opener);
          opener.setAttribute("aria-expanded", "true");
          if (typeof dialog.showModal === "function") {
            dialog.showModal();
          } else {
            dialog.setAttribute("open", "");
            dialog.setAttribute("role", "dialog");
            dialog.setAttribute("aria-modal", "true");
            dialog.removeAttribute("aria-hidden");
            fallbackDialog = dialog;
          }
          document.body.classList.add("dialog-open");
          dialog.querySelector(
            "[data-dialog-close], button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])",
          )?.focus();
        });
      });

      document.querySelectorAll("[data-dialog-close]").forEach((button) => {
        button.addEventListener("click", (event) => {
          event.preventDefault();
          closeDialog(button.closest("dialog, [role='dialog']"));
        });
      });

      document.querySelectorAll("dialog, [data-dialog]").forEach((dialog) => {
        dialog.addEventListener("close", () => {
          document.body.classList.remove("dialog-open");
          restoreOpener(dialog);
        });
        dialog.addEventListener("click", (event) => {
          if (event.target !== dialog) return;
          const rect = dialog.getBoundingClientRect();
          const outsideContent = event.clientX < rect.left || event.clientX > rect.right
            || event.clientY < rect.top || event.clientY > rect.bottom;
          if (outsideContent) closeDialog(dialog);
        });
      });

      document.addEventListener("keydown", (event) => {
        if (!fallbackDialog) return;
        if (event.key === "Escape") {
          event.preventDefault();
          closeDialog(fallbackDialog);
          return;
        }
        if (event.key !== "Tab") return;
        const focusable = Array.from(fallbackDialog.querySelectorAll(
          "button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex='-1'])",
        )).filter((element) => element.getClientRects().length > 0);
        if (!focusable.length) {
          event.preventDefault();
          if (!fallbackDialog.hasAttribute("tabindex")) fallbackDialog.setAttribute("tabindex", "-1");
          fallbackDialog.focus();
          return;
        }
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      });
    }
  }, { once: true });
})();
