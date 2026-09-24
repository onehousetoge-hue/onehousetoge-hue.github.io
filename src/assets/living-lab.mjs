// Educational tools only. No network, browser storage, analytics or inquiry submission.
export const preparationQuestions = [
  { id: "perspective", title: "어떤 입장에서 알아보고 계신가요?", options: [["resident", "지금 살고 있는 집의 공간을 살펴보는 어르신"], ["family", "함께 의논하고 싶은 가족"], ["young", "공동생활을 알아보는 청년·유학생"], ["facilitator", "대화를 돕는 지역기관 담당자"]] },
  { id: "decision", title: "함께 생활하는 것에 대한 생각은 어떤가요?", options: [["explore", "관심은 있지만 아직 결정하지 않았어요"], ["disagree", "가족이나 함께 살 사람과 생각이 달라요"], ["pause", "지금은 함께 살고 싶지 않아요"], ["unknown", "아직 잘 모르겠어요"]] },
  { id: "concern", title: "지금 가장 먼저 살펴보고 싶은 것은 무엇인가요?", options: [["privacy", "개인공간과 사생활"], ["routine", "생활시간·청소·방문객"], ["cost", "월세 외 생활비 항목"], ["conversation", "가족과 대화하는 방법"]] },
  { id: "next", title: "어떤 도움부터 이용하고 싶으신가요?", options: [["read", "혼자 자료를 읽고 정리하고 싶어요"], ["talk", "함께 이야기할 질문이 필요해요"], ["ask", "전화·이메일 상담 범위를 알고 싶어요"]] },
];

const topicAdvice = {
  privacy: { title: "출입과 사용을 따로 정해 보세요", question: "개인방에 들어가기 전 허락을 구하는 방법과 함께 쓰지 않는 물건은 무엇인가요?", href: "/resources/private-common-space/", label: "개인공간·공용공간 작성표" },
  routine: { title: "하루의 장면 하나부터 이야기하세요", question: "잠들 시간과 주방·욕실 사용이 겹치는 시간에 서로 어떻게 조정하면 좋을까요?", href: "/resources/conversation-practice/", label: "생활 장면 대화 연습" },
  cost: { title: "모르는 비용은 0원으로 보지 마세요", question: "월세에 포함되는 항목과 별도 납부하는 항목을 구분했나요? 아직 확인하지 못한 비용은 무엇인가요?", href: "/resources/living-cost-planner/", label: "한 달 생활비 항목 정리" },
  conversation: { title: "설득하기 전에 다른 생각을 적어 보세요", question: "지금 그 집에 사는 분의 희망과 가족의 걱정은 각각 무엇인가요? 오늘 결정하지 않을 항목은 무엇인가요?", href: "/resources/family-checklist/", label: "가족과 먼저 이야기할 질문" },
};

export function preparationResult(answers) {
  const missing = preparationQuestions.filter(q => !q.options.some(([value]) => value === answers[q.id])).map(q => q.id);
  if (missing.length) return { complete: false, missing };
  const notes = [];
  if (answers.decision === "pause") notes.push("지금 함께 살지 않는 선택을 존중하세요. 방이 남는다는 이유만으로 공동생활을 시작할 필요는 없습니다.");
  else if (answers.decision === "disagree") notes.push("오늘의 목표는 결론이 아니라 서로의 이유를 듣는 것입니다. 의견이 다른 항목은 ‘보류’로 남기세요.");
  else notes.push("관심을 갖는 것과 함께 살기로 결정하는 것은 다릅니다. 바라는 점과 원하지 않는 점을 먼저 나눠 보세요.");
  const perspectives = {
    resident: "현재의 생활과 사생활에서 꼭 지키고 싶은 기준을 당사자의 말로 정리해 보세요.",
    family: "부모님의 생각을 대신 정하지 말고, 본인이 원하는 점을 먼저 들은 뒤 가족의 걱정을 이야기하세요.",
    young: "식사·돌봄·집안일이 당연한 역할이라고 생각하지 말고, 개인생활과 공용공간의 기준을 확인하세요.",
    facilitator: "대화 참여를 원하지 않거나 답하고 싶지 않은 질문을 건너뛸 수 있도록 안내하세요.",
  };
  notes.push(perspectives[answers.perspective]);
  const topic = topicAdvice[answers.concern];
  const next = answers.next === "ask"
    ? { href: "/programs/senior-home-consulting/", label: "전화·이메일 무료상담 범위 확인" }
    : answers.next === "talk"
      ? { href: "/resources/conversation-practice/", label: "대화 예문을 함께 읽기" }
      : { href: "/resources/", label: "무료 생활자료 둘러보기" };
  return { complete: true, notes, topic, next, answers: preparationQuestions.map(q => ({ question: q.title, answer: q.options.find(([v]) => v === answers[q.id])[1] })) };
}

