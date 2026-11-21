// Deploy as the designated account, with access set to Only myself.
const LEADS = {
  diagnosis: { tab: '진단 신청',
    status: 'C', label: 'F', contact: 'K', attribution: ['T','AC'] },
  callback: { tab: '상담문의',
    status: 'K', label: 'C', contact: 'E', attribution: ['N','W'] }
};
function authorize_() {
  const email = String(Session.getActiveUser().getEmail()).toLowerCase();
  if (!email || email !== DEPLOYMENT.admin) throw new Error('관리자 로그인이 필요합니다.');
}
function doGet() {
  authorize_();
  return HtmlService.createHtmlOutputFromFile('Index').setTitle('한지붕 관리자')
    .addMetaTag('viewport','width=device-width,initial-scale=1');
}
function config_(kind) {
  if (!Object.prototype.hasOwnProperty.call(LEADS, kind)) throw new Error('신청 유형을 확인해 주세요.');
  return Object.assign({}, LEADS[kind], DEPLOYMENT[kind]);
}
function range_(config, from, to, first, last) {
  return "'" + config.tab + "'!" + from + first + ':' + to + last;
}
function masked_(value) {
  const text = String(value || '').trim();
  if (!text) return '—';
  return text.includes('@') ? text.charAt(0) + '•••@' + text.split('@').pop() : '•••• ' + text.replace(/\D/g,'').slice(-4);
}
function listLeads(kind, before) {
  authorize_();
  const c = config_(kind);
  let last;
  if (before == null) {
    // Sheets omits trailing empty rows. Fetch IDs alone to locate the append-only tail.
    last = (Sheets.Spreadsheets.Values.get(c.book, "'" + c.tab + "'!A:A").values || []).length;
  } else {
    if (!Number.isSafeInteger(before) || before < 2 || before > 10000000) throw new Error('목록 위치가 올바르지 않습니다.');
    last = before - 1;
  }
  if (last < 2) return { rows: [], next: null };
  const first = Math.max(2, last - 24);
  const fields = [['A','B'], [c.status,c.status], [c.label,c.label], [c.contact,c.contact]];
  const tab = Sheets.Spreadsheets.get(c.book, {fields:'sheets(properties(sheetId,gridProperties(columnCount)))'}).sheets
    .find(s => s.properties.sheetId === c.gid);
  const hasAttribution = tab && tab.properties.gridProperties.columnCount >= (kind === 'diagnosis' ? 29 : 23);
  if (hasAttribution) fields.push(c.attribution);
  const values = Sheets.Spreadsheets.Values.batchGet(c.book,{
    ranges: fields.map(([a,b]) => range_(c,a,b,first,last)), valueRenderOption:'FORMATTED_VALUE'
  }).valueRanges.map(part => part.values || []);
  const rows = [];
  for (let row = last; row >= first; row--) {
    const index = row-first, main = values[0][index] || [], status = (values[1][index] || [])[0] || '';
    if (!/^[\da-f]{8}-[\da-f-]{27}$/i.test(main[0] || '') || (kind === 'diagnosis' && status !== 'complete')) continue;
    const label = (values[2][index] || [])[0] || '';
    const m = values[4] && values[4][index] || [];
    const when = /^\d{4}-\d{2}-\d{2}T.*Z$/.test(main[1]) ?
      Utilities.formatDate(new Date(main[1]),'Asia/Seoul','yyyy-MM-dd HH:mm:ss') : main[1];
    rows.push({row, id: main[0], when, label, status: status === 'complete' ? '접수 완료' : status,
      contact: masked_((values[3][index] || [])[0]), landing: m[0] || '', conversion: m[1] || '',
      variant: m[2] || '', source: m[3] || '', medium: m[4] || '', campaign: m[5] || '',
      campaignId: m[6] || '', content: m[7] || '', term: m[8] || '', referrer: m[9] || '',
      url: 'https://docs.google.com/spreadsheets/d/' + c.book + '/edit#gid=' + c.gid + '&range=A' + row});
  }
  return {rows, next: first > 2 ? first : null};
}
function getContact(kind, row, id) {
  authorize_();
  const c = config_(kind);
  if (!Number.isSafeInteger(row) || row < 2 || row > 10000000 || !/^[\da-f]{8}-[\da-f-]{27}$/i.test(id || '')) throw new Error('접수번호를 확인해 주세요.');
  const ranges = [['A','A'],[c.contact,c.contact]].map(([a,b]) => range_(c,a,b,row,row));
  const data = Sheets.Spreadsheets.Values.batchGet(c.book, {ranges}).valueRanges;
  if (!data[0].values || data[0].values[0][0] !== id) throw new Error('접수 내역이 변경됐습니다. 목록을 새로 열어 주세요.');
  return String(data[1].values && data[1].values[0][0] || '');
}
function getInquiryDetail(row, id) {
  authorize_();
  if (!Number.isSafeInteger(row) || row < 2 || row > 10000000 || !/^[\da-f]{8}-[\da-f-]{27}$/i.test(id || '')) throw new Error('접수번호를 확인해 주세요.');
  const c = config_('callback');
  const ranges = [['A','A'],['G','H']].map(([a,b]) => range_(c,a,b,row,row));
  const data = Sheets.Spreadsheets.Values.batchGet(c.book,{ranges}).valueRanges;
  if (data[0].values?.[0]?.[0] !== id) throw new Error('접수 내역이 변경됐습니다. 목록을 새로 열어 주세요.');
  const [topic, message] = data[1].values?.[0] || [];
  let photo = '';
  if (topic === '방 등록') {
    const tab = Sheets.Spreadsheets.get(c.book,{fields:'sheets(properties(sheetId,gridProperties(columnCount)))'}).sheets.find(s => s.properties.sheetId === c.gid);
    if (tab && tab.properties.gridProperties.columnCount >= 24) {
      const values = Sheets.Spreadsheets.Values.batchGet(c.book,{ranges:[range_(c,'X','X',1,1),range_(c,'X','X',row,row)]}).valueRanges;
      const stored = String(values[1].values?.[0]?.[0] || '');
      if (values[0].values?.[0]?.[0] === '방 등록 사진 (관리자 미리보기)' && stored.length <= 44000 && /^data:image\/jpeg;base64,\/9j\//.test(stored)) photo = stored;
    }
  }
  return {topic:topic || '',message:message || '',photo};
}
function table_(response) {
  const columns = (response.dimensionHeaders || []).concat(response.metricHeaders || []).map(h => h.name);
  return (response.rows || []).map(row => {
    const items = (row.dimensionValues || []).map(i => i.value).concat((row.metricValues || []).map(i => Number(i.value)));
    return Object.fromEntries(columns.map((key,index) => [key,items[index]]));
  });
}
function funnelCounts_(report) {
  function counts(data) {
    const stepIndex = (data?.dimensionHeaders || []).findIndex(h => h.name === 'funnelStepName');
    const headers = data?.metricHeaders || [];
    // GA4 can repeat metric headers while supplying only the first block of values.
    let usersIndex = headers.findIndex(h => h.name === 'activeUsers');
    if (usersIndex < 0) usersIndex = headers.findIndex(h => h.name === 'funnelStepActiveUsers');
    if (stepIndex < 0 || usersIndex < 0) return null;
    const stepRows = step => (data.rows || []).filter(row =>
      (row.dimensionValues?.[stepIndex]?.value || '').replace(/^\d+\.\s*/, '') === step);
    function count(rows, index) {
      if (rows.length !== 1 || index < 0) return null;
      const raw = rows[0].metricValues?.[index]?.value;
      if (!/^\d+$/.test(String(raw))) return null;
      const value = Number(raw);
      return Number.isSafeInteger(value) ? value : null;
    }
    const first = stepRows('Headline'), last = stepRows('Receipt');
    return {exposed:count(first,usersIndex), converted:count(last,usersIndex), receiptMissing:!last.length,
      abandoned:count(first,headers.findIndex(h => h.name === 'funnelStepAbandonments'))};
  }
  const visual = counts(report?.funnelVisualization), table = counts(report?.funnelTable);
  if (!visual && !table) return {unavailable:true};
  const exposed = visual?.exposed ?? table?.exposed ?? null;
  let converted = visual?.converted ?? table?.converted ?? null;
  // In this closed two-step funnel everyone who did not abandon Headline reached Receipt.
  if (converted === null && table?.receiptMissing && (!visual || visual.receiptMissing) &&
      exposed !== null && table.exposed === exposed && table.abandoned !== null && table.abandoned <= exposed) {
    converted = exposed - table.abandoned;
  }
  return {exposed,converted};
}
function getTraffic(days) {
  authorize_();
  if (![7,28,90].includes(days)) throw new Error('조회 기간을 확인해 주세요.');
  const property = 'properties/' + DEPLOYMENT.property;
  const day = shift => Utilities.formatDate(new Date(Date.now()+shift*86400000),'Asia/Seoul','yyyy-MM-dd');
  const dates = [{startDate:day(1-days),endDate:day(0)}];
  const cache = CacheService.getUserCache(), key = 'traffic-v3-' + days + '-' + day(0);
  const saved = cache.get(key);
  if (saved) return JSON.parse(saved);
  const host = {filter:{fieldName:'hostName', inListFilter:{values:['hanjibung.kr','www.hanjibung.kr']}}};
  const paths = {filter:{fieldName:'pagePath',inListFilter:{values:['/','/about/','/how-it-works/','/consultation/','/reservation/','/rooms/register/','/reservation/privacy/']}}};
  const filter = {andGroup:{expressions:[host,paths]}};
  function report(dimensions, metrics, sort, limit) {
    return {dateRanges:dates, dimensionFilter:filter, dimensions:dimensions.map(name => ({name})),
      metrics:metrics.map(name => ({name})), orderBys:[{metric:{metricName:sort},desc:true}], limit};
  }
  const reports = AnalyticsData.Properties.batchRunReports({requests:[
    report(['pagePath'],['screenPageViews','totalUsers'],'screenPageViews',10),
    report(['sessionSourceMedium','sessionCampaignName'],['sessions'],'sessions',50)
  ]}, property).reports;
  const groups = ['a','b','c'];
  const token = ScriptApp.getOAuthToken();
  const event = name => ({funnelEventFilter:{eventName:name}});
  const requests = groups.map(group => ({
    url:'https://analyticsdata.googleapis.com/v1alpha/' + property + ':runFunnelReport',
    method:'post', contentType:'application/json', headers:{Authorization:'Bearer ' + token},
    muteHttpExceptions:true, payload:JSON.stringify({dateRanges:dates, dimensionFilter:host,
      funnel:{isOpenFunnel:false,steps:[
        {name:'Headline',filterExpression:event('headline_view_' + group)},
        {name:'Receipt',filterExpression:{orGroup:{expressions:[event('headline_complete_' + group),event('headline_callback_' + group),event('headline_registration_' + group)]}}}
      ]}})
  }));
  const funnels = UrlFetchApp.fetchAll(requests).map((response,index) => {
    const group = groups[index].toUpperCase();
    if (response.getResponseCode() !== 200) return {group,unavailable:true};
    try { return {group,...funnelCounts_(JSON.parse(response.getContentText()))}; }
    catch { return {group,unavailable:true}; }
  });
  const result = {start:dates[0].startDate,end:dates[0].endDate,
    asOf:Utilities.formatDate(new Date(),'Asia/Seoul','yyyy-MM-dd HH:mm'), pages:table_(reports[0]),
    sources:table_(reports[1]), funnels,
    limited:reports.some(r => r.metadata && (r.metadata.subjectToThresholding || r.metadata.dataLossFromOtherRow))};
  if (funnels.every(f => !f.unavailable)) cache.put(key, JSON.stringify(result), 600);
  return result;
}
