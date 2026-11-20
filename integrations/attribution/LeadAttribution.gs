// Shared by the two intake projects. Existing rows keep their original schema.
const LEAD_COLUMNS = ['첫 방문 페이지', '전환 페이지', '상세페이지 안', '유입 출처', '유입 매체',
  'UTM 캠페인', 'UTM ID', 'UTM 콘텐츠', 'UTM 키워드', '외부 유입 도메인'];

function leadCells_(input, kind) {
  if (!input || !['/', '/reservation/', '/reservation/privacy/'].includes(input.landing)) return [];
  function plain(value) {
    if (typeof value !== 'string' || value.length > 100) return '';
    const text = value.trim();
    return /^[=+@-]|[\u0000-\u001f<>@]|01[016789][ -]?\d{3,4}[ -]?\d{4}|\d{6}[- ]?[1-8]\d{6}/.test(text) ? '' : text;
  }
  const host = typeof input.referrer === 'string' && input.referrer.length <= 180 &&
    /^(?:[a-z0-9-]+\.)+[a-z0-9-]+$/i.test(input.referrer) ? input.referrer.toLowerCase() : '';
  return [input.landing, kind === 'callback' ? '/reservation/?consultation=quick' : '/reservation/',
    /^[ABC]$/.test(input.variant || '') ? input.variant : '', plain(input.source), plain(input.medium),
    plain(input.campaign), plain(input.id), plain(input.content), plain(input.term), host];
}

// Called under the intake lock, before adding the lead. Only initialize unused columns.
function ensureLeadColumns_(sheet, base) {
  const end = base + LEAD_COLUMNS.length;
  const size = sheet.getMaxColumns();
  if (size < end) sheet.insertColumnsAfter(size, end - size);
  const header = sheet.getRange(1, base + 1, 1, LEAD_COLUMNS.length);
  if (header.getValues()[0].every((value, index) => value === LEAD_COLUMNS[index])) return;
  if (!sheet.getRange(1, base + 1, Math.max(1, sheet.getLastRow()), LEAD_COLUMNS.length).isBlank())
    throw new Error('Lead column headers differ from the expected layout');
  header.setValues([LEAD_COLUMNS]).setFontWeight('bold');
}