export const costItems = [
  ["rent", "월세", "계약 상대방이 안내한 월 금액"],
  ["management", "관리비", "월세와 별도인 관리비"],
  ["utilities", "전기·수도·가스", "계절에 따라 달라질 수 있는 별도 비용"],
  ["internet", "인터넷", "월세·관리비에 포함되는지 먼저 확인"],
  ["supplies", "공용 소모품", "세제·휴지 등 함께 쓰는 물품의 본인 부담분"],
  ["transport", "통학·출퇴근 교통비", "주거비와 별도로 비교할 한 달 이동비"],
];

export function summarizeCosts(rows) {
  let total = 0;
  const unknown = [], invalid = [], included = [], lines = [];
  for (const [id, label] of costItems) {
    const row = rows[id] || {};
    if (row.mode === "included") { included.push(label); lines.push({ label, text: "다른 항목에 포함 또는 별도 지출 없음" }); continue; }
    if (row.mode !== "known") { unknown.push(label); lines.push({ label, text: "확인 필요" }); continue; }
    const raw = String(row.amount ?? "").trim();
    if (!/^\d{1,8}$/.test(raw)) { invalid.push(id); continue; }
    const amount = Number(raw);
    total += amount;
    lines.push({ label, text: `${amount.toLocaleString("ko-KR")}원` });
  }
  return { total, unknown, invalid, included, lines, complete: invalid.length === 0 && unknown.length === 0 };
}

