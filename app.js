(() => {
  "use strict";

  const runtimeConfig = window.HANJIBUNG_CONFIG || {};
  const appsScriptEndpoint = String(runtimeConfig.appsScriptEndpoint || "").trim();
  const submitTimeoutMs = Math.max(5000, Number(runtimeConfig.submitTimeoutMs) || 20000);
  const consentVersion = String(runtimeConfig.consentVersion || "2026-07-12-v1");
  const ACK_TYPE = "HANJIBUNG_APPLICATION_RESULT";
  const isSubmissionConfigured =
    /^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(appsScriptEndpoint);

  if (isSubmissionConfigured) {
    document.querySelectorAll("[data-application-only]").forEach((element) => {
      element.hidden = false;
    });
  }

  const messageExamples = {
    morning: {
      label: "오늘의 말씀",
      verse: "“두려워하지 말라 내가 너와 함께 함이라”",
      reference: "이사야 41장 10절",
      reflection:
        "오늘도 혼자가 아닙니다.<br>하나님께서 함께하심을 기억하며<br>평안한 하루 보내세요.",
      time: "오늘 오전 9:00",
    },
    comfort: {
      label: "위로의 말씀",
      verse: "“수고하고 무거운 짐 진 자들아 다 내게로 오라”",
      reference: "마태복음 11장 28절",
      reflection:
        "마음이 무거운 날에도 하나님은 가까이 계십니다.<br>잠시 숨을 고르고<br>말씀 안에서 쉬어가세요.",
      time: "오늘 오후 6:00",
    },
    thanks: {
      label: "감사의 말씀",
      verse: "“범사에 감사하라”",
      reference: "데살로니가전서 5장 18절",
      reflection:
        "오늘 내 곁에 있는 사람과 작은 일상을 돌아보세요.<br>감사할 이유는 생각보다<br>가까이에 있습니다.",
      time: "오늘 오후 9:00",
    },
  };

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const siteHeader = document.querySelector("[data-site-header]");
  const formSection = document.querySelector("[data-form-section]");
  const formShell = document.querySelector("[data-form-shell]");
  const form = document.querySelector("#application-form");
  const successCard = document.querySelector("[data-success-card]");
  const mobileCta = document.querySelector("[data-mobile-cta]");
  const siteFooter = document.querySelector(".site-footer");
  const toast = document.querySelector("[data-toast]");
  const submitButton = document.querySelector("[data-submit-button]");
  const submissionError = document.querySelector("[data-submission-error]");
  const submissionErrorText = document.querySelector("[data-submission-error-text]");
  const connectionRibbon = document.querySelector("[data-connection-ribbon]");
  const connectionRibbonText = document.querySelector("[data-connection-ribbon-text]");
  const consentNames = ["privacyConsent", "marketingConsent", "termsConsent"];
  let currentStep = 1;
  let toastTimer;
  let formInView = false;
  let footerInView = false;
  let pendingSubmission = null;
  let retryRequestId = null;

  const scrollBehavior = reducedMotion ? "auto" : "smooth";

  function updateConnectionStatus() {
    if (isSubmissionConfigured) {
      connectionRibbon?.classList.remove("is-warning");
      if (connectionRibbonText) {
        connectionRibbonText.textContent = "신청 정보는 한지붕 운영용 스프레드시트에 안전하게 접수됩니다.";
      }
      return;
    }

    connectionRibbon?.classList.add("is-warning");
    if (connectionRibbonText) {
      connectionRibbonText.textContent = "현재 신청 접수 연결을 준비 중입니다. 연결 전에는 정보가 저장되지 않습니다.";
    }
  }

  function applyPreviewLock() {
    if (!form) return;

    const locked = !isSubmissionConfigured;
    form.setAttribute("aria-disabled", String(locked));
    form.classList.toggle("is-preview-locked", locked);
    form.dataset.formStatus = locked ? "preview-locked" : "active";

    if (!locked) return;

    document.querySelectorAll("[data-scroll-to-form]").forEach((link) => {
      const textNode = Array.from(link.childNodes).find(
        (node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim(),
      );
      if (textNode) textNode.textContent = "신청 화면 미리보기 ";
    });

    form.querySelectorAll("input, select, textarea, button").forEach((control) => {
      if (control.matches("[data-dialog-open], [data-dialog-close]")) return;
      control.disabled = true;
    });
  }

  function createRequestId() {
    const bytes = new Uint8Array(16);
    if (window.crypto?.getRandomValues) {
      window.crypto.getRandomValues(bytes);
    } else {
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

  function setSubmitting(isSubmitting) {
    if (!submitButton) return;
    if (!submitButton.dataset.originalHtml) {
      submitButton.dataset.originalHtml = submitButton.innerHTML;
    }
    submitButton.disabled = isSubmitting;
    if (isSubmitting) {
      submitButton.setAttribute("aria-busy", "true");
      submitButton.textContent = "신청 내용을 안전하게 접수하고 있습니다…";
    } else {
      submitButton.removeAttribute("aria-busy");
      submitButton.innerHTML = submitButton.dataset.originalHtml;
    }
  }

  function hideSubmissionError() {
    if (submissionError) submissionError.hidden = true;
  }

  function showSubmissionError(message) {
    if (!submissionError || !submissionErrorText) return;
    submissionErrorText.textContent = message;
    submissionError.hidden = false;
    submissionError.focus?.({ preventScroll: true });
    submissionError.scrollIntoView({ behavior: scrollBehavior, block: "center" });
  }

  function submitApplication(application) {
    hideSubmissionError();

    if (!isSubmissionConfigured) {
      showSubmissionError("현재 신청 접수 연결을 준비 중입니다. 관리자에게 Apps Script 배포 주소 연결을 요청해 주세요.");
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
      recipientName: application.name,
      recipientPhone: application.phone,
      ageGroup: application.ageGroup,
      channel: application.channel,
      receiveTime: application.time,
      applicantType: application.applicantType,
      privacyConsent: String(application.privacyConsent),
      marketingConsent: String(application.marketingConsent),
      termsConsent: String(application.termsConsent),
      consentVersion,
      website: application.website,
      returnOrigin: window.location.origin || "null",
    };

    const transportForm = document.createElement("form");
    transportForm.method = "post";
    transportForm.action = appsScriptEndpoint;
    transportForm.target = "hanjibung-sheet-submit";
    transportForm.hidden = true;

    Object.entries(payload).forEach(([name, value]) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      input.value = value;
      transportForm.appendChild(input);
    });

    document.body.appendChild(transportForm);
    setSubmitting(true);
    const timer = window.setTimeout(() => {
      if (!pendingSubmission || pendingSubmission.requestId !== requestId) return;
      pendingSubmission = null;
      setSubmitting(false);
      showSubmissionError("접수 확인이 늦어지고 있습니다. 입력 내용은 그대로입니다. 잠시 후 다시 시도해 주세요.");
    }, submitTimeoutMs);
    pendingSubmission = { requestId, application, timer };
    transportForm.submit();
    window.setTimeout(() => transportForm.remove(), 0);
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

    const message = data.code === "INVALID_INPUT"
      ? "입력 내용을 다시 확인해 주세요. 문제가 계속되면 한지붕 운영자에게 알려주세요."
      : "접수 중 문제가 생겼습니다. 입력 내용은 그대로입니다. 잠시 후 다시 시도해 주세요.";
    showSubmissionError(message);
  }

  function showToast(message) {
    if (!toast) return;
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.hidden = false;
    toastTimer = window.setTimeout(() => {
      toast.hidden = true;
    }, 3200);
  }

  function formatPhoneNumber(value) {
    const digits = value.replace(/\D/g, "").slice(0, 11);

    if (digits.length <= 3) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    if (digits.length === 10) {
      return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }

  function getRadioValue(name) {
    return form?.querySelector(`input[name="${name}"]:checked`)?.value || "";
  }

  function syncAllConsentState() {
    const allConsent = form?.elements.allConsent;
    if (!allConsent) return;

    const consentInputs = consentNames.map((name) => form.elements[name]);
    const checkedCount = consentInputs.filter((input) => input.checked).length;
    allConsent.checked = checkedCount === consentInputs.length;
    allConsent.indeterminate = checkedCount > 0 && checkedCount < consentInputs.length;
  }

  function syncChoiceStates() {
    syncAllConsentState();
    document.querySelectorAll(".choice-card, .agreement-card").forEach((label) => {
      const input = label.querySelector("input");
      label.classList.toggle("is-selected", Boolean(input?.checked));
    });
  }

  function updateMobileCtaVisibility() {
    if (!mobileCta) return;
    const hide = formInView || footerInView || !successCard.hidden;
    mobileCta.classList.toggle("is-hidden", hide);
    mobileCta.setAttribute("aria-hidden", String(hide));
    if ("inert" in mobileCta) mobileCta.inert = hide;
  }

  function setFieldError(fieldName, message) {
    const field = form?.querySelector(`[data-field="${fieldName}"]`);
    if (!field) return;

    const error = field.querySelector(".field-error");
    const controls = fieldName === "agreements"
      ? field.querySelectorAll("input[required]")
      : field.querySelectorAll("input");
    field.classList.toggle("has-error", Boolean(message));
    if (error) error.textContent = message;

    controls.forEach((control) => {
      if (message) control.setAttribute("aria-invalid", "true");
      else control.removeAttribute("aria-invalid");
    });
  }

  function focusField(fieldName) {
    const field = form?.querySelector(`[data-field="${fieldName}"]`);
    if (!field) return;
    const control = fieldName === "agreements"
      ? field.querySelector("input[required]:not(:checked):not(:disabled)") || field.querySelector("input:not(:disabled)")
      : field.querySelector("input:not(:disabled)");
    (control || field).focus({ preventScroll: true });
    field.scrollIntoView({ behavior: scrollBehavior, block: "center" });
  }

  function validateStepOne(shouldFocus = true) {
    const nameInput = form.elements.recipientName;
    const phoneInput = form.elements.recipientPhone;
    const name = nameInput.value.trim().replace(/\s+/g, " ");
    const phone = phoneInput.value.trim();
    let firstError = "";

    nameInput.value = name;

    if (!name) {
      setFieldError("name", "성함을 입력해 주세요. 예: 김영희");
      firstError ||= "name";
    } else if (!/^[가-힣a-zA-Z\s]{2,20}$/.test(name)) {
      setFieldError("name", "성함은 한글 또는 영문으로 2자 이상 입력해 주세요.");
      firstError ||= "name";
    } else {
      setFieldError("name", "");
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

    if (!getRadioValue("ageGroup")) {
      setFieldError("age", "연령대를 하나 선택해 주세요.");
      firstError ||= "age";
    } else {
      setFieldError("age", "");
    }

    if (firstError && shouldFocus) focusField(firstError);
    return !firstError;
  }

  function validateStepTwo(shouldFocus = true) {
    let firstError = "";

    if (!getRadioValue("channel")) {
      setFieldError("channel", "말씀을 받을 방법을 선택해 주세요.");
      firstError ||= "channel";
    } else {
      setFieldError("channel", "");
    }

    if (!getRadioValue("receiveTime")) {
      setFieldError("time", "생활에 가장 편한 시간을 하나 선택해 주세요.");
      firstError ||= "time";
    } else {
      setFieldError("time", "");
    }

    if (firstError && shouldFocus) focusField(firstError);
    return !firstError;
  }

  function validateStepThree(shouldFocus = true) {
    let firstError = "";
    const privacyConsent = form.elements.privacyConsent.checked;
    const termsConsent = form.elements.termsConsent.checked;

    if (!getRadioValue("applicantType")) {
      setFieldError("applicant", "직접 신청인지 가족을 대신한 신청인지 선택해 주세요.");
      firstError ||= "applicant";
    } else {
      setFieldError("applicant", "");
    }

    if (!privacyConsent || !termsConsent) {
      setFieldError("agreements", "개인정보 수집·이용과 서비스 이용약관의 필수 동의를 확인해 주세요.");
      firstError ||= "agreements";
    } else {
      setFieldError("agreements", "");
    }

    if (firstError && shouldFocus) focusField(firstError);
    return !firstError;
  }

  function validateStep(step, shouldFocus = true) {
    if (step === 1) return validateStepOne(shouldFocus);
    if (step === 2) return validateStepTwo(shouldFocus);
    if (step === 3) return validateStepThree(shouldFocus);
    return true;
  }

  function updateSummary() {
    const name = form.elements.recipientName.value.trim() || "—";
    const time = getRadioValue("receiveTime") || "—";
    const channel = getRadioValue("channel") || "카카오톡 알림 메시지";

    document.querySelector("[data-summary-name]").textContent = `${name} 님께`;
    document.querySelector("[data-summary-time]").textContent = time;
    document.querySelector("[data-summary-channel]").textContent = channel;
  }

  function updateProgress(step) {
    document.querySelectorAll("[data-progress-step]").forEach((item) => {
      const itemStep = Number(item.dataset.progressStep);
      item.classList.toggle("is-current", itemStep === step);
      item.classList.toggle("is-complete", itemStep < step);
      if (itemStep === step) item.setAttribute("aria-current", "step");
      else item.removeAttribute("aria-current");
    });
  }

  function goToStep(step, options = {}) {
    currentStep = step;
    document.querySelectorAll("[data-form-step]").forEach((panel) => {
      const isActive = Number(panel.dataset.formStep) === step;
      panel.hidden = !isActive;
      panel.classList.toggle("is-active", isActive);
    });

    if (step === 3) updateSummary();
    updateProgress(step);

    if (options.focus !== false) {
      const heading = document.querySelector(`[data-form-step="${step}"] h3`);
      if (heading) {
        heading.setAttribute("tabindex", "-1");
        heading.focus({ preventScroll: true });
      }
      formShell.scrollIntoView({ behavior: scrollBehavior, block: "start" });
    }
  }

  function showSuccess(application) {
    form.reset();
    syncChoiceStates();
    formShell.hidden = true;
    successCard.hidden = false;
    updateMobileCtaVisibility();

    document.querySelector("[data-success-name]").textContent = `${application.name} 님, 반갑습니다.`;
    document.querySelector("[data-success-message]").textContent =
      `${application.time}에 ${application.channel}로 받도록 신청 화면을 마쳤습니다.`;
    document.querySelector("[data-success-channel]").textContent = application.channel;
    document.querySelector("[data-success-time]").textContent = application.time;

    successCard.focus({ preventScroll: true });
    successCard.scrollIntoView({ behavior: scrollBehavior, block: "start" });
  }

  function resetApplication() {
    form.reset();
    retryRequestId = null;
    hideSubmissionError();
    syncChoiceStates();
    document.querySelectorAll(".field.has-error").forEach((field) => field.classList.remove("has-error"));
    document.querySelectorAll(".field-error").forEach((error) => {
      error.textContent = "";
    });
    document.querySelectorAll("[aria-invalid]").forEach((control) => control.removeAttribute("aria-invalid"));
    document.querySelector("[data-proxy-notice]").hidden = true;
    successCard.hidden = true;
    formShell.hidden = false;
    goToStep(1, { focus: false });
    updateMobileCtaVisibility();
    const heroTitle = document.querySelector("#hero-title");
    heroTitle.setAttribute("tabindex", "-1");
    heroTitle.focus({ preventScroll: true });
    document.querySelector("#top").scrollIntoView({ behavior: scrollBehavior, block: "start" });
  }

  const previewTabs = [...document.querySelectorAll("[data-message]")];

  previewTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const message = messageExamples[tab.dataset.message];
      const bubble = document.querySelector(".message-bubble");
      if (!message || tab.classList.contains("is-active")) return;

      document.querySelectorAll("[data-message]").forEach((item) => {
        const isSelected = item === tab;
        item.classList.toggle("is-active", isSelected);
        item.setAttribute("aria-selected", String(isSelected));
        item.setAttribute("tabindex", isSelected ? "0" : "-1");
      });
      document.querySelector("#message-preview").setAttribute("aria-labelledby", tab.id);

      bubble.classList.add("is-changing");
      window.setTimeout(() => {
        document.querySelector("[data-message-label]").textContent = message.label;
        document.querySelector("[data-message-verse]").textContent = message.verse;
        document.querySelector("[data-message-reference]").textContent = message.reference;
        document.querySelector("[data-message-reflection]").innerHTML = message.reflection;
        document.querySelector("[data-message-date]").textContent = message.time;
        bubble.classList.remove("is-changing");
      }, reducedMotion ? 0 : 150);
    });

    tab.addEventListener("keydown", (event) => {
      const currentIndex = previewTabs.indexOf(tab);
      let nextIndex = currentIndex;
      if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % previewTabs.length;
      else if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + previewTabs.length) % previewTabs.length;
      else if (event.key === "Home") nextIndex = 0;
      else if (event.key === "End") nextIndex = previewTabs.length - 1;
      else return;

      event.preventDefault();
      previewTabs[nextIndex].focus();
      previewTabs[nextIndex].click();
    });
  });

  document.querySelectorAll("[data-scroll-to-form]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      formSection.scrollIntoView({ behavior: scrollBehavior, block: "start" });
      window.setTimeout(() => {
        if (!formShell.hidden) form.elements.recipientName.focus({ preventScroll: true });
      }, reducedMotion ? 0 : 500);
    });
  });

  form.elements.recipientPhone.addEventListener("input", (event) => {
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
    input.setSelectionRange(nextCaret, nextCaret);
    setFieldError("phone", "");
  });

  form.elements.recipientName.addEventListener("input", () => setFieldError("name", ""));

  form.addEventListener("input", () => {
    if (!pendingSubmission) retryRequestId = null;
    hideSubmissionError();
  });

  form.addEventListener("change", (event) => {
    if (event.target.name === "allConsent") {
      consentNames.forEach((name) => {
        form.elements[name].checked = event.target.checked;
      });
    }
    if (event.target.name === "ageGroup") setFieldError("age", "");
    if (event.target.name === "channel") setFieldError("channel", "");
    if (event.target.name === "receiveTime") setFieldError("time", "");
    if (event.target.name === "applicantType") {
      setFieldError("applicant", "");
      document.querySelector("[data-proxy-notice]").hidden = event.target.value !== "가족 대리";
    }
    if (event.target.name === "allConsent" || consentNames.includes(event.target.name)) {
      if (form.elements.privacyConsent.checked && form.elements.termsConsent.checked) {
        setFieldError("agreements", "");
      }
    }
    syncChoiceStates();
  });

  form.addEventListener("keydown", (event) => {
    const isTextEntry = event.target.matches('input[type="text"], input[type="tel"]');
    if (event.key !== "Enter" || !isTextEntry || currentStep >= 3) return;
    event.preventDefault();
    if (validateStep(currentStep)) goToStep(currentStep + 1);
  });

  document.querySelectorAll("[data-next-step]").forEach((button) => {
    button.addEventListener("click", () => {
      if (validateStep(currentStep)) goToStep(Number(button.dataset.nextStep));
    });
  });

  document.querySelectorAll("[data-prev-step]").forEach((button) => {
    button.addEventListener("click", () => goToStep(Number(button.dataset.prevStep)));
  });

  document.querySelector("[data-edit-step]").addEventListener("click", (event) => {
    goToStep(Number(event.currentTarget.dataset.editStep));
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (currentStep !== 3) {
      if (validateStep(currentStep)) goToStep(Math.min(currentStep + 1, 3));
      return;
    }
    if (!validateStepOne(false)) {
      goToStep(1, { focus: false });
      validateStepOne(true);
      return;
    }
    if (!validateStepTwo(false)) {
      goToStep(2, { focus: false });
      validateStepTwo(true);
      return;
    }
    if (!validateStepThree()) return;

    const application = {
      name: form.elements.recipientName.value.trim(),
      phone: form.elements.recipientPhone.value.trim(),
      ageGroup: getRadioValue("ageGroup"),
      time: getRadioValue("receiveTime"),
      channel: getRadioValue("channel"),
      applicantType: getRadioValue("applicantType"),
      privacyConsent: form.elements.privacyConsent.checked,
      marketingConsent: form.elements.marketingConsent.checked,
      termsConsent: form.elements.termsConsent.checked,
      website: form.elements.website.value.trim(),
    };
    submitApplication(application);
  });

  document.querySelector("[data-restart]").addEventListener("click", resetApplication);

  document.querySelector("[data-share-service]").addEventListener("click", async () => {
    const shareData = {
      title: "하루한말씀",
      text: "매일 한 구절의 말씀으로 하루를 시작해 보세요.",
      url: window.location.href.split("#")[0],
    };

    try {
      if (navigator.share && window.location.protocol !== "file:") {
        await navigator.share(shareData);
        return;
      }
      if (navigator.clipboard && window.location.protocol !== "file:") {
        await navigator.clipboard.writeText(shareData.url);
        showToast("서비스 주소를 복사했습니다. 가족에게 보내주세요.");
        return;
      }
      showToast("도메인을 연결하면 가족에게 공유할 수 있습니다.");
    } catch (error) {
      if (error?.name !== "AbortError") showToast("공유하지 못했습니다. 잠시 후 다시 시도해 주세요.");
    }
  });

  document.querySelectorAll(".faq-list details").forEach((detail) => {
    detail.addEventListener("toggle", () => {
      if (!detail.open) return;
      document.querySelectorAll(".faq-list details").forEach((other) => {
        if (other !== detail) other.open = false;
      });
    });
  });

  document.querySelectorAll("[data-dialog-open]").forEach((button) => {
    button.addEventListener("click", () => {
      const dialog = document.getElementById(button.dataset.dialogOpen);
      if (!dialog) return;
      if (typeof dialog.showModal === "function") dialog.showModal();
      else dialog.setAttribute("open", "");
      document.body.classList.add("dialog-open");
    });
  });

  document.querySelectorAll("[data-dialog-close]").forEach((button) => {
    button.addEventListener("click", () => {
      const dialog = button.closest("dialog");
      if (typeof dialog?.close === "function") dialog.close();
      else {
        dialog?.removeAttribute("open");
        document.body.classList.remove("dialog-open");
      }
    });
  });

  document.querySelectorAll("dialog").forEach((dialog) => {
    dialog.addEventListener("close", () => document.body.classList.remove("dialog-open"));
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

  window.addEventListener(
    "scroll",
    () => {
      siteHeader?.classList.toggle("is-scrolled", window.scrollY > 20);
    },
    { passive: true },
  );

  window.addEventListener("message", handleSubmissionMessage);

  if ("IntersectionObserver" in window && mobileCta && formSection && siteFooter) {
    const ctaObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target === formSection) formInView = entry.isIntersecting;
          if (entry.target === siteFooter) footerInView = entry.isIntersecting;
        });
        updateMobileCtaVisibility();
      },
      { threshold: 0.08 },
    );
    ctaObserver.observe(formSection);
    ctaObserver.observe(siteFooter);
  } else {
    const updateFallbackVisibility = () => {
      const formRect = formSection.getBoundingClientRect();
      const footerRect = siteFooter.getBoundingClientRect();
      formInView = formRect.top < window.innerHeight && formRect.bottom > 0;
      footerInView = footerRect.top < window.innerHeight && footerRect.bottom > 0;
      updateMobileCtaVisibility();
    };
    window.addEventListener("scroll", updateFallbackVisibility, { passive: true });
    updateFallbackVisibility();
  }

  updateConnectionStatus();
  syncChoiceStates();
  updateMobileCtaVisibility();
  goToStep(1, { focus: false });
  applyPreviewLock();
})();
