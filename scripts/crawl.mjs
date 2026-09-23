import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
const base = new URL(process.argv[2] || 'https://hanjibung.kr/');
const output = path.resolve(process.argv[3] || '../한지붕-운영검토/crawl');
if (!['hanjibung.kr','127.0.0.1'].includes(base.hostname)) throw new Error('Unexpected crawl target');
const origin = 'https://hanjibung.kr';
const issues = [], rows = [], assets = new Set(), queue = new Set(['/']), seen = new Set();
async function get(route) {
  let url = new URL(route,base), chain = [];
  for (let n=0;n<8;n++) {
    if (chain.some(item=>item.url===url.href)) throw new Error('Redirect loop '+route);
    const response = await fetch(url,{redirect:'manual',signal:AbortSignal.timeout(20000)});
    chain.push({url:url.href,status:response.status});
    if (response.status>=300 && response.status<400 && response.headers.has('location')) {url = new URL(response.headers.get('location'),url);continue;}
    return {response,url:url.href,chain,body:await response.text()};
  }
  throw new Error('Redirect limit '+route);
}
const robotResult = await get('/robots.txt'), sitemapResult=await get('/sitemap.xml');
const sitemap=[...sitemapResult.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map(x=>new URL(x[1]).pathname);
for(const route of sitemap) queue.add(route);
const disallows=[...robotResult.body.matchAll(/^Disallow:\s*(\S+)/gm)].map(x=>x[1]);
const meta=(html,name,attr='name')=>html.match(new RegExp(`<meta ${attr}="${name}" content="([^"]*)"`))?.[1]||'';
const htmlDocuments=new Map();
for(const route of queue) {
  if(seen.has(route)) continue;seen.add(route);
  try {
    const result=await get(route),html=result.body; htmlDocuments.set(new URL(result.url).pathname,html);
    if(!result.response.headers.get('content-type')?.includes('text/html')) continue;
    const canonical=html.match(/<link rel="canonical" href="([^"]+)"/)?.[1]||'';
    const robots=meta(html,'robots'), title=html.match(/<title>([^<]*)<\/title>/)?.[1]||'',description=meta(html,'description');
    const blocked=disallows.some(prefix=>route.startsWith(prefix));
    const indexable=result.response.status===200 && !robots.includes('noindex') && !blocked;
    const row={route,status:result.response.status,finalUrl:result.url,redirects:result.chain.length-1,indexable,canonical,robots,crawlAllowed:!blocked,title,description,sitemap:sitemap.includes(route),textLength:html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g,'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim().length};rows.push(row);
    if(indexable && canonical!==origin+new URL(result.url).pathname) issues.push(`${route}: non-final self canonical ${canonical}`);
    if(indexable && meta(html,'og:url','property')!==canonical) issues.push(`${route}: og:url mismatch`);
    if(indexable && (!title||!description)) issues.push(`${route}: empty metadata`);
    if(sitemap.includes(route) && (!indexable || result.chain.length>1)) issues.push(`${route}: invalid sitemap entry`);
    for(const [,href] of html.matchAll(/<a[^>]*href="([^"]+)"/g)) {
      if(href.startsWith('tel:') && !/^tel:\+?[0-9-]{8,}$/.test(href)) issues.push(`${route}: invalid phone link`);
      if(href.startsWith('mailto:') && !/^mailto:[^@\s]+@[^?\s]+/.test(href)) issues.push(`${route}: invalid email link`);
      const url=new URL(href.replaceAll('&amp;','&'),origin+route);
      if(url.origin===origin && !path.extname(url.pathname)) queue.add(url.pathname);
    }
    for(const [,asset] of html.matchAll(/(?:src|href)="(\/assets\/[^"?]+)(?:\?[^\"]*)?"/g)) assets.add(asset);
    for(const [,set] of html.matchAll(/srcset="([^"]+)"/g)) for(const item of set.split(',')) assets.add(item.trim().split(' ')[0]);
  } catch(error) {issues.push(`${route}: ${error.message}`);}
}
for (const [route,html] of htmlDocuments) for(const [,href] of html.matchAll(/<a[^>]*href="([^"]+)"/g)) {
  const url=new URL(href.replaceAll('&amp;','&'),origin+route);
  if(url.origin!==origin || !url.hash) continue;
  if(!htmlDocuments.get(url.pathname)?.includes(`id="${decodeURIComponent(url.hash.slice(1))}"`)) issues.push(`${route}: broken anchor ${href}`);
}
for(const key of ['title','description']) {
  const values=new Map();
  for(const row of rows.filter(r=>r.indexable)) {if(values.has(row[key])) issues.push(`duplicate ${key}: ${row.route} and ${values.get(row[key])}`); values.set(row[key],row.route);}
}
const assetResults=[];
for(const asset of assets) { const result=await get(asset); assetResults.push({asset,status:result.response.status});if(result.response.status!==200) issues.push(`broken asset ${asset}`); }
const variants=[];
for(const route of ['/about','/programs','/index.html','/daily-word.html','/fortune.html','/meeting.html','/thanks/consultation/','/not-a-real-page-2026/']) {
  const result=await get(route); variants.push({route,status:result.response.status,chain:result.chain});
  if(/daily-word|fortune|meeting|thanks|not-a-real/.test(route) && result.response.status!==404) issues.push(`removed/missing page is not 404: ${route}`);
}
await mkdir(path.dirname(output),{recursive:true});
await writeFile(output+'.json',JSON.stringify({checkedAt:new Date().toISOString(),base:base.href,robots:robotResult.body,sitemapStatus:sitemapResult.response.status,rows,assetResults,variants,issues},null,2));
const cols=['route','status','indexable','canonical','robots','crawlAllowed','title','description','sitemap','redirects','textLength'];
await writeFile(output+'.csv','\ufeff'+[cols.join(','),...rows.map(row=>cols.map(key=>'"'+String(row[key]).replaceAll('"','""')+'"').join(','))].join('\n'));
console.log(JSON.stringify({pages:rows.length,assets:assets.size,issues,output}));