function boot() {
  const setFocus = element => { element.focus({ preventScroll: true }); element.scrollIntoView({ block: "start", behavior: "instant" }); };
  const list = (element, values) => element.replaceChildren(...values.map(value => { const li = document.createElement("li"); li.textContent = value; return li; }));
  const tool = document.querySelector("[data-preparation]");
  if (tool) {
    const result = document.querySelector("[data-preparation-result]");
    const error = tool.querySelector("[data-preparation-error]");
    const progress = tool.querySelector("[data-preparation-progress]");
    const readAnswers = () => Object.fromEntries(preparationQuestions.map(q => [q.id, tool.querySelector(`input[name="${q.id}"]:checked`)?.value]));
    const clearResult = () => { result.hidden = true; result.querySelectorAll("[data-result-list]").forEach(el => el.replaceChildren()); };
    tool.querySelector("[data-preparation-run]").hidden = false;
    tool.addEventListener("change", () => {
      const count = Object.values(readAnswers()).filter(Boolean).length;
      progress.textContent = `${count} / ${preparationQuestions.length}개 선택 · 선택을 바꾸면 정리표를 다시 만들어 주세요.`;
      clearResult(); error.hidden = true;
      tool.querySelectorAll("fieldset").forEach(el => el.removeAttribute("aria-invalid"));
    });
    tool.querySelector("[data-preparation-run]").addEventListener("click", () => {
      const data = preparationResult(readAnswers());
      if (!data.complete) {
        error.textContent = `아직 선택하지 않은 질문이 ${data.missing.length}개 있습니다. 각 질문에서 한 가지를 골라 주세요.`;
        error.hidden = false;
        const fieldset = tool.querySelector(`[data-question="${data.missing[0]}"]`);
        fieldset.setAttribute("aria-invalid", "true");
        setFocus(fieldset.querySelector("input"));
        return;
      }
      error.hidden = true;
      list(result.querySelector("[data-result-answers]"), data.answers.map(a => `${a.question} — ${a.answer}`));
      list(result.querySelector("[data-result-notes]"), data.notes);
      result.querySelector("[data-result-topic]").textContent = data.topic.title;
      result.querySelector("[data-result-question]").textContent = data.topic.question;
      for (const [key, value] of [["topic", data.topic], ["next", data.next]]) {
        const link = result.querySelector(`[data-result-link="${key}"]`);
        link.href = value.href; link.textContent = value.label;
      }
      result.hidden = false;
      setFocus(result.querySelector("h2"));
    });
    tool.querySelector("[data-preparation-reset]").addEventListener("click", () => {
      tool.querySelectorAll("input").forEach(el => { el.checked = false; });
      tool.querySelectorAll("fieldset").forEach(el => el.removeAttribute("aria-invalid"));
      clearResult(); error.hidden = true; progress.textContent = "선택을 모두 지웠습니다. 0 / 4개 선택";
      tool.querySelector("[data-lab-reset]").open = false;
      setFocus(tool.querySelector("input"));
    });
  }
  const costs = document.querySelector("[data-cost-planner]");
  if (costs) {
    const result = document.querySelector("[data-cost-result]");
    const error = costs.querySelector("[data-cost-error]");
    const readRows = () => Object.fromEntries(costItems.map(([id]) => [id, { mode: costs.querySelector(`#cost-${id}-mode`).value, amount: costs.querySelector(`#cost-${id}`).value }]));
    function updateRows() {
      for (const [id] of costItems) {
        const input = costs.querySelector(`#cost-${id}`);
        const known = costs.querySelector(`#cost-${id}-mode`).value === "known";
        input.disabled = !known;
        input.closest("[data-amount-row]").hidden = !known;
        input.removeAttribute("aria-invalid");
      }
      result.hidden = true; result.querySelector("[data-cost-lines]").replaceChildren(); error.hidden = true;
    }
    updateRows();
    costs.querySelector("[data-cost-run]").hidden = false;
    costs.addEventListener("change", updateRows);
    costs.addEventListener("input", () => { result.hidden = true; result.querySelector("[data-cost-lines]").replaceChildren(); error.hidden = true; });
    costs.querySelector("[data-cost-run]").addEventListener("click", () => {
      const data = summarizeCosts(readRows());
      if (data.invalid.length) {
        error.hidden = false; error.textContent = "확인한 금액은 원 단위의 숫자만 입력해 주세요. 쉼표 없이 0~99,999,999원 사이로 입력할 수 있습니다.";
        const input = costs.querySelector(`#cost-${data.invalid[0]}`); input.setAttribute("aria-invalid", "true"); setFocus(input); return;
      }
      result.querySelector("[data-cost-total]").textContent = `${data.total.toLocaleString("ko-KR")}원`;
      result.querySelector("[data-cost-state]").textContent = data.unknown.length ? `아직 확인할 항목 ${data.unknown.length}개: ${data.unknown.join(", ")}. 이 합계는 전체 생활비가 아닙니다.` : "입력한 6개 항목의 합계입니다. 식비·통신비·보증금·이사비 등은 포함하지 않습니다.";
      list(result.querySelector("[data-cost-lines]"), data.lines.map(line => `${line.label}: ${line.text}`));
      result.hidden = false; setFocus(result.querySelector("h2"));
    });
    costs.querySelector("[data-cost-reset]").addEventListener("click", () => {
      costs.querySelectorAll("select").forEach(el => { el.value = "unknown"; });
      costs.querySelectorAll("input").forEach(el => { el.value = ""; });
      updateRows(); costs.querySelector("[data-lab-reset]").open = false;
      costs.querySelector("[data-cost-reset-status]").textContent = "작성한 금액과 결과를 모두 지웠습니다.";
      setFocus(costs.querySelector("select"));
    });
  }
  document.querySelectorAll("[data-print-result]").forEach(button => button.addEventListener("click", () => {
    document.body.classList.add("lab-print-result"); window.print();
  }));
  window.addEventListener("afterprint", () => document.body.classList.remove("lab-print-result"));
}

if (typeof document !== "undefined") boot();
